"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Registration failed");
      }

      router.push("/login?registered=true");
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
          <h1 className="text-2xl font-bold text-graphite mb-2">Create your account</h1>
          <p className="text-sm text-slate-moss mb-6">Join PULSE and start booking events</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Full Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green"
                placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Password</label>
              <input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green" />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">Confirm Password</label>
              <input type="password" required minLength={8} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-obsidian text-warm-white py-3 rounded-lg font-bold text-sm hover:bg-graphite transition disabled:opacity-50">
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-slate-moss">
              Already have an account?{" "}
              <Link href="/login" className="text-dark-green font-medium hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
