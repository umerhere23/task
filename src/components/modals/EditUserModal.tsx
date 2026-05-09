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

interface PasswordValidation {
  minLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

function validatePassword(password: string): PasswordValidation {
  return {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*]/.test(password),
  };
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
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const isCreateMode = mode === 'create';

  const allPasswordRequirementsMet = Object.values(passwordValidation).every(Boolean);

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
      setPasswordValidation({
        minLength: false,
        hasUpperCase: false,
        hasLowerCase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });
      setShowPassword(false);
    }
    setError(null);
  }, [isCreateMode, user, isOpen]);

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const password = event.target.value;

    setFormData({ ...formData, password });
    setPasswordValidation(validatePassword(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreateMode && !allPasswordRequirementsMet) {
      setError('Password does not meet all requirements');
      return;
    }

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
              <div className={styles.passwordFieldWrap}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Set an initial password"
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className={styles.passwordToggle}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className={styles.passwordRules}>
                <div className={`${styles.passwordRule} ${passwordValidation.minLength ? styles.passwordRuleMet : ''}`}>
                  <span>{passwordValidation.minLength ? '✓' : '○'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div className={`${styles.passwordRule} ${passwordValidation.hasUpperCase ? styles.passwordRuleMet : ''}`}>
                  <span>{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                  <span>One uppercase letter (A-Z)</span>
                </div>
                <div className={`${styles.passwordRule} ${passwordValidation.hasLowerCase ? styles.passwordRuleMet : ''}`}>
                  <span>{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                  <span>One lowercase letter (a-z)</span>
                </div>
                <div className={`${styles.passwordRule} ${passwordValidation.hasNumber ? styles.passwordRuleMet : ''}`}>
                  <span>{passwordValidation.hasNumber ? '✓' : '○'}</span>
                  <span>One number (0-9)</span>
                </div>
                <div className={`${styles.passwordRule} ${passwordValidation.hasSpecialChar ? styles.passwordRuleMet : ''}`}>
                  <span>{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                  <span>One special character (!@#$%^&*)</span>
                </div>
              </div>
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
              disabled={submitting || (isCreateMode && !allPasswordRequirementsMet)}
            >
              {submitting ? (isCreateMode ? 'Creating...' : 'Updating...') : (isCreateMode ? 'Create User' : 'Update User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
