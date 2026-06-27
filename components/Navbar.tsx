interface NavbarProps {
  onDownload: () => void;
  onReset: () => void;
  isGenerating: boolean;
}

export default function Navbar({ onDownload, onReset, isGenerating }: NavbarProps) {
  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <div className="nav-logo-text">MARAV<span>.</span></div>
        <div className="nav-divider" />
        <div className="nav-product">Invoice Generator</div>
        <div className="nav-divider" />
        <span className="badge badge-blue">Free</span>
      </div>

      <div className="nav-actions">
        <button className="btn btn-ghost-dark" onClick={onReset}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Reset
        </button>
        <button className="btn btn-primary" onClick={onDownload} disabled={isGenerating}
          style={{ opacity: isGenerating ? 0.75 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }}>
          {isGenerating ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </>
          )}
        </button>
      </div>
    </nav>
  );
}
