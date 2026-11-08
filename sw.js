'use strict';
// Scope-specific, versioned static assets only. No form data enters this worker.
const PREFIX = 'expense-static:' + self.registration.scope + ':';
const CACHE = PREFIX + 'v2.0.0';
const CORE = ['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'].map(p=>new URL(p,self.registration.scope).href);
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)));
  // Deliberately no skipWaiting: updates activate after existing app tabs close.
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin || !CORE.includes(url.href)) return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request);
    if(cached) return cached;
    return fetch(event.request); // Never store arbitrary requests, queries or user data.
  }));
});
