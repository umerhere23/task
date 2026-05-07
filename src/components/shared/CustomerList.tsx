'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { LoadingSpinner, ErrorAlert, Pagination } from '@/components/ui/UI';
import styles from './CustomerList.module.css';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  assignedToName: string | null;
  createdAt: string;
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
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadCustomers = async (pageNum: number = 1, searchTerm: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.listCustomers(pageNum, 20, searchTerm);
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
    void loadCustomers();
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
      void loadCustomers(1, value);
    }, 300);
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
                  <Link
                    href={`/customers/${customer.id}`}
                    className={styles.actionLink}
                  >
                    View
                  </Link>
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
    </div>
  );
}
