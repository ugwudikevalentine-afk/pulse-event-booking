import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const { ticketCode } = await req.json();

    if (!ticketCode) {
      return NextResponse.json({ error: "Ticket code is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { id: ticketCode },
          { id: { contains: ticketCode } },
        ],
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: "Invalid ticket reference code." }, { status: 404 });
    }

    if (booking.paymentStatus !== "CONFIRMED") {
      return NextResponse.json({ error: "Payment for this ticket is pending or unconfirmed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Valid Ticket! Attendee checked in successfully.",
      booking,
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error during check-in" }, { status: 500 });
  }
}