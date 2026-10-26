import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!booking || booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending bookings can be cancelled" },
        { status: 400 }
      );
    }

    await prisma.$transaction(
      async (tx) => {
        for (const item of booking.items) {
          await tx.ticketType.update({
            where: { id: item.ticketTypeId },
            data: { sold: { decrement: item.quantity } },
          });
        }
        await tx.booking.update({
          where: { id },
          data: { status: "CANCELLED" },
        });
      },
      { maxWait: 15000, timeout: 30000 }
    );

    // Redirect back to dashboard for form action
    return NextResponse.redirect(
      new URL("/dashboard?cancelled=true", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
    );
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
  }
}
