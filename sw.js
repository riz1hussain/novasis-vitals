/* Novasis Vitals - lets the app open with no internet.
   Pages and scripts are saved the first time they load and reused when offline. */
const CACHE = "novasis-v2";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["novasis_db.html","manifest.json","icon-192.png","icon-512.png"]).catch(() => {}))); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if(req.method !== "GET") return;
  if(url.hostname.endsWith("supabase.co")) return;                         // data calls are never cached
  const cacheable = url.origin === location.origin || /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(url.hostname);
  if(!cacheable) return;
  e.respondWith(fetch(req).then(res => {
    if(res && (res.ok || res.type === "opaque")){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === "navigate" ? caches.match("novasis_db.html", { ignoreSearch: true }) : Response.error()))));
});
