# HotFoto AI V48.1 — Client Delivery & Proofing

## Goal
Turn completed productions into private, client-facing handoffs without exposing the photographer account.

## Added
- Delivery records scoped to photographer + project.
- Selected asset IDs only; no implicit project-wide exposure.
- Cryptographically random share tokens stored hashed server-side.
- Optional expiry.
- Public share endpoint resolves only the delivery's selected assets.
- Signed object-storage downloads are generated for each selected asset when cloud storage is configured.
- Private client gallery page with responsive presentation.
- Delivery history in the photographer workspace.
- Client Delivery action from Projects.

## Security rules
- Share tokens are never stored in plaintext in persistent storage.
- Public routes do not expose photographer email, account ID or project internals.
- Asset access is constrained by the delivery asset list.
- Expired deliveries return no assets.
- Object-storage URLs are short-lived.

## Prototype boundary
Local fallback mode can create delivery metadata, but actual client image viewing requires configured object storage with signed downloads.
