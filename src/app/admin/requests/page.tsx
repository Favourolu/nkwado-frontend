"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAdminRequests, type AdminRequest } from "@/lib/admin-api";
import { BUDGET_RANGE_LABELS, EVENT_TYPE_LABELS } from "@/lib/types";

const REQUEST_STATUSES = ["pending", "matched", "quoted", "booked"];

export default function AdminRequestsPage() {
  const [status, setStatus] = useState<string>("all");
  const [eventType, setEventType] = useState<string>("all");
  const [viewing, setViewing] = useState<AdminRequest | null>(null);

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["admin-requests", status, eventType],
    queryFn: () =>
      getAdminRequests({
        status: status === "all" ? undefined : status,
        eventType: eventType === "all" ? undefined : eventType,
      }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Customer requests</h1>
        <p className="text-muted-foreground">All event requests across the platform.</p>
      </div>

      <div className="mb-6 flex gap-3">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {REQUEST_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={eventType} onValueChange={setEventType}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All event types</SelectItem>
            {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load requests.</p>}
      {!isLoading && requests && requests.length === 0 && (
        <p className="text-muted-foreground">No requests match these filters.</p>
      )}

      {!isLoading && requests && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((request) => (
            <Card
              key={request.id}
              className="cursor-pointer transition-colors hover:bg-accent"
              onClick={() => setViewing(request)}
            >
              <CardHeader className="flex-row items-center justify-between space-y-0 py-4">
                <div>
                  <CardTitle className="text-base">
                    {request.customer.firstName} {request.customer.lastName}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {EVENT_TYPE_LABELS[request.eventType] ?? request.eventType} ·{" "}
                    {request.eventDate
                      ? new Date(request.eventDate).toLocaleDateString()
                      : "Date TBD"}{" "}
                    · {BUDGET_RANGE_LABELS[request.budgetRange] ?? request.budgetRange}
                  </p>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p className="capitalize">{request.status}</p>
                  <p>{request.quoteCount} quotes</p>
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
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Event:</span>{" "}
                {EVENT_TYPE_LABELS[viewing.eventType] ?? viewing.eventType}
              </p>
              <p>
                <span className="font-medium">Date:</span>{" "}
                {viewing.eventDate ? new Date(viewing.eventDate).toLocaleDateString() : "TBD"}
              </p>
              <p>
                <span className="font-medium">Budget:</span>{" "}
                {BUDGET_RANGE_LABELS[viewing.budgetRange] ?? viewing.budgetRange}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{viewing.status}</span>
              </p>
              <p>
                <span className="font-medium">Quotes received:</span> {viewing.quoteCount}
              </p>
              {viewing.bookingStatus && (
                <p>
                  <span className="font-medium">Booking status:</span> {viewing.bookingStatus}
                </p>
              )}
              <p>
                <span className="font-medium">Submitted:</span>{" "}
                {new Date(viewing.createdAt).toLocaleString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
