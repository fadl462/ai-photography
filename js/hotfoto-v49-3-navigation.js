/* HotFoto AI V49.3 — photographer-first navigation + promotion workflow
   Load this AFTER the existing page/app scripts.
*/
(() => {
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => [...root.querySelectorAll(s)];

  function cleanNavigation() {
    qsa('.nav nav a[href="social.html"], .nav nav a[href="campaign.html"]').forEach(a => a.remove());
    qsa('.nav nav').forEach(nav => {
      if (!qs('a[href="projects.html"]', nav) && /workflow|pricing/.test(location.pathname)) {
        const ai = qs('a[href="studio.html"]', nav);
        const a = document.createElement('a');
        a.href = 'projects.html';
        a.textContent = 'Projects';
        ai ? nav.insertBefore(a, ai) : nav.appendChild(a);
      }
    });
  }

  function promotionContext(page) {
    const controls = qs(`.${page}-controls`);
    if (!controls || qs('.promotion-context', controls)) return;

    const projectId = new URLSearchParams(location.search).get('project');
    const block = document.createElement('div');
    block.className = 'promotion-context';
    block.innerHTML = `
      <span class="context-label">PRODUCTION</span>
      <b>${projectId ? 'Production selected' : 'No production selected'}</b>
      <small>${projectId
        ? 'HotFoto will work from this production.'
        : 'Choose a production from Projects to create content from your strongest frames.'}</small>
      <a class="btn ghost full" href="projects.html">${projectId ? 'Back to Projects ↗' : 'Choose a production ↗'}</a>
    `;
    controls.insertBefore(block, controls.children[2] || controls.firstChild);

    // Hide engineering-only connection fields while preserving the inputs used by the existing JS.
    qsa('label', controls).filter(label => /gateway endpoint|session token|project id/i.test(label.textContent)).forEach(label => {
      label.style.display = 'none';
    });

    const projectInput = qs('#projectId', controls);
    const generate = qs('#generate', controls);
    if (projectInput && projectId) projectInput.value = projectId;
    if (generate && !projectId) generate.disabled = true;
  }

  function addProjectPromotion() {
    if (!/projects\.html$/.test(location.pathname)) return;
    const assetHead = qs('.asset-head');
    if (!assetHead || qs('.promotion-actions', assetHead)) return;

    const wrap = document.createElement('div');
    wrap.className = 'promotion-actions';
    wrap.innerHTML = `
      <span class="promotion-label">PROMOTE</span>
      <button class="btn ghost" id="hfSocialProject" type="button" disabled>Social Content ↗</button>
      <button class="btn primary" id="hfCampaignProject" type="button" disabled>Build Campaign ↗</button>
    `;
    assetHead.appendChild(wrap);

    const refresh = () => {
      const selected = qs('.project-card.active');
      const id = selected?.dataset?.project || '';
      const social = qs('#hfSocialProject');
      const campaign = qs('#hfCampaignProject');
      [social, campaign].forEach(b => { if (b) b.disabled = !id; });
      if (social) social.onclick = () => { if (id) location.href = `social.html?project=${encodeURIComponent(id)}`; };
      if (campaign) campaign.onclick = () => { if (id) location.href = `campaign.html?project=${encodeURIComponent(id)}`; };
    };

    refresh();
    new MutationObserver(refresh).observe(qs('#projectList') || document.body, {subtree:true, childList:true, attributes:true, attributeFilter:['class']});
  }

  function run() {
    cleanNavigation();
    promotionContext('social');
    promotionContext('campaign');
    addProjectPromotion();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, {once:true});
  else run();
  setTimeout(run, 500);
  setTimeout(run, 1500);
})();
