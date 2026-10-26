"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "@/components/toaster";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", country: "" });
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as Record<string, unknown>;
      setForm({
        name: (u.name as string) || "",
        email: (u.email as string) || "",
        phone: (u.phone as string) || "",
        country: (u.country as string) || "",
      });
      setLoading(false);
    }
  }, [session]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      await update();
      toast("Profile updated successfully", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPw.length < 8) {
      toast("Password must be at least 8 characters", "error");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast("Passwords do not match", "error");
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.newPw }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to change password");
      }

      toast("Password changed successfully", "success");
      setPwForm({ current: "", newPw: "", confirm: "" });
      setShowPw(false);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed", "error");
    }
  };

  const inputClass = "w-full bg-obsidian border border-slate-moss/30 rounded-lg px-4 py-2.5 text-sm text-warm-white placeholder:text-slate-moss/50 focus:outline-none focus:border-lime transition";
  const labelClass = "block text-xs font-bold text-slate-moss uppercase tracking-wider mb-1.5";

  if (loading) {
    return <div className="min-h-screen bg-obsidian pt-24 text-center text-slate-moss">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-obsidian text-warm-white pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard" className="text-sm text-lime/80 hover:text-lime mb-6 inline-block transition-colors font-medium">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-warm-white mb-8">My Profile</h1>

        <form onSubmit={handleSave} className="bg-graphite/50 rounded-2xl border border-slate-moss/20 p-6 space-y-4 mb-6 shadow-xl">
          <h2 className="font-bold text-warm-white border-b border-slate-moss/20 pb-3">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={form.email} disabled
                className="w-full bg-obsidian/40 border border-slate-moss/20 rounded-lg px-4 py-2.5 text-sm text-slate-moss cursor-not-allowed" />
              <p className="text-xs text-slate-moss/60 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className={inputClass} placeholder="+1 (555) 000-0000" />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input type="text" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                className={inputClass} placeholder="United States" />
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="bg-lime text-obsidian px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-lime/90 transition disabled:opacity-50 mt-2">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>

        <div className="bg-graphite/50 rounded-2xl border border-slate-moss/20 p-6 shadow-xl">
          <h2 className="font-bold text-warm-white mb-4 border-b border-slate-moss/20 pb-3">Security</h2>
          {!showPw ? (
            <button onClick={() => setShowPw(true)} className="text-lime text-sm font-bold hover:underline">
              Change Password &rarr;
            </button>
          ) : (
            <form onSubmit={handlePassword} className="space-y-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <input type="password" required value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                  className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>New Password</label>
                  <input type="password" required minLength={8} value={pwForm.newPw} onChange={(e) => setPwForm({ ...pwForm, newPw: e.target.value })}
                    className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input type="password" required minLength={8} value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
                    className={inputClass} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="bg-lime text-obsidian px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-lime/90 transition">
                  Update Password
                </button>
                <button type="button" onClick={() => setShowPw(false)} className="text-slate-moss text-sm hover:text-warm-white px-4 py-2.5">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
