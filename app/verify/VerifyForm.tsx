'use client';

import Link from 'next/link';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function VerifyForm({ email }: { email: string }) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function resend() {
    setResending(true);
    setError('');
    setResent(false);
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);
    if (err) {
      setError('Could not resend. Try again.');
    } else {
      setResent(true);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-compact-light.svg" alt="MARAV." height="28" style={{ display: 'block' }} />
          <div className="auth-brand-sub">Invoice</div>
        </div>

        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '8px 0 20px',
          background: 'rgba(0,87,255,0.07)', border: '1px solid rgba(0,87,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0057FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h1 className="auth-heading">Check your email</h1>
        <p className="auth-subheading">
          We sent a sign-in link to{' '}
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{email}</strong>.
          Tap the link in the email to sign in.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0 20px', color: 'var(--muted)', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1.2s linear infinite', flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          Waiting for you to click the link…
        </div>

        {error && <p className="auth-error">{error}</p>}
        {resent && <p className="auth-success">New link sent!</p>}

        <button
          className="auth-btn"
          onClick={resend}
          disabled={resending}
          style={{ background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}
        >
          {resending ? <span className="auth-spinner" /> : 'Resend link'}
        </button>

        <Link href="/login" className="auth-link-btn" style={{ marginTop: 8 }}>
          Try a different email
        </Link>
      </div>
    </div>
  );
}
