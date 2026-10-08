# HotFoto AI V47.6 — Persistent Photographer Intelligence

V47.6 extends the V47.5 Photographer Intelligence layer into a persistent learning ledger.

## New in V47.6
- Persistent project outcome memory.
- Explicit photographer feedback ledger: approved / rejected / edited.
- Preference learning endpoint with confidence and source metadata.
- Memory summary endpoint for Studio intelligence status.
- AI Director planning now receives learned preferences and recent project outcomes.
- Personalization threshold: HotFoto requires at least five explicit approval/rejection signals before treating feedback as a strong preference.
- Studio Intelligence panel shows Style DNA, feedback signals, approval rate and recent productions.
- Completed productions are recorded server-side when the gateway is connected.
- Originals remain immutable; memory influences future decisions but never overrides image-specific judgment.

## New gateway endpoints
- `POST /memory` — complete profile memory
- `POST /memory/summary` — compact intelligence summary
- `POST /memory/style` — save Style DNA
- `POST /memory/feedback` — record photographer feedback
- `POST /memory/preference` — store an explicit preference signal
- `POST /memory/project` — store a completed production outcome

## Architecture
Photographer → Style DNA → Project → Quality Guard → Explicit Feedback → Intelligence Ledger → Future AI Director Plans

The system intentionally does not claim that a few clicks are enough to “train a model.” It stores structured preference signals that can later feed a real account-level learning system.

## Validation
- `node --check js/app.js` passed.
- `node --check gateway-server.mjs` passed.
- V47 capability map preserved.
## V47.4 — Style DNA + Self-Correction

- Model-backed Style DNA learning from the strongest reference frames.
- Bounded self-correction loop after Quality Guard failures.
- Deterministic correction operations only; generative edits remain separate.
- One correction pass per keeper, followed by an independent Quality Guard re-check.
- Originals remain immutable.

# HotFoto AI Studio V47

V46 is the Studio product architecture upgrade focused on the 50-capability autonomous photography engine.

## Included
- Autonomous Studio cockpit
- Real browser-side image analysis and adaptive enhancement prototype
- Named productions and project-aware delivery
- Multi-image delivery/export with format, size, quality and ZIP controls
- AI Director AUTO / PRO / DIRECTOR modes
- Shoot Profile orchestration selector
- 50-capability Engine Map with LIVE / WIRED / MODEL ENGINE states
- Review Queue surface for low-confidence work
- Quality, Style DNA and Consistency indicators
- Original-vs-HotFoto canvas comparison
- Fixed-height production workspace
- No demo-shoot mode in the production Studio

## Important
The Engine Map is intentionally honest about implementation state. Advanced AI capabilities require a model-backed processing service; V46 maps the production architecture and UI surfaces without claiming that every advanced model is already connected.

See `HOTFOTO-50-CAPABILITY-AUDIT.md` for the full 50-capability tracking matrix.


## V47 — Model Gateway
V47 adds a server-side model gateway boundary. The Studio can store a gateway endpoint, test `/health`, request a production plan from `/plan`, and safely fall back to the local prototype if the gateway is unavailable. Provider API keys are not stored in the browser. See `HOTFOTO-V47-MODEL-GATEWAY.md`.


## V47.2 — Real Vision Gateway
The next layer is now implemented as an executable Node gateway. With `OPENAI_API_KEY` configured, `/plan`, `/analyze`, and `/quality` call a multimodal model server-side. The browser sends resized previews to the gateway; provider secrets never enter Studio JavaScript. `/process` and `/deliver` remain explicit manifests until a dedicated pixel-processing worker is connected. See `GATEWAY-SETUP.md`.


## V47.2 — Deterministic Image Worker
The gateway now includes a real server-side image worker powered by Sharp. When the Studio is connected to the gateway, `/process` can execute non-generative photographic operations (auto exposure, contrast, saturation, sharpening, resize/rotation, optional normalize/denoise) and returns a processed image. The original remains client-side and immutable.

Generative operations such as remove/replace/expand, relight, background replacement and super-resolution are explicitly returned as pending operations; HotFoto does not fake these capabilities. The architecture is ready for a dedicated generative provider to consume the same operation manifest.


## V47.5 — Photographer Intelligence

V47.5 adds persistent photographer intelligence behind the Studio gateway. A profile can retain Style DNA, approval/rejection feedback and recent production decisions. The planner receives this memory on future shoots and treats it as a preference layer rather than an absolute instruction. Originals remain untouched and the browser continues to work safely without the gateway.

Memory endpoints: `POST /memory`, `POST /memory/style`, `POST /memory/feedback`. Storage defaults to the gateway `data/` directory and can be redirected with `HOTFOTO_MEMORY_DIR`. For production, replace the file store with authenticated encrypted storage tied to the photographer account.
