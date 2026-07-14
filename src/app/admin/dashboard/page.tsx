"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardMetrics } from "@/lib/admin-api";
import { formatNaira } from "@/lib/format";

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  const { data: metrics, isLoading, isError } = useQuery({
    queryKey: ["admin-dashboard-metrics"],
    queryFn: getDashboardMetrics,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin dashboard</h1>
          <p className="text-muted-foreground">Overview of the Nkwado marketplace.</p>
        </div>
        <nav className="flex gap-4 text-sm">
          <Link href="/admin/vendors/pending" className="underline underline-offset-4">
            Vendor vetting
          </Link>
          <Link href="/admin/requests" className="underline underline-offset-4">
            Requests
          </Link>
          <Link href="/admin/bookings" className="underline underline-offset-4">
            Bookings
          </Link>
          <Link href="/admin/revenue" className="underline underline-offset-4">
            Revenue
          </Link>
        </nav>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load metrics.</p>}

      {metrics && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricCard label="Total vendors" value={metrics.totalVendors} />
          <MetricCard label="Pending vendors" value={metrics.pendingVendors} />
          <MetricCard label="Approved vendors" value={metrics.approvedVendors} />
          <MetricCard label="Total customers" value={metrics.totalCustomers} />
          <MetricCard label="Active requests" value={metrics.activeRequests} />
          <MetricCard label="Completed bookings" value={metrics.completedBookings} />
          <MetricCard label="Total revenue" value={formatNaira(metrics.totalRevenue)} />
          <MetricCard label="Avg. event value" value={formatNaira(metrics.averageEventValue)} />
        </div>
      )}
    </div>
  );
}
