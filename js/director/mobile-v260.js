(()=>{
'use strict';
const $=id=>document.getElementById(id), $$=s=>[...document.querySelectorAll(s)];
const qs=new URLSearchParams(location.search);
const game=(qs.get('game')||localStorage.getItem('directorGame')||'partido1').replace(/[^a-zA-Z0-9_-]/g,'-');
const code=qs.get('code')||localStorage.getItem('directorCode')||'';
const v='2600';
localStorage.setItem('directorGame',game); if(code)localStorage.setItem('directorCode',code);
$('gameTitle').textContent=game.toUpperCase();
const tickNow=()=>{$('clockNow').textContent=new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})};tickNow();setInterval(tickNow,1000);
let toastTimer=0;function toast(msg,error=false){const t=$('toast');t.textContent=msg;t.className=error?'show error':'show';clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.className='',1800)}

/* PWA */
let installPrompt=null;const ib=$('installDirector');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;ib.hidden=false});
ib.onclick=async()=>{if(!installPrompt){toast('Chrome: menú ⋮ → Instalar aplicación');return}try{installPrompt.prompt();await installPrompt.userChoice;installPrompt=null}catch(e){toast(e.message,true)}};
if(matchMedia('(display-mode: standalone)').matches||navigator.standalone)ib.hidden=true;

/* Motor de escritorio oculto: únicamente video/WebRTC y acciones avanzadas */
const engine=$('engine'); engine.src=`./index.html?game=${encodeURIComponent(game)}&v=${v}&code=${encodeURIComponent(code)}&embeddedMobile=1&desktop=1`;
let engineDoc=null,db=null,sport='baseball',legacy={},fallback={},sportState={},cards={},fadeMs=1000,clockState={};
engine.addEventListener('load',()=>{try{engineDoc=engine.contentDocument;mirror();}catch(e){console.warn(e)}});
setInterval(mirror,300);
function mirror(){if(!engineDoc)return;for(const [sId,dId] of [['programMonitor','mProgram'],['previewMonitor','mPreview'],['video-cam1','mCam1'],['video-cam2','mCam2'],['video-cam3','mCam3']]){const s=engineDoc.getElementById(sId),d=$(dId);if(s&&d&&d.srcObject!==s.srcObject)d.srcObject=s.srcObject||null}const p=engineDoc.getElementById('programName')?.textContent||'CAM1',r=engineDoc.getElementById('previewName')?.textContent||'CAM2';$('programName').textContent=p;$('previewName').textContent=r;for(const c of ['cam1','cam2','cam3']){const id='s'+c[0].toUpperCase()+c.slice(1);$(id).textContent=engineDoc.getElementById(`state-${c}`)?.textContent||'offline'}}

