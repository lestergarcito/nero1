const CACHE_NAME = "nero-studio-v3";
const APP_FILES = [
  "./", "./index.html", "./styles.css", "./app.js", "./manifest.json",
  "./assets/nero-icon-192.png", "./assets/nero-icon-512.png",
  "./assets/nero-icon-maskable-512.png",
  "./assets/product-1.jpg", "./assets/product-2.jpg", "./assets/product-3.jpg", "./assets/product-4.jpg",
  "./assets/product-5.jpg", "./assets/product-6.jpg", "./assets/product-7.jpg", "./assets/product-8.jpg"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  // Para documentos: intenta red primero para recibir actualizaciones; usa caché sin conexión.
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
          return response;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Para CSS, JS, iconos e imágenes: caché primero y actualiza desde red.
  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        }
        return response;
      });
      return cached || network;
    })
  );
});
