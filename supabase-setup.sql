-- Run this in your Supabase project: SQL Editor → New Query

create table if not exists invoices (
  id             uuid        default gen_random_uuid() primary key,
  created_at     timestamptz default now() not null,

  -- Indexed fields for quick queries / dashboard views
  invoice_number text,
  from_name      text,
  to_name        text,
  currency       text        not null default 'USD',
  template       text        not null default 'classic',
  theme          text        not null default 't-blue',
  subtotal       numeric(12, 2) not null default 0,
  total          numeric(12, 2) not null default 0,
  has_logo       boolean     not null default false,
  pdf_url        text,                              -- Vercel Blob public URL

  -- Full invoice state (logo stripped before save)
  state          jsonb       not null
);

-- Index for sorting by date in the dashboard
create index on invoices (created_at desc);

-- If the table already exists, add the pdf_url column:
-- alter table invoices add column if not exists pdf_url text;

-- ── Row Level Security ─────────────────────────────────────────────
-- The API route uses the service role key which bypasses RLS.
-- Enable RLS to block any direct anon/client access to the table.

alter table invoices enable row level security;

-- No public SELECT / INSERT / UPDATE / DELETE policies.
-- All access goes through the /api/save-invoice server route.
