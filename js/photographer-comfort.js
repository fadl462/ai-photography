/* HotFoto V49.1 — Photographer Comfort Layer
   Drop-in layer: add after js/app.js on studio.html.
   Removes engineering controls and makes AI Culling immediately useful.
*/
(() => {
  if (!document.body.classList.contains('hf-studio-body')) return;

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];

  // Hide infrastructure controls from the photographer.
  $$('.engine-map-btn,.gateway-btn,#engineMapInline,#intelligenceBtn').forEach(el => {
    el.style.display = 'none';
  });

  // Replace the old readiness messaging with user-facing reassurance.
  $$('.engine-readiness').forEach((el, i) => {
    if (i === 0) {
      el.innerHTML = '<div><b>HOTFOTO TAKES IT FROM HERE</b><span>Cull · edit · refine · check · deliver</span></div><div><b>ORIGINALS SAFE</b><span>Your source files stay untouched</span></div>';
    } else if (i === 1) {
      el.innerHTML = '<div><b>STYLE DNA READY</b><span>Your visual signature carries through the shoot.</span></div>';
    }
  });

  // Photographer-first quick actions.
  const metrics = $('.studio-top-metrics');
  if (metrics && !$('#hfComfortActions')) {
    const wrap = document.createElement('div');
    wrap.id = 'hfComfortActions';
    wrap.className = 'hf-comfort-actions';
    wrap.innerHTML = `
      <a href="projects.html" class="hf-comfort-action">PROJECTS <span>↗</span></a>
      <button type="button" class="hf-comfort-action" id="hfReviewAction">REVIEW QUEUE <b id="hfReviewBadge">0</b></button>
      <button type="button" class="hf-comfort-action" id="hfDeliveryAction">DELIVERY <span>↗</span></button>`;
    metrics.appendChild(wrap);
    $('#hfReviewAction')?.addEventListener('click', () => $('#reviewQueueBtn')?.click());
    $('#hfDeliveryAction')?.addEventListener('click', () => $('#exportBtn')?.click());
  }

  // A lightweight culling command centre. It works with the existing filmstrip
  // without requiring access to app.js's private frame state.
  const main = $('.studio-main');
  if (!main || $('#hfCullBoard')) return;

  const board = document.createElement('section');
  board.id = 'hfCullBoard';
  board.className = 'hf-cull-board';
  board.hidden = true;
  board.innerHTML = `
    <div class="hf-cull-head">
      <div>
        <span class="eyebrow">AI CULLING</span>
        <h3>Keep the strongest. Lose the repetition.</h3>
        <p>HotFoto ranks the shoot first, so you spend your time reviewing decisions—not hunting through every frame.</p>
      </div>
      <div class="hf-cull-stats">
        <div><b id="hfCullFrames">0</b><span>FRAMES</span></div>
        <div><b id="hfCullKeepers">0</b><span>KEEPERS</span></div>
      </div>
    </div>
    <div class="hf-cull-actions">
      <button class="active" data-cull-filter="keepers">KEEPERS</button>
      <button data-cull-filter="all">ALL FRAMES</button>
      <button data-cull-filter="review">REVIEW</button>
      <button class="hf-cull-select" id="hfSelectBest">SELECT STRONGEST ↗</button>
    </div>
    <div class="hf-cull-note"><span>✦</span><b>Photographer in control.</b> HotFoto recommends; you decide.</div>`;
  const film = $('#filmstrip');
  if (film) main.insertBefore(board, film);

  const thumbButtons = () => $$('#thumbs .thumb');

  function updateStats() {
    const thumbs = thumbButtons();
    const keepers = thumbs.filter(b => /HERO/i.test(b.textContent || '')).length;
    $('#hfCullFrames').textContent = thumbs.length;
    $('#hfCullKeepers').textContent = keepers;
    $('#hfReviewBadge').textContent = 0;
    const label = $('#keeperLabel');
    if (label && keepers) label.textContent = `${keepers} keepers selected`;
  }

  function filterFrames(mode) {
    thumbButtons().forEach(btn => {
      const hero = /HERO/i.test(btn.textContent || '');
      btn.style.display = mode === 'keepers' ? (hero ? '' : 'none') : '';
    });
    $$('#hfCullBoard [data-cull-filter]').forEach(b => b.classList.toggle('active', b.dataset.cullFilter === mode));
  }

  board.addEventListener('click', e => {
    const btn = e.target.closest('[data-cull-filter]');
    if (btn) filterFrames(btn.dataset.cullFilter);
  });

  $('#hfSelectBest')?.addEventListener('click', () => {
    $('#selectBest')?.click();
    setTimeout(updateStats, 100);
  });

  // Rail navigation becomes a real culling view.
  $$('.rail-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const cull = btn.dataset.view === 'cull';
      board.hidden = !cull;
      if (cull) {
        updateStats();
        filterFrames('keepers');
      } else {
        thumbButtons().forEach(b => b.style.display = '');
      }
    });
  });

  // Keep stats current after uploads / production runs.
  const observer = new MutationObserver(() => updateStats());
  const thumbs = $('#thumbs');
  if (thumbs) observer.observe(thumbs, { childList: true, subtree: true });
})();
