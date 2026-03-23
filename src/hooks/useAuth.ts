"use client";

import { useState, useEffect, useCallback } from "react";

const API = "https://api.txid.uk";

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
      const res = await fetch(`${API}/auth/me`, { credentials: "include" });
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
