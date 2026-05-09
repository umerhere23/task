'use client';

import { useState, type FormEvent } from 'react';
import { LoadingSpinner, ErrorAlert, SuccessAlert } from '@/components/ui/UI';

interface SignupFormData {
  organizationName: string;
  organizationSlug: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  adminPasswordConfirm: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface OrganizationSignupFormProps {
  onSuccess?: (data: { organization: { id: string; name: string; slug: string }; admin: { id: string; name: string; email: string } }) => void;
}

function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password),
  };
}

export function OrganizationSignupForm({ onSuccess }: OrganizationSignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData>({
    organizationName: '',
    organizationSlug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPasswordConfirm: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, adminPassword: password });
    setPasswordValidation(validatePassword(password));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Client-side validation
    if (formData.adminPassword !== formData.adminPasswordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (!Object.values(passwordValidation).every(Boolean)) {
      setError('Password does not meet all requirements');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.organizationName,
          slug: formData.organizationSlug,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create organization' }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setSuccess(true);
      setFormData({
        organizationName: '',
        organizationSlug: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        adminPasswordConfirm: '',
      });

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create organization');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const allPasswordRequirementsMet = Object.values(passwordValidation).every(Boolean);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} />}
      {success && <SuccessAlert message="Organization created successfully!" />}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
        <input
          type="text"
          required
          placeholder="Your Organization"
          value={formData.organizationName}
          onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Organization Slug</label>
        <input
          type="text"
          required
          placeholder="your-organization"
          value={formData.organizationSlug}
          onChange={(e) => setFormData({ ...formData, organizationSlug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          pattern="^[a-z0-9-]+$"
          title="Only lowercase letters, numbers, and hyphens allowed"
        />
        <p className="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
        <input
          type="text"
          required
          placeholder="John Doe"
          value={formData.adminName}
          onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
        <input
          type="email"
          required
          placeholder="admin@example.com"
          value={formData.adminEmail}
          onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <input
            type={showAdminPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={formData.adminPassword}
            onChange={handlePasswordChange}
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowAdminPassword((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            {showAdminPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="mt-2 space-y-1 text-xs">
          <div className={`flex items-center gap-2 ${passwordValidation.minLength ? 'text-green-600' : 'text-gray-500'}`}>
            <span>{passwordValidation.minLength ? '✓' : '○'}</span>
            <span>At least 8 characters</span>
          </div>
          <div className={`flex items-center gap-2 ${passwordValidation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
            <span>{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
            <span>One uppercase letter (A-Z)</span>
          </div>
          <div className={`flex items-center gap-2 ${passwordValidation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
            <span>{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
            <span>One lowercase letter (a-z)</span>
          </div>
          <div className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
            <span>{passwordValidation.hasNumber ? '✓' : '○'}</span>
            <span>One number (0-9)</span>
          </div>
          <div className={`flex items-center gap-2 ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
            <span>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
            <span>One special character (!@#$%^&*)</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            required
            placeholder="••••••••"
            value={formData.adminPasswordConfirm}
            onChange={(e) => setFormData({ ...formData, adminPasswordConfirm: e.target.value })}
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((current) => !current)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            {showConfirmPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {formData.adminPassword && formData.adminPasswordConfirm && (
          <p className={`text-xs mt-1 ${formData.adminPassword === formData.adminPasswordConfirm ? 'text-green-600' : 'text-red-600'}`}>
            {formData.adminPassword === formData.adminPasswordConfirm ? '✓ Passwords match' : '✗ Passwords do not match'}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !allPasswordRequirementsMet}
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Creating Organization...
          </>
        ) : (
          'Create Organization'
        )}
      </button>
    </form>
  );
}
