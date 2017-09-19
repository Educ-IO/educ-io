Flags = function() {

	/* <!-- DEPENDS on WINDOW, JQUERY & PURL to work, and initialise --> */

	/* <!-- Returns an instance of Flags if required --> */
	if (this && this._isF && this._isF(this.Flags)) {
		/* <!-- Set Container Reference to this --> */
		this.Flags = new this.Flags();
		return this.Flags;
	}

	/* <!-- Internal Variables --> */
	var _alert = false,
		_debug = false,
		_development = false,
		_page = false,
		_option = false,
		_highlight = false,
		_key = false,
		_oauth = false,
		_base, _dir;

	/* <!-- Internal Functions --> */
	var _parse = function() {

		/* <!-- Parse Url --> */
		var _url = $.url();

		/* <!-- Set Variables --> */
		_alert = (_url.param("alert") === "" || _url.fparam("alert") === "");
		if (_alert) window.onerror = function(m, u, l, c, o) {
			alert("Error: " + m + " Script: " + u + " Line: " + l + " Column: " + c + " Trace: " + o);
		};

		_debug = _alert ? _alert : (_url.param("debug") === "" || _url.fparam("debug") === "");
		if (_debug) window.onerror = function(m, u, l, c, o) {
			console.error("Error: " + m + " Script: " + u + " Line: " + l + " Column: " + c + " Trace: " + o);
		};

		_development = (_url.attr("host").split(".")[0] == "dev" || _url.param("dev") === "" || _url.fparam("dev") === "");

		_key = (_url.param("key") || _url.fparam("key"));

		_oauth = (_url.param("oauth") || _url.fparam("oauth"));

		_option = (_url.param("option") === "" || _url.fparam("option") === "");

		_highlight = (_url.param("highlight") || _url.fparam("highlight"));

		_page = (_url.param("page") === "" || _url.fparam("page") === "");

		_base = _url.attr("protocol") + "://" + _url.attr("host") +
			(_url.attr("port") && _url.attr("port") != 80 && _url.attr("port") != 443 ? ":" + _url.attr("port") : "") + "/";

		_dir = _url.attr("directory").replace(new RegExp("\\/", "g"), "");

		/* <!-- Load Remote Console Script Function --> */
		var _load = function(id) {
			return new Promise((resolve, reject) => {
				var script = document.createElement("script");
				script.onload = resolve;
				script.onerror = reject;
				script.src = "https://jsconsole.com/js/remote.js?" + id;
				document.getElementsByTagName("head")[0].appendChild(script);
			});
		};

		/* <!-- Return Promise --> */
		if (_url.param("remote") && _url.param("remote").length > 0) {
			return _load(_url.param("remote"));
		} else if (_url.fparam("remote") && _url.fparam("remote").length > 0) {
			return _load(_url.fparam("remote"));
		} else {
			return Promise.resolve();
		}

	};

	var _route = function(command, router) {

		var directive;

		if (command.indexOf(",") >= 1) {
			command = command.split(",");
			directive = command[0];
			command = command[1];
		}

		if (command.indexOf(".") >= 1) {
			router(directive, command.split("."));
		} else {
			router(directive, command);
		}

	};

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		initialise: function() {

			/* <!-- Call Parse Method internally --> */
			return _parse().then(function() {

				var _return = {

					alert: function() {
						return _alert;
					},

					full: function(path) {
						return _base + (path ? path : "");
					},

					debug: function() {
						return _debug;
					},

					development: function() {
						return _development;
					},

					dir: function() {
						return _dir;
					},

					error: function(message, exception) {
						_alert ? alert("ERROR - " + message + " : " + JSON.stringify(exception)) : console.log("ERROR - " + message, exception);
						return this;
					},

					log: function() {
						if (_debug && console) console.log.apply(console, arguments);
						return this;
					},

					time: function(name, end) {
						if (_debug && console) end ? console.timeEnd.apply(console, [name]) : console.time.apply(console, [name]);
						return this;
					},

					oauth: function() {
						return _oauth;
					},

					key: function() {
						return _key;
					},

					highlight: function() {
						return _highlight;
					},

					option: function() {
						return _option;
					},

					page: function() {
						return _page;
					},

					route: function(command, router) {

						_route(command, router);

					},

					change: function(router) {

						var command = window.location.hash;

						if (command) {

							if (command.indexOf("#") === 0) command = command.substring(1);

							if (command !== "!") {

								var _ignore = false;
								if (command.indexOf("!") === 0) {
									_ignore = true;
									command = command.substring(1);
								}

								if (!_ignore && window.history) {
									window.history.replaceState({
										command: command
									}, "", "#!");
								} else {
									window.location.hash = "!";
								}

								_route(command, router);

							}

						}

					},

				};

				return Promise.resolve(_return);

			});

		},

	};
	/* <!-- External Visibility --> */

};