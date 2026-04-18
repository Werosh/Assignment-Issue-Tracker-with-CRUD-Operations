import { create } from "zustand";
import type { UserPublic } from "../types/issue";
import * as authApi from "../api/auth";
import { ApiError } from "../api/http";

const STORAGE_KEY = "issue-tracker-auth";

interface StoredAuth {
  token: string;
  user: UserPublic;
}

function readStored(): StoredAuth | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredAuth;
    if (!data?.token) return null;
    return data;
  } catch {
    return null;
  }
}

function writeStored(data: StoredAuth | null) {
  if (typeof localStorage === "undefined") return;
  if (!data) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("auth_token");
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  localStorage.setItem("auth_token", data.token);
}

function initialSession(): { token: string | null; user: UserPublic | null } {
  const s = readStored();
  if (s) {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("auth_token", s.token);
    }
    return { token: s.token, user: s.user };
  }
  return { token: null, user: null };
}

const hydrated = initialSession();

interface AuthState {
  token: string | null;
  user: UserPublic | null;
  loading: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: hydrated.token,
  user: hydrated.user,
  loading: false,
  error: null,

  bootstrap: async () => {
    const token = get().token ?? readStored()?.token ?? null;
    if (!token) {
      writeStored(null);
      set({ user: null, token: null, loading: false });
      return;
    }
    localStorage.setItem("auth_token", token);
    set({ loading: true, error: null });
    try {
      const { user } = await authApi.fetchMe();
      const next = { token, user };
      writeStored(next);
      set({ ...next, loading: false });
    } catch (e) {
      const status = e instanceof ApiError ? e.status : 0;
      if (status === 401 || status === 403) {
        writeStored(null);
        set({ user: null, token: null, loading: false });
      } else {
        set({ loading: false });
      }
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authApi.login({ email, password });
      const next = { token, user };
      writeStored(next);
      set({ ...next, loading: false });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Login failed";
      set({ loading: false, error: msg });
      throw e;
    }
  },

  register: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await authApi.register({ email, password, name });
      const next = { token, user };
      writeStored(next);
      set({ ...next, loading: false });
    } catch (e) {
      const msg =
        e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Registration failed";
      set({ loading: false, error: msg });
      throw e;
    }
  },

  logout: () => {
    writeStored(null);
    set({ token: null, user: null });
  },

  clearError: () => set({ error: null }),
}));
