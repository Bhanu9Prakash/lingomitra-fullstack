const CACHE_NAME='lingomitra-static-v3';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.add('/offline.html')).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('lingomitra-')&&key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);
 // Never intercept or cache identity, OAuth navigation, or learner API responses.
 if(url.origin!==self.location.origin||request.method!=='GET'||url.pathname.startsWith('/api/')||['/signin-with-chatgpt','/signout-with-chatgpt','/callback'].includes(url.pathname))return;
 if(request.mode==='navigate'){event.respondWith(fetch(request).catch(async()=>await caches.match('/offline.html')||new Response('Connect to the internet to continue learning.',{status:503})));return;}
 if(/^\/(assets|flags|icons)\//.test(url.pathname)||/^\/mascot-[a-z]+\.png$/.test(url.pathname))event.respondWith(caches.open(CACHE_NAME).then(async cache=>{
  const cached=await cache.match(request);if(cached)return cached;const response=await fetch(request);if(response.ok&&!response.redirected)await cache.put(request,response.clone());return response;
 }));
});
