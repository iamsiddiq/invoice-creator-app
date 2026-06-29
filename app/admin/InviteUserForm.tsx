'use client';

import { useState, useTransition } from 'react';
import { inviteUser } from './actions';

export default function InviteUserForm() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  const [result, setResult] = useState<{ ok?: boolean; error?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setResult(null);
    const sent = email.trim();
    startTransition(async () => {
      const res = await inviteUser(sent, plan);
      if (res.error) {
        setResult({ error: res.error });
      } else {
        setResult({ ok: true });
        setEmail('');
        setPlan('free');
      }
    });
  }

  return (
    <div className="admin-invite-wrap">
      <div className="admin-invite-header">
        <h2 className="admin-section-title" style={{ margin: 0 }}>Invite User</h2>
        <p className="admin-invite-desc">
          Sends a sign-in link to the email address. You can pre-set their plan.
        </p>
      </div>
      <form className="admin-invite-form" onSubmit={handleSubmit}>
        <input
          className="admin-invite-input"
          type="email"
          placeholder="user@example.com"
          value={email}
          onChange={e => { setEmail(e.target.value); setResult(null); }}
          required
          disabled={isPending}
          autoComplete="email"
        />
        <select
          className="admin-invite-select"
          value={plan}
          onChange={e => setPlan(e.target.value as 'free' | 'pro')}
          disabled={isPending}
        >
          <option value="free">Free</option>
          <option value="pro">Pro</option>
        </select>
        <button
          className="btn btn-primary admin-invite-btn"
          type="submit"
          disabled={isPending || !email.trim()}
        >
          {isPending ? 'Sending…' : 'Send Invite'}
        </button>
      </form>
      {result?.ok && (
        <p className="admin-invite-success">
          ✓ Invite sent — they&apos;ll receive a sign-in link by email.
        </p>
      )}
      {result?.error && (
        <p className="admin-invite-error">{result.error}</p>
      )}
    </div>
  );
}
