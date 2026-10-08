# HotFoto AI V47.9 — Resumable Cloud Assets

V47.9 moves original-image transfer out of JSON/base64 gateway requests.

## Flow

Browser → authenticated HotFoto gateway → multipart session → signed object-storage URLs → direct browser upload → completion callback → asset metadata.

The gateway never needs to proxy the image bytes during the upload. This reduces memory pressure and makes large JPEG/TIFF/RAW workflows viable.

## Supported storage

The storage adapter uses the S3 API and therefore works with AWS S3 and S3-compatible providers such as Cloudflare R2, Backblaze B2 S3 API, MinIO and other compatible object stores.

## Environment

```env
HOTFOTO_STORAGE_BUCKET=hotfoto-assets
HOTFOTO_STORAGE_REGION=auto
HOTFOTO_STORAGE_ENDPOINT=https://<s3-compatible-endpoint>
HOTFOTO_STORAGE_ACCESS_KEY_ID=...
HOTFOTO_STORAGE_SECRET_ACCESS_KEY=...
HOTFOTO_STORAGE_FORCE_PATH_STYLE=false
HOTFOTO_STORAGE_PUBLIC_BASE=
HOTFOTO_STORAGE_PRESIGN_TTL=600
HOTFOTO_STORAGE_PART_SIZE=16777216
HOTFOTO_MAX_UPLOAD_BYTES=26843545600
```

For AWS S3, `HOTFOTO_STORAGE_ENDPOINT` may be left empty and the region should match the bucket.

## Required bucket CORS

Allow the HotFoto web origin to issue `PUT` requests to the bucket and expose `ETag`:

- Allowed methods: `PUT`, `GET`, `HEAD`
- Allowed headers: `*`
- Expose headers: `ETag`
- Allowed origin: the exact production HotFoto origin, not `*` in production

## API

- `POST /assets/multipart/init` — authenticated; creates an asset record and returns signed URLs for every part.
- `POST /assets/multipart/complete` — authenticated; validates ownership, completes the multipart upload and records the object metadata.
- `POST /assets/multipart/abort` — authenticated; cancels an incomplete upload.
- `GET /health/storage` — reports whether object storage is configured.

## Security rules

1. Never expose S3 credentials to the browser.
2. Signed URLs are short-lived.
3. Asset/project ownership is checked through the authenticated session.
4. Storage keys are account/project/asset scoped.
5. Originals are immutable application masters; generated renditions should use separate keys.
6. Configure bucket lifecycle rules to clean abandoned multipart uploads.
7. In production, restrict CORS to the exact application origin.

## Resumability

The browser uploads each part independently. If a network failure occurs, the individual part is retried without retransmitting earlier successful parts. A future worker can persist part completion state for pause/resume across browser restarts; V47.9 establishes the direct multipart transport and authenticated asset ledger.
