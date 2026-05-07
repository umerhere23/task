'use client';

import { CustomerList } from '@/components/shared/CustomerList';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/hooks/useAuth';

export default function CustomersPage() {
  const { organizationId } = useApp();

  if (!organizationId) {
    return <div className="p-8">Please set up your organization first</div>;
  }

  return (
    <AppShell title="Customers" subtitle="Search, assign, restore, and manage customer records.">
      <CustomerList />
    </AppShell>
  );
}
