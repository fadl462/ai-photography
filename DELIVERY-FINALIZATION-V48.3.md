# HotFoto AI V48.3 — Finalization & Delivery Intelligence

V48.3 closes the proofing loop. Once a client submits a proof, the photographer can finalize it. HotFoto validates the selection, identifies unresolved frames, creates a persistent finalization/package manifest, updates project readiness, and records client-selection signals in Photographer Intelligence.

## Flow
Client Proof → Submit → Photographer Review → Finalize → Validate → Package Manifest → Intelligence Feedback

## Rules
- Only assets in the published delivery can be selected.
- Finalization requires submitted proof.
- Duplicate selections are collapsed.
- Invalid asset IDs are surfaced as anomalies.
- Assets neither selected nor explicitly rejected are flagged as unresolved.
- Originals are never modified.
- Finalization is account/project/delivery scoped.
- Client selections feed aggregate feedback; they do not silently rewrite Style DNA.

## Endpoints
- `POST /delivery/finalize` — owner-only finalization.
- `POST /delivery/finalization` — owner-only finalization lookup.
