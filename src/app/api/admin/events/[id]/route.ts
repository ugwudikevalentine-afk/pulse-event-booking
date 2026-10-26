import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return null;
  return session.user.id;
}

const ticketTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  quantity: z.number().int().min(1),
  saleStartsAt: z.string().optional(),
  saleEndsAt: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  category: z.enum([
    "CONCERT", "SPORTS", "CONFERENCE",
    "FESTIVAL", "THEATER", "WORKSHOP", "OTHER",
  ]),
  venue: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  address: z.string().optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  image: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]),
  ticketTypes: z.array(ticketTypeSchema).min(1),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: { orderBy: { price: "asc" } } },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Admin GET event error:", error);
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true },
    });
    if (!existing) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const toUpdate = data.ticketTypes.filter((t) => t.id);
    const toCreate = data.ticketTypes.filter((t) => !t.id);
    const submittedIds = new Set(toUpdate.map((t) => t.id));
    const toDeactivate = existing.ticketTypes
      .filter((t) => !submittedIds.has(t.id) && t.isActive)
      .map((t) => t.id);

    const event = await prisma.$transaction(
      async (tx) => {
        const updated = await tx.event.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description || null,
            category: data.category,
            venue: data.venue,
            city: data.city,
            country: data.country,
            address: data.address || null,
            startDate: new Date(data.startDate),
            endDate: data.endDate ? new Date(data.endDate) : null,
            image: data.image || null,
            status: data.status,
          },
        });

        for (const t of toUpdate) {
          await tx.ticketType.update({
            where: { id: t.id },
            data: {
              name: t.name,
              description: t.description || null,
              price: t.price,
              quantity: t.quantity,
              saleStartsAt: t.saleStartsAt ? new Date(t.saleStartsAt) : null,
              saleEndsAt: t.saleEndsAt ? new Date(t.saleEndsAt) : null,
              isActive: t.isActive ?? true,
            },
          });
        }

        if (toCreate.length > 0) {
          await tx.ticketType.createMany({
            data: toCreate.map((t) => ({
              eventId: id,
              name: t.name,
              description: t.description || null,
              price: t.price,
              quantity: t.quantity,
              saleStartsAt: t.saleStartsAt ? new Date(t.saleStartsAt) : null,
              saleEndsAt: t.saleEndsAt ? new Date(t.saleEndsAt) : null,
            })),
          });
        }

        if (toDeactivate.length > 0) {
          await tx.ticketType.updateMany({
            where: { id: { in: toDeactivate } },
            data: { isActive: false },
          });
        }

        return updated;
      },
      { maxWait: 15000, timeout: 30000 }
    );

    return NextResponse.json({ event });
  } catch (error) {
    console.error("Admin PUT event error:", error);
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const bookingCount = await prisma.bookingItem.count({
      where: { ticketType: { eventId: id } },
    });

    if (bookingCount > 0) {
      await prisma.event.update({
        where: { id },
        data: { status: "CANCELLED" },
      });
      return NextResponse.json({
        message: "Event has bookings — status set to CANCELLED instead of deleting.",
      });
    }

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ message: "Event deleted" });
  } catch (error) {
    console.error("Admin DELETE event error:", error);
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}
