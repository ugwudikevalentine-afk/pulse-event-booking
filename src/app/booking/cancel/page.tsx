import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CancelPage() {
  return (
    <>
      <Navbar />
      <main className="py-24 px-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Checkout Cancelled</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your booking is still pending. You can complete the payment anytime from your dashboard.
            </p>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
              <Link href="/events">
                <Button variant="outline" className="w-full">Browse Events</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}