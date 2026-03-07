-- Peptide AI waitlist table
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste & run

create table if not exists waitlist (
  id         uuid        default gen_random_uuid() primary key,
  email      text        not null unique,
  phone      text,
  joined_at  timestamptz default now() not null
);

-- Index for fast duplicate checks on email
create index if not exists waitlist_email_idx on waitlist (email);

-- Row Level Security: deny all public access (backend uses service key which bypasses RLS)
alter table waitlist enable row level security;
