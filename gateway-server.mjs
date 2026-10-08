import http from 'node:http';
import { URL } from 'node:url';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { dbHealth, ensureSchema, createUser, findUser, saveSession, getSession, deleteSession, getProfile, saveProfile, createProject, listProjects, getProject, listProjectAssets, updateProject, createAsset, getAsset, updateAssetMetadata, createDelivery, listDeliveries, getPublicDelivery, getProofing, saveProofAction, submitProofing, getDeliveryProofForOwner, finalizeDelivery, getFinalizationForOwner, createDeliveryPackagePlan, createAlbum, listAlbums, getAlbum } from './db.mjs';
import { storageHealth, initiateMultipart, completeMultipart, abortMultipart, headObject, signedDownload, getObjectBuffer, putObject } from './storage.mjs';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const VISION_MODEL = process.env.HOTFOTO_VISION_MODEL || 'gpt-6-luna';
const PLANNER_MODEL = process.env.HOTFOTO_PLANNER_MODEL || VISION_MODEL;
const IMAGE_MODEL = process.env.HOTFOTO_IMAGE_MODEL || 'gpt-image-2';
const MAX_BODY = Number(process.env.HOTFOTO_MAX_BODY || 28 * 1024 * 1024);
const WORKER_MAX_EDGE = Number(process.env.HOTFOTO_WORKER_MAX_EDGE || 5000);
const MEMORY_DIR = process.env.HOTFOTO_MEMORY_DIR || path.join(process.cwd(), 'data');
const AUTH_DIR = process.env.HOTFOTO_AUTH_DIR || path.join(MEMORY_DIR, 'auth');
const SESSION_TTL_MS = Number(process.env.HOTFOTO_SESSION_TTL_MS || 24 * 60 * 60 * 1000);
const APP_ORIGIN = process.env.HOTFOTO_APP_ORIGIN || '*';
const STORAGE_PROVIDER = process.env.HOTFOTO_STORAGE_PROVIDER || 'local';
const STORAGE_BUCKET = process.env.HOTFOTO_STORAGE_BUCKET || '';
const STORAGE_ENDPOINT = process.env.HOTFOTO_STORAGE_ENDPOINT || '';
const STORAGE_PUBLIC_BASE = process.env.HOTFOTO_STORAGE_PUBLIC_BASE || '';
const MAX_UPLOAD_BYTES = Number(process.env.HOTFOTO_MAX_UPLOAD_BYTES || 25 * 1024 * 1024 * 1024);


const authPath = path.join(AUTH_DIR, 'accounts.json');
const sessionsPath = path.join(AUTH_DIR, 'sessions.json');
const normalizeEmail = value => String(value || '').trim().toLowerCase().slice(0, 160);
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const scryptHash = (password, salt) => new Promise((resolve, reject) => crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, key) => err ? reject(err) : resolve(key.toString('hex'))));
async function readJsonFile(file, fallback) { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return fallback; } }
async function writeJsonFile(file, value) { await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, JSON.stringify(value, null, 2), 'utf8'); }
async function createAccount(body) {
  const email = normalizeEmail(body.email); const password = String(body.password || '');
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('INVALID_EMAIL');
  if (password.length < 10) throw new Error('PASSWORD_MIN_10');
  const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = await scryptHash(password, salt);
  const account = await createUser({ id:userId, email, passwordHash, salt });
  return issueSession(account);
}
async function issueSession(account) {
  const token = crypto.randomBytes(32).toString('base64url'); const now=Date.now();
  await saveSession({ tokenHash:hashToken(token), userId:account.userId, email:account.email, createdAt:new Date(now).toISOString(), expiresAt:now+SESSION_TTL_MS });
  return { ok:true, token, user:{id:account.userId,email:account.email}, expiresAt:new Date(now+SESSION_TTL_MS).toISOString() };
}
async function login(body) {
  const email=normalizeEmail(body.email); const password=String(body.password||''); const account=await findUser(email);
  if(!account) throw new Error('INVALID_CREDENTIALS'); const candidate=await scryptHash(password,account.salt);
  if(!crypto.timingSafeEqual(Buffer.from(candidate,'hex'),Buffer.from(account.passwordHash,'hex'))) throw new Error('INVALID_CREDENTIALS'); return issueSession(account);
}
async function authenticate(req) {
  const header=String(req.headers.authorization||''); const token=header.startsWith('Bearer ')?header.slice(7).trim():''; if(!token) throw new Error('AUTH_REQUIRED');
  const session=await getSession(hashToken(token)); if(!session || Number(session.expiresAt)<=Date.now()){ if(session) await deleteSession(hashToken(token)); throw new Error('AUTH_EXPIRED'); } return session;
}
async function logout(req) { const header=String(req.headers.authorization||''); const token=header.startsWith('Bearer ')?header.slice(7).trim():''; if(token) await deleteSession(hashToken(token)); return {ok:true}; }

