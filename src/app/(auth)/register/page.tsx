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
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Organization</h1>
            <p className="text-sm text-gray-600 mt-2">Set up your organization and admin account</p>
          </div>

          {showSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-800">✓ Organization created successfully!</p>
              <p className="text-xs text-green-700 mt-1">Redirecting to login...</p>
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
          <p>Your data is secure and encrypted</p>
        </div>
      </div>
    </main>
  );
}
