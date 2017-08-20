/* <!--
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
--> */
(function() {
  var nativeAddAll = Cache.prototype.addAll;
  var userAgent = navigator.userAgent.match(/(Firefox|Chrome)\/(\d+\.)/);

  /* <!-- Has nice behavior of `var` which everyone hates --> */
  var agent, version;
  if (userAgent) {
    agent = userAgent[1];
    version = parseInt(userAgent[2]);
  }

  if (
    nativeAddAll && (!userAgent ||
      (agent === 'Firefox' && version >= 46) ||
      (agent === 'Chrome'  && version >= 50)
    )
  ) {
    return;
  }

  Cache.prototype.addAll = function addAll(requests) {
    var cache = this;

    /* <!-- Since DOMExceptions are not constructable: --> */
    function NetworkError(message) {
      this.name = 'NetworkError';
      this.code = 19;
      this.message = message;
    }

    NetworkError.prototype = Object.create(Error.prototype);

    return Promise.resolve().then(function() {
      if (arguments.length < 1) throw new TypeError();

      /* <!-- Simulate sequence<(Request or USVString)> binding: --> */
      var sequence = [];

      requests = requests.map(function(request) {
        if (request instanceof Request) {
          return request;
        }
        else {
          return String(request); /* <!--  may throw TypeError --> */
        }
      });

      return Promise.all(
        requests.map(function(request) {
          if (typeof request === 'string') {
            request = new Request(request);
          }

          var scheme = new URL(request.url).protocol;

          if (scheme !== 'http:' && scheme !== 'https:') {
            throw new NetworkError("Invalid scheme");
          }

          return fetch(request.clone());
        })
      );
    }).then(function(responses) {
      /* <!-- If some of the responses has not OK-eish status, then whole operation should reject --> */
      if (responses.some(function(response) {
        return !response.ok;
      })) {
        throw new NetworkError('Incorrect response status');
      }

      /* <!-- TODO: check that requests don't overwrite one another (don't think this is possible to polyfill due to opaque responses) --> */
      return Promise.all(
        responses.map(function(response, i) {
          return cache.put(requests[i], response);
        })
      );
    }).then(function() {
      return undefined;
    });
  };

  Cache.prototype.add = function add(request) {
    return this.addAll([request]);
  };
}());
/* <!-- --> */
/* <!-- Set the Version of the Application --> */
var CACHE_VERSION = "{{ site.data.versions.Site.first[0] }}";

/* <!-- Set-Up the Caches --> */
var CURRENT_CACHES = {
  static: "static-v" + CACHE_VERSION,
  dynamic: "dynamic-v" + CACHE_VERSION
};

/*jshint ignore:start*/
{% assign imports = "" | split: "" %}
{% for app in site.data.apps %}
  {% if app[1].imports and app[1].imports.size > 0 %}
    {% assign names = app[1].imports | map: "name" %}
    {% assign imports = names | concat: imports %}
  {% endif %}
{% endfor %}
{% assign imports = imports | uniq %}

{% assign fonts = "" %}{% for font in site.data.fonts %}{% if forloop.first %}{% assign fonts = fonts | append: font[1].safe | append: ":" | append: font[1].weights %}{% else %}{% assign fonts = fonts | append: "|" | append: font[1].safe | append: ":" | append: font[1].weights %}{% endif %}{% endfor %}
var FONT_URL = "https://fonts.googleapis.com/css";
var URLS = [
  {% for page in site.pages %}{% if page.layout != "app" and page.permalink != "/service.js" %}{url : "{{ page.permalink }}"},{% endif %}{% endfor %}
  {% for app in site.data.apps %}{% if app[1].ext != true %}{url : "{{ app[1].link }}"},{% endif %}{% endfor %}
  {% for import in imports %}{% if jekyll.environment == "debug" %}{% for import_script in site.data.imports[import].dev %}{ {% if import_script.mode %}mode : "{{ import_script.mode }}", {% endif %}url : "{{ import_script.url }}" },{% endfor %}{% else %}{% for import_script in site.data.imports[import].prod %}{ {% if import_script.mode %}mode : "{{ import_script.mode }}", {% endif %}url : "{{ import_script.url }}" },{% endfor %}{% endif %}{% endfor %}
  {url : FONT_URL + "?family={{ fonts }}"}
];
/*jshint ignore:end*/

