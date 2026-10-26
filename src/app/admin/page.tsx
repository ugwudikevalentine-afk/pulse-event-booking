import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export const instant = false;

export default async function AdminDashboard() {
  const [eventCount, bookingCount, userCount, revenue, recentBookings] = await Promise.all([
    prisma.event.count(),
    prisma.booking.count(),
    prisma.user.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "COMPLETED" },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
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
  ]);

  const totalRevenue = Number(revenue._sum.amount) || 0;

  const statusColors: Record<string, string> = {
    PENDING: "bg-warning/20 text-warning",
    CONFIRMED: "bg-success/20 text-success",
    CANCELLED: "bg-error/20 text-error",
    COMPLETED: "bg-info/20 text-info",
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-slate-moss text-sm mt-1">Overview of your PULSE business</p>
          </div>
          <Link href="/admin/events/new"
            className="bg-lime text-obsidian px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-lime/90 transition">
            + New Event
          </Link>
        </div>
      </FadeIn>

      {/* Stats */}
      <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StaggerItem>
          <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 p-5">
            <div className="text-xs text-slate-moss uppercase tracking-wider">Revenue</div>
            <div className="text-3xl font-bold text-lime mt-2">{formatCurrency(totalRevenue)}</div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 p-5">
            <div className="text-xs text-slate-moss uppercase tracking-wider">Bookings</div>
            <div className="text-3xl font-bold text-warm-white mt-2">{bookingCount}</div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 p-5">
            <div className="text-xs text-slate-moss uppercase tracking-wider">Events</div>
            <div className="text-3xl font-bold text-warm-white mt-2">{eventCount}</div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 p-5">
            <div className="text-xs text-slate-moss uppercase tracking-wider">Users</div>
            <div className="text-3xl font-bold text-warm-white mt-2">{userCount}</div>
          </div>
        </StaggerItem>
      </Stagger>

      {/* Quick Actions */}
      <Stagger className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { href: "/admin/events", label: "Manage Events", desc: "Create, edit, publish" },
          { href: "/admin/bookings", label: "All Bookings", desc: "View and filter" },
          { href: "/admin/users", label: "Users", desc: "Manage accounts" },
          { href: "/api/admin/export?type=bookings", label: "Export CSV", desc: "Download data" },
        ].map((item) => (
          <StaggerItem key={item.href}>
            <Link href={item.href}
              className="block bg-graphite/50 rounded-xl border border-slate-moss/20 p-5 hover:border-lime/30 transition group">
              <div className="font-bold text-warm-white group-hover:text-lime transition-colors">{item.label}</div>
              <div className="text-xs text-slate-moss mt-1">{item.desc}</div>
            </Link>
          </StaggerItem>
        ))}
      </Stagger>

      {/* Recent Bookings */}
      <FadeIn delay={0.2}>
        <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-moss/20 flex items-center justify-between">
            <h2 className="font-bold text-warm-white">Recent Bookings</h2>
            <Link href="/admin/bookings" className="text-xs text-lime/70 hover:text-lime transition">View all &rarr;</Link>
          </div>
          {recentBookings.length === 0 ? (
            <div className="px-5 py-10 text-center text-slate-moss">No bookings yet</div>
          ) : (
            <div className="divide-y divide-slate-moss/10">
              {recentBookings.map((b) => {
                const eventName = b.items[0]?.ticketType?.event?.title || "Event";
                return (
                  <div key={b.id} className="px-5 py-3 flex items-center justify-between hover:bg-obsidian/30 transition">
                    <div>
                      <div className="text-sm font-medium text-warm-white">{eventName}</div>
                      <div className="text-xs text-slate-moss">{b.user.name} &middot; {b.bookingReference}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-warm-white">{formatCurrency(Number(b.totalAmount))}</div>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${statusColors[b.status] || ""}`}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
