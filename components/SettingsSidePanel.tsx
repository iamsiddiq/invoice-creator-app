'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import SettingsForm from '@/app/settings/SettingsForm';

interface Profile {
  plan: string;
  business_name: string | null;
  business_email: string | null;
  business_address: string | null;
  business_phone: string | null;
  business_website: string | null;
  client_name: string | null;
  client_email: string | null;
  client_address: string | null;
  client_phone: string | null;
}

interface Props {
  onBack: () => void;
  mobileVisible: boolean;
}

export default function SettingsSidePanel({ onBack, mobileVisible }: Props) {
  const [status, setStatus] = useState<'loading' | 'no-auth' | 'ready'>('loading');
  const [userId, setUserId] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('no-auth'); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from('profiles')
        .select('plan, business_name, business_email, business_address, business_phone, business_website, client_name, client_email, client_address, client_phone')
        .eq('id', user.id)
        .single();

      setProfile(data ?? { plan: 'free', business_name: null, business_email: null, business_address: null, business_phone: null, business_website: null, client_name: null, client_email: null, client_address: null, client_phone: null });
      setStatus('ready');
    })();
  }, []);

  const cls = `form-panel${mobileVisible ? ' mobile-visible' : ''}`;
  const isPro = profile?.plan === 'pro';

  if (status === 'loading') {
    return (
      <div className={cls}>
        <div className="sp-inner"><div className="sp-loading">Loading…</div></div>
      </div>
    );
  }

  if (status === 'no-auth') {
    return (
      <div className={cls}>
        <div className="sp-inner">
          <div className="sp-topbar">
            <button className="sp-back" onClick={onBack}>← Back</button>
          </div>
          <p style={{ padding: '0 20px', color: 'var(--muted)', fontSize: 14 }}>
            Sign in to access settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cls}>
      <div className="sp-inner">
        <div className="sp-topbar">
          <button className="sp-back" onClick={onBack}>← Back</button>
          <div className="sp-topbar-row">
            <h2 className="sp-title">Settings</h2>
            <span className={`sp-plan-badge ${isPro ? 'sp-plan-badge--pro' : 'sp-plan-badge--free'}`}>
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>
          {isPro
            ? <p className="sp-sub">Your info is pre-filled on new invoices.</p>
            : <p className="sp-sub">Upgrade to Pro to save your business and client info.</p>
          }
        </div>

        {isPro ? (
          <SettingsForm userId={userId} initial={profile!} />
        ) : (
          <div className="sp-paywall">
            <div className="sp-paywall-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0057FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="sp-paywall-title">Pro feature</h3>
            <p className="sp-paywall-desc">Save your business info and default client — auto-filled on every new invoice.</p>
            <a href="#" className="btn btn-primary sp-paywall-btn">Upgrade to Pro</a>
          </div>
        )}
      </div>
    </div>
  );
}
