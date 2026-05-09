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
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Setup</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Create organization</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Set up your organization and admin account.</p>
          </div>

          {showSuccess && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-800">Organization created successfully.</p>
              <p className="mt-1 text-xs text-emerald-700">Redirecting to login...</p>
            </div>
          )}

          {!showSuccess && <OrganizationSignupForm onSuccess={handleSignupSuccess} />}

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an organization?{' '}
              <a href="/login" className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-500">
                Login here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Your data is secure and encrypted</p>
        </div>
      </div>
    </main>
  );
}
