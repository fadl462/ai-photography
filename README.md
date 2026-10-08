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
