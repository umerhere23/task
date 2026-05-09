'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { useApiClient, useApp } from '@/hooks/useAuth';

export default function NewCustomerPage() {
  const router = useRouter();
  const api = useApiClient();
  const { organizationId } = useApp();
  const [loading, setLoading] = useState(false);

  if (!organizationId) {
    return <div className="p-8">Please set up your organization first</div>;
  }

  const handleCreate = async (data: { name: string; email: string; phone?: string }) => {
    setLoading(true);
    try {
      const created = await api.createCustomer(data);
      router.push(`/customers/${created.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="New customer" subtitle="Create a new customer record for your organization.">
      <div className="max-w-2xl">
        <CustomerForm onSubmit={handleCreate} isLoading={loading} />
      </div>
    </AppShell>
  );
}
