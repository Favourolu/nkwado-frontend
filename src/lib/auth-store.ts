import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

interface AuthState {
  currentUser: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      setAuth: (user, token) => set({ currentUser: user, token }),
      clearAuth: () => set({ currentUser: null, token: null }),
    }),
    {
      name: "nkwado-auth",
    }
  )
);
