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
const detailMeta={
  'Style DNA learning': ['Learns a photographer’s recurring visual preferences from explicit feedback and approved work.','AI Director · Set consistency · Project memory','Preference learning / workflow intelligence','V47.4','Model-backed learning with stronger cross-project adaptation','Style DNA is a preference layer, not an absolute command.'],
  'Natural-language AI Director': ['Turns photographic intent expressed in natural language into a bounded production plan.','Planner · Style DNA · Quality Guard','Model-backed orchestration','V47.5','Deeper agentic production planning','Never invents completion when a provider is unavailable.'],
  'AI Story Intelligence': ['Ranks frames and builds narrative roles so galleries and albums have a deliberate visual progression.','Album Designer · Client Gallery · Campaign Studio','Vision + sequencing intelligence','V48.7','Learned narrative preferences across projects','Falls back to deterministic sequencing when model services are unavailable.'],
  'AI Social Studio': ['Transforms selected photographic stories into platform-aware social content packages.','Story Intelligence · Campaign Studio','Model-backed content intelligence','V48.8','Performance-aware content optimization','Captions and hooks are generated only when the configured model is available.'],
  'AI Campaign Studio': ['Builds multi-post creative arcs instead of treating every social post as an isolated asset.','Social Studio · Story Intelligence · Campaign Command Center','Model-backed campaign planning','V48.9','Adaptive campaign strategy','Campaign structure remains inspectable even without a model provider.'],
  'AI Campaign Command Center / calendar': ['Turns campaign strategy into a concrete publishing sequence with cadence and timing visibility.','Campaign Studio · Social Studio','Workflow intelligence','V48.10','Execution and performance feedback','Planning is distinct from claiming a post was actually published.'],
  'Campaign performance intelligence': ['Will learn from campaign outcomes and connect performance signals back to future creative decisions.','Campaign Command Center · Photographer Intelligence','Planned intelligence layer','V48.10 roadmap','Performance-informed recommendations','Planned; no fabricated analytics are shown.'],
  'AI Campaign execution automation': ['Will coordinate approved campaign actions after human review and authorization.','Campaign Command Center · Delivery','Planned agentic automation','Roadmap','Human-approved execution agents','Planned; publishing credentials and permissions are intentionally not simulated.'],
  'Project & style memory': ['Persists project context and photographer preferences so production decisions improve over time.','Style DNA · Feedback ledger · Projects','Persistent intelligence','V47.6','Richer cross-project memory','Memory is scoped to the photographer account.'],
  'Self-correction production loop': ['Detects bounded quality problems and can recommend or apply a conservative correction pass.','Quality Guard · Image Worker','Model-backed quality intelligence','V47.4','Multi-pass confidence-aware correction','Generative edits are excluded from the automatic correction loop.'],
  'Confidence scoring & review queue': ['Surfaces uncertain decisions for human review rather than hiding model ambiguity.','Cull · Quality Guard · AI Director','Workflow intelligence','V46','Confidence-aware review routing','Conservative confidence is preferred over invented certainty.']
};
const stagePurpose={Ingest:'Bring source photography into the system safely.',Understand:'Build photographic context before editing.',Cull:'Separate keepers from technical or narrative weak frames.',Develop:'Improve photographic quality while protecting intent.',Retouch:'Refine people, objects and surfaces without losing realism.',Style:'Apply creative direction and photographer identity.',Quality:'Catch errors and route uncertainty back into review.',Delivery:'Turn approved work into reproducible client-ready outputs.',Platform:'Provide the persistent account, cloud, collaboration and intelligence layer.'};
const releaseByNum={1:'V46',2:'V46',3:'V46',4:'V46',5:'V46',6:'V46',7:'V47.1',8:'V47.1',9:'V47.1',10:'V47.1',11:'V47.1',12:'V47.1',13:'V46',14:'V46',15:'V46',16:'V46',17:'V46',18:'V46',19:'V47.2',20:'V47.2',21:'V47.2',22:'V47.2',23:'V47.2',24:'V47.2',25:'V47.2',26:'V47.2',27:'V47.2',28:'V47.2',29:'V47.2',30:'V47.2',31:'V47.2',32:'V47.2',33:'V47.2',34:'V47.2',35:'V47.2',36:'V47.4',37:'V47.4',38:'V47.4',39:'V47.4',40:'V47.4',41:'V47.3',42:'V47.4',43:'V47.4',44:'V47.5',45:'V47.4',46:'V47.4',47:'V46',48:'V46',49:'V48.4',50:'V47.6',51:'V47.7',52:'V47.5',53:'V47.6',54:'V47.8',55:'V47.8',56:'V47.9',57:'V47.9',58:'V48',59:'V48.1',60:'V48.2',61:'V48.3',62:'V48.5',63:'V48.6',64:'V48.7',65:'V48.8',66:'V48.9',67:'V48.10',68:'V48.10',69:'V48.10',70:'Roadmap',71:'Roadmap',72:'Roadmap',73:'Roadmap',74:'Roadmap'};
function genericMeta(c){
 const [group,num,name,status]=c;
 const type=status==='live'?'Browser / server production capability':status==='wired'?'Connected workflow capability':status==='model'?'Model-backed intelligence layer':'Planned platform capability';
 const connected=group==='Platform'?'Projects · Accounts · Delivery · Intelligence':`${group} engine · AI Director · Quality Guard`;
 const purpose=detailMeta[name]?.[0] || `${name} is part of the ${group.toLowerCase()} layer and contributes to HotFoto’s end-to-end photographic production loop.`;
 const next=detailMeta[name]?.[4] || (status==='planned'?'Defined roadmap capability':'Deeper model integration, confidence and automation');
 const note=detailMeta[name]?.[5] || (status==='model'?'Requires a configured model/provider for full intelligence behavior.':status==='wired'?'Connected in the workflow architecture; exact model behavior depends on configuration.':'This capability is represented honestly according to its current implementation state.');
 return {purpose,connected,type,release:detailMeta[name]?.[3]||releaseByNum[Number(num)]||'V46',next,note};
}
function render(filter='all'){
 const grid=document.getElementById('capabilityGrid'); grid.innerHTML='';
 groups.forEach(group=>{
  const rows=capabilities.filter(c=>c[0]===group && (filter==='all'||c[3]===filter));
  if(!rows.length)return;
  const stage=document.createElement('article'); stage.className='os-stage';
  stage.innerHTML=`<div class="stage-head"><h3>${group}</h3><small>${rows.length} CAPABILITIES</small></div><div class="cap-list">${rows.map(c=>`<button class="cap" type="button" data-cap="${c[1]}" aria-label="Inspect ${c[2]}"><span class="cap-num">${c[1]}</span><div><b>${c[2]}</b><small>${stagePurpose[group]}</small></div><span class="state state-${c[3]}">${stateLabel[c[3]]}</span><span class="cap-open">VIEW ↗</span></button>`).join('')}</div>`;
  grid.appendChild(stage);
 });
 grid.querySelectorAll('.cap').forEach(btn=>btn.addEventListener('click',()=>openDetail(btn.dataset.cap)));
}
function openDetail(id){
 const c=capabilities.find(x=>x[1]===id); if(!c)return;
 const meta=genericMeta(c); const panel=document.getElementById('capabilityDetail');
 document.getElementById('detailKicker').textContent=`${c[0].toUpperCase()} · CAPABILITY ${c[1]}`;
 document.getElementById('detailTitle').textContent=c[2];
 const state=document.getElementById('detailState'); state.className=`state state-${c[3]}`; state.textContent=stateLabel[c[3]];
 document.getElementById('detailPurpose').textContent=meta.purpose;
 document.getElementById('detailConnected').textContent=meta.connected;
 document.getElementById('detailType').textContent=meta.type;
 document.getElementById('detailRelease').textContent=meta.release;
 document.getElementById('detailNext').textContent=meta.next;
 document.getElementById('detailNote').textContent=meta.note;
 panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); document.body.classList.add('detail-open');
}
function closeDetail(){const p=document.getElementById('capabilityDetail');p.classList.remove('open');p.setAttribute('aria-hidden','true');document.body.classList.remove('detail-open');}
function renderTimeline(){
 document.getElementById('timelineList').innerHTML=releases.map(r=>`<div class="timeline-item"><div class="timeline-card"><div class="timeline-top"><b>${r[0]} · ${r[1]}</b><span>MILESTONE</span></div><p>${r[2]}</p><div class="release-tags">${r.slice(3).map(x=>`<span>${x}</span>`).join('')}</div></div></div>`).join('');
}

