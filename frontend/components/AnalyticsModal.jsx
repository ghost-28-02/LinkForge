'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

function Breakdown({ title, rows }) {
  const total = rows.reduce((s, r) => s + r.count, 0) || 1;
  return (
    <div>
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

export default function AnalyticsModal({ link, onClose }) {
  const [data, setData] = useState(null);
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setData(null);
    setQr(null);
    setError('');
    Promise.all([api.getAnalytics(link.id), api.getQr(link.id)])
      .then(([analytics, qrRes]) => {
        if (!active) return;
        setData(analytics);
        setQr(qrRes.dataUrl);
      })
      .catch((err) => active && setError(err.message));
    return () => {
      active = false;
    };
  }, [link.id]);

  const maxDay = data
    ? Math.max(1, ...data.timeline.map((d) => d.count))
    : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-6">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold">Link analytics</h3>
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="truncate text-sm font-medium text-brand-600 hover:underline"
            >
              {link.shortUrl}
            </a>
            <p className="truncate text-xs text-slate-400">{link.destination}</p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          {!data && !error && (
            <div className="grid place-items-center py-16 text-slate-400">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
            </div>
          )}
          {data && (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-brand-50 p-4">
                  <p className="text-sm text-brand-700">Total clicks</p>
                  <p className="mt-1 text-3xl font-bold text-brand-700">
                    {data.totalClicks}
                  </p>
                </div>
                {qr && (
                  <div className="flex items-center gap-4 rounded-xl border border-slate-100 p-4 sm:col-span-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qr} alt="QR code" className="h-20 w-20 rounded-lg" />
                    <div>
                      <p className="text-sm font-medium text-slate-700">
                        QR code
                      </p>
                      <a
                        href={qr}
                        download={`${link.shortCode}-qr.png`}
                        className="mt-1 inline-block text-sm font-medium text-brand-600 hover:underline"
                      >
                        Download PNG
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700">
                  Clicks over time
                </h4>
                {data.timeline.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No clicks yet.</p>
                ) : (
                  <div className="mt-4 flex h-32 items-end gap-1.5">
                    {data.timeline.map((d) => (
                      <div
                        key={d.day}
                        className="min-w-[6px] flex-1 rounded-t bg-gradient-to-t from-brand-300 to-brand-500"
                        style={{
                          height: `${Math.max((d.count / maxDay) * 100, 4)}%`,
                        }}
                        title={`${d.day}: ${d.count} click${d.count === 1 ? '' : 's'}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Breakdowns */}
              <div className="grid gap-6 sm:grid-cols-3">
                <Breakdown title="Browser" rows={data.byBrowser} />
                <Breakdown title="OS" rows={data.byOs} />
                <Breakdown title="Device" rows={data.byDevice} />
              </div>

              {/* Recent */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700">
                  Recent clicks
                </h4>
                {data.recentClicks.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-400">No clicks yet.</p>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-100">
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
                            <td className="px-4 py-2">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
