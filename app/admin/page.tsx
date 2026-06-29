import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import AdminUserRow from './AdminUserRow';
import InviteUserForm from './InviteUserForm';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) redirect('/');

  // Data fetching via admin client (bypasses RLS)
  const admin = createAdminClient();

  const [profilesRes, invoicesRes, recentRes] = await Promise.all([
    admin.from('profiles').select('id, email, plan, is_admin').order('email'),
    admin.from('invoices').select('user_id'),
    admin.from('invoices')
      .select('id, invoice_number, from_name, to_name, total, currency, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ]);

  const profiles = profilesRes.data ?? [];
  const invoices = invoicesRes.data ?? [];
  const recentInvoices = recentRes.data ?? [];

  // Count invoices per user
  const countMap: Record<string, number> = {};
  for (const inv of invoices) {
    if (inv.user_id) countMap[inv.user_id] = (countMap[inv.user_id] ?? 0) + 1;
  }

  // Get join dates from auth.users via admin API
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const joinedMap: Record<string, string> = {};
  for (const u of authUsers) joinedMap[u.id] = u.created_at;

  const totalUsers = profiles.length;
  const proUsers = profiles.filter(p => p.plan === 'pro').length;
  const totalInvoices = invoices.length;

  const rows = profiles.map(p => ({
    id: p.id,
    email: p.email ?? '(no email)',
    plan: p.plan ?? 'free',
    isAdmin: p.is_admin ?? false,
    invoiceCount: countMap[p.id] ?? 0,
    joinedAt: joinedMap[p.id] ?? new Date().toISOString(),
  }));

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin</h1>
        <p className="admin-sub">Signed in as {user.email}</p>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalUsers}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value admin-stat-value--blue">{proUsers}</div>
          <div className="admin-stat-label">Pro Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value admin-stat-value--muted">{totalUsers - proUsers}</div>
          <div className="admin-stat-label">Free Users</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-value">{totalInvoices}</div>
          <div className="admin-stat-label">Total Invoices</div>
        </div>
      </div>

      {/* Invite */}
      <div className="admin-section">
        <InviteUserForm />
      </div>

      {/* Users table */}
      <div className="admin-section">
        <h2 className="admin-section-title">Users</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">User</th>
                <th className="admin-th admin-th-center">Invoices</th>
                <th className="admin-th admin-th-center">Plan</th>
                <th className="admin-th admin-th-center">Admin</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <AdminUserRow key={row.id} user={row} />
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-td-empty">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent invoices */}
      <div className="admin-section">
        <h2 className="admin-section-title">Recent Invoices</h2>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-th">Invoice #</th>
                <th className="admin-th">From</th>
                <th className="admin-th">To</th>
                <th className="admin-th admin-th-center">Date</th>
                <th className="admin-th admin-th-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {recentInvoices.map(inv => (
                <tr key={inv.id} className="admin-row">
                  <td className="admin-td">
                    <span className="admin-inv-num">{inv.invoice_number ?? '—'}</span>
                  </td>
                  <td className="admin-td admin-td-muted">{inv.from_name ?? '—'}</td>
                  <td className="admin-td admin-td-muted">{inv.to_name ?? '—'}</td>
                  <td className="admin-td admin-td-center admin-td-muted">
                    {inv.created_at
                      ? new Date(inv.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="admin-td admin-td-right admin-td-bold">
                    {inv.total != null
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: inv.currency ?? 'USD',
                        }).format(inv.total)
                      : '—'}
                  </td>
                </tr>
              ))}
              {recentInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-td-empty">No invoices yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
