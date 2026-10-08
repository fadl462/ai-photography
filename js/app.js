const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const openModal=id=>{$(id)?.classList.add('open');document.body.style.overflow='hidden'};
const closeModals=()=>{$$('.modal').forEach(m=>m.classList.remove('open'));document.body.style.overflow=''};
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.open==='login'?'#loginModal':'#studioModal')));
$$('.modal-close,.modal-backdrop').forEach(b=>b.addEventListener('click',closeModals));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});
$('#menuBtn')?.addEventListener('click',()=>{const n=document.querySelector('nav');n.classList.toggle('mobile-open')});
$$('.billing button').forEach(b=>b.addEventListener('click',()=>{$$('.billing button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const annual=b.textContent.includes('Annual');document.querySelectorAll('.price-grid h3').forEach((el,i)=>{const vals=annual?['$9','$22','$44']:['$12','$29','$59'];el.childNodes[0].nodeValue=vals[i]})}));
$$('.slider-demo').forEach(s=>s.addEventListener('click',e=>{const r=s.getBoundingClientRect();const pct=Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100));const bar=s.querySelector('i');if(bar)bar.style.width=pct+'%'}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target)}}),{threshold:.08});
$$('.feature,.price-grid article,.workflow-step,.stats>div,.showcase-card').forEach(el=>io.observe(el));
const stage=document.querySelector('.ba-stage');
if(stage){const update=x=>{const r=stage.getBoundingClientRect();const pct=Math.max(4,Math.min(96,((x-r.left)/r.width)*100));stage.querySelector('.ba-after').style.clipPath=`inset(0 0 0 ${pct}%)`;stage.querySelector('.ba-divider').style.left=pct+'%'};stage.addEventListener('pointermove',e=>update(e.clientX));stage.addEventListener('touchmove',e=>{if(e.touches[0])update(e.touches[0].clientX)},{passive:true})}
document.querySelectorAll('.feature,.showcase-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(1100px) rotateX(${(-y*2).toFixed(2)}deg) rotateY(${(x*2).toFixed(2)}deg) translateY(-5px)`});card.addEventListener('pointerleave',()=>card.style.transform='')});
const apply=$('#studioApply');apply?.addEventListener('click',()=>{apply.textContent='✓ Improvements applied';apply.disabled=true;const s=$('#studioStatus');if(s)s.style.display='block'});

/* HotFoto V13 homepage interactions */
(()=>{
 const stage=document.getElementById('homeBA');
 if(stage){
   const set=(x)=>{const r=stage.getBoundingClientRect();const p=Math.max(4,Math.min(96,((x-r.left)/r.width)*100));const a=stage.querySelector('.hf-ba-after');const d=stage.querySelector('.hf-ba-divider');if(a)a.style.clipPath=`inset(0 0 0 ${p}%)`;if(d)d.style.left=p+'%';};
   stage.addEventListener('pointermove',e=>set(e.clientX));
   stage.addEventListener('touchmove',e=>{if(e.touches[0])set(e.touches[0].clientX)},{passive:true});
 }
 document.querySelectorAll('.hf-frame,.hf-note').forEach(el=>{el.addEventListener('pointermove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=el.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;el.style.translate=`${x*6}px ${y*4}px`});el.addEventListener('pointerleave',()=>el.style.translate='')});
})();


/* HotFoto V19 — seamless full-width capability ticker */
(function(){
  const marquee = document.querySelector('.hf-marquee > div');
  if(!marquee || marquee.dataset.seamless === 'true') return;
  const original = marquee.innerHTML;
  marquee.innerHTML = '<span class="hf-marquee-group">' + original + '</span><span class="hf-marquee-group" aria-hidden="true">' + original + '</span>';
  marquee.dataset.seamless = 'true';
})();

/* HotFoto AI Studio V35 — autonomous production prototype */
(()=>{
 const input=document.getElementById('fileInput'), drop=document.getElementById('dropZone'), upload=document.getElementById('uploadBtn'), thumbUpload=document.getElementById('thumbUpload');
 if(!drop) return;
 const $id=id=>document.getElementById(id);
 const empty=$id('emptyStudio'), stage=$id('photoStage'), thumbs=$id('thumbs');
 const files=[]; let selected=0, running=false, progress=0, timer=null;
 const toast=(title,text)=>{const t=$id('studioToast');$id('toastTitle').textContent=title;$id('toastText').textContent=text;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),2800)};
 const setProgress=(p,state,detail)=>{$id('progressBar').style.width=p+'%';$id('progressText').textContent=Math.round(p)+'%';$id('statusText').textContent=state;$id('statusDetail').textContent=detail||'';$id('studioNavState').textContent=p>=100?'COMPLETE':p>0?'PROCESSING':'READY'};
 const renderThumbs=()=>{
   thumbs.innerHTML='';
   files.slice(0,24).forEach((f,i)=>{const b=document.createElement('button');b.className='thumb'+(i===selected?' selected':'');b.dataset.i=i;const im=document.createElement('img');im.src=f.url;b.appendChild(im);const s=document.createElement('span');s.textContent=String(i+1).padStart(2,'0');b.appendChild(s);b.onclick=()=>select(i);thumbs.appendChild(b)});
   const add=document.createElement('button');add.className='thumb-empty';add.textContent='+ Add';add.onclick=()=>input.click();thumbs.appendChild(add);
   $id('imageCount').textContent=files.length;$id('keeperLabel').textContent=files.length?files.length+' frames loaded':'Awaiting upload';
 };
 const select=i=>{selected=i;renderThumbs();if(files[i]){const u=files[i].url;$id('studioPhoto').style.backgroundImage='url("'+u+'")';$id('studioPhoto').style.backgroundSize='cover';$id('studioPhoto').style.backgroundPosition='center';$id('studioPhoto').querySelectorAll('.demo-light,.demo-subject,.demo-ground').forEach(x=>x.style.display='none');$id('canvasState').textContent=running?'PROCESSING':'ANALYSIS READY';}};
 const loadFiles=list=>{[...list].filter(f=>f.type.startsWith('image/')||/\.(dng|tif|tiff)$/i.test(f.name)).forEach(f=>files.push({file:f,url:URL.createObjectURL(f)}));if(!files.length)return;empty.hidden=true;stage.hidden=false;$id('projectName').textContent='NEW PRODUCTION';$id('projectMeta').textContent=files.length+' frame'+(files.length>1?'s':'')+' · originals protected';$id('panelTitle').textContent='Production ready';$id('directorState').textContent='READY TO DIRECT';$id('directorHint').textContent='HotFoto has your frames. Start when you are ready.';$id('directorPrompt').textContent='HotFoto will understand the shoot, cull the strongest frames, develop the images, refine subjects, apply Style DNA and run Quality Guard before delivery.';$id('qualityScore').textContent='—';$id('styleScore').textContent='—';renderThumbs();select(0);toast('Shoot loaded',files.length+' frame'+(files.length>1?'s':'')+' ready for HotFoto.');};
 upload?.addEventListener('click',()=>input.click());thumbUpload?.addEventListener('click',()=>input.click());input?.addEventListener('change',e=>loadFiles(e.target.files));
 ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('dragging')}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('dragging')}));drop.addEventListener('drop',e=>loadFiles(e.dataTransfer.files));
 $id('demoBtn')?.addEventListener('click',()=>{const svg=(n,variant)=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${variant?'#20384b':'#7b6657'}/><stop offset=".52" stop-color="${variant?'#c49b7b':'#31414a'}/><stop offset="1" stop-color="#0a131a"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="610" cy="180" r="125" fill="#efbf88" opacity=".5"/><ellipse cx="400" cy="820" rx="135" ry="230" fill="#111a20"/><circle cx="400" cy="570" r="78" fill="#b98a72"/><path d="M350 540 Q400 480 450 540" stroke="#1a1717" stroke-width="25" fill="none"/><rect y="820" width="800" height="180" fill="#111719" opacity=".7"/></svg>`)};files.length=0;for(let i=0;i<8;i++)files.push({file:null,url:svg(i,i%2)});empty.hidden=true;stage.hidden=false;$id('projectName').textContent='GOLDEN HOUR / 014';$id('projectMeta').textContent='8 frames · RAW simulation';$id('directorState').textContent='READY TO DIRECT';$id('directorHint').textContent='Demo production loaded.';$id('directorPrompt').textContent='This simulated shoot is ready for autonomous processing. Start HotFoto to watch the full production loop run.';renderThumbs();select(0);toast('Demo shoot loaded','8 frames are ready for the full production loop.');});
 const steps=['understand','cull','develop','retouch','style','quality','delivery'];
 const labels={understand:'UNDERSTANDING SHOOT',cull:'AI CULLING',develop:'DEVELOPING & COLOR',retouch:'REFINING DETAILS',style:'APPLYING STYLE DNA',quality:'QUALITY GUARD',delivery:'PREPARING DELIVERY'};
 const completeStep=(name,state)=>{const el=document.querySelector('.plan-step[data-step="'+name+'"]');if(!el)return;el.classList.remove('active');el.classList.toggle('done',state==='done');el.querySelector('em').textContent=state==='done'?'DONE':state==='active'?'RUN':'WAIT'};
 const start=()=>{if(running)return;if(!files.length){toast('Upload first','Drop a shoot into the Studio, then start HotFoto.');input.click();return}running=true;progress=0;$id('exportBtn').disabled=true;$id('planStatus').textContent='RUNNING';$id('directorState').textContent='HOTFOTO IS WORKING';$id('directorHint').textContent='Autonomous production is in progress.';$id('directorPrompt').textContent='HotFoto is making the decisions for you. No manual editing is required while the production loop runs.';setProgress(2,'ANALYZING','Understanding your photographs.');steps.forEach(s=>completeStep(s,'wait'));let i=0;clearInterval(timer);timer=setInterval(()=>{if(i>0)completeStep(steps[i-1],'done');if(i<steps.length){const s=steps[i];completeStep(s,'active');const p=Math.round(((i+.55)/steps.length)*100);setProgress(p,labels[s],s==='quality'?'Checking for artifacts, balance and over-processing.':'HotFoto is executing the production plan.');if(s==='cull'){$id('keeperLabel').textContent=Math.max(1,Math.round(files.length*.72))+' keepers selected';}if(s==='style')$id('styleScore').textContent='97%';if(s==='quality'){$id('qualityScore').textContent='96';$id('canvasScore').textContent='96';}$id('canvasState').textContent=labels[s];i++;}else{clearInterval(timer);running=false;steps.forEach(s=>completeStep(s,'done'));setProgress(100,'PRODUCTION COMPLETE','Master, web and social delivery sets are ready.');$id('planStatus').textContent='COMPLETE';$id('directorState').textContent='READY FOR DELIVERY';$id('directorHint').textContent='Quality Guard approved the production.';$id('directorPrompt').textContent='The shoot has passed its autonomous production loop. Review or export the finished delivery set.';$id('exportBtn').disabled=false;$id('exportBtn').textContent='EXPORT DELIVERY ↗';$id('studioNavState').textContent='COMPLETE';toast('Production complete','Quality Guard: 96/100 · Delivery is ready.');}},900)};
 $id('startHotFoto')?.addEventListener('click',start);$id('selectBest')?.addEventListener('click',()=>{if(!files.length){toast('No frames yet','Load a shoot first.');return}selected=0;renderThumbs();toast('Hero frame selected','HotFoto picked the strongest frame for this prototype.');});
 $id('clearFrames')?.addEventListener('click',()=>{files.forEach(f=>f.file&&URL.revokeObjectURL(f.url));files.length=0;empty.hidden=false;stage.hidden=true;renderThumbs();$id('projectName').textContent='NEW PRODUCTION';$id('projectMeta').textContent='Drop a shoot to begin';$id('qualityScore').textContent='—';$id('styleScore').textContent='—';setProgress(0,'SYSTEM READY','Your originals are never overwritten.');toast('Studio cleared','Ready for a new production.');});
 $id('resetStudio')?.addEventListener('click',()=>document.getElementById('clearFrames').click());
 $id('compareToggle')?.addEventListener('click',()=>{$id('photoViewport').classList.toggle('show-original');$id('compareToggle').firstChild.textContent=$id('photoViewport').classList.contains('show-original')?'HOTFOTO ':'ORIGINAL ';});
 document.querySelectorAll('.canvas-control').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.canvas-control').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.canvas==='original')$id('photoViewport').classList.add('show-original');else $id('photoViewport').classList.remove('show-original')}));
 document.querySelectorAll('.rail-item').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.rail-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');const v=b.dataset.view;const map={overview:['Overview','Production overview'],cull:['AI Culling','Select the strongest frames automatically.'],develop:['Develop','Exposure, tone and color intelligence.'],retouch:['Retouch','Natural subject and detail refinement.'],style:['Style DNA','Your signature look and set consistency.'],quality:['Quality Guard','Self-checking before delivery.'],delivery:['Delivery','Prepare master, web and social outputs.']};$id('panelTitle').textContent=map[v][0];$id('directorHint').textContent=map[v][1];});
 $id('directorTextBtn')?.addEventListener('click',()=>toast('AI Director','Natural-language directing is ready for the production engine.'));
 $id('exportBtn')?.addEventListener('click',()=>toast('Delivery prepared','Prototype export complete — master, web and social sets.'));
})();
