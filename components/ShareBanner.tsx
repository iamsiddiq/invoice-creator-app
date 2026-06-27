'use client';
import { useState } from 'react';

interface ShareBannerProps {
  shareId: string;
  onDismiss: () => void;
}

export default function ShareBanner({ shareId, onDismiss }: ShareBannerProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/invoice/${shareId}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — select the input as fallback
    }
  };

  return (
    <div className="share-banner">
      <div className="share-banner-inner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="share-banner-label">Invoice saved — share this link:</span>
        <input
          className="share-banner-input"
          readOnly
          value={shareUrl}
          onClick={e => (e.target as HTMLInputElement).select()}
        />
        <button className="btn btn-primary share-banner-copy" onClick={copy}>
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
        <button className="share-banner-dismiss" onClick={onDismiss} aria-label="Dismiss">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
