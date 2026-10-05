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
