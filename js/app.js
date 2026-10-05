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

// FADL VISUAL ENGINE — theme system
const themePanel=document.querySelector('#themePanel');
const themeScrim=document.querySelector('#themeScrim');
const themeTrigger=document.querySelector('#themeTrigger');
const themeClose=document.querySelector('#themeClose');
const heroThemeBtn=document.querySelector('#heroThemeBtn');
const themeButtons=document.querySelectorAll('.theme-option,[data-theme]:not(.theme-option)');
const accentPicker=document.querySelector('#accentPicker');
const glowRange=document.querySelector('#glowRange');
const motionRange=document.querySelector('#motionRange');
const themeNames={obsidian:'Obsidian Studio',aurora:'Aurora',editorial:'Editorial',neon:'Neon Creative',pure:'Pure Light'};
const themeAccents={obsidian:'#d9ff58',aurora:'#57e7ff',editorial:'#c98a4c',neon:'#ff4dc7',pure:'#5367e8'};
function setTheme(theme,persist=true){
  document.body.dataset.theme=theme;
  document.documentElement.style.setProperty('--theme-name',`'${themeNames[theme]}'`);
  if(themeAccents[theme] && accentPicker){accentPicker.value=themeAccents[theme]; document.documentElement.style.setProperty('--accent',themeAccents[theme]);}
  document.querySelectorAll('.theme-option').forEach(b=>{const active=b.dataset.theme===theme;b.classList.toggle('active',active);b.setAttribute('aria-checked',String(active))});
  document.querySelectorAll('.palette-swatches [data-theme]').forEach(b=>b.classList.toggle('active',b.dataset.theme===theme));
  const chip=document.querySelector('.hero-theme-chip b');if(chip)chip.textContent=themeNames[theme].toUpperCase();
  if(persist)localStorage.setItem('fadl-theme',theme);
}
function openThemes(){themePanel?.classList.add('open');themeScrim?.classList.add('open');themePanel?.setAttribute('aria-hidden','false')}
function closeThemes(){themePanel?.classList.remove('open');themeScrim?.classList.remove('open');themePanel?.setAttribute('aria-hidden','true')}
themeTrigger?.addEventListener('click',openThemes);themeClose?.addEventListener('click',closeThemes);themeScrim?.addEventListener('click',closeThemes);heroThemeBtn?.addEventListener('click',openThemes);
themeButtons.forEach(b=>b.addEventListener('click',()=>{setTheme(b.dataset.theme);if(b.classList.contains('theme-option')===false)closeThemes()}));
accentPicker?.addEventListener('input',e=>{const hex=e.target.value;document.documentElement.style.setProperty('--accent',hex);const n=hex.replace('#','');const r=parseInt(n.slice(0,2),16),g=parseInt(n.slice(2,4),16),bl=parseInt(n.slice(4,6),16);document.documentElement.style.setProperty('--accent-rgb',`${r},${g},${bl}`);localStorage.setItem('fadl-accent',hex)});
glowRange?.addEventListener('input',e=>{document.documentElement.style.setProperty('--glow-strength',(e.target.value/100).toFixed(2));localStorage.setItem('fadl-glow',e.target.value)});
motionRange?.addEventListener('input',e=>{document.documentElement.style.setProperty('--motion-scale',(e.target.value/70).toFixed(2));localStorage.setItem('fadl-motion',e.target.value)});
const savedTheme=localStorage.getItem('fadl-theme')||'obsidian';setTheme(savedTheme,false);
const savedAccent=localStorage.getItem('fadl-accent');if(savedAccent&&accentPicker){accentPicker.value=savedAccent;document.documentElement.style.setProperty('--accent',savedAccent);const n=savedAccent.slice(1);document.documentElement.style.setProperty('--accent-rgb',`${parseInt(n.slice(0,2),16)},${parseInt(n.slice(2,4),16)},${parseInt(n.slice(4,6),16)}`)}
if(glowRange&&localStorage.getItem('fadl-glow')){glowRange.value=localStorage.getItem('fadl-glow');document.documentElement.style.setProperty('--glow-strength',(glowRange.value/100).toFixed(2))}
if(motionRange&&localStorage.getItem('fadl-motion')){motionRange.value=localStorage.getItem('fadl-motion');document.documentElement.style.setProperty('--motion-scale',(motionRange.value/70).toFixed(2))}
