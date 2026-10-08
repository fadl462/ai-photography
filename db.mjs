import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const DATABASE_URL = process.env.DATABASE_URL || '';
const DATA_DIR = process.env.HOTFOTO_MEMORY_DIR || path.join(process.cwd(), 'data');
let pool = null;

async function getPool() {
  if (!DATABASE_URL) return null;
  if (pool) return pool;
  const { Pool } = await import('pg');
  pool = new Pool({ connectionString: DATABASE_URL, max: Number(process.env.HOTFOTO_DB_POOL_MAX || 10), ssl: process.env.HOTFOTO_DB_SSL === 'false' ? false : { rejectUnauthorized: false } });
  return pool;
}

const file = name => path.join(DATA_DIR, 'cloud-fallback', name);
const read = async (name, fallback) => { try { return JSON.parse(await fs.readFile(file(name), 'utf8')); } catch { return fallback; } };
const write = async (name, value) => { await fs.mkdir(path.dirname(file(name)), { recursive: true }); await fs.writeFile(file(name), JSON.stringify(value, null, 2)); };

export async function dbHealth() {
  const p = await getPool();
  if (!p) return { mode: 'local-fallback', connected: false };
  const r = await p.query('select now() as now');
  return { mode: 'postgres', connected: true, now: r.rows[0].now };
}

export async function ensureSchema() {
  const p = await getPool();
  if (!p) return false;
  await p.query(`
    create table if not exists hotfoto_users (
      id text primary key, email text unique not null, password_hash text not null, password_salt text not null,
      created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create table if not exists hotfoto_sessions (
      token_hash text primary key, user_id text not null references hotfoto_users(id) on delete cascade,
      email text not null, created_at timestamptz not null, expires_at timestamptz not null
    );
    create index if not exists hotfoto_sessions_user_idx on hotfoto_sessions(user_id);
    create table if not exists hotfoto_profiles (
      user_id text primary key references hotfoto_users(id) on delete cascade,
      style_dna jsonb, preferences jsonb not null default '{}'::jsonb,
      feedback jsonb not null default '{"approved":0,"rejected":0,"edited":0}'::jsonb,
      decisions jsonb not null default '[]'::jsonb, updated_at timestamptz not null default now()
    );
    create table if not exists hotfoto_projects (
      id text primary key, user_id text not null references hotfoto_users(id) on delete cascade,
      name text not null, shoot_profile text not null default 'auto', status text not null default 'active',
      summary jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create index if not exists hotfoto_projects_user_idx on hotfoto_projects(user_id, updated_at desc);
    create table if not exists hotfoto_assets (
      id text primary key, project_id text not null references hotfoto_projects(id) on delete cascade,
      user_id text not null references hotfoto_users(id) on delete cascade, name text not null,
      storage_key text, mime_type text, bytes bigint, width int, height int, sha256 text,
      metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
    );
    create index if not exists hotfoto_assets_project_idx on hotfoto_assets(project_id, created_at);
  `);
  return true;
}

