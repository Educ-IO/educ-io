importScripts("/script/cache-polyfill.js");

// == Caching Paths are Relative to the Script == //
self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open("educ-io").then(function(cache) {
      return cache.addAll([
        "/",
        "/index.html",
        "/about/",
        "/about/index.html",
        "/cover/",
        "/cover/index.html",
        "/folders/",
        "/folders/index.html",
        "/labels/",
        "/labels/index.html",
        "/markbooks/",
        "/markbooks/index.html",
        "/nqt-easy/",
        "/nqt-easy/index.html",
        "/transfer/",
        "/transfer/index.html",
        "/view/",
        "/view/index.html",
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