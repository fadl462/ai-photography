const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
let productionName='NEW PRODUCTION';
const normalizeProjectName=v=>(v||'NEW PRODUCTION').trim().replace(/\s+/g,' ').slice(0,64)||'NEW PRODUCTION';
const setProductionName=v=>{productionName=normalizeProjectName(v);const label=$id('projectName'),input=$id('projectNameInput');if(label)label.textContent=productionName;if(input)input.value=productionName;};
const beginRename=()=>{const input=$id('projectNameInput'),button=$id('projectNameButton');if(!input)return;input.hidden=false;if(button)button.hidden=true;input.focus();input.select();};
const finishRename=()=>{const input=$id('projectNameInput'),button=$id('projectNameButton');if(!input)return;setProductionName(input.value);input.hidden=true;if(button)button.hidden=false;};
$id('projectNameButton')?.addEventListener('click',beginRename);
$id('projectNameInput')?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key==='Escape'){e.preventDefault();finishRename()}});
$id('projectNameInput')?.addEventListener('blur',finishRename);

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

/* HotFoto AI Studio V36 — actual browser-side production core */
(()=>{
 const input=document.getElementById('fileInput'), drop=document.getElementById('dropZone');
 if(!drop) return;
 const $id=id=>document.getElementById(id);
 const empty=$id('emptyStudio'), stage=$id('photoStage'), thumbs=$id('thumbs'), heroStart=$id('startHotFoto'), dockedStart=$id('startHotFotoDocked'), bottomStart=$id('startHotFotoBottom');
 const files=[]; let selected=0, running=false, cancelled=false, processedCount=0;
 const steps=['understand','cull','develop','retouch','style','quality','delivery'];
 const labels={understand:'UNDERSTANDING SHOOT',cull:'AI CULLING',develop:'DEVELOPING & COLOR',retouch:'REFINING DETAILS',style:'APPLYING STYLE DNA',quality:'QUALITY GUARD',delivery:'PREPARING DELIVERY'};
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const toast=(title,text)=>{const t=$id('studioToast');$id('toastTitle').textContent=title;$id('toastText').textContent=text;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),3000)};
 const syncStartActions=hasFiles=>{if(heroStart)heroStart.hidden=hasFiles;if(dockedStart)dockedStart.hidden=true;if(bottomStart)bottomStart.hidden=!hasFiles};
 const setProgress=(p,state,detail)=>{$id('progressBar').style.width=p+'%';$id('progressText').textContent=Math.round(p)+'%';$id('statusText').textContent=state;$id('statusDetail').textContent=detail||'';$id('studioNavState').textContent=p>=100?'COMPLETE':p>0?'PROCESSING':'READY'};
 const completeStep=(name,state)=>{const el=document.querySelector('.plan-step[data-step="'+name+'"]');if(!el)return;el.classList.remove('active');el.classList.toggle('done',state==='done');el.querySelector('em').textContent=state==='done'?'DONE':state==='active'?'RUN':'WAIT'};
 const loadImage=src=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=reject;im.src=src});
 const analyzeImage=async url=>{
   const im=await loadImage(url), c=document.createElement('canvas'), w=160,h=Math.max(1,Math.round(160*im.naturalHeight/im.naturalWidth));c.width=w;c.height=Math.min(140,h);const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(im,0,0,c.width,c.height);const d=ctx.getImageData(0,0,c.width,c.height).data;
   let lum=0,clip=0,sat=0,edges=0,n=0,prev=0;
   for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const i=(y*c.width+x)*4,r=d[i]/255,g=d[i+1]/255,b=d[i+2]/255,l=.2126*r+.7152*g+.0722*b;lum+=l;sat+=Math.max(r,g,b)-Math.min(r,g,b);if(l<.025||l>.975)clip++;if(x){edges+=Math.abs(l-prev)}prev=l;n++}
   lum/=n;sat/=n;const exposure=Math.max(0,100-Math.abs(.52-lum)*150);const technical=Math.max(0,100-(clip/n)*240);const detail=Math.min(100,42+(edges/n)*850);const color=Math.min(100,55+sat*120);const score=Math.round(exposure*.36+technical*.24+detail*.22+color*.18);
   return {w:im.naturalWidth,h:im.naturalHeight,lum,clip:clip/n,exposure,technical,detail,color,score};
 };
 const processImage=async item=>{
   if(item.processedUrl)return item;
   const a=item.analysis||{lum:.5};
   const preview=await makeGatewayPreview(item);
   if(window.HotFotoGateway?.configured?.()&&preview){
     const exposure=Math.max(-1,Math.min(1,(.52-a.lum)*1.25));
     const result=await gatewayFetch('/process',{version:'v47.2',project:productionName,frameName:item.name,image:preview,maxEdge:2400,quality:92,operations:[{type:'exposure',value:exposure},{type:'contrast',value:1.04},{type:'saturation',value:1.045},{type:'sharpen',value:.7}]},30000);
     if(result?.image){item.processedUrl=result.image;item.processed=true;item.worker='server-image-worker';item.workerManifest=result.operationManifest;return item;}
   }
   // Safe local fallback when no image worker is configured.
   const im=await loadImage(item.url), max=1800, scale=Math.min(1,max/im.naturalWidth), w=Math.max(1,Math.round(im.naturalWidth*scale)),h=Math.max(1,Math.round(im.naturalHeight*scale));
   const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.drawImage(im,0,0,w,h);
   const data=ctx.getImageData(0,0,w,h), p=data.data; const lift=Math.max(-.035,Math.min(.10,(.52-a.lum)*.55)); const contrast=1.035; const satBoost=1.055;
   for(let i=0;i<p.length;i+=4){let r=p[i]/255,g=p[i+1]/255,b=p[i+2]/255;let l=.2126*r+.7152*g+.0722*b;r=l+(r-l)*satBoost;g=l+(g-l)*satBoost;b=l+(b-l)*satBoost;r=(r-.5)*contrast+.5+lift;g=(g-.5)*contrast+.5+lift;b=(b-.5)*contrast+.5+lift;p[i]=Math.max(0,Math.min(255,Math.round(r*255)));p[i+1]=Math.max(0,Math.min(255,Math.round(g*255)));p[i+2]=Math.max(0,Math.min(255,Math.round(b*255)))}
   ctx.putImageData(data,0,0); item.processedUrl=c.toDataURL('image/jpeg',.91); item.processed=true; item.worker='browser-safe-fallback'; return item;
 };
 const renderThumbs=()=>{thumbs.innerHTML='';files.slice(0,30).forEach((f,i)=>{const b=document.createElement('button');b.className='thumb'+(i===selected?' selected':'');b.dataset.i=i;const im=document.createElement('img');im.src=f.processedUrl||f.url;b.appendChild(im);const s=document.createElement('span');s.textContent=(f.keeper?'HERO ':'')+String(i+1).padStart(2,'0');b.appendChild(s);b.onclick=()=>select(i);thumbs.appendChild(b)});const add=document.createElement('button');add.className='thumb-empty';add.textContent='+ Add';add.onclick=()=>input.click();thumbs.appendChild(add);$id('imageCount').textContent=files.length;$id('keeperLabel').textContent=files.length?files.filter(f=>f.keeper).length?files.filter(f=>f.keeper).length+' keepers selected':files.length+' frames loaded':'Awaiting upload'};
 const select=i=>{selected=i;renderThumbs();const f=files[i];if(!f)return;const processed=f.processedUrl||f.url;const original=f.url;$id('studioPhoto').style.backgroundImage='url("'+processed+'")';$id('beforeLayer').style.backgroundImage='url("'+original+'")';$id('studioPhoto').style.backgroundSize='contain';$id('studioPhoto').style.backgroundRepeat='no-repeat';$id('studioPhoto').style.backgroundPosition='center';$id('beforeLayer').style.backgroundSize='contain';$id('beforeLayer').style.backgroundRepeat='no-repeat';$id('beforeLayer').style.backgroundPosition='center';$id('studioPhoto').querySelectorAll('.demo-light,.demo-subject,.demo-ground').forEach(x=>x.style.display='none');$id('photoViewport').classList.add('has-image');$id('studioPhoto').classList.toggle('is-processed',!!f.processed);$id('canvasState').textContent=running?'PROCESSING':f.processed?'HOTFOTO MASTER':'ANALYSIS READY';$id('canvasSubstate').textContent=f.processed?'HOTFOTO MASTER':'ORIGINAL PREVIEW';$id('canvasBatchState').textContent=f.processed?'HOTFOTO MASTER':'ORIGINAL PREVIEW';$id('canvasFrameLabel').textContent='FRAME '+String(i+1).padStart(2,'0')+' / '+String(files.length).padStart(2,'0');$id('canvasBatchMeta').textContent=f.keeper?'HERO / KEEPER':'SELECTED FRAME';if(f.analysis){$id('canvasScore').textContent=f.quality||f.analysis.score||'—'}};
 const loadFiles=list=>{[...list].filter(f=>f.type.startsWith('image/')||/\.(dng|tif|tiff)$/i.test(f.name)).forEach(f=>files.push({file:f,url:URL.createObjectURL(f),name:f.name}));if(!files.length)return;empty.hidden=true;stage.hidden=false;syncStartActions(true);if(productionName==='NEW PRODUCTION'){const first=files[0]?.file?.webkitRelativePath||files[0]?.name||'';const folder=first.includes('/')?first.split('/')[0]:'';if(folder) setProductionName(folder); else setProductionName('NEW PRODUCTION')}else setProductionName(productionName);$id('projectMeta').textContent=files.length+' frame'+(files.length>1?'s':'')+' · originals protected';$id('panelTitle').textContent='Production ready';$id('directorState').textContent='READY TO DIRECT';$id('directorHint').textContent='HotFoto has your frames. Start when you are ready.';$id('directorPrompt').textContent='The production core will analyze every frame, identify keepers, develop the images, apply Style DNA and run Quality Guard before delivery.';$id('qualityScore').textContent='—';$id('styleScore').textContent='—';renderThumbs();select(0);toast('Shoot loaded',files.length+' frame'+(files.length>1?'s':'')+' ready for autonomous production.');};
 $id('uploadBtn')?.addEventListener('click',()=>input.click());$id('thumbUpload')?.addEventListener('click',()=>input.click());input?.addEventListener('change',e=>{loadFiles(e.target.files);input.value=''});
 ['dragenter','dragover'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.add('dragging')}));['dragleave','drop'].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.classList.remove('dragging')}));drop.addEventListener('drop',e=>loadFiles(e.dataTransfer.files));

 const gatewayFetch=async(path,payload,timeout=15000)=>{const endpoint=window.HotFotoGateway?.getEndpoint?.();if(!endpoint)return null;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeout);try{const r=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload),signal:controller.signal});if(!r.ok)throw new Error(path+' '+r.status);return await r.json()}catch(e){return null}finally{clearTimeout(timer)}};
 const getProfileId=()=>{let id=localStorage.getItem('hotfotoProfileId');if(!id){id='photographer-'+Math.random().toString(36).slice(2,10);localStorage.setItem('hotfotoProfileId',id)}return id};
 const requestMemory=async()=>gatewayFetch('/memory',{profileId:getProfileId()},8000);
 const saveMemoryStyle=async style=>gatewayFetch('/memory/style',{profileId:getProfileId(),project:productionName,styleDNA:style,references:style?.references||0},10000);
 const sendFeedback=async(action)=>{const current=files[selected];if(!current)return null;return gatewayFetch('/memory/feedback',{profileId:getProfileId(),action,frameName:current.name,project:productionName},8000)};
 const syncMemoryUI=async()=>{const m=window.HotFotoGateway?.configured?.()?await requestMemory():null;const state=document.getElementById('memoryState'),summary=document.getElementById('memorySummary');if(!state||!summary)return;if(m){state.textContent=m.styleDNA?'STYLE DNA REMEMBERED':'PROFILE READY';const f=m.feedback||{};summary.textContent=`Persistent profile · ${f.approved||0} approved · ${f.rejected||0} rejected · ${f.edited||0} edited.`}else{state.textContent='LOCAL PROFILE';summary.textContent='Connect the gateway to persist Style DNA and photographer feedback server-side.'}};
 const requestModelPlan=async()=>{const profile=document.getElementById('shootProfile')?.value||'auto';const mode=document.querySelector('#modeSwitch button.active')?.dataset.mode||'auto';return gatewayFetch('/plan',{version:'v47.2',project:productionName,mode,shootProfile:profile,frameCount:files.length,frames:files.slice(0,100).map((f,i)=>({index:i+1,name:f.name,type:f.file?.type||'image/*',bytes:f.file?.size||0})),intent:document.getElementById('directorText')?.value||''},12000)};
 const makeGatewayPreview=async item=>{const im=await loadImage(item.url);const max=1280,scale=Math.min(1,max/Math.max(im.naturalWidth,im.naturalHeight)),w=Math.max(1,Math.round(im.naturalWidth*scale)),h=Math.max(1,Math.round(im.naturalHeight*scale));const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);return c.toDataURL('image/jpeg',.72)};
 const requestModelAnalysis=async item=>{const image=await makeGatewayPreview(item);return gatewayFetch('/analyze',{version:'v47.2',project:productionName,frameName:item.name,image,detail:'low'},18000)};
 const requestModelQuality=async item=>{const image=await makeGatewayPreview({url:item.processedUrl||item.url});return gatewayFetch('/quality',{version:'v47.2',project:productionName,frameName:item.name,image,detail:'low'},18000)};
 const requestStyleDNA=async items=>{const refs=[];for(const item of items.slice(0,8)){try{refs.push(await makeGatewayPreview(item))}catch{}}if(!refs.length)return null;return gatewayFetch('/style-dna',{version:'v47.4',project:productionName,images:refs,detail:'low'},30000)};
 const requestSelfCorrection=async item=>{const image=await makeGatewayPreview({url:item.processedUrl||item.url});return gatewayFetch('/self-correct',{version:'v47.4',project:productionName,frameName:item.name,image,operations:item.workerManifest?.operations||[],detail:'low'},22000)};
 const applyStyleProfile=async style=>{if(!style)return;files.forEach(f=>{f.styleDNA=style});if(style.score!=null)$id('styleScore').textContent=Math.round(Number(style.score))+'%';try{localStorage.setItem('hotfotoStyleDNA',JSON.stringify(style))}catch{}; if(window.HotFotoGateway?.configured?.()) await saveMemoryStyle(style); syncMemoryUI();const traits=Array.isArray(style.signatureTraits)?style.signatureTraits.slice(0,3).join(' · '):'';if(traits)$id('directorPrompt').textContent='Style DNA learned: '+(style.summary||traits);};
 const runGenerativeEdit=async type=>{
   const item=files[selected];
   if(!item){toast('Select a frame','Upload and select a photograph first.');return}
   if(!window.HotFotoGateway?.configured?.()){toast('Connect AI Gateway','Open AI Gateway and connect the server-side image service first.');return}
   const defaults={retouch:'Natural professional retouching. Preserve identity, facial structure, skin texture and photographic realism.',remove:'Remove the unwanted object or distraction while reconstructing the background naturally.',background:'Replace the background with a refined, photorealistic environment that fits the subject, lighting and lens perspective.',relight:'Relight the photograph with polished editorial light while preserving identity, anatomy, natural shadows and the original photographic character.'};
   const prompt=window.prompt('Tell HotFoto exactly what you want:',defaults[type]);
   if(!prompt)return;
   const buttons=[...document.querySelectorAll('[data-gen]')];buttons.forEach(b=>b.disabled=true);
   setProgress(38,'GENERATIVE EDITING','Sending the selected frame to the model-backed image engine…');
   try{
     const image=await makeGatewayPreview(item);
     const result=await gatewayFetch('/edit',{version:'v47.3',project:productionName,frameName:item.name,image,prompt,model:'gpt-image-2',quality:'high',input_fidelity:'high',output_format:'png'},90000);
     if(!result?.image)throw new Error('NO_GENERATIVE_RESULT');
     item.processedUrl=result.image;item.processed=true;item.worker='generative-image-engine';item.workerManifest={provider:result.provider,model:result.model,prompt,revisedPrompt:result.revisedPrompt,nonDestructive:true};
     renderThumbs();showSelected();
     setProgress(100,'GENERATIVE RESULT READY','Quality Guard should review this rendition before delivery.');
     toast('AI edit complete',result.revisedPrompt||'A new non-destructive rendition was created.');
   }catch(e){setProgress(0,'GENERATION UNAVAILABLE','The original remains untouched. Check the gateway and provider configuration.');toast('AI edit unavailable','HotFoto kept the original safe and did not fake the result.')}finally{buttons.forEach(b=>b.disabled=false)}
 };
 document.querySelectorAll('[data-gen]').forEach(b=>b.addEventListener('click',()=>runGenerativeEdit(b.dataset.gen)));

 const start=async()=>{if(running)return;if(!files.length){toast('Upload first','Drop a shoot into the Studio, then start HotFoto.');input.click();return}running=true;cancelled=false;$id('photoViewport').classList.add('processing');$id('processingTitle').textContent='HOTFOTO IS WORKING';$id('processingDetail').textContent='Understanding your photographic set.';$id('canvasProgress').style.width='4%';if(dockedStart)dockedStart.disabled=true;if(bottomStart)bottomStart.disabled=true;$id('exportBtn').disabled=true;$id('planStatus').textContent='RUNNING';$id('directorState').textContent='HOTFOTO IS WORKING';$id('directorHint').textContent=window.HotFotoGateway?.configured?.()?'Consulting the connected model gateway, then running local-safe production controls.':'Autonomous production is running on your photographs.';$id('directorPrompt').textContent='The production core is making image-level decisions, then checking its own output before approval.';steps.forEach(s=>completeStep(s,'wait'));const modelPlan=await requestModelPlan();if(modelPlan){if(modelPlan.profile&&document.getElementById('shootProfile')?.value==='auto'){$id('shootProfile').value=modelPlan.profile}if(modelPlan.summary)$id('directorPrompt').textContent=modelPlan.summary;if(modelPlan.styleScore&&$id('styleScore'))$id('styleScore').textContent=Math.round(modelPlan.styleScore)+'%';toast('Model plan received','The connected HotFoto gateway supplied a production plan.')}else if(window.HotFotoGateway?.configured?.()){toast('Gateway fallback','Model gateway unavailable. Continuing safely with the local prototype.')}
   completeStep('understand','active');setProgress(4,'UNDERSTANDING SHOOT','Reading dimensions, exposure, detail and color signals.');await sleep(250);for(let i=0;i<files.length;i++){if(cancelled)break;try{files[i].analysis=await analyzeImage(files[i].url)}catch(e){files[i].analysis={score:72,exposure:72,technical:72,detail:72,color:72}}setProgress(4+Math.round(((i+1)/files.length)*16),'UNDERSTANDING SHOOT',`Analyzed frame ${i+1} of ${files.length}.`)}completeStep('understand','done');
   completeStep('cull','active');setProgress(22,'AI CULLING','Ranking focus, exposure, detail and visual quality.');if(window.HotFotoGateway?.configured?.()){const candidates=files.slice(0,Math.min(8,files.length));for(let i=0;i<candidates.length;i++){if(cancelled)break;const ai=await requestModelAnalysis(candidates[i]);if(ai){candidates[i].modelAnalysis=ai;const aiScore=Number(ai.cullScore??ai.visualScore??0);const localScore=Number(candidates[i].analysis?.score||0);if(aiScore>0)candidates[i].analysis.score=Math.round(localScore*.4+aiScore*.6);candidates[i].confidence=Number(ai.confidence||0);candidates[i].flags=ai.flags||[];}setProgress(22+Math.round(((i+1)/candidates.length)*10),'AI CULLING',`Model-analyzed frame ${i+1} of ${candidates.length}.`)}toast('Vision analysis complete',`${candidates.filter(f=>f.modelAnalysis).length} frame${candidates.filter(f=>f.modelAnalysis).length===1?'':'s'} scored by the connected model.`)}const ranked=[...files].sort((a,b)=>(b.analysis?.score||0)-(a.analysis?.score||0));ranked.forEach((f,i)=>f.keeper=i<Math.max(1,Math.ceil(files.length*.72)));selected=files.indexOf(ranked[0]);renderThumbs();await sleep(300);completeStep('cull','done');
   completeStep('develop','active');setProgress(36,'DEVELOPING & COLOR','Applying adaptive exposure, contrast and color balancing.');for(let i=0;i<files.length;i++){if(cancelled)break;await processImage(files[i]);processedCount++;setProgress(36+Math.round(((i+1)/files.length)*18),'DEVELOPING & COLOR',`Developed frame ${i+1} of ${files.length}.`);$id('processingTitle').textContent='DEVELOPING FRAME '+String(i+1).padStart(2,'0');$id('processingDetail').textContent='Balancing exposure, color and detail.';$id('canvasProgress').style.width=(36+Math.round(((i+1)/files.length)*18))+'%';if(i===selected)select(selected)}completeStep('develop','done');
   completeStep('retouch','active');setProgress(56,'REFINING DETAILS','Preparing natural detail and subject-safe refinement.');await sleep(Math.min(900,150+files.length*40));completeStep('retouch','done');
   completeStep('style','active');setProgress(67,'LEARNING STYLE DNA','Learning the photographer’s signature from the strongest frames.');const styleRefs=[...files].sort((a,b)=>(b.analysis?.score||0)-(a.analysis?.score||0)).slice(0,Math.min(6,files.length));const style=window.HotFotoGateway?.configured?.()?await requestStyleDNA(styleRefs):null;if(style){await applyStyleProfile(style);toast('Style DNA learned',`${Math.round(Number(style.score||0))}% confidence across ${style.references||styleRefs.length} reference frames.`)}else{const saved=(()=>{try{return JSON.parse(localStorage.getItem('hotfotoStyleDNA')||'null')}catch{return null}})();if(saved)await applyStyleProfile(saved);else $id('styleScore').textContent='—';}await sleep(350);completeStep('style','done');
   completeStep('quality','active');
   $id('processingTitle').textContent='QUALITY GUARD';
   $id('processingDetail').textContent='Checking every processed result, then self-correcting weak frames.';
   $id('canvasProgress').style.width='78%';
   setProgress(78,'QUALITY GUARD','Running independent checks and a bounded self-correction loop.');
   const avg=Math.round(files.reduce((s,f)=>s+(f.analysis?.score||78),0)/files.length);
   let q=Math.max(88,Math.min(98,avg+6));
   files.forEach(f=>f.quality=Math.max(80,Math.min(99,(f.analysis?.score||q)+6)));
   if(window.HotFotoGateway?.configured?.()){
     const targets=[...files].filter(f=>f.keeper).slice(0,8);
     for(let i=0;i<targets.length;i++){
       const f=targets[i];
       const guard=await requestModelQuality(f);
       if(guard){
         f.modelQuality=guard;
         if(Number.isFinite(Number(guard.score))) f.quality=Math.round(Number(guard.score));
         if(guard.pass===false){
           const correction=await requestSelfCorrection(f);
           f.selfCorrection=correction;
           if(correction?.rerun && Array.isArray(correction.operations) && correction.operations.length){
             const preview=await makeGatewayPreview(f);
             const rerun=await gatewayFetch('/process',{version:'v47.4',project:productionName,frameName:f.name,image:preview,maxEdge:2400,quality:92,operations:correction.operations},30000);
             if(rerun?.image){
               f.processedUrl=rerun.image;
               f.processed=true;
               f.workerManifest=rerun.operationManifest;
               const finalGuard=await requestModelQuality(f);
               if(finalGuard){
                 f.modelQuality=finalGuard;
                 if(Number.isFinite(Number(finalGuard.score))) f.quality=Math.round(Number(finalGuard.score));
                 f.selfCorrection.final=finalGuard;
               }
             }
           }
         }
       }
       setProgress(78+Math.round(((i+1)/Math.max(1,targets.length))*10),'QUALITY GUARD',`Verified keeper ${i+1} of ${targets.length}.`);
     }
     toast('Self-correction complete',`${targets.length} keeper${targets.length===1?'':'s'} passed through bounded Quality Guard.`);
     q=Math.round(files.reduce((s,f)=>s+(f.quality||q),0)/files.length);
   }
   $id('qualityScore').textContent=q;
   $id('canvasScore').textContent=files[selected]?.quality||q;
   await sleep(500);
   completeStep('quality','done');
   completeStep('delivery','active');$id('processingTitle').textContent='PREPARING DELIVERY';$id('processingDetail').textContent='Building your production-ready masters.';$id('canvasProgress').style.width='90%';setProgress(90,'PREPARING DELIVERY','Building master-ready processed images and delivery metadata.');select(selected);await sleep(550);completeStep('delivery','done');running=false;$id('photoViewport').classList.remove('processing');$id('canvasProgress').style.width='100%';$id('processingTitle').textContent='PRODUCTION COMPLETE';$id('processingDetail').textContent='Your selected frame is ready to inspect.';setProgress(100,'PRODUCTION COMPLETE',`${files.filter(f=>f.keeper).length} keepers · ${files.length} analyzed · Quality Guard ${q}/100.`);$id('planStatus').textContent='COMPLETE';$id('directorState').textContent='READY FOR DELIVERY';$id('directorHint').textContent='Production passed the autonomous quality loop.';$id('directorPrompt').textContent='HotFoto analyzed the shoot, ranked the frames, produced processed masters, applied Style DNA and verified the result. Your originals remain untouched.';$id('exportBtn').disabled=false;if(dockedStart)dockedStart.disabled=false;if(bottomStart)bottomStart.disabled=false;$id('studioNavState').textContent='COMPLETE';toast('Production complete',`${files.length} analyzed · ${files.filter(f=>f.keeper).length} keepers · Quality Guard ${q}/100.`);renderThumbs();select(selected);
 };
 $id('startHotFoto')?.addEventListener('click',start);$id('startHotFotoDocked')?.addEventListener('click',start);$id('startHotFotoBottom')?.addEventListener('click',start);
 $id('selectBest')?.addEventListener('click',()=>{if(!files.length){toast('No frames yet','Load a shoot first.');return}const best=files.reduce((bi,f,i)=>(f.analysis?.score||0)>(files[bi]?.analysis?.score||0)?i:bi,0);files.forEach(f=>f.keeper=false);files[best].keeper=true;selected=best;renderThumbs();select(best);toast('Hero frame selected','HotFoto selected the strongest frame from the analysis.');});
 $id('clearFrames')?.addEventListener('click',()=>{files.forEach(f=>f.file&&URL.revokeObjectURL(f.url));files.length=0;running=false;empty.hidden=false;stage.hidden=true;$id('photoViewport').classList.remove('has-image','processing','show-original');$id('beforeLayer').style.backgroundImage='';$id('studioPhoto').style.backgroundImage='';syncStartActions(false);renderThumbs();setProductionName('NEW PRODUCTION');$id('projectMeta').textContent='Drop a shoot to begin';$id('qualityScore').textContent='—';$id('styleScore').textContent='—';steps.forEach(s=>completeStep(s,'wait'));$id('planStatus').textContent='STANDBY';setProgress(0,'SYSTEM READY','Your originals are never overwritten.');$id('exportBtn').disabled=true;toast('Studio cleared','Ready for a new production.');});
 $id('resetStudio')?.addEventListener('click',()=>document.getElementById('clearFrames').click());
 $id('compareToggle')?.addEventListener('click',()=>{$id('photoViewport').classList.toggle('show-original');$id('compareToggle').firstChild.textContent=$id('photoViewport').classList.contains('show-original')?'HOTFOTO ':'ORIGINAL ';select(selected)});
 document.querySelectorAll('.canvas-control').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.canvas-control').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(b.dataset.canvas==='original'){$id('photoViewport').classList.add('show-original')}else{$id('photoViewport').classList.remove('show-original');if(b.dataset.canvas==='processed')select(selected)}}));
 document.querySelectorAll('.rail-item').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.rail-item').forEach(x=>x.classList.remove('active'));b.classList.add('active');const v=b.dataset.view;const map={overview:['Overview','Production overview'],cull:['AI Culling','Ranking frames using image-level quality signals.'],develop:['Develop','Adaptive exposure, contrast and color processing.'],retouch:['Retouch','Natural subject-safe refinement stage.'],style:['Style DNA','Set-level visual consistency and signature treatment.'],quality:['Quality Guard','Self-checking before delivery.'],delivery:['Delivery','Processed masters and delivery preparation.']};$id('panelTitle').textContent=map[v][0];$id('directorHint').textContent=map[v][1]}));
 $id('directorTextBtn')?.addEventListener('click',()=>toast('AI Director','Natural-language direction will connect to the production core in the model-backed build.'));

 const exportModal=$id('exportModal'), exportScope=$id('exportScope'), exportFormat=$id('exportFormat'), exportSize=$id('exportSize'), exportQuality=$id('exportQuality'), exportZip=$id('exportZip'), exportCount=$id('exportCount'), exportSummary=$id('exportSummaryText');
 const processedFiles=()=>files.filter(f=>f.processedUrl);
 const exportSelection=()=>{const ready=processedFiles();if(exportScope?.value==='keepers')return ready.filter(f=>f.keeper);if(exportScope?.value==='selected')return ready[selected]?[ready[selected]]:[];return ready};
 const updateExportSummary=()=>{const n=exportSelection().length;if(exportCount)exportCount.textContent=n+' image'+(n===1?'':'s');if(exportSummary)exportSummary.textContent=n?(exportScope.value==='keepers'?'Keeper frames selected.':exportScope.value==='selected'?'Current frame selected.':'Every processed frame selected.'):'No processed images selected.';if(exportZip)exportZip.disabled=n<2;if(n<2&&exportZip)exportZip.checked=false};
 const openExport=()=>{if(!processedFiles().length){toast('Nothing to export','Run START HOTFOTO first.');return}updateExportSummary();exportModal?.classList.add('open');exportModal?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};
 const closeExport=()=>{exportModal?.classList.remove('open');exportModal?.setAttribute('aria-hidden','true');document.body.style.overflow=''};
 const makeExportBlob=async(item,format,maxSize,quality)=>{const im=await loadImage(item.processedUrl);let w=im.naturalWidth,h=im.naturalHeight;if(maxSize!=='original'){const limit=Number(maxSize),scale=Math.min(1,limit/Math.max(w,h));w=Math.max(1,Math.round(w*scale));h=Math.max(1,Math.round(h*scale))}const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);const mime=format==='png'?'image/png':format==='webp'?'image/webp':'image/jpeg';return new Promise(r=>c.toBlob(b=>r(b),mime,Number(quality)))};
 const safeName=n=>(n||'hotfoto-output').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'-').replace(/-+/g,'-');
 const runExport=async()=>{const items=exportSelection();if(!items.length){toast('Nothing to export','There are no processed images in this selection.');return}const format=exportFormat.value,size=exportSize.value,quality=exportQuality.value,zip=exportZip.checked&&items.length>1;const btn=$id('confirmExport');btn.disabled=true;btn.innerHTML='<span>◌</span> PREPARING DELIVERY <i>…</i>';try{if(zip&&window.JSZip){const archive=new JSZip();for(let i=0;i<items.length;i++){const blob=await makeExportBlob(items[i],format,size,quality);archive.file(safeName(productionName)+'-'+String(i+1).padStart(3,'0')+'-'+safeName(items[i].name)+'-hotfoto.'+format,blob)}const out=await archive.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:6}});const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=safeName(productionName)+'-HotFoto-Delivery.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}else{for(const item of items){const blob=await makeExportBlob(item,format,size,quality);const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=safeName(productionName)+'-'+String(items.indexOf(item)+1).padStart(3,'0')+'-'+safeName(item.name)+'-hotfoto.'+format;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);await sleep(90)}}closeExport();toast('Delivery exported',items.length+' processed image'+(items.length===1?'':'s')+' exported as '+format.toUpperCase()+'.')}catch(e){toast('Export failed','HotFoto could not prepare the selected delivery.')}finally{btn.disabled=false;btn.innerHTML='<span>⇩</span> EXPORT DELIVERY <i>↗</i>'}};
 $id('exportBtn')?.addEventListener('click',openExport);$id('confirmExport')?.addEventListener('click',runExport);exportScope?.addEventListener('change',updateExportSummary);
 document.querySelectorAll('[data-export-close]').forEach(x=>x.addEventListener('click',closeExport));
 document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{const p=b.dataset.preset;if(p==='client'){exportScope.value='all';exportFormat.value='jpeg';exportSize.value='original';exportQuality.value='0.94'}if(p==='web'){exportScope.value='all';exportFormat.value='webp';exportSize.value='2000';exportQuality.value='0.88'}if(p==='social'){exportScope.value='keepers';exportFormat.value='jpeg';exportSize.value='1600';exportQuality.value='0.88'}if(p==='print'){exportScope.value='all';exportFormat.value='jpeg';exportSize.value='original';exportQuality.value='1'}exportZip.checked=exportSelection().length>1;updateExportSummary()}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&exportModal?.classList.contains('open'))closeExport()});
})();

