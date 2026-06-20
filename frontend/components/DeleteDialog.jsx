'use client';

import { useState } from 'react';

export default function DeleteDialog({ link, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setDeleting(true);
    setError('');
    try {
      await onConfirm(link);
      // Parent closes the dialog on success.
    } catch (err) {
      setError(err.message || 'Could not delete link');
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={() => !deleting && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid h-11 w-11 place-items-center rounded-full bg-red-50 text-red-600">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900">
          Delete this link?
        </h3>
        <p className="mt-1.5 text-sm text-slate-500">
          <span className="font-medium text-slate-700">
            {(link.shortUrl || link.shortCode || 'This link').replace(
              /^https?:\/\//,
              ''
            )}
          </span>{' '}
          will stop working immediately and its analytics will be removed. This
          can&apos;t be undone.
        </p>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} disabled={deleting} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
          >
            {deleting ? 'Deleting…' : 'Delete link'}
          </button>
        </div>
      </div>
    </div>
  );
}
