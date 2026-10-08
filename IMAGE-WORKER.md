# HotFoto AI V47.2 — Image Worker

The gateway now contains a deterministic server-side photographic worker.

## Run
```bash
npm install
cp .env.example .env
npm start
```

## Endpoint
`POST /process` accepts `{ image: dataUrl, operations: [...], maxEdge, quality }` and returns a processed JPEG data URL plus an operation manifest.

Supported deterministic operations: `exposure`, `contrast`, `saturation`, `sharpen`, `denoise`, `normalize`.

Generative operations (`generative-remove`, `generative-replace`, `generative-expand`, `relight`, `background-replace`, `super-resolution`) are deliberately marked pending. They require a model/provider with pixel-generation capabilities; no fake output is returned.

The Studio calls `/process` when a gateway is configured and falls back to the browser-safe processor if the worker is unavailable.

## V47.3 Generative Image Engine

The gateway now exposes `POST /edit` for real server-side image editing through the configured image provider. The default provider adapter targets OpenAI's image-edit endpoint with `HOTFOTO_IMAGE_MODEL=gpt-image-2`.

Supported request concepts include:
- natural-language retouching
- generative remove / replace
- background replacement
- relighting
- composition-aware expansion
- masked inpainting

Provider credentials stay server-side. The Studio should treat the returned image as a new non-destructive rendition and retain the original master.
