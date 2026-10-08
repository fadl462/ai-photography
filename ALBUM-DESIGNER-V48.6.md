# HotFoto AI V48.6 — AI Album & Gallery Designer

V48.6 adds a persistent album/gallery design layer on top of finalized project assets.

## Design engine
- cover selection
- hero/detail/context sequencing
- visual rhythm
- split and triptych spreads
- cinematic-editorial theme
- face-priority and duplicate-avoidance design rules

## API
- POST `/album/plan`
- POST `/album/create`
- POST `/album/list`
- GET `/albums/:id`

The current engine is deterministic and transparent: it does not claim generative design intelligence until a model-backed layout/ranking engine is connected. The UI is production-ready for that provider boundary.
