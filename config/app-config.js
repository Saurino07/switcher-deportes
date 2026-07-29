window.SWITCHER_APP_CONFIG = {
  version: "11.4.0",
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
  replay: { maxSeconds: 30, segmentMs: 1000, maxSegments: 30, videoBitsPerSecond: 480000, previewBitsPerSecond: 320000 },
  thermal: { directorVideoBitrate: 240000, directorMaxFps: 8, directorScaleDown: 2, broadcastVideoBitrate: 650000, broadcastMaxFps: 12, broadcastScaleDown: 1.5, audioBitrate: 32000 },
  defaultOverlayUrl: "../overlay/index.html?embedded=1",
  overlayControlUrl: "https://beisbol-overlay.web.app/control.html"
};
