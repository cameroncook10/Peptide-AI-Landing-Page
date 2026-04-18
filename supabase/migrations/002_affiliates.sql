create table if not exists affiliates (
  id                    uuid        default gen_random_uuid() primary key,
  first_name            text        not null,
  last_name             text        not null,
  email                 text        not null unique,
  phone                 text,
  platforms             text[]      not null default '{}',
  audience_size         text,
  content_niche         text,
  promo_plan            text,
  existing_partnerships text,
  notes                 text,
  status                text        not null default 'pending',  -- pending | approved | rejected
  applied_at            timestamptz default now() not null
);

create index if not exists affiliates_email_idx  on affiliates (email);
create index if not exists affiliates_status_idx on affiliates (status);

alter table affiliates enable row level security;

-- Only the service role (backend) can read/write
create policy "service role full access"
  on affiliates
  using (true)
  with check (true);
