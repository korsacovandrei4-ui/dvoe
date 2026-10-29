// Офлайн-оболочка приложения. Переписка сюда не попадает — её кэширует сама база (в зашифрованном виде).
const VERSION = 'd7b689244e6a';
const CACHE = 'dvoe-' + VERSION;
const ASSETS = ["./","app.js","apple-touch-icon.png","config.js","icon-192.png","icon-512.png","icon-maskable-512.png","icon.svg","index.html","manifest.webmanifest","style.css","unbounded-600-cyrillic.woff2","unbounded-600-latin.woff2"];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(req);
    } catch (e) {
      if (req.mode === 'navigate') {
        const shell = await cache.match('./');
        if (shell) return shell;
      }
      throw e;
    }
  })());
});
