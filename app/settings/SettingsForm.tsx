'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
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

export default function SettingsForm({ userId, initial }: { userId: string; initial: Profile }) {
  const [biz, setBiz] = useState({
    name: initial.business_name ?? '',
    email: initial.business_email ?? '',
    address: initial.business_address ?? '',
    phone: initial.business_phone ?? '',
    website: initial.business_website ?? '',
  });
  const [client, setClient] = useState({
    name: initial.client_name ?? '',
    email: initial.client_email ?? '',
    address: initial.client_address ?? '',
    phone: initial.client_phone ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.from('profiles').upsert({
      id: userId,
      business_name: biz.name || null,
      business_email: biz.email || null,
      business_address: biz.address || null,
      business_phone: biz.phone || null,
      business_website: biz.website || null,
      client_name: client.name || null,
      client_email: client.email || null,
      client_address: client.address || null,
      client_phone: client.phone || null,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (err) { setError('Could not save. Try again.'); } else { setSaved(true); }
  }

  return (
    <div className="settings-form">
      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Business Info</h2>
          <p className="settings-section-sub">Pre-fills the &ldquo;From&rdquo; section on new invoices</p>
        </div>
        <div className="settings-fields">
          <Field label="Business name" value={biz.name} onChange={v => setBiz(b => ({ ...b, name: v }))} />
          <Field label="Email" value={biz.email} onChange={v => setBiz(b => ({ ...b, email: v }))} type="email" />
          <Field label="Address" value={biz.address} onChange={v => setBiz(b => ({ ...b, address: v }))} multiline />
          <Field label="Phone" value={biz.phone} onChange={v => setBiz(b => ({ ...b, phone: v }))} type="tel" />
          <Field label="Website" value={biz.website} onChange={v => setBiz(b => ({ ...b, website: v }))} type="url" />
        </div>
      </div>

      <div className="settings-section">
        <div className="settings-section-header">
          <h2 className="settings-section-title">Default Client</h2>
          <p className="settings-section-sub">Pre-fills the &ldquo;Bill To&rdquo; section on new invoices</p>
        </div>
        <div className="settings-fields">
          <Field label="Client name" value={client.name} onChange={v => setClient(c => ({ ...c, name: v }))} />
          <Field label="Email" value={client.email} onChange={v => setClient(c => ({ ...c, email: v }))} type="email" />
          <Field label="Address" value={client.address} onChange={v => setClient(c => ({ ...c, address: v }))} multiline />
          <Field label="Phone" value={client.phone} onChange={v => setClient(c => ({ ...c, phone: v }))} type="tel" />
        </div>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {saved && <p className="auth-success">Settings saved.</p>}

      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start' }}>
        {saving ? <span className="auth-spinner" /> : 'Save changes'}
      </button>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', multiline = false }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; multiline?: boolean;
}) {
  return (
    <div className="settings-field">
      <label className="settings-field-label">{label}</label>
      {multiline ? (
        <textarea
          className="settings-field-input"
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={2}
        />
      ) : (
        <input
          className="settings-field-input"
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
