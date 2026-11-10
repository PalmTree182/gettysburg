/* Offline cache for the Gettysburg field guide: the page, its libraries, fonts and any map tiles already viewed. */
const C = "gb-v3";
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"]).catch(() => {})).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== C).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url), page = u.origin === location.origin;
  if (!page && !/cdnjs\.cloudflare\.com|fonts\.(googleapis|gstatic)\.com|tile\.openstreetmap\.org/.test(u.hostname)) return;
  e.respondWith(caches.open(C).then(async c => {
    const hit = await c.match(r, { ignoreSearch: page });
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === "opaque")) c.put(r, res.clone()); return res; }).catch(() => hit);
    return page ? (await net) || hit : hit || net;   // page: newest first; libraries and tiles: cached first
  }));
});
