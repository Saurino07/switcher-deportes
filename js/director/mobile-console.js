(()=>{"use strict";
const $=id=>document.getElementById(id);
const isMobile=()=>matchMedia('(max-width: 900px) and (orientation: landscape)').matches || (navigator.maxTouchPoints>0 && Math.min(screen.width,screen.height)<900);
if(!isMobile()||!window.firebase||!window.Switcher)return;
document.documentElement.classList.add('director-mobile-console');
document.body.classList.add('director-mobile-console');
const game=Switcher.normalizeId(Switcher.qs('game',Switcher.app.defaultGame));
const db=Switcher.initFirebase();
const sportRef=db.ref(`switcher/${game}/sport`);
const baseballRef=db.ref('gameState');
let sport='baseball', sportState={}, baseballState={};
const clamp=(n,a=0,b=999)=>Math.max(a,Math.min(b,Number(n)||0));
const cockpit=document.createElement('section');cockpit.className='mobile-score-console panel';cockpit.id='mobileScoreConsole';
cockpit.innerHTML=`
 <div class="msc-head"><b>CONTROL RÁPIDO</b><span class="badge good" id="mscSport">BÉISBOL</span></div>
 <div class="msc-grid">
  <div class="msc-team"><small id="mscAwayName">VISITANTE</small><div class="msc-score"><button data-score="away" data-delta="-1">−</button><strong id="mscAwayScore">0</strong><button data-score="away" data-delta="1">+</button></div></div>
  <div class="msc-center"><label>Periodo / entrada<input id="mscPeriod" value="1"></label><div class="msc-clock"><button id="mscClockStart">▶</button><button id="mscClockPause">Ⅱ</button><span id="mscClock">00:00</span></div></div>
  <div class="msc-team"><small id="mscHomeName">LOCAL</small><div class="msc-score"><button data-score="home" data-delta="-1">−</button><strong id="mscHomeScore">0</strong><button data-score="home" data-delta="1">+</button></div></div>
 </div>
 <div class="msc-baseball" id="mscBaseball">
  <button data-count="balls" data-delta="-1">B−</button><b>B <span id="mscBalls">0</span></b><button data-count="balls" data-delta="1">B+</button>
  <button data-count="strikes" data-delta="-1">S−</button><b>S <span id="mscStrikes">0</span></b><button data-count="strikes" data-delta="1">S+</button>
  <button data-count="outs" data-delta="-1">O−</button><b>O <span id="mscOuts">0</span></b><button data-count="outs" data-delta="1">O+</button>
  <button id="mscControl">CONTROL COMPLETO</button>
 </div>`;
const cameraGrid=$('cameraGrid');cameraGrid?.insertAdjacentElement('afterend',cockpit);
const sportNames={baseball:'BÉISBOL',soccer:'FÚTBOL',basketball:'BÁSQUETBOL',volleyball:'VOLEIBOL',football:'FÚTBOL AMERICANO'};
function render(){
 $('mscSport').textContent=sportNames[sport]||sport.toUpperCase();
 $('mscBaseball').hidden=sport!=='baseball';
 if(sport==='baseball'){
  const a=baseballState.away||{},h=baseballState.home||{};
  $('mscAwayName').textContent=a.name||'VISITANTE';$('mscHomeName').textContent=h.name||'LOCAL';
  $('mscAwayScore').textContent=a.score??0;$('mscHomeScore').textContent=h.score??0;
  $('mscPeriod').value=`${baseballState.inning||1} ${baseballState.inningSide||''}`.trim();
  $('mscBalls').textContent=baseballState.balls||0;$('mscStrikes').textContent=baseballState.strikes||0;$('mscOuts').textContent=baseballState.outs||0;
 } else {
  const c=sportState.config||{},s=sportState.score||{};
  $('mscAwayName').textContent=c.awayName||'VISITANTE';$('mscHomeName').textContent=c.homeName||'LOCAL';
  $('mscAwayScore').textContent=s.awayScore??0;$('mscHomeScore').textContent=s.homeScore??0;$('mscPeriod').value=s.period??'1';
  $('mscClock').textContent=s.clock||'00:00';
 }
}
sportRef.on('value',snap=>{sportState=snap.val()||{};sport=sportState.current||'baseball';render()});
baseballRef.on('value',snap=>{baseballState=snap.val()||{};render()});
cockpit.querySelectorAll('[data-score]').forEach(btn=>btn.onclick=async()=>{
 const side=btn.dataset.score,delta=+btn.dataset.delta;
 if(sport==='baseball'){
  const cur=clamp(baseballState?.[side]?.score);await baseballRef.child(`${side}/score`).set(clamp(cur+delta));
 }else{
  const key=side==='home'?'homeScore':'awayScore',cur=clamp(sportState?.score?.[key]);await sportRef.child(`score/${key}`).set(clamp(cur+delta));
 }
});
cockpit.querySelectorAll('[data-count]').forEach(btn=>btn.onclick=()=>{const key=btn.dataset.count,max=key==='balls'?3:key==='strikes'?2:2;return baseballRef.child(key).set(clamp((baseballState[key]||0)+(+btn.dataset.delta),0,max))});
$('mscPeriod').onchange=async()=>{
 const v=$('mscPeriod').value.trim();
 if(sport==='baseball'){
  const m=v.match(/(\d+)\s*(.*)/);await baseballRef.update({inning:+(m?.[1]||1),inningSide:(m?.[2]||baseballState.inningSide||'ALTA').toUpperCase()});
 }else await sportRef.child('score/period').set(v||'1');
};
$('mscClockStart').onclick=()=>document.getElementById('sportClockStart')?.click();
$('mscClockPause').onclick=()=>document.getElementById('sportClockPause')?.click();
$('mscControl').onclick=()=>document.getElementById('overlayControl')?.click();
// Mantener reloj rápido sincronizado con el reloj profesional.
setInterval(()=>{const live=$('sportClockLive');if(sport!=='baseball'&&live)$('mscClock').textContent=live.textContent||'00:00'},250);
// Atajos: toque en cámara = PREVIEW, doble toque = PROGRAM mediante CUT.
let lastTap=0;cameraGrid?.addEventListener('click',e=>{const card=e.target.closest('[data-camera],.camera-card,.panel');if(!card)return;const now=Date.now();if(now-lastTap<350)setTimeout(()=>$('cut')?.click(),40);lastTap=now});
})();
