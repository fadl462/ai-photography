# HotFoto AI Studio V46 — 50-Capability Engine Audit

This audit maps the 50 capabilities defined for the HotFoto autonomous production engine to a production stage, current prototype state, and intended behavior. It deliberately distinguishes working browser capabilities from model-backed capabilities so the product does not pretend a UI simulation is a finished AI engine.

## Benchmark direction

The V46 architecture was stress-tested against current professional AI photography products. Lightroom now combines prompt-based editing, generative remove/expand, assisted culling signals and AI edit-status management; Aftershoot combines automated culling/editing and is moving toward a cull→edit→retouch→deliver workflow; Evoto has story-based culling and reusable workflows. HotFoto therefore needs to win by combining these capabilities into one autonomous, self-checking production loop rather than copying individual tools.

## Capability map

| # | Capability | Stage | State | Intended HotFoto behavior |
|---:|---|---|---|---|
| 01 | Ingest & format recognition | Ingest | LIVE | Detects supported image inputs and prepares the shoot. |
| 02 | EXIF & capture metadata | Ingest | LIVE | Reads camera, lens, dimensions and capture context. |
| 03 | Duplicate detection | Ingest | WIRED | Finds exact and near-duplicate frames before production. |
| 04 | Burst & sequence grouping | Ingest | WIRED | Groups rapid sequences so decisions are made in context. |
| 05 | Preview & contact-sheet generation | Ingest | LIVE | Builds responsive previews and filmstrip navigation. |
| 06 | Original protection / non-destructive master | Ingest | LIVE | Keeps source files untouched and separates delivery copies. |
| 07 | Scene & genre recognition | Understand | MODEL | Recognizes portrait, wedding, event, product, landscape and more. |
| 08 | Subject & people detection | Understand | MODEL | Maps people, products, faces and primary subjects. |
| 09 | Camera & lens context | Understand | LIVE | Uses capture metadata to inform processing decisions. |
| 10 | Lighting context analysis | Understand | MODEL | Reads mixed light, direction, temperature and contrast. |
| 11 | Composition intelligence | Understand | MODEL | Scores framing, balance, horizon and visual weight. |
| 12 | Story / visual grouping | Understand | WIRED | Groups photographs by moment, scene and visual similarity. |
| 13 | Focus & sharpness scoring | Cull | LIVE | Ranks technical detail and sharpness signals. |
| 14 | Eyes & expression scoring | Cull | MODEL | Prioritizes open eyes, expression and portrait quality. |
| 15 | Technical quality scoring | Cull | LIVE | Scores exposure, clipping, detail and color signals. |
| 16 | Hero-frame selection | Cull | LIVE | Selects the strongest frame as the visual reference. |
| 17 | Cull-to-target intelligence | Cull | WIRED | Can target a desired keeper count instead of a fixed ratio. |
| 18 | Keeper tiers / priority ranking | Cull | WIRED | Separates hero, deliverable, supporting and reject tiers. |
| 19 | Adaptive exposure correction | Develop | LIVE | Balances tonal exposure using image-level analysis. |
| 20 | White-balance intelligence | Develop | MODEL | Corrects color temperature while protecting intentional color. |
| 21 | Tone-curve optimization | Develop | MODEL | Builds natural highlight rolloff and shadow structure. |
| 22 | Color-science / HSL intelligence | Develop | MODEL | Balances hue, saturation and luminance by photographic context. |
| 23 | Lens profile correction | Develop | MODEL | Corrects distortion, vignetting and optical behavior. |
| 24 | HDR / dynamic-range recovery | Develop | MODEL | Balances difficult highlights, windows and deep shadows. |
| 25 | AI denoise / low-light recovery | Develop | MODEL | Recovers detail while controlling high-ISO noise. |
| 26 | Super-resolution / detail recovery | Develop | MODEL | Upscales while protecting faces, texture and fine detail. |
| 27 | Perspective & geometry correction | Develop | MODEL | Straightens architectural lines and perspective. |
| 28 | Output-aware sharpening | Develop | MODEL | Applies destination-aware sharpening after resizing. |
| 29 | Skin analysis & texture preservation | Retouch | MODEL | Separates skin from hair and protects natural texture. |
| 30 | Blemish / temporary-mark removal | Retouch | MODEL | Removes transient distractions without erasing identity. |
| 31 | Face & eye enhancement | Retouch | MODEL | Improves eyes, facial detail and natural brightness. |
| 32 | Teeth & hair refinement | Retouch | MODEL | Balances smiles and cleans flyaways without plastic results. |
| 33 | AI dodge & burn / form shaping | Retouch | MODEL | Improves dimensionality while respecting existing light. |
| 34 | Clothing & object cleanup | Retouch | MODEL | Cleans wrinkles, stray objects and distracting details. |
| 35 | Background cleanup | Retouch | MODEL | Removes clutter and repairs scene continuity. |
| 36 | Identity-safe retouching | Retouch | WIRED | Applies guardrails against facial drift and over-retouching. |
| 37 | Style DNA learning | Style | WIRED | Learns the photographer’s visual signature from references. |
| 38 | Set consistency engine | Style | WIRED | Matches exposure, skin, color and contrast across the set. |
| 39 | Lighting Director | Style | MODEL | Relights images while respecting subject geometry and direction. |
| 40 | Sky / background intelligence | Style | MODEL | Enhances, replaces or extends backgrounds with edge-aware matching. |
| 41 | Generative remove / replace / expand | Style | MODEL | Performs context-aware scene transformation and extension. |
| 42 | Composition & intelligent crop | Style | MODEL | Creates strong crops for the subject and destination. |
| 43 | Genre-specific treatment | Style | WIRED | Switches processing priorities for wedding, fashion, product and more. |
| 44 | Natural-language AI Director | Style | WIRED | Turns photographer intent into an executable production plan. |
| 45 | Artifact & anomaly detection | Quality | WIRED | Checks faces, edges, halos, duplication and generative artifacts. |
| 46 | Self-correction production loop | Quality | MODEL | Re-runs weak operations until the result passes quality thresholds. |
| 47 | Confidence scoring & review queue | Quality | WIRED | Routes low-confidence decisions to review instead of guessing. |
| 48 | Smart export profiles | Delivery | LIVE | Packages client, web, social and print outputs. |
| 49 | Project naming / metadata / delivery packaging | Delivery | LIVE | Uses the production identity for files, folders and ZIP delivery. |
| 50 | Project & style memory | Delivery | MODEL | Remembers preferences, clients and successful production decisions. |

## Product rules for the engine

1. **Autonomous by default:** the normal path is Upload → Understand → Cull → Develop → Refine → Style → Quality Guard → Deliver.
2. **Human only when needed:** low-confidence results go to Review Queue instead of being silently accepted.
3. **No fake completion:** a capability is not called production-ready merely because its interface exists.
4. **Originals are immutable:** every transformation operates on a derived master/delivery copy.
5. **Set-level intelligence:** consistency across the shoot matters as much as the quality of a single image.
6. **Self-correction:** Quality Guard can reject and re-run an operation before delivery.
7. **Destination-aware delivery:** output dimensions, quality, format and sharpening are selected for the destination.
8. **Style memory:** successful photographer decisions should progressively improve Style DNA and future productions.

## V46 interface upgrades

- 50-capability Engine Map with state filters.
- AUTO / PRO / DIRECTOR operating modes.
- Shoot Profile selector for genre-specific orchestration.
- Engine readiness summary inside AI Director.
- Review Queue surface for low-confidence work.
- Consistency score alongside Quality and Style DNA.
- Existing named-production and multi-image delivery workflow retained.
