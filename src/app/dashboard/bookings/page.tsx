"use client";

import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBookings } from "@/lib/customer-api";
import { formatNaira } from "@/lib/format";
import { EVENT_TYPE_LABELS } from "@/lib/types";

function statusLabel(status: string): string {
  switch (status) {
    case "PENDING":
      return "Awaiting confirmation";
    case "CONFIRMED":
      return "Confirmed";
    case "PAID":
      return "Paid";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export default function BookingsListPage() {
  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["customer-bookings"],
    queryFn: getBookings,
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Your bookings</h1>
        <p className="text-muted-foreground">Track all your event bookings here.</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && (
        <p className="text-sm text-destructive">Couldn&apos;t load your bookings.</p>
      )}

      {!isLoading && bookings && bookings.length === 0 && (
        <p className="text-muted-foreground">You don&apos;t have any bookings yet.</p>
      )}

      {!isLoading && bookings && bookings.length > 0 && (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">
                  {EVENT_TYPE_LABELS[booking.eventType] ?? booking.eventType}
                </CardTitle>
                <span className="text-sm font-medium text-muted-foreground">
                  {statusLabel(booking.status)}
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                {booking.eventDate && (
                  <p className="text-sm text-muted-foreground">
                    {new Date(booking.eventDate).toLocaleDateString()}
                  </p>
                )}
                <p className="font-medium">{formatNaira(booking.totalAmount)}</p>
                <p className="text-sm text-muted-foreground">
                  {booking.selectedVendors.map((v) => v.businessName).join(", ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
