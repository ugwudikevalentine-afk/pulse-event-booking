"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send reset link");
      }

      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="light-zone min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-moss hover:text-dark-green mb-8 transition-colors">
          &larr; Back to PULSE
        </Link>

        <div className="bg-white rounded-2xl border border-slate-moss/20 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-graphite mb-2">Reset your password</h1>
          <p className="text-sm text-slate-moss mb-6">
            Enter your email and we will send you a link to reset your password.
          </p>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                &#10003;
              </div>
              <h2 className="font-bold text-graphite mb-2">Check your email</h2>
              <p className="text-sm text-slate-moss">
                If an account exists for {email}, you will receive a reset link shortly.
              </p>
              <Link href="/login" className="inline-block mt-6 text-sm text-dark-green font-medium hover:underline">
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-obsidian text-warm-white py-2.5 rounded-lg font-medium text-sm hover:bg-graphite transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
              <p className="text-center text-sm text-slate-moss">
                Remember your password?{" "}
                <Link href="/login" className="text-dark-green font-medium hover:underline">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
