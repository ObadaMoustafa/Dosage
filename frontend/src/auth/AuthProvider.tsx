import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi, type AuthUser } from '@/lib/api';

type AuthState =
  | { status: 'loading' }
  | { status: 'authed'; user: AuthUser }
  | { status: 'unauthed' };

type AuthContextValue = {
  auth: AuthState;
  refreshAuth: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' });

  const refreshAuth = async () => {
    setAuth({ status: 'loading' });
    const user = await authApi.me();
    if (user) {
      setAuth({ status: 'authed', user });
      return;
    }

    localStorage.removeItem('token');
    setAuth({ status: 'unauthed' });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ status: 'unauthed' });
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
