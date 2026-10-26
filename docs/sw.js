const CACHE_NAME = "arkham-xp-tracker-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./domain.js",
  "./class-icons.js",
  "./campaign-sigils.js",
  "./styles/arkham.css",
  "./data/campaign-snapshot.json",
  "./data/investigator-snapshot.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }
  // Campaign data lives in localStorage, but the app shell and catalog
  // snapshots are cache-first so the app works fully offline.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse !== undefined) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok && requestUrl.protocol.startsWith("http")) {
            const responseCopy = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
          return Response.error();
        });
    })
  );
});
