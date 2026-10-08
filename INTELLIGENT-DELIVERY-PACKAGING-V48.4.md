# HotFoto AI V48.4 — Intelligent Delivery Packaging

V48.4 turns a finalized proof into destination-aware delivery manifests.

## Profiles
- Original Archive — full-resolution source delivery
- Web Gallery — 2400px JPEG, quality 86
- Social Set — 2048px JPEG, quality 88
- Print Ready — up to 6000px JPEG, quality 96

The gateway produces an authenticated package execution manifest. Pixel generation is delegated to the Image Worker; the UI never claims an export is complete until the worker reports completion.

## Design rules
1. Only finalized asset IDs can enter a package.
2. A package profile is explicit and destination-aware.
3. Original masters are immutable.
4. Packaging is reproducible from a manifest.
5. The execution worker is the source of truth for actual output readiness.
