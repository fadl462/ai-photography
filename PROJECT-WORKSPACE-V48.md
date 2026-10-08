# HotFoto AI V48 — Project Workspace

V48 adds the persistent production workspace above the V47 cloud asset foundation.

## User flow
1. Sign in through the HotFoto gateway.
2. Open Projects.
3. Create or select a production.
4. Inspect cloud asset metadata, upload state, keeper/quality/style summary and dates.
5. Open the Studio for continued production.
6. Download completed assets through short-lived signed URLs when object storage is configured.

## API
- `GET /projects` — account-scoped project list
- `GET /projects/:id` — account-scoped project plus assets
- `GET /projects/:id/assets` — account-scoped asset list
- `POST /assets/download` — short-lived signed download URL

## Security
Project and asset access is always scoped to the authenticated user. The client cannot select an arbitrary profile ID. Download URLs are short-lived and generated server-side.

## Storage
The workspace does not proxy large files through the gateway. Originals continue to use the V47.9 multipart upload path and remain immutable.
