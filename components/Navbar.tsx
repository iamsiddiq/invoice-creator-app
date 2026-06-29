'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  onDownload?: () => void;
  isGenerating?: boolean;
  onShowHistory?: () => void;
  onShowSettings?: () => void;
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes('@')) { setError('Enter a valid email address.'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (err) { setError('Could not send link. Try again.'); return; }
    setSent(true);
  }

  return (
    <div
      ref={overlayRef}
      className="auth-modal-overlay"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">×</button>

        {!sent ? (
          <>
            <div className="auth-modal-brand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-compact-light.svg" alt="MARAV." height="22" />
            </div>
            <h2 className="auth-modal-heading">Sign in</h2>
            <p className="auth-modal-sub">We&apos;ll send you an email with a magic link. No password needed.</p>
            <form onSubmit={handleSubmit} style={{ width: '100%' }}>
              <label className="auth-label" htmlFor="modal-email">EMAIL</label>
              <input
                id="modal-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoFocus
                disabled={loading}
                autoComplete="email"
              />
              {error && <p className="auth-error" style={{ marginTop: 8 }}>{error}</p>}
              <button className="auth-btn" type="submit" disabled={loading} style={{ marginTop: 14 }}>
                {loading ? <span className="auth-spinner" /> : 'Send Magic Link'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 14, margin: '0 auto 16px',
              background: 'rgba(0,87,255,0.07)', border: '1px solid rgba(0,87,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0057FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h2 className="auth-modal-heading">Check your email</h2>
            <p className="auth-modal-sub">
              We sent a sign-in link to <strong>{email}</strong>. Tap the link in the email to sign in.
            </p>
            <button className="auth-btn" onClick={onClose} style={{ marginTop: 20, background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' }}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Navbar({ onDownload, isGenerating, onShowHistory, onShowSettings }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [isAdmin, setIsAdmin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  async function fetchProfile(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from('profiles')
      .select('plan, is_admin')
      .eq('id', userId)
      .single();
    setUserPlan((data?.plan === 'pro' ? 'pro' : 'free') as 'free' | 'pro');
    setIsAdmin(data?.is_admin ?? false);
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchProfile(data.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setAuthModalOpen(false);
        fetchProfile(session.user.id);
      } else {
        setUserPlan('free');
        setIsAdmin(false);
      }
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    function handleOpenAuth() { setAuthModalOpen(true); }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('marav:open-auth', handleOpenAuth);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('marav:open-auth', handleOpenAuth);
    };
  }, []);

  async function handleSignOut() {
    setDropdownOpen(false);
    // Clear state immediately so UI responds before the async signOut finishes
    setUser(null);
    setUserPlan('free');
    setIsAdmin(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '';

  return (
    <>
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}

      <nav className="app-nav">
        <div className="nav-brand">
          <Link href="/" className="nav-logo-link">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-compact-dark.svg" alt="MARAV." height="22" style={{ display: 'block' }} />
          </Link>
          <div className="nav-divider" />
          <div className="nav-product">Invoice</div>
        </div>

        <div className="nav-actions">
          {user && (
            <button
              className="btn btn-ghost-dark nav-history-btn"
              onClick={onShowHistory ?? (() => router.push('/history'))}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              History
            </button>
          )}

          {onDownload && (
            <button
              className="btn btn-primary"
              onClick={onDownload}
              disabled={isGenerating}
              style={{ opacity: isGenerating ? 0.75 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }}
            >
              {isGenerating ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Generating…</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>Download</>
              )}
            </button>
          )}

          {user && (
            <div className="nav-profile" ref={dropdownRef}>
              <button className="nav-avatar-btn" onClick={() => setDropdownOpen(v => !v)} title={user.email}>
                {initial}
              </button>
              {dropdownOpen && (
                <div className="nav-dropdown">
                  {/* Header: "Signed in as" + badge on one line, email below */}
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-signed-as-row">
                      <span className="nav-dropdown-signed-as">Signed in as</span>
                      <span className={`nav-plan-badge ${isAdmin ? 'nav-plan-badge--admin' : userPlan === 'pro' ? 'nav-plan-badge--pro' : 'nav-plan-badge--free'}`}>
                        {isAdmin ? 'Admin' : userPlan === 'pro' ? 'Pro' : 'Free'}
                      </span>
                    </div>
                    <div className="nav-dropdown-email">{user.email}</div>
                  </div>
                  <div className="nav-dropdown-divider" />

                  {isAdmin && (
                    <>
                      <Link href="/admin" className="nav-dropdown-item nav-dropdown-item--admin" onClick={() => setDropdownOpen(false)}>
                        Dashboard
                      </Link>
                      <div className="nav-dropdown-divider" />
                    </>
                  )}

                  <button
                    className="nav-dropdown-item"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onShowSettings) onShowSettings();
                      else router.push('/settings');
                    }}
                  >
                    Settings
                  </button>
                  <div className="nav-dropdown-divider" />
                  <button className="nav-dropdown-item nav-dropdown-signout" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
