import { useAuthStore } from "./auth-store";
import type { Role } from "./types";

export function useAuth() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return {
    currentUser,
    token,
    isAuthenticated: Boolean(token),
    hasHydrated,
    setAuth,
    clearAuth,
  };
}

export function dashboardPathForRole(role: Role): string {
  switch (role) {
    case "VENDOR":
      return "/vendor/dashboard";
    case "ADMIN":
      return "/admin/dashboard";
    case "CUSTOMER":
    default:
      return "/dashboard";
  }
}
