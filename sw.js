const CACHE="recipes-v3";
self.addEventListener("install",e=>{self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>clients.claim())
)});
self.addEventListener("fetch",e=>{
  const req=e.request;
  if(req.method!=="GET")return;
  const isHTML=req.mode==="navigate"||(req.headers.get("accept")||"").includes("text/html");
  if(isHTML){
    e.respondWith(
      fetch(req).then(res=>{
        if(res&&res.status===200){const c=res.clone();caches.open(CACHE).then(cache=>cache.put(req,c))}
        return res;
      }).catch(()=>caches.match(req).then(r=>r||caches.match("/")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(r=>r||fetch(req).then(res=>{
      if(res&&res.status===200){const c=res.clone();caches.open(CACHE).then(cache=>cache.put(req,c))}
      return res;
    }))
  );
});