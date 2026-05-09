'use client';

import { useEffect, useRef, useState, type SVGProps } from 'react';
import Link from 'next/link';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { LoadingSpinner, ErrorAlert, Pagination } from '@/components/ui/UI';
import { EditCustomerModal } from '@/components/modals/EditCustomerModal';
import styles from './CustomerList.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  assignedToName: string | null;
  assignedToId: string | null;
  createdAt: string;
  deletedAt?: string | null;
}

type IconProps = SVGProps<SVGSVGElement>;

function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l5 5" />
    </svg>
  );
}

function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
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

function TrashIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 6V4.5A1.5 1.5 0 019.5 3h5A1.5 1.5 0 0116 4.5V6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6l.8 13a1.5 1.5 0 001.5 1.4h6.4a1.5 1.5 0 001.5-1.4l.8-13" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 10.5v6M14 10.5v6" />
    </svg>
  );
}

function RotateIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 4v6h-6" />
    </svg>
  );
}

export function CustomerList() {
  const { organizationId } = useApp();
  const api = useApiClient();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCustomers = async (pageNum: number = 1, searchTerm: string = '', includeDeleted: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.listCustomers(pageNum, 10, searchTerm, includeDeleted);
      setCustomers(result.data);
      setPages(result.pages);
      setPage(pageNum);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load customers');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers(1, '', showDeleted);
  }, [organizationId]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      void loadCustomers(1, value, showDeleted);
    }, 300);
  };

  const handleToggleDeleted = () => {
    setShowDeleted((v) => {
      const next = !v;
      void loadCustomers(1, search, next);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await api.deleteCustomer(id);
      void loadCustomers(page, search, showDeleted);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to delete customer');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setLoading(true);
      await api.restoreCustomer(id);
      void loadCustomers(page, search, showDeleted);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to restore customer');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowEditModal(true);
  };

  if (loading && customers.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <div className={styles.searchField}>
          <SearchIcon className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <Link href="/customers/new" className={styles.newButton}>
          <PlusIcon className={styles.buttonIcon} />
          New customer
        </Link>
        <label className={styles.showDeletedToggle}>
          <input type="checkbox" checked={showDeleted} onChange={handleToggleDeleted} />
          <span>Show deleted</span>
        </label>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr className={styles.tableHeadRow}>
              <th className={styles.tableHeadCell}>Name</th>
              <th className={styles.tableHeadCell}>Email</th>
              <th className={styles.tableHeadCell}>Phone</th>
              <th className={styles.tableHeadCell}>Assigned To</th>
              <th className={styles.tableHeadCell}>Actions</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {customers.map((customer) => (
              <tr key={customer.id} className={styles.tableBodyRow}>
                <td data-label="Name" className={`${styles.tableCell} ${styles.tableCellBold}`}>{customer.name}</td>
                <td data-label="Email" className={styles.tableCell} title={customer.email}>{customer.email}</td>
                <td data-label="Phone" className={styles.tableCell} title={customer.phone || '—'}>{customer.phone || '—'}</td>
                <td data-label="Assigned To" className={styles.tableCell} title={customer.assignedToName || '—'}>{customer.assignedToName || '—'}</td>
                <td data-label="Actions" className={styles.tableCell}>
                  {customer.deletedAt ? (
                    <div className={styles.actionGroup}>
                      <button type="button" onClick={() => void handleRestore(customer.id)} className={styles.actionButton} title="Restore customer">
                        <RotateIcon className={styles.actionIcon} />
                        <span>Restore</span>
                      </button>
                      <span className={styles.deletedLabel}>Deleted</span>
                    </div>
                  ) : (
                    <div className={styles.actionGroup}>
                      <Link href={`/customers/${customer.id}`} className={styles.actionButton} title="View customer">
                        <EyeIcon className={styles.actionIcon} />
                        <span>View</span>
                      </Link>
                      <button type="button" onClick={() => handleEdit(customer)} className={styles.actionButton} title="Edit customer">
                        <PencilIcon className={styles.actionIcon} />
                        <span>Edit</span>
                      </button>
                      <button type="button" onClick={() => void handleDelete(customer.id)} className={styles.actionDangerButton} title="Delete customer">
                        <TrashIcon className={styles.actionIcon} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && (
        <div className={styles.emptyState}>
          {search ? 'No customers found matching your search' : 'No customers yet'}
        </div>
      )}

      {pages > 1 && (
        <Pagination
          page={page}
          pages={pages}
          onPageChange={(newPage) => {
            void loadCustomers(newPage, search);
          }}
        />
      )}

      {showEditModal && editingCustomer && (
        <EditCustomerModal
          customer={editingCustomer}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingCustomer(null);
          }}
          onUpdate={() => loadCustomers(page, search, showDeleted)}
        />
      )}
    </div>
  );
}
