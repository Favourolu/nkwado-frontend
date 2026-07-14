"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { dashboardPathForRole, useAuth } from "@/lib/use-auth";

export default function Home() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      router.replace(dashboardPathForRole(currentUser.role));
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, currentUser, router]);

  return null;
}
