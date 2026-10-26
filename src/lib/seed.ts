import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user (password: admin123)
  const bcrypt = await import("bcryptjs");
  const adminPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@eventbook.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@eventbook.com",
      password: adminPassword,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });

  // Create demo events
  const events = [
    {
      title: "Summer Music Festival 2025",
      slug: "summer-music-festival-2025",
      description: "Three days of live music featuring top artists from around the world. Food trucks, art installations, and unforgettable performances under the stars.",
      category: "FESTIVAL" as const,
      venue: "Riverside Park",
      city: "Austin",
      country: "USA",
      startDate: new Date("2025-08-15T18:00:00Z"),
      endDate: new Date("2025-08-17T23:00:00Z"),
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "General Admission", price: 89.99, quantity: 5000, description: "Access to all main stages" },
        { name: "VIP Pass", price: 249.99, quantity: 500, description: "VIP lounge, front-row access, complimentary drinks" },
      ],
    },
    {
      title: "Tech Innovation Summit",
      slug: "tech-innovation-summit",
      description: "Join 2,000+ developers, founders, and tech leaders for two days of keynotes, workshops, and networking. Topics include AI, Web3, and cloud infrastructure.",
      category: "CONFERENCE" as const,
      venue: "Convention Center",
      city: "San Francisco",
      country: "USA",
      startDate: new Date("2025-09-20T09:00:00Z"),
      endDate: new Date("2025-09-21T17:00:00Z"),
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "Standard", price: 199.00, quantity: 1500, description: "All sessions and expo hall" },
        { name: "Premium", price: 499.00, quantity: 300, description: "Workshops, priority seating, networking dinner" },
      ],
    },
    {
      title: "Jazz Night Live",
      slug: "jazz-night-live",
      description: "An intimate evening of smooth jazz featuring the Marcus Cole Quartet. Limited seating for an unforgettable experience.",
      category: "CONCERT" as const,
      venue: "Blue Note Lounge",
      city: "New York",
      country: "USA",
      startDate: new Date("2025-07-25T20:00:00Z"),
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "Standard Seat", price: 45.00, quantity: 150, description: "General seating" },
        { name: "Front Row", price: 95.00, quantity: 30, description: "Front row table with drink service" },
      ],
    },
    {
      title: "City Marathon 2025",
      slug: "city-marathon-2025",
      description: "Annual city marathon through scenic downtown routes. Categories: Full marathon, half marathon, and 10K.",
      category: "SPORTS" as const,
      venue: "Downtown",
      city: "Chicago",
      country: "USA",
      startDate: new Date("2025-10-12T07:00:00Z"),
      status: "PUBLISHED" as const,
      ticketTypes: [
        { name: "10K Run", price: 35.00, quantity: 2000, description: "10K route with finisher medal" },
        { name: "Half Marathon", price: 65.00, quantity: 3000, description: "Half marathon with finisher medal and t-shirt" },
        { name: "Full Marathon", price: 95.00, quantity: 1000, description: "Full marathon with finisher medal, t-shirt, and photo package" },
      ],
    },
  ];

  for (const event of events) {
    const { ticketTypes, ...eventData } = event;
    await prisma.event.upsert({
      where: { slug: event.slug },
      update: {},
      create: {
        ...eventData,
        ticketTypes: {
          create: ticketTypes,
        },
      },
    });
  }

  console.log("✅ Seeding complete!");
  console.log("   Admin login: admin@eventbook.com / admin123");
  console.log("   4 demo events created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());