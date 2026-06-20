'use client';

import { useState } from 'react';

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

export default function LinkRow({ link, onShowQr }) {
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
  const host = hostOf(link.destination);
  const favicon = host
    ? `https://www.google.com/s2/favicons?domain=${host}&sz=64`
    : null;

  return (
    <tr className="transition hover:bg-slate-50">
      {/* Short Link */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="max-w-[180px] truncate font-medium text-brand-600 hover:underline"
          >
            {link.shortUrl.replace(/^https?:\/\//, '')}
          </a>
          <button
            onClick={copy}
            className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700"
            aria-label="Copy short link"
            title={copied ? 'Copied!' : 'Copy'}
          >
            {copied ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </td>

      {/* Original Link */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          {favicon ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={favicon}
              alt=""
              className="h-5 w-5 flex-shrink-0 rounded"
            />
          ) : (
            <span className="h-5 w-5 flex-shrink-0 rounded bg-slate-100" />
          )}
          <a
            href={link.destination}
            target="_blank"
            rel="noreferrer"
            className="max-w-[320px] truncate text-slate-600 hover:underline"
            title={link.destination}
          >
            {link.destination}
          </a>
        </div>
      </td>

      {/* QR Code */}
      <td className="px-5 py-4 text-center">
        <button
          onClick={() => onShowQr(link)}
          className="inline-grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
          aria-label="Show QR code"
          title="Show QR code"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h3v3M21 21v.01M17 21h.01M21 17h.01" />
          </svg>
        </button>
      </td>

      {/* Clicks */}
      <td className="px-5 py-4 text-center font-semibold text-slate-800">
        {link.clickCount}
      </td>

      {/* Status */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
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
          <a
            href={link.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-600"
            aria-label="Visit link"
            title="Visit link"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </a>
        </div>
      </td>
    </tr>
  );
}
