'use client';

import { useEffect, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { deleteInvoice } from '@/app/history/actions';
import type { InvoiceState } from '@/lib/types';

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹',
  AED: 'AED ', CAD: 'CA$', AUD: 'A$', SGD: 'S$', JPY: '¥',
};

function formatTotal(total: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${sym}${total.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Invoice {
  id: string;
  invoice_number: string | null;
  from_name: string | null;
  to_name: string | null;
  total: number;
  currency: string;
  created_at: string;
  template: string;
  state: Record<string, unknown> | null;
}

interface Props {
  onBack: () => void;
  onLoad: (state: Partial<InvoiceState>) => void;
  mobileVisible: boolean;
}

export default function HistorySidePanel({ onBack, onLoad, mobileVisible }: Props) {
  const [status, setStatus] = useState<'loading' | 'no-auth' | 'free' | 'ready'>('loading');
  const [badge, setBadge] = useState<'free' | 'pro' | 'admin'>('free');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadErr, setLoadErr] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [, startDelete] = useTransition();

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('no-auth'); return; }

      const { data: p } = await supabase
        .from('profiles').select('plan, is_admin').eq('id', user.id).single();

      const isAdmin = p?.is_admin ?? false;
      const isPro = p?.plan === 'pro';

      if (isAdmin) setBadge('admin');
      else if (isPro) setBadge('pro');
      else setBadge('free');

      if (!isPro && !isAdmin) { setStatus('free'); return; }

      const { data, error } = await supabase
        .from('invoices')
        .select('id, invoice_number, from_name, to_name, total, currency, created_at, template, state')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) { setLoadErr('Could not load invoices.'); }
      else setInvoices(data ?? []);
      setStatus('ready');
    })();
  }, []);

  function handleLoad(inv: Invoice) {
    if (!inv.state) return;
    onLoad(inv.state as Partial<InvoiceState>);
    onBack();
  }

  function handleDelete(id: string) {
    if (confirmId !== id) { setConfirmId(id); return; }
    setConfirmId(null);
    setDeletingId(id);
    startDelete(async () => {
      await deleteInvoice(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
      setDeletingId(null);
    });
  }

  const cls = `form-panel${mobileVisible ? ' mobile-visible' : ''}`;

  if (status === 'loading') {
    return (
      <div className={cls}>
        <div className="sp-inner"><div className="sp-loading">Loading…</div></div>
      </div>
    );
  }

  if (status === 'no-auth') {
    return (
      <div className={cls}>
        <div className="sp-inner">
          <div className="sp-topbar">
            <button className="sp-back" onClick={onBack}>← Back</button>
          </div>
          <div className="sp-paywall">
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>Sign in to view your invoice history.</p>
          </div>
        </div>
      </div>
    );
  }

  const badgeLabel = badge === 'admin' ? 'Admin' : badge === 'pro' ? 'Pro' : 'Free';
  const badgeCls = `sp-plan-badge sp-plan-badge--${badge}`;

  if (status === 'free') {
    return (
      <div className={cls}>
        <div className="sp-inner">
          <div className="sp-topbar">
            <button className="sp-back" onClick={onBack}>← Back</button>
            <div className="sp-topbar-row">
              <h2 className="sp-title">History</h2>
              <span className={badgeCls}>{badgeLabel}</span>
            </div>
            <p className="sp-sub">Upgrade to Pro to view your invoice history.</p>
          </div>
          <div className="sp-paywall">
            <div className="sp-paywall-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0057FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="sp-paywall-title">Pro feature</h3>
            <p className="sp-paywall-desc">Upgrade to Pro to access your invoice history and sync across devices.</p>
            <a href="#" className="btn btn-primary sp-paywall-btn">Upgrade to Pro</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cls}>
      <div className="sp-inner">
        <div className="sp-topbar">
          <button className="sp-back" onClick={onBack}>← Back</button>
          <div className="sp-topbar-row">
            <h2 className="sp-title">History</h2>
            <span className={badgeCls}>{badgeLabel}</span>
          </div>
          <p className="sp-sub">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''}</p>
        </div>

        {loadErr && <p className="sp-error">{loadErr}</p>}

        {!loadErr && invoices.length === 0 && (
          <div className="sp-empty">
            <p className="sp-empty-title">No invoices yet</p>
            <p className="sp-empty-sub">Download an invoice and it will appear here.</p>
          </div>
        )}

        {invoices.map(inv => (
          <div key={inv.id} className="sp-hist-card">
            <div className="sp-hist-info">
              <div className="sp-hist-num">{inv.invoice_number || '—'}</div>
              {(inv.from_name || inv.to_name) && (
                <div className="sp-hist-meta">
                  {[inv.from_name, inv.to_name].filter(Boolean).join(' → ')}
                </div>
              )}
              <div className="sp-hist-date">{formatDate(inv.created_at)}</div>
            </div>
            <div className="sp-hist-right">
              <div className="sp-hist-total">{formatTotal(inv.total, inv.currency)}</div>
              <div className="sp-hist-actions">
                {inv.state && (
                  <button className="btn btn-ghost sp-hist-btn" onClick={() => handleLoad(inv)}>Edit</button>
                )}
                <a href={`/api/invoice-pdf/${inv.id}`} className="btn btn-ghost sp-hist-btn" download>PDF</a>
                {confirmId === inv.id ? (
                  <>
                    <button
                      className="btn btn-ghost sp-hist-btn sp-hist-del"
                      onClick={() => handleDelete(inv.id)}
                      disabled={deletingId === inv.id}
                    >
                      Sure?
                    </button>
                    <button className="btn btn-ghost sp-hist-btn" onClick={() => setConfirmId(null)}>✕</button>
                  </>
                ) : (
                  <button
                    className="btn btn-ghost sp-hist-btn sp-hist-del"
                    onClick={() => handleDelete(inv.id)}
                    disabled={deletingId === inv.id}
                  >
                    {deletingId === inv.id ? '…' : (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
