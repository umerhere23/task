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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">CRM System</h1>
          <button
            onClick={() => clearAuth()}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/customers"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900">Customers</h2>
            <p className="text-gray-600">Manage customer relationships</p>
          </Link>

          <Link
            href="/users"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900">Team</h2>
            <p className="text-gray-600">Manage team members</p>
          </Link>

          <Link
            href="/activity"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-2 text-gray-900">Activity</h2>
            <p className="text-gray-600">View system activity logs</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
