import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

// TODO: Buyer must add their own Stripe secret key in .env
// Get test keys from https://dashboard.stripe.com/test/apikeys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    // Booking → items → ticketType → event (no direct event relation on Booking)
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        items: {
          include: {
            ticketType: {
              include: { event: true },
            },
          },
        },
      },
    });

    if (!booking || booking.userId !== userId) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Booking is not in a payable state" },
        { status: 400 }
      );
    }

    const eventTitle =
      booking.items[0]?.ticketType?.event?.title ?? "Event Booking";

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      booking.items.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${eventTitle} — ${item.ticketType.name}`,
          },
          unit_amount: Math.round(Number(item.unitPrice) * 100),
        },
        quantity: item.quantity,
      }));

    // NOTE: payment_method_types is deprecated in Stripe API 2026+.
    // Stripe now auto-detects available payment methods from your dashboard.
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancel?bookingId=${bookingId}`,
      metadata: {
        bookingId: booking.id,
        userId,
      },
    });

    // Create Payment record linked to booking + user
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        userId,
        stripeSessionId: checkoutSession.id,
        amount: booking.totalAmount,
        currency: "USD",
        status: "PENDING",
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}