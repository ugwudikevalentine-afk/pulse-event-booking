import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const type = req.nextUrl.searchParams.get("type") || "bookings";

    if (type === "bookings") {
      const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: {
            include: {
              ticketType: {
                include: { event: { select: { title: true } } },
              },
            },
          },
        },
      });

      const headers = [
        "Reference", "Customer Name", "Customer Email",
        "Event", "Total Amount", "Currency",
        "Status", "Payment Status", "Created At",
      ];

      const rows = bookings.map((b) => {
        const eventNames = [...new Set(b.items.map((i) => i.ticketType.event.title))].join("; ");
        return [
          b.bookingReference,
          `"${b.user.name}"`,
          b.user.email,
          `"${eventNames}"`,
          Number(b.totalAmount).toFixed(2),
          b.currency,
          b.status,
          b.paymentStatus,
          b.createdAt.toISOString(),
        ].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="pulse-bookings-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    if (type === "users") {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          name: true, email: true, role: true,
          isActive: true, isEmailVerified: true, createdAt: true,
          _count: { select: { bookings: true } },
        },
      });

      const headers = [
        "Name", "Email", "Role", "Active",
        "Email Verified", "Total Bookings", "Joined",
      ];

      const rows = users.map((u) => [
        `"${u.name}"`,
        u.email,
        u.role,
        u.isActive ? "Yes" : "No",
        u.isEmailVerified ? "Yes" : "No",
        u._count.bookings,
        u.createdAt.toISOString(),
      ].join(","));

      const csv = [headers.join(","), ...rows].join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="pulse-users-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: "Invalid export type" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
