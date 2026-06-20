'use client';

import { useEffect, useMemo, useState } from 'react';
import CreateLinkForm from '@/components/CreateLinkForm';
import LinkRow from '@/components/LinkRow';
import QrModal from '@/components/QrModal';
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

export default function DashboardPage() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrLink, setQrLink] = useState(null);

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

  function handleCreated(link) {
    setLinks((prev) => [link, ...prev]);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your links</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create, manage, and track all your short links.
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

      <CreateLinkForm onCreated={handleCreated} />

      {/* Links */}
      <div>
        {error && (
          <p className="mb-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {loading ? (
          <div className="grid place-items-center py-12 text-slate-400">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
          </div>
        ) : links.length === 0 ? (
          <div className="card grid place-items-center gap-2 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <p className="font-medium text-slate-700">No links yet</p>
            <p className="text-sm text-slate-500">
              Forge your first short link using the form above.
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Short Link</th>
                    <th className="px-5 py-3">Original Link</th>
                    <th className="px-5 py-3 text-center">QR Code</th>
                    <th className="px-5 py-3 text-center">Clicks</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {links.map((link) => (
                    <LinkRow key={link.id} link={link} onShowQr={setQrLink} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {qrLink && <QrModal link={qrLink} onClose={() => setQrLink(null)} />}
    </div>
  );
}
