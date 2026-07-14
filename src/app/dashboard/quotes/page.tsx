"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { getQuotes } from "@/lib/customer-api";
import { formatNaira } from "@/lib/format";

export default function QuotesPage() {
  return (
    <Suspense fallback={null}>
      <Quotes />
    </Suspense>
  );
}

function formatCountdown(deadlineAt: string | null | undefined): string {
  if (!deadlineAt) return "No deadline";
  const diffMs = new Date(deadlineAt).getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m left`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Awaiting quote";
    case "SUBMITTED":
      return "Quote received";
    case "EXPIRED":
      return "Expired";
    case "ACCEPTED":
      return "Accepted";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

function Quotes() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const { data: quotes, isLoading, isError } = useQuery({
    queryKey: ["customer-quotes", requestId],
    queryFn: () => getQuotes(requestId as string),
    enabled: Boolean(requestId),
    // Poll while any vendor hasn't responded yet, so quotes appear without
    // the customer having to manually reload the page.
    refetchInterval: (query) =>
      (query.state.data ?? []).some((q) => q.status === "PENDING") ? 15000 : false,
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (!requestId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">Missing request.</p>
      </div>
    );
  }

  const toggleQuote = (quoteId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(quoteId)) {
        next.delete(quoteId);
      } else {
        next.add(quoteId);
      }
      return next;
    });
  };

  const proceedToBooking = () => {
    const quoteIds = Array.from(selectedIds).join(",");
    router.push(`/dashboard/booking?requestId=${requestId}&quoteIds=${quoteIds}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Review vendor quotes</h1>
        <p className="text-muted-foreground">
          Select the quotes you&apos;d like to move forward with. Vendors have 24 hours to
          respond so you get quotes fast; the countdown on each card shows how much time
          that vendor has left.
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading quotes...</p>}
      {isError && (
        <p className="text-sm text-destructive">Couldn&apos;t load quotes. Please try again.</p>
      )}

      {!isLoading && quotes && quotes.length === 0 && (
        <p className="text-muted-foreground">No quotes yet. Check back soon.</p>
      )}

      {!isLoading && quotes && quotes.length > 0 && (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Card key={quote.id}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{quote.vendor.businessName}</CardTitle>
                  <CardDescription>{quote.vendor.category}</CardDescription>
                </div>
                {quote.status === "SUBMITTED" && (
                  <Checkbox
                    checked={selectedIds.has(quote.id)}
                    onCheckedChange={() => toggleQuote(quote.id)}
                  />
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{formatNaira(quote.basePrice)}</p>
                  <span className="text-sm text-muted-foreground">
                    {statusLabel(quote.status)}
                  </span>
                </div>
                {quote.itemization && quote.itemization.length > 0 && (
                  <ul className="text-sm text-muted-foreground">
                    {quote.itemization.map((row, i) => (
                      <li key={i}>
                        {row.item} × {row.qty}: {formatNaira(row.total)}
                      </li>
                    ))}
                  </ul>
                )}
                {quote.notes && (
                  <p className="text-sm text-muted-foreground">{quote.notes}</p>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatCountdown(quote.deadlineAt)}
                  </span>
                  {quote.status === "PENDING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.info(
                          "We've already reminded this vendor. You'll be notified when they respond."
                        )
                      }
                    >
                      Vendor not responding?
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            className="w-full"
            disabled={selectedIds.size === 0}
            onClick={proceedToBooking}
          >
            Proceed to booking ({selectedIds.size} selected)
          </Button>
        </div>
      )}
    </div>
  );
}
