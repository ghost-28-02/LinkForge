'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import DeleteDialog from '@/components/DeleteDialog';
import LineChart from '@/components/LineChart';
import { api } from '@/lib/api';

function Breakdown({ title, rows }) {
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return (
    <div className="card p-5">
      <h4 className="text-sm font-semibold text-slate-700">{title}</h4>
      <div className="mt-3 space-y-2">
        {rows.length === 0 && (
          <p className="text-sm text-slate-400">No data yet.</p>
        )}
        {rows.map((r) => (
          <div key={r.label || 'unknown'}>
            <div className="flex justify-between text-xs text-slate-500">
              <span className="capitalize">{r.label || 'Unknown'}</span>
              <span>{r.count}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-500"
                style={{ width: `${(r.count / total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function handleDelete() {
    await api.deleteLink(id);
    router.push('/dashboard/analytics');
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([api.getAnalytics(id), api.getQr(id)])
      .then(([analytics, qrRes]) => {
        if (!active) return;
        setData(analytics);
        setQr(qrRes.dataUrl);
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  return (
    <div className="space-y-6">
      {/* Back + header */}
      <div>
        <Link
          href="/dashboard/analytics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back to analytics
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">Link analytics</h1>
            {data && (
              <div className="mt-1">
                <a
                  href={data.link?.shortCode ? `/${data.link.shortCode}` : '#'}
                  className="text-sm font-medium text-brand-600 hover:underline"
                >
                  {data.link.shortCode}
                </a>
                <p className="truncate text-sm text-slate-500">
                  {data.link.destination}
                </p>
              </div>
            )}
          </div>
          {data && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && (
        <div className="grid place-items-center py-20 text-slate-400">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
        </div>
      )}

      {data && !loading && (
        <>
          {/* Top: total + QR */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card flex flex-col justify-center p-5">
              <p className="text-sm text-slate-500">Total clicks</p>
              <p className="mt-1 text-4xl font-bold text-brand-600">
                {data.totalClicks}
              </p>
            </div>
            {qr && (
              <div className="card flex items-center gap-4 p-5 sm:col-span-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qr} alt="QR code" className="h-24 w-24 rounded-lg" />
                <div>
                  <p className="text-sm font-medium text-slate-700">QR code</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Scan or share this link anywhere.
                  </p>
                  <a
                    href={qr}
                    download={`${data.link.shortCode}-qr.png`}
                    className="btn-ghost mt-3 px-4 py-2 text-xs"
                  >
                    Download PNG
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="card p-5">
            <h4 className="text-sm font-semibold text-slate-700">
              Clicks over time
            </h4>
            {data.timeline.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No clicks yet.</p>
            ) : (
              <div className="mt-4">
                <LineChart data={data.timeline} />
              </div>
            )}
          </div>

          {/* Breakdowns */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Breakdown title="Browser" rows={data.byBrowser} />
            <Breakdown title="OS" rows={data.byOs} />
            <Breakdown title="Device" rows={data.byDevice} />
          </div>

          {/* Recent */}
          <div className="card p-5">
            <h4 className="text-sm font-semibold text-slate-700">
              Recent clicks
            </h4>
            {data.recentClicks.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">No clicks yet.</p>
            ) : (
              <div className="mt-3 overflow-x-auto rounded-xl border border-slate-100">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="px-4 py-2 font-medium">When</th>
                      <th className="px-4 py-2 font-medium">Browser</th>
                      <th className="px-4 py-2 font-medium">OS</th>
                      <th className="px-4 py-2 font-medium">Device</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.recentClicks.map((c, i) => (
                      <tr key={i} className="text-slate-600">
                        <td className="whitespace-nowrap px-4 py-2">
                          {new Date(c.clicked_at).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{c.browser || '—'}</td>
                        <td className="px-4 py-2">{c.os || '—'}</td>
                        <td className="px-4 py-2 capitalize">
                          {c.device || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {confirmDelete && data && (
        <DeleteDialog
          link={data.link}
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
