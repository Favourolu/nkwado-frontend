"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getVendorProfile } from "@/lib/vendor-api";

export default function VendorDashboardPage() {
  const { data: vendor, isLoading, isError } = useQuery({
    queryKey: ["vendor-profile"],
    queryFn: getVendorProfile,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (isError || !vendor) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Welcome to Nkwado</h1>
        <p className="max-w-md text-muted-foreground">
          Complete your business onboarding to start receiving customer inquiries.
        </p>
        <Button asChild size="lg">
          <Link href="/vendor/onboard">Complete onboarding</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Welcome back, {vendor.businessName}</h1>
        <p className="text-muted-foreground">Manage your inquiries, quotes, and bookings.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link href="/vendor/profile">Profile</Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link href="/vendor/inquiries">Inquiries</Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link href="/vendor/quotes">Quotes</Link>
        </Button>
        <Button asChild variant="outline" className="h-20 flex-col gap-1">
          <Link href="/vendor/bookings">Bookings</Link>
        </Button>
      </div>
    </div>
  );
}
