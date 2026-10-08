HotFoto AI V49.9 — Projects polish + canonical navigation

PROJECTS
Replace:
- projects.html
- css/projects.css

Keep:
- js/projects.js

Projects improvements:
- Typography of “YOUR PHOTOGRAPHY / YOUR WORKSPACE” now matches the site's eyebrow system.
- Refined contact-sheet imagery treatment and proportions.
- More intentional photography framing.
- Cleaner orbit/label hierarchy.
- Tighter premium workspace surfaces.

GLOBAL NAVIGATION
Add these two lines immediately before </head> on EVERY public page:
<link rel="stylesheet" href="css/canonical-nav.css?v=hotfoto49.9">
<script defer src="js/canonical-nav.js?v=hotfoto49.9"></script>

The canonical menu becomes:
Platform · Workflow · Projects · AI Studio · Pricing

This fixes Workflow/Pricing and any other page that is missing Projects from the main menu. The script also preserves the active page automatically.

Files included:
- js/canonical-nav.js
- css/canonical-nav.css