/* <!-- Get Caching Promises --> */
var cache_Promises = function(now, cache) {
  return URLS.map(function(fetch_url) {
    var url = new URL(fetch_url.url, location.href);
    url.search += (url.search ? "&" : "?") + "timestamp=" + now;
    var _fetch = function(url, fetch_mode) {
      var request = new Request(url, {mode: fetch_mode ? fetch_mode : "cors"});
      return fetch(request).then(function(response) {
        if (response.status >= 400) {
          throw new Error("Request for " + url.href + " failed with status " + response.statusText);
        }
        var font = !!url.href.match(/^https:\/\/fonts\.googleapis\.com\/css/gi);
        if (font) {
          response.clone().text().then(function (text) {
            var css_regex = /url\(['"\s]*(\S+)['"\s]*\)/gi;
            var css_urls;
            while ((css_urls = css_regex.exec(text)) !== null) {
              if (css_urls && css_urls[1]) {
                var css_url = new URL(css_urls[1], location.href);
                css_url.search += (css_url.search ? "&" : "?") + "timestamp=" + now;
                fetch(new Request(css_url, {mode: fetch_mode ? fetch_mode : "cors"})).then(function(css_response) {
                  if (css_response.status < 400) {
                    cache.put(css_response.url.split("?")[0], css_response);
                  }
                });
              }
            }
          });
        }
        return cache.put(fetch_url.url, response);
      }).catch(function(e) {
        if (!fetch_mode)  {
           console.error("Failed to cache (trying no-cors) " + fetch_url.url + ":", e);  
          return _fetch(url, "no-cors");
        } else {
          console.error("Failed to cache " + fetch_url.url + ":", e);  
        }
      });
    };
    _fetch(url, fetch_url.mode);
  });
};

/* <!-- Install Handler --> */
self.addEventListener("install", function(event) {
  
  var now = Date.now();

  console.log("Service Worker Install, Pre-Caching Static Assets:", URLS);

  event.waitUntil(
    caches.open(CURRENT_CACHES.static).then(function(cache) {
      return Promise.all(cache_Promises(now, cache)).then(function() {console.log("Completed Pre-Fetch")});
    }).catch(function(e) {console.error("Failed to Pre-Catch:", e)})
  );
  
});

/* <!-- Active Handler --> */
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

/* <!-- Fetch Handler --> */
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

          console.error("Failed Fetch:", e);
          return new Response ("Contrite Penquin");
          
        });
        
      }

    })
  );
});

/* <!-- Message Handler  --> */
self.addEventListener("message", function(event) {
  
  if (event.data.action == "update") {
    
    self.skipWaiting().then(function() {
      event.ports[0].postMessage("success");
    });
    
  } else if (event.data.action == "refresh") {
    
    var now = Date.now();
    
    caches.open(CURRENT_CACHES.static).then(function(cache) {
      cache.keys().then(function(keys) {
        keys.forEach(function(request, index, array) {
          cache.delete(request);
        });
        return Promise.all(cache_Promises(now, cache)).then(function() {
          event.ports[0].postMessage("reload");
        });
      });
    }).catch(function(e) {
      console.error("Failed to Refresh Cache:", e)
    });
  
  } else if (event.data.action == "list-cache-items") {
    
    caches.keys().then(function(names) {
      console.log("FOUND CACHES:", names);
      return Promise.all(
        names.map(function(name) {
          console.log("OPENING CACHE:", name);
          caches.open(name).then(function(cache) {
            cache.keys().then(function(keys) {
              console.log("GOT CACHE KEYS:", keys);
            });
          });
        })
      );
    }).then(function() {event.ports[0].postMessage("done");}).catch(function(e) {
      console.error("Failed to Enumerate Cache:", e)
    });
    
  }
});
/* <!-- Message Handler --> */