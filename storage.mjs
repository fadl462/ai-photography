import crypto from 'node:crypto';
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, HeadObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const BUCKET = process.env.HOTFOTO_STORAGE_BUCKET || '';
const REGION = process.env.HOTFOTO_STORAGE_REGION || process.env.AWS_REGION || 'auto';
const ENDPOINT = process.env.HOTFOTO_STORAGE_ENDPOINT || '';
const ACCESS_KEY = process.env.HOTFOTO_STORAGE_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_KEY = process.env.HOTFOTO_STORAGE_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
const PUBLIC_BASE = (process.env.HOTFOTO_STORAGE_PUBLIC_BASE || '').replace(/\/$/, '');
const PRESIGN_TTL = Math.max(60, Math.min(900, Number(process.env.HOTFOTO_STORAGE_PRESIGN_TTL || 600)));
const PART_SIZE = Math.max(5 * 1024 * 1024, Number(process.env.HOTFOTO_STORAGE_PART_SIZE || 16 * 1024 * 1024));
const MAX_UPLOAD_BYTES = Number(process.env.HOTFOTO_MAX_UPLOAD_BYTES || 25 * 1024 * 1024 * 1024);

const enabled = Boolean(BUCKET && ACCESS_KEY && SECRET_KEY);
const client = enabled ? new S3Client({
  region: REGION,
  endpoint: ENDPOINT || undefined,
  forcePathStyle: String(process.env.HOTFOTO_STORAGE_FORCE_PATH_STYLE || 'false') === 'true',
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY }
}) : null;

const safePart = n => { const x = Number(n); if (!Number.isInteger(x) || x < 1 || x > 10000) throw new Error('INVALID_PART_NUMBER'); return x; };
const safeKey = value => String(value || '').replace(/[^a-zA-Z0-9._\-/]/g, '_').slice(0, 700);
const publicUrl = key => PUBLIC_BASE ? `${PUBLIC_BASE}/${encodeURIComponent(key).replace(/%2F/g,'/')}` : null;
const requireStorage = () => { if (!enabled) throw new Error('OBJECT_STORAGE_NOT_CONFIGURED'); };

export function storageHealth() { return { enabled, provider: ENDPOINT ? 's3-compatible' : 's3', bucket: BUCKET || null, region: REGION, multipart: enabled, partSize: PART_SIZE, maxUploadBytes: MAX_UPLOAD_BYTES }; }

export async function initiateMultipart({ key, contentType, size, metadata = {} }) {
  requireStorage();
  if (!Number.isFinite(size) || size <= 0 || size > MAX_UPLOAD_BYTES) throw new Error('UPLOAD_SIZE_NOT_ALLOWED');
  const objectKey = safeKey(key);
  const command = new CreateMultipartUploadCommand({
    Bucket: BUCKET, Key: objectKey, ContentType: contentType || 'application/octet-stream',
    Metadata: Object.fromEntries(Object.entries(metadata).slice(0, 20).map(([k,v]) => [String(k).toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,50), String(v).slice(0,200)]))
  });
  const result = await client.send(command);
  if (!result.UploadId) throw new Error('MULTIPART_INIT_FAILED');
  const partCount = Math.ceil(size / PART_SIZE);
  if (partCount > 10000) throw new Error('UPLOAD_TOO_MANY_PARTS');
  const parts = [];
  for (let partNumber=1; partNumber<=partCount; partNumber++) {
    const url = await getSignedUrl(client, new UploadPartCommand({ Bucket: BUCKET, Key: objectKey, UploadId: result.UploadId, PartNumber: partNumber }), { expiresIn: PRESIGN_TTL });
    parts.push({ partNumber, url, offset: (partNumber-1)*PART_SIZE, size: Math.min(PART_SIZE, size-(partNumber-1)*PART_SIZE) });
  }
  return { uploadId: result.UploadId, key: objectKey, partSize: PART_SIZE, partCount, parts, expiresIn: PRESIGN_TTL, publicUrl: publicUrl(objectKey) };
}

export async function completeMultipart({ key, uploadId, parts }) {
  requireStorage();
  const objectKey = safeKey(key);
  if (!uploadId || !Array.isArray(parts) || !parts.length) throw new Error('MULTIPART_PARTS_REQUIRED');
  const normalized = parts.map(p => ({ PartNumber: safePart(p.partNumber), ETag: String(p.etag || p.ETag || '').trim() })).filter(p => p.ETag);
  if (!normalized.length) throw new Error('MULTIPART_ETAGS_REQUIRED');
  normalized.sort((a,b)=>a.PartNumber-b.PartNumber);
  const result = await client.send(new CompleteMultipartUploadCommand({ Bucket: BUCKET, Key: objectKey, UploadId: uploadId, MultipartUpload: { Parts: normalized } }));
  return { ok: true, key: objectKey, etag: result.ETag || null, location: result.Location || publicUrl(objectKey), publicUrl: publicUrl(objectKey) };
}

export async function abortMultipart({ key, uploadId }) {
  requireStorage();
  await client.send(new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: safeKey(key), UploadId: String(uploadId || '') }));
  return { ok: true };
}

export async function signedDownload({ key, expiresIn = PRESIGN_TTL }) {
  requireStorage();
  const safe = safeKey(key);
  const url = await getSignedUrl(client, new GetObjectCommand({ Bucket: BUCKET, Key: safe }), { expiresIn: Math.max(60, Math.min(900, Number(expiresIn) || PRESIGN_TTL)) });
  return { ok: true, url, expiresIn: Math.max(60, Math.min(900, Number(expiresIn) || PRESIGN_TTL)) };
}

export async function headObject({ key }) {
  requireStorage();
  const result = await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: safeKey(key) }));
  return { exists: true, bytes: result.ContentLength || 0, contentType: result.ContentType || null, etag: result.ETag || null, metadata: result.Metadata || {} };
}


export async function getObjectBuffer({ key }) {
  requireStorage();
  const result = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: safeKey(key) }));
  const chunks = [];
  for await (const chunk of result.Body) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export async function putObject({ key, body, contentType='application/octet-stream', metadata={} }) {
  requireStorage();
  const objectKey = safeKey(key);
  await client.send(new PutObjectCommand({ Bucket: BUCKET, Key: objectKey, Body: body, ContentType: contentType, Metadata: Object.fromEntries(Object.entries(metadata).slice(0,20).map(([k,v])=>[String(k).toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,50),String(v).slice(0,200)])) }));
  return { ok:true, key:objectKey, publicUrl:publicUrl(objectKey) };
}
