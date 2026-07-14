"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { dashboardPathForRole, useAuth } from "@/lib/use-auth";
import type { Role } from "@/lib/types";

export function AuthGuard({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { currentUser, isAuthenticated, hasHydrated } = useAuth();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || !currentUser) {
      router.replace("/login");
      return;
    }
    if (currentUser.role !== role) {
      router.replace(dashboardPathForRole(currentUser.role));
    }
  }, [hasHydrated, isAuthenticated, currentUser, role, router]);

  if (!hasHydrated || !isAuthenticated || !currentUser || currentUser.role !== role) {
    return null;
  }

  return <>{children}</>;
}
