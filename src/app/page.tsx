"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { LandingPage } from "@/components/landing/LandingPage";
import { dashboardPathForRole, useAuth } from "@/lib/use-auth";

export default function Home() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.replace(dashboardPathForRole(currentUser.role));
    }
  }, [isAuthenticated, currentUser, router]);

  if (isAuthenticated) {
    return null;
  }

  return <LandingPage />;
}
