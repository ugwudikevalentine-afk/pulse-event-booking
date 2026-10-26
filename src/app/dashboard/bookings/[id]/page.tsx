import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const instant = false;

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          ticketType: {
            include: { event: true },
          },
        },
      },
      payment: true,
    },
  });

  if (!booking || booking.userId !== session.user.id) {
    redirect("/dashboard");
  }

  const event = booking.items[0]?.ticketType?.event;
  const statusColors: Record<string, string> = {
    PENDING: "bg-warning/20 text-warning border-warning/30",
    CONFIRMED: "bg-success/20 text-success border-success/30",
    CANCELLED: "bg-error/20 text-error border-error/30",
    COMPLETED: "bg-info/20 text-info border-info/30",
  };
  const payStatusColors: Record<string, string> = {
    UNPAID: "bg-warning/20 text-warning",
    PAID: "bg-success/20 text-success",
    FAILED: "bg-error/20 text-error",
    REFUNDED: "bg-slate-moss/20 text-slate-moss",
  };

  return (
    <div className="light-zone min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-sm text-slate-moss hover:text-dark-green mb-6 inline-block transition-colors">
          &larr; Back to Bookings
        </Link>

        <div className="bg-white rounded-2xl border border-slate-moss/20 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="bg-obsidian text-warm-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-slate-moss mb-1">Booking Reference</p>
                <h1 className="text-xl font-bold font-mono">{booking.bookingReference}</h1>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status] || ""}`}>
                {booking.status}
              </span>
            </div>
          </div>

          {/* Event Info */}
          {event && (
            <div className="p-6 border-b border-slate-moss/10">
              <h2 className="text-lg font-bold text-graphite">{event.title}</h2>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm text-slate-moss">
                <div>
                  <span className="text-xs uppercase tracking-wider">Date</span>
                  <p className="text-graphite font-medium">{formatDate(event.startDate)}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider">Venue</span>
                  <p className="text-graphite font-medium">{event.venue}, {event.city}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tickets */}
          <div className="p-6 border-b border-slate-moss/10">
            <h3 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">Tickets</h3>
            <div className="space-y-3">
              {booking.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-graphite">{item.ticketType.name}</p>
                    <p className="text-xs text-slate-moss">{formatCurrency(Number(item.unitPrice))} each</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-moss">x{item.quantity}</p>
                    <p className="font-bold text-graphite">{formatCurrency(Number(item.totalPrice))}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-moss/10">
              <span className="font-semibold text-graphite">Total</span>
              <span className="text-xl font-bold text-graphite">{formatCurrency(Number(booking.totalAmount))}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-moss">Payment Status</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${payStatusColors[booking.paymentStatus] || ""}`}>
                  {booking.paymentStatus}
                </span>
              </div>
              <p className="text-xs text-slate-moss">
                Booked {formatDate(booking.createdAt)}
              </p>
            </div>

            {booking.status === "PENDING" && (
              <div className="mt-6 flex gap-3">
                <Link href={`/events/${event?.slug}/book?resume=${booking.id}`}
                  className="bg-lime text-obsidian px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-lime/90 transition">
                  Complete Payment
                </Link>
                <form action={`/api/bookings/${booking.id}/cancel`} method="POST">
                  <button type="submit" className="border border-error/30 text-error px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-error/5 transition">
                    Cancel Booking
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
