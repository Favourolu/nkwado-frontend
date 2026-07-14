"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProgressTracker } from "@/components/progress-tracker";
import { createBooking, getProgress, getQuotes } from "@/lib/customer-api";
import { formatNaira } from "@/lib/format";
import { getErrorMessage } from "@/lib/get-error-message";

const SERVICE_CHARGE_RATE = 0.1;

export default function BookingPage() {
  return (
    <Suspense fallback={null}>
      <BookingReview />
    </Suspense>
  );
}

function BookingReview() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const quoteIds = useMemo(
    () => (searchParams.get("quoteIds") ?? "").split(",").filter(Boolean),
    [searchParams]
  );

  const { data: quotes, isLoading } = useQuery({
    queryKey: ["customer-quotes", requestId],
    queryFn: () => getQuotes(requestId as string),
    enabled: Boolean(requestId),
  });

  const selectedQuotes = (quotes ?? []).filter((q) => quoteIds.includes(q.id));
  const subtotal = selectedQuotes.reduce((sum, q) => sum + q.basePrice, 0);
  const serviceCharge = Math.round(subtotal * SERVICE_CHARGE_RATE);
  const total = subtotal + serviceCharge;

  const mutation = useMutation({
    mutationFn: () => createBooking(requestId as string, quoteIds),
    onSuccess: () => {
      toast.success("Booking confirmed!");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Couldn't confirm your booking. Please try again."));
    },
  });

  const booking = mutation.data;

  const { data: progress } = useQuery({
    queryKey: ["customer-progress", requestId],
    queryFn: () => getProgress(requestId as string),
    enabled: Boolean(requestId) && Boolean(booking),
  });

  if (!requestId || quoteIds.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">Missing booking details.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Confirm your booking</h1>
        <p className="text-muted-foreground">Review your selected vendors before booking.</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && !booking && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Selected vendors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{quote.vendor.businessName}</p>
                    <p className="text-sm text-muted-foreground">{quote.vendor.category}</p>
                  </div>
                  <p>{formatNaira(quote.basePrice)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 pt-6">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatNaira(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service charge (10%)</span>
                <span>{formatNaira(serviceCharge)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Covers vendor vetting, quote coordination, and booking support. Nkwado
                doesn&apos;t charge vendors a listing fee, so this keeps the platform running.
              </p>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatNaira(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Confirming..." : "Confirm booking"}
          </Button>
        </div>
      )}

      {booking && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking confirmed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatNaira(booking.subtotal ?? subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service charge (10%)</span>
                <span>{formatNaira(booking.serviceCharge ?? serviceCharge)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatNaira(booking.totalAmount)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row">
            {booking.billPdfUrl && (
              <Button asChild variant="outline" className="flex-1">
                <a href={booking.billPdfUrl} target="_blank" rel="noopener noreferrer">
                  Download bill
                </a>
              </Button>
            )}
            <Button asChild className="flex-1">
              <Link href="/dashboard/bookings">Proceed to payment</Link>
            </Button>
          </div>

          {progress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTracker steps={progress.steps} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