async function projectCreate(body, userId) { return {ok:true, project:await createProject(userId,body)}; }
async function projectList(userId) { return {ok:true, projects:await listProjects(userId)}; }
async function projectDetail(userId, projectId) { const project=await getProject(userId, projectId); if(!project) throw new Error('PROJECT_NOT_FOUND'); return {ok:true, project}; }
async function projectAssets(userId, projectId) { return {ok:true, assets:await listProjectAssets(userId, projectId)}; }
async function projectUpdate(body,userId) { return {ok:true, project:await updateProject(userId,String(body.projectId||''),body)}; }
async function projectAsset(body,userId) { return {ok:true, asset:await createAsset(userId,String(body.projectId||''),{name:String(body.name||'asset'),mimeType:body.mimeType,bytes:body.bytes,metadata:body.metadata}) , storage:{provider:STORAGE_PROVIDER,bucket:STORAGE_BUCKET,endpoint:STORAGE_ENDPOINT,publicBase:STORAGE_PUBLIC_BASE||null}}; }
async function deliveryCreate(body,userId) { return {ok:true, delivery:await createDelivery(userId,String(body.projectId||''),body)}; }
async function deliveryList(body,userId) { return {ok:true, deliveries:await listDeliveries(userId,String(body.projectId||''))}; }
async function proofAction(body) { return {ok:true, action:await saveProofAction(String(body.token||''),body)}; }
async function proofSubmit(body) { return await submitProofing(String(body.token||''),body); }
async function proofOwner(body,userId) { return {ok:true, proof:await getDeliveryProofForOwner(userId,String(body.deliveryId||''))}; }
async function deliveryFinalize(body,userId) { return await finalizeDelivery(userId,String(body.deliveryId||''),body); }
async function finalizationOwner(body,userId) { return {ok:true, finalization:await getFinalizationForOwner(userId,String(body.deliveryId||''))}; }

async function storyIntelligence(assets, format='gallery') {
  const candidates = (assets || []).slice(0, 12);
  if (!OPENAI_API_KEY || !storageHealth().enabled || !candidates.length) {
    return { enabled:false, reason:'MODEL_OR_STORAGE_UNAVAILABLE' };
  }
  const content = [{ type:'input_text', text:`${systemRules}\nYou are HotFoto Story Intelligence. Analyze these photographs as a professional photo editor sequencing a ${format} for a client. Judge the photographs as a set, not individually. Identify opening/hero/detail/context/closing moments, visual rhythm, emotional progression, repeated compositions, and weak transitions. Do not invent event chronology that cannot be inferred. Return JSON only with: rankedAssetIds (array containing only supplied IDs, strongest narrative order first), roles (object keyed by asset ID with one of cover, hero, transition, detail, context, closing), beatSummary (array of short strings), sequenceReason (string), confidence (0-1), warnings (array).` }];
  const supplied = [];
  for (const asset of candidates) {
    try {
      if (!asset.storageKey) continue;
      const download = await signedDownload({ key: asset.storageKey, expiresIn: 600 });
      if (!download?.url) continue;
      supplied.push(asset);
      content.push({ type:'input_text', text:`Asset ID: ${asset.id} · filename: ${asset.name || 'image'}` });
      content.push({ type:'input_image', image_url:download.url, detail:'low' });
    } catch {}
  }
  if (!supplied.length) return { enabled:false, reason:'NO_IMAGE_URLS' };
  const response = await openAIResponses({ model:VISION_MODEL, input:[{role:'user',content}], maxOutputTokens:1600 });
  const parsed = parseJson(extractText(response));
  if (!parsed) throw new Error('STORY_INVALID_JSON');
  const allowed = new Set(supplied.map(a=>a.id));
  const ranked = Array.isArray(parsed.rankedAssetIds) ? parsed.rankedAssetIds.filter(id=>allowed.has(id)) : [];
  for (const a of supplied) if (!ranked.includes(a.id)) ranked.push(a.id);
  return { enabled:true, provider:'openai', model:VISION_MODEL, rankedAssetIds:ranked, roles:parsed.roles||{}, beatSummary:Array.isArray(parsed.beatSummary)?parsed.beatSummary.slice(0,8):[], sequenceReason:String(parsed.sequenceReason||'').slice(0,900), confidence:Number(parsed.confidence||0), warnings:Array.isArray(parsed.warnings)?parsed.warnings.slice(0,8):[] };
}

function albumLayout(assets, format='gallery') {
  const imgs=(assets||[]).map((a,i)=>({assetId:a.id,name:a.name,storageKey:a.storageKey,mimeType:a.mimeType,width:a.width||a.metadata?.width||null,height:a.height||a.metadata?.height||null,role:i===0?'cover':(i<4?'hero':'story'),order:i+1}));
  const pages=[]; let page=1;
  if(imgs.length){ pages.push({page:page++,layout:'cover',assetIds:[imgs[0].assetId],headline:'Your Story, Beautifully Delivered'}); }
  for(let i=1;i<imgs.length;i+=3){ const chunk=imgs.slice(i,i+3); pages.push({page:page++,layout:chunk.length===1?'hero':chunk.length===2?'split':'triptych',assetIds:chunk.map(x=>x.assetId),headline:chunk.length===1?'Hero moment':chunk.length===2?'The story continues':'Story sequence'}); }
  return {format,theme:'cinematic-editorial',title:'AI Curated Story',coverAssetId:imgs[0]?.assetId||null,assets:imgs,pages,designRules:{keepFacesLarge:true,avoidAdjacentDuplicates:true,visualRhythm:'hero → detail → context',maxImagesPerSpread:3}};
}
async function albumPlan(body,userId){ const projectId=String(body.projectId||''); const assets=await listProjectAssets(userId,projectId); const selected=Array.isArray(body.assetIds)&&body.assetIds.length?assets.filter(a=>body.assetIds.includes(a.id)):assets; let story={enabled:false,reason:'DETERMINISTIC_LAYOUT'}; let ordered=selected; try { story=await storyIntelligence(selected,body.format||'gallery'); if(story.enabled&&Array.isArray(story.rankedAssetIds)){ const byId=new Map(selected.map(a=>[a.id,a])); ordered=story.rankedAssetIds.map(id=>byId.get(id)).filter(Boolean); } } catch(e){ story={enabled:false,reason:'MODEL_ERROR',error:String(e?.message||e).slice(0,180)}; } const plan=albumLayout(ordered,body.format||'gallery'); plan.storyIntelligence=story; return {ok:true,plan,projectId}; }
async function albumCreate(body,userId){ const plan=body.plan||{}; const row=await createAlbum(userId,String(body.projectId||''),{title:body.title,format:body.format||'gallery',plan}); return {ok:true,album:row}; }
async function albumList(body,userId){ return {ok:true,albums:await listAlbums(userId,String(body.projectId||''))}; }
async function albumGet(body,userId){ const album=await getAlbum(userId,String(body.albumId||'')); if(!album) throw new Error('ALBUM_NOT_FOUND'); return {ok:true,album}; }

