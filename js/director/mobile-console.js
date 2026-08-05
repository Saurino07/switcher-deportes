(()=>{"use strict";
const isPhone=()=>/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||navigator.maxTouchPoints>0;
if(!isPhone()) return;
document.documentElement.classList.add('director-mobile-console');
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
ready(()=>{
 document.body.classList.add('director-mobile-console');
 const $=id=>document.getElementById(id);
 const q=(s,r=document)=>r.querySelector(s);
 const qa=(s,r=document)=>[...r.querySelectorAll(s)];
 const root=document.createElement('section');
 root.id='mobileDirectorCockpit';
 root.className='mobile-director-cockpit';
 root.innerHTML=`
 <div class="mdc-top">
   <div class="mdc-monitor mdc-program"><div class="mdc-label">PROGRAM</div><video id="mdcProgram" autoplay muted playsinline></video><span id="mdcProgramName">—</span></div>
   <div class="mdc-monitor mdc-preview"><div class="mdc-label">PREVIEW</div><video id="mdcPreview" autoplay muted playsinline></video><span id="mdcPreviewName">—</span></div>
 </div>
 <div class="mdc-cameras" id="mdcCameras">
   <button data-cam="cam1"><video autoplay muted playsinline></video><b>CAM1</b><small>—</small></button>
   <button data-cam="cam2"><video autoplay muted playsinline></video><b>CAM2</b><small>—</small></button>
   <button data-cam="cam3"><video autoplay muted playsinline></video><b>CAM3</b><small>—</small></button>
 </div>
 <div class="mdc-score">
   <div class="mdc-team"><small id="mdcAwayName">VISITANTE</small><div><button data-score="away" data-delta="-1">−</button><strong id="mdcAwayScore">0</strong><button data-score="away" data-delta="1">+</button></div></div>
   <div class="mdc-middle"><span id="mdcSport">BÉISBOL</span><input id="mdcPeriod" value="1"><div><button id="mdcClockStart">▶</button><button id="mdcClockPause">Ⅱ</button><b id="mdcClock">00:00</b></div></div>
   <div class="mdc-team"><small id="mdcHomeName">LOCAL</small><div><button data-score="home" data-delta="-1">−</button><strong id="mdcHomeScore">0</strong><button data-score="home" data-delta="1">+</button></div></div>
 </div>
 <div class="mdc-baseball" id="mdcBaseball">
  <button data-count="balls" data-delta="-1">B−</button><b>B <span id="mdcBalls">0</span></b><button data-count="balls" data-delta="1">B+</button>
  <button data-count="strikes" data-delta="-1">S−</button><b>S <span id="mdcStrikes">0</span></b><button data-count="strikes" data-delta="1">S+</button>
  <button data-count="outs" data-delta="-1">O−</button><b>O <span id="mdcOuts">0</span></b><button data-count="outs" data-delta="1">O+</button>
 </div>
 <div class="mdc-switch"><button data-action="cut">CUT</button><button data-action="auto">AUTO</button><button data-action="fade">FADE</button><button data-action="black">BLACK</button><button id="mdcFullControl">CONTROL COMPLETO</button></div>`;
 const shell=q('main.shell')||document.body;
 const header=q('.v15-header');
 if(header) header.insertAdjacentElement('afterend',root); else shell.prepend(root);

 const syncVideo=(dst,src)=>{ if(!dst||!src)return; if(src.srcObject && dst.srcObject!==src.srcObject){dst.srcObject=src.srcObject;dst.play().catch(()=>{});} };
 const cardFor=id=>{
   const cards=qa('#cameraGrid > *');
   return cards.find(c=>(c.dataset.camera||c.id||c.textContent||'').toLowerCase().includes(id));
 };
 const sync=()=>{
   syncVideo($('mdcProgram'),$('programMonitor')); syncVideo($('mdcPreview'),$('previewMonitor'));
   $('mdcProgramName').textContent=$('programName')?.textContent||'—'; $('mdcPreviewName').textContent=$('previewName')?.textContent||'—';
   qa('#mdcCameras [data-cam]').forEach(btn=>{const id=btn.dataset.cam, card=cardFor(id), src=card?.querySelector('video');syncVideo(btn.querySelector('video'),src);btn.querySelector('small').textContent=card?.querySelector('.badge:last-child')?.textContent|| (src?.srcObject?'EN LÍNEA':'SIN SEÑAL');});
 };
 setInterval(sync,500); sync();
 qa('#mdcCameras [data-cam]').forEach(btn=>btn.addEventListener('click',()=>{const card=cardFor(btn.dataset.cam); card?.click();}));
 qa('[data-action]',root).forEach(btn=>btn.onclick=()=>$(btn.dataset.action)?.click());
 $('mdcFullControl').onclick=()=>{q('[data-v15-tab="production"]')?.click(); $('sportsModule')?.scrollIntoView({behavior:'smooth',block:'start'});};

 if(!window.firebase||!window.Switcher) return;
 const game=Switcher.normalizeId(Switcher.qs('game',Switcher.app.defaultGame));
 const db=Switcher.initFirebase(); const sportRef=db.ref(`switcher/${game}/sport`), baseballRef=db.ref('gameState');
 let sport='baseball', ss={}, bs={}; const clamp=(n,a=0,b=999)=>Math.max(a,Math.min(b,Number(n)||0));
 const names={baseball:'BÉISBOL',soccer:'FÚTBOL',basketball:'BÁSQUET',volleyball:'VOLEIBOL',football:'F. AMERICANO'};
 const render=()=>{
   $('mdcSport').textContent=names[sport]||sport.toUpperCase(); $('mdcBaseball').hidden=sport!=='baseball';
   if(sport==='baseball'){const a=bs.away||{},h=bs.home||{};$('mdcAwayName').textContent=a.name||'VISITANTE';$('mdcHomeName').textContent=h.name||'LOCAL';$('mdcAwayScore').textContent=a.score??0;$('mdcHomeScore').textContent=h.score??0;$('mdcPeriod').value=`${bs.inning||1} ${bs.inningSide||''}`.trim();$('mdcBalls').textContent=bs.balls||0;$('mdcStrikes').textContent=bs.strikes||0;$('mdcOuts').textContent=bs.outs||0;}
   else {const c=ss.config||{},s=ss.score||{};$('mdcAwayName').textContent=c.awayName||'VISITANTE';$('mdcHomeName').textContent=c.homeName||'LOCAL';$('mdcAwayScore').textContent=s.awayScore??0;$('mdcHomeScore').textContent=s.homeScore??0;$('mdcPeriod').value=s.period??'1';$('mdcClock').textContent=s.clock||'00:00';}
 };
 sportRef.on('value',x=>{ss=x.val()||{};sport=ss.current||'baseball';render()}); baseballRef.on('value',x=>{bs=x.val()||{};render()});
 qa('[data-score]',root).forEach(b=>b.onclick=async()=>{const side=b.dataset.score,d=+b.dataset.delta;if(sport==='baseball'){const cur=clamp(bs?.[side]?.score);await baseballRef.child(`${side}/score`).set(clamp(cur+d));}else{const k=side==='home'?'homeScore':'awayScore';await sportRef.child(`score/${k}`).set(clamp((ss.score?.[k]||0)+d));}});
 qa('[data-count]',root).forEach(b=>b.onclick=()=>{const k=b.dataset.count,m=k==='balls'?3:2;baseballRef.child(k).set(clamp((bs[k]||0)+(+b.dataset.delta),0,m));});
 $('mdcPeriod').onchange=async()=>{const v=$('mdcPeriod').value.trim();if(sport==='baseball'){const m=v.match(/(\d+)\s*(.*)/);await baseballRef.update({inning:+(m?.[1]||1),inningSide:(m?.[2]||bs.inningSide||'ALTA').toUpperCase()});}else await sportRef.child('score/period').set(v||'1');};
 $('mdcClockStart').onclick=()=>$('sportClockStart')?.click(); $('mdcClockPause').onclick=()=>$('sportClockPause')?.click();
 setInterval(()=>{if(sport!=='baseball'&&$('sportClockLive'))$('mdcClock').textContent=$('sportClockLive').textContent||'00:00'},250);
});
})();
