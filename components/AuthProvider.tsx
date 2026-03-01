"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const AUTH_TOKEN_KEY = "aurora_app_token";

export interface AppUser {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
}

interface AuthState {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  setSession: (token: string, user: AppUser) => void;
  signOut: () => Promise<void>;
  fetchSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    loading: true,
  });

  const fetchSession = useCallback(async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setState((s) => ({ ...s, user: null, token: null, loading: false }));
      return;
    }
    try {
      const res = await fetch("/api/auth/session", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = (await res.json()) as { user: AppUser };
        setState((s) => ({ ...s, user: data.user, token, loading: false }));
      } else {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setState((s) => ({ ...s, user: null, token: null, loading: false }));
      }
    } catch {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      setState((s) => ({ ...s, user: null, token: null, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const setSession = useCallback((token: string, user: AppUser) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    }
    setState((s) => ({ ...s, user, token, loading: false }));
  }, []);

  const signOut = useCallback(async () => {
    const token = state.token ?? (typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null);
    if (token) {
      try {
        await fetch("/api/auth/signout", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // ignore
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setState((s) => ({ ...s, user: null, token: null }));
  }, [state.token]);

  const value: AuthContextValue = {
    ...state,
    setSession,
    signOut,
    fetchSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
