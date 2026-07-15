"use client";

import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getVendorDetails } from "@/lib/customer-api";
import { VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/lib/types";

export function VendorDetailsDialog({
  vendorId,
  onOpenChange,
}: {
  vendorId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ["vendor-details", vendorId],
    queryFn: () => getVendorDetails(vendorId as string),
    enabled: Boolean(vendorId),
  });

  return (
    <Dialog open={Boolean(vendorId)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{vendor?.businessName ?? "Vendor details"}</DialogTitle>
          {vendor && (
            <DialogDescription>
              {VENDOR_CATEGORY_LABELS[vendor.category as VendorCategory] ?? vendor.category}
              {vendor.location ? ` · ${vendor.location}` : ""}
            </DialogDescription>
          )}
        </DialogHeader>

        {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {isError && (
          <p className="text-sm text-destructive">
            Couldn&apos;t load this vendor&apos;s details. Please try again.
          </p>
        )}

        {vendor && (
          <div className="space-y-4">
            {vendor.rating != null && (
              <p className="text-sm text-muted-foreground">
                {vendor.rating.toFixed(1)} ★ ({vendor.reviewCount ?? 0} reviews)
              </p>
            )}

            {vendor.description && <p className="text-sm">{vendor.description}</p>}

            {vendor.priceRange && (
              <p className="text-sm">
                <span className="font-medium">Price range:</span> {vendor.priceRange}
              </p>
            )}

            {vendor.services && vendor.services.length > 0 && (
              <div>
                <p className="text-sm font-medium">Services offered</p>
                <p className="text-sm text-muted-foreground">{vendor.services.join(", ")}</p>
              </div>
            )}

            {vendor.photos && vendor.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {vendor.photos.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={vendor.businessName}
                    className="aspect-square rounded-md object-cover"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
