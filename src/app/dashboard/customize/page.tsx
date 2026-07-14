"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { customizeRequest, getRequest, type MatchedVendor } from "@/lib/customer-api";
import { formatNaira } from "@/lib/format";
import { BUDGET_RANGE_MAX } from "@/lib/types";

export default function CustomizePage() {
  return (
    <Suspense fallback={null}>
      <Customize />
    </Suspense>
  );
}

function groupByCategory(vendors: MatchedVendor[]) {
  return vendors.reduce<Record<string, MatchedVendor[]>>((acc, vendor) => {
    (acc[vendor.category] ??= []).push(vendor);
    return acc;
  }, {});
}

function Customize() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");

  const { data: request, isLoading } = useQuery({
    queryKey: ["customer-request", requestId],
    queryFn: () => getRequest(requestId as string),
    enabled: Boolean(requestId),
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (request?.aiMatchedVendors) {
      setSelectedIds(new Set(request.aiMatchedVendors.map((v) => v.vendorId)));
    }
  }, [request?.aiMatchedVendors]);

  const mutation = useMutation({
    mutationFn: () =>
      customizeRequest(requestId as string, {
        selectedVendorIds: Array.from(selectedIds),
        notes: notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Selection saved");
      router.push(`/dashboard/quotes?requestId=${requestId}`);
    },
    onError: () => {
      toast.error("Couldn't save your selection. Please try again.");
    },
  });

  if (!requestId) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center">
        <p className="text-muted-foreground">Missing request.</p>
      </div>
    );
  }

  const vendors = request?.aiMatchedVendors ?? [];
  const grouped = groupByCategory(vendors);
  const subtotal = vendors
    .filter((v) => selectedIds.has(v.vendorId))
    .reduce((sum, v) => sum + v.basePrice, 0);
  const budgetMax = request ? BUDGET_RANGE_MAX[request.budgetRange] : Infinity;
  const overBudget = subtotal > budgetMax;

  const toggleVendor = (vendorId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(vendorId)) {
        next.delete(vendorId);
      } else {
        next.add(vendorId);
      }
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Customize your vendors</h1>
        <p className="text-muted-foreground">
          Add or remove vendors from your matched selection.
        </p>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryVendors]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-base">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categoryVendors.map((vendor) => (
                  <label
                    key={vendor.vendorId}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedIds.has(vendor.vendorId)}
                        onCheckedChange={() => toggleVendor(vendor.vendorId)}
                      />
                      <div>
                        <p className="font-medium">{vendor.businessName}</p>
                        <p className="text-sm text-muted-foreground">{vendor.reason}</p>
                      </div>
                    </div>
                    <p className="whitespace-nowrap font-medium">
                      {formatNaira(vendor.basePrice)}
                    </p>
                  </label>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="notes">
              Notes for vendors
            </label>
            <Textarea
              id="notes"
              placeholder="Prefer evening setup for catering"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Card>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-xl font-semibold">{formatNaira(subtotal)}</p>
              </div>
              <CardDescription
                className={overBudget ? "font-medium text-destructive" : "font-medium text-green-600"}
              >
                {overBudget ? "Over your budget" : "Within your budget"}
              </CardDescription>
            </CardContent>
          </Card>

          <Button
            className="w-full"
            disabled={mutation.isPending || selectedIds.size === 0}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Saving..." : "Save selection"}
          </Button>
        </div>
      )}
    </div>
  );
}
