// Service worker di Spese Tracker
// - pagine del sito: prima la rete (così vedi sempre l'ultima versione), copia salvata solo se sei offline
// - font e icone dai CDN: dalla copia salvata (non cambiano mai)
// - Firebase non viene mai toccato
const CACHE = 'spese-v1';
const CDN = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  if(url.origin === location.origin){
    e.respondWith(
      fetch(req).then(res => {
        if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match('./')))
    );
  } else if(CDN.includes(url.hostname)){
    e.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(res => {
        if(res.ok || res.type === 'opaque'){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
});
