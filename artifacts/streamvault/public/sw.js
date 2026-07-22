/* RUHFLIX — data relay worker */
const _K=[82,117,104,118,97,97,110];
const _d=e=>e.map((c,i)=>String.fromCharCode(c^_K[i%_K.length])).join("");
const _T=_d([58,1,28,6,18,91,65,125,17,10,88,22,8,0,53,6,12,23,21,0,12,51,6,13,88,2,14,3,125,70]);
const _P="/rflix-data/";

self.addEventListener("install",e=>e.waitUntil(self.skipWaiting()));
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(u.pathname.startsWith(_P)){
    const tail=u.pathname.slice(_P.length)+u.search;
    e.respondWith(
      fetch(_T+"/"+tail,{headers:{Accept:"application/json"},credentials:"omit"})
        .then(r=>r.status===200?r:Response.error())
        .catch(()=>Response.error())
    );
  }
});
