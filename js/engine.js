const capabilities = [
['Ingest','01','Ingest & format recognition','live'],['Ingest','02','EXIF & capture metadata','live'],['Ingest','03','Duplicate detection','wired'],['Ingest','04','Burst & sequence grouping','wired'],['Ingest','05','Preview & contact-sheet generation','live'],['Ingest','06','Original protection / non-destructive master','live'],
['Understand','07','Scene & genre recognition','model'],['Understand','08','Subject & people detection','model'],['Understand','09','Camera & lens context','live'],['Understand','10','Lighting context analysis','model'],['Understand','11','Composition intelligence','model'],['Understand','12','Story / visual grouping','wired'],
['Cull','13','Focus & sharpness scoring','live'],['Cull','14','Eyes & expression scoring','model'],['Cull','15','Technical quality scoring','live'],['Cull','16','Hero-frame selection','live'],['Cull','17','Cull-to-target intelligence','wired'],['Cull','18','Keeper tiers / priority ranking','wired'],
['Develop','19','Adaptive exposure correction','live'],['Develop','20','White-balance intelligence','model'],['Develop','21','Tone-curve optimization','model'],['Develop','22','Color-science / HSL intelligence','model'],['Develop','23','Lens profile correction','model'],['Develop','24','HDR / dynamic-range recovery','model'],['Develop','25','AI denoise / low-light recovery','model'],['Develop','26','Super-resolution / detail recovery','model'],['Develop','27','Perspective & geometry correction','model'],['Develop','28','Output-aware sharpening','model'],
['Retouch','29','Skin analysis & texture preservation','model'],['Retouch','30','Blemish / temporary-mark removal','model'],['Retouch','31','Face & eye enhancement','model'],['Retouch','32','Teeth & hair refinement','model'],['Retouch','33','AI dodge & burn / form shaping','model'],['Retouch','34','Clothing & object cleanup','model'],['Retouch','35','Background cleanup','model'],['Retouch','36','Identity-safe retouching','wired'],
['Style','37','Style DNA learning','wired'],['Style','38','Set consistency engine','wired'],['Style','39','Lighting Director','model'],['Style','40','Sky / background intelligence','model'],['Style','41','Generative remove / replace / expand','model'],['Style','42','Composition & intelligent crop','model'],['Style','43','Genre-specific treatment','wired'],['Style','44','Natural-language AI Director','wired'],
['Quality','45','Artifact & anomaly detection','wired'],['Quality','46','Self-correction production loop','model'],['Quality','47','Confidence scoring & review queue','wired'],
['Delivery','48','Smart export profiles','live'],['Delivery','49','Project naming / metadata / delivery packaging','live'],['Delivery','50','Project & style memory','model'],
['Platform','51','Secure accounts & expiring sessions','live'],['Platform','52','Account-scoped photographer intelligence','wired'],['Platform','53','Persistent feedback ledger','wired'],['Platform','54','PostgreSQL persistence boundary','wired'],['Platform','55','S3-compatible cloud asset storage','wired'],['Platform','56','Resumable multipart uploads','wired'],['Platform','57','Signed private asset downloads','wired'],['Platform','58','Project workspace & asset browser','live'],['Platform','59','Client delivery / private gallery','wired'],['Platform','60','Client proofing & selection','wired'],['Platform','61','Delivery finalization','wired'],['Platform','62','Real export execution & ZIP packaging','live'],['Platform','63','AI Album & Gallery Designer','model'],['Platform','64','AI Story Intelligence','model'],['Platform','65','AI Social Studio','model'],['Platform','66','AI Campaign Studio','model'],['Platform','67','AI Campaign Command Center / calendar','wired'],['Platform','68','Campaign performance intelligence','planned'],['Platform','69','AI Campaign execution automation','planned'],['Platform','70','Client Gallery personalization','planned'],['Platform','71','Album print-production handoff','planned'],['Platform','72','Style Marketplace','planned'],['Platform','73','Studio team / collaboration layer','planned'],['Platform','74','AI Video production layer','planned']
];
const releases=[
['V46','Foundation & Capability Audit','Established the 50-capability HotFoto production engine and made capability state explicit.','50-capability registry','Engine Map','Review Queue'],
['V47.1','Model Gateway','Created the server-side AI gateway and provider abstraction for model-backed production.','Model Gateway','Provider boundary','Secure keys'],
['V47.2','Image Worker','Added real server-side photographic processing with Sharp and non-destructive manifests.','Image Worker','Exposure','Sharpening'],
['V47.3','Generative Engine','Added the architecture for real generative image editing without pretending unavailable processing is live.','Generative editing','Remove / replace','Relighting'],
['V47.4–47.6','Learning & Self-Correction','Added Style DNA, Quality Guard self-correction boundaries, photographer feedback and persistent intelligence.','Style DNA','Feedback ledger','Project memory'],
['V47.7–47.9','Accounts & Cloud Assets','Added secure accounts, PostgreSQL persistence, S3-compatible storage and resumable cloud uploads.','Accounts','Cloud assets','Multipart uploads'],
['V48.0–48.5','Projects & Delivery','Built Projects, private delivery, proofing, finalization, intelligent packaging and actual export execution.','Projects','Proofing','Exports'],
['V48.6','AI Album & Gallery Designer','Added cinematic sequencing and album/gallery planning with persistent album records.','Album Designer','Gallery','Editorial layouts'],
['V48.7','AI Story Intelligence','Added vision-powered narrative ranking, roles, beats, confidence and story-aware sequencing.','Story ranking','Narrative beats','Confidence'],
['V48.8','AI Social Studio','Added platform-aware social content planning, captions, hooks, hashtags and accessibility copy.','Social Studio','Platform formats','Content board'],
['V48.9','AI Campaign Studio','Connected Story Intelligence and Social Studio into multi-post campaign arcs.','Campaign arcs','Multi-platform','Campaign Director'],
['V48.10','AI Campaign Command Center','Added campaign calendar planning, cadence, publishing dates, time recommendations and sequence visibility.','Calendar','Cadence','Publishing plan'],
['V48.11','HotFoto OS Intelligence Map','This view consolidates the system so the full build can be inspected in one place.','Capability map','Build history','System architecture']
];

