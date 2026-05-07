'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { OrganizationLoginForm } from '@/components/forms/OrganizationLoginForm';

export default function LoginPage() {
  const router = useRouter();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLoginSuccess = (data: any) => {
    // Redirect to dashboard or main app page
    router.push('/dashboard');
  };

  if (showForgotPassword) {
    router.push('/forgot-password');
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border bg-white p-8 shadow-lg">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Login</h1>
            <p className="text-sm text-gray-600 mt-2">Access your organization account</p>
          </div>

          <OrganizationLoginForm onSuccess={handleLoginSuccess} onForgotPassword={() => setShowForgotPassword(true)} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an organization?{' '}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-700 hover:underline">
                Create one
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure login powered by encryption</p>
        </div>
      </div>
    </main>
  );
}
