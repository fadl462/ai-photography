-- HotFoto AI V47.8 PostgreSQL schema. The gateway also auto-creates these tables on boot.
-- Run manually if your deployment pipeline manages migrations separately.


create table if not exists hotfoto_deliveries (
  id text primary key, project_id text not null references hotfoto_projects(id) on delete cascade,
  user_id text not null references hotfoto_users(id) on delete cascade, token_hash text unique not null,
  title text not null, status text not null default 'published', asset_ids jsonb not null default '[]'::jsonb,
  options jsonb not null default '{}'::jsonb, expires_at timestamptz, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists hotfoto_deliveries_project_idx on hotfoto_deliveries(project_id, created_at desc);
create index if not exists hotfoto_deliveries_token_idx on hotfoto_deliveries(token_hash);

-- V48.2 client proofing
create table if not exists hotfoto_proof_actions (
  id text primary key,
  delivery_id text not null references hotfoto_deliveries(id) on delete cascade,
  asset_id text,
  client_key text not null,
  action text not null,
  value jsonb,
  comment text,
  client_name text,
  client_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists hotfoto_proof_action_unique_idx on hotfoto_proof_actions(delivery_id, asset_id, client_key, action);
create index if not exists hotfoto_proof_delivery_idx on hotfoto_proof_actions(delivery_id, created_at desc);
alter table hotfoto_deliveries add column if not exists proof_status text not null default 'open';
alter table hotfoto_deliveries add column if not exists client_name text;
alter table hotfoto_deliveries add column if not exists client_email text;
alter table hotfoto_deliveries add column if not exists submitted_at timestamptz;
