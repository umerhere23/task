'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { LoadingSpinner, ErrorAlert } from '@/components/ui/UI';
import { CustomerDTO, CreateCustomerDTO } from '@/types';
import styles from './CustomerForm.module.css';

interface CustomerFormProps {
  customer?: CustomerDTO;
  onSubmit: (data: CreateCustomerDTO) => Promise<void>;
  isLoading?: boolean;
}

export function CustomerForm({ customer, onSubmit, isLoading = false }: CustomerFormProps) {
  const [formData, setFormData] = useState<CreateCustomerDTO>({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) {
      return;
    }

    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
    });
  }, [customer]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      await onSubmit(formData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        return;
      }
      setError('Failed to submit customer form');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {error && <ErrorAlert message={error} />}

      <div className={styles.field}>
        <label htmlFor="customer-name" className={styles.label}>Name</label>
        <input
          id="customer-name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="customer-email" className={styles.label}>Email</label>
        <input
          id="customer-email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={styles.input}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="customer-phone" className={styles.label}>Phone (Optional)</label>
        <input
          id="customer-phone"
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={styles.input}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={styles.submitButton}
      >
        {isLoading ? (
          <>
            <LoadingSpinner />
            Saving...
          </>
        ) : (
          customer ? 'Update Customer' : 'Create Customer'
        )}
      </button>
    </form>
  );
}
