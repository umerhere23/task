'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OrganizationForgotPasswordForm } from '@/components/forms/OrganizationForgotPasswordForm';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/login');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
            <p className="text-sm text-gray-600 mt-2">Retrieve your account details using your organization and email</p>
          </div>

          <OrganizationForgotPasswordForm onBack={handleBack} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Login here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Account recovery is secure</p>
        </div>
      </div>
    </main>
  );
}
