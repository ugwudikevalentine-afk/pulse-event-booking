import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { formatDate } from "@/lib/utils";
import { sendPaymentReceiptEmail } from "@/lib/email";

// TODO: Buyer must add their own Stripe keys in .env
// 1. STRIPE_SECRET_KEY from https://dashboard.stripe.com/test/apikeys
// 2. STRIPE_WEBHOOK_SECRET from https://dashboard.stripe.com/test/webhooks
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const eventType = event.type;

  if (eventType === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    const userId = session.metadata?.userId;

    if (bookingId && userId) {
      await prisma.$transaction(async (tx) => {
        await tx.booking.update({
          where: { id: bookingId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
          },
        });

        await tx.payment.upsert({
          where: { bookingId },
          create: {
            bookingId,
            userId,
            stripeSessionId: session.id,
            stripePaymentIntentId:
              session.payment_intent?.toString() ?? null,
            amount: (session.amount_total ?? 0) / 100,
            currency: session.currency?.toUpperCase() ?? "USD",
            status: "COMPLETED",
            paidAt: new Date(),
          },
          update: {
            stripePaymentIntentId:
              session.payment_intent?.toString() ?? null,
            amount: (session.amount_total ?? 0) / 100,
            currency: session.currency?.toUpperCase() ?? "USD",
            status: "COMPLETED",
            paidAt: new Date(),
          },
        });
      });

      // Send payment receipt email (non-blocking)
      try {
        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { email: true, name: true } },
            items: {
              include: {
                ticketType: {
                  include: { event: true },
                },
              },
            },
          },
        });

        if (booking) {
          const ev = booking.items[0]?.ticketType?.event;
          if (ev) {
            sendPaymentReceiptEmail({
              to: booking.user.email,
              userName: booking.user.name,
              bookingReference: booking.bookingReference,
              eventTitle: ev.title,
              eventDate: formatDate(ev.startDate),
              eventVenue: `${ev.venue}, ${ev.city}`,
              totalAmount: Number(booking.totalAmount),
              currency: booking.currency,
            }).catch(() => {});
          }
        }
      } catch (emailErr) {
        console.error("Failed to send receipt email:", emailErr);
      }
    }
  } else if (eventType === ("checkout.session.expired" as string)) {
    const session = (event.data.object as unknown) as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { items: true },
      });

      if (booking && booking.status === "PENDING") {
        await prisma.$transaction(async (tx) => {
          for (const item of booking.items) {
            await tx.ticketType.update({
              where: { id: item.ticketTypeId },
              data: { sold: { decrement: item.quantity } },
            });
          }
          await tx.booking.update({
            where: { id: bookingId },
            data: { status: "CANCELLED" },
          });
        });
      }
    }
  } else {
    console.log(`Unhandled event type: ${eventType}`);
  }

  return NextResponse.json({ received: true });
}
