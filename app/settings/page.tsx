import { redirect } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createClient } from '@/lib/supabase/server';
import SettingsForm from './SettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, business_name, business_email, business_address, business_phone, business_website, client_name, client_email, client_address, client_phone')
    .eq('id', user.id)
    .single();

  const isPro = profile?.plan === 'pro';

  return (
    <div className="app" style={{ minHeight: '100vh' }}>
      <Navbar />
      <div className="history-page">
        <div className="history-header">
          <div>
            <h1 className="history-title">Settings</h1>
            <p className="history-subtitle">
              Signed in as <strong>{user.email}</strong>
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: isPro ? 'rgba(0,87,255,0.1)' : 'rgba(0,0,0,0.06)', color: isPro ? '#0057FF' : 'var(--muted)' }}>
                {isPro ? 'Pro' : 'Free'}
              </span>
            </p>
          </div>
          <Link href="/" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            ← Back
          </Link>
        </div>

        <SettingsForm
          userId={user.id}
          initial={{
            business_name: profile?.business_name ?? null,
            business_email: profile?.business_email ?? null,
            business_address: profile?.business_address ?? null,
            business_phone: profile?.business_phone ?? null,
            business_website: profile?.business_website ?? null,
            client_name: profile?.client_name ?? null,
            client_email: profile?.client_email ?? null,
            client_address: profile?.client_address ?? null,
            client_phone: profile?.client_phone ?? null,
          }}
        />
      </div>
    </div>
  );
}
