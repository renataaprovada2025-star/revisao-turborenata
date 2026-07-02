/* Service Worker — Revisão Turbo
   Estratégia: cache-first (offline-first). Funciona sem internet depois da 1ª visita. */
const CACHE = 'revisao-turbo-v21';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll falha se algum arquivo não existir; por isso usamos addAll tolerante
      .then((c) => Promise.allSettled(ASSETS.map((a) => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        // guarda no cache uma cópia das respostas válidas (mesma origem)
        try {
          const copy = resp.clone();
          if (resp.ok && new URL(e.request.url).origin === self.location.origin) {
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
        } catch (_) {}
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
