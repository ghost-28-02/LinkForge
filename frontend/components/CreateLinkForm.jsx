'use client';

import { useState } from 'react';
import Alert from '@/components/Alert';
import { api } from '@/lib/api';

export default function CreateLinkForm({ onCreated }) {
  const [destination, setDestination] = useState('');
  const [alias, setAlias] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { destination };
      if (alias.trim()) payload.alias = alias.trim();
      if (expiresAt) payload.expiresAt = new Date(expiresAt).toISOString();
      const link = await api.createLink(payload);
      onCreated(link);
      setDestination('');
      setAlias('');
      setExpiresAt('');
      setShowAdvanced(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Create a short link</h2>
      <p className="mt-1 text-sm text-slate-500">
        Paste a long URL and forge a shareable short link.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <Alert>{error}</Alert>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="url"
            required
            className="input flex-1"
            placeholder="https://your-long-url.com/page"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
            disabled={loading}
          >
            {loading ? 'Forging…' : 'Forge link'}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((s) => !s)}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          {showAdvanced ? '− Hide options' : '+ Custom alias & expiry'}
        </button>

        {showAdvanced && (
          <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="alias">
                Custom alias
              </label>
              <input
                id="alias"
                className="input"
                placeholder="my-campaign"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
              <p className="mt-1 text-xs text-slate-400">
                3–32 letters and numbers.
              </p>
            </div>
            <div>
              <label className="label" htmlFor="expiry">
                Expires at
              </label>
              <input
                id="expiry"
                type="datetime-local"
                className="input"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
