import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

export const instant = false;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = params.status || "ALL";
  const page = Math.max(1, parseInt(params.page || "1"));
  const perPage = 20;

  const where: Record<string, unknown> = {};
  if (statusFilter !== "ALL") where.status = statusFilter;

  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        user: { select: { name: true, email: true } },
        items: {
          include: {
            ticketType: {
              include: { event: { select: { title: true } } },
            },
          },
          take: 1,
        },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  const statusColors: Record<string, string> = {
    PENDING: "bg-warning/20 text-warning",
    CONFIRMED: "bg-success/20 text-success",
    CANCELLED: "bg-error/20 text-error",
    COMPLETED: "bg-info/20 text-info",
  };

  const payColors: Record<string, string> = {
    UNPAID: "text-warning",
    PAID: "text-success",
    FAILED: "text-error",
    REFUNDED: "text-slate-moss",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-sm text-lime/70 hover:text-lime transition-colors">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">All Bookings</h1>
            <p className="text-slate-moss text-sm">{totalCount} total bookings</p>
          </div>
          <Link
            href="/api/admin/export/bookings"
            className="border border-slate-moss/30 text-warm-white px-4 py-2 rounded-lg text-sm hover:border-lime/50 hover:text-lime transition"
          >
            Export CSV
          </Link>
        </div>
      </FadeIn>

      {/* Filters */}
      <FadeIn delay={0.1}>
        <div className="flex gap-2 mb-6 flex-wrap">
          {["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].map((s) => (
            <Link
              key={s}
              href={`/admin/bookings?status=${s}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === s
                  ? "bg-lime text-obsidian"
                  : "border border-slate-moss/20 text-slate-moss hover:border-lime/30 hover:text-warm-white"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>
      </FadeIn>

      {/* Table */}
      {bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-moss/30 rounded-2xl">
          <p className="text-slate-moss">No bookings found</p>
        </div>
      ) : (
        <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-obsidian/50 border-b border-slate-moss/20">
                <tr>
                  <th className="text-left px-4 py-3 text-slate-moss font-medium">Reference</th>
                  <th className="text-left px-4 py-3 text-slate-moss font-medium">Customer</th>
                  <th className="text-left px-4 py-3 text-slate-moss font-medium">Event</th>
                  <th className="text-left px-4 py-3 text-slate-moss font-medium">Amount</th>
                  <th className="text-left px-4 py-3 text-slate-moss font-medium">Payment</th>
                  <th className="text-left px-4 py-3 text-slate-moss font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-slate-moss font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-moss/10">
                {bookings.map((b) => {
                  const eventName = b.items[0]?.ticketType?.event?.title || "—";
                  return (
                    <tr key={b.id} className="hover:bg-obsidian/30 transition">
                      <td className="px-4 py-3 font-mono text-xs text-warm-white/80">{b.bookingReference}</td>
                      <td className="px-4 py-3">
                        <div className="text-warm-white font-medium">{b.user.name}</div>
                        <div className="text-xs text-slate-moss">{b.user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-warm-white/80 max-w-[200px] truncate">{eventName}</td>
                      <td className="px-4 py-3 font-bold text-warm-white">{formatCurrency(Number(b.totalAmount))}</td>
                      <td className={`px-4 py-3 font-medium ${payColors[b.paymentStatus] || "text-slate-moss"}`}>
                        {b.paymentStatus}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColors[b.status] || ""}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-moss text-xs">{formatDate(b.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/admin/bookings?status=${statusFilter}&page=${page - 1}`}
              className="px-4 py-2 rounded-lg border border-slate-moss/20 text-sm text-warm-white hover:border-lime/50 transition">
              &larr; Prev
            </Link>
          )}
          <span className="text-sm text-slate-moss px-4">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/admin/bookings?status=${statusFilter}&page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-slate-moss/20 text-sm text-warm-white hover:border-lime/50 transition">
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
