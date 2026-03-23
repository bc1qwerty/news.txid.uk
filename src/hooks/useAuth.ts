"use client";

import { useState, useEffect, useCallback } from "react";
import { API_URL } from "@/lib/constants";

export interface AuthUser {
  authenticated: boolean;
  pubkey?: string;
  displayName?: string;
  isAdmin?: boolean;
  csrfToken?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
      const data = await res.json();
      setUser(data);
    } catch {
      setUser({ authenticated: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  return { user, loading, refresh: check };
}
