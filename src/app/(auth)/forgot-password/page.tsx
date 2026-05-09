'use client';

import { useRouter } from 'next/navigation';
import { OrganizationForgotPasswordForm } from '@/components/forms/OrganizationForgotPasswordForm';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recovery</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Forgot password?</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Retrieve your account details using your organization and email.</p>
          </div>

          <OrganizationForgotPasswordForm onBack={handleBack} />

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Remember your password?{' '}
              <a href="/login" className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-500">
                Login here
              </a>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-slate-500">
          <p>Account recovery is secure</p>
        </div>
      </div>
    </main>
  );
}
