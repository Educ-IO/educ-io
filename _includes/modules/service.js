Service = function() {
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Service)) return new this.Service().initialise(this);
	
  /* <!-- Internal Variables --> */
	var ಠ_ಠ, _err = (window && window.console ? window.console.error : e => e);
	/* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
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
	
	var _notify = function(sw, urgency, details) {
						
		if (ಠ_ಠ.Display && !ಠ_ಠ._isF(ಠ_ಠ.Display)) ಠ_ಠ.Display.alert({
			type: urgency ? urgency : "info",
			headline: "New Version Available",
			message: details ? details.trim() : "",
			action: "Update",
			warning: "Updating will reload this app, and lose any un-saved work",
			target: "body"
		}).then(function(update) {
			if (sw && update) _message(sw, "update").then(
				m => {
					if (m == "success") window.location.reload();
				}
			);
		});

	};
	
	var _update = function(sw) {
					
		if (window.fetch) {

			fetch("/version.json?d=" + Date.now(), {cache: "no-store"}).then((response) => {

				if (response.status == 200) return response.json();

			}).then((version) => {

				var _details, _urgency = "info";
				if (version) {
					if (version.VERSION_TYPE == "security") {
						_urgency = "danger";
					} else if (version.VERSION_TYPE == "major") {
						_urgency = "warning";
					}
					if (version.VERSION_DETAILS) _details = version.VERSION_DETAILS + " [v" + version.APP_VERSION + "]";
					_notify(sw, _urgency, _details);
				}

			}).catch(() => _notify(sw));

		} else {

			_notify(sw);

		}

	};
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

        var _trackInstalling = function(sw) {
          sw.addEventListener("statechange", function() {
            if (sw.state == "installed") {
              _update(sw);
            }
          });
        };

        navigator.serviceWorker.register("/service.js").then(function(reg) {

          /* <!-- Loaded via SW --> */
          if (navigator.serviceWorker.controller) {

            var _check = function(_reg) {
              if (_reg.waiting) {
                _update(_reg.waiting);
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

          return;

        }).catch(e => _err("Service Worker NOT Registered:", e));

        document.onkeydown = function(e) {

          e = e || window.event;

          if (e.ctrlKey && e.altKey) {

            var k = e.which || e.keyCode;

            if (k == 82 || k == 76) {

              try {if (!ಠ_ಠ._isF(ಠ_ಠ.Display)) ಠ_ಠ.Display.busy();} catch (e) {_err(e);}

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

            } else if (k == 85) {
							
							_update("serviceWorker" in navigator ? navigator.serviceWorker.controller : null);
							
						}

          }
        };

      }
    },
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};