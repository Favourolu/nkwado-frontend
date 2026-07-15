"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorDetailsDialog } from "@/components/VendorDetailsDialog";
import { getRequest } from "@/lib/customer-api";
import { formatNaira } from "@/lib/format";

export default function MatchingResultsPage() {
  return (
    <Suspense fallback={null}>
      <MatchingResults />
    </Suspense>
  );
}

function MatchingResults() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const [viewingVendorId, setViewingVendorId] = useState<string | null>(null);

  const { data: request, isLoading, isError } = useQuery({
    queryKey: ["customer-request", requestId],
    queryFn: () => getRequest(requestId as string),
    enabled: Boolean(requestId),
  });

  if (!requestId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">
          Missing request. Please{" "}
          <Link href="/dashboard/event-questionnaire" className="underline underline-offset-4">
            start a new questionnaire
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold">Your matched vendors</h1>
        <p className="text-muted-foreground">
          {isLoading
            ? "We're matching vendors..."
            : "Here's who we think is the best fit for your event."}
        </p>
      </div>

      {isError && (
        <p className="text-center text-sm text-destructive">
          Couldn&apos;t load your matches. Please try again.
        </p>
      )}

      {!isLoading && request && (
        <div className="space-y-4">
          {(request.aiMatchedVendors ?? []).map((vendor) => (
            <Card key={vendor.vendorId}>
              <CardHeader>
                <CardTitle>{vendor.businessName}</CardTitle>
                <CardDescription>{vendor.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{formatNaira(vendor.basePrice)}</p>
                  <p className="text-sm text-muted-foreground">{vendor.reason}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewingVendorId(vendor.vendorId)}
                >
                  View details
                </Button>
              </CardContent>
            </Card>
          ))}

          {(request.aiMatchedVendors ?? []).length === 0 && (
            <p className="text-center text-muted-foreground">
              No matches found yet. Check back soon.
            </p>
          )}

          <div className="pt-4 text-center">
            <Link
              href={`/dashboard/customize?requestId=${request.id}`}
              className="text-sm underline underline-offset-4"
            >
              Not happy? Customize your selection
            </Link>
          </div>
        </div>
      )}

      <VendorDetailsDialog
        vendorId={viewingVendorId}
        onOpenChange={(open) => !open && setViewingVendorId(null)}
      />
    </div>
  );
}
