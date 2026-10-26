"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to reset password");
      }

      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-error font-medium">Invalid or missing reset token.</p>
        <Link href="/forgot-password" className="text-dark-green text-sm mt-4 inline-block hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">&#10003;</div>
        <h2 className="font-bold text-graphite mb-2">Password reset!</h2>
        <p className="text-sm text-slate-moss mb-6">You can now log in with your new password.</p>
        <Link href="/login" className="inline-block bg-obsidian text-warm-white px-6 py-2.5 rounded-lg text-sm font-medium">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-graphite mb-1">New Password</label>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green" />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-1">Confirm Password</label>
        <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green" />
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-obsidian text-warm-white py-2.5 rounded-lg font-medium text-sm hover:bg-graphite transition disabled:opacity-50">
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="light-zone min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-moss hover:text-dark-green mb-8 transition-colors">
          &larr; Back to PULSE
        </Link>
        <div className="bg-white rounded-2xl border border-slate-moss/20 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-graphite mb-6">Set new password</h1>
          <Suspense fallback={<p className="text-slate-moss text-sm">Loading...</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
