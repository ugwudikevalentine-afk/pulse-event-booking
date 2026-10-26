import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export const instant = false;

export default async function AdminEventsPage() {
  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      ticketTypes: { orderBy: { price: "asc" } },
    },
  });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-slate-moss/20 text-slate-moss border border-slate-moss/30",
    PUBLISHED: "bg-success/20 text-success border border-success/30",
    CANCELLED: "bg-error/20 text-error border border-error/30",
    COMPLETED: "bg-info/20 text-info border border-info/30",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin" className="text-sm text-lime/80 hover:text-lime transition flex items-center gap-1">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-warm-white mt-2">Manage Events</h1>
        </div>
        <Link
          href="/admin/events/new"
          className="bg-lime text-obsidian px-4 py-2.5 rounded-lg hover:bg-lime/90 text-sm font-bold transition shadow-lg"
        >
          + Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 text-center py-16 text-slate-moss">
          <p className="text-lg font-medium text-warm-white/80 mb-2">No events found</p>
          <p className="text-sm mb-6">Create your first event to get started.</p>
          <Link href="/admin/events/new" className="bg-lime text-obsidian px-4 py-2 rounded-lg text-sm font-bold">
            Create Event
          </Link>
        </div>
      ) : (
        <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-obsidian/60 border-b border-slate-moss/20 text-xs text-slate-moss uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Event</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Venue</th>
                  <th className="px-6 py-4 font-semibold">Tickets</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-moss/10">
                {events.map((event) => {
                  const minPrice = event.ticketTypes[0]
                    ? Number(event.ticketTypes[0].price)
                    : 0;
                  const totalQty = event.ticketTypes.reduce(
                    (sum, t) => sum + t.quantity,
                    0
                  );
                  const totalSold = event.ticketTypes.reduce(
                    (sum, t) => sum + t.sold,
                    0
                  );

                  return (
                    <tr key={event.id} className="hover:bg-obsidian/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-warm-white">{event.title}</div>
                        <div className="text-xs text-lime/80 mt-0.5">{event.category}</div>
                      </td>
                      <td className="px-6 py-4 text-warm-white/80">
                        {formatDate(event.startDate)}
                      </td>
                      <td className="px-6 py-4 text-warm-white/80">
                        {event.venue}, {event.city}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-lime">{formatCurrency(minPrice)}+</div>
                        <div className="text-xs text-slate-moss mt-0.5">
                          {totalSold}/{totalQty} sold
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${
                            statusColors[event.status] || "bg-slate-moss/20 text-slate-moss"
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-3 justify-end items-center">
                          <Link
                            href={`/events/${event.slug}`}
                            target="_blank"
                            className="text-slate-moss hover:text-warm-white text-xs font-medium transition"
                          >
                            View
                          </Link>
                          <Link
                            href={`/admin/events/${event.id}/edit`}
                            className="text-lime hover:text-lime/80 text-xs font-bold transition"
                          >
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
