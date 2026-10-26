"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (sessionId) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }, [sessionId]);

  if (status === "loading") {
    return <p className="text-muted-foreground">Verifying payment...</p>;
  }

  if (status === "error") {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">We couldn&apos;t verify your payment.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="text-5xl mb-4">🎉</div>
        <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          Your payment was successful. Check your email for the booking confirmation and ticket details.
        </p>
        <div className="flex flex-col gap-2">
          <Link href="/dashboard">
            <Button className="w-full">View My Bookings</Button>
          </Link>
          <Link href="/events">
            <Button variant="outline" className="w-full">Browse More Events</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <main className="py-24 px-4">
        <Suspense fallback={<p className="text-center text-muted-foreground">Loading...</p>}>
          <SuccessContent />
        </Suspense>
      </main>
    </>
  );
}