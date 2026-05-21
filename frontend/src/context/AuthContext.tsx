"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { AuthUser } from "@/lib/auth";
import { getStoredUser, getToken, clearAuth, fetchMe } from "@/lib/auth";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  isLoggedIn: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isLoggedIn: false,
  setUser: () => {},
  logout: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Use stored user immediately for fast UI
    const stored = getStoredUser();
    if (stored) setUser(stored);

    // Verify with backend in background
    try {
      const me = await fetchMe();
      setUser(me);
    } catch {
      // Token expired or invalid
      clearAuth();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    window.location.href = "/landing";
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isLoggedIn: !!user,
      setUser,
      logout,
      refresh: loadUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