const archMeta={
 ingest:['INGEST','Source photography enters safely with metadata, protection and preview generation.','Ingest · originals · metadata'],
 understand:['UNDERSTAND','Vision and context layers interpret scene, people, lighting, composition and story.','Vision · context · story'],
 cull:['CULL','Focus, expression, technical quality and keeper intelligence reduce the shoot to the strongest frames.','Cull engine · review queue'],
 create:['CREATE','Develop, retouch, Style DNA and generative tools shape the final photograph.','Develop · Retouch · Style DNA'],
 guard:['GUARD','Quality Guard checks artifacts, confidence and bounded corrections before delivery.','Quality Guard · review'],
 deliver:['DELIVER','Proofing, export, packaging and client delivery turn approved work into outputs.','Proofing · Export · Delivery'],
 director:['AI DIRECTOR','The orchestration layer translates photographic intent into bounded production decisions.','Planner · Style DNA · Quality Guard'],
 dna:['STYLE DNA','Photographer preferences and approved work inform consistent creative direction.','Project memory · feedback'],
 memory:['PROJECT MEMORY','Persistent project and photographer signals feed future production decisions.','Projects · Intelligence ledger'],
 vision:['VISION','Model-backed visual understanding provides scene, subject and photographic context when configured.','Vision model · analysis']
};
function setupArchitecture(){
 const root=document.querySelector('.os-architecture'); const readout=document.getElementById('archReadout'); if(!root||!readout)return;
 const core=document.getElementById('archCore');
 const show=(key)=>{const m=archMeta[key];if(!m)return; root.querySelectorAll('.arch-node').forEach(n=>n.classList.toggle('active',n.dataset.arch===key)); readout.innerHTML=`<span>${m[0]}</span><b>${m[1]}</b><p>${m[2]}</p>`;root.classList.add('arch-armed');};
 root.querySelectorAll('.arch-node').forEach(n=>{n.addEventListener('click',()=>show(n.dataset.arch));n.addEventListener('mouseenter',()=>show(n.dataset.arch));});
 core.addEventListener('click',()=>{root.querySelectorAll('.arch-node').forEach(n=>n.classList.remove('active'));readout.innerHTML='<span>HOTFOTO INTELLIGENCE CORE</span><b>One production loop.</b><p>Orchestrates the connected layers represented in this architecture map.</p>';});
 core.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();core.click();}});
}
function setup(){
 document.querySelectorAll('#filters button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('#filters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.filter)}));
 document.getElementById('jumpTimeline').addEventListener('click',()=>document.getElementById('timeline').scrollIntoView({behavior:'smooth'}));
 document.getElementById('detailClose').addEventListener('click',closeDetail);
 document.querySelector('[data-close-detail]').addEventListener('click',closeDetail);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail()});
 render(); renderTimeline(); setupArchitecture();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
