"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRequests } from "@/lib/customer-api";
import { BUDGET_RANGE_LABELS, EVENT_TYPE_LABELS } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending match",
  matched: "Matched",
  quoted: "Quotes ready",
  customized: "Quotes ready",
  booked: "Booked",
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  matched: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  quoted: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  customized: "bg-violet-500/10 text-violet-600 border-violet-500/30",
  booked: "bg-green-500/10 text-green-600 border-green-500/30",
};

function nextStepHref(requestId: string, status: string) {
  switch (status) {
    case "quoted":
    case "customized":
      return `/dashboard/quotes?requestId=${requestId}`;
    case "booked":
      return `/dashboard/progress/${requestId}`;
    case "matched":
    case "pending":
    default:
      return `/dashboard/matching-results?requestId=${requestId}`;
  }
}

function nextStepLabel(status: string) {
  switch (status) {
    case "quoted":
    case "customized":
      return "Review quotes";
    case "booked":
      return "Track progress";
    case "matched":
      return "View matches";
    case "pending":
    default:
      return "View status";
  }
}

export default function MyEventsPage() {
  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["customer-requests"],
    queryFn: getRequests,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My events</h1>
          <p className="text-muted-foreground">Every event you&apos;ve submitted, and where it stands.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/event-questionnaire">Plan a new event</Link>
        </Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading your events...</p>}

      {isError && (
        <p className="text-sm text-destructive">Couldn&apos;t load your events. Please try again.</p>
      )}

      {!isLoading && !isError && (requests?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-muted-foreground">You haven&apos;t planned an event yet.</p>
            <Button asChild>
              <Link href="/dashboard/event-questionnaire">Start planning</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {requests?.map((request) => (
          <Card key={request.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
              <div>
                <CardTitle>{EVENT_TYPE_LABELS[request.eventType]}</CardTitle>
                <CardDescription>
                  {request.eventDate
                    ? new Date(request.eventDate).toLocaleDateString()
                    : "Date not set"}
                  {request.location ? ` · ${request.location}` : ""}
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className={cn("whitespace-nowrap", STATUS_STYLES[request.status])}
              >
                {STATUS_LABELS[request.status] ?? request.status}
              </Badge>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {BUDGET_RANGE_LABELS[request.budgetRange]}
                {request.guestCount ? ` · ${request.guestCount} guests` : ""}
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href={nextStepHref(request.id, request.status)}>
                  {nextStepLabel(request.status)}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
