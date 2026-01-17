import React, { createContext, useContext, useEffect, useState } from "react";

type AuthUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  avatar_url?: string | null;
  created_at: string;
};

type AuthState =
  | { status: "loading" }
  | { status: "authed"; user: AuthUser }
  | { status: "unauthed" };

type AuthContextValue = {
  auth: AuthState;
  refreshAuth: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe() {
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  // Kies jouw Symfony endpoint:
  // Vaak: GET /api/me of /api/user of /api/profile
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) return null;
  if (!res.ok) throw new Error(`Auth check failed: ${res.status}`);
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: "loading" });

  const refreshAuth = async () => {
    setAuth({ status: "loading" });
    const user = await fetchMe();
    if (user) {
      setAuth({ status: "authed", user });
      return;
    }

    localStorage.removeItem("auth_token");
    setAuth({ status: "unauthed" });
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setAuth({ status: "unauthed" });
  };

  useEffect(() => {
    void refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ auth, refreshAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
