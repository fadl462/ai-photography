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
    create table if not exists hotfoto_deliveries (
      id text primary key, project_id text not null references hotfoto_projects(id) on delete cascade,
      user_id text not null references hotfoto_users(id) on delete cascade, token_hash text unique not null,
      title text not null, status text not null default 'published', asset_ids jsonb not null default '[]'::jsonb,
      options jsonb not null default '{}'::jsonb, expires_at timestamptz, created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );
    create index if not exists hotfoto_deliveries_project_idx on hotfoto_deliveries(project_id, created_at desc);
    create index if not exists hotfoto_deliveries_token_idx on hotfoto_deliveries(token_hash);
    create table if not exists hotfoto_proof_actions (
      id text primary key, delivery_id text not null references hotfoto_deliveries(id) on delete cascade,
      asset_id text, client_key text not null, action text not null, value jsonb, comment text,
      client_name text, client_email text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
    );
    create unique index if not exists hotfoto_proof_action_unique_idx on hotfoto_proof_actions(delivery_id, asset_id, client_key, action);
    create index if not exists hotfoto_proof_delivery_idx on hotfoto_proof_actions(delivery_id, created_at desc);
    alter table hotfoto_deliveries add column if not exists proof_status text not null default 'open';
    alter table hotfoto_deliveries add column if not exists client_name text;
    alter table hotfoto_deliveries add column if not exists client_email text;
    alter table hotfoto_deliveries add column if not exists submitted_at timestamptz;
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

export async function getProject(userId, projectId) {
  const p = await getPool();
  if (!p) {
    const projects = await read(`projects-${userId}.json`, []);
    const project = projects.find(x => x.id === projectId);
    if (!project) return null;
    const assets = await read(`assets-${projectId}.json`, []);
    return { ...project, assets };
  }
  const r = await p.query(`select id,name,shoot_profile as "shootProfile",status,summary,created_at as "createdAt",updated_at as "updatedAt" from hotfoto_projects where id=$1 and user_id=$2`, [projectId,userId]);
  if (!r.rowCount) return null;
  const a = await p.query(`select id,project_id as "projectId",name,storage_key as "storageKey",mime_type as "mimeType",bytes,width,height,sha256,metadata,created_at as "createdAt" from hotfoto_assets where project_id=$1 and user_id=$2 order by created_at asc`, [projectId,userId]);
  return { ...r.rows[0], assets: a.rows };
}

