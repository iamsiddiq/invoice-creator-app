'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function deleteInvoice(id: string) {
  const supabase = await createClient();
  await supabase.from('invoices').delete().eq('id', id);
  revalidatePath('/history');
}
