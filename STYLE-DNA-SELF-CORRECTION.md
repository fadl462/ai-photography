# HotFoto AI V47.4 — Style DNA + Self-Correction

V47.4 turns two previously model-ready concepts into explicit gateway contracts.

## Style DNA
`POST /style-dna`

The gateway accepts up to 8 reference previews and asks the vision model to infer the photographer's consistent visual signature rather than the subject matter. The response contains a style score, signature traits, avoid traits and bounded recommended operations.

The Studio stores the latest learned profile locally as a convenience cache. A future authenticated project service should persist it server-side as a versioned photographer profile.

## Self-Correction
`POST /self-correct`

Quality Guard can now request a second opinion from the model when a processed keeper fails. The model is restricted to deterministic worker operations: exposure, contrast, saturation, sharpen, denoise and normalize. The Studio performs at most one correction pass per keeper in this prototype and then re-runs Quality Guard.

Generative edits are intentionally excluded from this correction loop. That prevents a quality checker from silently changing content when a deterministic photographic correction is sufficient.

## Production rule
The loop is:

**Develop → Quality Guard → Correct once if needed → Quality Guard again → Approve / Review**

A failed frame is never silently declared perfect.
