# HotFoto AI V47.8 — Cloud Data Architecture

V47.8 moves persistent photographer intelligence from a single gateway filesystem toward a multi-device cloud architecture.

## Production data plane
- PostgreSQL: users, sessions, Style DNA, preferences, feedback, projects, asset metadata.
- Object storage: original and generated image binaries. Configure an S3-compatible provider through deployment secrets.
- Gateway: authentication and authorization remain server-side; every project query is scoped to the authenticated user.
- Local JSON remains only as a development fallback when `DATABASE_URL` is absent.

## New endpoints
- `GET /health/db`
- `GET /projects`
- `POST /projects/create`
- `POST /projects/update`
- `POST /projects/assets`

The asset endpoint currently records the storage key and metadata. A production deployment should add a presigned multipart upload flow before accepting large originals directly through the gateway.

## Security rules
1. Never expose DATABASE_URL or storage credentials to the browser.
2. Never accept a client-supplied owner/profile ID; derive it from the authenticated session.
3. Originals are immutable; generated renditions are separate assets.
4. Use TLS for PostgreSQL and object storage.
5. Add retention/deletion controls and audit logs before public launch.
6. Prefer private object buckets and short-lived signed download URLs.
7. Add rate limiting and CSRF/origin protections at the edge.

## Deployment state
This is a production-oriented architecture layer, not a claim that a cloud provider is already provisioned. Supply `DATABASE_URL` and storage credentials in the deployment environment to activate the cloud data plane.
