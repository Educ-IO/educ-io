---
  permalink: "/service.js"
---
importScripts("/script/cache-polyfill.js");

// -- Set the Version of the Application -- //
var CACHE_VERSION = "{{ site.version }}";

// -- Set-Up the Caches -- //
var CURRENT_CACHES = {
  static: "static-v" + CACHE_VERSION,
  dynamic: "dynamic-v" + CACHE_VERSION
};
{% assign imports = "" | split: "" %}{% for app in site.data.apps %}{% if app[1].imports and app[1].imports.size > 0 %}{% for import in app[1].imports %}{% assign _imports = import | split: ";" %}{% if _imports and _imports.size > 0 %}{% assign imports = _imports | concat: imports %}{% endif %}{% endfor %}{% endif %}{% endfor %}{% assign imports = imports | uniq %}{% assign scripts = "" | split: "" %}{% for app in site.data.apps %}{% if app[1].scripts and app[1].scripts.size > 0 %}{% for script in app[1].scripts %}{% assign _scripts = script | split: ";" %}{% if _scripts and _scripts.size > 0 %}{% assign scripts = _scripts | concat: scripts %}{% endif %}{% endfor %}{% endif %}{% endfor %}{% assign scripts = scripts | uniq %}
// == Caching Paths are Relative to the Script == //
var URLS = [
  {% for page in site.pages %}{% if page.layout != "app" and page.permalink != "/service.js" %}"{{ page.permalink }}",{% endif %}{% endfor %}
  {% for app in site.data.apps %}{% if app[1].ext != true %}"{{ app[1].link }}",{% endif %}{% endfor %}
  {% for import in imports %}{% if jekyll.environment == "debug" %}{% for import_script in site.data.imports[import].dev %}"{{ import_script.script }}",{% endfor %}{% else %}{% for import_script in site.data.imports[import].prod %}"{{ import_script.script }}",{% endfor %}{% endif %}{% endfor %}
  {% for script in scripts %}"/script/{{ script }}",{% endfor %}
  "https://fonts.googleapis.com/css?family={{ site.fonts }}", "{{ site.css.bootstrap }}"
]

// == Install Handler == //
self.addEventListener("install", function(event) {
  
  var now = Date.now();

  console.log("Service Worker Install, Pre-Caching Static Assets:", URLS);

  event.waitUntil(
    caches.open(CURRENT_CACHES.static).then(function(cache) {
      var promises = URLS.map(function(fetch_url) {
        var url = new URL(fetch_url, location.href);
        url.search += (url.search ? "&" : "?") + "timestamp=" + now;
        var request = new Request(url);
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
          if (response.status == 404) {
            return new Response ("Contrite Penquin");
          } else {
            return response;  
          }
          
        }).catch(function(e) {

          return new Response ("Contrite Penquin");
          console.error("Failed Fetch:", e);
          
        });
        
      }

    })
  );
});

// == Message Handler == //
self.addEventListener("message", function(event) {
  if (event.data.action == "update") {
    
    self.skipWaiting().then(function() {
      event.ports[0].postMessage("success");
    });
    
  } else if (event.data.action == "refresh") {
    
    var now = Date.now();
    
    caches.open(CURRENT_CACHES.static).then(function(cache) {
      var promises = URLS.map(function(fetch_url) {
        var url = new URL(fetch_url, location.href);
        url.search += (url.search ? "&" : "?") + "timestamp=" + now;
        var request = new Request(url);
        return fetch(request).then(function(response) {
          if (response.status >= 400) {
            throw new Error("Request for " + fetch_url + " failed with status " + response.statusText);
          }
          return cache.put(fetch_url, response);
        }).catch(function(e) {
          console.error("Failed to cache " + fetch_url + ":", e);
        });
      });
      return Promise.all(promises).then(function() {
        event.ports[0].postMessage("reload");
      });
    }).catch(function(e) {
      console.error("Failed to Refresh Cache:", e)
    });
    
  }
});
// == Message Handler == //
