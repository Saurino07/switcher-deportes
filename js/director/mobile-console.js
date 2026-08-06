(()=>{"use strict";
const isMobile=()=>/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)||((navigator.maxTouchPoints||0)>0&&Math.min(screen.width,screen.height)<1000);
if(!isMobile())return;
document.documentElement.classList.add("director-mobile-console");
const ready=fn=>document.readyState==="loading"?document.addEventListener("DOMContentLoaded",fn,{once:true}):fn();
ready(()=>{
 document.body.classList.add("director-mobile-console");
 const $=id=>document.getElementById(id),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
 const root=document.createElement("section"); root.id="mobileBroadcastDirector"; root.className="mobile-broadcast-director";
 root.innerHTML=`
 <header class="mbd-header">
  <div class="mbd-live">EN VIVO</div><div class="mbd-net">● <span id="mbdLatency">— ms</span></div>
  <div class="mbd-title">DIRECTOR · <span id="mbdGame">PARTIDO</span></div>
  <div class="mbd-cloud">FIREBASE <span id="mbdInfra">●</span></div><button id="mbdInstall" class="mbd-install" hidden>INSTALAR</button><div class="mbd-clock-now" id="mbdNow">--:--</div>
 </header>
 <div class="mbd-top-grid">
  <article class="mbd-monitor program"><div class="mbd-monitor-head"><b>PROGRAM</b><span>EN AIRE</span></div><video id="mbdProgram" autoplay muted playsinline></video><i id="mbdProgramName">—</i></article>
  <article class="mbd-monitor preview"><div class="mbd-monitor-head"><b>PREVIEW</b><span>VISTA PREVIA</span></div><video id="mbdPreview" autoplay muted playsinline></video><i id="mbdPreviewName">—</i></article>
  <aside class="mbd-side-controls">
   <b>SELECCIÓN DE CÁMARA</b><div class="mbd-select-cam"><button data-cam-select="cam1">CAM1</button><button data-cam-select="cam2">CAM2</button><button data-cam-select="cam3">CAM3</button></div>
   <div class="mbd-transition-status"><small>TRANSICIÓN ACTUAL</small><strong id="mbdTransition">CORTE</strong></div>
   <div class="mbd-stinger"><small>STINGER / TRANSICIÓN</small><button id="mbdTestStinger">▶ PROBAR TRANSICIÓN</button></div>
  </aside>
 </div>
 <div class="mbd-source-row">
  <div class="mbd-source" data-source="cam1"><video autoplay muted playsinline></video><b>CAM1</b><small>—</small></div>
  <div class="mbd-source" data-source="cam2"><video autoplay muted playsinline></video><b>CAM2</b><small>—</small></div>
  <div class="mbd-source" data-source="cam3"><video autoplay muted playsinline></video><b>CAM3</b><small>—</small></div>
  <section class="mbd-replay-quick"><b>REPLAY RÁPIDO</b><div><button data-replay-sec="5">5s</button><button data-replay-sec="10">10s</button><button data-replay-sec="15">15s</button></div><small>VELOCIDAD</small><div><button data-speed="0.25">0.25×</button><button data-speed="0.5">0.5×</button><button class="active" data-speed="1">1×</button></div></section>
 </div>
 <section class="mbd-scoreboard-controls">
  <article class="mbd-team away"><h3>VISITANTE</h3><div class="mbd-team-body"><img id="mbdAwayLogo" alt="Logo visitante"><div class="mbd-cards"><button data-card="awayYellowCards" data-delta="1"><em class="yellow"></em><span id="mbdAwayYellow">0</span></button><button data-card="awayRedCards" data-delta="1"><em class="red"></em><span id="mbdAwayRed">0</span></button></div><div class="mbd-score"><div class="mbd-score-line"><button data-score="away" data-delta="-1">−</button><strong id="mbdAwayScore">0</strong><button data-score="away" data-delta="1">+</button></div><button class="mbd-quick-score" data-score="away" data-delta="1">+1 GOL / CARRERA</button><small id="mbdAwayName">VISITANTE</small></div></div></article>
  <article class="mbd-game-center"><h3>PERIODO / RELOJ</h3><div class="mbd-period"><button id="mbdPeriodMinus">−</button><strong id="mbdPeriod">1</strong><button id="mbdPeriodPlus">+</button><button id="mbdClockStart">▶</button><button id="mbdClockPause">Ⅱ</button><b id="mbdClock">00:00</b></div><div class="mbd-counts" id="mbdCounts"><label>BOLAS <button data-count="balls" data-delta="-1">−</button><strong id="mbdBalls">0</strong><button data-count="balls" data-delta="1">+</button></label><label>STRIKES <button data-count="strikes" data-delta="-1">−</button><strong id="mbdStrikes">0</strong><button data-count="strikes" data-delta="1">+</button></label><label>OUTS <button data-count="outs" data-delta="-1">−</button><strong id="mbdOuts">0</strong><button data-count="outs" data-delta="1">+</button></label></div></article>
  <article class="mbd-team home"><h3>LOCAL</h3><div class="mbd-team-body"><div class="mbd-score"><div class="mbd-score-line"><button data-score="home" data-delta="-1">−</button><strong id="mbdHomeScore">0</strong><button data-score="home" data-delta="1">+</button></div><button class="mbd-quick-score" data-score="home" data-delta="1">+1 GOL / CARRERA</button><small id="mbdHomeName">LOCAL</small></div><img id="mbdHomeLogo" alt="Logo local"><div class="mbd-cards"><button data-card="homeYellowCards" data-delta="1"><em class="yellow"></em><span id="mbdHomeYellow">0</span></button><button data-card="homeRedCards" data-delta="1"><em class="red"></em><span id="mbdHomeRed">0</span></button></div></div><div class="mbd-bases" id="mbdBases"><button data-base="first">1B</button><button data-base="second">2B</button><button data-base="third">3B</button><button id="mbdClearBases">LIMPIAR</button></div></article>
 </section>
 <div class="mbd-actions"><button class="cut" data-action="cut">CUT</button><button class="auto" data-action="auto">AUTO</button><button class="fade" data-action="fade">FADE</button><button class="black" data-action="black">BLACK</button><button class="replay" id="mbdReplay">REPLAY</button><button class="full" id="mbdFullControl">CONTROL COMPLETO</button></div>
 <nav class="mbd-nav"><button data-open-tab="production">PRODUCCIÓN</button><button data-open-tab="replay">REPLAY</button><button data-open-tab="graphics">GRÁFICOS</button><button data-open-tab="media">MEDIOS</button><button data-open-tab="system">SISTEMA</button></nav>
`;

 // V19.0: interfaz móvil reconstruida y adaptativa.
 const stage=document.createElement("div");
 stage.className="mbd-stage";
 while(root.firstChild) stage.appendChild(root.firstChild);
 root.appendChild(stage);
 document.body.appendChild(root);
 const returnQuick=document.createElement("button"); returnQuick.id="mbdBack"; returnQuick.className="mbd-back"; returnQuick.textContent="← VOLVER AL PANEL RÁPIDO"; document.body.appendChild(returnQuick);
 const fitViewport=()=>{
   const vv=window.visualViewport;
   const vw=Math.max(1,Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||1));
   const vh=Math.max(1,Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||1));
   root.style.setProperty("--mbd-vw",vw+"px");
   root.style.setProperty("--mbd-vh",vh+"px");

 };
 fitViewport();
 window.addEventListener("resize",fitViewport,{passive:true});
 window.addEventListener("orientationchange",()=>setTimeout(fitViewport,120),{passive:true});
 window.visualViewport?.addEventListener("resize",fitViewport,{passive:true});
 window.visualViewport?.addEventListener("scroll",fitViewport,{passive:true});
 const game=(window.Switcher&&Switcher.normalizeId(Switcher.qs("game",Switcher.app.defaultGame)))||"partido1"; $("mbdGame").textContent=game.toUpperCase();
 // PWA del Director: guarda la URL completa y ofrece instalación independiente.
 try{localStorage.setItem("switcherDirectorLaunchUrl",location.href)}catch(_){}
 let deferredInstall=null;
 window.addEventListener("beforeinstallprompt",ev=>{ev.preventDefault();deferredInstall=ev;const b=$("mbdInstall");if(b)b.hidden=false});
 $("mbdInstall").onclick=async()=>{if(!deferredInstall){alert("En Chrome abre el menú ⋮ y selecciona Instalar aplicación o Agregar a pantalla principal.");return}deferredInstall.prompt();await deferredInstall.userChoice.catch(()=>null);deferredInstall=null;$("mbdInstall").hidden=true};
 window.addEventListener("appinstalled",()=>{$("mbdInstall").hidden=true});
 const syncVideo=(dst,src)=>{if(dst&&src?.srcObject&&dst.srcObject!==src.srcObject){dst.srcObject=src.srcObject;dst.play().catch(()=>{})}};
 const cardFor=id=>$("card-"+id)?.closest("article")||$("card-"+id);
 function syncMonitors(){syncVideo($("mbdProgram"),$("programMonitor"));syncVideo($("mbdPreview"),$("previewMonitor"));$("mbdProgramName").textContent=$("programName")?.textContent||"—";$("mbdPreviewName").textContent=$("previewName")?.textContent||"—";qa(".mbd-source").forEach(el=>{const id=el.dataset.source,card=cardFor(id),video=card?.querySelector("video");syncVideo(el.querySelector("video"),video);el.querySelector("small").textContent=$("state-"+id)?.textContent||"OFFLINE";el.classList.toggle("on",$("state-"+id)?.textContent?.toLowerCase().includes("connect"));});const p=($("programName")?.textContent||"").toLowerCase();qa("[data-cam-select]").forEach(b=>b.classList.toggle("active",p.includes(b.dataset.camSelect)));$("mbdInfra").className=$("infra")?.classList.contains("bad")?"bad":$("infra")?.classList.contains("good")?"good":"warn";}
 setInterval(syncMonitors,400); syncMonitors(); setInterval(()=>{$("mbdNow").textContent=new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})},1000);
 const cameraPreview=id=>q(`[data-preview="${id}"]`)?.click(); qa("[data-cam-select]").forEach(b=>b.onclick=()=>cameraPreview(b.dataset.camSelect));qa(".mbd-source").forEach(b=>b.onclick=()=>cameraPreview(b.dataset.source));qa("[data-action]",root).forEach(b=>b.onclick=()=>$(b.dataset.action)?.click());
 $("mbdTestStinger").onclick=()=>$("testReplayTransition")?.click();
 qa("[data-speed]").forEach(b=>b.onclick=()=>{qa("[data-speed]").forEach(x=>x.classList.remove("active"));b.classList.add("active");if($("replaySpeed"))$("replaySpeed").value=b.dataset.speed});
 qa("[data-replay-sec]").forEach(b=>b.onclick=()=>{const sec=+b.dataset.replaySec,max=+($("replayBufferLength")?.textContent||30)||30,start=Math.max(0,max-sec);if($("replayStart"))$("replayStart").value=start;if($("replayEnd"))$("replayEnd").value=max;$("replayPreview")?.click()});
 $("mbdReplay").onclick=()=>{$("replayPreview")?.click()||openFull("replay")};
 function openFull(tab){document.body.classList.add("mobile-full-control");q(`[data-v15-tab="${tab}"]`)?.click();window.scrollTo({top:0,left:0,behavior:"instant"})}
 function returnToQuick(){document.body.classList.remove("mobile-full-control");window.scrollTo({top:0,left:0,behavior:"instant"});setTimeout(fitViewport,60)}
 $("mbdFullControl").onclick=()=>openFull("production");qa("[data-open-tab]").forEach(b=>b.onclick=()=>openFull(b.dataset.openTab));$("mbdBack").onclick=returnToQuick;
 window.addEventListener("popstate",()=>{if(document.body.classList.contains("mobile-full-control"))returnToQuick()});
 if(!window.firebase||!window.Switcher)return;
 const db=Switcher.initFirebase(),sportRef=db.ref(`switcher/${game}/sport`),baseballRef=db.ref("gameState");let sport="baseball",ss={},bs={},cards={},clock={running:false,mode:"countup",baseSeconds:0,startedAt:0};
 const clamp=(n,a=0,b=999)=>Math.max(a,Math.min(b,Number(n)||0)),fmt=s=>{s=Math.max(0,Math.floor(s));return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`},clockSec=()=>{let s=+clock.baseSeconds||0;if(clock.running&&clock.startedAt){const e=Math.max(0,(Date.now()-clock.startedAt)/1000);s=clock.mode==="countdown"?s-e:s+e}return Math.max(0,s)};
 const logo=(el,url)=>{if(!el)return;el.src=url||"";el.style.visibility=url?"visible":"hidden"};
 function render(){const baseball=sport==="baseball",cfg=ss.config||{},sc=ss.score||{};$("mbdCounts").hidden=!baseball;$("mbdBases").hidden=!baseball;if(baseball){const a=bs.away||{},h=bs.home||{};$("mbdAwayName").textContent=a.name||"VISITANTE";$("mbdHomeName").textContent=h.name||"LOCAL";$("mbdAwayScore").textContent=a.score??0;$("mbdHomeScore").textContent=h.score??0;logo($("mbdAwayLogo"),a.logo||cfg.awayLogo);logo($("mbdHomeLogo"),h.logo||cfg.homeLogo);$("mbdPeriod").textContent=`${bs.inning||1} ${(bs.inningSide||"").replace("ALTA","▲").replace("BAJA","▼")}`;$("mbdBalls").textContent=bs.balls||0;$("mbdStrikes").textContent=bs.strikes||0;$("mbdOuts").textContent=bs.outs||0;const bases=bs.bases||{};qa("[data-base]").forEach(b=>b.classList.toggle("active",!!bases[b.dataset.base]));}else{$("mbdAwayName").textContent=cfg.awayName||"VISITANTE";$("mbdHomeName").textContent=cfg.homeName||"LOCAL";$("mbdAwayScore").textContent=sc.awayScore??0;$("mbdHomeScore").textContent=sc.homeScore??0;logo($("mbdAwayLogo"),cfg.awayLogo);logo($("mbdHomeLogo"),cfg.homeLogo);$("mbdPeriod").textContent=sc.period??1;}const map={awayYellowCards:"mbdAwayYellow",awayRedCards:"mbdAwayRed",homeYellowCards:"mbdHomeYellow",homeRedCards:"mbdHomeRed"};Object.entries(map).forEach(([k,id])=>$(id).textContent=cards[k]||0)}
 sportRef.on("value",s=>{ss=s.val()||{};sport=ss.current||"baseball";render()});sportRef.child("cards").on("value",s=>{cards=s.val()||{};render()});sportRef.child("clockControl").on("value",s=>{clock={...clock,...(s.val()||{})}});baseballRef.on("value",s=>{bs=s.val()||{};render()});setInterval(()=>{$("mbdClock").textContent=fmt(clockSec())},250);
 qa("[data-score]",root).forEach(b=>b.onclick=async()=>{const side=b.dataset.score,d=+b.dataset.delta;if(sport==="baseball")await baseballRef.child(`${side}/score`).set(clamp((bs?.[side]?.score||0)+d));else{const key=side==="home"?"homeScore":"awayScore";await sportRef.child(`score/${key}`).set(clamp((ss.score?.[key]||0)+d));}});
 qa("[data-count]",root).forEach(b=>b.onclick=()=>{const k=b.dataset.count,m=k==="balls"?3:2;baseballRef.child(k).set(clamp((bs[k]||0)+(+b.dataset.delta),0,m))});
 qa("[data-card]",root).forEach(b=>b.onclick=()=>sportRef.child(`cards/${b.dataset.card}`).set(clamp((cards[b.dataset.card]||0)+(+b.dataset.delta),0,9)));
 qa("[data-base]",root).forEach(b=>b.onclick=()=>baseballRef.child(`bases/${b.dataset.base}`).set(!bs?.bases?.[b.dataset.base]));$("mbdClearBases").onclick=()=>baseballRef.child("bases").set({first:false,second:false,third:false});
 const periodDelta=async d=>{if(sport==="baseball")await baseballRef.child("inning").set(clamp((+bs.inning||1)+d,1,99));else await sportRef.child("score/period").set(String(clamp((parseInt(ss.score?.period)||1)+d,1,99)))};$("mbdPeriodMinus").onclick=()=>periodDelta(-1);$("mbdPeriodPlus").onclick=()=>periodDelta(1);$("mbdClockStart").onclick=()=>$("sportClockStart")?.click();$("mbdClockPause").onclick=()=>$("sportClockPause")?.click();
});})();
