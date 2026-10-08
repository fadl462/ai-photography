/* HotFoto AI V49.2 — Photographer-facing Studio cleanup
   Removes internal engineering controls from the customer-facing Studio.
   Safe to load after the existing studio/app scripts.
*/
(() => {
  const remove = (selector) => {
    document.querySelectorAll(selector).forEach(el => el.remove());
  };

  const clean = () => {
    // Top-bar engineering controls
    remove('.studio-top-metrics .engine-map-btn');
    remove('#engineMapBtn');
    remove('#gatewayBtn');

    // Internal engine/intelligence controls inside AI Director
    remove('#engineMapInline');
    remove('#intelligenceBtn');

    // Internal engineering footer navigation
    document.querySelectorAll('.studio-footer a[href="engine.html"]').forEach(el => el.remove());

    // Internal engineering modals are no longer customer-facing.
    remove('#gatewayModal');
    remove('#engineModal');
    remove('#intelligenceModal');

    // Replace the old technical readiness strip with useful photographer reassurance.
    document.querySelectorAll('.ai-director-card .engine-readiness').forEach(el => {
      if (!el.classList.contains('intelligence-strip')) {
        el.outerHTML = `
          <div class="engine-readiness user-assurance">
            <div>
              <b>HOTFOTO TAKES IT FROM HERE</b>
              <span>Cull · edit · refine · check · deliver</span>
            </div>
            <div>
              <b>ORIGINALS SAFE</b>
              <span>Your source files stay untouched</span>
            </div>
          </div>`;
      }
    });

    const intelligence = document.querySelector('.ai-director-card .intelligence-strip');
    if (intelligence) {
      intelligence.innerHTML = `
        <div>
          <b>STYLE DNA READY</b>
          <span>HotFoto will carry your visual signature through the shoot.</span>
        </div>`;
    }

    const footerSmall = document.querySelector('.studio-footer small');
    if (footerSmall) {
      footerSmall.textContent = '© 2026 HotFoto AI · Built for faster photographic production.';
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', clean, { once: true });
  } else {
    clean();
  }
})();
