# HotFoto V49.1 — Photographer Comfort Patch

## Purpose
Removes engineering-facing Studio controls and adds a photographer-first AI Culling command centre.

### Changes
- Hides HotFoto OS / Engine Map / AI Gateway / internal intelligence controls.
- Adds Projects / Review Queue / Delivery quick actions.
- Adds an AI Culling board with:
  - Frames / Keepers counts
  - Keepers / All Frames / Review filters
  - Select Strongest action
  - photographer-control reassurance
- Uses the existing HotFoto filmstrip and culling results; no fake AI capability is introduced.

## Installation
1. Copy `js/photographer-comfort.js` into the site's `js/` folder.
2. Copy `css/photographer-comfort.css` into the site's `css/` folder.
3. In `studio.html`, after the existing `js/app.js` script, add:
   `<link rel="stylesheet" href="css/photographer-comfort.css?v=49.1">`
   and:
   `<script defer src="js/photographer-comfort.js?v=49.1"></script>`

This is a drop-in patch because the GitHub integration currently has read-only access and cannot commit directly.