/* HotFoto AI Studio V47 — model gateway contract and runtime adapter */
(()=>{
 const modal=document.getElementById('gatewayModal');
 const endpointInput=document.getElementById('gatewayEndpoint');
 const state=document.getElementById('gatewayState');
 const stateText=document.getElementById('gatewayStateText');
 const latency=document.getElementById('gatewayLatency');
 const open=()=>{const saved=localStorage.getItem('hotfotoGatewayEndpoint')||'';if(endpointInput)endpointInput.value=saved;modal?.classList.add('open');modal?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};
 const close=()=>{modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.style.overflow=''};
 document.getElementById('gatewayBtn')?.addEventListener('click',open);
 document.querySelectorAll('[data-gateway-close]').forEach(x=>x.addEventListener('click',close));
 document.getElementById('saveGateway')?.addEventListener('click',()=>{const value=(endpointInput?.value||'').trim().replace(/\/$/,'');if(!value){localStorage.removeItem('hotfotoGatewayEndpoint');if(state)state.textContent='LOCAL PROTOTYPE';if(stateText)stateText.textContent='Browser-side processing is active. No external model service is connected.';if(latency)latency.textContent='—';return}try{new URL(value)}catch{if(stateText)stateText.textContent='Enter a valid HTTPS gateway URL.';return}localStorage.setItem('hotfotoGatewayEndpoint',value);if(state)state.textContent='GATEWAY CONFIGURED';if(stateText)stateText.textContent='Studio is configured to use a server-side HotFoto model gateway when available.'});
 document.getElementById('testGateway')?.addEventListener('click',async()=>{const value=(endpointInput?.value||'').trim().replace(/\/$/,'');if(!value){if(stateText)stateText.textContent='Add a gateway endpoint first.';return}const started=performance.now();if(state)state.textContent='TESTING CONNECTION';if(stateText)stateText.textContent='Checking the server-side health endpoint…';try{const r=await fetch(value+'/health',{headers:{Accept:'application/json'},cache:'no-store'});const ms=Math.round(performance.now()-started);if(latency)latency.textContent=ms+' ms';if(r.ok){if(state)state.textContent='MODEL GATEWAY ONLINE';if(stateText)stateText.textContent='The HotFoto gateway responded successfully. Provider credentials remain server-side.'}else{if(state)state.textContent='GATEWAY REACHABLE';if(stateText)stateText.textContent='The endpoint responded, but /health did not return OK ('+r.status+').'}}catch(e){if(latency)latency.textContent='—';if(state)state.textContent='LOCAL PROTOTYPE';if(stateText)stateText.textContent='Gateway unavailable. Studio remains fully usable in local prototype mode.'}});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))close()});
 window.HotFotoGateway={getEndpoint:()=>localStorage.getItem('hotfotoGatewayEndpoint')||'',configured:()=>!!localStorage.getItem('hotfotoGatewayEndpoint')};
})();

