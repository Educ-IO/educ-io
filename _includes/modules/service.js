Service = function() {
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Service)) return new this.Service().initialise(this);
	
	/* <!-- Internal Constants --> */
  const APP_VERSION = "{{ site.data.versions.site.first[0] }}";
  const VERSION_TYPE = "{{ site.data.versions.site.first[1].type }}";
  const VERSION_DETAILS = "{{ site.data.versions.site.first[1].desc }}";
	/* <!-- Internal Constants --> */
	
  /* <!-- Internal Variables --> */
	var ಠ_ಠ;
	/* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container) {
			
			/* <!-- Get a reference to the Interact Module --> */
			ಠ_ಠ = container;
			
			/* <!-- Set Container Reference to this --> */
			container.Service = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
    
		register : function() {

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

					var _urgency, _details = "";

					if (VERSION_TYPE == "security") {
						_urgency = "danger";
					} else if (VERSION_TYPE == "major") {
						_urgency = "warning";
					} else {
						_urgency = "info";
					}

					if (VERSION_DETAILS) _details = VERSION_DETAILS + " [v" + APP_VERSION + "]";

					if (ಠ_ಠ.Display && !ಠ_ಠ._isF(ಠ_ಠ.Display)) ಠ_ಠ.Display.alert({
						type: _urgency,
						headline: "New Version Available",
						message: _details ? _details.trim() : "",
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

        };

        var _trackInstalling = function(sw) {
          sw.addEventListener("statechange", function() {
            if (sw.state == "installed") {
              _updateReady(sw);
            }
          });
        };

        navigator.serviceWorker.register("/service.js").then(function(reg) {

          /* <!-- Loaded via SW --> */
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

            /* <!-- Wait 3 seconds, then check for update! --> */
            setTimeout(function(){_check(reg);}, 3000);

            /* <!-- Handler Forced Refresh --> */
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

          if (e.ctrlKey && e.altKey) {

            var k = e.which || e.keyCode;

            if (k == 82 || k == 76) {

              try {if (!ಠ_ಠ._isF(ಠ_ಠ.Display)) ಠ_ಠ.Display.busy();} catch (e) {}

              var _clear = function() {
                if (!ಠ_ಠ._isF(ಠ_ಠ.Display)) ಠ_ಠ.Display.busy({
                  clear: true
                });
              };

              if (k == 82) {

                /* <!-- CTRL-ALT-R --> Force Cache Refresh and then reload --> */
                navigator.serviceWorker.getRegistration(window.location.pathname).then(
                  r => {
                    if (r && r.active) _message(r.active, "refresh").then(
                      m => {
                        if (m == "reload") window.location.reload();
                      }
                    );
                  }
                ).catch(_clear);

              }  else if (k == 76) {

                /* <!-- CTRL-ALT-L --> List Cache Objects --> */
                navigator.serviceWorker.getRegistration(window.location.pathname).then(
                  r => {
                    if (r && r.active) _message(r.active, "list-cache-items").then(_clear);
                  }
                ).catch(_clear);

              }

            }

          }
        };

      }
    },
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};