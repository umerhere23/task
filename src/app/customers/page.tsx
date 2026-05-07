'use client';

import { CustomerList } from '@/app/components/CustomerList';
import { useApp } from '@/app/store/AppContext';
import Link from 'next/link';

export default function CustomersPage() {
  const { organizationId } = useApp();

  if (!organizationId) {
    return <div className="p-8">Please set up your organization first</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium">Customers</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Customers</h1>
        <CustomerList />
      </main>
    </div>
  );
}
