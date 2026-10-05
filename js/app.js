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
['dragover','dragenter'].forEach(e=>drop?.addEventListener(e,x=>{x.preventDefault();drop.style.borderColor='var(--neon-cyan)'}));
drop?.addEventListener('drop',e=>{e.preventDefault();if(e.dataTransfer.files.length)showDemo()});
$('#enhanceBtn')?.addEventListener('click',e=>{e.currentTarget.textContent='✦ Analysing…';e.currentTarget.disabled=true;setTimeout(()=>{$('#result').classList.add('show');e.currentTarget.textContent='✓ 7 improvements applied'},1100)});
$$('.side-link').forEach(b=>b.addEventListener('click',()=>{$$('.side-link').forEach(x=>x.classList.remove('active'));b.classList.add('active')}));
$$('.billing button').forEach(b=>b.addEventListener('click',()=>{$$('.billing button').forEach(x=>x.classList.remove('active'));b.classList.add('active');const annual=b.textContent.includes('Annual');document.querySelectorAll('.price-grid h3').forEach((el,i)=>{const vals=annual?['$9','$22','$44']:['$12','$29','$59'];el.childNodes[0].nodeValue=vals[i]})}));
$$('.director-demo button,.prompt-box button').forEach(b=>b.addEventListener('click',()=>{const old=b.textContent;b.textContent='✓ AI plan applied';setTimeout(()=>b.textContent=old,1400)}));
$$('.slider-demo').forEach(s=>s.addEventListener('click',e=>{const r=s.getBoundingClientRect();const pct=Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100));const bar=s.querySelector('i');if(bar)bar.style.width=pct+'%'}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='translateY(0)';io.unobserve(e.target)}}),{threshold:.08});
$$('.feature,.module-grid>div,.price-grid article,.step,.trust-strip>div').forEach((el,i)=>{el.style.opacity=0;el.style.transform='translateY(18px)';el.style.transition=`opacity .55s ${Math.min(i*.03,.3)}s,transform .55s ${Math.min(i*.03,.3)}s`;io.observe(el)});
// Lightweight fake AI status for prototype realism
setInterval(()=>{$$('.ai-dot').forEach(d=>d.style.boxShadow='0 0 0 5px rgba(0,229,255,.10),0 0 14px rgba(0,229,255,.55)')},1800);


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

// Keep the cursor atmosphere alive across the page, while remaining disabled on touch devices.
document.addEventListener('pointermove',e=>{
  if(window.matchMedia('(pointer:coarse)').matches)return;
  document.documentElement.style.setProperty('--mx',`${e.clientX/window.innerWidth*100}%`);
  document.documentElement.style.setProperty('--my',`${e.clientY/window.innerHeight*100}%`);
});

// Give showcase cards a subtle depth response without a heavy 3D effect.
document.querySelectorAll('.showcase-card,.feature,.module-grid>div').forEach(card=>{
  card.addEventListener('pointermove',e=>{
    if(window.matchMedia('(pointer:coarse)').matches)return;
    const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    card.style.transform=`perspective(900px) rotateX(${(-y*2.5).toFixed(2)}deg) rotateY(${(x*2.5).toFixed(2)}deg) translateY(-5px)`;
  });
  card.addEventListener('pointerleave',()=>{card.style.transform='';});
});

// FADL SIGNATURE MOTION — suspended gallery depth + scroll choreography
(function(){
  const depthItems=document.querySelectorAll('[data-depth]');
  if(!depthItems.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking=false;
  const updateDepth=()=>{
    const y=window.scrollY;
    depthItems.forEach(el=>{
      const factor=parseFloat(el.dataset.depth||0);
      const rect=el.getBoundingClientRect();
      const offset=((window.innerHeight*.5)- (rect.top+rect.height*.5))*factor*.045;
      el.style.setProperty('--depth-y',`${offset.toFixed(2)}px`);
    });
    ticking=false;
  };
  window.addEventListener('scroll',()=>{if(!ticking){requestAnimationFrame(updateDepth);ticking=true}},{passive:true});
  updateDepth();

  // Cursor gravity: suspended objects subtly lean toward the pointer, like real hanging prints.
  document.addEventListener('pointermove',e=>{
    if(window.matchMedia('(pointer:coarse)').matches) return;
    document.querySelectorAll('.hanging-object').forEach((el,i)=>{
      const r=el.getBoundingClientRect();
      if(r.width===0) return;
      const dx=(e.clientX-(r.left+r.width/2))/window.innerWidth;
      const dy=(e.clientY-(r.top+r.height/2))/window.innerHeight;
      const lean=Math.max(-3,Math.min(3,dx*7));
      el.style.setProperty('--cursor-lean',`${lean.toFixed(2)}deg`);
      el.style.setProperty('--cursor-y',`${(dy*3).toFixed(2)}px`);
      el.style.rotate=`calc(var(--cursor-lean,0deg) + var(--tilt,0deg))`;
    });
  },{passive:true});
})();
