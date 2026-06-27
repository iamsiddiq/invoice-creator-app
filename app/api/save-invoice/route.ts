import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calcTotals } from '@/lib/utils';
import type { InvoiceState } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const state: InvoiceState = await req.json();

    const totals = calcTotals(state);

    // Strip base64 logo — can be MBs, would exhaust free-tier storage quickly
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
      state:          stateWithoutLogo,
    });

    if (error) {
      console.error('[save-invoice]', error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[save-invoice] unexpected error', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
