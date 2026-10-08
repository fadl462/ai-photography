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
