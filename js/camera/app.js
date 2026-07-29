(async () => {
  "use strict";
  const $ = id => document.getElementById(id);
  const game = Switcher.normalizeId(Switcher.qs("game", Switcher.app.defaultGame));
  const cam = Switcher.normalizeId(Switcher.qs("cam", "cam1"), "cam1");
  $("title").textContent = cam.toUpperCase();
  $("session").textContent = `Partido: ${game} · V11.2.0`;
  let db, stream, iceServers = [], heartbeat, devices = [], index = 0, signalRef;
  const peers = new Map(), answering = new Set();
  const log = message => $("log").textContent = `${new Date().toLocaleTimeString()} ${message}\n` + $("log").textContent.slice(0, 3500);
  function constraints() {
    const q = +$("quality").value, w = q === 720 ? 1280 : q === 540 ? 960 : 640;
    return {
      audio: $("audioEnabled").checked ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } : false,
      video: { width: { ideal: w }, height: { ideal: q }, frameRate: { ideal: q === 720 ? 15 : q === 540 ? 15 : 12, max: q === 720 ? 15 : q === 540 ? 15 : 12 }, deviceId: $("cameraSelect").value ? { exact: $("cameraSelect").value } : undefined, facingMode: { ideal: "environment" } }
    };
  }
  async function loadDevices() {
    devices = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === "videoinput");
    $("cameraSelect").innerHTML = devices.map((d, i) => `<option value="${d.deviceId}">${d.label || `Cámara ${i + 1}`}</option>`).join("");
  }
  function closePeer(id) {
    const peer = peers.get(id); if (!peer) return;
    try { peer.viewerCandidates.off(); peer.pc.close(); } catch {}
    peers.delete(id); $("viewers").textContent = `${peers.size} receptores`;
  }
  async function answer(viewerId, data) {
    if (!stream || !data?.offer || answering.has(viewerId) || peers.has(viewerId)) return;
    if (Number.isFinite(+data.createdAt) && Date.now() - (+data.createdAt) > (Switcher.app.signalingOfferMaxAgeMs || 120000)) return;
    answering.add(viewerId);
    let pc, viewerCandidates;
    try {
      const base = `switcher/${game}/cameraSignaling/${cam}/${viewerId}`;
      pc = new RTCPeerConnection(Switcher.peerConfig(iceServers));
      const queue = Switcher.makeIceQueue(pc);
      const senders = stream.getTracks().map(track => pc.addTrack(track, stream));
      const thermal = Switcher.app.thermal || {};
      const isDirector = data.role === "director";
      const videoSender = senders.find(x => x.track?.kind === "video");
      const audioSender = senders.find(x => x.track?.kind === "audio");
      const tuneSender = async (sender, values) => {
        if (!sender?.getParameters || !sender?.setParameters) return;
        try {
          const params = sender.getParameters();
          if (!params.encodings?.length) params.encodings = [{}];
          Object.assign(params.encodings[0], values);
          params.degradationPreference = "maintain-framerate";
          await sender.setParameters(params);
        } catch (e) { log(`Perfil de transmisión: ${e.message}`); }
      };
      pc.onicecandidate = event => event.candidate && db.ref(`${base}/cameraCandidates`).push(event.candidate.toJSON());
      viewerCandidates = db.ref(`${base}/viewerCandidates`);
      viewerCandidates.on("child_added", snap => snap.val() && queue.add(snap.val()));
      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) closePeer(viewerId);
        if (pc.connectionState === "disconnected") setTimeout(() => pc.connectionState === "disconnected" && closePeer(viewerId), 5000);
      };
      await pc.setRemoteDescription(data.offer);
      await queue.flush();
      await pc.setLocalDescription(await pc.createAnswer());
      await tuneSender(videoSender, isDirector ? {
        maxBitrate: thermal.directorVideoBitrate || 450000,
        maxFramerate: thermal.directorMaxFps || 12,
        scaleResolutionDownBy: thermal.directorScaleDown || 1.5
      } : {
        maxBitrate: thermal.broadcastVideoBitrate || 1200000,
        maxFramerate: thermal.broadcastMaxFps || 18,
        scaleResolutionDownBy: thermal.broadcastScaleDown || 1.5
      });
      await tuneSender(audioSender, { maxBitrate: thermal.audioBitrate || 48000 });
      peers.set(viewerId, { pc, viewerCandidates });
      await db.ref(`${base}/answer`).set({ type: pc.localDescription.type, sdp: pc.localDescription.sdp, createdAt: firebase.database.ServerValue.TIMESTAMP });
      $("viewers").textContent = `${peers.size} receptores`;
      log(`Director conectado (${viewerId.slice(-8)})`);
    } catch (error) {
      try { viewerCandidates?.off(); pc?.close(); } catch {}
      log(`Error receptor: ${error.message}`);
    } finally { answering.delete(viewerId); }
  }
  async function start() {
    try {
      $("start").disabled = true;
      iceServers = await Switcher.getIceServers({ game, role: "camera", clientId: cam });
      db = Switcher.initFirebase();
      stream = await navigator.mediaDevices.getUserMedia(constraints());
      $("preview").srcObject = stream;
      await loadDevices();
      signalRef = db.ref(`switcher/${game}/cameraSignaling/${cam}`);
      signalRef.on("child_added", snap => answer(snap.key, snap.val()));
      signalRef.on("child_removed", snap => { answering.delete(snap.key); closePeer(snap.key); });
      const presence = db.ref(`switcher/${game}/cameras/${cam}`);
      const beat = () => presence.update({ online: true, lastSeen: firebase.database.ServerValue.TIMESTAMP, battery: +($("battery").dataset.level || 0), network: navigator.connection?.effectiveType || "unknown", version: "11.2.0", audio: stream.getAudioTracks().length > 0 });
      await presence.onDisconnect().set({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
      await beat(); heartbeat = setInterval(beat, Switcher.app.cameraHeartbeatMs || 4000);
      db.ref(`switcher/${game}/program`).on("value", snap => {
        const on = snap.val() === cam; $("tally").classList.toggle("show", on);
        $("roleBadge").textContent = on ? "PROGRAM · AL AIRE" : "EN ESPERA";
        $("roleBadge").className = `badge ${on ? "program-badge" : ""}`;
      });
      db.ref(`switcher/${game}/preview`).on("value", snap => {
        if (snap.val() === cam && $("roleBadge").textContent !== "PROGRAM · AL AIRE") { $("roleBadge").textContent = "PREVIEW"; $("roleBadge").className = "badge preview-badge"; }
      });
      $("infra").textContent = "Firebase + TURN OK"; $("infra").className = "badge good";
      $("mainState").textContent = "EN LÍNEA"; $("mainState").className = "badge good"; $("stop").disabled = false;
      $("audioState").textContent = stream.getAudioTracks().length ? "Audio activo" : "Audio apagado";
      $("audioState").className = `badge ${stream.getAudioTracks().length ? "good" : ""}`;
      log("Cámara V11.2.0 iniciada");
    } catch (error) {
      $("mainState").textContent = "ERROR"; $("mainState").className = "badge bad"; $("start").disabled = false;
      log(`${error.name}: ${error.message}`);
    }
  }
  async function stop() {
    clearInterval(heartbeat); signalRef?.off(); [...peers.keys()].forEach(closePeer); stream?.getTracks().forEach(t => t.stop());
    if (db) await db.ref(`switcher/${game}/cameras/${cam}`).remove(); location.reload();
  }
  $("start").onclick = start; $("stop").onclick = stop;
  $("flip").onclick = async () => {
    if (!devices.length) await loadDevices(); if (!devices.length) return;
    index = (index + 1) % devices.length; $("cameraSelect").value = devices[index].deviceId;
    if (stream) {
      stream.getTracks().forEach(t => t.stop()); stream = await navigator.mediaDevices.getUserMedia(constraints()); $("preview").srcObject = stream;
      for (const peer of peers.values()) for (const kind of ["video", "audio"]) {
        const sender = peer.pc.getSenders().find(s => s.track?.kind === kind); const track = stream.getTracks().find(t => t.kind === kind) || null;
        if (sender) await sender.replaceTrack(track);
      }
    }
  };
  navigator.getBattery?.().then(battery => { const update = () => { $("battery").textContent = `Batería ${Math.round(battery.level * 100)}%`; $("battery").dataset.level = Math.round(battery.level * 100); }; update(); battery.onlevelchange = update; });
  $("network").textContent = `Red ${navigator.connection?.effectiveType || "desconocida"}`;
  await loadDevices().catch(() => {});
})();
