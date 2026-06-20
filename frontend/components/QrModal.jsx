'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function QrModal({ link, onClose }) {
  const [qr, setQr] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api
      .getQr(link.id)
      .then((res) => active && setQr(res.dataUrl))
      .catch((err) => active && setError(err.message || 'Could not generate QR'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [link.id]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl bg-white p-6 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold text-slate-900">QR code</h3>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-1 truncate text-xs text-slate-400">
          {link.shortUrl.replace(/^https?:\/\//, '')}
        </p>

        <div className="mt-4 grid min-h-[200px] place-items-center">
          {loading && (
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {qr && !loading && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qr}
              alt={`QR code for ${link.shortUrl}`}
              className="h-48 w-48 rounded-lg"
            />
          )}
        </div>

        {qr && !loading && (
          <a
            href={qr}
            download={`${link.shortCode}-qr.png`}
            className="btn-primary mt-5 w-full"
          >
            Download PNG
          </a>
        )}
      </div>
    </div>
  );
}
