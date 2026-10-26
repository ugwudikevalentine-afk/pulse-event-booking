import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { FadeIn } from "@/components/motion/fade-in";

export const instant = false;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1"));
  const perPage = 20;

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
    }),
    prisma.user.count(),
  ]);

  const totalPages = Math.ceil(totalCount / perPage);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/admin" className="text-sm text-lime/70 hover:text-lime transition-colors">
              &larr; Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold mt-2">All Users</h1>
            <p className="text-slate-moss text-sm">{totalCount} registered users</p>
          </div>
        </div>
      </FadeIn>

      <div className="bg-graphite/50 rounded-xl border border-slate-moss/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-obsidian/50 border-b border-slate-moss/20">
              <tr>
                <th className="text-left px-4 py-3 text-slate-moss font-medium">User</th>
                <th className="text-left px-4 py-3 text-slate-moss font-medium">Email</th>
                <th className="text-left px-4 py-3 text-slate-moss font-medium">Role</th>
                <th className="text-left px-4 py-3 text-slate-moss font-medium">Verified</th>
                <th className="text-left px-4 py-3 text-slate-moss font-medium">Bookings</th>
                <th className="text-left px-4 py-3 text-slate-moss font-medium">Joined</th>
                <th className="text-left px-4 py-3 text-slate-moss font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-moss/10">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-obsidian/30 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-lime/20 text-lime rounded-full flex items-center justify-center text-xs font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-warm-white font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-moss">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      u.role === "ADMIN" ? "bg-lime/20 text-lime" : "bg-slate-moss/20 text-slate-moss"
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.isEmailVerified ? (
                      <span className="text-success text-xs">&#10003; Yes</span>
                    ) : (
                      <span className="text-warning text-xs">&#10007; No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-warm-white font-medium">{u._count.bookings}</td>
                  <td className="px-4 py-3 text-slate-moss text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      u.isActive ? "bg-success/20 text-success" : "bg-error/20 text-error"
                    }`}>
                      {u.isActive ? "Active" : "Banned"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/admin/users?page=${page - 1}`}
              className="px-4 py-2 rounded-lg border border-slate-moss/20 text-sm text-warm-white hover:border-lime/50 transition">
              &larr; Prev
            </Link>
          )}
          <span className="text-sm text-slate-moss px-4">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/users?page=${page + 1}`}
              className="px-4 py-2 rounded-lg border border-slate-moss/20 text-sm text-warm-white hover:border-lime/50 transition">
              Next &rarr;
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
