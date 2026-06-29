import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();

  // Verify caller's JWT and check admin flag
  const { data: { user }, error: authErr } = await admin.auth.getUser(token);
  if (authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { email, plan = 'free' } = await req.json() as { email: string; plan?: string };
  if (!email?.includes('@')) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await admin.from('profiles').upsert(
    { id: data.user.id, email, plan },
    { onConflict: 'id' },
  );

  return NextResponse.json({ ok: true });
}
