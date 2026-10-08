# HotFoto AI V48.2 — Client Proofing & Approval

V48.2 turns the private delivery gallery into a two-way proofing workflow.

## Client actions
- Favorite a frame.
- Select frames for final delivery.
- Leave a frame-specific comment.
- Submit the proof once the selection is final.
- Submission becomes immutable from the client link.

## Photographer actions
- Delivery history shows proof state.
- Review proof exposes selected frames, favorites, comments and client identity.
- Owner endpoints remain authenticated and delivery-scoped.

## Security model
- Public proofing is authorized by the cryptographically random delivery token.
- A clientKey separates browser sessions for idempotent actions; it is not treated as identity.
- Asset IDs are checked against the delivery's allow-list.
- Expired deliveries cannot be modified.
- Submitted deliveries reject further proof actions.
- Photographer review requires the authenticated account that owns the delivery.

## Product principle
Client proofing is deliberately separated from the photographer's master production. Client feedback becomes an input signal, never a direct mutation of the original or master edit.
