"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isAdmin = (session?.user as Record<string, unknown>)?.role === "ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-obsidian/90 backdrop-blur-xl border-b border-slate-moss/20 py-2"
          : "bg-obsidian/60 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-warm-white">
            <span className="bg-lime text-obsidian w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black">
              P
            </span>
            <span className="tracking-tight">PULSE</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/events" className="text-warm-white/70 hover:text-lime text-sm font-medium transition-colors">
              Events
            </Link>
            {session ? (
              <>
                <Link href="/dashboard" className="text-warm-white/70 hover:text-lime text-sm font-medium transition-colors">
                  My Bookings
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-warm-white/70 hover:text-lime text-sm font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-warm-white/80 hover:text-warm-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-lime/20 text-lime rounded-full flex items-center justify-center text-xs font-bold border border-lime/30">
                      {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    {session.user?.name?.split(" ")[0]}
                  </button>
                  {dropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-graphite rounded-lg shadow-2xl border border-slate-moss/30 z-20 py-1">
                        <Link href="/dashboard" className="block px-4 py-2 text-sm text-warm-white/80 hover:bg-obsidian hover:text-lime transition-colors" onClick={() => setDropdownOpen(false)}>
                          My Bookings
                        </Link>
                        <Link href="/dashboard/profile" className="block px-4 py-2 text-sm text-warm-white/80 hover:bg-obsidian hover:text-lime transition-colors" onClick={() => setDropdownOpen(false)}>
                          Profile Settings
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" className="block px-4 py-2 text-sm text-warm-white/80 hover:bg-obsidian hover:text-lime transition-colors" onClick={() => setDropdownOpen(false)}>
                            Admin Panel
                          </Link>
                        )}
                        <hr className="my-1 border-slate-moss/20" />
                        <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors">
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-warm-white/70 hover:text-warm-white text-sm font-medium transition-colors">
                  Log In
                </Link>
                <Link href="/register" className="bg-lime text-obsidian px-4 py-2 rounded-lg text-sm font-bold hover:bg-lime/90 transition">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-warm-white/70 hover:text-warm-white"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-slate-moss/20 py-4 space-y-2 mt-2 bg-obsidian/95 rounded-lg px-2">
            <Link href="/events" className="block px-3 py-2 text-warm-white/80 hover:text-lime rounded transition-colors" onClick={() => setMobileOpen(false)}>Events</Link>
            {session ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-warm-white/80 hover:text-lime rounded transition-colors" onClick={() => setMobileOpen(false)}>My Bookings</Link>
                <Link href="/dashboard/profile" className="block px-3 py-2 text-warm-white/80 hover:text-lime rounded transition-colors" onClick={() => setMobileOpen(false)}>Profile Settings</Link>
                {isAdmin && <Link href="/admin" className="block px-3 py-2 text-warm-white/80 hover:text-lime rounded transition-colors" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
                <button onClick={() => { signOut({ callbackUrl: "/" }); setMobileOpen(false); }} className="block w-full text-left px-3 py-2 text-error hover:bg-error/10 rounded">Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block px-3 py-2 text-warm-white/80 hover:text-lime rounded transition-colors" onClick={() => setMobileOpen(false)}>Log In</Link>
                <Link href="/register" className="block px-3 py-2 bg-lime text-obsidian rounded text-center font-bold" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
