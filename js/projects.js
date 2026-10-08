(() => {
  const $ = id => document.getElementById(id);
  const endpoint = () => localStorage.getItem('hotfotoGatewayEndpoint') || '';
  const token = () => localStorage.getItem('hotfotoAuthToken') || '';
  const user = () => { try { return JSON.parse(localStorage.getItem('hotfotoAuthUser') || 'null'); } catch { return null; } };
  const api = async (path, opts={}) => {
    const base = endpoint(); if (!base) throw new Error('GATEWAY_NOT_CONFIGURED');
    const headers = {'Accept':'application/json', ...(opts.body ? {'Content-Type':'application/json'} : {}), ...(token()?{Authorization:'Bearer '+token()}:{})};
    const r = await fetch(base + path, {...opts, headers}); const data = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error(data.error || `REQUEST_${r.status}`); return data;
  };
  let projects=[]; let selected=null;
  const fmtBytes = n => { n=Number(n||0); if(!n)return '—'; const u=['B','KB','MB','GB','TB']; let i=0; while(n>=1024&&i<u.length-1){n/=1024;i++} return `${n<10&&i? n.toFixed(1):Math.round(n)} ${u[i]}`; };
  const fmtDate = d => d ? new Intl.DateTimeFormat(undefined,{month:'short',day:'numeric',year:'numeric'}).format(new Date(d)) : '—';
  const setState=(label,email)=>{ $('accountState').textContent=label; $('accountEmail').textContent=email||'—'; };
  const openNew=()=>{$('newModal').classList.add('open');$('newModal').setAttribute('aria-hidden','false');$('newName').focus()};
  const closeNew=()=>{$('newModal').classList.remove('open');$('newModal').setAttribute('aria-hidden','true');$('newStatus').textContent='';};
  function renderProjects(){
    const q=($('projectSearch').value||'').toLowerCase(); const f=$('statusFilter').value;
    const list=projects.filter(p=>(f==='all'||p.status===f)&&(!q||`${p.name} ${p.shootProfile}`.toLowerCase().includes(q)));
    $('projectCount').textContent=`${projects.length} ${projects.length===1?'shoot':'shoots'}`;
    $('projectList').innerHTML=list.length?list.map(p=>{const s=p.summary||{}; const frames=Number(s.frames||0); const progress=p.status==='completed'?100:Math.min(92,frames?Math.max(8,Math.round((Number(s.keepers||0)/frames)*100)):8); return `<button class="project-card ${selected?.id===p.id?'active':''}" data-project="${p.id}"><div class="pc-top"><strong>${esc(p.name)}</strong><em>${esc((p.status||'ACTIVE').toUpperCase())}</em></div><small>${esc(p.shootProfile||'auto')} · ${frames||0} frames · updated ${fmtDate(p.updatedAt)}</small><div class="pc-bar"><i style="--progress:${progress}%"></i></div></button>`}).join(''):`<div class="workspace-empty">No productions match this view.</div>`;
    document.querySelectorAll('[data-project]').forEach(b=>b.onclick=()=>selectProject(b.dataset.project));
  }
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  async function loadProjects(){
    if(!endpoint()){setState('CONNECT GATEWAY','Add your gateway endpoint in AI Studio.');$('projectList').innerHTML='<div class="workspace-empty">This workspace is cloud-backed. Connect the AI Gateway in Studio, then sign in.</div>';return;}
    if(!token()){setState('SIGN IN REQUIRED','Your productions are private.');$('projectList').innerHTML='<div class="workspace-empty">Sign in through AI Studio to access your private productions.</div>';return;}
    try { const r=await api('/projects'); projects=r.projects||[]; const u=user(); setState('PRIVATE WORKSPACE',u?.email||'Authenticated photographer'); renderProjects(); if(selected) { const fresh=projects.find(x=>x.id===selected.id); if(fresh) await selectProject(fresh.id); } }
    catch(e){setState('WORKSPACE ERROR',String(e.message).replaceAll('_',' '));$('projectList').innerHTML='<div class="workspace-empty">Could not load your productions. Refresh after checking the gateway.</div>';}
  }
  async function selectProject(id){
    try{const r=await api(`/projects/${encodeURIComponent(id)}`); selected=r.project; renderProjects(); renderProject();}
    catch(e){$('assetGrid').innerHTML=`<div class="asset-empty"><h3>Production unavailable</h3><p>${esc(e.message)}</p></div>`}
  }
  function renderProject(){
    if(!selected)return; const s=selected.summary||{}, assets=selected.assets||[];
    $('assetEyebrow').textContent=(selected.shootProfile||'AUTO').toUpperCase()+' / PRODUCTION'; $('assetTitle').textContent=selected.name; $('assetMeta').textContent=`${assets.length} cloud assets · created ${fmtDate(selected.createdAt)} · updated ${fmtDate(selected.updatedAt)}`;
    const vals=[assets.length,s.keepers??'—',s.quality?s.quality+'/100':'—',s.styleScore?s.styleScore+'%':'—',selected.status||'active']; document.querySelectorAll('#assetSummary b').forEach((x,i)=>x.textContent=vals[i]);
    $('projectStudio').disabled=false; $('renameProject').disabled=false;
    $('projectStudio').onclick=()=>location.href=`studio.html?project=${encodeURIComponent(selected.id)}`;
    $('renameProject').onclick=async()=>{const name=prompt('Rename production',selected.name);if(!name||name===selected.name)return;try{const r=await api('/projects/update',{method:'POST',body:JSON.stringify({projectId:selected.id,name:name.trim().slice(0,120)})});selected=r.project;projects=projects.map(p=>p.id===selected.id?{...p,...selected}:p);renderProjects();renderProject()}catch(e){alert(e.message)}};
    $('assetGrid').innerHTML=assets.length?assets.map(a=>{const meta=a.metadata||{}; const status=String(meta.uploadStatus||'complete').toUpperCase(); const isImage=String(a.mimeType||'').startsWith('image/'); return `<article class="asset-card"><div class="asset-thumb">${isImage?'<span>◈</span>':'<span>▣</span>'}<span class="asset-badge">${esc(status)}</span></div><div class="asset-body"><strong title="${esc(a.name)}">${esc(a.name)}</strong><small>${esc(a.mimeType||'file')} · ${fmtBytes(a.bytes)}</small><div class="asset-row"><span>${a.createdAt?fmtDate(a.createdAt):'—'}</span>${meta.uploadStatus==='complete'?`<a href="#" data-download="${a.id}">DOWNLOAD</a>`:'<span>PROCESSING</span>'}</div></div></article>`}).join(''):`<div class="asset-empty"><div class="asset-empty-mark">✦</div><h3>No assets yet</h3><p>Open Studio and upload a shoot. HotFoto will attach the originals to this production's cloud asset ledger.</p><a class="btn primary" href="studio.html?project=${encodeURIComponent(selected.id)}">Open Studio →</a></div>`;
    document.querySelectorAll('[data-download]').forEach(a=>a.onclick=async e=>{e.preventDefault();try{const r=await api('/assets/download',{method:'POST',body:JSON.stringify({assetId:a.dataset.download})});if(r.url)location.href=r.url;else alert('Object storage is not configured for signed downloads yet.');}catch(err){alert(err.message)}});
  }
  $('projectSearch').oninput=renderProjects; $('statusFilter').onchange=renderProjects; $('refreshProjects').onclick=loadProjects; $('newProject').onclick=openNew; document.querySelectorAll('[data-close]').forEach(x=>x.onclick=closeNew);
  $('newForm').onsubmit=async e=>{e.preventDefault();$('newStatus').textContent='Creating secure project…';try{const r=await api('/projects/create',{method:'POST',body:JSON.stringify({name:$('newName').value,shootProfile:$('newProfile').value})});closeNew();projects.unshift(r.project);renderProjects();await selectProject(r.project.id)}catch(err){$('newStatus').textContent=String(err.message).replaceAll('_',' ')}};
  $('signIn').onclick=()=>location.href='studio.html'; document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNew()});
  loadProjects();
})();