function init(){
 try{
  if(!window.firebase||!window.Switcher)throw new Error('Firebase/Switcher no disponible');
  db=Switcher.initFirebase(); if(!db)throw new Error('No fue posible abrir Firebase');
  const sw=db.ref(`switcher/${game}`), sportRef=sw.child('sport'), legacyRef=db.ref('gameState'), fallbackRef=sw.child('baseballState');
  $('firebaseState').textContent='FIREBASE ●';$('firebaseState').style.color='#2ee48c';
  const tx=async(ref,delta,min,max)=>{let err=null;try{const r=await ref.transaction(x=>Math.max(min,Math.min(max,(Number(x)||0)+delta)));if(!r.committed)throw new Error('Transacción no confirmada');return true}catch(e){err=e;console.warn(e);return false}};
  const setSafe=async(ref,val)=>{try{await ref.set(val);return true}catch(e){console.warn(e);return false}};
  async function baseballNumber(field,delta,min,max){
    const ok=await tx(legacyRef.child(field),delta,min,max);
    if(ok){toast(`${field.toUpperCase()} actualizado`);return}
    const ok2=await tx(fallbackRef.child(field),delta,min,max);
    if(ok2){toast(`${field.toUpperCase()} actualizado (modo compatible)`);return}
    toast(`No se pudo actualizar ${field}. Revisa reglas Firebase.`,true);
  }
  async function baseballBase(name){
    try{const r=await legacyRef.child(`bases/${name}`).transaction(x=>!x);if(r.committed){toast('Base actualizada');return}}catch(e){console.warn(e)}
    try{const r=await fallbackRef.child(`bases/${name}`).transaction(x=>!x);if(r.committed){toast('Base actualizada (modo compatible)');return}}catch(e){console.warn(e)}
    toast('No se pudo actualizar la base',true);
  }
  async function clearBases(){
    const val={first:false,second:false,third:false};
    if(await setSafe(legacyRef.child('bases'),val)){toast('Bases limpias');return}
    if(await setSafe(fallbackRef.child('bases'),val)){toast('Bases limpias (modo compatible)');return}
    toast('No se pudieron limpiar las bases',true);
  }

  sw.child('transitionSettings/fadeMs').on('value',s=>{fadeMs=Math.max(200,Math.min(5000,Number(s.val())||1000));$('fadeValue').textContent=(fadeMs/1000).toFixed(1)+'s'});
  sw.child('broadcast/replayTransition').on('value',s=>{const x=s.val()||{};$('stingerImg').src=x.url||`../assets/replay/${x.sport||'baseball'}.svg`});
  sw.child('program').on('value',s=>{$$('[data-cam]').forEach(b=>b.classList.toggle('active',b.dataset.cam===(s.val()||'cam1')))});
  sw.child('black').on('value',s=>$('black').classList.toggle('active',!!s.val()));
  sportRef.on('value',s=>{sportState=s.val()||{};sport=sportState.current||'baseball';cards=sportState.cards||{};clockState=sportState.clockControl||{};render()});
  legacyRef.on('value',s=>{legacy=s.val()||{};render()}); fallbackRef.on('value',s=>{fallback=s.val()||{};render()});

  $$('[data-cam]').forEach(b=>b.onclick=()=>sw.child('preview').set(b.dataset.cam).catch(e=>toast(e.message,true)));
  $$('[data-source]').forEach(b=>b.onclick=()=>sw.child('preview').set(b.dataset.source).catch(e=>toast(e.message,true)));
  $$('[data-score]').forEach(b=>b.onclick=async()=>{const side=b.dataset.score,d=Number(b.dataset.delta);if(sport==='baseball'){const ok=await tx(legacyRef.child(`${side}/score`),d,0,999);if(!ok)await tx(fallbackRef.child(`${side}/score`),d,0,999)}else await tx(sportRef.child(`score/${side==='home'?'homeScore':'awayScore'}`),d,0,999)});
  $$('[data-count]').forEach(b=>b.onclick=()=>baseballNumber(b.dataset.count,Number(b.dataset.delta),0,b.dataset.count==='balls'?3:2));
  $$('[data-base]').forEach(b=>b.onclick=()=>baseballBase(b.dataset.base)); $('clearBases').onclick=clearBases;
  $$('[data-card]').forEach(b=>b.onclick=async()=>{const key=b.dataset.card;const ok=await tx(sportRef.child(`cards/${key}`),1,0,9);toast(ok?'Tarjeta actualizada':'No se pudo actualizar tarjeta',!ok)});
  $('periodMinus').onclick=()=>sport==='baseball'?baseballNumber('inning',-1,1,99):tx(sportRef.child('score/period'),-1,1,99); $('periodPlus').onclick=()=>sport==='baseball'?baseballNumber('inning',1,1,99):tx(sportRef.child('score/period'),1,1,99);
  $('clockStart').onclick=()=>{const x=engineDoc?.getElementById('sportClockStart');x?x.click():toast('Abre PRODUCCIÓN para configurar el reloj',true)}; $('clockPause').onclick=()=>engineDoc?.getElementById('sportClockPause')?.click();
  $('fadeMinus').onclick=()=>sw.child('transitionSettings/fadeMs').set(Math.max(200,fadeMs-100)); $('fadePlus').onclick=()=>sw.child('transitionSettings/fadeMs').set(Math.min(5000,fadeMs+100));
  async function take(type){const p=(engineDoc?.getElementById('previewName')?.textContent||'').toLowerCase().match(/cam[123]/)?.[0];if(!p){toast('Selecciona una cámara en PREVIEW',true);return}$('transitionName').textContent=type==='cut'?'CORTE':type.toUpperCase();if(type!=='cut')await sw.child('transition').set({type,duration:fadeMs,at:Date.now()});await sw.child('program').set(p);if(type!=='cut')setTimeout(()=>sw.child('transition').remove(),fadeMs+250)}
  $('cut').onclick=()=>take('cut');$('auto').onclick=()=>take('auto');$('fade').onclick=()=>take('fade');$('black').onclick=()=>sw.child('black').transaction(x=>!x);
  $('testStinger').onclick=()=>{const x=engineDoc?.getElementById('testReplayTransition');if(x)x.click();else sw.child('broadcast/replayCommand').set({id:Date.now()+'-test',action:'testTransition',at:Date.now()})};
  $$('[data-speed]').forEach(b=>b.onclick=()=>{$$('[data-speed]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const x=engineDoc?.getElementById('replaySpeed');if(x)x.value=b.dataset.speed});
  $$('[data-replay]').forEach(b=>b.onclick=()=>{const sec=Number(b.dataset.replay),a=engineDoc?.getElementById('replayStart'),z=engineDoc?.getElementById('replayEnd'),len=Number(engineDoc?.getElementById('replayBufferLength')?.textContent)||30;if(a)a.value=Math.max(0,len-sec);if(z)z.value=len;engineDoc?.getElementById('replayPreview')?.click()});
  $('replay').onclick=()=>engineDoc?.getElementById('replayPreview')?.click();
  setInterval(()=>{$('gameClock').textContent=calcClock()},250);
  toast('Director V26 listo');
 }catch(e){$('firebaseState').textContent='FIREBASE ERROR';$('firebaseState').style.color='#ff5f74';toast(e.message,true);console.error(e)}
}

function mergedBaseball(){const l=legacy||{},f=fallback||{};return {
 ...l,...f,
 away:{...(l.away||{}),...(f.away||{})},home:{...(l.home||{}),...(f.home||{})},
 bases:{...(l.bases||{}),...(f.bases||{})}
}}
function calcClock(){let s=Number(clockState.baseSeconds)||0;if(clockState.running&&clockState.startedAt){const e=(Date.now()-clockState.startedAt)/1000;s=clockState.mode==='countdown'?s-e:s+e}s=Math.max(0,Math.floor(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function logo(el,url){el.src=url||'';el.style.visibility=url?'visible':'hidden'}
function render(){const baseball=sport==='baseball',cfg=sportState.config||{},sc=sportState.score||{},bs=mergedBaseball();if(baseball){const a=bs.away||{},h=bs.home||{};$('awayName').textContent=a.name||'VISITANTE';$('homeName').textContent=h.name||'LOCAL';$('awayScore').textContent=a.score??0;$('homeScore').textContent=h.score??0;logo($('awayLogo'),a.logo||cfg.awayLogo);logo($('homeLogo'),h.logo||cfg.homeLogo);$('periodValue').textContent=bs.inning||1;$('balls').textContent=bs.balls||0;$('strikes').textContent=bs.strikes||0;$('outs').textContent=bs.outs||0;const b=bs.bases||{};$$('[data-base]').forEach(x=>x.classList.toggle('active',!!b[x.dataset.base]))}else{$('awayName').textContent=cfg.awayName||'VISITANTE';$('homeName').textContent=cfg.homeName||'LOCAL';$('awayScore').textContent=sc.awayScore||0;$('homeScore').textContent=sc.homeScore||0;logo($('awayLogo'),cfg.awayLogo);logo($('homeLogo'),cfg.homeLogo);$('periodValue').textContent=sc.period||1}for(const [k,id] of Object.entries({awayYellowCards:'awayYellow',awayRedCards:'awayRed',homeYellowCards:'homeYellow',homeRedCards:'homeRed'}))$(id).textContent=cards[k]||0;document.querySelector('.counts').style.visibility=baseball?'visible':'hidden';document.querySelector('.bases-wrap').style.visibility=baseball?'visible':'hidden'}

/* Módulos avanzados dentro de la misma app */
const panel=$('advancedPanel'),frame=$('advancedFrame');
function openAdvanced(tab){$('advancedTitle').textContent=(tab||'production').toUpperCase();panel.classList.add('open');panel.setAttribute('aria-hidden','false');frame.src=`./index.html?game=${encodeURIComponent(game)}&v=${v}&code=${encodeURIComponent(code)}&desktop=1&embeddedMobile=1&panel=${encodeURIComponent(tab||'production')}`}
function closeAdvanced(){panel.classList.remove('open');panel.setAttribute('aria-hidden','true');frame.src='about:blank'}
$('closeAdvanced').onclick=closeAdvanced;$('fullControl').onclick=()=>openAdvanced('production');$$('[data-tab]').forEach(b=>b.onclick=()=>openAdvanced(b.dataset.tab));

init();
})();
