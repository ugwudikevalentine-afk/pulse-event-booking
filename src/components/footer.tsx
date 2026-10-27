import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-obsidian border-t border-slate-moss/20">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg text-warm-white mb-4">
              <span className="bg-lime text-obsidian w-7 h-7 rounded flex items-center justify-center text-xs font-black">P</span>
              PULSE
            </Link>
            <p className="text-sm text-slate-moss leading-relaxed">
              Discover events. Plan your journey. Make the moment yours.
            </p>
          </div>
          <div>
            <h4 className="text-warm-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="text-slate-moss hover:text-lime transition-colors">All Events</Link></li>
              <li><Link href="/events?category=CONCERT" className="text-slate-moss hover:text-lime transition-colors">Concerts</Link></li>
              <li><Link href="/events?category=SPORTS" className="text-slate-moss hover:text-lime transition-colors">Sports</Link></li>
              <li><Link href="/events?category=FESTIVAL" className="text-slate-moss hover:text-lime transition-colors">Festivals</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-warm-white font-semibold mb-4 text-sm uppercase tracking-wider">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="text-slate-moss hover:text-lime transition-colors">Log In</Link></li>
              <li><Link href="/register" className="text-slate-moss hover:text-lime transition-colors">Sign Up</Link></li>
              <li><Link href="/dashboard" className="text-slate-moss hover:text-lime transition-colors">My Bookings</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-warm-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/events" className="text-slate-moss hover:text-lime transition-colors">Ticketing Engine</Link></li>
              <li><Link href="/admin" className="text-slate-moss hover:text-lime transition-colors">Admin Portal</Link></li>
              <li><Link href="/sitemap.xml" className="text-slate-moss hover:text-lime transition-colors">Sitemap</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-moss/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-moss">&copy; 2026 PULSE Events Platform. All rights reserved.</p>
          <p className="text-xs text-slate-moss/60">Modern Event Booking & Ticketing Solution</p>
        </div>
      </div>
    </footer>
  );
}