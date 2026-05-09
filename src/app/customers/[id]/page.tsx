'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { LoadingSpinner, ErrorAlert } from '@/components/ui/UI';
import styles from './CustomerDetail.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organizationId: string;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  createdAt: string;
  updatedAt: string;
  notes?: any[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function CustomerDetailPage() {
  const { organizationId } = useApp();
  const api = useApiClient();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    void loadCustomer();
    void loadUsers();
  }, [customerId, organizationId]);

  const loadCustomer = async () => {
    if (!customerId || !organizationId) return;

    try {
      const data = await api.getCustomer(customerId);
      setCustomer(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load customer');
    }
  };

  const loadUsers = async () => {
    if (!organizationId) return;

    try {
      const data = await api.listUsers();
      setUsers(data);
    } catch (err: unknown) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (assignedToId: string) => {
    if (!customer) return;

    setAssigning(true);
    setError(null);

    try {
      const updated = await api.assignCustomer(customer.id, assignedToId);
      setCustomer(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to assign customer');
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!customer) return <div>Customer not found</div>;

  return (
    <AppShell 
      title={customer.name} 
      subtitle="View and manage customer details and assignments"
    >
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2>Customer Information</h2>
          </div>
          
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Name</label>
              <p>{customer.name}</p>
            </div>
            
            <div className={styles.field}>
              <label>Email</label>
              <p>{customer.email}</p>
            </div>
            
            <div className={styles.field}>
              <label>Phone</label>
              <p>{customer.phone || 'Not provided'}</p>
            </div>
            
            <div className={styles.field}>
              <label>Assigned To</label>
              <div className={styles.assignment}>
                <p>{customer.assignedTo?.name || 'Unassigned'}</p>
                <select 
                  value={customer.assignedToId || ''} 
                  onChange={(e) => handleAssign(e.target.value)}
                  disabled={assigning}
                  className={styles.select}
                >
                  <option value="">Unassign</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.field}>
              <label>Created</label>
              <p>{new Date(customer.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
