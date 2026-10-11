var CACHE = "tracker-v7";
var FILES = ["./", "index.html", "manifest.json", "icon-192.png", "icon-512.png"];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (names) {
    return Promise.all(names.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

// Try the network first so updates show up; use the saved copy only when offline.
// Requests to other sites (like Supabase) are left alone.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || e.request.url.indexOf(self.location.origin) !== 0) { return; }
  e.respondWith(
    fetch(e.request).then(function (r) {
      var copy = r.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return r;
    }).catch(function () { return caches.match(e.request); })
  );
});
