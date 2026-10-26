import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateBookingReference, formatDate } from "@/lib/utils";
import { sendBookingConfirmationEmail } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";

const bookingSchema = z.object({
  items: z
    .array(
      z.object({
        ticketTypeId: z.string().cuid(),
        quantity: z.number().int().min(1).max(10),
      })
    )
    .min(1),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Rate limit: 5 bookings per minute per user
    const rl = rateLimit(`booking:${userId}`, 5, 60000);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { items } = parsed.data;

    const ticketTypeIds = items.map((i) => i.ticketTypeId);
    const ticketTypes = await prisma.ticketType.findMany({
      where: { id: { in: ticketTypeIds }, isActive: true },
      include: { event: true },
    });

    if (ticketTypes.length !== ticketTypeIds.length) {
      return NextResponse.json(
        { error: "One or more ticket types not found or inactive" },
        { status: 400 }
      );
    }

    const eventIds = new Set(ticketTypes.map((t) => t.eventId));
    if (eventIds.size !== 1) {
      return NextResponse.json(
        { error: "All tickets must belong to the same event" },
        { status: 400 }
      );
    }

    const event = ticketTypes[0].event;
    if (event.status !== "PUBLISHED") {
      return NextResponse.json(
        { error: "Event is not available for booking" },
        { status: 400 }
      );
    }

    const enrichedItems: {
      ticketTypeId: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }[] = [];
    let totalAmount = 0;

    for (const item of items) {
      const ticketType = ticketTypes.find((t) => t.id === item.ticketTypeId)!;
      const available = ticketType.quantity - ticketType.sold;

      if (available < item.quantity) {
        return NextResponse.json(
          { error: `Not enough tickets available for ${ticketType.name}` },
          { status: 400 }
        );
      }

      const unitPrice = Number(ticketType.price);
      const totalPrice = unitPrice * item.quantity;
      totalAmount += totalPrice;

      enrichedItems.push({
        ticketTypeId: ticketType.id,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });
    }

    const booking = await prisma.$transaction(
      async (tx) => {
        const newBooking = await tx.booking.create({
          data: {
            bookingReference: generateBookingReference(),
            userId,
            totalAmount,
            status: "PENDING",
            paymentStatus: "UNPAID",
            items: {
              create: enrichedItems.map((item) => ({
                ticketTypeId: item.ticketTypeId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
              })),
            },
          },
          include: {
            items: { include: { ticketType: true } },
          },
        });

        for (const item of enrichedItems) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { sold: { increment: item.quantity } },
          });
        }

        return newBooking;
      },
      { maxWait: 15000, timeout: 30000 }
    );

    // Send booking confirmation email (non-blocking)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (user) {
      sendBookingConfirmationEmail({
        to: user.email,
        userName: user.name,
        bookingReference: booking.bookingReference,
        eventTitle: event.title,
        eventDate: formatDate(event.startDate),
        eventVenue: `${event.venue}, ${event.city}`,
        totalAmount,
        currency: "USD",
      }).catch(() => {});
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
