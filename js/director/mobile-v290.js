(()=>{
'use strict';
const $=id=>document.getElementById(id), $$=s=>Array.from(document.querySelectorAll(s));
const q=new URLSearchParams(location.search),game=q.get('game')||localStorage.getItem('switcherDirectorGame')||'partido1',code=q.get('code')||localStorage.getItem('switcherDirectorCode')||'',v='2900';
$('gameTitle').textContent=game.toUpperCase(); localStorage.setItem('switcherDirectorGame',game); if(code)localStorage.setItem('switcherDirectorCode',code);
const launch=`${location.origin}${location.pathname}?game=${encodeURIComponent(game)}&v=${v}&code=${encodeURIComponent(code)}`;localStorage.setItem('switcherDirectorLaunchUrl',launch);
setInterval(()=>{$('clockNow').textContent=new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})},1000);
let deferredInstall=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installDirector').hidden=false});$('installDirector').onclick=async()=>{if(deferredInstall){deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null}else alert('En Chrome usa ⋮ → Instalar aplicación / Agregar a pantalla principal.')};
function toast(t,err=false){const x=$('toast');x.textContent=t;x.className='show'+(err?' error':'');clearTimeout(x._t);x._t=setTimeout(()=>x.className='',2300)}
if(!code)toast('Falta el código privado en la URL',true);

/* Motor real de WebRTC / Replay. No contiene la interfaz móvil. */
const engine=$('engine');engine.src=`./index.html?game=${encodeURIComponent(game)}&v=${v}&code=${encodeURIComponent(code)}&desktop=1&embeddedMobile=1`;
let engineDoc=null,db=null,sw=null,sportRef=null,baseRef=null,sport='baseball',state={},sportState={},cards={},fadeMs=1000,clockState={};
engine.addEventListener('load',()=>{try{engineDoc=engine.contentDocument;mirror()}catch(e){console.warn(e)}});setInterval(mirror,250);
function mirror(){if(!engineDoc)return;for(const [s,d] of [['programMonitor','mProgram'],['previewMonitor','mPreview'],['video-cam1','mCam1'],['video-cam2','mCam2'],['video-cam3','mCam3']]){const a=engineDoc.getElementById(s),b=$(d);if(a&&b&&b.srcObject!==a.srcObject)b.srcObject=a.srcObject||null}for(const c of ['cam1','cam2','cam3'])$('s'+c[0].toUpperCase()+c.slice(1)).textContent=engineDoc.getElementById(`state-${c}`)?.textContent||'offline'}

