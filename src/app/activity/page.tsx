'use client';

import { useState, useEffect } from 'react';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { LoadingSpinner, ErrorAlert, Pagination } from '@/components/ui/UI';
import { AppShell } from '@/components/layout/AppShell';

interface ActivityLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  performedBy: string;
  performedByName: string;
  organizationId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  customer_created: { label: 'Customer Created', color: 'bg-green-100 text-green-800' },
  customer_updated: { label: 'Customer Updated', color: 'bg-blue-100 text-blue-800' },
  customer_deleted: { label: 'Customer Deleted', color: 'bg-red-100 text-red-800' },
  customer_restored: { label: 'Customer Restored', color: 'bg-purple-100 text-purple-800' },
  customer_assigned: { label: 'Customer Assigned', color: 'bg-orange-100 text-orange-800' },
  note_added: { label: 'Note Added', color: 'bg-indigo-100 text-indigo-800' },
  note_edited: { label: 'Note Edited', color: 'bg-indigo-100 text-indigo-800' },
  note_deleted: { label: 'Note Deleted', color: 'bg-red-100 text-red-800' },
};

export default function ActivityPage() {
  const { organizationId } = useApp();
  const api = useApiClient();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const loadLogs = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const result = await api.getActivityLogs({ page: pageNum, limit: 20 });
      setLogs(result.data);
      setPages(result.pages);
      setPage(pageNum);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load activity logs');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, [organizationId]);

  if (loading && logs.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <AppShell title="Activity log" subtitle="Track customer, note, and assignment changes.">
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
                    {(() => {
                      const actionInfo = ACTION_LABELS[log.action];
                      return (
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${actionInfo?.color || 'bg-gray-100 text-gray-800'}`}>
                          {actionInfo?.label || log.action}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {log.entityType} ({log.entityId.substring(0, 8)}...)
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">{log.performedByName}</td>
                  <td className="px-6 py-3 text-sm">
                    {log.metadata ? (
                      <div className="space-y-1">
                        {Object.entries(log.metadata).map(([key, value]) => (
                          <div key={key} className="text-xs">
                            <span className="font-medium">{key}:</span> {JSON.stringify(value)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {new Date(log.timestamp).toLocaleString()}
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

      {pages > 1 && <Pagination page={page} pages={pages} onPageChange={loadLogs} />}
    </AppShell>
  );
}
