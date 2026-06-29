'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!data?.is_admin) throw new Error('Not authorized');
}

export async function setPlan(userId: string, plan: 'free' | 'pro') {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from('profiles').update({ plan }).eq('id', userId);
  revalidatePath('/admin');
}

export async function setAdmin(userId: string, isAdmin: boolean) {
  await requireAdmin();
  const admin = createAdminClient();
  await admin.from('profiles').update({ is_admin: isAdmin }).eq('id', userId);
  revalidatePath('/admin');
}

export async function inviteUser(
  email: string,
  plan: 'free' | 'pro',
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
  if (error) return { error: error.message };

  // Pre-set the plan so it's ready when they first sign in
  await admin.from('profiles').upsert(
    { id: data.user.id, email, plan },
    { onConflict: 'id' },
  );

  revalidatePath('/admin');
  return {};
}
