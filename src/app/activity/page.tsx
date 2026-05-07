'use client';

import { useState, useEffect } from 'react';
import { useApiClient, useApp } from '@/app/store/AppContext';
import { LoadingSpinner, ErrorAlert, Pagination } from '@/app/components/UI';
import Link from 'next/link';

interface ActivityLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedByName: string;
  changes: Record<string, any> | null;
  createdAt: string;
}

const ACTION_LABELS: Record<string, string> = {
  customer_created: 'Customer Created',
  customer_updated: 'Customer Updated',
  customer_deleted: 'Customer Deleted',
  customer_restored: 'Customer Restored',
  customer_assigned: 'Customer Assigned',
  note_added: 'Note Added',
};

export default function ActivityPage() {
  const { organizationId } = useApp();
  const api = useApiClient();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadLogs = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getActivityLogs(pageNum, 20);
      setLogs((result as any)?.data || []);
      setTotal((result as any)?.total || 0);
      setPages((result as any)?.pages || 1);
      setPage(pageNum);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [organizationId]);

  if (loading && logs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-medium">Activity</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-8">Activity Log</h1>

        {error && <ErrorAlert message={error} />}

        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Entity</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Performed By</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Changes</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm font-medium">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {ACTION_LABELS[log.action] || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {log.entityType} ({log.entityId.substring(0, 8)}...)
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{log.performedByName}</td>
                    <td className="px-6 py-3 text-sm">
                      {log.changes ? (
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {Object.keys(log.changes).join(', ')}
                        </code>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-8 text-gray-500">No activity yet</div>
        )}

        {pages > 1 && (
          <Pagination page={page} pages={pages} onPageChange={loadLogs} />
        )}
      </main>
    </div>
  );
}
