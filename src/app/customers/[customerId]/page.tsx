'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { CustomerForm } from '@/components/forms/CustomerForm';

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams() as { customerId?: string };
  const id = params.customerId;
  const api = useApiClient();
  const { organizationId } = useApp();

  const [customer, setCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (!id || !organizationId) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getCustomer(id);
        setCustomer(data);
        const list = await api.listUsers();
        setUsers(list || []);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, organizationId]);

  const handleUpdate = async (formData: any) => {
    if (!id) return;
    setSaving(true);
    try {
      const updated = await api.updateCustomer(id, formData);
      setCustomer(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (assignedToId: string) => {
    if (!id) return;
    setAssigning(true);
    try {
      const updated = await api.assignCustomer(id, assignedToId);
      setCustomer(updated);
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    await api.deleteCustomer(id);
    router.push('/customers');
  };

  if (!organizationId) {
    return <div className="p-8">Please set up your organization first</div>;
  }

  if (loading) return <div className="p-8">Loading…</div>;
  if (!customer) return <div className="p-8">Customer not found</div>;

  return (
    <AppShell title={customer.name || 'Customer'} subtitle={`Customer details — ${customer.email}`}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomerForm customer={customer} onSubmit={handleUpdate} isLoading={saving} />
        </div>

        <aside>
          <div className="p-4 border rounded">
            <p className="text-sm text-gray-600">Assigned to</p>
            <div className="mt-2">
              <select
                value={customer.assignedToId || ''}
                onChange={(e) => void handleAssign(e.target.value)}
                className="w-full p-2 border rounded"
                disabled={assigning}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <button onClick={() => void handleDelete()} className="w-full bg-red-600 text-white py-2 rounded">Delete customer</button>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
