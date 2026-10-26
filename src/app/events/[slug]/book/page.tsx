"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: string;
  quantity: number;
  sold: number;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  venue: string;
  city: string;
  startDate: string;
  ticketTypes: TicketType[];
}

export default function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { data: session, status } = useSession();

  const [event, setEvent] = useState<EventData | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/events/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setEvent(data.event);
          const initial: Record<string, number> = {};
          data.event.ticketTypes.forEach((t: TicketType) => {
            initial[t.id] = 0;
          });
          setQuantities(initial);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const selectedItems = Object.entries(quantities).filter(([, qty]) => qty > 0);
  const total = selectedItems.reduce((sum, [ticketId, qty]) => {
    const ticket = event?.ticketTypes.find((t) => t.id === ticketId);
    return sum + (ticket ? Number(ticket.price) * qty : 0);
  }, 0);

  async function handleCheckout() {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=/events/${slug}/book`);
      return;
    }

    if (selectedItems.length === 0) {
      setError("Please select at least one ticket");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // Step 1: Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map(([ticketTypeId, quantity]) => ({
            ticketTypeId,
            quantity,
          })),
        }),
      });

      const bookingData = await bookingRes.json();
      if (!bookingRes.ok) {
        setError(bookingData.message || "Booking failed");
        setSubmitting(false);
        return;
      }

      // Step 2: Create Stripe checkout
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: bookingData.booking.id }),
      });

      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        setError(checkoutData.message || "Checkout failed");
        setSubmitting(false);
        return;
      }

      // Step 3: Redirect to Stripe
      window.location.href = checkoutData.url;
    } catch {
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center text-muted-foreground">
          Loading...
        </main>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-12 text-center text-muted-foreground">
          Event not found.
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-1">{event.title}</h1>
        <p className="text-muted-foreground mb-8">
          {event.venue}, {event.city}
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {event.ticketTypes.map((ticket) => {
            const available = ticket.quantity - ticket.sold;
            return (
              <Card key={ticket.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{ticket.name}</h3>
                      {ticket.description && (
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {available} remaining
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg">
                        {formatCurrency(Number(ticket.price))}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={quantities[ticket.id] <= 0}
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [ticket.id]: Math.max(0, prev[ticket.id] - 1),
                            }))
                          }
                        >
                          −
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {quantities[ticket.id]}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={quantities[ticket.id] >= available}
                          onClick={() =>
                            setQuantities((prev) => ({
                              ...prev,
                              [ticket.id]: prev[ticket.id] + 1,
                            }))
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
          <Button
            size="lg"
            disabled={submitting || selectedItems.length === 0}
            onClick={handleCheckout}
          >
            {submitting
              ? "Processing..."
              : status !== "authenticated"
              ? "Sign in to Book"
              : "Proceed to Checkout"}
          </Button>
        </div>
      </main>
    </>
  );
}