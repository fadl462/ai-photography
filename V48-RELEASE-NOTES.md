# HotFoto AI V48 — Project Workspace + Asset Browser

## Release focus
HotFoto now has a persistent workspace layer above the cloud asset infrastructure. The photographer can browse productions, inspect their cloud assets, see production-level metrics, create projects, rename projects, and request short-lived signed downloads.

## Production path
Studio upload → authenticated project → resumable cloud asset → asset ledger → Projects workspace → signed download / Studio continuation.

## Important implementation boundary
The workspace is production-oriented, but the prototype still requires deployment of the gateway with PostgreSQL and S3-compatible object storage for true cross-device persistence. Local JSON fallback remains available for development.

## Validation
- Node syntax checks passed for `gateway-server.mjs`, `db.mjs`, `storage.mjs`, `js/app.js`, `js/projects.js`.
- Project/asset ownership is checked server-side.
- Download URLs are signed server-side and expire.
