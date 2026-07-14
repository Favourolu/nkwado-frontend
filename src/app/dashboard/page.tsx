import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CustomerDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Plan your perfect event</h1>
        <p className="max-w-md text-muted-foreground">
          Answer a few questions and we&apos;ll match you with vetted vendors, get you quotes
          within 24 hours, and help you book with confidence.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild size="lg">
          <Link href="/dashboard/event-questionnaire">Start Planning</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard/bookings">My Bookings</Link>
        </Button>
      </div>
    </div>
  );
}
