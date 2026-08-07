const CACHE="switcher-v2400";
const SHELL=["./","./index.html","./manifest.webmanifest","./assets/icons/cam1-master.svg"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  const req=event.request;
  const url=new URL(req.url);
  if(req.mode==="navigate" || /\.(?:html|js|css|json|webmanifest)$/.test(url.pathname)){
    event.respondWith(fetch(req,{cache:"no-store"}).then(res=>res).catch(()=>caches.match(req).then(r=>r||caches.match("./index.html"))));
    return;
  }
  event.respondWith(caches.match(req).then(hit=>hit||fetch(req).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy));return res;})));
});
