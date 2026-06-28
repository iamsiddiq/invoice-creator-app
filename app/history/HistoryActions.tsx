'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { deleteInvoice } from './actions';

interface LoadBtnProps {
  invoiceState: Record<string, unknown>;
}

export function LoadBtn({ invoiceState }: LoadBtnProps) {
  const router = useRouter();

  function handleLoad() {
    localStorage.setItem('marav_pending_invoice', JSON.stringify(invoiceState));
    router.push('/');
  }

  return (
    <button className="btn btn-ghost history-action-btn" onClick={handleLoad}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      Edit
    </button>
  );
}

interface DeleteBtnProps {
  id: string;
  invoiceNumber: string | null;
}

export function DeleteBtn({ id, invoiceNumber }: DeleteBtnProps) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setLoading(true);
    await deleteInvoice(id);
  }

  if (confirming) {
    return (
      <span className="history-delete-confirm">
        <span className="history-delete-label">Delete {invoiceNumber ?? 'invoice'}?</span>
        <button
          className="btn btn-ghost history-action-btn history-action-danger"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? '…' : 'Yes'}
        </button>
        <button
          className="btn btn-ghost history-action-btn"
          onClick={() => setConfirming(false)}
          disabled={loading}
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      className="btn btn-ghost history-action-btn history-action-danger"
      onClick={handleDelete}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4h6v2" />
      </svg>
      Delete
    </button>
  );
}
