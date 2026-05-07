'use client';

import { useState, type FormEvent } from 'react';
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '@/components/ui/UI';

interface ForgotPasswordFormData {
  slug: string;
  email: string;
}

interface UserDetails {
  name: string;
  email: string;
  role: string;
}

interface OrganizationForgotPasswordFormProps {
  onBack?: () => void;
}

export function OrganizationForgotPasswordForm({ onBack }: OrganizationForgotPasswordFormProps) {
  const [step, setStep] = useState<'form' | 'details'>('form');
  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    slug: '',
    email: '',
  });

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/organizations/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: formData.slug,
          email: formData.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'User not found' }));
        throw new Error(errorData.error || 'User not found');
      }

      const data = await response.json();
      setUserDetails(data.user);
      setStep('details');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to retrieve account details');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'details' && userDetails) {
    return (
      <div className="space-y-4">
        <SuccessAlert message="Account found! Here are your details:" />

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
              {userDetails.name}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
              {userDetails.email}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
            <div className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 capitalize">
              {userDetails.role}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p className="font-medium mb-2">Password Reset Instructions:</p>
            <p>Please contact your organization administrator to reset your password, or use the password reset email link if you have already requested one.</p>
          </div>
        </div>

        <button
          onClick={() => {
            setStep('form');
            setUserDetails(null);
            setFormData({ slug: '', email: '' });
            if (onBack) onBack();
          }}
          className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Slug</label>
        <input
          type="text"
          required
          placeholder="your-organization"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          pattern="^[a-z0-9-]+$"
          title="Only lowercase letters, numbers, and hyphens allowed"
        />
        <p className="text-xs text-gray-500 mt-1">The unique identifier for your organization</p>
      </div>

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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Retrieving...
          </>
        ) : (
          'Retrieve Account Details'
        )}
      </button>

      <div className="pt-4 text-center">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            Back to Login
          </button>
        )}
      </div>
    </form>
  );
}
