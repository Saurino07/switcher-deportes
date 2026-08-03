(() => {
  "use strict";
  const fb = window.SWITCHER_FIREBASE_CONFIG || {};
  const app = window.SWITCHER_APP_CONFIG || {};
  const qs = (name, fallback = "") => new URLSearchParams(location.search).get(name) || fallback;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function normalizeId(value, fallback = "partido1") {
    let s = String(value || fallback).toLowerCase().trim();
    if (/^[123]$/.test(s)) s = `cam${s}`;
    return s.replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").slice(0, 48) || fallback;
  }
  function randomId(prefix = "id") {
    const id = crypto.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    return `${prefix}-${id}`.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 80);
  }
  function assertConfigured() {
    const missing = Object.entries(fb).filter(([, v]) => !v || String(v).startsWith("PEGAR_")).map(([k]) => k);
    if (missing.length) throw new Error(`Falta configurar Firebase: ${missing.join(", ")}`);
    if (!app.turnEndpoint || String(app.turnEndpoint).startsWith("PEGAR_")) throw new Error("Falta configurar TURN");
  }
  function initFirebase() {
    assertConfigured();
    if (!firebase.apps.length) firebase.initializeApp(fb);
    return firebase.database();
  }
  function getAccessCode() {
    const urlCode = (new URLSearchParams(location.search).get("code") || "").trim();
    if (urlCode) {
      sessionStorage.setItem("switcherAccessCode", urlCode);
      localStorage.setItem("switcherAccessCode", urlCode);
      return urlCode;
    }
    const code = (sessionStorage.getItem("switcherAccessCode") || localStorage.getItem("switcherAccessCode") || "").trim();
    if (!code) throw new Error("Falta el código privado. Abre primero CAM1 Master desde la URL completa con ?code=TU_CODIGO y vuelve a instalar la aplicación.");
    sessionStorage.setItem("switcherAccessCode", code);
    return code;
  }
  async function getIceServers({ game, role, clientId }) {
    const accessCode = getAccessCode();
    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(app.turnEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Switcher-Code": accessCode },
          body: JSON.stringify({ game, role, clientId }),
          signal: controller.signal,
          cache: "no-store"
        });
        const text = await response.text();
        if (!response.ok) throw new Error(`TURN HTTP ${response.status}: ${text}`);
        let data;
        try { data = JSON.parse(text); } catch { throw new Error("Respuesta TURN no es JSON válido"); }
        if (!Array.isArray(data.iceServers) || !data.iceServers.length) throw new Error("Respuesta TURN sin servidores ICE");
        return data.iceServers;
      } catch (error) {
        lastError = error;
        if (attempt < 2) await sleep(900);
      } finally { clearTimeout(timeout); }
    }
    throw lastError || new Error("No fue posible obtener credenciales TURN");
  }
  function peerConfig(iceServers) {
    return {
      iceServers,
      iceTransportPolicy: app.iceTransportPolicy || "all",
      bundlePolicy: "max-bundle",
      rtcpMuxPolicy: "require",
      iceCandidatePoolSize: 2
    };
  }
  function makeIceQueue(pc) {
    const pending = [];
    return {
      async add(candidate) {
        if (!candidate) return;
        if (pc.remoteDescription) {
          try { await pc.addIceCandidate(candidate); } catch (e) { console.warn("ICE rechazado", e); }
        } else pending.push(candidate);
      },
      async flush() {
        while (pending.length) {
          try { await pc.addIceCandidate(pending.shift()); } catch (e) { console.warn("ICE pendiente rechazado", e); }
        }
      }
    };
  }
  function waitForIceGatheringComplete(pc, timeoutMs = 12000) {
    if (pc.iceGatheringState === "complete") return Promise.resolve();
    return new Promise(resolve => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        pc.removeEventListener("icegatheringstatechange", onChange);
        resolve();
      };
      const onChange = () => pc.iceGatheringState === "complete" && finish();
      const timer = setTimeout(finish, timeoutMs);
      pc.addEventListener("icegatheringstatechange", onChange);
    });
  }
  async function setSenderProfile(sender, profile = {}) {
    if (!sender) return;
    try {
      const params = sender.getParameters();
      if (!params.encodings?.length) params.encodings = [{}];
      const encoding = params.encodings[0];
      if (+profile.maxBitrate) encoding.maxBitrate = +profile.maxBitrate;
      if (+profile.maxFramerate) encoding.maxFramerate = +profile.maxFramerate;
      encoding.scaleResolutionDownBy = Math.max(1, +profile.scaleResolutionDownBy || 1);
      params.degradationPreference = "maintain-framerate";
      await sender.setParameters(params);
    } catch (e) { console.warn("Perfil de salida no aplicado", e); }
  }
  function makeStatsReader(pc, callback) {
    let bytes = 0, time = 0;
    const timer = setInterval(async () => {
      try {
        let inbound, pair;
        (await pc.getStats()).forEach(r => {
          if (r.type === "inbound-rtp" && r.kind === "video" && !r.isRemote) inbound = r;
          if (r.type === "candidate-pair" && r.state === "succeeded" && r.nominated) pair = r;
        });
        let bitrate = 0;
        if (inbound && time) bitrate = (inbound.bytesReceived - bytes) * 8000 / (inbound.timestamp - time);
        if (inbound) { bytes = inbound.bytesReceived; time = inbound.timestamp; }
        callback({ bitrate, fps: inbound?.framesPerSecond || 0, width: inbound?.frameWidth || 0, height: inbound?.frameHeight || 0, rtt: pair?.currentRoundTripTime != null ? pair.currentRoundTripTime * 1000 : NaN });
      } catch {}
    }, app.statsIntervalMs || 2000);
    return () => clearInterval(timer);
  }
  const formatBps = v => !v ? "0 kbps" : v >= 1e6 ? `${(v / 1e6).toFixed(2)} Mbps` : `${Math.round(v / 1e3)} kbps`;
  async function safeRemove(ref) { try { await ref.remove(); } catch {} }
  window.Switcher = { app, fb, qs, sleep, normalizeId, randomId, initFirebase, getAccessCode, getIceServers, peerConfig, makeIceQueue, waitForIceGatheringComplete, setSenderProfile, makeStatsReader, formatBps, safeRemove };
})();
