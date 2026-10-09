// 德扑陪练台 service worker: page = network-first (updates arrive when online), assets = cache-first.
const VER = 'v1';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png', './icons/apple-touch-icon.png',
  './fonts/chakra-petch-latin-500-normal.woff2', './fonts/chakra-petch-latin-600-normal.woff2', './fonts/chakra-petch-latin-700-normal.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open('shell-' + VER).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== 'shell-' + VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (req.mode === 'navigate'){
    e.respondWith(fetch(req).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open('shell-' + VER).then(c => c.put('./index.html', copy)); }
      return res;
    }).catch(() => caches.match('./index.html', {ignoreSearch: true}).then(r => r || caches.match('./'))));
    return;
  }
  if (url.origin === location.origin){
    e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
      if (res.ok){ const copy = res.clone(); caches.open('shell-' + VER).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
