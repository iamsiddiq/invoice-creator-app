'use client';

import React, { forwardRef } from 'react';
import type { InvoiceState, Totals } from '@/lib/types';

import { formatCurrency, formatDateDisplay, calcTotals } from '@/lib/utils';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

interface InvoicePreviewProps {
  state: InvoiceState;
  mobileVisible: boolean;
}

interface TplProps {
  state: InvoiceState;
  fmt: (n: number) => string;
  totals: Totals;
}

// ─── Shared sub-components ───────────────────────────────────────

function InvTable({ state, fmt }: { state: InvoiceState; fmt: (n: number) => string }) {
  return (
    <table className="inv-items-table">
      <thead>
        <tr>
          <th style={{ width: 'auto' }}>Description</th>
          <th style={{ width: 60 }}>Qty</th>
          <th style={{ width: 90 }}>Rate</th>
          <th style={{ width: 90 }}>Amount</th>
        </tr>
      </thead>
      <tbody>
        {state.items.length === 0 ? (
          <tr className="inv-empty-row">
            <td colSpan={4}>No items added yet</td>
          </tr>
        ) : (
          state.items.map(item => (
            <tr key={item.id}>
              <td className="inv-item-desc">
                {item.desc || <span style={{ color: '#D1D5DB' }}>Item description...</span>}
              </td>
              <td className="inv-item-qty" style={{ textAlign: 'right' }}>{item.qty}</td>
              <td className="inv-item-rate" style={{ textAlign: 'right' }}>{fmt(item.rate)}</td>
              <td className="inv-item-amount" style={{ textAlign: 'right' }}>{fmt(item.qty * item.rate)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

function InvTotals({ fmt, totals, state }: {
  fmt: (n: number) => string;
  totals: Totals;
  state: InvoiceState;
}) {
  const sgstLabel = `SGST${state.sgstType === 'percent' ? ` (${state.sgstValue}%)` : ''}`;
  const cgstLabel = `CGST${state.cgstType === 'percent' ? ` (${state.cgstValue}%)` : ''}`;
  return (
    <div className="inv-totals-block">
      <div className="inv-total-line"><span className="tl">Subtotal</span><span className="tv">{fmt(totals.subtotal)}</span></div>
      {totals.discountAmt > 0 && <div className="inv-total-line"><span className="tl">Discount</span><span className="tv">−{fmt(totals.discountAmt)}</span></div>}
      {totals.shipping > 0 && <div className="inv-total-line"><span className="tl">Shipping</span><span className="tv">{fmt(totals.shipping)}</span></div>}
      {state.currency === 'INR' ? (
        <>
          {totals.sgstAmt > 0 && <div className="inv-total-line"><span className="tl">{sgstLabel}</span><span className="tv">{fmt(totals.sgstAmt)}</span></div>}
          {totals.cgstAmt > 0 && <div className="inv-total-line"><span className="tl">{cgstLabel}</span><span className="tv">{fmt(totals.cgstAmt)}</span></div>}
        </>
      ) : (
        totals.taxAmt > 0 && <div className="inv-total-line"><span className="tl">Tax</span><span className="tv">{fmt(totals.taxAmt)}</span></div>
      )}
      <div className="inv-grand-total"><span className="tl">TOTAL DUE</span><span className="tv">{fmt(totals.total)}</span></div>
    </div>
  );
}

function InvNotes({ state }: { state: InvoiceState }) {
  return (
    <div className="inv-notes-block">
      {state.notes ? (
        <div className="inv-note-item">
          <div className="inv-section-label">NOTES</div>
          <div className="inv-note-text">{state.notes}</div>
        </div>
      ) : (
        <div className="inv-note-item preview-placeholder">
          <div className="inv-section-label">NOTES</div>
          <div className="inv-note-text">Thank you for your business!</div>
        </div>
      )}
      {state.terms ? (
        <div className="inv-note-item">
          <div className="inv-section-label">PAYMENT TERMS</div>
          <div className="inv-note-text">{state.terms}</div>
        </div>
      ) : (
        <div className="inv-note-item preview-placeholder">
          <div className="inv-section-label">PAYMENT TERMS</div>
          <div className="inv-note-text">Net 30 days from invoice date.</div>
        </div>
      )}
      {state.bankDetails ? (
        <div className="inv-note-item">
          <div className="inv-section-label">BANK DETAILS</div>
          <div className="inv-note-text">{state.bankDetails}</div>
        </div>
      ) : (
        <div className="inv-note-item preview-placeholder">
          <div className="inv-section-label">BANK DETAILS</div>
          <div className="inv-note-text">Bank name, Account no, IFSC...</div>
        </div>
      )}
    </div>
  );
}

function LogoPlaceholder({ onAccent }: { onAccent?: boolean }) {
  return (
    <div className={`inv-logo-placeholder${onAccent ? ' on-accent' : ''}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
      </svg>
      Your Logo
    </div>
  );
}

const FOOTER = () => (
  <div className="inv-footer">
    <div className="inv-footer-brand">
      <div className="inv-footer-line1">
        Generated by <span className="footer-logo-text">MARAV<span className="footer-logo-dot">.</span></span>
      </div>
      <div className="inv-footer-line2">
        Visit <a href="https://maravtech.com" target="_blank" rel="noopener noreferrer" className="footer-marav-link">maravtech.com</a> to create professional invoices.
      </div>
    </div>
  </div>
);

// ─── Template: Classic ───────────────────────────────────────────
function ClassicLayout({ state, fmt, totals }: TplProps) {
  const fromDetails = [state.fromAddress, state.fromEmail, state.fromPhone, state.fromWebsite].filter(Boolean).join('\n');
  const toDetails = [state.toAddress, state.toEmail, state.toPhone].filter(Boolean).join('\n');
  return (
    <>
      <div className="inv-header">
        <div className="inv-brand">
          {state.logoDataUrl
            ? <img src={state.logoDataUrl} className="inv-logo" alt="Logo" />
            : <LogoPlaceholder />
          }
          {state.fromName
            ? <div className="inv-company-name">{state.fromName}</div>
            : <div className="inv-company-name" style={{ color: '#D1D5DB', fontWeight: 400 }}>Business Name</div>
          }
          {fromDetails && <div className="inv-from-details">{fromDetails}</div>}
        </div>
        <div className="inv-meta">
          <div className="inv-title">INVOICE</div>
          {state.invoiceNumber && <div className="inv-number">#{state.invoiceNumber}</div>}
          <div className="inv-dates">
            <div className="inv-date-row"><span className="dl">Date:</span><span className="dv">{formatDateDisplay(state.invoiceDate)}</span></div>
            <div className="inv-date-row"><span className="dl">Due:</span><span className="dv">{formatDateDisplay(state.dueDate)}</span></div>
            {state.poNumber && <div className="inv-date-row"><span className="dl">PO:</span><span className="dv">{state.poNumber}</span></div>}
          </div>
        </div>
      </div>
      <div className="inv-bill-section">
        <div className="inv-bill-block">
          <div className="inv-section-label">BILL TO</div>
          {state.toName
            ? <div className="inv-client-name">{state.toName}</div>
            : <div className="inv-client-name" style={{ color: '#D1D5DB', fontWeight: 400 }}>Client Name</div>
          }
          {toDetails && <div className="inv-client-details">{toDetails}</div>}
        </div>
      </div>
      <div className="inv-table-wrap">
        <InvTable state={state} fmt={fmt} />
      </div>
      <div className="inv-bottom">
        <InvNotes state={state} />
        <InvTotals fmt={fmt} totals={totals} state={state} />
      </div>
      <FOOTER />
    </>
  );
}

// ─── Template: Modern (full-width accent header) ─────────────────
function ModernLayout({ state, fmt, totals }: TplProps) {
  const fromDetails = [state.fromAddress, state.fromEmail, state.fromPhone, state.fromWebsite].filter(Boolean).join('\n');
  const toDetails = [state.toAddress, state.toEmail, state.toPhone].filter(Boolean).join('\n');
  return (
    <>
      <div className="mod-header">
        <div>
          {state.logoDataUrl
            ? <img src={state.logoDataUrl} className="mod-logo" alt="Logo" />
            : <LogoPlaceholder onAccent />
          }
          {state.fromName
            ? <div className="mod-company">{state.fromName}</div>
            : <div className="mod-company" style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>Business Name</div>
          }
          {fromDetails && <div className="mod-from-details">{fromDetails}</div>}
        </div>
        <div className="mod-meta" style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="mod-invoice-title">INVOICE</div>
          {state.invoiceNumber && <div className="mod-number">#{state.invoiceNumber}</div>}
          <div className="mod-date-row"><span className="dl">Date</span><span className="dv">{formatDateDisplay(state.invoiceDate)}</span></div>
          <div className="mod-date-row"><span className="dl">Due</span><span className="dv">{formatDateDisplay(state.dueDate)}</span></div>
          {state.poNumber && <div className="mod-date-row"><span className="dl">PO</span><span className="dv">{state.poNumber}</span></div>}
        </div>
      </div>
      <div className="mod-bill">
        <div className="inv-section-label">BILL TO</div>
        {state.toName
          ? <div className="inv-client-name">{state.toName}</div>
          : <div className="inv-client-name" style={{ color: '#D1D5DB', fontWeight: 400 }}>Client Name</div>
        }
        {toDetails && <div className="inv-client-details">{toDetails}</div>}
      </div>
      <div className="inv-table-wrap">
        <InvTable state={state} fmt={fmt} />
      </div>
      <div className="inv-bottom">
        <InvNotes state={state} />
        <InvTotals fmt={fmt} totals={totals} state={state} />
      </div>
      <FOOTER />
    </>
  );
}

// ─── Template: Bold (accent sidebar left) ────────────────────────
function BoldLayout({ state, fmt, totals }: TplProps) {
  const fromDetails = [state.fromAddress, state.fromEmail, state.fromPhone, state.fromWebsite].filter(Boolean).join('\n');
  const toDetails = [state.toAddress, state.toEmail, state.toPhone].filter(Boolean).join('\n');
  return (
    <>
      <div className="bold-sidebar">
        <div className="bold-invoice-word">Invoice</div>
        <div className="bold-invoice-num">#{state.invoiceNumber || '—'}</div>
        {state.logoDataUrl
          ? <img src={state.logoDataUrl} className="bold-logo" alt="Logo" />
          : <LogoPlaceholder onAccent />
        }
        {state.fromName
          ? <div className="bold-company">{state.fromName}</div>
          : <div className="bold-company" style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>Business Name</div>
        }
        {fromDetails ? <div className="bold-from">{fromDetails}</div> : null}
        <div className="bold-dates-block">
          <div>
            <div className="bold-date-label">Date</div>
            <div className="bold-date-val">{formatDateDisplay(state.invoiceDate)}</div>
          </div>
          <div>
            <div className="bold-date-label">Due</div>
            <div className="bold-date-val">{formatDateDisplay(state.dueDate)}</div>
          </div>
          {state.poNumber && (
            <div>
              <div className="bold-date-label">PO</div>
              <div className="bold-date-val">{state.poNumber}</div>
            </div>
          )}
        </div>
      </div>
      <div className="bold-content">
        <div className="bold-bill">
          <div className="inv-section-label">BILL TO</div>
          {state.toName
            ? <div className="inv-client-name">{state.toName}</div>
            : <div className="inv-client-name" style={{ color: '#D1D5DB', fontWeight: 400 }}>Client Name</div>
          }
          {toDetails && <div className="inv-client-details">{toDetails}</div>}
        </div>
        <div className="bold-table-wrap">
          <InvTable state={state} fmt={fmt} />
        </div>
        <div className="bold-bottom">
          <InvNotes state={state} />
          <InvTotals fmt={fmt} totals={totals} state={state} />
        </div>
        <div className="bold-footer">
          <div className="inv-footer-brand">
            <div className="inv-footer-line1">Generated by <span className="footer-logo-text">MARAV<span className="footer-logo-dot">.</span></span></div>
            <div className="inv-footer-line2">Visit <a href="https://maravtech.com" target="_blank" rel="noopener noreferrer" className="footer-marav-link">maravtech.com</a> to create professional invoices.</div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Template: Minimal (clean typographic) ───────────────────────
function MinimalLayout({ state, fmt, totals }: TplProps) {
  const fromDetails = [state.fromAddress, state.fromEmail, state.fromPhone, state.fromWebsite].filter(Boolean).join('\n');
  const toDetails = [state.toAddress, state.toEmail, state.toPhone].filter(Boolean).join('\n');
  return (
    <>
      <div className="min-header">
        <div>
          {state.logoDataUrl
            ? <img src={state.logoDataUrl} className="min-logo" alt="Logo" />
            : <LogoPlaceholder />
          }
          {state.fromName
            ? <div className="min-company">{state.fromName}</div>
            : <div className="min-company" style={{ color: '#D1D5DB', fontWeight: 400 }}>Business Name</div>
          }
          {fromDetails && <div className="min-from-details">{fromDetails}</div>}
        </div>
        <div className="min-invoice-side">
          <div className="min-invoice-word">INVOICE</div>
          {state.invoiceNumber && <div className="min-invoice-num">#{state.invoiceNumber}</div>}
        </div>
      </div>
      <div className="min-divider" />
      <div className="min-meta-row">
        <div className="min-meta-item">
          <span className="min-meta-label">Date</span>
          <span className="min-meta-val">{formatDateDisplay(state.invoiceDate)}</span>
        </div>
        <div className="min-meta-item">
          <span className="min-meta-label">Due Date</span>
          <span className="min-meta-val">{formatDateDisplay(state.dueDate)}</span>
        </div>
        {state.poNumber && (
          <div className="min-meta-item">
            <span className="min-meta-label">PO Number</span>
            <span className="min-meta-val">{state.poNumber}</span>
          </div>
        )}
      </div>
      <div className="min-divider" />
      <div className="min-bill">
        <div className="min-bill-label">Bill To</div>
        {state.toName
          ? <div className="min-client">{state.toName}</div>
          : <div className="min-client" style={{ color: '#D1D5DB', fontWeight: 400 }}>Client Name</div>
        }
        {toDetails && <div className="min-client-details">{toDetails}</div>}
      </div>
      <div className="min-divider" />
      <div className="min-table-wrap">
        <table className="min-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Description</th>
              <th>Qty</th>
              <th>Rate</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {state.items.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#9CA3AF', padding: '16px 0' }}>No items added yet</td>
              </tr>
            ) : (
              state.items.map(item => (
                <tr key={item.id}>
                  <td className="min-item-desc">
                    {item.desc || <span style={{ color: '#D1D5DB' }}>Item description...</span>}
                  </td>
                  <td className="min-item-num">{item.qty}</td>
                  <td className="min-item-num">{fmt(item.rate)}</td>
                  <td className="min-item-amt">{fmt(item.qty * item.rate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="min-bottom">
        <div className="min-notes-block">
          {state.notes ? (
            <div><div className="min-note-label">Notes</div><div className="min-note-text">{state.notes}</div></div>
          ) : (
            <div className="preview-placeholder"><div className="min-note-label">Notes</div><div className="min-note-text">Thank you for your business!</div></div>
          )}
          {state.terms ? (
            <div><div className="min-note-label">Payment Terms</div><div className="min-note-text">{state.terms}</div></div>
          ) : (
            <div className="preview-placeholder"><div className="min-note-label">Payment Terms</div><div className="min-note-text">Net 30 days from invoice date.</div></div>
          )}
          {state.bankDetails ? (
            <div><div className="min-note-label">Bank Details</div><div className="min-note-text">{state.bankDetails}</div></div>
          ) : (
            <div className="preview-placeholder"><div className="min-note-label">Bank Details</div><div className="min-note-text">Bank name, Account no, IFSC...</div></div>
          )}
        </div>
        <div className="min-totals-block">
          <div className="min-total-row"><span className="tl">Subtotal</span><span className="tv">{fmt(totals.subtotal)}</span></div>
          {totals.discountAmt > 0 && <div className="min-total-row"><span className="tl">Discount</span><span className="tv">−{fmt(totals.discountAmt)}</span></div>}
          {totals.shipping > 0 && <div className="min-total-row"><span className="tl">Shipping</span><span className="tv">{fmt(totals.shipping)}</span></div>}
          {state.currency === 'INR' ? (
            <>
              {totals.sgstAmt > 0 && <div className="min-total-row"><span className="tl">SGST{state.sgstType === 'percent' ? ` (${state.sgstValue}%)` : ''}</span><span className="tv">{fmt(totals.sgstAmt)}</span></div>}
              {totals.cgstAmt > 0 && <div className="min-total-row"><span className="tl">CGST{state.cgstType === 'percent' ? ` (${state.cgstValue}%)` : ''}</span><span className="tv">{fmt(totals.cgstAmt)}</span></div>}
            </>
          ) : (
            totals.taxAmt > 0 && <div className="min-total-row"><span className="tl">Tax</span><span className="tv">{fmt(totals.taxAmt)}</span></div>
          )}
          <div className="min-grand-total">
            <span className="tl">Total Due</span>
            <span className="tv">{fmt(totals.total)}</span>
          </div>
        </div>
      </div>
      <div className="min-footer">
        <div className="inv-footer-brand">
          <div className="inv-footer-line1">Generated by <span className="footer-logo-text">MARAV<span className="footer-logo-dot">.</span></span></div>
          <div className="inv-footer-line2">Visit <a href="https://maravtech.com" target="_blank" rel="noopener noreferrer" className="footer-marav-link">maravtech.com</a> to create professional invoices.</div>
        </div>
      </div>
    </>
  );
}

// ─── Main component ──────────────────────────────────────────────
const InvoicePreview = forwardRef<HTMLDivElement, InvoicePreviewProps>(
  function InvoicePreview({ state, mobileVisible }, ref) {
    const fmt = (n: number) => formatCurrency(n, state.currency);
    const totals = calcTotals(state);
    const tplProps: TplProps = { state, fmt, totals };

    return (
      <main className={`preview-panel${mobileVisible ? ' mobile-visible' : ''}`}>
        <div className="preview-label">Live Preview</div>
        <div
          key={state.template}
          ref={ref}
          className={`invoice-doc ${state.theme} tpl-${state.template}`}
          id="invoice-doc"
          style={state.theme === 't-custom' ? {
            ['--inv-accent' as string]: state.customColor,
            ['--inv-accent-light' as string]: hexToRgba(state.customColor, 0.07),
          } as React.CSSProperties : undefined}
        >
          {state.template === 'modern'  && <ModernLayout  {...tplProps} />}
          {state.template === 'bold'    && <BoldLayout    {...tplProps} />}
          {state.template === 'minimal' && <MinimalLayout {...tplProps} />}
          {(state.template === 'classic' || !state.template) && <ClassicLayout {...tplProps} />}
        </div>
      </main>
    );
  }
);

export default InvoicePreview;
