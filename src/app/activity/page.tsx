'use client';

import { useState, useEffect } from 'react';
import { useApiClient, useApp } from '@/hooks/useAuth';
import { LoadingSpinner, ErrorAlert, Pagination } from '@/components/ui/UI';
import { AppShell } from '@/components/layout/AppShell';
import styles from './Activity.module.css';

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

const ACTION_LABELS: Record<string, { label: string; variant: string }> = {
  customer_created: { label: 'Customer Created', variant: styles.badgeSuccess },
  customer_updated: { label: 'Customer Updated', variant: styles.badgeInfo },
  customer_deleted: { label: 'Customer Deleted', variant: styles.badgeDanger },
  customer_restored: { label: 'Customer Restored', variant: styles.badgePurple },
  customer_assigned: { label: 'Customer Assigned', variant: styles.badgeWarning },
  note_added: { label: 'Note Added', variant: styles.badgeIndigo },
  note_edited: { label: 'Note Edited', variant: styles.badgeCyan },
  note_deleted: { label: 'Note Deleted', variant: styles.badgeDanger },
};

function getActionLabel(action: string) {
  return ACTION_LABELS[action] || { label: action.replaceAll('_', ' '), variant: styles.badgeNeutral };
}

function getMetadataPreview(metadata?: Record<string, any>) {
  if (!metadata) {
    return { summary: 'No additional details', full: 'No additional details' };
  }

  const entries = Object.entries(metadata);
  const preview = entries
    .slice(0, 2)
    .map(([key, value]) => `${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`)
    .join(' • ');

  const remaining = entries.length - 2;
  const summary = remaining > 0 ? `${preview} • +${remaining} more` : preview;

  return {
    summary: summary || 'Details available',
    full: JSON.stringify(metadata, null, 2),
  };
}

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
      const result = await api.getActivityLogs({ page: pageNum, limit: 10 });
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
    <AppShell title="Activity log" subtitle="Track customer, note, and assignment changes in a polished table.">
      {error && <ErrorAlert message={error} />}

      <div className={styles.tableShell}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.tableHeadCell}>Action</th>
                <th className={styles.tableHeadCell}>Entity</th>
                <th className={styles.tableHeadCell}>Performed by</th>
                <th className={styles.tableHeadCell}>Details</th>
                <th className={styles.tableHeadCell}>Time</th>
              </tr>
            </thead>
            <tbody className={styles.tableBody}>
              {logs.map((log) => {
                const actionInfo = getActionLabel(log.action);
                const metadataPreview = getMetadataPreview(log.metadata);

                return (
                  <tr key={log.id} className={styles.tableRow}>
                    <td className={styles.tableCell} data-label="Action">
                      <span className={`${styles.badge} ${actionInfo.variant}`}>
                        {actionInfo.label}
                      </span>
                    </td>
                    <td className={styles.tableCell} data-label="Entity">
                      <div className={styles.primaryText} title={log.entityType}>
                        {log.entityType}
                      </div>
                      <div className={styles.secondaryText} title={log.entityId}>
                        {log.entityId.substring(0, 8)}...
                      </div>
                    </td>
                    <td className={styles.tableCell} data-label="Performed by">
                      <span className={styles.truncatedText} title={log.performedByName}>
                        {log.performedByName}
                      </span>
                    </td>
                    <td className={styles.tableCell} data-label="Details">
                      <span className={styles.detailsText} title={metadataPreview.full}>
                        {metadataPreview.summary}
                      </span>
                    </td>
                    <td className={styles.tableCell} data-label="Time">
                      <span className={styles.timeText} title={new Date(log.timestamp).toLocaleString()}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {logs.length === 0 && (
        <div className={styles.emptyState}>No activity yet</div>
      )}

      {pages > 1 && (
        <div className={styles.paginationShell}>
          <Pagination page={page} pages={pages} onPageChange={loadLogs} />
        </div>
      )}
    </AppShell>
  );
}
