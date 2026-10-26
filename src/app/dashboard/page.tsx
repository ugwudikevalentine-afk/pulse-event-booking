import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { redirect } from "next/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";

export const instant = false;

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          ticketType: {
            include: { event: { select: { title: true, slug: true, startDate: true, venue: true, city: true } } },
          },
        },
        take: 1,
      },
    },
  });

  const statusColors: Record<string, string> = {
    PENDING: "bg-warning/20 text-warning border-warning/30",
    CONFIRMED: "bg-success/20 text-success border-success/30",
    CANCELLED: "bg-error/20 text-error border-error/30",
    COMPLETED: "bg-info/20 text-info border-info/30",
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Bookings</h1>
              <p className="text-slate-moss mt-1">Welcome back, {session.user?.name?.split(" ")[0]}</p>
            </div>
            <Link href="/dashboard/profile" className="border border-slate-moss/30 text-warm-white px-4 py-2 rounded-lg text-sm hover:border-lime/50 hover:text-lime transition">
              Profile
            </Link>
          </div>
        </FadeIn>

        {bookings.length === 0 ? (
          <FadeIn>
            <div className="text-center py-20 border border-dashed border-slate-moss/30 rounded-2xl">
              <p className="text-slate-moss text-lg mb-2">No bookings yet</p>
              <Link href="/events" className="text-lime text-sm font-medium hover:underline">
                Browse events &rarr;
              </Link>
            </div>
          </FadeIn>
        ) : (
          <Stagger className="space-y-4">
            {bookings.map((booking) => {
              const item = booking.items[0];
              const event = item?.ticketType?.event;
              return (
                <StaggerItem key={booking.id}>
                  <Link
                    href={`/dashboard/bookings/${booking.id}`}
                    className="block bg-graphite/50 border border-slate-moss/20 rounded-xl p-5 hover:border-lime/30 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-warm-white group-hover:text-lime transition-colors truncate">
                          {event?.title || "Event"}
                        </h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-moss">
                          {event && <span>{formatDate(event.startDate)}</span>}
                          {event && <span>{event.venue}, {event.city}</span>}
                          <span className="font-mono text-xs">{booking.bookingReference}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-warm-white">{formatCurrency(Number(booking.totalAmount))}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold border ${statusColors[booking.status] || ""}`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}
      </div>
    </div>
  );
}
