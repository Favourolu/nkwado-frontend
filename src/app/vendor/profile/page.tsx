"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getVendorProfile } from "@/lib/vendor-api";
import { VENDOR_CATEGORY_LABELS } from "@/lib/types";

function statusBadgeClass(status: string): string {
  switch (status) {
    case "APPROVED":
      return "bg-green-100 text-green-800";
    case "REJECTED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-yellow-100 text-yellow-800";
  }
}

export default function VendorProfilePage() {
  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: getVendorProfile,
    // Keep checking while the vendor is waiting on admin approval, so the
    // status updates without a manual refresh once a decision is made.
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 15000 : false),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {isError && (
        <div className="space-y-3 text-center">
          <p className="text-muted-foreground">
            You haven&apos;t completed onboarding yet.
          </p>
          <Link href="/vendor/onboard" className="text-sm underline underline-offset-4">
            Complete onboarding
          </Link>
        </div>
      )}

      {vendor && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{vendor.businessName}</CardTitle>
                <CardDescription>
                  {VENDOR_CATEGORY_LABELS[vendor.category] ?? vendor.category}
                  {vendor.location ? ` · ${vendor.location}` : ""}
                </CardDescription>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass(vendor.status)}`}
              >
                {vendor.status}
              </span>
            </CardHeader>
            <CardContent className="space-y-3">
              {vendor.status === "PENDING" && (
                <p className="text-sm text-muted-foreground">
                  Your account is under review. We&apos;ll notify you once it&apos;s approved.
                </p>
              )}
              {vendor.status === "REJECTED" && vendor.rejectionReason && (
                <p className="text-sm text-destructive">
                  Rejection reason: {vendor.rejectionReason}
                </p>
              )}
              {vendor.description && <p className="text-sm">{vendor.description}</p>}
              {vendor.phoneNumber && (
                <p className="text-sm text-muted-foreground">{vendor.phoneNumber}</p>
              )}
              {vendor.priceRange && (
                <p className="text-sm text-muted-foreground">{vendor.priceRange}</p>
              )}
              {vendor.services && vendor.services.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {vendor.services.join(", ")}
                </p>
              )}
              {typeof vendor.rating === "number" && (
                <p className="text-sm text-muted-foreground">
                  {vendor.rating.toFixed(1)} ★ ({vendor.reviewCount ?? 0} reviews)
                </p>
              )}
            </CardContent>
          </Card>

          {vendor.profilePhotos && vendor.profilePhotos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Profile photos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-2">
                {vendor.profilePhotos.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={url}
                    src={url}
                    alt={vendor.businessName}
                    className="aspect-square rounded-md object-cover"
                  />
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
