import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
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
      access: 'private',
      contentType: 'application/pdf',
    });

    // Upload logo to Vercel Blob if present
    let logoUrl: string | null = null;
    if (state.logoDataUrl) {
      const match = state.logoDataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const [, mimeType, b64] = match;
        const logoBuffer = Buffer.from(b64, 'base64');
        const logoFilename = `logos/${Date.now()}.${mimeType.split('/')[1] || 'png'}`;
        const { url } = await put(logoFilename, logoBuffer, {
          access: 'public',
          contentType: mimeType,
        });
        logoUrl = url;
      }
    }

    // Strip base64 logo before storing in Supabase (blob URL stored separately)
    const { logoDataUrl: _logo, ...stateWithoutLogo } = state;

    const { data: row, error } = await supabase.from('invoices').insert({
      invoice_number: state.invoiceNumber || null,
      from_name:      state.fromName     || null,
      to_name:        state.toName       || null,
      currency:       state.currency,
      template:       state.template,
      theme:          state.theme,
      subtotal:       totals.subtotal,
      total:          totals.total,
      has_logo:       !!state.logoDataUrl,
      logo_url:       logoUrl,
      pdf_url:        pdfUrl,
      state:          stateWithoutLogo,
    }).select('id').single();

    if (error) {
      console.error('[save-invoice]', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, pdfUrl, id: row.id });
  } catch (err) {
    console.error('[save-invoice] unexpected error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
