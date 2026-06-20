'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DeleteDialog from '@/components/DeleteDialog';
import { api } from '@/lib/api';

function StatCard({ label, value, icon }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

export default function AnalyticsOverviewPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    api
      .listLinks()
      .then(setLinks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const totalClicks = links.reduce((s, l) => s + (l.clickCount || 0), 0);
    const top = links.reduce(
      (best, l) => (l.clickCount > (best?.clickCount || 0) ? l : best),
      null
    );
    return { totalClicks, count: links.length, top };
  }, [links]);

  async function handleDelete(link) {
    await api.deleteLink(link.id);
    setLinks((prev) => prev.filter((l) => l.id !== link.id));
    setDeleteTarget(null);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          View detailed stats for any link, or remove links you no longer need.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total links"
          value={stats.count}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          }
        />
        <StatCard
          label="Total clicks"
          value={stats.totalClicks}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18M7 16l4-6 4 3 5-7" />
            </svg>
          }
        />
        <StatCard
          label="Top link"
          value={stats.top ? `${stats.top.clickCount} clicks` : '—'}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 15 9l7 .5-5.5 4.5L18 21l-6-3.5L6 21l1.5-7L2 9.5 9 9z" />
            </svg>
          }
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <div className="grid place-items-center py-12 text-slate-400">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
        </div>
      ) : links.length === 0 ? (
        <div className="card grid place-items-center gap-2 py-16 text-center">
          <p className="font-medium text-slate-700">No links to analyze yet</p>
          <p className="text-sm text-slate-500">
            Create a link from the{' '}
            <Link href="/dashboard" className="font-medium text-brand-600 hover:underline">
              Links
            </Link>{' '}
            page first.
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-5 py-3">Short Link</th>
                  <th className="px-5 py-3 text-center">Clicks</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {links.map((link) => {
                  const expired =
                    link.expiresAt && new Date(link.expiresAt) < new Date();
                  return (
                    <tr key={link.id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <p className="max-w-[260px] truncate font-medium text-brand-600">
                          {link.shortUrl.replace(/^https?:\/\//, '')}
                        </p>
                        <p className="max-w-[260px] truncate text-xs text-slate-400">
                          {link.destination}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-center font-semibold text-slate-800">
                        {link.clickCount}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                            expired ? 'text-slate-400' : 'text-green-600'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              expired ? 'bg-slate-300' : 'bg-green-500'
                            }`}
                          />
                          {expired ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/analytics/${link.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-white"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 3v18h18M7 16l4-6 4 3 5-7" />
                            </svg>
                            View
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(link)}
                            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete link"
                            title="Delete"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteDialog
          link={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
