import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { CountUp } from "@/components/motion/count-up";

export const instant = false;

export default async function HomePage() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    include: { ticketTypes: { orderBy: { price: "asc" }, take: 1 } },
    orderBy: { startDate: "asc" },
    take: 6,
  });

  const [eventCount, categoriesGroup, bookingCount] = await Promise.all([
    prisma.event.count({ where: { status: "PUBLISHED" } }),
    prisma.event.groupBy({
      by: ["category"],
      where: { status: "PUBLISHED" },
    }),
    prisma.booking.count(),
  ]);

  const categoryCount = categoriesGroup.length || 4;

  const categoryEmojis: Record<string, string> = {
    CONCERT: "🎵",
    SPORTS: "⚽",
    CONFERENCE: "🎤",
    FESTIVAL: "🎪",
    THEATER: "🎭",
    WORKSHOP: "🛠️",
    OTHER: "📅",
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lime/3 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-32">
          <FadeIn delay={0.1}>
            <span className="inline-block border border-lime/30 text-lime px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase mb-8">
              Events &middot; Travel &middot; Experiences
            </span>
          </FadeIn>
          <FadeIn delay={0.2}>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] tracking-tight mb-8">
              <span className="text-warm-white">Be there</span>
              <br />
              <span className="text-warm-white">when </span>
              <span className="text-lime">history</span>
              <br />
              <span className="text-warm-white">happens.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.4}>
            <p className="text-lg text-slate-moss max-w-md mb-10">
              Discover events. Plan your journey. Make the moment yours.
            </p>
          </FadeIn>
          <FadeIn delay={0.5}>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/events"
                className="bg-lime text-obsidian px-8 py-4 rounded-lg font-bold text-sm hover:bg-lime/90 transition inline-flex items-center gap-2"
              >
                Explore Events
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/register"
                className="border border-slate-moss/40 text-warm-white px-8 py-4 rounded-lg font-medium text-sm hover:border-lime/50 hover:text-lime transition"
              >
                Create Account
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-slate-moss/20 bg-graphite/50">
        <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          <FadeIn delay={0}>
            <div className="text-center">
              <div className="text-4xl font-bold text-lime"><CountUp value={eventCount} /></div>
              <div className="text-sm text-slate-moss mt-2">Live Events</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="text-center">
              <div className="text-4xl font-bold text-lime"><CountUp value={categoryCount} /></div>
              <div className="text-sm text-slate-moss mt-2">Active Categories</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <div className="text-center">
              <div className="text-4xl font-bold text-warm-white"><CountUp value={bookingCount} /></div>
              <div className="text-sm text-slate-moss mt-2">Confirmed Bookings</div>
            </div>
          </FadeIn>
          <FadeIn delay={0.3}>
            <div className="text-center">
              <div className="text-4xl font-bold text-warm-white">100%</div>
              <div className="text-sm text-slate-moss mt-2">Secure Payments</div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <FadeIn>
          <span className="text-xs font-medium text-lime tracking-widest uppercase">How it works</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-16">Three steps. Zero friction.</h2>
        </FadeIn>
        <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StaggerItem>
            <div className="group p-8 rounded-2xl border border-slate-moss/20 bg-graphite/30 hover:border-lime/30 transition-colors">
              <div className="text-lime text-xs font-bold tracking-widest mb-4">01 / DISCOVER</div>
              <h3 className="text-xl font-bold text-warm-white mb-2">Find your event</h3>
              <p className="text-slate-moss text-sm leading-relaxed">Browse concerts, sports, conferences, and festivals. Filter by date, city, or category.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="group p-8 rounded-2xl border border-slate-moss/20 bg-graphite/30 hover:border-lime/30 transition-colors">
              <div className="text-lime text-xs font-bold tracking-widest mb-4">02 / BOOK</div>
              <h3 className="text-xl font-bold text-warm-white mb-2">Secure your tickets</h3>
              <p className="text-slate-moss text-sm leading-relaxed">Choose your tier, pick your quantity, and check out in seconds with Stripe.</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="group p-8 rounded-2xl border border-slate-moss/20 bg-graphite/30 hover:border-lime/30 transition-colors">
              <div className="text-lime text-xs font-bold tracking-widest mb-4">03 / EXPERIENCE</div>
              <h3 className="text-xl font-bold text-warm-white mb-2">Make the moment</h3>
              <p className="text-slate-moss text-sm leading-relaxed">Get instant confirmation, email receipts, and everything you need to show up ready.</p>
            </div>
          </StaggerItem>
        </Stagger>
      </section>

      {/* Events */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <FadeIn>
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-medium text-lime tracking-widest uppercase">Upcoming</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3">Featured Events</h2>
            </div>
            <Link href="/events" className="hidden md:inline-flex items-center gap-1 text-sm text-slate-moss hover:text-lime transition-colors">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </FadeIn>

        {events.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-moss/30 rounded-2xl">
            <p className="text-slate-moss text-lg">No events published yet</p>
          </div>
        ) : (
          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const minPrice = event.ticketTypes[0] ? Number(event.ticketTypes[0].price) : 0;
              return (
                <StaggerItem key={event.id}>
                  <Link href={`/events/${event.slug}`} className="group block rounded-2xl border border-slate-moss/20 bg-graphite/40 overflow-hidden hover:border-lime/30 transition-all duration-300">
                    <div className="h-52 bg-gradient-to-br from-graphite to-obsidian relative overflow-hidden">
                      {event.image ? (
                        <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-40">
                          {categoryEmojis[event.category] || "📅"}
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-lime text-obsidian px-2 py-0.5 rounded text-xs font-bold">
                        {event.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-lg text-warm-white group-hover:text-lime transition-colors line-clamp-1">{event.title}</h3>
                      <p className="text-sm text-slate-moss mt-1 line-clamp-2">{event.description || "An experience you will not want to miss."}</p>
                      <div className="flex items-center justify-between mt-5 pt-5 border-t border-slate-moss/20">
                        <div>
                          <div className="text-sm text-warm-white/80">{formatDate(event.startDate)}</div>
                          <div className="text-xs text-slate-moss">{event.venue}, {event.city}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-slate-moss">From</div>
                          <div className="font-bold text-lime text-lg">{formatCurrency(minPrice)}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-lime/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-lime/5 rounded-full blur-[150px]" />
        <FadeIn>
          <div className="relative max-w-3xl mx-auto px-4 py-24 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to host your own events?</h2>
            <p className="text-slate-moss text-lg mb-10 max-w-lg mx-auto">
              Use PULSE to manage events, sell tickets, and track bookings — all in one platform.
            </p>
            <Link href="/register" className="inline-block bg-lime text-obsidian px-10 py-4 rounded-lg font-bold hover:bg-lime/90 transition">
              Get Started Free
            </Link>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}