export async function createUser({ id, email, passwordHash, salt }) {
  const p = await getPool();
  if (!p) {
    const users = await read('users.json', {}); if (users[email]) throw new Error('ACCOUNT_EXISTS');
    users[email] = { userId: id, email, passwordHash, salt, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; await write('users.json', users); return users[email];
  }
  try { await p.query('insert into hotfoto_users(id,email,password_hash,password_salt) values($1,$2,$3,$4)', [id,email,passwordHash,salt]); }
  catch (e) { if (e.code === '23505') throw new Error('ACCOUNT_EXISTS'); throw e; }
  return { userId:id, email, passwordHash, salt };
}
export async function findUser(email) {
  const p = await getPool();
  if (!p) { const users = await read('users.json', {}); return users[email] || null; }
  const r = await p.query('select id as "userId", email, password_hash as "passwordHash", password_salt as salt from hotfoto_users where email=$1', [email]); return r.rows[0] || null;
}
export async function saveSession(s) {
  const p = await getPool();
  if (!p) { const sessions = await read('sessions.json', {}); sessions[s.tokenHash] = s; await write('sessions.json', sessions); return; }
  await p.query('insert into hotfoto_sessions(token_hash,user_id,email,created_at,expires_at) values($1,$2,$3,$4,$5) on conflict(token_hash) do update set expires_at=excluded.expires_at', [s.tokenHash,s.userId,s.email,s.createdAt,new Date(s.expiresAt)]);
}
export async function getSession(tokenHash) {
  const p = await getPool();
  if (!p) { const sessions = await read('sessions.json', {}); return sessions[tokenHash] || null; }
  const r = await p.query('select token_hash as "tokenHash", user_id as "userId", email, created_at as "createdAt", extract(epoch from expires_at)*1000 as "expiresAt" from hotfoto_sessions where token_hash=$1', [tokenHash]); return r.rows[0] || null;
}
export async function deleteSession(tokenHash) {
  const p = await getPool(); if (!p) { const sessions = await read('sessions.json', {}); delete sessions[tokenHash]; await write('sessions.json', sessions); return; }
  await p.query('delete from hotfoto_sessions where token_hash=$1', [tokenHash]);
}

export async function getProfile(userId) {
  const p = await getPool();
  if (!p) return await read(`profile-${userId}.json`, { userId, styleDNA:null, preferences:{}, feedback:{approved:0,rejected:0,edited:0}, decisions:[], projects:[] });
  await p.query(`insert into hotfoto_profiles(user_id) values($1) on conflict(user_id) do nothing`, [userId]);
  const r = await p.query('select style_dna as "styleDNA", preferences, feedback, decisions from hotfoto_profiles where user_id=$1', [userId]);
  const projects = await p.query('select name as project, shoot_profile as "shootProfile", summary->>\'outcome\' as outcome, (summary->>\'quality\')::numeric as quality, (summary->>\'keepers\')::int as keepers, (summary->>\'frames\')::int as frames, (summary->>\'styleScore\')::numeric as "styleScore", created_at as at from hotfoto_projects where user_id=$1 order by updated_at desc limit 30', [userId]);
  const x = r.rows[0] || {}; return { userId, styleDNA:x.styleDNA, preferences:x.preferences||{}, feedback:x.feedback||{approved:0,rejected:0,edited:0}, decisions:x.decisions||[], projects:projects.rows };
}
export async function saveProfile(userId, mutator) {
  const current = await getProfile(userId); const next = mutator(structuredClone(current));
  const p = await getPool();
  if (!p) { await write(`profile-${userId}.json`, next); return next; }
  await p.query(`insert into hotfoto_profiles(user_id,style_dna,preferences,feedback,decisions) values($1,$2,$3,$4,$5)
    on conflict(user_id) do update set style_dna=excluded.style_dna, preferences=excluded.preferences, feedback=excluded.feedback, decisions=excluded.decisions, updated_at=now()`, [userId,next.styleDNA,next.preferences,next.feedback,next.decisions]);
  return next;
}
export async function createProject(userId, body) {
  const p = await getPool(); const id = `prj_${crypto.randomBytes(10).toString('hex')}`; const name=String(body.name||'Untitled Shoot').slice(0,120); const profile=String(body.shootProfile||'auto');
  if (!p) { const projects=await read(`projects-${userId}.json`,[]); const item={id,name,shootProfile:profile,status:'active',summary:{},createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}; projects.unshift(item); await write(`projects-${userId}.json`,projects.slice(0,100)); return item; }
  await p.query('insert into hotfoto_projects(id,user_id,name,shoot_profile) values($1,$2,$3,$4)',[id,userId,name,profile]); return {id,name,shootProfile:profile,status:'active'};
}
export async function listProjects(userId) {
  const p=await getPool(); if(!p) return await read(`projects-${userId}.json`,[]);
  const r=await p.query('select id,name,"shoot_profile" as "shootProfile",status,summary,"created_at" as "createdAt","updated_at" as "updatedAt" from hotfoto_projects where user_id=$1 order by updated_at desc limit 100',[userId]); return r.rows;
}
export async function updateProject(userId,id,patch) {
  const p=await getPool(); if(!p) { const projects=await read(`projects-${userId}.json`,[]); const i=projects.findIndex(x=>x.id===id); if(i<0) throw new Error('PROJECT_NOT_FOUND'); projects[i]={...projects[i],...patch,updatedAt:new Date().toISOString()}; await write(`projects-${userId}.json`,projects); return projects[i]; }
  const r=await p.query(`update hotfoto_projects set name=coalesce($3,name), status=coalesce($4,status), summary=coalesce($5,summary), updated_at=now() where id=$1 and user_id=$2 returning id,name,shoot_profile as "shootProfile",status,summary,created_at as "createdAt",updated_at as "updatedAt"`,[id,userId,patch.name||null,patch.status||null,patch.summary||null]); if(!r.rowCount) throw new Error('PROJECT_NOT_FOUND'); return r.rows[0];
}
export async function createAsset(userId, projectId, asset) {
  const p=await getPool(); const id=`ast_${crypto.randomBytes(10).toString('hex')}`;
  if(!p){ const key=`${userId}/${projectId}/${id}-${asset.name}`; const list=await read(`assets-${projectId}.json`,[]); const item={id,projectId,userId,name:asset.name,storageKey:key,mimeType:asset.mimeType||null,bytes:asset.bytes||null,metadata:asset.metadata||{},createdAt:new Date().toISOString()}; list.push(item); await write(`assets-${projectId}.json`,list); return item; }
  const own=await p.query('select 1 from hotfoto_projects where id=$1 and user_id=$2',[projectId,userId]); if(!own.rowCount) throw new Error('PROJECT_NOT_FOUND');
  const key=`${userId}/${projectId}/${id}-${asset.name}`; await p.query('insert into hotfoto_assets(id,project_id,user_id,name,storage_key,mime_type,bytes,metadata) values($1,$2,$3,$4,$5,$6,$7,$8)',[id,projectId,userId,asset.name,key,asset.mimeType||null,asset.bytes||null,asset.metadata||{}]); return {id,projectId,userId,name:asset.name,storageKey:key};
}
