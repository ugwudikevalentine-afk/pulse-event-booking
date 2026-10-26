import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-lime/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-warm-white mb-2">Page Not Found</h1>
        <p className="text-slate-moss mb-8 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="bg-lime text-obsidian px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-lime/90 transition">
            Go Home
          </Link>
          <Link href="/events" className="border border-slate-moss/30 text-warm-white px-6 py-2.5 rounded-lg text-sm hover:border-lime/50 transition">
            Browse Events
          </Link>
        </div>
      </div>
    </div>
  );
}
