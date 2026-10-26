import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

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
  name: z.string().min(1, "Ticket name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be 0 or more"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  saleStartsAt: z.string().optional(),
  saleEndsAt: z.string().optional(),
});

const createEventSchema = z.object({
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
  ticketTypes: z.array(ticketTypeSchema).min(1, "At least one ticket type is required"),
});

export async function GET() {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        ticketTypes: { orderBy: { price: "asc" } },
        _count: { select: { ticketTypes: true } },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Admin GET events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminId = await requireAdmin();
    if (!adminId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createEventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let slug = slugify(data.title);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
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
        ticketTypes: {
          create: data.ticketTypes.map((t) => ({
            name: t.name,
            description: t.description || null,
            price: t.price,
            quantity: t.quantity,
            saleStartsAt: t.saleStartsAt ? new Date(t.saleStartsAt) : null,
            saleEndsAt: t.saleEndsAt ? new Date(t.saleEndsAt) : null,
          })),
        },
      },
      include: { ticketTypes: true },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Admin POST event error:", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
