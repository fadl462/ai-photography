import http from 'node:http';
import { URL } from 'node:url';
import sharp from 'sharp';

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const VISION_MODEL = process.env.HOTFOTO_VISION_MODEL || 'gpt-6-luna';
const PLANNER_MODEL = process.env.HOTFOTO_PLANNER_MODEL || VISION_MODEL;
const IMAGE_MODEL = process.env.HOTFOTO_IMAGE_MODEL || 'gpt-image-2';
const MAX_BODY = Number(process.env.HOTFOTO_MAX_BODY || 28 * 1024 * 1024);
const WORKER_MAX_EDGE = Number(process.env.HOTFOTO_WORKER_MAX_EDGE || 5000);

const json = (res, status, body) => {
  const out = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
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

async function plan(body) {
  const prompt = `${systemRules}\nCreate a production plan for this shoot. Profile: ${body.shootProfile || 'auto'}. Mode: ${body.mode || 'auto'}. Frames: ${body.frameCount || 0}. Photographer intent: ${body.intent || 'none'}. Return JSON with keys: profile, summary, priorities (array), reviewThreshold (0-1), styleScore (0-100), stages (array of {name,enabled,reason}), riskNotes (array).`;
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
        version: 'v47.3',
        provider: OPENAI_API_KEY ? 'openai' : 'unconfigured',
        visionModel: VISION_MODEL,
        plannerModel: PLANNER_MODEL,
        capabilities: { plan: true, analyze: true, styleDNA: true, selfCorrection: true, quality: true, processImage: true, deliverManifest: true, deterministicWorker: true, generativeProviderHook: true }
      });
    }
    if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'METHOD_NOT_ALLOWED' });
    const body = await readBody(req);
    if (url.pathname === '/plan') return json(res, 200, await plan(body));
    if (url.pathname === '/analyze') return json(res, 200, await analyze(body));
    if (url.pathname === '/quality') return json(res, 200, await quality(body));
    if (url.pathname === '/style-dna') return json(res, 200, await styleDNA(body));
    if (url.pathname === '/self-correct') return json(res, 200, await selfCorrect(body));
    if (url.pathname === '/edit') return json(res, 200, await imageEdit(body));
    if (url.pathname === '/process') return json(res, 200, await processRequest(body));
    if (url.pathname === '/deliver') return json(res, 200, await deliver(body));
    return json(res, 404, { ok: false, error: 'NOT_FOUND' });
  } catch (err) {
    const code = String(err?.message || err);
    const status = code.includes('OPENAI_API_KEY_NOT_CONFIGURED') ? 503 : code.includes('BODY_TOO_LARGE') ? 413 : 400;
    return json(res, status, { ok: false, error: code });
  }
});

server.listen(PORT, HOST, () => console.log(`HotFoto AI Gateway listening on ${HOST}:${PORT}`));
