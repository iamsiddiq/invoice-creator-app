'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface NavbarProps {
  onDownload?: () => void;
  onReset?: () => void;
  isGenerating?: boolean;
}

export default function Navbar({ onDownload, onReset, isGenerating }: NavbarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    setDropdownOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? '';

  return (
    <nav className="app-nav">
      <div className="nav-brand">
        <Link href="/" className="nav-logo-link">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-compact-dark.svg" alt="MARAV." height="22" style={{ display: 'block' }} />
        </Link>
        <div className="nav-divider" />
        <div className="nav-product">Invoice</div>
        {!user && <span className="badge badge-blue">Free</span>}
      </div>

      <div className="nav-actions">
        {/* History link — only when signed in */}
        {user && (
          <Link href="/history" className="btn btn-ghost-dark nav-history-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            History
          </Link>
        )}

        {/* Main page actions (only shown on the editor page) */}
        {onReset && (
          <button className="btn btn-ghost-dark" onClick={onReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Reset
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
        )}

        {/* Auth: avatar dropdown or sign-in link */}
        {user ? (
          <div className="nav-profile" ref={dropdownRef}>
            <button
              className="nav-avatar-btn"
              onClick={() => setDropdownOpen(v => !v)}
              title={user.email}
            >
              {initial}
            </button>
            {dropdownOpen && (
              <div className="nav-dropdown">
                <div className="nav-dropdown-email">{user.email}</div>
                <div className="nav-dropdown-divider" />
                <button className="nav-dropdown-item nav-dropdown-signout" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="btn btn-ghost-dark">
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
