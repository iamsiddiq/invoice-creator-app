import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import { formatDateDisplay } from '@/lib/utils';
import { LoadBtn, DeleteBtn } from './HistoryActions';

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

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹',
  AED: 'AED ', CAD: 'CA$', AUD: 'A$', SGD: 'S$', JPY: '¥',
};

function formatTotal(total: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? `${currency} `;
  return `${sym}${total.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, from_name, to_name, total, currency, created_at, template, state')
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="app" style={{ minHeight: '100vh' }}>
      <Navbar />

      <div className="history-page">
        <div className="history-header">
          <div>
            <h1 className="history-title">Invoice History</h1>
            <p className="history-subtitle">
              {invoices?.length ?? 0} invoice{invoices?.length !== 1 ? 's' : ''} saved to your account
            </p>
          </div>
          <Link href="/" className="btn btn-primary history-new-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Invoice
          </Link>
        </div>

        {error && (
          <div className="history-empty">
            <p className="history-empty-title">Could not load invoices</p>
            <p className="history-empty-desc">Please try refreshing the page.</p>
          </div>
        )}

        {!error && (!invoices || invoices.length === 0) && (
          <div className="history-empty">
            <div className="history-empty-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="history-empty-title">No invoices yet</p>
            <p className="history-empty-desc">
              Download an invoice from the editor and it will be saved here automatically.
            </p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: 16, textDecoration: 'none' }}>
              Create Invoice
            </Link>
          </div>
        )}

        {!error && invoices && invoices.length > 0 && (
          <div className="history-list">
            {invoices.map((inv: Invoice) => (
              <div key={inv.id} className="history-card">
                <div className="history-card-left">
                  <div className="history-card-number">
                    {inv.invoice_number || 'No number'}
                  </div>
                  <div className="history-card-meta">
                    {inv.from_name && <span>{inv.from_name}</span>}
                    {inv.from_name && inv.to_name && (
                      <span className="history-meta-sep">→</span>
                    )}
                    {inv.to_name && <span>{inv.to_name}</span>}
                  </div>
                  <div className="history-card-date">
                    {formatDateDisplay(inv.created_at.split('T')[0])}
                    <span className="history-card-template">{inv.template}</span>
                  </div>
                </div>
                <div className="history-card-right">
                  <div className="history-card-total">
                    {formatTotal(inv.total, inv.currency)}
                  </div>
                  <div className="history-card-actions">
                    {inv.state && <LoadBtn invoiceState={inv.state} />}
                    <a
                      href={`/api/invoice-pdf/${inv.id}`}
                      className="btn btn-ghost history-action-btn"
                      download
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      PDF
                    </a>
                    <Link
                      href={`/invoice/${inv.id}`}
                      className="btn btn-ghost history-action-btn"
                      target="_blank"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      View
                    </Link>
                    <DeleteBtn id={inv.id} invoiceNumber={inv.invoice_number} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
