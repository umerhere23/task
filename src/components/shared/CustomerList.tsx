'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { LoadingSpinner, ErrorAlert, Pagination } from '@/components/ui/UI';

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
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Link
          href="/customers/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          New Customer
        </Link>
      </div>

      {error && <ErrorAlert message={error} />}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Assigned To</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3 text-sm font-medium text-gray-900">{customer.name}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{customer.email}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{customer.phone || '—'}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{customer.assignedToName || '—'}</td>
                <td className="px-6 py-3 text-sm">
                  <Link
                    href={`/customers/${customer.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
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
        <div className="text-center py-8 text-gray-500">
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
