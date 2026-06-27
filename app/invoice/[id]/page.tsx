import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import type { InvoiceState } from '@/lib/types';
import SharedInvoiceView from './SharedInvoiceView';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_RE.test(id)) return { title: 'Invoice Not Found — MARAV' };

  const { data } = await supabase
    .from('invoices')
    .select('from_name, to_name, invoice_number')
    .eq('id', id)
    .single();

  if (!data) return { title: 'Invoice Not Found — MARAV' };

  const title = [
    data.invoice_number ? `Invoice #${data.invoice_number}` : 'Invoice',
    data.from_name ?? null,
  ].filter(Boolean).join(' · ');

  return {
    title: `${title} — MARAV`,
    description: `Invoice from ${data.from_name ?? 'Unknown'} to ${data.to_name ?? 'Unknown'}`,
  };
}

export default async function SharedInvoicePage({ params }: Props) {
  const { id } = await params;

  if (!UUID_RE.test(id)) notFound();

  const { data, error } = await supabase
    .from('invoices')
    .select('id, state, from_name, to_name, invoice_number, pdf_url, created_at')
    .eq('id', id)
    .single();

  if (error || !data) notFound();

  const invoiceState: InvoiceState = {
    ...(data.state as Omit<InvoiceState, 'logoDataUrl'>),
    logoDataUrl: null,
  };

  return (
    <SharedInvoiceView
      state={invoiceState}
      invoiceId={data.id}
      fromName={data.from_name}
      toName={data.to_name}
      invoiceNumber={data.invoice_number}
      createdAt={data.created_at}
    />
  );
}
