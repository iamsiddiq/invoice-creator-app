import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { supabase } from '@/lib/supabase';
import { calcTotals } from '@/lib/utils';
import type { InvoiceState } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const pdfFile = form.get('pdf') as File | null;
    const stateRaw = form.get('state') as string | null;

    if (!pdfFile || !stateRaw) {
      return NextResponse.json({ ok: false, error: 'Missing pdf or state' }, { status: 400 });
    }

    const state: InvoiceState = JSON.parse(stateRaw);
    const totals = calcTotals(state);

    // Upload PDF to Vercel Blob
    const filename = `invoices/${state.invoiceNumber || 'invoice'}-${Date.now()}.pdf`;
    const { url: pdfUrl } = await put(filename, pdfFile, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // Strip base64 logo before storing in Supabase
    const { logoDataUrl: _logo, ...stateWithoutLogo } = state;

    const { error } = await supabase.from('invoices').insert({
      invoice_number: state.invoiceNumber || null,
      from_name:      state.fromName     || null,
      to_name:        state.toName       || null,
      currency:       state.currency,
      template:       state.template,
      theme:          state.theme,
      subtotal:       totals.subtotal,
      total:          totals.total,
      has_logo:       !!state.logoDataUrl,
      pdf_url:        pdfUrl,
      state:          stateWithoutLogo,
    });

    if (error) {
      console.error('[save-invoice]', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pdfUrl });
  } catch (err) {
    console.error('[save-invoice] unexpected error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