async function publicDelivery(token) { const d=await getPublicDelivery(token); if(!d) throw new Error('DELIVERY_NOT_FOUND'); const proof=await getProofing(d); if(d.status==='expired') return {ok:true,delivery:d,proof,assets:[]}; const assets=[]; for(const id of (d.assetIds||[])){ const asset=await getAsset(d.userId,id); if(!asset) continue; let download=null; if(asset.storageKey && storageHealth().enabled){ try { download=await signedDownload({key:asset.storageKey,expiresIn:300}); } catch {} } assets.push({...asset,download}); } return {ok:true,delivery:d,proof,assets}; }

const json = (res, status, body) => {
  const out = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': APP_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Cache-Control': 'no-store'
  });
  res.end(out);
};

const readBody = req => new Promise((resolve, reject) => {
  let size = 0;
  const chunks = [];
  req.on('data', chunk => {
    size += chunk.length;
    if (size > MAX_BODY) { reject(new Error('BODY_TOO_LARGE')); req.destroy(); return; }
    chunks.push(chunk);
  });
  req.on('end', () => {
    try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')); }
    catch { reject(new Error('INVALID_JSON')); }
  });
  req.on('error', reject);
});

const extractText = data => {
  if (typeof data?.output_text === 'string') return data.output_text;
  const parts = [];
  for (const item of data?.output || []) {
    for (const c of item?.content || []) {
      if (typeof c?.text === 'string') parts.push(c.text);
    }
  }
  return parts.join('\n').trim();
};

const parseJson = text => {
  if (!text) return null;
  try { return JSON.parse(text); } catch {}
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
};

async function openAIResponses({ model, input, maxOutputTokens = 900 }) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY_NOT_CONFIGURED');
  const r = await fetch(`${OPENAI_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model,
      input,
      max_output_tokens: maxOutputTokens
    })
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`OPENAI_${r.status}: ${text.slice(0, 800)}`);
  return JSON.parse(text);
}

const systemRules = `You are HotFoto AI's photographic intelligence engine. You are not a generic image describer. Think like a professional photographer, editor and image-quality engineer. Preserve identity, natural skin texture, intentional lighting and photographic realism. Never invent certainty. Return conservative confidence scores. Output JSON only.`;

const safeProfileId = value => String(value || 'default').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80) || 'default';
const memoryPath = profileId => path.join(MEMORY_DIR, `profile-${safeProfileId(profileId)}.json`);
const defaultMemory = profileId => ({ profileId: safeProfileId(profileId), version: 3, styleDNA:null, preferences:{}, feedback:{approved:0,rejected:0,edited:0}, projects:[], decisions:[], updatedAt:new Date().toISOString() });
async function readMemory(profileId) { const m=await getProfile(profileId); return {...defaultMemory(profileId),...m,profileId:safeProfileId(profileId)}; }
async function writeMemory(memory) { memory.updatedAt=new Date().toISOString(); await saveProfile(memory.profileId,()=>memory); return memory; }
async function getMemory(body) { return {ok:true,...await readMemory(body.profileId)}; }
async function saveStyleMemory(body) { const memory=await readMemory(body.profileId); memory.styleDNA=body.styleDNA; memory.decisions=[{type:'style-dna-learned',project:body.project||null,references:body.references||body.styleDNA?.references||null,at:new Date().toISOString()},...memory.decisions].slice(0,100); return writeMemory(memory); }
async function saveFeedback(body) { const memory=await readMemory(body.profileId); const action=['approved','rejected','edited'].includes(body.action)?body.action:'edited'; memory.feedback[action]=Number(memory.feedback[action]||0)+1; memory.decisions=[{type:'photographer-feedback',action,frameName:body.frameName||null,project:body.project||null,note:String(body.note||'').slice(0,500),at:new Date().toISOString()},...memory.decisions].slice(0,200); return writeMemory(memory); }
async function savePreference(body) { const memory=await readMemory(body.profileId); const key=String(body.key||'').slice(0,100); if(!key) throw new Error('PREFERENCE_KEY_REQUIRED'); memory.preferences[key]={value:body.value??null,confidence:Math.max(0,Math.min(1,Number(body.confidence??0.7))),source:body.source||'photographer',updatedAt:new Date().toISOString()}; memory.decisions=[{type:'preference-learned',key,project:body.project||null,at:new Date().toISOString()},...memory.decisions].slice(0,200); return writeMemory(memory); }
async function saveProjectDecision(body) { const memory=await readMemory(body.profileId); const project=String(body.project||'UNTITLED').slice(0,120); const record={project,shootProfile:body.shootProfile||'auto',outcome:body.outcome||'completed',quality:Number(body.quality||0)||null,keepers:Number(body.keepers||0)||null,frames:Number(body.frames||0)||null,styleScore:Number(body.styleScore||0)||null,at:new Date().toISOString()}; memory.projects=[record,...(memory.projects||[]).filter(x=>x.project!==project)].slice(0,30); memory.decisions=[{type:'project-outcome',...record},...memory.decisions].slice(0,200); await writeMemory(memory); return {ok:true,...memory}; }
async function memorySummary(body) {
  const memory = await readMemory(body.profileId);
  const f = memory.feedback || {};
  const total = Number(f.approved || 0) + Number(f.rejected || 0);
  const approvalRate = total ? Math.round(Number(f.approved || 0) / total * 100) : null;
  return { ok: true, profileId: memory.profileId, styleDNA: memory.styleDNA ? { profileName: memory.styleDNA.profileName || 'Untitled Style', score: memory.styleDNA.score || null, confidence: memory.styleDNA.confidence || null, updatedAt: memory.updatedAt } : null, feedback: f, approvalRate, preferences: memory.preferences || {}, recentProjects: (memory.projects || []).slice(0, 8), learningSignals: { sampleSize: total, readyForPersonalization: total >= 5, message: total >= 5 ? 'HotFoto has enough explicit feedback to personalize decisions more aggressively.' : 'Collect at least 5 approval/rejection signals before treating feedback as a strong preference.' } };
}


