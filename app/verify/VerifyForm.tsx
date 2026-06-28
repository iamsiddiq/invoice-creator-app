'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  email: string;
  authError?: string;
}

export default function VerifyForm({ email, authError }: Props) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(authError === 'auth_failed' ? 'Link expired. Enter your code or request a new one.' : '');
  const [resent, setResent] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const code = digits.join('');

  async function verify(otp: string) {
    if (otp.length < 6 || loading) return;
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email',
    });

    if (verifyError) {
      setError('Invalid or expired code. Try again.');
      setDigits(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      setLoading(false);
      return;
    }

    router.replace('/');
  }

  function handleChange(i: number, val: string) {
    // Support paste into any box
    if (val.length > 1) {
      const clean = val.replace(/\D/g, '').slice(0, 6);
      const next = Array.from({ length: 6 }, (_, j) => clean[j] ?? '');
      setDigits(next);
      const last = Math.min(clean.length - 1, 5);
      inputs.current[last]?.focus();
      if (clean.length >= 6) verify(clean);
      return;
    }
    const digit = val.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    if (digit && i < 5) inputs.current[i + 1]?.focus();
    const joined = next.join('');
    if (joined.length === 6) verify(joined);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = '';
      setDigits(next);
      inputs.current[i - 1]?.focus();
    }
  }

  async function resend() {
    setError('');
    setResent(false);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResent(true);
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-compact-light.svg" alt="MARAV." height="28" style={{ display: 'block' }} />
          <div className="auth-brand-sub">Invoice</div>
        </div>

        <h1 className="auth-heading">Check your email</h1>
        <p className="auth-subheading">
          We sent a 6-digit code to{' '}
          <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{email}</strong>
        </p>

        <div className="otp-row">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={el => { inputs.current[i] = el; }}
              className="otp-box"
              type="text"
              inputMode="numeric"
              maxLength={i === 0 ? 6 : 1}
              value={d}
              autoFocus={i === 0}
              disabled={loading}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
            />
          ))}
        </div>

        {error && <p className="auth-error">{error}</p>}
        {resent && !error && <p className="auth-success">New code sent!</p>}

        <button
          className="auth-btn"
          onClick={() => verify(code)}
          disabled={loading || code.length < 6}
        >
          {loading ? <span className="auth-spinner" /> : 'Verify Code'}
        </button>

        <button className="auth-link-btn" onClick={resend} disabled={loading}>
          Didn&apos;t receive it? Resend code
        </button>
      </div>
    </div>
  );
}
