'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrganizationSignupForm } from '@/components/forms/OrganizationSignupForm';

export default function RegisterPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSignupSuccess = (data: any) => {
    setShowSuccess(true);
    // Redirect after a short delay
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create organization</h1>
            <p className="mt-2 text-sm text-gray-600">Set up your organization and admin account.</p>
          </div>

          {showSuccess && (
            <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">Organization created successfully.</p>
              <p className="mt-1 text-xs text-emerald-700">Redirecting to login...</p>
            </div>
          )}

          {!showSuccess && <OrganizationSignupForm onSuccess={handleSignupSuccess} />}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an organization?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure organization setup powered by encryption</p>
        </div>
      </div>
    </main>
  );
}
