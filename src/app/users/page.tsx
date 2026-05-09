'use client';

import { useEffect, useMemo, useState, type FormEvent, type SVGProps } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppAuth } from '@/hooks/useAppAuth';
import { EditUserModal } from '@/components/modals/EditUserModal';
import styles from './Users.module.css';

interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | string;
  organizationId: string;
  createdAt: string;
  assignedCustomerCount: number;
}

type IconProps = SVGProps<SVGSVGElement>;

function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l5 5" />
    </svg>
  );
}

function ShieldIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 3v5c0 4.4-2.7 8.4-7 10-4.3-1.6-7-5.6-7-10V6l7-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12.2l1.8 1.8 3.4-3.8" />
    </svg>
  );
}

function EditIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function UsersPage() {
  const { session, organization } = useAppAuth();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'member' as 'member' | 'admin' });
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const isAdmin = session?.role === 'admin';

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter((user) => user.role === 'admin').length;
    const members = users.filter((user) => user.role === 'member').length;
    const assigned = users.reduce((sum, user) => sum + (user.assignedCustomerCount || 0), 0);

    return [
      { label: 'Total users', value: String(total), detail: 'Organization scoped' },
      { label: 'Admins', value: String(admins), detail: 'Can create users' },
      { label: 'Members', value: String(members), detail: 'Standard access' },
      { label: 'Assigned customers', value: String(assigned), detail: 'Active workload' },
    ];
  }, [users]);

  const loadUsers = async (searchTerm: string = '') => {
    if (!organization?.id) return;

    setLoading(true);
    setError(null);

    try {
      const url = new URL('/api/users', window.location.origin);
      if (searchTerm) url.searchParams.set('search', searchTerm);

      const response = await fetch(url.toString(), {
        cache: 'no-store',
        headers: {
          'x-org-id': organization.id,
          'x-user-role': session?.role || 'member',
        },
      });

      const data = (await response.json()) as UserListItem[] | { error?: string };

      if (!response.ok) {
        throw new Error('error' in data && data.error ? data.error : 'Failed to load users');
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers(search);
  }, [organization?.id]);

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!organization?.id) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': organization.id,
          'x-user-role': session?.role || 'member',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({ error: 'Failed to create user' }));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setFormData({ name: '', email: '', password: '', role: 'member' });
      setShowForm(false);
      await loadUsers(search);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell
      title="Organization users"
      subtitle={`Create users, assign roles, and review workload inside ${organization?.name || 'your organization'}.`}
      actions={
        <>
          <Link href="/dashboard" className={styles.secondaryLink}>Dashboard</Link>
          {isAdmin && (
            <button type="button" onClick={() => setShowForm((value) => !value)} className={styles.primaryButton}>
              <PlusIcon className={styles.buttonIcon} />
              {showForm ? 'Close form' : 'Create user'}
            </button>
          )}
        </>
      }
    >
      <section className={styles.statGrid}>
        {stats.map((item) => (
          <article key={item.label} className={styles.statCard}>
            <p className={styles.statLabel}>{item.label}</p>
            <p className={styles.statValue}>{item.value}</p>
            <p className={styles.statDetail}>{item.detail}</p>
          </article>
        ))}
      </section>

      <section className={styles.contentGrid}>
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.panelEyebrow}>Directory</p>
              <h2 className={styles.panelTitle}>Team members</h2>
            </div>
            <div className={styles.searchBox}>
              <SearchIcon className={styles.searchIcon} />
              <input
                type="search"
                placeholder="Search by name or email"
                value={search}
                onChange={(event) => {
                  const value = event.target.value;
                  setSearch(value);
                  void loadUsers(value);
                }}
                className={styles.searchInput}
              />
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Assigned</th>
                  <th>Created</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {!loading && users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar}>{user.name.slice(0, 1).toUpperCase()}</div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : styles.memberBadge}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.assignedCustomerCount}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {isAdmin && (
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowEditModal(true);
                          }}
                          className={styles.editButton}
                          title="Edit user"
                        >
                          <EditIcon className={styles.editIcon} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && <div className={styles.loadingBox}>Loading users...</div>}
            {!loading && users.length === 0 && <div className={styles.emptyState}>No users found in this organization.</div>}
          </div>
        </div>

        <aside className={styles.sideColumn}>
          <section className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <ShieldIcon className={styles.sideIcon} />
              <div>
                <p className={styles.panelEyebrow}>Access</p>
                <h3 className={styles.panelTitle}>Organization restricted</h3>
              </div>
            </div>
            <p className={styles.sideText}>
              User data is always filtered by organization ID. Admins can create users, assign roles, and manage workload.
            </p>
          </section>

          {showForm && isAdmin && (
            <section className={styles.formCard}>
              <div className={styles.panelHeader}>
                <div>
                  <p className={styles.panelEyebrow}>Create user</p>
                  <h3 className={styles.panelTitle}>New team member</h3>
                </div>
              </div>

              <form onSubmit={handleCreateUser} className={styles.form}>
                <label className={styles.field}>
                  <span>Name</span>
                  <input type="text" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} placeholder="Jane Doe" />
                </label>

                <label className={styles.field}>
                  <span>Email</span>
                  <input type="email" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} placeholder="jane@company.com" />
                </label>

                <label className={styles.field}>
                  <span>Temporary password</span>
                  <input type="password" required value={formData.password} onChange={(event) => setFormData({ ...formData, password: event.target.value })} placeholder="Set an initial password" />
                </label>

                <label className={styles.field}>
                  <span>Role</span>
                  <select value={formData.role} onChange={(event) => setFormData({ ...formData, role: event.target.value as 'member' | 'admin' })}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <button type="submit" className={styles.submitButton} disabled={submitting}>{submitting ? 'Creating...' : 'Create user'}</button>
              </form>
            </section>
          )}
        </aside>
      </section>

      {showEditModal && editingUser && (
        <EditUserModal
          user={{
            id: editingUser.id,
            name: editingUser.name,
            email: editingUser.email,
            role: editingUser.role as 'admin' | 'member',
          }}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingUser(null);
          }}
          onUpdate={() => loadUsers(search)}
        />
      )}
    </AppShell>
  );
}
