'use client';

import { CustomerList } from '@/components/shared/CustomerList';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/hooks/useAuth';

export default function CustomersPage() {
  const { organizationId } = useApp();

  if (!organizationId) {
    return <div className="p-8 text-slate-600">Please set up your organization first.</div>;
  }

  return (
    <AppShell title="Customers" subtitle="Manage customer records without the clutter.">
      <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Directory</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Search, assign, restore, and manage customer records from a compact list that stays readable on mobile.
        </p>
      </div>
      <CustomerList />
    </AppShell>
  );
}
