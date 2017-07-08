importScripts("cache-polyfill.js");

// example usage:
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("educ-io").then(function(cache) {
      return cache.addAll([
        "/",
        "/index.html",
        "/about/",
        "/cover/",
        "/folders/",
        "/labels/",
        "/markbooks/",
        "/nqt-easy/",
        "/transfer/",
        "/view/",
        "/script/app.js",
        "/script/flags.js",
        "/script/github.js",
        "/script/google.js",
        "/script/polyfills.js",
        "/script/setup.js"
      ]);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});