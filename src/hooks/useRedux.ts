import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector;

export function useAuth() {
  const dispatch = useAppDispatch();
  const { session, organization, isLoading, error } = useAppSelector((state: RootState) => state.auth);

  return {
    session,
    organization,
    isLoading,
    error,
    dispatch,
    isLoggedIn: !!session,
  };
}
