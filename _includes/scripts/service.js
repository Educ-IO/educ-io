var register_Worker = function() {

  const APP_VERSION = "{{ site.version }}";
  const VERSION_TYPE = "{% if site.data.versions[site.version] %}{{ site.data.versions[site.version].type }}{% endif %}";
  const VERSION_DETAILS = "{% if site.data.versions[site.version] %}{{ site.data.versions[site.version].details }}{% endif %}";

  if ("serviceWorker" in navigator) {

    var _message = function(sw, message) {

      return new Promise(function(resolve, reject) {

        if (!sw) reject();

        var channel = new MessageChannel();
        channel.port1.onmessage = function(e) {
          if (e.data.error) {
            reject(e.data.error);
          } else {
            resolve(e.data);
          }
        };

        sw.postMessage({
          action: message
        }, [channel.port2]);

      });

    };

    var _updateReady = function(sw) {

      if (window.global) {
        
        var _urgency, _details;

        if (VERSION_TYPE == "security") {
          _urgency = "danger";
        } else if (VERSION_TYPE == "major") {
          _urgency = "warning";
        } else {
          _urgency = "info";
        }

        if (VERSION_DETAILS) _details = VERSION_DETAILS + " [v" + APP_VERSION + "]";
        
        if (!window.global.interact) global.interact = Interact().initialise();

        global.interact.alert({
          type: _urgency,
          headline: "New Version Available",
          message: _details ? _details : "",
          action: "Update",
          target: "body"
        }).then(function(update) {
          if (update) _message(sw, "update").then(
            m => {
              if (m == "success") {

              }
            }
          );
        });
        
      } else {
        
        _message(sw, "update");
        
      }

    };

    var _trackInstalling = function(sw) {
      sw.addEventListener("statechange", function() {
        if (sw.state == "installed") {
          _updateReady(sw);
        }
      });
    };

    navigator.serviceWorker.register("/service.js").then(function(reg) {

      /* -- Loaded via SW -- */
      if (navigator.serviceWorker.controller) {
        
        var _check = function(_reg) {
          if (_reg.waiting) {
            _updateReady(_reg.waiting);
          } else if (_reg.installing) {
            _trackInstalling(_reg.installing);
          } else {
            _reg.addEventListener("updateFound", function() {
              _trackInstalling(_reg.waiting || _reg.installing);
            });
          }
          
        };
        
        /* Wait 5 seconds, then check for update! */
        setTimeout(function(){_check(reg);}, 5000);

        /* Handler Forced Refresh */
        navigator.serviceWorker.addEventListener("controllerChange", function() {
          window.location.reload();
        });

      }

      console.log("Service Worker Registered");

      return;

    }).catch(function(e) {

      console.log("Service Worker NOT Registered:", e);

    });

    document.onkeydown = function(e) {

      e = e || window.event;

      if (e.ctrlKey && e.altKey && e.keyCode == 82) {

        /* CTRL-ALT-R --> Force Cache Refresh and then reload */

        if (window.global) try {
          window.global.interact.busy();
        } catch (e) {}

        /* Pass request through to relevant service worker */
        navigator.serviceWorker.getRegistration(window.location.pathname).then(
          r => {
            if (r && r.active) _message(r.active, "refresh").then(
              m => {
                if (m == "reload") window.location.reload();
              }
            );
          }
        ).catch(function() {
          if (window.global) window.global.interact.busy({
            clear: true
          });
        });

      }
    };

  }
};