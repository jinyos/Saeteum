'use client';

import { refreshAccessToken } from '@/lib/auth/authorizedFetch';
import {
  getAccessToken,
  setAccessToken,
  subscribeToAccessToken,
} from '@/lib/auth/tokenStore';
import { createContext, useContext, useEffect, useState } from 'react';

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(
    () => subscribeToAccessToken((token) => setIsAuthenticated(!!token)),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    refreshAccessToken()
      .then((token) => {
        setAccessToken(token);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