async function plan(body) {
  const memory = await readMemory(body.profileId);
  const learnedStyle = memory.styleDNA ? JSON.stringify(memory.styleDNA).slice(0, 7000) : 'No persistent Style DNA yet.';
  const feedback = JSON.stringify(memory.feedback || {});
  const preferences = JSON.stringify(memory.preferences || {}).slice(0, 5000);
  const recentProjects = JSON.stringify((memory.projects || []).slice(0, 5));
  const prompt = `${systemRules}\nCreate a production plan for this shoot. Profile: ${body.shootProfile || 'auto'}. Mode: ${body.mode || 'auto'}. Frames: ${body.frameCount || 0}. Photographer intent: ${body.intent || 'none'}. Persistent photographer intelligence: ${learnedStyle}. Historical feedback counts: ${feedback}. Learned preferences: ${preferences}. Recent project outcomes: ${recentProjects}. Use learned intelligence as a preference, not a command, and preserve image-specific judgment. Return JSON with keys: profile, summary, priorities (array), reviewThreshold (0-1), styleScore (0-100), stages (array of {name,enabled,reason}), riskNotes (array).`;
  const response = await openAIResponses({
    model: PLANNER_MODEL,
    input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }],
    maxOutputTokens: 1200
  });
  const parsed = parseJson(extractText(response));
  if (!parsed) throw new Error('PLANNER_INVALID_JSON');
  return { ...parsed, provider: 'openai', model: PLANNER_MODEL, generatedAt: new Date().toISOString() };
}

async function analyze(body) {
  if (!body.image) throw new Error('IMAGE_REQUIRED');
  const prompt = `${systemRules}\nAnalyze this photograph for professional production. Return JSON with: scene, genre, subjects, lighting, composition, focusScore (0-100), technicalScore (0-100), expressionScore (0-100), visualScore (0-100), cullScore (0-100), confidence (0-1), flags (array), recommendedOperations (array), styleObservations (array). Focus on what can be reliably inferred from the image.`;
  const response = await openAIResponses({
    model: VISION_MODEL,
    input: [{ role: 'user', content: [
      { type: 'input_text', text: prompt },
      { type: 'input_image', image_url: body.image, detail: body.detail || 'low' }
    ] }],
    maxOutputTokens: 1200
  });
  const parsed = parseJson(extractText(response));
  if (!parsed) throw new Error('VISION_INVALID_JSON');
  return { ...parsed, provider: 'openai', model: VISION_MODEL, generatedAt: new Date().toISOString() };
}

async function styleDNA(body) {
  if (!Array.isArray(body.images) || !body.images.length) throw new Error('STYLE_IMAGES_REQUIRED');
  const images = body.images.slice(0, 8).filter(Boolean);
  const content = [{ type: 'input_text', text: `${systemRules}\nLearn a photographer's Style DNA from this small set of reference photographs. Infer the consistent photographic signature, not subject matter. Return JSON with: score (0-100), profileName, summary, exposureBias, contrast, saturation, colorCharacter, whiteBalanceCharacter, highlightRollOff, shadowCharacter, skinTreatment, sharpnessCharacter, grainCharacter, compositionCharacter, signatureTraits (array), avoidTraits (array), confidence (0-1), recommendedOperations (array of objects with type and value). Be conservative and do not invent a style when the references are inconsistent.` }];
  for (let i = 0; i < images.length; i++) {
    content.push({ type: 'input_text', text: `Reference ${i + 1}` });
    content.push({ type: 'input_image', image_url: images[i], detail: body.detail || 'low' });
  }
  const response = await openAIResponses({
    model: VISION_MODEL,
    input: [{ role: 'user', content }],
    maxOutputTokens: 1400
  });
  const parsed = parseJson(extractText(response));
  if (!parsed) throw new Error('STYLE_DNA_INVALID_JSON');
  return { ...parsed, provider: 'openai', model: VISION_MODEL, references: images.length, generatedAt: new Date().toISOString() };
}

