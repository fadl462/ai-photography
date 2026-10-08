# HotFoto AI V48.5 — Real Export Execution

V48.5 converts the V48.4 delivery manifests into actual downloadable packages.

## Flow

Finalized client selection → package profile → Image Worker export → ZIP assembly → object storage → short-lived signed download.

## Profiles

- `original_archive` — preserves the source bytes.
- `web_gallery` — JPEG, max 2400px, quality 86.
- `social` — JPEG, max 2048px, quality 88.
- `print` — JPEG, max 6000px, quality 96.

## Endpoint

`POST /delivery/execute`

Authenticated body:

```json
{"deliveryId":"del_…","profiles":["web_gallery","social"]}
```

The endpoint requires object storage and a finalized delivery. It reads approved assets from object storage, executes deterministic image transforms with Sharp, creates a ZIP package, stores it under the account/project/delivery namespace, and returns a 15-minute signed download URL.

## Safety rules

- Only assets in the finalized selection are exported.
- The original master is never overwritten.
- Package generation does not alter the source asset.
- Export completion is reported only after the ZIP is successfully written to object storage.
- Package downloads are short-lived signed URLs.
- Generative AI is not silently invoked during packaging.
