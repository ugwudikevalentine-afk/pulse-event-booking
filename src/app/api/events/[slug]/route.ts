import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        ticketTypes: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ success: false, message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Event fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}