'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { logout } from '@/store/slices/authSlice';

export function useAppAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { session, organization, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('session');
    dispatch(logout());
  };

  return {
    session,
    organization,
    token,
    isLoading,
    error,
    isAuthenticated: !!session && !!token,
    logout: handleLogout,
  };
}
