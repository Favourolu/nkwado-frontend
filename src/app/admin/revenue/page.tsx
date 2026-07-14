"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevenueByEventTypeChart } from "@/components/admin/RevenueByEventTypeChart";
import { RevenueLineChart } from "@/components/admin/RevenueLineChart";
import { getAdminBookings } from "@/lib/admin-api";
import { revenueByEventType, revenueOverTime } from "@/lib/revenue-utils";

export default function AdminRevenuePage() {
  const { data: bookings, isLoading, isError } = useQuery({
    queryKey: ["admin-bookings-all"],
    queryFn: () => getAdminBookings(),
  });

  const overTime = useMemo(() => revenueOverTime(bookings ?? []), [bookings]);
  const byEventType = useMemo(() => revenueByEventType(bookings ?? []), [bookings]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Revenue</h1>
        <p className="text-muted-foreground">Platform revenue trends and breakdown.</p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load revenue data.</p>}

      {!isLoading && bookings && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue over time</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueLineChart data={overTime} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Revenue by event type</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueByEventTypeChart data={byEventType} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
