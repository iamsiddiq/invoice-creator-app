'use client';

import Link from 'next/link';
import InvoicePreview from '@/components/InvoicePreview';
import type { InvoiceState } from '@/lib/types';

interface Props {
  state: InvoiceState;
  invoiceId: string;
  fromName: string | null;
  toName: string | null;
  invoiceNumber: string | null;
  createdAt: string;
}

export default function SharedInvoiceView({ state, invoiceId, fromName, toName, invoiceNumber, createdAt }: Props) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const metaLabel = [
    fromName && toName ? `${fromName} → ${toName}` : (fromName ?? toName),
    invoiceNumber ? `#${invoiceNumber}` : null,
    `Generated ${formattedDate}`,
  ].filter(Boolean).join(' · ');

  return (
    <div className="shared-page">
      <nav className="shared-nav">
        <div className="nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-compact-dark.svg" alt="MARAV." height="22" style={{ display: 'block' }} />
          <div className="nav-divider" />
          <div className="nav-product">Shared Invoice</div>
        </div>
        <div className="nav-actions">
          <a
            href={`/api/invoice-pdf/${invoiceId}`}
            download
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '8px 16px' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download PDF
          </a>
          <Link href="/" className="btn btn-ghost-dark" style={{ fontSize: 13, padding: '8px 16px' }}>
            Create Your Own
          </Link>
        </div>
      </nav>

      {metaLabel && (
        <div className="shared-meta-bar">{metaLabel}</div>
      )}

      <div className="shared-preview-wrap">
        <InvoicePreview state={state} mobileVisible={true} />
      </div>
    </div>
  );
}