async function tx(ref,delta,min,max){try{const r=await ref.transaction(x=>Math.max(min,Math.min(max,(Number(x)||0)+delta)));if(!r.committed)throw Error('No confirmada');return true}catch(e){console.error(e);toast('Firebase rechazó el cambio',true);return false}}
async function setv(ref,val,msg){try{await ref.set(val);if(msg)toast(msg);return true}catch(e){console.error(e);toast('Firebase rechazó el cambio',true);return false}}
function init(){try{db=Switcher.initFirebase();if(!db)throw Error('Firebase no disponible');sw=db.ref(`switcher/${game}`);sportRef=sw.child('sport');baseRef=sw.child('baseballState');$('firebaseState').textContent='FIREBASE ●';$('firebaseState').style.color='#2ee48c';
 sw.child('transitionSettings/fadeMs').on('value',s=>{fadeMs=Math.max(200,Math.min(5000,Number(s.val())||1000));$('fadeValue').textContent=(fadeMs/1000).toFixed(1)+'s'});
 sw.child('broadcast/replayTransition').on('value',s=>{const x=s.val()||{};$('stingerImg').src=x.url||`../assets/replay/${x.sport||'baseball'}.svg`});
 sw.child('program').on('value',s=>{const c=s.val()||'cam1';$('programName').textContent=c.toUpperCase();$$('[data-cam]').forEach(b=>b.classList.toggle('active',b.dataset.cam===c))});
 sw.child('preview').on('value',s=>$('previewName').textContent=(s.val()||'cam2').toUpperCase());
 sw.child('black').on('value',s=>$('black').classList.toggle('active',!!s.val()));
 sportRef.on('value',s=>{sportState=s.val()||{};const raw=String(sportState.current||'baseball').trim().toLowerCase();sport=({baseball:'baseball',beisbol:'baseball','béisbol':'baseball',soccer:'soccer',futbol:'soccer','fútbol':'soccer',basketball:'basketball',basquetbol:'basketball','básquetbol':'basketball',volleyball:'volleyball',voleibol:'volleyball',football:'football'}[raw]||'baseball');cards=sportState.cards||{};clockState=sportState.clockControl||{};render()});
 baseRef.on('value',s=>{state=s.val()||{};render()});
 bind();toast('Director V29.0 listo');
}catch(e){console.error(e);$('firebaseState').textContent='FIREBASE ERROR';$('firebaseState').style.color='#ff5f74';toast(e.message,true)}}
function bind(){
 $$('[data-cam]').forEach(b=>b.onclick=()=>setv(sw.child('preview'),b.dataset.cam));$$('[data-source]').forEach(b=>b.onclick=()=>setv(sw.child('preview'),b.dataset.source));
 $$('[data-score]').forEach(b=>b.onclick=()=>{const side=b.dataset.score,d=Number(b.dataset.delta);return sport==='baseball'?tx(baseRef.child(`${side}/score`),d,0,999):tx(sportRef.child(`score/${side==='home'?'homeScore':'awayScore'}`),d,0,999)});
 $$('[data-count]').forEach(b=>b.onclick=()=>tx(baseRef.child(b.dataset.count),Number(b.dataset.delta),0,b.dataset.count==='balls'?3:2));
 $$('[data-base]').forEach(b=>b.onclick=()=>baseRef.child(`bases/${b.dataset.base}`).transaction(x=>!x).catch(e=>{console.error(e);toast('No se pudo actualizar la base',true)}));
 $('clearBases').onclick=()=>setv(baseRef.child('bases'),{first:false,second:false,third:false},'Bases limpias');
 $$('[data-card]').forEach(b=>b.onclick=()=>tx(sportRef.child(`cards/${b.dataset.card}`),1,0,9));
 $('periodMinus').onclick=()=>sport==='baseball'?tx(baseRef.child('inning'),-1,1,99):tx(sportRef.child('score/period'),-1,1,99);$('periodPlus').onclick=()=>sport==='baseball'?tx(baseRef.child('inning'),1,1,99):tx(sportRef.child('score/period'),1,1,99);
 $('clockStart').onclick=()=>engineDoc?.getElementById('sportClockStart')?.click();$('clockPause').onclick=()=>engineDoc?.getElementById('sportClockPause')?.click();
 $('fadeMinus').onclick=()=>setv(sw.child('transitionSettings/fadeMs'),Math.max(200,fadeMs-100));$('fadePlus').onclick=()=>setv(sw.child('transitionSettings/fadeMs'),Math.min(5000,fadeMs+100));
 $('cut').onclick=()=>take('cut');$('auto').onclick=()=>take('auto');$('fade').onclick=()=>take('fade');$('black').onclick=()=>sw.child('black').transaction(x=>!x);
 $('testStinger').onclick=()=>{const x=engineDoc?.getElementById('testReplayTransition');x?x.click():setv(sw.child('broadcast/replayCommand'),{id:Date.now()+'-test',action:'testTransition',at:Date.now()})};
 $$('[data-speed]').forEach(b=>b.onclick=()=>{$$('[data-speed]').forEach(x=>x.classList.remove('active'));b.classList.add('active');const x=engineDoc?.getElementById('replaySpeed');if(x){x.value=b.dataset.speed;x.dispatchEvent(new Event('change',{bubbles:true}))}});
 $$('[data-replay]').forEach(b=>b.onclick=()=>quickReplay(Number(b.dataset.replay)));$('replay').onclick=()=>quickReplay(10);
 $('fullControl').onclick=()=>openAdvanced('production');$$('[data-tab]').forEach(b=>b.onclick=()=>openAdvanced(b.dataset.tab));
}
async function take(type){const preview=(await sw.child('preview').once('value')).val()||'cam1';$('transitionName').textContent=type==='cut'?'CORTE':type.toUpperCase();if(type!=='cut')await setv(sw.child('transition'),{type,duration:fadeMs,at:Date.now()});await setv(sw.child('program'),preview);if(type!=='cut')setTimeout(()=>sw.child('transition').remove(),fadeMs+250)}
function quickReplay(sec){if(!engineDoc){toast('Replay aún cargando',true);return}const arm=engineDoc.getElementById('replayArm');if(arm&&!/DESACTIVAR/i.test(arm.textContent||''))arm.click();const len=Math.max(sec,Number(engineDoc.getElementById('replayBufferLength')?.textContent)||30),a=engineDoc.getElementById('replayStartNumber')||engineDoc.getElementById('replayStart'),z=engineDoc.getElementById('replayEndNumber')||engineDoc.getElementById('replayEnd');if(a){a.value=Math.max(0,len-sec);a.dispatchEvent(new Event('input',{bubbles:true}))}if(z){z.value=len;z.dispatchEvent(new Event('input',{bubbles:true}))}engineDoc.getElementById('replayPreview')?.click()}
function openAdvanced(tab){const u=`./index.html?game=${encodeURIComponent(game)}&v=${v}&code=${encodeURIComponent(code)}&desktop=1&mobileModule=1&panel=${encodeURIComponent(tab)}&returnMobile=1`;location.href=u}
function calcClock(){let s=Number(clockState.baseSeconds)||0;if(clockState.running&&clockState.startedAt){const e=(Date.now()-Number(clockState.startedAt))/1000;s=clockState.mode==='countdown'?s-e:s+e}s=Math.max(0,Math.floor(s));return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
function logo(el,url){el.src=url||'';el.style.visibility=url?'visible':'hidden'}
function render(){const baseball=sport==='baseball',cfg=sportState.config||{},sc=sportState.score||{},s=state||{},a=s.away||{},h=s.home||{},bs=s.bases||{};if(baseball){$('awayName').textContent=a.name||cfg.awayName||'VISITANTE';$('homeName').textContent=h.name||cfg.homeName||'LOCAL';$('awayScore').textContent=a.score??0;$('homeScore').textContent=h.score??0;logo($('awayLogo'),a.logo||cfg.awayLogo);logo($('homeLogo'),h.logo||cfg.homeLogo);$('periodValue').textContent=s.inning||1;$('balls').textContent=s.balls||0;$('strikes').textContent=s.strikes||0;$('outs').textContent=s.outs||0;$$('[data-base]').forEach(x=>x.classList.toggle('active',!!bs[x.dataset.base]))}else{$('awayName').textContent=cfg.awayName||'VISITANTE';$('homeName').textContent=cfg.homeName||'LOCAL';$('awayScore').textContent=sc.awayScore||0;$('homeScore').textContent=sc.homeScore||0;logo($('awayLogo'),cfg.awayLogo);logo($('homeLogo'),cfg.homeLogo);$('periodValue').textContent=sc.period||1}for(const [k,id] of Object.entries({awayYellowCards:'awayYellow',awayRedCards:'awayRed',homeYellowCards:'homeYellow',homeRedCards:'homeRed'}))$(id).textContent=cards[k]||0;document.querySelectorAll('.baseball-only').forEach(el=>el.hidden=!baseball)}
setInterval(()=>{$('gameClock').textContent=calcClock()},250);init();
})();
