'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/hooks/useAuth';
import styles from './EditCustomerModal.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  assignedToId: string | null;
  assignedToName: string | null;
}

interface EditCustomerModalProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditCustomerModal({ customer, isOpen, onClose, onUpdate }: EditCustomerModalProps) {
  const api = useApiClient();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone || '',
      });
    }
    setError(null);
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setSubmitting(true);
    setError(null);

    try {
      await api.updateCustomer(customer.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
      });
      onUpdate();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !customer) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Edit Customer</h2>
          <button onClick={onClose} className={styles.closeButton}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
