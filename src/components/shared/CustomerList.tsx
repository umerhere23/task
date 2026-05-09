'use client';

import { useEffect, useRef, useState } from 'react';
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
      const result = await api.listCustomers(pageNum, 20, searchTerm, includeDeleted);
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
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className={styles.searchInput}
        />
        <Link
          href="/customers/new"
          className={styles.newButton}
        >
          New Customer
        </Link>
        <label className={styles.showDeletedToggle}>
          <input type="checkbox" checked={showDeleted} onChange={handleToggleDeleted} /> Show deleted
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
                <td className={`${styles.tableCell} ${styles.tableCellBold}`}>{customer.name}</td>
                <td className={styles.tableCell}>{customer.email}</td>
                <td className={styles.tableCell}>{customer.phone || '—'}</td>
                <td className={styles.tableCell}>{customer.assignedToName || '—'}</td>
                <td className={styles.tableCell}>
                  {customer.deletedAt ? (
                    <>
                      <button onClick={() => void handleRestore(customer.id)} className={styles.actionButton}>Restore</button>
                      <span className={styles.deletedLabel}>Deleted</span>
                    </>
                  ) : (
                    <>
                      <Link href={`/customers/${customer.id}`} className={styles.actionLink}>View</Link>
                      <button onClick={() => handleEdit(customer)} className={styles.actionButton}>Edit</button>
                      <button onClick={() => void handleDelete(customer.id)} className={styles.actionButton}>Delete</button>
                    </>
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
