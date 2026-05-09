'use client';

import { useEffect, useState, type SVGProps } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { useGlobalToast } from '@/hooks/useGlobalToast';
import { LoadingSpinner, ErrorAlert } from '@/components/ui/UI';
import { EditCustomerModal } from '@/components/modals/EditCustomerModal';
import { NotesPanel } from '@/components/modals/NotesPanel';
import styles from './CustomerDetail.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organizationId: string;
  assignedToId: string | null;
  assignedTo: { id: string; name: string; email: string } | null;
  assignedToName?: string | null;
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

type IconProps = SVGProps<SVGSVGElement>;

function BackIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h12" />
    </svg>
  );
}

function PencilIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function RefreshIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v6h-6" />
    </svg>
  );
}

export default function CustomerDetailPage() {
  const { organizationId } = useApp();
  const api = useApiClient();
  const { addToast } = useGlobalToast();
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
      const assignedUser = users.find((user) => user.id === assignedToId);
      setCustomer(updated);
      addToast('success', `Customer assigned to ${assignedUser?.name || 'user'} successfully`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to assign customer';
      setError(message);
      addToast('error', message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRefresh = () => {
    void loadCustomer();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />;
  if (!customer) return <div>Customer not found</div>;

  const actions = (
    <>
      <button type="button" onClick={() => router.back()} className={styles.actionButton}>
        <BackIcon className={styles.actionIcon} />
        Back
      </button>
      <button type="button" onClick={() => setShowEditModal(true)} className={styles.primaryButton}>
        <PencilIcon className={styles.actionIcon} />
        Edit customer
      </button>
      <button type="button" onClick={handleRefresh} className={styles.secondaryButton}>
        <RefreshIcon className={styles.actionIcon} />
        Refresh
      </button>
    </>
  );

  return (
    <AppShell
      title={customer.name}
      subtitle="View and manage customer details, assignments, and notes."
      actions={actions}
    >
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div>
              <p className={styles.kicker}>Profile</p>
              <h2>Customer information</h2>
            </div>
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
                  title="Assign customer to user"
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

        <NotesPanel
          customerId={customer.id}
          customerName={customer.name}
          onRefresh={handleRefresh}
        />
      </div>

      {showEditModal && (
        <EditCustomerModal
          customer={customer}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            void loadCustomer();
            setShowEditModal(false);
          }}
        />
      )}
    </AppShell>
  );
}
