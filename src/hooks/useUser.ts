'use client';

import { useMemo } from 'react';
import { useApp } from '@/hooks/useAuth';

export function useUser() {
  const { userId, userName, userRole, organizationId } = useApp();

  return useMemo(
    () => ({
      id: userId,
      name: userName,
      role: userRole,
      organizationId,
      isAuthenticated: Boolean(userId && organizationId),
    }),
    [userId, userName, userRole, organizationId]
  );
}
