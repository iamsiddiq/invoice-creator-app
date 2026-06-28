'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (otpError) {
      setError('Could not send code. Try again.');
      setLoading(false);
      return;
    }

    router.push(`/verify?email=${encodeURIComponent(trimmed)}`);
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-compact-light.svg" alt="MARAV." height="28" style={{ display: 'block' }} />
          <div className="auth-brand-sub">Invoice</div>
        </div>

        <h1 className="auth-heading">Sign in</h1>
        <p className="auth-subheading">
          We&apos;ll email you a 6-digit code. No password needed.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="email">EMAIL</label>
          <input
            id="email"
            className="auth-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            disabled={loading}
            autoComplete="email"
          />
          {error && <p className="auth-error">{error}</p>}
          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Send Magic Code'}
          </button>
        </form>

        <p className="auth-footer-text">Professional invoices in seconds.</p>
        <Link href="/" className="auth-back-link">← Back to app</Link>
      </div>
    </div>
  );
}