async function selfCorrect(body) {
  if (!body.image) throw new Error('IMAGE_REQUIRED');
  const current = Array.isArray(body.operations) ? body.operations : [];
  const prompt = `${systemRules}\nAct as HotFoto's self-correction controller. Inspect the processed photograph and decide whether it is production-safe. Compare the visible result against the intended operations: ${JSON.stringify(current).slice(0, 4000)}. Return JSON with: pass (boolean), score (0-100), confidence (0-1), issues (array), corrections (array), rerun (boolean), operations (array). operations may only contain safe deterministic worker operations: exposure (-1 to 1), contrast (0.85 to 1.18), saturation (0.85 to 1.18), sharpen (0 to 2), denoise (1 to 5), normalize (true). Do not recommend generative edits here. Prefer the smallest correction that fixes a visible issue.`;
  const response = await openAIResponses({
    model: VISION_MODEL,
    input: [{ role: 'user', content: [
      { type: 'input_text', text: prompt },
      { type: 'input_image', image_url: body.image, detail: body.detail || 'low' }
    ] }],
    maxOutputTokens: 1100
  });
  const parsed = parseJson(extractText(response));
  if (!parsed) throw new Error('SELF_CORRECT_INVALID_JSON');
  const allowed = new Set(['exposure','contrast','saturation','sharpen','denoise','normalize']);
  parsed.operations = Array.isArray(parsed.operations) ? parsed.operations.filter(o => o && allowed.has(o.type)) : [];
  return { ...parsed, provider: 'openai', model: VISION_MODEL, generatedAt: new Date().toISOString() };
}

async function quality(body) {
  if (!body.image) throw new Error('IMAGE_REQUIRED');
  const prompt = `${systemRules}\nAct as HotFoto Quality Guard. Inspect this image for visible artifacts, identity drift, over-retouching, halos, clipping, unnatural skin, geometry problems and generative inconsistencies. Return JSON with: pass (boolean), score (0-100), confidence (0-1), issues (array), corrections (array), identitySafe (boolean).`;
  const response = await openAIResponses({
    model: VISION_MODEL,
    input: [{ role: 'user', content: [
      { type: 'input_text', text: prompt },
      { type: 'input_image', image_url: body.image, detail: body.detail || 'low' }
    ] }],
    maxOutputTokens: 900
  });
  const parsed = parseJson(extractText(response));
  if (!parsed) throw new Error('QUALITY_INVALID_JSON');
  return { ...parsed, provider: 'openai', model: VISION_MODEL, generatedAt: new Date().toISOString() };
}

const dataUrlToBuffer = value => {
  const match = String(value || '').match(/^data:([^;]+);base64,(.+)$/s);
  if (!match) throw new Error('INVALID_IMAGE_DATA_URL');
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
};

const bufferToDataUrl = (buffer, mime='image/jpeg') => `data:${mime};base64,${buffer.toString('base64')}`;
const imageEdit = async body => {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY_NOT_CONFIGURED');
  if (!body.image) throw new Error('IMAGE_REQUIRED');
  const { mime, buffer } = dataUrlToBuffer(body.image);
  const prompt = String(body.prompt || 'Improve this photograph naturally while preserving the subject identity, anatomy, camera realism and original composition.').slice(0, 6000);
  const form = new FormData();
  form.append('model', body.model || IMAGE_MODEL);
  form.append('prompt', prompt);
  form.append('image', new Blob([buffer], { type: mime || 'image/jpeg' }), body.filename || 'hotfoto-input.jpg');
  if (body.mask) {
    const mask = dataUrlToBuffer(body.mask);
    form.append('mask', new Blob([mask.buffer], { type: mask.mime || 'image/png' }), 'hotfoto-mask.png');
  }
  if (body.size) form.append('size', body.size);
  if (body.quality) form.append('quality', body.quality);
  if (body.output_format) form.append('output_format', body.output_format);
  if (body.background) form.append('background', body.background);
  if (body.input_fidelity) form.append('input_fidelity', body.input_fidelity);
  const r = await fetch(`${OPENAI_BASE_URL}/images/edits`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: form
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`OPENAI_IMAGE_${r.status}: ${text.slice(0, 1200)}`);
  const data = JSON.parse(text);
  const item = data?.data?.[0];
  if (!item?.b64_json) throw new Error('IMAGE_EDIT_NO_OUTPUT');
  return {
    ok: true,
    provider: 'openai',
    model: body.model || IMAGE_MODEL,
    image: `data:image/${body.output_format === 'jpeg' ? 'jpeg' : 'png'};base64,${item.b64_json}`,
    revisedPrompt: item.revised_prompt || null,
    usage: data.usage || null,
    generatedAt: new Date().toISOString()
  };
};


