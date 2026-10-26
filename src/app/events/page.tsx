import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export const instant = false;

const CATEGORIES = [
  "ALL", "CONCERT", "SPORTS", "CONFERENCE",
  "FESTIVAL", "THEATER", "WORKSHOP", "OTHER",
] as const;

const PER_PAGE = 12;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "ALL";
  const page = Math.max(1, parseInt(params.page || "1"));

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (category !== "ALL") where.category = category;
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { venue: { contains: query, mode: "insensitive" } },
    ];
  }

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { ticketTypes: { orderBy: { price: "asc" }, take: 1 } },
      orderBy: { startDate: "asc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.event.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / PER_PAGE);

  const categoryEmojis: Record<string, string> = {
    CONCERT: "\uD83C\uDFB5", SPORTS: "\u26BD", CONFERENCE: "\uD83C\uDFA4",
    FESTIVAL: "\uD83C\uDFAA", THEATER: "\uD83C\uDFAD", WORKSHOP: "\uD83D\uDEE0\uFE0F", OTHER: "\uD83D\uDCC5",
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <FadeIn>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Events</h1>
          <p className="text-slate-moss mb-8">{totalCount} event{totalCount !== 1 ? "s" : ""} available</p>
        </FadeIn>

        {/* Search + Filter */}
        <FadeIn delay={0.1}>
          <form className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="flex-1 relative">
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search events, cities, venues..."
                className="w-full bg-graphite border border-slate-moss/20 rounded-lg px-4 py-3 text-sm text-warm-white placeholder-slate-moss focus:outline-none focus:border-lime/50 transition"
              />
            </div>
            <select
              name="category"
              defaultValue={category}
              className="bg-graphite border border-slate-moss/20 rounded-lg px-4 py-3 text-sm text-warm-white focus:outline-none focus:border-lime/50 transition"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c === "ALL" ? "All Categories" : c}</option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-lime text-obsidian px-6 py-3 rounded-lg font-bold text-sm hover:bg-lime/90 transition"
            >
              Search
            </button>
          </form>
        </FadeIn>

        {/* Results */}
        {events.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-slate-moss/30 rounded-2xl">
            <p className="text-slate-moss text-lg">No events found</p>
            <p className="text-slate-moss/60 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => {
                const minPrice = event.ticketTypes[0] ? Number(event.ticketTypes[0].price) : 0;
                return (
                  <StaggerItem key={event.id}>
                    <Link href={`/events/${event.slug}`} className="group block rounded-2xl border border-slate-moss/20 bg-graphite/40 overflow-hidden hover:border-lime/30 transition-all duration-300">
                      <div className="h-48 bg-gradient-to-br from-graphite to-obsidian relative overflow-hidden">
                        {event.image ? (
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
                            {categoryEmojis[event.category] || "\uD83D\uDCC5"}
                          </div>
                        )}
                        <span className="absolute top-3 left-3 bg-lime text-obsidian px-2 py-0.5 rounded text-xs font-bold">
                          {event.category}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-warm-white group-hover:text-lime transition-colors line-clamp-1">{event.title}</h3>
                        <p className="text-sm text-slate-moss mt-1 line-clamp-2">{event.description || "An experience you will not want to miss."}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-moss/20">
                          <div>
                            <div className="text-sm text-warm-white/80">{formatDate(event.startDate)}</div>
                            <div className="text-xs text-slate-moss">{event.venue}, {event.city}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-slate-moss">From</div>
                            <div className="font-bold text-lime">{formatCurrency(minPrice)}</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </StaggerItem>
                );
              })}
            </Stagger>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                {page > 1 && (
                  <Link
                    href={`/events?q=${query}&category=${category}&page=${page - 1}`}
                    className="px-4 py-2 rounded-lg border border-slate-moss/20 text-sm text-warm-white hover:border-lime/50 transition"
                  >
                    &larr; Prev
                  </Link>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={`/events?q=${query}&category=${category}&page=${p}`}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition ${
                      p === page
                        ? "bg-lime text-obsidian"
                        : "border border-slate-moss/20 text-warm-white hover:border-lime/50"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
                {page < totalPages && (
                  <Link
                    href={`/events?q=${query}&category=${category}&page=${page + 1}`}
                    className="px-4 py-2 rounded-lg border border-slate-moss/20 text-sm text-warm-white hover:border-lime/50 transition"
                  >
                    Next &rarr;
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