export async function listProjectAssets(userId, projectId) {
  const project = await getProject(userId, projectId);
  if (!project) throw new Error('PROJECT_NOT_FOUND');
  return project.assets || [];
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

export async function getAsset(userId, assetId) {
  const p = await getPool();
  if (!p) {
    const projects = await read(`projects-${userId}.json`, []);
    for (const project of projects) {
      const list = await read(`assets-${project.id}.json`, []);
      const found = list.find(x => x.id === assetId && x.userId === userId);
      if (found) return found;
    }
    return null;
  }
  const r = await p.query(`select id, project_id as "projectId", user_id as "userId", name, storage_key as "storageKey", mime_type as "mimeType", bytes, metadata from hotfoto_assets where id=$1 and user_id=$2`, [assetId, userId]);
  return r.rows[0] || null;
}

export async function updateAssetMetadata(userId, assetId, patch = {}) {
  const p = await getPool();
  if (!p) {
    const projects = await read(`projects-${userId}.json`, []);
    const projectIds = projects.map(x => x.id);
    for (const projectId of projectIds) {
      const list = await read(`assets-${projectId}.json`, []);
      const i = list.findIndex(x => x.id === assetId && x.userId === userId);
      if (i >= 0) { list[i] = { ...list[i], ...patch }; await write(`assets-${projectId}.json`, list); return list[i]; }
    }
    throw new Error('ASSET_NOT_FOUND');
  }
  const r = await p.query(`update hotfoto_assets set bytes=coalesce($3,bytes), metadata=coalesce($4,metadata) where id=$1 and user_id=$2 returning id, project_id as "projectId", storage_key as "storageKey", bytes, metadata`, [assetId,userId,patch.bytes ?? null,patch.metadata ?? null]);
  if (!r.rowCount) throw new Error('ASSET_NOT_FOUND');
  return r.rows[0];
}

export async function createDelivery(userId, projectId, body) {
  const p=await getPool();
  const id=`dly_${crypto.randomBytes(10).toString('hex')}`;
  const rawToken=crypto.randomBytes(32).toString('base64url');
  const tokenHash=crypto.createHash('sha256').update(rawToken).digest('hex');
  const title=String(body.title||'Client Delivery').slice(0,140);
  const assetIds=Array.isArray(body.assetIds)?body.assetIds.map(String).slice(0,500):[];
  const options=body.options&&typeof body.options==='object'?body.options:{};
  const expiresAt=body.expiresAt?new Date(body.expiresAt):null;
  if(expiresAt && Number.isNaN(expiresAt.getTime())) throw new Error('INVALID_EXPIRY');
  if(!p){
    const own=await getProject(userId,projectId); if(!own) throw new Error('PROJECT_NOT_FOUND');
    const list=await read(`deliveries-${userId}.json`,[]); const item={id,projectId,userId,title,status:'published',proofStatus:'open',clientName:null,clientEmail:null,submittedAt:null,assetIds,options,expiresAt:expiresAt?.toISOString()||null,tokenHash,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
    list.unshift(item); await write(`deliveries-${userId}.json`,list.slice(0,100)); return {...item,token:rawToken};
  }
  const own=await p.query('select 1 from hotfoto_projects where id=$1 and user_id=$2',[projectId,userId]); if(!own.rowCount) throw new Error('PROJECT_NOT_FOUND');
  await p.query('insert into hotfoto_deliveries(id,project_id,user_id,token_hash,title,asset_ids,options,expires_at) values($1,$2,$3,$4,$5,$6,$7,$8)',[id,projectId,userId,tokenHash,title,JSON.stringify(assetIds),JSON.stringify(options),expiresAt]);
  return {id,projectId,userId,title,status:'published',proofStatus:'open',clientName:null,clientEmail:null,submittedAt:null,assetIds,options,expiresAt:expiresAt?.toISOString()||null,createdAt:new Date().toISOString(),token:rawToken};
}
export async function listDeliveries(userId, projectId) {
  const p=await getPool(); if(!p){ const list=await read(`deliveries-${userId}.json`,[]); return list.filter(x=>x.projectId===projectId); }
  const r=await p.query('select id,project_id as "projectId",title,status,asset_ids as "assetIds",options,expires_at as "expiresAt",created_at as "createdAt",updated_at as "updatedAt" from hotfoto_deliveries where user_id=$1 and project_id=$2 order by created_at desc',[userId,projectId]); return r.rows;
}
export async function getProofing(delivery) {
  const p=await getPool();
  if(!p){ const list=await read(`proof-${delivery.id}.json`,[]); return {proofStatus:delivery.proofStatus||'open',clientName:delivery.clientName||null,clientEmail:delivery.clientEmail||null,submittedAt:delivery.submittedAt||null,actions:list}; }
  const r=await p.query('select id,asset_id as "assetId",client_key as "clientKey",action,value,comment,client_name as "clientName",client_email as "clientEmail",created_at as "createdAt",updated_at as "updatedAt" from hotfoto_proof_actions where delivery_id=$1 order by created_at asc',[delivery.id]);
  return {proofStatus:delivery.proofStatus||'open',clientName:delivery.clientName||null,clientEmail:delivery.clientEmail||null,submittedAt:delivery.submittedAt||null,actions:r.rows};
}
export async function saveProofAction(token, body) {
  const tokenHash=crypto.createHash('sha256').update(String(token||'')).digest('hex'); const p=await getPool();
  const delivery=await getPublicDelivery(token); if(!delivery || delivery.status==='expired') throw new Error('DELIVERY_NOT_FOUND');
  if(delivery.proofStatus==='submitted') throw new Error('PROOFING_SUBMITTED');
  const action=String(body.action||'').slice(0,40); if(!['favorite','select','comment'].includes(action)) throw new Error('INVALID_PROOF_ACTION');
  const assetId=body.assetId?String(body.assetId):null; if(action!=='comment' && !assetId) throw new Error('ASSET_REQUIRED');
  if(assetId && !(delivery.assetIds||[]).map(String).includes(assetId)) throw new Error('ASSET_NOT_IN_DELIVERY');
  const clientKey=String(body.clientKey||'').replace(/[^a-zA-Z0-9_-]/g,'').slice(0,80)||'anonymous';
  const value=body.value===undefined?null:body.value; const comment=String(body.comment||'').slice(0,1200); const clientName=String(body.clientName||'').slice(0,120); const clientEmail=String(body.clientEmail||'').slice(0,160);
  if(!p){ const list=await read(`proof-${delivery.id}.json`,[]); const idx=list.findIndex(x=>x.assetId===assetId&&x.clientKey===clientKey&&x.action===action); const item={id:`pfa_${crypto.randomBytes(8).toString('hex')}`,assetId,clientKey,action,value,comment,clientName:clientName||null,clientEmail:clientEmail||null,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}; if(idx>=0) list[idx]=item; else list.push(item); await write(`proof-${delivery.id}.json`,list); return item; }
  const id=`pfa_${crypto.randomBytes(8).toString('hex')}`;
  const r=await p.query(`insert into hotfoto_proof_actions(id,delivery_id,asset_id,client_key,action,value,comment,client_name,client_email) values($1,$2,$3,$4,$5,$6,$7,$8,$9)
    on conflict(delivery_id,asset_id,client_key,action) do update set value=excluded.value,comment=excluded.comment,client_name=excluded.client_name,client_email=excluded.client_email,updated_at=now()
    returning id,asset_id as "assetId",client_key as "clientKey",action,value,comment,client_name as "clientName",client_email as "clientEmail",created_at as "createdAt",updated_at as "updatedAt"`,[id,delivery.id,assetId,clientKey,action,value,comment,clientName||null,clientEmail||null]);
  return r.rows[0];
}
export async function submitProofing(token, body) {
  const delivery=await getPublicDelivery(token); if(!delivery || delivery.status==='expired') throw new Error('DELIVERY_NOT_FOUND');
  if(delivery.proofStatus==='submitted') return {ok:true,proofStatus:'submitted',submittedAt:delivery.submittedAt};
  const name=String(body.clientName||'').trim().slice(0,120); const email=String(body.clientEmail||'').trim().slice(0,160); if(!name) throw new Error('CLIENT_NAME_REQUIRED');
  const submittedAt=new Date().toISOString(); const p=await getPool();
  if(!p){ const pathName=`delivery-meta-${delivery.id}.json`; await write(pathName,{proofStatus:'submitted',clientName:name,clientEmail:email||null,submittedAt}); const list=await read(`deliveries-${delivery.userId}.json`,[]); const i=list.findIndex(x=>x.id===delivery.id); if(i>=0){list[i]={...list[i],proofStatus:'submitted',clientName:name,clientEmail:email||null,submittedAt}; await write(`deliveries-${delivery.userId}.json`,list);} return {ok:true,proofStatus:'submitted',clientName:name,clientEmail:email||null,submittedAt}; }
  await p.query('update hotfoto_deliveries set proof_status=\'submitted\',client_name=$2,client_email=$3,submitted_at=$4,updated_at=now() where id=$1',[delivery.id,name,email||null,submittedAt]);
  return {ok:true,proofStatus:'submitted',clientName:name,clientEmail:email||null,submittedAt};
}
export async function getDeliveryProofForOwner(userId, deliveryId) {
  const p=await getPool();
  if(!p){ const deliveries=await read(`deliveries-${userId}.json`,[]); const d=deliveries.find(x=>x.id===deliveryId); if(!d) throw new Error('DELIVERY_NOT_FOUND'); const actions=await read(`proof-${deliveryId}.json`,[]); return {...d,actions}; }
  const r=await p.query('select id,project_id as "projectId",title,status,proof_status as "proofStatus",client_name as "clientName",client_email as "clientEmail",submitted_at as "submittedAt",asset_ids as "assetIds",options,expires_at as "expiresAt",created_at as "createdAt" from hotfoto_deliveries where id=$1 and user_id=$2',[deliveryId,userId]); if(!r.rowCount) throw new Error('DELIVERY_NOT_FOUND'); const d=r.rows[0]; const a=await p.query('select id,asset_id as "assetId",client_key as "clientKey",action,value,comment,client_name as "clientName",client_email as "clientEmail",created_at as "createdAt",updated_at as "updatedAt" from hotfoto_proof_actions where delivery_id=$1 order by created_at asc',[deliveryId]); return {...d,actions:a.rows};
}

export async function getPublicDelivery(token) {
  const tokenHash=crypto.createHash('sha256').update(String(token||'')).digest('hex'); const p=await getPool();
  if(!p){ const files=await fs.readdir(path.join(DATA_DIR,'cloud-fallback')).catch(()=>[]); for(const f of files.filter(x=>x.startsWith('deliveries-')&&x.endsWith('.json'))){ const list=await read(f,[]); const hit=list.find(x=>x.tokenHash===tokenHash); if(hit){ const meta=await read(`delivery-meta-${hit.id}.json`,{}); return {...hit,...meta}; } } return null; }
  const r=await p.query('select id,project_id as "projectId",user_id as "userId",title,status,proof_status as "proofStatus",client_name as "clientName",client_email as "clientEmail",submitted_at as "submittedAt",asset_ids as "assetIds",options,expires_at as "expiresAt" from hotfoto_deliveries where token_hash=$1',[tokenHash]);
  const d=r.rows[0]; if(!d) return null; if(d.expiresAt && new Date(d.expiresAt).getTime()<=Date.now()) return {...d,status:'expired'}; return d;
}