async function processRequest(body) {
  if (!body.image) throw new Error('IMAGE_REQUIRED');
  const { buffer: input } = dataUrlToBuffer(body.image);
  const meta = await sharp(input, { failOn: 'none' }).metadata();
  const requested = Array.isArray(body.operations) ? body.operations : [];
  const ops = requested.map(x => typeof x === 'string' ? { type: x } : x).filter(Boolean);
  let pipeline = sharp(input, { failOn: 'none' }).rotate();
  const maxEdge = Math.max(256, Math.min(WORKER_MAX_EDGE, Number(body.maxEdge || 2400)));
  if (meta.width && meta.height && Math.max(meta.width, meta.height) > maxEdge) pipeline = pipeline.resize({ width: meta.width >= meta.height ? maxEdge : undefined, height: meta.height > meta.width ? maxEdge : undefined, fit: 'inside', withoutEnlargement: true });

  const exposure = Number(ops.find(o => o.type === 'exposure')?.value ?? 0);
  const contrast = Number(ops.find(o => o.type === 'contrast')?.value ?? 1.04);
  const saturation = Number(ops.find(o => o.type === 'saturation')?.value ?? 1.04);
  const sharpness = Number(ops.find(o => o.type === 'sharpen')?.value ?? 0.7);
  const denoise = ops.find(o => o.type === 'denoise');
  const normalize = ops.some(o => o.type === 'normalize');

  // Deterministic photographic worker operations. Generative operations are intentionally
  // surfaced as pending jobs rather than faking pixel edits.
  if (normalize) pipeline = pipeline.normalize();
  if (exposure || contrast !== 1) {
    const gain = Math.max(0.25, Math.min(4, contrast));
    const offset = Math.max(-60, Math.min(60, exposure * 18));
    pipeline = pipeline.linear(gain, offset);
  }
  if (saturation !== 1) pipeline = pipeline.modulate({ saturation: Math.max(0, Math.min(2, saturation)) });
  if (denoise) pipeline = pipeline.median(Math.max(1, Math.min(9, Number(denoise.value || 3))));
  if (sharpness > 0) pipeline = pipeline.sharpen({ sigma: Math.max(0.1, Math.min(3, sharpness)) });

  const output = await pipeline.jpeg({ quality: Math.max(70, Math.min(96, Number(body.quality || 92))), mozjpeg: true }).toBuffer();
  const generative = ops.filter(o => ['generative-remove','generative-replace','generative-expand','super-resolution','background-replace','relight'].includes(o.type));
  return {
    ok: true, mode: 'image-worker',
    operationManifest: { id: `op_${Date.now().toString(36)}`, operations: ops, nonDestructive: true, originalProtected: true, status: generative.length ? 'PARTIAL_WITH_GENERATIVE_PENDING' : 'COMPLETE' },
    image: bufferToDataUrl(output),
    worker: { provider: 'sharp', input: { width: meta.width, height: meta.height, format: meta.format }, outputBytes: output.length, generatedOperations: ops.filter(o => !generative.includes(o)), pendingGenerativeOperations: generative }
  };
}


