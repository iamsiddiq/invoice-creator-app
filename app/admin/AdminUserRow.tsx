'use client';

import { useState, useTransition } from 'react';
import { setPlan, setAdmin } from './actions';

interface AdminUserRowProps {
  user: {
    id: string;
    email: string;
    plan: string;
    isAdmin: boolean;
    invoiceCount: number;
    joinedAt: string;
  };
}

export default function AdminUserRow({ user }: AdminUserRowProps) {
  const [isPending, startTransition] = useTransition();
  const [localPlan, setLocalPlan] = useState(user.plan);
  const [localIsAdmin, setLocalIsAdmin] = useState(user.isAdmin);

  function togglePlan() {
    const next = localPlan === 'pro' ? 'free' : 'pro';
    setLocalPlan(next);
    startTransition(async () => {
      await setPlan(user.id, next as 'free' | 'pro');
    });
  }

  function toggleAdmin() {
    const next = !localIsAdmin;
    setLocalIsAdmin(next);
    startTransition(async () => {
      await setAdmin(user.id, next);
    });
  }

  const date = new Date(user.joinedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <tr className={isPending ? 'admin-row admin-row--pending' : 'admin-row'}>
      <td className="admin-td">
        <div className="admin-user-info">
          <div className="admin-avatar">{user.email[0]?.toUpperCase() ?? '?'}</div>
          <div>
            <div className="admin-user-email">{user.email}</div>
            <div className="admin-user-joined">Joined {date}</div>
          </div>
        </div>
      </td>
      <td className="admin-td admin-td-center">{user.invoiceCount}</td>
      <td className="admin-td admin-td-center">
        <button
          className={`admin-plan-badge ${localPlan === 'pro' ? 'admin-plan-badge--pro' : 'admin-plan-badge--free'}`}
          onClick={togglePlan}
          disabled={isPending}
          title="Click to toggle plan"
        >
          {localPlan === 'pro' ? 'Pro' : 'Free'}
        </button>
      </td>
      <td className="admin-td admin-td-center">
        <button
          className={`admin-admin-badge ${localIsAdmin ? 'admin-admin-badge--on' : 'admin-admin-badge--off'}`}
          onClick={toggleAdmin}
          disabled={isPending}
          title="Click to toggle admin"
        >
          {localIsAdmin ? 'Admin' : '—'}
        </button>
      </td>
    </tr>
  );
}
