"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DbStatusResponse {
  connected: boolean;
  synchronizeEnabled?: boolean;
  database?: string;
  entities?: string[];
  tablesInDatabase?: string[];
  missingTables?: string[];
  message: string;
}

export default function DashboardPage() {
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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unknown error while loading database status');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-4">Database health and schema sync status.</p>

      <section className="mb-6 rounded-lg border bg-white p-5">
        {loading && <p className="text-gray-600">Checking database connection...</p>}

        {!loading && error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
            {error}
          </div>
        )}

        {!loading && status && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-semibold">Connected:</span>{' '}
              <span className={status.connected ? 'text-green-700' : 'text-red-700'}>
                {status.connected ? 'Yes' : 'No'}
              </span>
            </p>
            <p>
              <span className="font-semibold">Auto Sync Enabled:</span>{' '}
              {status.synchronizeEnabled ? 'Yes' : 'No'}
            </p>
            <p>
              <span className="font-semibold">Database:</span> {status.database || 'unknown'}
            </p>
            <p>
              <span className="font-semibold">Message:</span> {status.message}
            </p>
            <p>
              <span className="font-semibold">Entity Tables:</span>{' '}
              {(status.entities || []).join(', ') || 'none'}
            </p>
            <p>
              <span className="font-semibold">Tables In DB:</span>{' '}
              {(status.tablesInDatabase || []).join(', ') || 'none'}
            </p>
            <p>
              <span className="font-semibold">Missing Tables:</span>{' '}
              {status.missingTables && status.missingTables.length > 0
                ? status.missingTables.join(', ')
                : 'none'}
            </p>
          </div>
        )}

        <button
          onClick={() => {
            void loadStatus();
          }}
          className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Refresh DB Status
        </button>
      </section>

      <Link href="/" className="text-blue-600 hover:text-blue-800">
        Back to home
      </Link>
    </main>
  );
}
