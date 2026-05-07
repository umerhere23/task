'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { createApiClient } from '@/lib/api-client';

export interface AppContextType {
  userId: string | null;
  organizationId: string | null;
  userRole: string | null;
  userName: string | null;
  setAuth: (userId: string, orgId: string, role: string, name: string) => void;
  clearAuth: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = useCallback(
    (userId: string, orgId: string, role: string, name: string) => {
      setUserId(userId);
      setOrganizationId(orgId);
      setUserRole(role);
      setUserName(name);
      localStorage.setItem('auth', JSON.stringify({ userId, orgId, role, name }));
    },
    []
  );

  const clearAuth = useCallback(() => {
    setUserId(null);
    setOrganizationId(null);
    setUserRole(null);
    setUserName(null);
    localStorage.removeItem('auth');
  }, []);

  // Load auth from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      try {
        const { userId, orgId, role, name } = JSON.parse(stored);
        setAuth(userId, orgId, role, name);
      } catch (e) {
        localStorage.removeItem('auth');
      }
    }
  }, [setAuth]);

  return (
    <AppContext.Provider
      value={{
        userId,
        organizationId,
        userRole,
        userName,
        setAuth,
        clearAuth,
        isLoading,
        setIsLoading,
        error,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function useApiClient() {
  const { userId, organizationId, userRole } = useApp();
  return createApiClient({
    userId: userId || undefined,
    organizationId: organizationId || undefined,
    userRole: userRole || undefined,
  });
}
