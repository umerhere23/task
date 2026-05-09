'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type ReactElement, type SVGProps } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAppAuth } from '@/hooks/useAppAuth';
import styles from './Dashboard.module.css';

interface DbStatusResponse {
  connected: boolean;
  synchronizeEnabled?: boolean;
  database?: string;
  entities?: string[];
  tablesInDatabase?: string[];
  missingTables?: string[];
  message: string;
}

type IconProps = SVGProps<SVGSVGElement>;

function CustomersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 11a3 3 0 1 0-6 0 3 3 0 0 0 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.5 20c.8-2.7 2.8-4.2 5.5-4.2 2.3 0 4.2 1 5.2 2.8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 20c.8-2.3 2.3-3.4 4.5-3.4 2.1 0 3.8.8 4.5 2.5" />
    </svg>
  );
}

function UsersIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-1.5a4 4 0 0 0-3-3.9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a4 4 0 0 1 0 7.6" />
    </svg>
  );
}

function ActivityIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-7 4 14 3-7h4" />
    </svg>
  );
}

function DatabaseIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" />
    </svg>
  );
}

function StatusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

interface MetricItem {
  label: string;
  value: string;
  detail: string;
  icon: (props: IconProps) => ReactElement;
}

export default function DashboardPage() {
  const { session, organization } = useAppAuth();
  const [status, setStatus] = useState<DbStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/db/status', { cache: 'no-store' });
      const data = (await response.json()) as DbStatusResponse;

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch database status');
      }

      setStatus(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error while loading database status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const metrics: MetricItem[] = useMemo(
    () => [
      {
        label: 'Access',
        value: session?.role ? 'Active' : 'Guest',
        detail: session?.name ? `Signed in as ${session.name}` : 'Session not detected',
        icon: StatusIcon,
      },
      {
        label: 'Organization',
        value: organization?.name || 'N/A',
        detail: organization?.slug ? `Slug: ${organization.slug}` : 'No organization loaded',
        icon: DatabaseIcon,
      },
      {
        label: 'Role',
        value: session?.role || 'N/A',
        detail: session?.name ? `User: ${session.name}` : 'Waiting for auth state',
        icon: UsersIcon,
      },
    ],
    [organization?.name, organization?.slug, session?.name, session?.role]
  );

  const shortcuts = [
    { href: '/customers', title: 'Customers', description: 'Search, assign, restore, and manage customer records.', icon: CustomersIcon },
    { href: '/users', title: 'Users', description: 'Review team members in the current organization.', icon: UsersIcon },
    { href: '/activity', title: 'Activity', description: 'Track customer, note, and assignment changes.', icon: ActivityIcon },
  ];

  const statusItems = [
    { label: 'Connection', value: status?.connected ? 'Connected' : 'Unknown' },
    { label: 'Sync', value: status?.synchronizeEnabled ? 'On' : 'Off' },
    { label: 'Database', value: status?.database || 'Unknown' },
  ];

  const getStatusTone = (label: string) => {
    if (label === 'Connection') {
      return status?.connected ? styles.good : styles.bad;
    }

    if (label === 'Sync') {
      return status?.synchronizeEnabled ? styles.good : styles.bad;
    }

    return styles.statusValue;
  };

  return (
    <AppShell
      title="Overview"
      subtitle="A concise snapshot of your workspace, with the essentials up front."
      actions={<button type="button" onClick={() => void loadStatus()} className={styles.primaryButton}>Refresh</button>}
    >
      <section className={styles.summaryGrid}>
        {metrics.map((metric) => {
          const MetricIcon = metric.icon;

          return (
            <article key={metric.label} className={styles.summaryCard}>
              <div className={styles.summaryHeader}>
                <MetricIcon className={styles.summaryIcon} />
                <p className={styles.summaryLabel}>{metric.label}</p>
              </div>
              <p className={styles.summaryValue}>{metric.value}</p>
              <p className={styles.summaryDetail}>{metric.detail}</p>
            </article>
          );
        })}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <p className={styles.panelEyebrow}>Quick actions</p>
            <h2 className={styles.panelTitle}>Open workspace</h2>
          </div>
          <span className={styles.statusPill}>Ready</span>
        </div>

        <div className={styles.actionList}>
          {shortcuts.map((item) => {
            const ShortcutIcon = item.icon;

            return (
              <Link key={item.href} href={item.href} className={styles.actionRow}>
                <span className={styles.actionIconWrap}><ShortcutIcon className={styles.actionIcon} /></span>
                <span className={styles.actionTextBlock}>
                  <span className={styles.actionTitle}>{item.title}</span>
                  <span className={styles.actionText}>{item.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.detailGrid}>
        <section className={styles.panelCompact}>
          <div className={styles.panelHeaderCompact}>
            <div>
              <p className={styles.panelEyebrow}>System</p>
              <h2 className={styles.panelTitle}>Database status</h2>
            </div>
            <button type="button" onClick={() => void loadStatus()} className={styles.secondaryButton}>Refresh</button>
          </div>

          <div className={styles.statusStack}>
            {loading && <div className={styles.messageBox}>Checking database connection...</div>}
            {!loading && error && <div className={styles.errorBox}>{error}</div>}
            {!loading && status && (
              <div className={styles.statusCard}>
                {statusItems.map((item) => (
                  <div key={item.label} className={styles.statusRow}>
                    <span>{item.label}</span>
                    <strong className={getStatusTone(item.label)}>{item.value}</strong>
                  </div>
                ))}
                <p className={styles.statusMessage}>{status.message}</p>
              </div>
            )}
          </div>
        </section>

        <section className={styles.panelCompact}>
          <p className={styles.panelEyebrow}>Session</p>
          <h2 className={styles.panelTitle}>Signed in</h2>
          <div className={styles.sessionCard}>
            <p className={styles.sessionName}>{session?.name || 'User'}</p>
            <p className={styles.sessionMeta}>{organization?.name || 'Organization'}</p>
            <p className={styles.sessionMeta}>Role: {session?.role || 'member'}</p>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
