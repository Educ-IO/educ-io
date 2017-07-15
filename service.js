importScripts("/script/cache-polyfill.js");

var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  prefetch: "prefetch-cache-v" + CACHE_VERSION
};

// == Caching Paths are Relative to the Script == //
var URLS = [
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
      ]

// == Install Handler == //
self.addEventListener("install", function(event) {
  
  var now = Date.now();

  console.log("Service Worker Install, Pre-Caching:", URLS);

  event.waitUntil(
    caches.open(CURRENT_CACHES.prefetch).then(function(cache) {
      var promises = URLS.map(function(fetch_url) {
        var url = new URL(fetch_url, location.href);
        url.search += (url.search ? "&" : "?") + "timestamp=" + now;
        var request = new Request(url, {mode: "no-cors"});
        return fetch(request).then(function(response) {
          if (response.status >= 400) {
            throw new Error("Request for " + fetch_url + " failed with status " + response.statusText);
          }
          return cache.put(fetch_url, response);
        }).catch(function(e) {
          console.error("Failed to cache " + fetch_url + ":", e);
        });
      });
      return Promise.all(promises).then(function() {console.log("Completed Pre-Fetch")});
    }).catch(function(e) {console.error("Failed to Pre-Catch:", e)})
  );
});

// == Active Handler == //
self.addEventListener("activate", function(event) {
  
  var expected = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.map(function(name) {
          if (expected.indexOf(name) === -1) {
            console.log("Deleting Cache:", name);
            return caches.delete(name);
          }
        })
      );
    })
  );
});

// == Fetch Handler == //
self.addEventListener("fetch", function(event) {
  
  console.log("Handling fetch for:", event.request.url);

  event.respondWith(
    
    caches.match(event.request).then(function(response) {
      if (response) {
        
        console.log("Returning from cache:", response);
        return response;
      
      } else {
      
        console.log("Network Fetch");
        return fetch(event.request).then(function(response) {
          
          console.log("Network Response", response);
          return response;
          
        }).catch(function(e) {

          console.error("Failed Fetch:", e);
          throw error;
          
        });
        
      }

    })
  );
});
