"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-lg">{error}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-graphite mb-1">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green"
          placeholder="you@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-graphite mb-1">Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-dark-green/30 focus:border-dark-green" />
      </div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-slate-moss">
          <input type="checkbox" className="rounded" /> Remember me
        </label>
        <Link href="/forgot-password" className="text-sm text-dark-green font-medium hover:underline">
          Forgot password?
        </Link>
      </div>
      <button type="submit" disabled={loading}
        className="w-full bg-obsidian text-warm-white py-3 rounded-lg font-bold text-sm hover:bg-graphite transition disabled:opacity-50">
        {loading ? "Signing in..." : "Log In"}
      </button>
      <p className="text-center text-sm text-slate-moss">
        Do not have an account?{" "}
        <Link href="/register" className="text-dark-green font-medium hover:underline">Sign up</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="light-zone min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-moss hover:text-dark-green mb-8 transition-colors">
          &larr; Back to PULSE
        </Link>
        <div className="bg-white rounded-2xl border border-slate-moss/20 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-graphite mb-2">Welcome back</h1>
          <p className="text-sm text-slate-moss mb-6">Log in to your PULSE account</p>
          <Suspense fallback={<p className="text-slate-moss text-sm">Loading...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
