const CACHE_NAME = "arkham-xp-tracker-server-v1";
const APP_SHELL = [
  "/styles/arkham.css",
  "/pwa/manifest.webmanifest",
  "/pwa/icons/icon-192.png",
  "/pwa/icons/icon-512.png",
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
  // Static assets (styles, icons, faction/campaign art) are cache-first;
  // pages and API routes stay network-first so account data is fresh.
  const isStaticAsset =
    requestUrl.pathname.startsWith("/styles/") ||
    requestUrl.pathname.startsWith("/pwa/");
  if (!isStaticAsset) {
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse !== undefined) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseCopy = networkResponse.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, responseCopy));
        }
        return networkResponse;
      });
    })
  );
});