const stateLabel={live:'LIVE CORE',wired:'WIRED',model:'MODEL ENGINE',planned:'PLANNED'};
const groups=['Ingest','Understand','Cull','Develop','Retouch','Style','Quality','Delivery','Platform'];
function render(filter='all'){
 const grid=document.getElementById('capabilityGrid'); grid.innerHTML='';
 groups.forEach(group=>{
  const rows=capabilities.filter(c=>c[0]===group && (filter==='all'||c[3]===filter));
  if(!rows.length)return;
  const stage=document.createElement('article'); stage.className='os-stage';
  stage.innerHTML=`<div class="stage-head"><h3>${group}</h3><small>${rows.length} CAPABILITIES</small></div><div class="cap-list">${rows.map(c=>`<div class="cap"><span class="cap-num">${c[1]}</span><div><b>${c[2]}</b><small>${group==='Platform'?'Platform intelligence':'Production engine'}</small></div><span class="state state-${c[3]}">${stateLabel[c[3]]}</span></div>`).join('')}</div>`;
  grid.appendChild(stage);
 });
}
function renderTimeline(){
 document.getElementById('timelineList').innerHTML=releases.map(r=>`<div class="timeline-item"><div class="timeline-card"><div class="timeline-top"><b>${r[0]} · ${r[1]}</b><span>MILESTONE</span></div><p>${r[2]}</p><div class="release-tags">${r.slice(3).map(x=>`<span>${x}</span>`).join('')}</div></div></div>`).join('');
}
function setup(){
 document.querySelectorAll('#filters button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#filters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.filter)}));
 document.getElementById('jumpTimeline').addEventListener('click',()=>document.getElementById('timeline').scrollIntoView({behavior:'smooth'}));
 render(); renderTimeline();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
