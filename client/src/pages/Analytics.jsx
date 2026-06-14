import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client.js';

function Bar({ label, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-sm text-slate-600">
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-10 shrink-0 text-right text-sm text-slate-500">
        {count}
      </span>
    </div>
  );
}

function Breakdown({ title, rows }) {
  const max = Math.max(0, ...rows.map((r) => r.count));
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">No data yet</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((r) => (
            <Bar key={r.label} label={r.label} count={r.count} max={max} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getAnalytics(id)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <div>
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
        <Link to="/" className="mt-4 inline-block text-brand-600">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  if (!data) return <p className="text-slate-500">Loading analytics…</p>;

  return (
    <div className="space-y-6">
      <div>
        <Link to="/" className="text-sm text-brand-600">
          ← Back to dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold">/{data.link.shortCode}</h1>
        <p className="truncate text-sm text-slate-500">
          {data.link.destination}
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-4xl font-bold text-brand-600">{data.totalClicks}</p>
        <p className="mt-1 text-sm text-slate-500">total clicks</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Breakdown title="By device" rows={data.byDevice} />
        <Breakdown title="By browser" rows={data.byBrowser} />
        <Breakdown title="By OS" rows={data.byOs} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold">Recent clicks</h3>
        {data.recentClicks.length === 0 ? (
          <p className="text-sm text-slate-400">No clicks yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400">
                <tr>
                  <th className="pb-2 pr-4 font-medium">Time</th>
                  <th className="pb-2 pr-4 font-medium">Device</th>
                  <th className="pb-2 pr-4 font-medium">Browser</th>
                  <th className="pb-2 pr-4 font-medium">OS</th>
                  <th className="pb-2 font-medium">Referrer</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {data.recentClicks.map((c, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="py-2 pr-4">
                      {new Date(c.clicked_at).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{c.device}</td>
                    <td className="py-2 pr-4">{c.browser}</td>
                    <td className="py-2 pr-4">{c.os}</td>
                    <td className="py-2 truncate">{c.referrer || 'direct'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
