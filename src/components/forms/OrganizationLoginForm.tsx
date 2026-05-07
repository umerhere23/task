'use client';

import { useState, type FormEvent } from 'react';
import { useDispatch } from 'react-redux';
import { LoadingSpinner, ErrorAlert } from '@/components/ui/UI';
import { loginSuccess } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface OrganizationLoginFormProps {
  onSuccess?: (data: { organization: { id: string; name: string; slug: string }; user: { id: string; name: string; email: string; role: string } }) => void;
  onForgotPassword?: () => void;
}

export function OrganizationLoginForm({ onSuccess, onForgotPassword }: OrganizationLoginFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/organizations/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(errorData.error || 'Invalid email or password');
      }

      const data = await response.json();

      // Store credentials if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('email', formData.email);
      } else {
        localStorage.removeItem('email');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);

      // Dispatch Redux action
      dispatch(
        loginSuccess({
          session: {
            userId: data.user.id,
            organizationId: data.organization.id,
            role: data.user.role,
            name: data.user.name,
          },
          organization: {
            id: data.organization.id,
            name: data.organization.name,
            slug: data.organization.slug,
          },
          token: data.token,
        })
      );

      // Store session in localStorage for persistence
      localStorage.setItem('session', JSON.stringify({
        userId: data.user.id,
        organizationId: data.organization.id,
        organizationSlug: data.organization.slug,
        userRole: data.user.role,
        userName: data.user.name,
      }));

      setFormData({
        email: '',
        password: '',
        rememberMe: false,
      });

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          placeholder="admin@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          type="password"
          required
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="rememberMe"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
            className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700">
            Remember email
          </label>
        </div>
        {onForgotPassword && (
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Forgot password?
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Logging in...
          </>
        ) : (
          'Login'
        )}
      </button>
    </form>
  );
}
