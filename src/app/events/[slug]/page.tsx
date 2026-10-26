import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

export const instant = false;

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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

  if (!event) notFound();

  return (
    <div className="min-h-screen bg-obsidian text-warm-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link
          href="/events"
          className="text-xs font-bold text-lime/80 hover:text-lime transition flex items-center gap-1 mb-6"
        >
          &larr; Back to events
        </Link>

        {/* Hero Section */}
        {event.image && (
          <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden mb-8 border border-slate-moss/20 shadow-2xl">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="bg-graphite/50 rounded-2xl border border-slate-moss/20 p-6 md:p-8 mb-8 shadow-xl">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-lime/10 text-lime border border-lime/30 mb-4">
            {event.category}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-warm-white tracking-tight mb-4">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-moss/20 text-sm text-slate-moss">
            <div>
              <span className="font-bold text-warm-white block uppercase text-xs tracking-wider text-lime mb-1">Date & Time</span>
              {formatDate(event.startDate)}
            </div>
            <div>
              <span className="font-bold text-warm-white block uppercase text-xs tracking-wider text-lime mb-1">Location</span>
              {event.venue}, {event.city}, {event.country}
            </div>
          </div>

          {event.description && (
            <div className="mt-6 pt-6 border-t border-slate-moss/20">
              <h2 className="text-xs font-bold text-slate-moss uppercase tracking-wider mb-2">About Event</h2>
              <p className="text-warm-white/90 leading-relaxed text-sm md:text-base whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}
        </div>

        {/* Tickets Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-black text-warm-white tracking-tight mb-6">
            Select Tickets
          </h2>

          {event.ticketTypes.length === 0 ? (
            <div className="bg-graphite/50 rounded-2xl border border-slate-moss/20 p-8 text-center text-slate-moss">
              No tickets currently available for this event.
            </div>
          ) : (
            event.ticketTypes.map((ticket) => {
              const remaining = ticket.quantity - ticket.sold;
              const isSoldOut = remaining <= 0;

              return (
                <div
                  key={ticket.id}
                  className="bg-graphite/50 hover:bg-graphite/80 transition rounded-2xl border border-slate-moss/20 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-warm-white group-hover:text-lime transition-colors">
                        {ticket.name}
                      </h3>
                      {isSoldOut && (
                        <span className="bg-error/20 text-error border border-error/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                          Sold Out
                        </span>
                      )}
                    </div>
                    {ticket.description && (
                      <p className="text-sm text-slate-moss">{ticket.description}</p>
                    )}
                    <p className="text-xs font-semibold text-slate-moss/70">
                      {remaining} remaining
                    </p>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-slate-moss/20">
                    <div className="text-2xl font-black text-warm-white">
                      {formatCurrency(Number(ticket.price))}
                    </div>

                    {!isSoldOut ? (
                      <Link
                        href={`/events/${event.slug}/book?ticketTypeId=${ticket.id}`}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border-2 border-lime text-lime font-black text-xs uppercase tracking-wider hover:bg-lime hover:text-obsidian transition-all duration-300 shadow-md hover:shadow-lime/20"
                      >
                        Book Now
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="px-6 py-2.5 rounded-full border-2 border-slate-moss/30 text-slate-moss font-bold text-xs uppercase cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
