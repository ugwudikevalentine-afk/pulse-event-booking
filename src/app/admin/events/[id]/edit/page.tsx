"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface TicketTypeRow {
  id?: string;
  name: string;
  description: string;
  price: string;
  quantity: string;
  saleStartsAt: string;
  saleEndsAt: string;
  isActive: boolean;
}

const CATEGORIES = [
  "CONCERT", "SPORTS", "CONFERENCE",
  "FESTIVAL", "THEATER", "WORKSHOP", "OTHER",
] as const;

function toLocalDatetime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function EditEventForm() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "OTHER",
    venue: "",
    city: "",
    country: "",
    address: "",
    startDate: "",
    endDate: "",
    image: "",
    status: "DRAFT",
  });

  const [tickets, setTickets] = useState<TicketTypeRow[]>([]);

  useEffect(() => {
    if (!eventId) return;
    fetch(`/api/admin/events/${eventId}`)
      .then((r) => r.json())
      .then((data) => {
        const ev = data.event;
        if (!ev) throw new Error("Event not found");
        setForm({
          title: ev.title || "",
          description: ev.description || "",
          category: ev.category || "OTHER",
          venue: ev.venue || "",
          city: ev.city || "",
          country: ev.country || "",
          address: ev.address || "",
          startDate: toLocalDatetime(ev.startDate),
          endDate: toLocalDatetime(ev.endDate),
          image: ev.image || "",
          status: ev.status || "DRAFT",
        });
        setTickets(
          (ev.ticketTypes || []).map((t: Record<string, unknown>) => ({
            id: t.id as string,
            name: t.name as string,
            description: (t.description as string) || "",
            price: String(t.price),
            quantity: String(t.quantity),
            saleStartsAt: toLocalDatetime(t.saleStartsAt as string | null),
            saleEndsAt: toLocalDatetime(t.saleEndsAt as string | null),
            isActive: t.isActive as boolean,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load event");
        setLoading(false);
      });
  }, [eventId]);

  const updateField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const updateTicket = (index: number, field: keyof TicketTypeRow, value: string | boolean) => {
    setTickets((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const addTicket = () =>
    setTickets((prev) => [
      ...prev,
      { name: "", description: "", price: "", quantity: "", saleStartsAt: "", saleEndsAt: "", isActive: true },
    ]);

  const removeTicket = (index: number) => {
    const ticket = tickets[index];
    if (ticket.id) {
      updateTicket(index, "isActive", false);
    } else {
      setTickets((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ticketTypes: tickets
            .filter((t) => t.isActive)
            .map((t) => ({
              id: t.id || undefined,
              name: t.name,
              description: t.description || undefined,
              price: parseFloat(t.price) || 0,
              quantity: parseInt(t.quantity) || 1,
              saleStartsAt: t.saleStartsAt || undefined,
              saleEndsAt: t.saleEndsAt || undefined,
            })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update event");
      }

      router.push("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-obsidian border border-slate-moss/30 rounded-lg px-3.5 py-2.5 text-sm text-warm-white placeholder:text-slate-moss/50 focus:outline-none focus:border-lime transition";
  const labelClass = "block text-xs font-semibold text-slate-moss uppercase tracking-wider mb-1.5";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 pt-24 text-center text-slate-moss min-h-screen">
        Loading event details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pt-24 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/events" className="text-sm text-lime/80 hover:text-lime transition flex items-center gap-1">
            &larr; Back to Events
          </Link>
          <h1 className="text-3xl font-bold text-warm-white mt-2">Edit Event</h1>
        </div>
      </div>

      {error && (
        <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-graphite/50 rounded-xl border border-slate-moss/20 p-6 space-y-4">
          <h2 className="text-lg font-bold text-warm-white border-b border-slate-moss/20 pb-3">Event Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Title *</label>
              <input type="text" required value={form.title} onChange={(e) => updateField("title", e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => updateField("description", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category *</label>
              <select value={form.category} onChange={(e) => updateField("category", e.target.value)} className={inputClass}>
                {CATEGORIES.map((c) => (<option key={c} value={c} className="bg-graphite text-warm-white">{c}</option>))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status *</label>
              <select value={form.status} onChange={(e) => updateField("status", e.target.value)} className={inputClass}>
                <option value="DRAFT" className="bg-graphite text-warm-white">Draft</option>
                <option value="PUBLISHED" className="bg-graphite text-warm-white">Published</option>
                <option value="CANCELLED" className="bg-graphite text-warm-white">Cancelled</option>
                <option value="COMPLETED" className="bg-graphite text-warm-white">Completed</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Venue *</label>
              <input type="text" required value={form.venue} onChange={(e) => updateField("venue", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City *</label>
              <input type="text" required value={form.city} onChange={(e) => updateField("city", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country *</label>
              <input type="text" required value={form.country} onChange={(e) => updateField("country", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address</label>
              <input type="text" value={form.address} onChange={(e) => updateField("address", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Start Date *</label>
              <input type="datetime-local" required value={form.startDate} onChange={(e) => updateField("startDate", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="datetime-local" value={form.endDate} onChange={(e) => updateField("endDate", e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Image URL</label>
              <input type="url" value={form.image} onChange={(e) => updateField("image", e.target.value)} className={inputClass} />
            </div>
          </div>
        </section>

        <section className="bg-graphite/50 rounded-xl border border-slate-moss/20 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-moss/20 pb-3">
            <h2 className="text-lg font-bold text-warm-white">Ticket Types</h2>
            <button type="button" onClick={addTicket} className="text-xs bg-lime/20 text-lime border border-lime/30 px-3 py-1.5 rounded-lg hover:bg-lime/30 transition font-bold">+ Add Ticket Type</button>
          </div>
          {tickets.filter((t) => t.isActive).map((ticket, visibleIndex) => {
            const realIndex = tickets.indexOf(ticket);
            return (
              <div key={ticket.id || visibleIndex} className="bg-obsidian/50 border border-slate-moss/20 rounded-lg p-4 space-y-3 relative">
                <button type="button" onClick={() => removeTicket(realIndex)} className="absolute top-3 right-3 text-error hover:text-error/80 text-xs font-bold">Remove</button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input type="text" required value={ticket.name} onChange={(e) => updateTicket(realIndex, "name", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Price (USD) *</label>
                    <input type="number" step="0.01" min="0" required value={ticket.price} onChange={(e) => updateTicket(realIndex, "price", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Quantity *</label>
                    <input type="number" min="1" required value={ticket.quantity} onChange={(e) => updateTicket(realIndex, "quantity", e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <input type="text" value={ticket.description} onChange={(e) => updateTicket(realIndex, "description", e.target.value)} className={inputClass} />
                </div>
              </div>
            );
          })}
        </section>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="bg-lime text-obsidian px-6 py-2.5 rounded-lg hover:bg-lime/90 font-bold transition disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/admin/events" className="border border-slate-moss/30 text-warm-white px-6 py-2.5 rounded-lg hover:bg-graphite transition text-sm font-medium">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default function EditEventPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-obsidian pt-24 text-center text-slate-moss">Loading event...</div>}>
      <EditEventForm />
    </Suspense>
  );
}
