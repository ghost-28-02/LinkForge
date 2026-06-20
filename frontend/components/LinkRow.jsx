'use client';

import { useState } from 'react';

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function LinkRow({ link, onDelete, onAnalytics }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link.shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  }

  const expired = link.expiresAt && new Date(link.expiresAt) < new Date();

  return (
    <div className="card flex flex-col gap-4 p-5 transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="truncate font-semibold text-brand-600 hover:underline"
          >
            {link.shortUrl.replace(/^https?:\/\//, '')}
          </a>
          {link.isCustom && (
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
              custom
            </span>
          )}
          {expired && (
            <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
              expired
            </span>
          )}
        </div>
        <p className="mt-1 truncate text-sm text-slate-500">
          {link.destination}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Created {formatDate(link.createdAt)}
          {link.expiresAt && ` · Expires ${formatDate(link.expiresAt)}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="mr-2 text-right">
          <p className="text-xl font-bold text-slate-900">{link.clickCount}</p>
          <p className="text-xs text-slate-400">clicks</p>
        </div>
        <button
          onClick={copy}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => onAnalytics(link)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
        >
          Analytics
        </button>
        <button
          onClick={() => onDelete(link)}
          className="rounded-lg border border-slate-200 px-2 py-1.5 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete link"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
