-- Migration: create partners table
-- Run this in Supabase: Dashboard → SQL Editor → New query → paste & run

CREATE TABLE IF NOT EXISTS partners (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name  text NOT NULL,
  contact_name  text NOT NULL,
  email         text NOT NULL UNIQUE,
  phone         text,
  brand_category text NOT NULL,
  website       text,
  partnership_idea text,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- Enable Row Level Security (no public reads — admin only)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

-- Only the service role key (used by your backend) can insert
CREATE POLICY "service role insert" ON partners
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Only the service role key can select
CREATE POLICY "service role select" ON partners
  FOR SELECT TO service_role
  USING (true);
