'use client';

import { useState, useEffect } from 'react';
import { useApiClient } from '@/hooks/useAuth';
import styles from './EditUserModal.module.css';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface EditUserModalProps {
  user: User | null;
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EditUserModal({ user, mode, isOpen, onClose, onUpdate }: EditUserModalProps) {
  const api = useApiClient();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member' as 'admin' | 'member',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCreateMode = mode === 'create';

  useEffect(() => {
    if (user && !isCreateMode) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role as 'admin' | 'member',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'member',
      });
    }
    setError(null);
  }, [isCreateMode, user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      if (isCreateMode) {
        await api.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      } else {
        if (!user) return;
        await api.updateUser(user.id, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        });
      }

      onUpdate();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : isCreateMode ? 'Failed to create user' : 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{isCreateMode ? 'Add User' : 'Edit User'}</h2>
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
              placeholder="Jane Doe"
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
              placeholder="jane@company.com"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'member' })}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {isCreateMode && (
            <div className={styles.field}>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set an initial password"
              />
            </div>
          )}

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
              {submitting ? (isCreateMode ? 'Creating...' : 'Updating...') : (isCreateMode ? 'Create User' : 'Update User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
