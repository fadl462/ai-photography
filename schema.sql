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
