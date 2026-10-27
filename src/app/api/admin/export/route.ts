import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Forces dynamic runtime rendering to prevent static build-time failures
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (currentUser?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const type = req.nextUrl.searchParams.get("type") || "bookings";

    if (type === "bookings") {
      const bookings = await prisma.booking.findMany({
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              ticketType: {
                include: {
                  event: { select: { title: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const header = "Booking ID,User Name,User Email,Event Title,Total Amount,Status,Created At\n";
      const rows = bookings
        .map((b) => {
          const eventTitle = b.items[0]?.ticketType?.event?.title || "N/A";
          return `"${b.id}","${b.user.name || ""}","${b.user.email}","${eventTitle.replace(/"/g, '""')}",${b.totalAmount},"${b.status}","${b.createdAt.toISOString()}"`;
        })
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="bookings-export.csv"',
        },
      });
    }

    if (type === "events") {
      const events = await prisma.event.findMany({
        include: {
          ticketTypes: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const header = "Event ID,Title,Slug,Category,Venue,City,Country,Start Date,Status\n";
      const rows = events
        .map(
          (e) =>
            `"${e.id}","${e.title.replace(/"/g, '""')}","${e.slug}","${e.category}","${e.venue.replace(/"/g, '""')}","${e.city.replace(/"/g, '""')}","${e.country}","${e.startDate.toISOString()}","${e.status}"`
        )
        .join("\n");

      return new NextResponse(header + rows, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="events-export.csv"',
        },
      });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  } catch (err: unknown) {
    console.error("Export error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}