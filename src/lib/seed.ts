import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning old data and re-seeding database...");

  // WIPE OLD DATA TO REMOVE TEST LISTINGS
  await prisma.payment.deleteMany({});
  await prisma.bookingItem.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.ticketType.deleteMany({});
  await prisma.event.deleteMany({});

  // CREATE / UPSERT ADMIN USER (password: admin123)
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@eventbook.com" },
    update: {
      password: adminPassword,
      role: "ADMIN",
      isEmailVerified: true,
    },
    create: {
      name: "Pulse Admin",
      email: "admin@eventbook.com",
      password: adminPassword,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  // HIGH QUALITY DEMO EVENTS WITH 2026/2027 DATES
  const events = [
    {
      title: "Global Tech Innovation Summit 2026",
      slug: "global-tech-innovation-summit-2026",
      description: "Join 2,500+ leaders, engineers, and founders for two days of keynotes, tech workshops, and executive networking.",
      category: "CONFERENCE" as const,
      venue: "Moscone Center",
      city: "San Francisco",
      country: "USA",
      startDate: new Date("2026-11-15T09:00:00Z"),
      endDate: new Date("2026-11-16T18:00:00Z"),
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop",
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "General Pass", price: 199.00, quantity: 1500, description: "All main stage sessions and expo floor access." },
        { name: "VIP Executive Pass", price: 499.00, quantity: 200, description: "Priority seating, VIP lounge, and networking dinner." },
      ],
    },
    {
      title: "Neon Horizon Music Festival",
      slug: "neon-horizon-music-festival",
      description: "Three days of live electronic and indie music across 4 open-air stages with immersive light art installations.",
      category: "FESTIVAL" as const,
      venue: "Zilker Park",
      city: "Austin",
      country: "USA",
      startDate: new Date("2026-12-04T16:00:00Z"),
      endDate: new Date("2026-12-06T23:59:00Z"),
      image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop",
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "3-Day GA Ticket", price: 120.00, quantity: 3000, description: "Full 3-day access to all music stages." },
        { name: "VIP Backstage Pass", price: 290.00, quantity: 300, description: "Fast-track entry, VIP lounge, and private bar." },
      ],
    },
    {
      title: "Smooth Jazz & Soul Night",
      slug: "smooth-jazz-soul-night",
      description: "An intimate evening of world-class jazz, craft cocktails, and soul music in downtown Manhattan.",
      category: "CONCERT" as const,
      venue: "Blue Note Jazz Club",
      city: "New York",
      country: "USA",
      startDate: new Date("2026-11-28T20:00:00Z"),
      image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=1200&auto=format&fit=crop",
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "Main Floor Seat", price: 55.00, quantity: 150, description: "Standard table seating." },
        { name: "Front Row Stage Table", price: 110.00, quantity: 25, description: "Front row table including welcome drink." },
      ],
    },
    {
      title: "International City Marathon 2027",
      slug: "international-city-marathon-2027",
      description: "Run through iconic downtown landmarks. Features 10K, Half Marathon, and Full 42K Marathon courses.",
      category: "SPORTS" as const,
      venue: "Grant Park",
      city: "Chicago",
      country: "USA",
      startDate: new Date("2027-04-18T07:00:00Z"),
      image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop",
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "10K Entry", price: 40.00, quantity: 1000, description: "Course entry, bib, and finisher medal." },
        { name: "Full Marathon Pass", price: 85.00, quantity: 1500, description: "Full course entry, technical t-shirt, and photo package." },
      ],
    },
  ];

  for (const event of events) {
    const { ticketTypes, ...eventData } = event;
    await prisma.event.create({
      data: {
        ...eventData,
        ticketTypes: {
          create: ticketTypes,
        },
      },
    });
  }

  console.log("✅ Seed complete! Pristine demo events created.");
  console.log("   Admin Credentials: admin@eventbook.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });