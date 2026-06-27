import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('invoices')
    .select('pdf_url, invoice_number')
    .eq('id', id)
    .single();

  if (error || !data?.pdf_url) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const blobRes = await fetch(data.pdf_url, {
    headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
  });

  if (!blobRes.ok) {
    return NextResponse.json({ error: 'PDF unavailable' }, { status: 502 });
  }

  const filename = `Invoice-${data.invoice_number ?? 'document'}.pdf`;
  const buffer = await blobRes.arrayBuffer();

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
