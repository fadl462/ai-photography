# HotFoto AI V49.3 — Photographer-First Navigation Update

## What changed

This patch implements the navigation decision:

- **Projects** remains a primary navigation item.
- **Social Studio** is removed from the primary navigation.
- **Campaigns** is removed from the primary navigation.
- Social Content and Campaigns remain available from a selected production in **Projects**.
- Gateway endpoint / session token / project ID fields are hidden on the Social and Campaign pages; the existing local connection values continue to be used by the underlying scripts.
- Direct campaign/social URLs still work.
- The photographer is guided through: **Projects → Social Content / Campaign**.

## Install

1. Upload `js/hotfoto-v49-3-navigation.js` to your site's `js/` folder.
2. Upload `css/hotfoto-v49-3-navigation.css` to your site's `css/` folder.
3. Add these immediately before `</head>` on the following pages:
   - `index.html`
   - `platform.html`
   - `workflow.html`
   - `projects.html`
   - `social.html`
   - `campaign.html`
   - `pricing.html`
   - `studio.html` (optional; the script is safe there)

```html
<link rel="stylesheet" href="css/hotfoto-v49-3-navigation.css?v=hotfoto493">
<script defer src="js/hotfoto-v49-3-navigation.js?v=hotfoto493"></script>
```

The patch is additive: it does not require replacing the existing HTML pages.

## Intended customer flow

**Projects → select production → Social Content or Build Campaign**

The engineering architecture stays behind the scenes. Photographers see the outcome they want rather than the infrastructure that powers it.
