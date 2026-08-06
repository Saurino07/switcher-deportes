const CACHE="director-broadcast-v1810";
const CORE=["./","./index.html","./manifest.webmanifest","../css/app.css?v=1900","../css/mobile-director-v190.css?v=1900","../js/director/mobile-console.js?v=1900"];
self.addEventListener("install",event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>null))});
self.addEventListener("activate",event=>event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith("director-broadcast-")&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener("fetch",event=>{if(event.request.method!=="GET")return;const u=new URL(event.request.url);if(u.origin!==location.origin)return;event.respondWith(fetch(event.request,{cache:"no-store"}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});return r}).catch(()=>caches.match(event.request).then(r=>r||caches.match("./index.html"))))});
