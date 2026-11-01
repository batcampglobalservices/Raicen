const CACHE = "edulearn-public-v2";
const PUBLIC = ["/offline.html", "/icon.svg", "/manifest.webmanifest"];
self.addEventListener("install", event => {
 event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC)));
 self.skipWaiting();
});
self.addEventListener("activate", event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("edulearn-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
 const url = new URL(event.request.url);
 if(event.request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
 if(event.request.mode === "navigate") {
  event.respondWith(fetch(event.request).catch(() => caches.match("/offline.html")));
 } else if(PUBLIC.includes(url.pathname)) {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
 }
});
