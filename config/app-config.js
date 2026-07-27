window.SWITCHER_APP_CONFIG = {
  version: "9.0.3",
  turnEndpoint: "https://switcher-beisbol-turn.deporte-total.workers.dev/turn-credentials",
  defaultGame: "partido1",
  cameras: ["cam1", "cam2", "cam3"],
  cameraHeartbeatMs: 4000,
  cameraOfflineAfterMs: 16000,
  statsIntervalMs: 2000,
  reconnectBaseMs: 1200,
  reconnectMaxMs: 10000,
  connectionWatchdogMs: 18000,
  signalingOfferMaxAgeMs: 120000,
  iceTransportPolicy: "all",
  transitionMs: 450,
  replay: { maxSeconds: 30, segmentMs: 2000, maxSegments: 15, videoBitsPerSecond: 2200000 },
  defaultOverlayUrl: "https://beisbol-overlay.web.app/overlay.html",
  overlayControlUrl: "https://beisbol-overlay.web.app/control.html"
};
