# HotFoto V49.2 — Studio Cleanup

This patch removes the three internal controls shown in the Studio screenshot:

- HOTFOTO OS
- 50 ENGINE CAPABILITIES
- AI GATEWAY

It also removes the internal Engine Map / Intelligence controls and engineering modals from the photographer-facing experience.

## Install

1. Upload `js/remove-internal-controls.js` to your site's `js/` folder.
2. Upload `css/hotfoto-v49.2-cleanup.css` to your site's `css/` folder.
3. In `studio.html`, immediately before `</head>`, add:

<script defer src="js/remove-internal-controls.js?v=hotfoto492"></script>
<link rel="stylesheet" href="css/hotfoto-v49.2-cleanup.css?v=hotfoto492">

The patch is intentionally additive so it does not overwrite your existing Studio files.
