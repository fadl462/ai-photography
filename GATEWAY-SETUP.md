# HotFoto AI Gateway — V47.1

This gateway turns the Studio's model boundary into a working server-side inference path.

## 1. Requirements

- Node.js 20+
- An OpenAI API key with access to the configured multimodal model

## 2. Configure

Copy `.env.example` to `.env` and set `OPENAI_API_KEY`.

The gateway deliberately reads the key from the server environment. Never paste the provider key into `studio.html` or `app.js`.

## 3. Run

```bash
node gateway-server.mjs
```

It listens on `http://localhost:8787` by default.

## 4. Connect Studio

Open Studio → **AI GATEWAY** → set:

`http://localhost:8787`

Then choose **TEST CONNECTION**.

## 5. What is genuinely model-backed in V47.1

- `/plan` — AI Director production planning
- `/analyze` — photographic scene/subject/lighting/composition/culling analysis
- `/quality` — Quality Guard inspection

`/process` and `/deliver` currently return non-destructive execution manifests. They do **not** pretend to perform pixel editing yet.

## 6. Architecture

Browser Studio → HotFoto Gateway → model provider → structured HotFoto result.

The provider remains replaceable. The Studio never receives the provider secret.

The next production layer is an image worker for actual pixel operations: RAW development, retouch, generative remove/replace/expand, super-resolution and output-aware sharpening.
