import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';

export default function LinkCard({ link, onDeleted }) {
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState(null);
  const [showQr, setShowQr] = useState(false);

  const expired = link.expiresAt && new Date(link.expiresAt) < new Date();

  async function copy() {
    await navigator.clipboard.writeText(link.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function toggleQr() {
    if (!qr) {
      const { dataUrl } = await api.getQr(link.id);
      setQr(dataUrl);
    }
    setShowQr((v) => !v);
  }

  async function handleDelete() {
    if (!confirm('Delete this link?')) return;
    await api.deleteLink(link.id);
    onDeleted(link.id);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <a
              href={link.shortUrl}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-brand-600 hover:underline"
            >
              {link.shortUrl.replace(/^https?:\/\//, '')}
            </a>
            {link.isCustom && (
              <span className="rounded bg-brand-50 px-1.5 py-0.5 text-xs font-medium text-brand-700">
                custom
              </span>
            )}
            {expired && (
              <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700">
                expired
              </span>
            )}
          </div>
          <p className="mt-1 truncate text-sm text-slate-500">
            {link.destination}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span>{link.clickCount} clicks</span>
            <span>·</span>
            <span>Created {new Date(link.createdAt).toLocaleDateString()}</span>
            {link.expiresAt && !expired && (
              <>
                <span>·</span>
                <span>
                  Expires {new Date(link.expiresAt).toLocaleString()}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 text-sm">
          <div className="flex gap-2">
            <button
              onClick={copy}
              className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={toggleQr}
              className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              QR
            </button>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/links/${link.id}/analytics`}
              className="rounded-md border border-slate-300 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50"
            >
              Analytics
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-md border border-red-200 px-2.5 py-1 font-medium text-red-600 hover:bg-red-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      {showQr && qr && (
        <div className="mt-4 flex justify-center border-t border-slate-100 pt-4">
          <img src={qr} alt="QR code" className="h-40 w-40" />
        </div>
      )}
    </div>
  );
}
