"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllVendors } from "@/lib/admin-api";
import type { VendorStatus } from "@/lib/vendor-api";
import { VENDOR_CATEGORY_LABELS, VendorCategory } from "@/lib/types";

const STATUS_FILTERS: { label: string; value: VendorStatus | "ALL" }[] = [
  { label: "All statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const STATUS_BADGE_VARIANT: Record<VendorStatus, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
};

export default function AdminAllVendorsPage() {
  const [status, setStatus] = useState<VendorStatus | "ALL">("ALL");
  const [category, setCategory] = useState<VendorCategory | "ALL">("ALL");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-all-vendors", status, category],
    queryFn: () =>
      getAllVendors({
        status: status === "ALL" ? undefined : status,
        category: category === "ALL" ? undefined : category,
        limit: 100,
      }),
  });

  const vendors = data?.vendors ?? [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">All vendors</h1>
        <p className="text-muted-foreground">
          Every vendor that has onboarded to Nkwado, regardless of vetting status.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as VendorStatus | "ALL")}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => setCategory(v as VendorCategory | "ALL")}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {Object.values(VendorCategory).map((c) => (
              <SelectItem key={c} value={c}>
                {VENDOR_CATEGORY_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {isError && <p className="text-sm text-destructive">Couldn&apos;t load vendors.</p>}
      {!isLoading && !isError && vendors.length === 0 && (
        <p className="text-muted-foreground">No vendors match these filters.</p>
      )}

      {!isLoading && vendors.length > 0 && (
        <div className="space-y-3">
          {vendors.map((vendor) => (
            <Card key={vendor.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{vendor.businessName}</CardTitle>
                    <Badge variant={STATUS_BADGE_VARIANT[vendor.status]}>{vendor.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category}
                    {vendor.location ? ` · ${vendor.location}` : ""} · {vendor.contactName} (
                    {vendor.contactEmail})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Onboarded {new Date(vendor.createdAt).toLocaleDateString()}
                    {vendor.reviewCount > 0 && vendor.rating !== null
                      ? ` · ${vendor.rating.toFixed(1)}★ (${vendor.reviewCount})`
                      : ""}
                  </p>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {data && (
        <p className="mt-4 text-xs text-muted-foreground">
          Showing {vendors.length} of {data.pagination.total} vendor{data.pagination.total === 1 ? "" : "s"}.
        </p>
      )}
    </div>
  );
}
