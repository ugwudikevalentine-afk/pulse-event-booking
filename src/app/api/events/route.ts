import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";

const eventSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.enum(["CONCERT", "SPORTS", "CONFERENCE", "FESTIVAL", "THEATER", "WORKSHOP", "OTHER"]),
  venue: z.string().min(2),
  city: z.string().min(2),
  country: z.string().min(2),
  address: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  image: z.string().url().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]).optional(),
  ticketTypes: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    quantity: z.number().min(1),
  })).optional(),
});

// GET /api/events — Public listing
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: any = { status: "PUBLISHED" };
    if (category && category !== "ALL") where.category = category;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { venue: { contains: search, mode: "insensitive" } },
      ];
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          ticketTypes: {
            where: { isActive: true },
            select: { price: true },
            orderBy: { price: "asc" },
            take: 1,
          },
        },
        orderBy: { startDate: "asc" },
        skip,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    const formatted = events.map((e) => ({
      ...e,
      lowestPrice: e.ticketTypes[0]?.price ?? null,
      ticketTypes: undefined,
    }));

    return NextResponse.json({
      success: true,
      events: formatted,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Events fetch error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// POST /api/events — Admin create
export async function POST(req: Request) {
  try {
    const session = await auth();
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { ticketTypes, ...eventData } = parsed.data;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        ticketTypes: ticketTypes?.length
          ? { create: ticketTypes.map((t) => ({ ...t, price: t.price })) }
          : undefined,
      },
      include: { ticketTypes: true },
    });

    return NextResponse.json({ success: true, event }, { status: 201 });
  } catch (error) {
    console.error("Event create error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}