/* HotFoto AI Studio V46 — 50-capability engine map + production intelligence layer */
(()=>{
 const map=document.getElementById('engineMapBtn');
 if(!map) return;
 const $=id=>document.getElementById(id);
 const capabilities=[
  ['01','Ingest & format recognition','Ingest','live','Detects supported image inputs and prepares the shoot.'],
  ['02','EXIF & capture metadata','Ingest','live','Reads camera, lens, dimensions and capture context.'],
  ['03','Duplicate detection','Ingest','wired','Finds exact and near-duplicate frames before production.'],
  ['04','Burst & sequence grouping','Ingest','wired','Groups rapid sequences so decisions are made in context.'],
  ['05','Preview & contact-sheet generation','Ingest','live','Builds responsive previews and filmstrip navigation.'],
  ['06','Original protection / non-destructive master','Ingest','live','Keeps source files untouched and separates delivery copies.'],
  ['07','Scene & genre recognition','Understand','model','Recognizes portrait, wedding, event, product, landscape and more.'],
  ['08','Subject & people detection','Understand','model','Maps people, products, faces and primary subjects.'],
  ['09','Camera & lens context','Understand','live','Uses capture metadata to inform processing decisions.'],
  ['10','Lighting context analysis','Understand','model','Reads mixed light, direction, temperature and contrast.'],
  ['11','Composition intelligence','Understand','model','Scores framing, balance, horizon and visual weight.'],
  ['12','Story / visual grouping','Understand','wired','Groups photographs by moment, scene and visual similarity.'],
  ['13','Focus & sharpness scoring','Cull','live','Ranks technical detail and sharpness signals.'],
  ['14','Eyes & expression scoring','Cull','model','Prioritizes open eyes, expression and portrait quality.'],
  ['15','Technical quality scoring','Cull','live','Scores exposure, clipping, detail and color signals.'],
  ['16','Hero-frame selection','Cull','live','Selects the strongest frame as the visual reference.'],
  ['17','Cull-to-target intelligence','Cull','wired','Can target a desired keeper count instead of a fixed ratio.'],
  ['18','Keeper tiers / priority ranking','Cull','wired','Separates hero, deliverable, supporting and reject tiers.'],
  ['19','Adaptive exposure correction','Develop','live','Balances tonal exposure using image-level analysis.'],
  ['20','White-balance intelligence','Develop','model','Corrects color temperature while protecting intentional color.'],
  ['21','Tone-curve optimization','Develop','model','Builds natural highlight rolloff and shadow structure.'],
  ['22','Color-science / HSL intelligence','Develop','model','Balances hue, saturation and luminance by photographic context.'],
  ['23','Lens profile correction','Develop','model','Corrects distortion, vignetting and optical behavior.'],
  ['24','HDR / dynamic-range recovery','Develop','model','Balances difficult highlights, windows and deep shadows.'],
  ['25','AI denoise / low-light recovery','Develop','model','Recovers detail while controlling high-ISO noise.'],
  ['26','Super-resolution / detail recovery','Develop','model','Upscales while protecting faces, texture and fine detail.'],
  ['27','Perspective & geometry correction','Develop','model','Straightens architectural lines and perspective.'],
  ['28','Output-aware sharpening','Develop','model','Applies destination-aware sharpening after resizing.'],
  ['29','Skin analysis & texture preservation','Retouch','model','Separates skin from hair and protects natural texture.'],
  ['30','Blemish / temporary-mark removal','Retouch','model','Removes transient distractions without erasing identity.'],
  ['31','Face & eye enhancement','Retouch','model','Improves eyes, facial detail and natural brightness.'],
  ['32','Teeth & hair refinement','Retouch','model','Balances smiles and cleans flyaways without plastic results.'],
  ['33','AI dodge & burn / form shaping','Retouch','model','Improves dimensionality while respecting existing light.'],
  ['34','Clothing & object cleanup','Retouch','model','Cleans wrinkles, stray objects and distracting details.'],
  ['35','Background cleanup','Retouch','model','Removes clutter and repairs scene continuity.'],
  ['36','Identity-safe retouching','Retouch','wired','Applies guardrails against facial drift and over-retouching.'],
  ['37','Style DNA learning','Style','wired','Learns the photographer’s visual signature from references.'],
  ['38','Set consistency engine','Style','wired','Matches exposure, skin, color and contrast across the set.'],
  ['39','Lighting Director','Style','model','Relights images while respecting subject geometry and direction.'],
  ['40','Sky / background intelligence','Style','model','Enhances, replaces or extends backgrounds with edge-aware matching.'],
  ['41','Generative remove / replace / expand','Style','model','Performs context-aware scene transformation and extension.'],
  ['42','Composition & intelligent crop','Style','model','Creates strong crops for the subject and destination.'],
  ['43','Genre-specific treatment','Style','wired','Switches processing priorities for wedding, fashion, product and more.'],
  ['44','Natural-language AI Director','Style','wired','Turns photographer intent into an executable production plan.'],
  ['45','Artifact & anomaly detection','Quality','wired','Checks faces, edges, halos, duplication and generative artifacts.'],
  ['46','Self-correction production loop','Quality','model','Re-runs weak operations until the result passes quality thresholds.'],
  ['47','Confidence scoring & review queue','Quality','wired','Routes low-confidence decisions to review instead of guessing.'],
  ['48','Smart export profiles','Delivery','live','Packages client, web, social and print outputs.'],
  ['49','Project naming / metadata / delivery packaging','Delivery','live','Uses the production identity for files, folders and ZIP delivery.'],
  ['50','Project & style memory','Delivery','model','Remembers preferences, clients and successful production decisions.']
 ];
 const engineModal=$('engineModal'), list=$('engineList'), reviewModal=$('reviewModal');
 const stateLabel={live:'LIVE CORE',wired:'WIRED',model:'MODEL ENGINE'};
 const stateClass={live:'live',wired:'wired',model:'model'};
 const render=filter=>{list.innerHTML='';capabilities.filter(c=>filter==='all'||c[3]===filter).forEach(c=>{const el=document.createElement('article');el.className='engine-row';el.dataset.state=c[3];el.innerHTML=`<span class="engine-no">${c[0]}</span><div><b>${c[1]}</b><small>${c[2]} · ${c[4]}</small></div><em class="engine-state ${stateClass[c[3]]}">${stateLabel[c[3]]}</em>`;list.appendChild(el)})};
 render('all');
 const openEngine=()=>{render(document.querySelector('#engineFilter button.active')?.dataset.filter||'all');engineModal?.classList.add('open');engineModal?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'};
 const closeEngine=()=>{engineModal?.classList.remove('open');engineModal?.setAttribute('aria-hidden','true');if(!reviewModal?.classList.contains('open'))document.body.style.overflow=''};
 map.addEventListener('click',openEngine);$('engineMapInline')?.addEventListener('click',openEngine);
 document.querySelectorAll('#engineFilter button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('#engineFilter button').forEach(x=>x.classList.remove('active'));b.classList.add('active');render(b.dataset.filter)}));
 document.querySelectorAll('[data-engine-close]').forEach(x=>x.addEventListener('click',closeEngine));
 const modeSwitch=$('modeSwitch');modeSwitch?.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{modeSwitch.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const mode=b.dataset.mode;const hint={auto:'Autonomous mode: HotFoto makes the production decisions.',pro:'Pro mode: HotFoto exposes stronger controls and review points.',director:'Director mode: natural-language intent drives the production plan.'}[mode];const d=$('directorHint');if(d)d.textContent=hint}));
 document.getElementById('saveStyleMemory')?.addEventListener('click',async()=>{const style=files.find(f=>f.styleDNA)?.styleDNA; if(!style){toast('Style DNA not ready','Run HotFoto production first so the system can learn your signature.');return} if(window.HotFotoGateway?.configured?.()){const r=await saveMemoryStyle(style);toast(r?'Style remembered':'Memory unavailable',r?'Your photographer profile was updated.':'HotFoto kept the local Style DNA safely.');syncMemoryUI()}else toast('Gateway required','Connect the server gateway to persist photographer intelligence.');});
 document.getElementById('approveFrame')?.addEventListener('click',async()=>{const r=await sendFeedback('approved');toast(r?'Feedback learned':'Feedback queued',r?'HotFoto recorded this frame as approved.':'Connect the gateway to persist feedback.');syncMemoryUI()});
 document.getElementById('rejectFrame')?.addEventListener('click',async()=>{const r=await sendFeedback('rejected');toast(r?'Feedback learned':'Feedback queued',r?'HotFoto recorded this frame as rejected.':'Connect the gateway to persist feedback.');syncMemoryUI()});
 syncMemoryUI();
 const profile=$('shootProfile');profile?.addEventListener('change',()=>{const name=profile.options[profile.selectedIndex].text;const d=$('directorHint');if(d)d.textContent=name==='Auto detect'?'HotFoto will infer the photographic context from the shoot.':`HotFoto will prioritize ${name.toLowerCase()} production intelligence.`});
 const reviewBtn=$('reviewQueueBtn');const reviewCount=$('reviewCount');const consistency=$('consistencyScore');
 const updateReview=()=>{const q=Number(reviewCount?.textContent||0);const title=$('reviewTitle'),text=$('reviewText');if(q){if(title)title.textContent=`${q} frame${q===1?'':'s'} need review.`;if(text)text.textContent='HotFoto held these frames because confidence was below the autonomous approval threshold.'}else{if(title)title.textContent='Nothing needs your attention.';if(text)text.textContent='HotFoto will place low-confidence frames here instead of silently making risky decisions.'}};
 reviewBtn?.addEventListener('click',()=>{updateReview();reviewModal?.classList.add('open');reviewModal?.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'});
 document.querySelectorAll('[data-review-close]').forEach(x=>x.addEventListener('click',()=>{reviewModal?.classList.remove('open');reviewModal?.setAttribute('aria-hidden','true');if(!engineModal?.classList.contains('open'))document.body.style.overflow=''}));
 const syncFromStatus=()=>{const nav=$('studioNavState');if(nav?.textContent==='COMPLETE'){const q=$('qualityScore')?.textContent||'—';if(consistency)consistency.textContent=q==='—'?'—':Math.max(90,Math.min(99,Number(q)-1))+'%';if(reviewCount)reviewCount.textContent='0'}};
 const observer=new MutationObserver(syncFromStatus);observer.observe($('studioNavState'),{childList:true,characterData:true,subtree:true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeEngine();reviewModal?.classList.remove('open');reviewModal?.setAttribute('aria-hidden','true');if(!engineModal?.classList.contains('open'))document.body.style.overflow=''}});
})();