async function initMultipart(body, userId) {
  const projectId = String(body.projectId || '');
  const name = String(body.name || 'untitled-file').slice(0, 180);
  const size = Number(body.size || 0);
  if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
  if (!Number.isFinite(size) || size <= 0 || size > MAX_UPLOAD_BYTES) throw new Error('UPLOAD_SIZE_NOT_ALLOWED');
  const asset = await createAsset(userId, projectId, { name, mimeType: body.mimeType || 'application/octet-stream', bytes: size, metadata: { uploadStatus: 'initiated', uploadId: null } });
  const key = `${userId}/${projectId}/${asset.id}-${name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
  try {
    const upload = await initiateMultipart({ key, contentType: body.mimeType, size, metadata: { userId, projectId, assetId: asset.id } });
    const saved = await updateAssetMetadata(userId, asset.id, { metadata: { ...(asset.metadata || {}), uploadStatus: 'uploading', uploadId: upload.uploadId, key: upload.key } });
    return { ok: true, asset: { ...asset, ...saved, storageKey: upload.key }, upload };
  } catch (err) {
    await updateAssetMetadata(userId, asset.id, { metadata: { uploadStatus: 'failed', error: String(err.message || err).slice(0,300) } }).catch(()=>{});
    throw err;
  }
}
async function completeAssetUpload(body, userId) {
  const asset = await getAsset(userId, body.assetId);
  if (!asset) throw new Error('ASSET_NOT_FOUND');
  const meta = asset.metadata || {};
  const key = body.key || meta.key || asset.storageKey;
  const uploadId = body.uploadId || meta.uploadId;
  const result = await completeMultipart({ key, uploadId, parts: body.parts });
  const head = await headObject({ key });
  const updated = await updateAssetMetadata(userId, asset.id, { bytes: head.bytes || asset.bytes, metadata: { ...meta, uploadStatus: 'complete', completedAt: new Date().toISOString(), etag: head.etag || result.etag, contentType: head.contentType || asset.mimeType } });
  return { ok: true, asset: { ...asset, ...updated, storageKey: key }, object: { ...result, ...head } };
}
async function abortAssetUpload(body, userId) {
  const asset = await getAsset(userId, body.assetId);
  if (!asset) throw new Error('ASSET_NOT_FOUND');
  const meta = asset.metadata || {};
  await abortMultipart({ key: body.key || meta.key || asset.storageKey, uploadId: body.uploadId || meta.uploadId });
  const updated = await updateAssetMetadata(userId, asset.id, { metadata: { ...meta, uploadStatus: 'aborted', abortedAt: new Date().toISOString() } });
  return { ok: true, asset: { ...asset, ...updated } };
}

function crc32(buf) { let c=0xffffffff; for(const b of buf){ c ^= b; for(let k=0;k<8;k++) c=(c>>>1)^((c&1)?0xedb88320:0); } return (c^0xffffffff)>>>0; }
function zipStore(files) {
  const locals=[], centrals=[]; let offset=0;
  for(const f of files){ const name=Buffer.from(f.name); const data=Buffer.from(f.data); const crc=crc32(data); const local=Buffer.alloc(30+name.length); local.writeUInt32LE(0x04034b50,0); local.writeUInt16LE(20,4); local.writeUInt16LE(0,6); local.writeUInt16LE(0,8); local.writeUInt16LE(0,10); local.writeUInt16LE(0,12); local.writeUInt32LE(crc,14); local.writeUInt32LE(data.length,18); local.writeUInt32LE(data.length,22); local.writeUInt16LE(name.length,26); local.writeUInt16LE(0,28); name.copy(local,30); locals.push(local,data);
    const central=Buffer.alloc(46+name.length); central.writeUInt32LE(0x02014b50,0); central.writeUInt16LE(20,4); central.writeUInt16LE(20,6); central.writeUInt16LE(0,8); central.writeUInt16LE(0,10); central.writeUInt16LE(0,12); central.writeUInt16LE(0,14); central.writeUInt32LE(crc,16); central.writeUInt32LE(data.length,20); central.writeUInt32LE(data.length,24); central.writeUInt16LE(name.length,28); central.writeUInt16LE(0,30); central.writeUInt16LE(0,32); central.writeUInt16LE(0,34); central.writeUInt16LE(0,36); central.writeUInt32LE(0,38); central.writeUInt32LE(offset,42); name.copy(central,46); centrals.push(central); offset += local.length + data.length; }
  const centralSize=centrals.reduce((n,b)=>n+b.length,0), centralOffset=offset; const end=Buffer.alloc(22); end.writeUInt32LE(0x06054b50,0); end.writeUInt16LE(0,4); end.writeUInt16LE(0,6); end.writeUInt16LE(0,8); end.writeUInt16LE(files.length,10); end.writeUInt32LE(centralSize,12); end.writeUInt32LE(centralOffset,16); return Buffer.concat([...locals,...centrals,end]);
}
async function executeDeliveryPackage(body,userId){
  const deliveryId=String(body.deliveryId||''); const fin=await getFinalizationForOwner(userId,deliveryId); if(!fin) throw new Error('FINALIZATION_NOT_FOUND');
  const profiles={original_archive:{format:'original',maxWidth:null,quality:null,folder:'01-originals'},web_gallery:{format:'jpeg',maxWidth:2400,quality:86,folder:'02-web-gallery'},social:{format:'jpeg',maxWidth:2048,quality:88,folder:'03-social'},print:{format:'jpeg',maxWidth:6000,quality:96,folder:'04-print'}};
  const requested=Array.isArray(body.profiles)&&body.profiles.length?body.profiles:[String(body.profile||'web_gallery')]; const keys=[...new Set(requested.map(String).filter(k=>profiles[k]))]; if(!keys.length) throw new Error('NO_VALID_PACKAGE_PROFILES');
  const assets=[]; for(const id of fin.selectedAssetIds||[]){ const a=await getAsset(userId,id); if(!a) throw new Error(`ASSET_NOT_FOUND:${id}`); if(!a.storageKey) throw new Error(`ASSET_NOT_IN_OBJECT_STORAGE:${id}`); assets.push(a); }
  if(!storageHealth().enabled) throw new Error('OBJECT_STORAGE_NOT_CONFIGURED');
  const files=[]; const manifest=[];
  for(const key of keys){ const cfg=profiles[key]; for(const a of assets){ const input=await getObjectBuffer({key:a.storageKey}); let out=input, ext=path.extname(a.name||'').toLowerCase()||'.jpg', mime=a.mimeType||'image/jpeg';
      if(cfg.format==='jpeg'){ out=await sharp(input).rotate().resize({width:cfg.maxWidth,withoutEnlargement:true}).jpeg({quality:cfg.quality,mozjpeg:true}).toBuffer(); ext='.jpg'; mime='image/jpeg'; }
      const base=path.basename(a.name||`asset-${a.id}`,path.extname(a.name||'')); const name=`${cfg.folder}/${base}${ext}`; files.push({name,data:out}); manifest.push({assetId:a.id,profile:key,name,bytes:out.length,mimeType:mime}); }
  }
  const zip=zipStore(files); const projectId=String(fin.projectId); const storageKey=`${userId}/${projectId}/deliveries/${deliveryId}/HotFoto-${deliveryId}.zip`; await putObject({key:storageKey,body:zip,contentType:'application/zip',metadata:{deliveryId,projectId,userId}}); const dl=await signedDownload({key:storageKey,expiresIn:900});
  return {ok:true,status:'completed',deliveryId,projectId,package:{storageKey,download:dl,bytes:zip.length,files:manifest,profiles:keys,generatedAt:new Date().toISOString()}};
}

async function deliver(body) {
  return {
    ok: true,
    mode: 'manifest',
    destination: body.destination || 'client',
    files: body.files || [],
    metadata: body.metadata || {},
    status: 'READY_FOR_DELIVERY_WORKER'
  };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return json(res, 200, {
        ok: true,
        service: 'hotfoto-ai-gateway',
        version: 'v48.6',
        provider: OPENAI_API_KEY ? 'openai' : 'unconfigured',
        visionModel: VISION_MODEL,
        plannerModel: PLANNER_MODEL,
        capabilities: { plan: true, analyze: true, styleDNA: true, selfCorrection: true, quality: true, processImage: true, deliverManifest: true, clientDelivery: true, expiringShareLinks: true, deterministicWorker: true, generativeProviderHook: true, persistentIntelligence: true, preferenceLearning: true, projectMemory: true, accounts: true, hashedPasswords: true, expiringSessions: true, postgres: Boolean(process.env.DATABASE_URL), cloudProjectMetadata: Boolean(process.env.DATABASE_URL), objectStorage: storageHealth().enabled, multipartUploads: storageHealth().multipart, multiDeviceMemory: Boolean(process.env.DATABASE_URL), clientProofing: true, clientFavorites: true, clientSelection: true, clientComments: true, proofSubmission: true, finalization: true, deliveryIntelligence: true, clientFeedbackLearning: true, intelligentPackaging: true, packageProfiles: true, executionManifests: true, exportExecution: true, zipDelivery: true, signedPackageDownloads: true, albumDesigner: true, albumPlanning: true, galleryDesign: true, persistentAlbums: true, storyIntelligence: true, modelSequencing: true, narrativeBeats: true }
      });
    }
    if (req.method === 'GET' && url.pathname === '/health/db') return json(res, 200, await dbHealth());
    if (req.method === 'GET' && url.pathname === '/health/storage') return json(res, 200, storageHealth());
    if (req.method === 'GET' && url.pathname.startsWith('/share/')) return json(res, 200, await publicDelivery(url.pathname.slice('/share/'.length)));
    if (req.method === 'POST' && (url.pathname === '/share/proof/action' || url.pathname === '/share/proof/submit')) { const body = await readBody(req); return json(res, 200, url.pathname.endsWith('/action') ? await proofAction(body) : await proofSubmit(body)); }
    if (req.method === 'GET' && url.pathname === '/auth/me') { const session = await authenticate(req); return json(res, 200, { ok: true, user: { id: session.userId, email: session.email }, expiresAt: new Date(Number(session.expiresAt)).toISOString() }); }
    if (req.method === 'GET' && url.pathname === '/projects') return json(res, 200, await projectList((await authenticate(req)).userId));
    if (req.method === 'GET' && url.pathname.startsWith('/albums/')) { const session=await authenticate(req); return json(res,200,await albumGet({albumId:url.pathname.split('/').filter(Boolean)[1]},session.userId)); }
    if (req.method === 'GET' && url.pathname.startsWith('/projects/')) { const session=await authenticate(req); const parts=url.pathname.split('/').filter(Boolean); const projectId=parts[1]; if(parts[2]==='assets') return json(res,200,await projectAssets(session.userId,projectId)); return json(res,200,await projectDetail(session.userId,projectId)); }
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
    const body = await readBody(req);
    if (url.pathname === '/auth/register') return json(res, 201, await createAccount(body));
    if (url.pathname === '/auth/login') return json(res, 200, await login(body));
    if (url.pathname === '/auth/logout') return json(res, 200, await logout(req));
    const session = await authenticate(req);
    body.profileId = session.userId;
    if (url.pathname === '/projects/create') return json(res, 201, await projectCreate(body, session.userId));
    if (url.pathname === '/projects/update') return json(res, 200, await projectUpdate(body, session.userId));
    if (url.pathname === '/projects/assets') return json(res, 201, await projectAsset(body, session.userId));
    if (url.pathname === '/delivery/create') return json(res, 201, await deliveryCreate(body, session.userId));
    if (url.pathname === '/delivery/list') return json(res, 200, await deliveryList(body, session.userId));
    if (url.pathname === '/delivery/proof') return json(res, 200, await proofOwner(body, session.userId));
    if (url.pathname === '/delivery/finalize') return json(res, 200, await deliveryFinalize(body, session.userId));
    if (url.pathname === '/delivery/finalization') return json(res, 200, await finalizationOwner(body, session.userId));
    if (url.pathname === '/delivery/package-plan') return json(res, 200, await packagePlan(body, session.userId));
    if (url.pathname === '/assets/multipart/init') return json(res, 201, await initMultipart(body, session.userId));
    if (url.pathname === '/assets/multipart/complete') return json(res, 200, await completeAssetUpload(body, session.userId));
    if (url.pathname === '/assets/multipart/abort') return json(res, 200, await abortAssetUpload(body, session.userId));
    if (url.pathname === '/assets/download') { const asset=await getAsset(session.userId,String(body.assetId||'')); if(!asset) throw new Error('ASSET_NOT_FOUND'); if(!storageHealth().enabled) return json(res,200,{ok:true,url:null,local:true,storageKey:asset.storageKey}); return json(res,200,{...(await signedDownload({key:asset.storageKey})),assetId:asset.id}); }
    if (url.pathname === '/plan') return json(res, 200, await plan(body));
    if (url.pathname === '/analyze') return json(res, 200, await analyze(body));
    if (url.pathname === '/quality') return json(res, 200, await quality(body));
    if (url.pathname === '/style-dna') return json(res, 200, await styleDNA(body));
    if (url.pathname === '/memory') return json(res, 200, await getMemory(body));
    if (url.pathname === '/memory/style') return json(res, 200, await saveStyleMemory(body));
    if (url.pathname === '/memory/feedback') return json(res, 200, await saveFeedback(body));
    if (url.pathname === '/memory/preference') return json(res, 200, await savePreference(body));
    if (url.pathname === '/memory/project') return json(res, 200, await saveProjectDecision(body));
    if (url.pathname === '/memory/summary') return json(res, 200, await memorySummary(body));
    if (url.pathname === '/self-correct') return json(res, 200, await selfCorrect(body));
    if (url.pathname === '/edit') return json(res, 200, await imageEdit(body));
    if (url.pathname === '/process') return json(res, 200, await processRequest(body));
    if (url.pathname === '/delivery/execute') return json(res, 200, await executeDeliveryPackage(body, session.userId));
    if (url.pathname === '/album/plan') return json(res, 200, await albumPlan(body, session.userId));
    if (url.pathname === '/story/analyze') return json(res, 200, await storyIntelligence(await listProjectAssets(session.userId,String(body.projectId||'')),body.format||'gallery'));
    if (url.pathname === '/album/create') return json(res, 201, await albumCreate(body, session.userId));
    if (url.pathname === '/album/list') return json(res, 200, await albumList(body, session.userId));
    if (url.pathname === '/deliver') return json(res, 200, await deliver(body));
    return json(res, 404, { ok: false, error: 'NOT_FOUND' });
  } catch (err) {
    const code = String(err?.message || err);
    const status = code.includes('OPENAI_API_KEY_NOT_CONFIGURED') ? 503 : code.includes('BODY_TOO_LARGE') ? 413 : 400;
    return json(res, status, { ok: false, error: code });
  }
});

ensureSchema().then(() => server.listen(PORT, HOST, () => console.log(`HotFoto AI Gateway listening on ${HOST}:${PORT}`))).catch(err => { console.error('Schema initialization failed:', err); process.exit(1); });
