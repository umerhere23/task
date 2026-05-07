import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthSession } from '@/types';

interface AuthState {
  session: AuthSession | null;
  organization: {
    id: string;
    name: string;
    slug: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  session: null,
  organization: null,
  token: null,
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ session: AuthSession; organization: { id: string; name: string; slug: string }; token: string }>) => {
      state.session = action.payload.session;
      state.organization = action.payload.organization;
      state.token = action.payload.token;
      state.isLoading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.session = null;
      state.organization = null;
      state.token = null;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSession: (state, action: PayloadAction<{ session: AuthSession; organization: { id: string; name: string; slug: string }; token: string }>) => {
      state.session = action.payload.session;
      state.organization = action.payload.organization;
      state.token = action.payload.token;
    },
  },
});

export const { loginRequest, loginSuccess, loginFailure, logout, clearError, setSession } = authSlice.actions;
export default authSlice.reducer;
