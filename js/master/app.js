(async()=>{"use strict";
const $=id=>document.getElementById(id),storedGame=localStorage.getItem("switcherGame")||Switcher.app.defaultGame,game=Switcher.normalizeId(Switcher.qs("game",storedGame)),client=Switcher.randomId("master");localStorage.setItem("switcherGame",game);
let db,ice=[],localStream=null,heartbeat=null,program="cam1",requestedCam="cam1",activeRemote=null,pendingRemote=null,switchToken=0,retryTimer=null,retry=0;
const cameraPeers=new Map(),answering=new Set(),front=$("remoteFront"),back=$("remoteNext"),local=$("localVideo"),canvas=$("programCanvas"),ctx=canvas.getContext("2d",{alpha:false,desynchronized:true}),overlay=$("overlayFrame"),overlayViewport=$("overlayViewport"),fade=$("fade"),black=$("black"),lowerThird=$("lowerThird"),lowerThirdName=$("lowerThirdName"),lowerThirdRole=$("lowerThirdRole"),replayVideo=$("replayVideo"),replayBug=$("replayBug"),rt=$("replayTransition"),rti=$("replayTransitionImage"),rtv=$("replayTransitionVideo"),rtf=$("replayTransitionFallback"),remoteAudio=$("remoteProgramAudio");
let renderSource=local,renderFit="cover",renderLoop=0,lastFrameAt=0,wakeLock=null,recovering=false,lastRenderedSource=null,renderBusy=false,tbarProgress=0,controlsTimer=null,lastTapAt=0,audioUnlocked=false;
const pageStartedAt=Date.now();let rawCaptureStream=null,voiceCtx=null,voiceDest=null;let replayEnabled=false,segments=[],recorder=null,segmentTimer=null,generation=0,replayPlaying=false,lastCommand="",transitionCfg={sport:"baseball",url:new URL("../assets/replay/baseball.svg",location.href).href,durationMs:1200,outro:true};
const status=(a,b="")=>{const h=$("hud"),h2=$("hud2");if(h?.firstChild)h.firstChild.textContent=a;if(h2)h2.textContent=b||`PROGRAM ${program.toUpperCase()} · CAM1 Master`;};
const showFatal=message=>{const setup=$("setup"),panel=$("fatalPanel"),st=$("setupStatus");if(setup)setup.style.display="flex";if(panel){panel.style.display="block";panel.textContent=String(message||"Error desconocido");}if(st)st.innerHTML='<span class="bad">No fue posible iniciar. Usa REINICIAR / LIMPIAR APP y vuelve a intentarlo.</span>';status("V18.1 · ERROR DE INICIO",String(message||""));};window.__showMasterFatal=showFatal;

function resizeCanvas(){const aspect=Math.max(.5,innerWidth/Math.max(1,innerHeight));let w=854,h=Math.round(w/aspect);if(h>540){h=540;w=Math.round(h*aspect)}w=Math.max(2,w);h=Math.max(2,h);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.fillStyle="#000";ctx.fillRect(0,0,w,h)}}
function drawCover(video){resizeCanvas();const cw=canvas.width,ch=canvas.height;if(!video||video.readyState<2||!video.videoWidth||!video.videoHeight)return false;const vw=video.videoWidth,vh=video.videoHeight,fit=renderFit;const scale=fit==="contain"?Math.min(cw/vw,ch/vh):Math.max(cw/vw,ch/vh);const dw=vw*scale,dh=vh*scale,dx=(cw-dw)/2,dy=(ch-dh)/2;try{ctx.drawImage(video,dx,dy,dw,dh);lastFrameAt=Date.now();lastRenderedSource=video;return true}catch{return false}}
function render(){if(!renderBusy){renderBusy=true;drawCover(renderSource);renderBusy=false}renderLoop=setTimeout(()=>requestAnimationFrame(render),66)}
function setRenderSource(v){if(v)renderSource=v}
async function requestWakeLock(){try{wakeLock=await navigator.wakeLock?.request("screen");wakeLock?.addEventListener("release",()=>wakeLock=null)}catch{}}
async function recoverLocalCamera(reason=""){if(recovering||document.hidden)return;const track=localStream?.getVideoTracks?.()[0];if(track&&track.readyState==="live"&&!track.muted){try{await local.play();return}catch{}}recovering=true;status("V18.1 · recuperando CAM1",reason);try{localStream?.getTracks().forEach(t=>t.stop());localStream=await openLocalCamera();for(const id of [...cameraPeers.keys()])closeCameraPeer(id);if(program==="cam1")setRenderSource(local);watchDirector();if(replayEnabled&&program==="cam1")startBuffer(localStream);await db?.ref(`switcher/${game}/cameras/cam1`).update({online:true,recoveredAt:firebase.database.ServerValue.TIMESTAMP});status("V18.1 · CAM1 RECUPERADA")}catch(e){status(`CAM1 no disponible: ${e.message}`)}finally{recovering=false}}

function captureProfile(){const q=+$("quality").value;return q===720?{w:1280,h:720,f:24}:q===540?{w:960,h:540,f:18}:{w:854,h:480,f:15}}
function constraints({fallback=false}={}){const {w,h,f}=captureProfile(),captureMic=["director","announcer"].includes($("audioMode").value),deviceId=$("cameraSelect").value,facing=$("cameraFacing").value||"environment";const video=fallback?true:{width:{ideal:w},height:{ideal:h},frameRate:{ideal:f,max:f}};if(video!==true){if(deviceId)video.deviceId={exact:deviceId};else video.facingMode={ideal:facing}}return{audio:captureMic?{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1}:false,video}}
async function devices(){if(!navigator.mediaDevices?.enumerateDevices)return;const selected=$("cameraSelect").value;const ds=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="videoinput");const opts=['<option value="">Automática según orientación</option>'];ds.forEach((d,i)=>opts.push(`<option value="${d.deviceId}">${d.label||`Cámara detectada ${i+1}`}</option>`));$("cameraSelect").innerHTML=opts.join("");if(selected&&ds.some(d=>d.deviceId===selected))$("cameraSelect").value=selected;$("setupStatus").textContent=ds.length?`Se detectaron ${ds.length} cámara(s). Selecciona trasera, frontal o un dispositivo específico.`:"No se detectaron cámaras todavía. Pulsa INICIAR para solicitar permiso."}
async function applyVoiceProfile(stream){
  if($("audioMode").value!=="announcer"||!stream.getAudioTracks().length)return stream;
  try{voiceCtx?.close?.()}catch{};voiceCtx=new (window.AudioContext||window.webkitAudioContext)();
  const src=voiceCtx.createMediaStreamSource(stream),low=voiceCtx.createBiquadFilter(),presence=voiceCtx.createBiquadFilter(),comp=voiceCtx.createDynamicsCompressor();
  low.type="lowshelf";low.frequency.value=180;low.gain.value=7;presence.type="peaking";presence.frequency.value=2900;presence.Q.value=.8;presence.gain.value=-2.5;
  comp.threshold.value=-24;comp.knee.value=22;comp.ratio.value=4;comp.attack.value=.006;comp.release.value=.22;voiceDest=voiceCtx.createMediaStreamDestination();src.connect(low).connect(presence).connect(comp).connect(voiceDest);
  const a=$("announcerAudio");a.srcObject=voiceDest.stream;a.volume=1;try{await voiceCtx.resume();await a.play()}catch{}
  return new MediaStream([...stream.getVideoTracks(),...voiceDest.stream.getAudioTracks()]);
}
async function openLocalCamera(){if(!window.isSecureContext)throw new Error("La cámara requiere HTTPS. Abre la dirección de GitHub Pages con https://");if(!navigator.mediaDevices?.getUserMedia)throw new Error("Este navegador no permite usar la cámara. Actualiza Chrome y habilita permisos.");localStream?.getTracks().forEach(t=>t.stop());rawCaptureStream?.getTracks().forEach(t=>t.stop());localStream=null;rawCaptureStream=null;let firstError=null;try{rawCaptureStream=await navigator.mediaDevices.getUserMedia(constraints());localStream=await applyVoiceProfile(rawCaptureStream)}catch(e){firstError=e;try{rawCaptureStream=await navigator.mediaDevices.getUserMedia(constraints({fallback:true}));localStream=await applyVoiceProfile(rawCaptureStream)}catch(e2){const name=e2?.name||firstError?.name||"Error";if(name==="NotAllowedError")throw new Error("Permiso de cámara denegado. Ve a Ajustes > Aplicaciones > Chrome/CAM1 Master > Permisos > Cámara > Permitir.");if(name==="NotFoundError")throw new Error("No se encontró ninguna cámara disponible.");if(name==="NotReadableError")throw new Error("La cámara está siendo usada por otra aplicación. Cierra PRISM y otras apps de cámara, luego intenta de nuevo.");throw new Error(`No fue posible abrir la cámara: ${e2?.message||firstError?.message||name}`)}}local.srcObject=localStream;local.muted=true;await local.play();await devices();const track=localStream.getVideoTracks()[0],settings=track?.getSettings?.()||{};status("V18.1 · CAM1 ABIERTA",`${track?.label||"Cámara"} · ${settings.width||"?"}×${settings.height||"?"}`);return localStream}
function closeCameraPeer(id){const p=cameraPeers.get(id);if(!p)return;try{p.candidates.off();p.pc.close()}catch{}cameraPeers.delete(id)}
async function answerDirector(viewerId,data){if(!localStream||!data?.offer||answering.has(viewerId)||cameraPeers.has(viewerId))return;answering.add(viewerId);let pc,candidates;try{const base=`switcher/${game}/cameraSignaling/cam1/${viewerId}`;pc=new RTCPeerConnection(Switcher.peerConfig(ice));const q=Switcher.makeIceQueue(pc),senders=localStream.getTracks().map(t=>pc.addTrack(t,localStream));const vs=senders.find(s=>s.track?.kind==="video"),as=senders.find(s=>s.track?.kind==="audio");await Switcher.setSenderProfile(vs,data.role==="director"?{maxBitrate:280000,maxFramerate:8,scaleResolutionDownBy:2}:{maxBitrate:650000,maxFramerate:15,scaleResolutionDownBy:1.5});await Switcher.setSenderProfile(as,{maxBitrate:48000});pc.onicecandidate=e=>e.candidate&&db.ref(`${base}/cameraCandidates`).push(e.candidate.toJSON());candidates=db.ref(`${base}/viewerCandidates`);candidates.on("child_added",s=>s.val()&&q.add(s.val()));pc.onconnectionstatechange=()=>["failed","closed"].includes(pc.connectionState)&&closeCameraPeer(viewerId);await pc.setRemoteDescription(data.offer);await q.flush();await pc.setLocalDescription(await pc.createAnswer());await db.ref(`${base}/answer`).set({type:pc.localDescription.type,sdp:pc.localDescription.sdp});cameraPeers.set(viewerId,{pc,candidates});status(`V18.1 · CAM1 activa · ${cameraPeers.size} receptor(es)`)}catch(e){try{pc?.close()}catch{}status(`CAM1 WebRTC: ${e.message}`)}finally{answering.delete(viewerId)}}
function watchDirector(){const ref=db.ref(`switcher/${game}/cameraSignaling/cam1`);ref.on("child_added",s=>answerDirector(s.key,s.val()));ref.on("child_changed",s=>answerDirector(s.key,s.val()))}
function mime(){return["video/webm;codecs=vp8,opus","video/webm;codecs=vp8","video/webm"].find(t=>window.MediaRecorder&&MediaRecorder.isTypeSupported(t))||""}
async function replayStatus(extra={}){const seconds=segments.reduce((n,x)=>n+x.seconds,0);await db.ref(`switcher/${game}/broadcast/replayStatus`).set({supported:!!window.MediaRecorder,ready:seconds>=4,bufferSeconds:Math.min(seconds,30),playing:replayPlaying,source:program,producer:"cam1-master",updatedAt:firebase.database.ServerValue.TIMESTAMP,...extra})}
function stopBuffer(){generation++;clearTimeout(segmentTimer);try{recorder&&recorder.state!=="inactive"&&recorder.stop()}catch{}recorder=null;segments=[]}
function currentProgramStream(){if(program==="cam1")return localStream;return activeRemote?.cam===program?activeRemote.stream:null}
function startBuffer(stream){stopBuffer();const track=stream?.getVideoTracks()[0];if(!track||!window.MediaRecorder)return replayStatus({supported:false,message:"Replay no disponible"});const gen=++generation,m=mime(),ms=2000;const next=()=>{if(gen!==generation||!replayEnabled||track.readyState!=="live")return;let chunks=[];try{recorder=new MediaRecorder(new MediaStream(stream.getTracks().filter(t=>t.readyState==="live")),{...(m?{mimeType:m}:{}),videoBitsPerSecond:700000,audioBitsPerSecond:48000})}catch(e){return replayStatus({supported:false,message:e.message})}recorder.ondataavailable=e=>e.data?.size&&chunks.push(e.data);recorder.onstop=()=>{if(gen!==generation)return;if(chunks.length){segments.push({blob:new Blob(chunks,{type:recorder.mimeType||m||"video/webm"}),seconds:2});while(segments.length>15)segments.shift();replayStatus({message:`Buffer ${program.toUpperCase()} grabando`})}setTimeout(next,0)};recorder.start(250);segmentTimer=setTimeout(()=>{try{recorder.state==="recording"&&recorder.stop()}catch{}},ms)};next()}
async function showTransition(c=transitionCfg){const url=(c.url||"").trim(),duration=Math.max(300,Math.min(5000,+c.durationMs||1200));rt.classList.add("show");rti.style.display="none";rtv.style.display="none";rtf.style.display="block";if(url){if(/\.(mp4|webm|mov)(\?|#|$)/i.test(url)){rtv.src=url;rtv.style.display="block";rtf.style.display="none";try{await rtv.play()}catch{}}else{rti.src=url;rti.style.display="block";rtf.style.display="none"}}await Switcher.sleep(duration);rt.classList.remove("show");try{rtv.pause()}catch{}rtv.removeAttribute("src");rti.removeAttribute("src")}
async function finishReplay(use=true){if(use&&transitionCfg.outro)await showTransition();replayPlaying=false;replayVideo.pause();setRenderSource(program==="cam1"?local:(activeRemote?.video||local));replayBug.classList.remove("show");replayVideo.removeAttribute("src");await replayStatus({playing:false,message:"LIVE"})}
async function playReplay(start=0,end=10,speed=.5){if(replayPlaying||!segments.length)return;const available=Math.floor(segments.reduce((n,x)=>n+x.seconds,0));start=Math.max(0,Math.floor(+start||0));end=Math.min(available,Math.max(start+1,Math.floor(+end||10)));const sel=segments.slice(Math.floor(start/2),Math.ceil(end/2));if(!sel.length)return replayStatus({message:"Intervalo sin video"});replayPlaying=true;await showTransition();replayVideo.playbackRate=Math.max(.1,Math.min(1,+speed||1));replayVideo.muted=(+speed||1)<1;setRenderSource(replayVideo);replayBug.classList.add("show");await replayStatus({playing:true,message:`${start}s → ${end}s ×${speed}`});let i=0;const next=async()=>{if(!replayPlaying)return;if(i>=sel.length)return finishReplay();const u=URL.createObjectURL(sel[i++].blob);replayVideo.src=u;replayVideo.onended=()=>{URL.revokeObjectURL(u);next()};replayVideo.onerror=()=>{URL.revokeObjectURL(u);next()};try{await replayVideo.play()}catch{URL.revokeObjectURL(u);finishReplay()}};next()}
function media(data){try{overlay.contentWindow?.postMessage({type:"switcher-overlay-media",payload:data||{}},"*")}catch{}}
async function destroyRemote(s){if(!s)return;try{s.answer.off();s.candidates.off();clearInterval(s.stats);s.pc.close();s.video.pause();s.video.srcObject=null}catch{}if(s.base)await Switcher.safeRemove(db.ref(s.base))}
async function promote(s,token){if(token!==switchToken||pendingRemote!==s)return;const old=activeRemote;activeRemote=s;pendingRemote=null;setRenderSource(s.video);program=s.cam;setProgramAudio(s.stream);status(`V18.1 · ${s.cam.toUpperCase()} AL AIRE`);if(replayEnabled)startBuffer(s.stream);setTimeout(()=>destroyRemote(old),250)}
async function buildRemote(cam,video,token){const id=`master-${client}-${cam}-${Date.now().toString(36)}`,base=`switcher/${game}/cameraSignaling/${cam}/${id}`,pc=new RTCPeerConnection(Switcher.peerConfig(ice)),q=Switcher.makeIceQueue(pc),stream=new MediaStream(),s={cam,pc,base,stream,video,answer:null,candidates:null,stats:null};video.srcObject=stream;video.muted=false;pc.addTransceiver("video",{direction:"recvonly"});pc.addTransceiver("audio",{direction:"recvonly"});pc.ontrack=e=>{if(!stream.getTracks().some(t=>t.id===e.track.id))stream.addTrack(e.track);video.play().catch(()=>{})};let ready=false,pending=[];pc.onicecandidate=e=>{if(!e.candidate)return;const x=e.candidate.toJSON();ready?db.ref(`${base}/viewerCandidates`).push(x):pending.push(x)};const candidates=db.ref(`${base}/cameraCandidates`),answer=db.ref(`${base}/answer`);candidates.on("child_added",x=>x.val()&&q.add(x.val()));answer.on("value",async x=>{if(x.val()&&!pc.currentRemoteDescription){await pc.setRemoteDescription(x.val());await q.flush()}});s.answer=answer;s.candidates=candidates;await pc.setLocalDescription(await pc.createOffer());await db.ref(base).set({role:"broadcast-direct",clientId:client,createdAt:firebase.database.ServerValue.TIMESTAMP,offer:{type:pc.localDescription.type,sdp:pc.localDescription.sdp}});ready=true;for(const x of pending)await db.ref(`${base}/viewerCandidates`).push(x);let last=0;s.stats=setInterval(async()=>{if(token!==switchToken||pendingRemote!==s)return;let r;(await pc.getStats()).forEach(x=>{if(x.type==="inbound-rtp"&&x.kind==="video"&&!x.isRemote)r=x});const f=r?.framesDecoded||0;if(f>last&&video.videoWidth>0&&video.readyState>=2)await promote(s,token);last=f},500);return s}
async function switchProgram(cam){requestedCam=cam||"cam1";const token=++switchToken;if(pendingRemote){await destroyRemote(pendingRemote);pendingRemote=null}if(cam==="cam1"){const old=activeRemote;activeRemote=null;program="cam1";setRenderSource(local);setProgramAudio(null);status("V18.1 · CAM1 LOCAL AL AIRE");if(replayEnabled)startBuffer(localStream);setTimeout(()=>destroyRemote(old),250);return}if(activeRemote?.cam===cam)return;const target=activeRemote?.video===front?back:front;status(`V18.1 · preparando ${cam.toUpperCase()}`);try{pendingRemote=await buildRemote(cam,target,token)}catch(e){status(`No conecta ${cam}: ${e.message}`);clearTimeout(retryTimer);retryTimer=setTimeout(()=>switchProgram(cam),2500)}}
function forceOverlayTransparency(){
  try{
    overlay.style.background="rgba(0,0,0,0)";
    overlay.setAttribute("allowtransparency","true");
    const doc=overlay.contentDocument;
    if(!doc)return;
    doc.documentElement.style.setProperty("background","transparent","important");
    doc.documentElement.style.setProperty("background-color","rgba(0,0,0,0)","important");
    if(doc.body){
      doc.body.style.setProperty("background","transparent","important");
      doc.body.style.setProperty("background-color","rgba(0,0,0,0)","important");
    }
    let style=doc.getElementById("cam1-master-transparent-fix");
    const viewportWidth=Math.max(320,overlay.clientWidth||innerWidth);
    const targetWidth=Math.min(400,Math.max(260,viewportWidth*0.28));
    const scoreScale=Math.max(0.24,Math.min(0.42,targetWidth/1250));
    if(!style){
      style=doc.createElement("style");
      style.id="cam1-master-transparent-fix";
      (doc.head||doc.documentElement).appendChild(style);
    }
    style.textContent=`
      html,body{background:transparent!important;background-color:rgba(0,0,0,0)!important;overflow:hidden!important;}
      body.v10-embedded #overlay-root{position:fixed!important;inset:0!important;width:100vw!important;min-width:0!important;height:100vh!important;transform:none!important;animation:none!important;transition:none!important;filter:none!important;}
      body.v10-embedded #overlay-scale{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;transform:none!important;transform-origin:top left!important;}
      body.v10-embedded #overlay-flex{position:static!important;display:block!important;width:auto!important;}
      body.v10-embedded #overlay-bar{position:fixed!important;top:18px!important;left:20px!important;right:auto!important;bottom:auto!important;width:1250px!important;min-width:1250px!important;transform:scale(${scoreScale})!important;transform-origin:top left!important;box-shadow:0 6px 18px rgba(0,0,0,.55)!important;}
      body.v10-embedded #overlay-bar::before{display:none!important;animation:none!important;}
      body.v10-embedded *{backface-visibility:hidden!important;}
    `;
  }catch(e){status("Overlay cargado con aislamiento",e?.message||"")}
}
function isInstalled(){return matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true}
function showControls(){document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2800)}
async function unlockAudio(){audioUnlocked=true;try{const AC=window.AudioContext||window.webkitAudioContext;if(AC){window.__switcherAudioContext=window.__switcherAudioContext||new AC();await window.__switcherAudioContext.resume()}}catch{}try{remoteAudio.muted=false;await remoteAudio.play()}catch{}$('audioUnlockBtn').style.display='none';showControls()}
function setProgramAudio(stream){if(program==='cam1'||!stream){remoteAudio.pause();remoteAudio.srcObject=null;return}remoteAudio.srcObject=stream;remoteAudio.muted=false;remoteAudio.volume=1;remoteAudio.play().then(()=>{$('audioUnlockBtn').style.display='none'}).catch(()=>{$('audioUnlockBtn').style.display='inline-flex';showControls()})}
async function goFullscreen(){showControls();try{if(!document.fullscreenElement&&document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen({navigationUI:'hide'});await screen.orientation?.lock?.('landscape')}catch(e){status('Pantalla completa requiere app instalada o un toque',e?.message||'');}}
let infrastructureStarted=false;
async function startInfrastructure(){
  if(infrastructureStarted)return;
  infrastructureStarted=true;
  try{
    status("V18.1 · CAM1 VISIBLE", "Conectando Firebase y TURN…");
    db=Switcher.initFirebase();
    ice=await Switcher.getIceServers({game,role:"cam1-master",clientId:client});
    watchDirector();
    await db.ref(`switcher/${game}/cameras/cam1`).set({online:true,role:"cam1-master",quality:+$("quality").value,updatedAt:firebase.database.ServerValue.TIMESTAMP});
    heartbeat=setInterval(()=>db.ref(`switcher/${game}/cameras/cam1`).update({online:true,updatedAt:firebase.database.ServerValue.TIMESTAMP}),5000);
    db.ref(`switcher/${game}/program`).on("value",s=>switchProgram(s.val()||"cam1"));
    db.ref(`switcher/${game}/transition`).on("value",s=>{const v=s.val();if(v){fade.style.transitionDuration=`${v.duration||450}ms`;fade.classList.add("show");setTimeout(()=>fade.classList.remove("show"),(v.duration||450)+80)}});
    db.ref(`switcher/${game}/tbar`).on("value",s=>{const v=s.val()||{};tbarProgress=Math.max(0,Math.min(100,+v.progress||0));fade.style.transition="none";fade.style.opacity=String(tbarProgress<=50?tbarProgress/50:(100-tbarProgress)/50);if(!v.active||tbarProgress>=100){setTimeout(()=>{fade.style.opacity="";fade.style.transition="opacity .45s linear"},80)}});
    db.ref(`switcher/${game}/black`).on("value",s=>black.classList.toggle("show",!!s.val()));
    let overlayState={enabled:true},overlayOutputMode="master",overlayLayout={sizePct:28,position:"top-left",marginX:2,marginY:3},activeScene="game",interviewCfg={name:"",role:""},currentSport="baseball";
    const defaultOverlayUrl=()=>currentSport==="baseball"
      ? new URL("../overlay/index.html?embedded=1&game="+encodeURIComponent(game),location.href).href
      : new URL("../sports-overlay/index.html?embedded=1&game="+encodeURIComponent(game),location.href).href;
    const refreshOverlaySource=()=>{let url=(overlayState.url||"").trim();if(!url||/beisbol-overlay\.web\.app\/overlay\.html/i.test(url)||/sports-overlay\/index\.html/i.test(url)||/overlay\/index\.html/i.test(url))url=defaultOverlayUrl();if(overlay.src!==url)overlay.src=url;};
    const applyOverlayDocumentLayout=()=>{try{
      const d=overlay.contentDocument;if(!d||!d.body)return;
      d.documentElement.style.setProperty("background","transparent","important");
      d.body.style.setProperty("background","transparent","important");
      d.body.classList.add("v10-embedded","cam1-master-layout");
      const pct=Math.max(18,Math.min(45,+overlayLayout.sizePct||26));
      const mx=Math.max(0,Math.min(10,+overlayLayout.marginX||2));
      const my=Math.max(0,Math.min(10,+overlayLayout.marginY||3));
      const target=Math.min(520,Math.max(220,innerWidth*pct/100));
      const pos=overlayLayout.position||"top-left";
      const xSide=pos.includes("right")?`right:${mx}vw!important;left:auto!important;`:`left:${mx}vw!important;right:auto!important;`;
      const ySide=pos.includes("bottom")?`bottom:${my}vh!important;top:auto!important;`:`top:${my}vh!important;bottom:auto!important;`;
      let st=d.getElementById("v171-broadcast-layout");
      if(!st){st=d.createElement("style");st.id="v171-broadcast-layout";(d.head||d.documentElement).appendChild(st)}
      const baseball=!!d.getElementById("overlay-bar");
      if(baseball){
        const scale=target/1250;
        st.textContent=`html,body{margin:0!important;width:100vw!important;height:100vh!important;overflow:hidden!important;background:transparent!important}body.cam1-master-layout #overlay-root{position:fixed!important;inset:0!important;width:100vw!important;min-width:0!important;height:100vh!important;transform:none!important;animation:none!important;transition:none!important;filter:none!important}body.cam1-master-layout #overlay-scale{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;transform:none!important}body.cam1-master-layout #overlay-flex{position:static!important;display:block!important;width:auto!important}body.cam1-master-layout #overlay-bar{position:fixed!important;${xSide}${ySide}width:1250px!important;min-width:1250px!important;height:auto!important;transform:scale(${scale})!important;transform-origin:${pos.includes("right")?"top right":"top left"}!important;box-shadow:0 6px 18px rgba(0,0,0,.55)!important;z-index:1001!important}body.cam1-master-layout #overlay-bar::before{display:none!important}`;
      }else{
        const native=d.getElementById("native"),board=d.querySelector(".board");
        const baseWidth=board?.offsetWidth||960,scale=target/baseWidth;
        st.textContent=`html,body{margin:0!important;width:100vw!important;height:100vh!important;overflow:hidden!important;background:transparent!important}.native{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;padding:0!important;display:block!important;background:transparent!important}.board{position:fixed!important;${xSide}${ySide}width:${baseWidth}px!important;transform:scale(${scale})!important;transform-origin:${pos.includes("right")?"top right":"top left"}!important}`;
        if(native)native.style.display="block";
      }
    }catch(e){console.warn("Overlay integrado",e)}};
    const applyOverlayLayout=()=>{
      overlayViewport.style.inset="0";overlayViewport.style.width="100%";overlayViewport.style.height="100%";
      overlay.style.inset="0";overlay.style.width="100%";overlay.style.height="100%";overlay.style.transform="none";
      applyOverlayDocumentLayout();
    };
    const paintGraphics=()=>{const showMaster=overlayOutputMode!=="prism";overlayViewport.style.display=(showMaster&&overlayState.enabled!==false&&activeScene!=="clean"&&activeScene!=="interview")?"block":"none";const showInterview=showMaster&&activeScene==="interview"&&!!(interviewCfg.name||interviewCfg.role);lowerThirdName.textContent=interviewCfg.name||"ENTREVISTA";lowerThirdRole.textContent=interviewCfg.role||"";lowerThird.classList.toggle("show",showInterview);applyOverlayLayout()};
    db.ref(`switcher/${game}/broadcast/overlay`).on("value",snap=>{overlayState=snap.val()||{};refreshOverlaySource();paintGraphics()});
    db.ref(`switcher/${game}/sport/current`).on("value",snap=>{currentSport=snap.val()||"baseball";refreshOverlaySource();paintGraphics()});
    db.ref(`switcher/${game}/broadcast/outputMode`).on("value",snap=>{overlayOutputMode=snap.val()||"master";paintGraphics()});
    db.ref(`switcher/${game}/broadcast/overlayLayout`).on("value",snap=>{overlayLayout={...overlayLayout,...(snap.val()||{})};paintGraphics()});
    db.ref(`switcher/${game}/broadcast/activeScene`).on("value",snap=>{activeScene=snap.val()||"game";paintGraphics()});
    db.ref(`switcher/${game}/broadcast/sceneConfig/interview`).on("value",snap=>{interviewCfg={...interviewCfg,...(snap.val()||{})};paintGraphics()});
    db.ref(`switcher/${game}/broadcast/replayEnabled`).on("value",s=>{replayEnabled=!!s.val();replayEnabled?startBuffer(currentProgramStream()):stopBuffer();if(!replayEnabled)replayStatus({ready:false,bufferSeconds:0,message:"Modo frío"})});
    {const replayRef=db.ref(`switcher/${game}/broadcast/replayCommand`);replayRef.once("value").then(s=>{lastCommand=s.val()?.id||"";rt.classList.remove("show");rti.removeAttribute("src");rtv.removeAttribute("src");replayRef.on("value",s2=>{const c=s2.val();if(!c?.id||c.id===lastCommand)return;lastCommand=c.id;if(c.at&&+c.at<pageStartedAt-3000)return;c.action==="play"?playReplay(+c.start||0,+c.end||10,+c.speed||.5):c.action==="testTransition"?showTransition():finishReplay(false)})})}
    db.ref(`switcher/${game}/broadcast/replayTransition`).on("value",s=>transitionCfg={...transitionCfg,...(s.val()||{})});
    db.ref(`switcher/${game}/broadcast/mediaCommand`).on("value",s=>s.val()?.id&&media(s.val()));
    overlay.addEventListener("load",async()=>{forceOverlayTransparency();applyOverlayDocumentLayout();setTimeout(()=>{forceOverlayTransparency();applyOverlayDocumentLayout()},150);setTimeout(()=>{forceOverlayTransparency();applyOverlayDocumentLayout()},800);const snap=await db.ref(`switcher/${game}/broadcast/mediaCommand`).once("value");snap.val()&&media(snap.val())});
    addEventListener("resize",applyOverlayLayout);
    status("V18.1 · CAM1 MASTER LISTA",isInstalled()?"App instalada · inicia PRISM ScreenCast y vuelve aquí":"Instala la app para ocultar la barra de Chrome");showControls();
  }catch(e){
    infrastructureStarted=false;
    status("V18.1 · CÁMARA ACTIVA · INFRAESTRUCTURA PENDIENTE",e?.message||String(e));
    const st=$("setupStatus"); if(st) st.innerHTML='<span class="bad">La cámara funciona, pero Firebase/TURN falló: '+String(e?.message||e)+'</span>';
  }
}
async function boot(){
  $("setupStatus").textContent="Solicitando permiso de cámara…";
  localStream=await openLocalCamera();
  renderFit=$("fit").value;
  setRenderSource(local);
  resizeCanvas();
  if(!renderLoop)render();
  await requestWakeLock();
  $("setup").style.display="none";
  document.body.classList.toggle('app-installed',isInstalled());
  showControls();
  status("V18.1 · CAM1 VISIBLE", "Iniciando conexión…");
  startInfrastructure();
}
let deferredInstall=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstall=e;$('installPwa').style.display='block'});$('installPwa').onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();await deferredInstall.userChoice;deferredInstall=null;$('installPwa').style.display='none'};$('fullscreenBtn').onclick=goFullscreen;$('audioUnlockBtn').onclick=unlockAudio;if('serviceWorker' in navigator)navigator.serviceWorker.register('../service-worker.js?v=1810',{updateViaCache:'none'}).then(r=>r.update()).catch(e=>console.warn('SW',e));$('resetApp').onclick=async()=>{try{const regs=await navigator.serviceWorker?.getRegistrations?.();for(const r of regs||[])await r.unregister();const keys=await caches?.keys?.();for(const k of keys||[])await caches.delete(k);}catch{}sessionStorage.clear();location.reload(true)};const startButton=$("start");startButton.addEventListener("click",async()=>{if(startButton.disabled)return;startButton.disabled=true;startButton.textContent="ABRIENDO CÁMARA…";$("fatalPanel").style.display="none";$("setupStatus").textContent="Solicitando permiso de cámara…";try{await boot()}catch(e){showFatal(e?.stack||e?.message||e)}finally{startButton.disabled=false;startButton.textContent="INICIAR CAM1 MASTER"}});$("switchLocalCamera").addEventListener("click",async()=>{const b=$("switchLocalCamera");b.disabled=true;b.textContent="CAMBIANDO…";try{await openLocalCamera();if(program==="cam1")setRenderSource(local);for(const id of [...cameraPeers.keys()])closeCameraPeer(id);watchDirector();if(replayEnabled&&program==="cam1")startBuffer(localStream);status("V18.1 · CÁMARA CAMBIADA")}catch(e){showFatal(e?.message||e)}finally{b.disabled=false;b.textContent="CAMBIAR CÁMARA"}});$("cameraFacing").addEventListener("change",()=>{$("cameraSelect").value=""});$("fit").onchange=()=>renderFit=$("fit").value;window.addEventListener('resize',resizeCanvas);document.addEventListener('visibilitychange',async()=>{if(!document.hidden){await requestWakeLock();setTimeout(()=>recoverLocalCamera('regreso desde PRISM'),350)}});document.addEventListener('pointerdown',e=>{showControls();const now=Date.now();if(now-lastTapAt<380)goFullscreen();lastTapAt=now},{passive:true});document.addEventListener('pointermove',showControls,{passive:true});document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&!isInstalled())showControls()});window.addEventListener("beforeunload",()=>{clearTimeout(renderLoop);clearInterval(heartbeat);localStream?.getTracks().forEach(t=>t.stop());rawCaptureStream?.getTracks().forEach(t=>t.stop());try{voiceCtx?.close?.()}catch{}if(db)db.ref(`switcher/${game}/cameras/cam1`).update({online:false,updatedAt:firebase.database.ServerValue.TIMESTAMP})});
try{await devices()}catch{}
})();
