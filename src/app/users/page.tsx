'use client';

import { useEffect, useState, type SVGProps } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useApiClient } from '@/hooks/useAuth';
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
  const api = useApiClient();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');

  const isAdmin = session?.role === 'admin';

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

  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserModalMode('create');
    setShowUserModal(true);
  };

  const openEditUserModal = (user: UserListItem) => {
    setEditingUser(user);
    setUserModalMode('edit');
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user: UserListItem) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
      return;
    }

    if (!organization?.id) return;

    setError(null);

    try {
      await api.deleteUser(user.id);
      await loadUsers(search);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <AppShell
      title="Organization users"
      subtitle={`Manage team access inside ${organization?.name || 'your organization'}.`}
      actions={
        <>
          <Link href="/dashboard" className={styles.secondaryLink}>Dashboard</Link>
          {isAdmin && (
            <button type="button" onClick={openCreateUserModal} className={styles.primaryButton}>
              <PlusIcon className={styles.buttonIcon} />
              Add user
            </button>
          )}
        </>
      }
    >
      <section className={styles.panel}>
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
                  <td data-label="Name">
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{user.name.slice(0, 1).toUpperCase()}</div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td data-label="Email">{user.email}</td>
                  <td data-label="Role">
                    <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : styles.memberBadge}`}>
                      {user.role}
                    </span>
                  </td>
                  <td data-label="Assigned">{user.assignedCustomerCount}</td>
                  <td data-label="Created">{new Date(user.createdAt).toLocaleDateString()}</td>
                  {isAdmin && (
                    <td data-label="Actions">
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          onClick={() => openEditUserModal(user)}
                          className={styles.editButton}
                          title="Edit user"
                        >
                          <EditIcon className={styles.editIcon} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteUser(user)}
                          className={styles.deleteButton}
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {loading && <div className={styles.loadingBox}>Loading users...</div>}
          {!loading && users.length === 0 && <div className={styles.emptyState}>No users found in this organization.</div>}
        </div>
      </section>

      {showUserModal && (
        <EditUserModal
          user={editingUser ? {
            id: editingUser.id,
            name: editingUser.name,
            email: editingUser.email,
            role: editingUser.role as 'admin' | 'member',
          } : null}
          mode={userModalMode}
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onUpdate={() => loadUsers(search)}
        />
      )}
    </AppShell>
  );
}
