'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { useApiClient, useApp } from '@/hooks/useAuth';
import styles from './page.module.css';

export default function NewCustomerPage() {
  const router = useRouter();
  const api = useApiClient();
  const { organizationId } = useApp();
  const [loading, setLoading] = useState(false);

  if (!organizationId) {
    return <div className={styles.emptyState}>Please set up your organization first.</div>;
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
    <AppShell title="New customer" subtitle="Create a simple record and move on.">
      <div className={styles.card}>
        <p className={styles.description}>
          Add the customer details you need now. You can assign and refine the record later.
        </p>
        <CustomerForm onSubmit={handleCreate} isLoading={loading} />
      </div>
    </AppShell>
  );
}
