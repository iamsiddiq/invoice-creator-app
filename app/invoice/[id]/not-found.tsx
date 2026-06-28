import Link from 'next/link';

export default function InvoiceNotFound() {
  return (
    <div className="shared-page">
      <nav className="shared-nav">
        <div className="nav-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-compact-dark.svg" alt="MARAV." height="22" style={{ display: 'block' }} />
          <div className="nav-divider" />
          <div className="nav-product">Invoice</div>
        </div>
        <Link href="/" className="btn btn-ghost-dark" style={{ fontSize: 13 }}>
          Create Invoice
        </Link>
      </nav>
      <div className="not-found-body">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Invoice not found</h1>
        <p className="not-found-desc">
          This link may be invalid, or the invoice may have been removed.
        </p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: 8 }}>
          Create a New Invoice
        </Link>
      </div>
    </div>
  );
}
