'use client';

import { CustomerList } from '@/components/shared/CustomerList';
import { AppShell } from '@/components/layout/AppShell';
import { useApp } from '@/hooks/useAuth';
import styles from './page.module.css';

export default function CustomersPage() {
  const { organizationId } = useApp();

  if (!organizationId) {
    return <div className={styles.emptyState}>Please set up your organization first.</div>;
  }

  return (
    <AppShell title="Customers" subtitle="Manage customer records without the clutter.">
      <div className={styles.introCard}>
        <p className={styles.kicker}>Directory</p>
        <p className={styles.description}>
          Search, assign, restore, and manage customer records from a compact list that stays readable on mobile.
        </p>
      </div>
      <CustomerList />
    </AppShell>
  );
}
