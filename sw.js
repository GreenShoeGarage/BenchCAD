const CACHE_NAME = "benchcad-v0.37.0-first-class-sketch";
const APP_SHELL = [
  "./",
  "./index.html",
  "./assets/benchcad-v0.37.0.js",
  "./assets/benchcad-v0.37.0.css",
  "./assets/geometry.worker-BwAX3YFX.js",
  "./assets/import.worker-4ZIJcZ3b.js",
  "./assets/manifold-BE4c7gO-.wasm",
  "./favicon.svg",
  "./file.svg",
  "./globe.svg",
  "./manifest.webmanifest",
  "./window.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((name) => name.startsWith("benchcad-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put("./", response.clone()));
          return response;
        })
        .catch(() => caches.match("./index.html").then((match) => match || caches.match("./")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
      return response;
    }))
  );
});
