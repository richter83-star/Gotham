import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => {
        localStorage.setItem("access_token", accessToken);
        set({ user, accessToken });
      },
      clearAuth: () => {
        localStorage.removeItem("access_token");
        set({ user: null, accessToken: null });
      },
    }),
    { name: "casegraph-auth" }
  )
);

// Case queue filters
interface CaseFilters {
  status: string | null;
  priority: string | null;
  assignedTo: string | null;
  setFilter: (key: keyof Omit<CaseFilters, "setFilter" | "reset">, value: string | null) => void;
  reset: () => void;
}

export const useCaseFilters = create<CaseFilters>((set) => ({
  status: null,
  priority: null,
  assignedTo: null,
  setFilter: (key, value) => set({ [key]: value }),
  reset: () => set({ status: null, priority: null, assignedTo: null }),
}));
