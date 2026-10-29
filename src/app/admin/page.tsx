import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Calendar, Ticket, Users, DollarSign, QrCode, Plus, ArrowRight } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [eventCount, bookingCount, totalRevenueResult, userCount] = await Promise.all([
    prisma.event.count(),
    prisma.booking.count(),
    prisma.booking.aggregate({
      _sum: { totalPrice: true },
      where: { paymentStatus: "CONFIRMED" },
    }),
    prisma.user.count(),
  ]);

  const totalRevenue = totalRevenueResult._sum.totalPrice || 0;

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { ticketType: { include: { event: true } } } },
    },
  });

  return (
    <div className="min-h-screen bg-[#0B0D0C] text-[#F5F5EF] pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#202522] pb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#F5F5EF]">Admin Dashboard</h1>
            <p className="text-[#94A3B8] text-sm mt-1">
              Overview of platform performance, active events, and venue admissions.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/admin/scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-[#C6FF00] text-[#C6FF00] hover:bg-[#C6FF00] hover:text-[#0B0D0C] font-semibold text-sm transition-all"
            >
              <QrCode className="w-4 h-4" />
              Venue QR Scanner
            </Link>
            
            <Link
              href="/admin/events/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#C6FF00] text-[#0B0D0C] hover:bg-lime-400 font-semibold text-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#202522] border border-[#202522] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8] text-sm font-medium">Total Revenue</span>
              <DollarSign className="w-5 h-5 text-[#C6FF00]" />
            </div>
            <p className="text-3xl font-bold text-[#F5F5EF] mt-3">${totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-[#202522] border border-[#202522] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8] text-sm font-medium">Active Events</span>
              <Calendar className="w-5 h-5 text-[#C6FF00]" />
            </div>
            <p className="text-3xl font-bold text-[#F5F5EF] mt-3">{eventCount}</p>
          </div>

          <div className="bg-[#202522] border border-[#202522] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8] text-sm font-medium">Total Bookings</span>
              <Ticket className="w-5 h-5 text-[#C6FF00]" />
            </div>
            <p className="text-3xl font-bold text-[#F5F5EF] mt-3">{bookingCount}</p>
          </div>

          <div className="bg-[#202522] border border-[#202522] rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <span className="text-[#94A3B8] text-sm font-medium">Platform Users</span>
              <Users className="w-5 h-5 text-[#C6FF00]" />
            </div>
            <p className="text-3xl font-bold text-[#F5F5EF] mt-3">{userCount}</p>
          </div>
        </div>

        {/* Quick Tools Banner */}
        <div className="bg-[#202522]/80 border border-[#202522] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#C6FF00]/10 border border-[#C6FF00]/30 flex items-center justify-center text-[#C6FF00]">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F5F5EF]">Live Door Ticket Verification</h3>
              <p className="text-sm text-[#94A3B8]">
                Use your camera or manual entry to scan and check in ticket holders at venue entrances.
              </p>
            </div>
          </div>
          <Link
            href="/admin/scanner"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C6FF00] text-[#0B0D0C] font-semibold text-sm hover:bg-lime-400 transition-all whitespace-nowrap"
          >
            Launch Scanner <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Recent Bookings Section */}
        <div className="bg-[#202522] border border-[#202522] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#0B0D0C] pb-4">
            <h2 className="text-lg font-bold text-[#F5F5EF]">Recent Orders</h2>
            <Link href="/admin/bookings" className="text-sm text-[#C6FF00] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#94A3B8]">
              <thead className="text-xs uppercase bg-[#0B0D0C] text-[#F5F5EF]">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Customer</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0B0D0C]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#0B0D0C]/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#F5F5EF]">{b.user.name || b.user.email}</td>
                    <td className="px-4 py-3">{b.items[0]?.ticketType?.event?.title || "N/A"}</td>
                    <td className="px-4 py-3 font-medium text-[#C6FF00]">${b.totalPrice}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        b.paymentStatus === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      }`}>
                        {b.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">{new Date(b.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}