const CACHE="director-broadcast-v2500";
const CORE=["./","./index.html","./mobile-v250.html","./manifest.webmanifest","../css/director-mobile-v250.css?v=2500","../js/director/mobile-v250.js?v=2500"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>null));});
self.addEventListener("activate",e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("director-broadcast-")&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;
  if(e.request.mode==="navigate"||/\.(?:html|js|css|webmanifest)$/.test(u.pathname)){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./mobile-v250.html"))));return;
  }
  e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
});