import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setHasHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      hasHydrated: false,
      setAuth: (user, token) => set({ currentUser: user, token }),
      clearAuth: () => set({ currentUser: null, token: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "nkwado-auth",
      partialize: (state) => ({ currentUser: state.currentUser, token: state.token }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
