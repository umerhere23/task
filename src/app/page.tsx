'use client';

import { useApp } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { organizationId, clearAuth } = useApp();

  useEffect(() => {
    if (!organizationId) {
      router.push('/login');
    }
  }, [organizationId, router]);

  if (!organizationId) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center">
        <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">CRM system</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Open the part of the workspace you need. The layout stays simple, with the important actions up front.
              </p>
            </div>
            <button
              onClick={() => clearAuth()}
              className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Logout
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Link href="/customers" className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">Customers</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Manage customer relationships.</p>
            </Link>

            <Link href="/users" className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">Team</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Manage team members and roles.</p>
            </Link>

            <Link href="/activity" className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300 hover:bg-slate-50">
              <h2 className="text-base font-semibold text-slate-900">Activity</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Review recent workspace activity.</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
