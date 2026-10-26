"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl text-error/30 mb-6">!</div>
        <h1 className="text-2xl font-bold text-warm-white mb-2">Something went wrong</h1>
        <p className="text-slate-moss mb-8 text-sm">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset}
            className="bg-lime text-obsidian px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-lime/90 transition">
            Try Again
          </button>
          <Link href="/"
            className="border border-slate-moss/30 text-warm-white px-6 py-2.5 rounded-lg text-sm hover:border-lime/50 transition">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
