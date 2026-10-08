# HotFoto AI V47 — Model Gateway Contract

V47 moves the Studio from a UI-only capability map toward a **server-side model integration boundary**.

## Why this exists
The browser prototype must not hold provider API keys. The Studio therefore exposes one configurable gateway endpoint and falls back safely to the local prototype when the gateway is unavailable.

## Minimum endpoint
`GET /health`

Expected response: HTTP 200 with JSON, for example:
```json
{"ok":true,"service":"hotfoto-ai-gateway","version":"v1"}
```

## Production inference contract
The production gateway should expose:

`POST /plan`
- accepts shoot metadata and photographer intent
- returns an executable production plan, capability decisions, confidence thresholds and review rules

`POST /analyze`
- accepts an image reference or uploaded asset
- returns scene, subject, lighting, composition, culling and confidence signals

`POST /process`
- executes one or more approved image operations
- returns a non-destructive derivative and operation manifest

`POST /quality`
- evaluates output for artifacts, identity drift, over-retouching, clipping, halos and other failures
- returns pass/fail, confidence and recommended correction operations

`POST /deliver`
- builds destination-aware output packages and metadata

## Required production principles
1. Originals are immutable.
2. Provider secrets remain server-side.
3. Every model decision returns confidence and provenance.
4. Low-confidence decisions enter Review Queue.
5. Quality Guard can reject and rerun weak operations.
6. The gateway should support provider abstraction so HotFoto is not locked to one model vendor.
7. Every operation should be logged as a reproducible production manifest.
8. Privacy mode should support private/self-hosted inference and configurable retention.

## V47 status
The Studio UI is **gateway-ready**, but no external model provider is claimed as connected until a real backend is deployed and authenticated.
