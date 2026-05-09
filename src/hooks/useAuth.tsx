'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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

  const setAuth = useCallback((nextUserId: string, orgId: string, role: string, name: string) => {
    setUserId(nextUserId);
    setOrganizationId(orgId);
    setUserRole(role);
    setUserName(name);
    localStorage.setItem('auth', JSON.stringify({ userId: nextUserId, orgId, role, name }));
  }, []);

  const clearAuth = useCallback(() => {
    setUserId(null);
    setOrganizationId(null);
    setUserRole(null);
    setUserName(null);
    localStorage.removeItem('auth');
  }, []);

  React.useEffect(() => {
    const stored = localStorage.getItem('auth');
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as {
        userId: string;
        orgId: string;
        role: string;
        name: string;
      };
      setAuth(parsed.userId, parsed.orgId, parsed.role, parsed.name);
    } catch {
      localStorage.removeItem('auth');
    }
  }, [setAuth]);

  const contextValue = useMemo(
    () => ({
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
    }),
    [userId, organizationId, userRole, userName, setAuth, clearAuth, isLoading, error]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

export function useApiClient() {
  const { userId, organizationId, userRole, userName } = useApp();

  return useMemo(
    () =>
      createApiClient({
        userId: userId || undefined,
        userName: userName || undefined,
        organizationId: organizationId || undefined,
        userRole: userRole || undefined,
      }),
    [userId, organizationId, userRole, userName]
  );
}
