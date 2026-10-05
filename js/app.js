const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const openModal=id=>{$(id)?.classList.add('open');document.body.style.overflow='hidden'};
const closeModals=()=>{$$('.modal').forEach(m=>m.classList.remove('open'));document.body.style.overflow=''};
$$('[data-open]').forEach(b=>b.addEventListener('click',()=>openModal(b.dataset.open==='studio'?'#studioModal':'#loginModal')));
$$('.modal-close,.modal-backdrop').forEach(b=>b.addEventListener('click',closeModals));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});
$('#menuBtn')?.addEventListener('click',()=>{const n=document.querySelector('nav');n.style.display=n.style.display==='flex'?'none':'flex'});
const browse=$('#browseBtn'),file=$('#fileInput'),drop=$('#dropzone'),demo=$('.demo-image');
function showDemo(){if(!drop||!demo)return;drop.style.display='none';demo.classList.add('show')}
browse?.addEventListener('click',()=>file?.click());file?.addEventListener('change',()=>{if(file.files.length)showDemo()});
['dragover','dragenter'].forEach(e=>drop?.addEventListener(e,x=>{x.preventDefault();drop.style.borderColor='#171817'}));
drop?.addEventListener('drop',e=>{e.preventDefault();if(e.dataTransfer.files.length)showDemo()});
$('#enhanceBtn')?.addEventListener('click',e=>{e.currentTarget.textContent='✦ Analysing…';e.currentTarget.disabled=true;setTimeout(()=>{$('#result').classList.add('show');e.currentTarget.textContent='✓ 7 improvements applied'},1100)});
$$('.side-link').forEach(b=>b.addEventListener('click',()=>{$$('.side-link').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
$$('.billing button').forEach(b=>b.addEventListener('click',()=>{$$('.billing button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const annual=b.textContent.includes('Annual');document.querySelectorAll('.price-grid h3').forEach((el,i)=>{const vals=annual?['$9','$22','$44']:['$12','$29','$59'];el.childNodes[0].nodeValue=vals[i]})}));
$$('.director-demo button,.prompt-box button').forEach(b=>b.addEventListener('click',()=>{const old=b.textContent;b.textContent='✓ AI plan applied';setTimeout(()=>b.textContent=old,1400)}));
$$('.slider-demo').forEach(s=>s.addEventListener('click',e=>{const r=s.getBoundingClientRect();const pct=Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100));const bar=s.querySelector('i');if(bar)bar.style.width=pct+'%'}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='translateY(0)';io.unobserve(e.target)}}),{threshold:.08});
$$('.feature,.module-grid>div,.price-grid article,.step,.trust-strip>div').forEach((el,i)=>{el.style.opacity=0;el.style.transform='translateY(18px)';el.style.transition=`opacity .55s ${Math.min(i*.03,.3)}s,transform .55s ${Math.min(i*.03,.3)}s`;io.observe(el)});
// Lightweight fake AI status for prototype realism
setInterval(()=>{$$('.ai-dot').forEach(d=>d.style.boxShadow='0 0 0 5px rgba(217,255,88,.08),0 0 14px rgba(217,255,88,.5)')},1800);


// Cinematic before/after interaction
const ba=document.querySelector('.before-after');
const stage=document.querySelector('.ba-stage');
if(ba&&stage){
  const move=(e)=>{const r=stage.getBoundingClientRect();const x=Math.max(8,Math.min(92,((e.clientX-r.left)/r.width)*100));stage.querySelector('.ba-after').style.width=x+'%';stage.querySelector('.ba-divider').style.left=x+'%'};
  stage.addEventListener('pointermove',move);
  stage.addEventListener('touchmove',e=>{const t=e.touches[0]; if(t) move({clientX:t.clientX})},{passive:true});
}

// subtle cursor glow for the cinematic hero
const hero=document.querySelector('.hero');
if(hero){hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');hero.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%')});}
