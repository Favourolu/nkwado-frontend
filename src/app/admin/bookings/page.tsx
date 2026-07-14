"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAdminBookings, type AdminBooking } from "@/lib/admin-api";
import { formatNaira } from "@/lib/format";
import { EVENT_TYPE_LABELS } from "@/lib/types";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "PAID", "COMPLETED", "CANCELLED"];

export default function AdminBookingsPage() {
  const [status, setStatus] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [viewing, setViewing] = useState<AdminBooking | null>(null);

  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["admin-bookings", status, startDate],
    queryFn: () =>
      getAdminBookings({
        status: status === "all" ? undefined : status,
        startDate: startDate || undefined,
      }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Bookings</h1>
        <p className="text-muted-foreground">All confirmed bookings across the platform.</p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {BOOKING_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-44"
        />
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load bookings.</p>}
      {!isLoading && bookings && bookings.length === 0 && (
        <p className="text-muted-foreground">No bookings match these filters.</p>
      )}

      {!isLoading && bookings && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => setViewing(booking)}
            >
              <CardHeader className="flex-row items-center justify-between space-y-0 py-4">
                <div>
                  <CardTitle className="text-base">
                    {booking.customer.firstName} {booking.customer.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {EVENT_TYPE_LABELS[booking.eventType] ?? booking.eventType} ·{" "}
                    {booking.eventDate
                      ? new Date(booking.eventDate).toLocaleDateString()
                      : "Date TBD"}{" "}
                    · {booking.selectedVendors.length} vendors
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">
                    {formatNaira(booking.totalAmount)}
                  </p>
                  <p>{booking.paymentStatus ?? "pending"}</p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {viewing && `${viewing.customer.firstName} ${viewing.customer.lastName}`}
            </DialogTitle>
          </DialogHeader>
          {viewing && (
            <div id="admin-booking-print-area" className="space-y-4 text-sm">
              <div>
                <p>
                  <span className="font-medium">Event:</span>{" "}
                  {EVENT_TYPE_LABELS[viewing.eventType] ?? viewing.eventType}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {viewing.eventDate ? new Date(viewing.eventDate).toLocaleDateString() : "TBD"}
                </p>
                <p>
                  <span className="font-medium">Customer email:</span> {viewing.customer.email}
                </p>
              </div>

              <div>
                <p className="font-medium">Vendors</p>
                <ul className="list-inside list-disc text-muted-foreground">
                  {viewing.selectedVendors.map((v, i) => (
                    <li key={i}>{v.businessName}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatNaira(viewing.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service charge</span>
                  <span>{formatNaira(viewing.serviceCharge)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatNaira(viewing.totalAmount)}</span>
                </div>
              </div>

              <p className="text-muted-foreground">
                Payment status: {viewing.paymentStatus ?? "pending"}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>
              Print bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
