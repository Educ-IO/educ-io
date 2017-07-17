(function() {
   
  if("serviceWorker" in navigator) {

    
    var _updateReady = function(sw) {
      
      if (!global.interact) global.interact = Interact().initialise();
      
      global.interact.alert("info", "New Version Available", "", "Refresh").then(function(update) {
        if (update) sw.postMessage({action: "Update"});
      });
      
    };
    
    var _trackInstalling = function(sw) {
      sw.addEventListener("statechange", function() {
        if (sw.state == "installed") {
          _updateReady(sw);
        }
      })
    };
    
    navigator.serviceWorker.register("/service.js").then(function(reg) {

      // -- Loaded via SW -- //
      if (navigator.serviceWorker.controller) {
        if (reg.waiting) {
          _updateReady(reg.waiting);
        } else if (reg.installing) {
          _trackInstalling(reg.installing);
        } else {
          reg.addEventListener("updateFound", function() {
            _trackInstalling(reg.installing);
          });
        }

        // Handler Forced Refresh
        navigator.serviceWorker.addEventListener("controllerChange", function() {
          window.location.reload();
        });
      }

      console.log("Service Worker Registered")

      return;

    }).catch(function(e) {

      console.log("Service Worker NOT Registered:", e);

    });
  }
})()