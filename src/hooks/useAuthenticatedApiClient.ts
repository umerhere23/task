'use client';

import { useAppAuth } from '@/hooks/useAppAuth';

export function useAuthenticatedApiClient() {
  const { token, organization, session } = useAppAuth();

  const makeRequest = async <T,>(
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown
  ): Promise<T> => {
    const url = `/api${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (organization?.id) {
      headers['x-org-id'] = organization.id;
    }

    if (session?.role) {
      headers['x-user-role'] = session.role;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  };

  return { makeRequest, token };
}
