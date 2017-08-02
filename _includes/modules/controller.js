Controller = function() {

	/* <!-- DEPENDS on JQUERY & HANDLEBARS to work, but not to initialise --> */
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Controller)) return new this.Controller().initialise(this);

	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var _, fonts_handled = false;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _removeClass = function(name) {
		var els = document.getElementsByClassName(name);
		while (els.length > 0) {els[0].classList.remove(name);}
	};
	
	var _inject = function(i, s, o, g, r, a, m) {

		a = s.createElement(o);
		a.setAttribute("id", g.id);
		a.setAttribute("data-type", "import");
		a.setAttribute("data-src", g.url);
		if (o == "style") m = s.getElementsByTagName(o)[0];
		a.appendChild(s.createTextNode(g.text));
		a.onload = r(g);
		if (m) {
			m.parentNode.insertBefore(a, m);
		} else {
			s.head.appendChild(a);
		}
		if (g.css === true && g.fonts === true) {
			try {
				for (var j = 0; j < a.sheet.cssRules.length; j++) {
					if (a.sheet.cssRules[j].type == 5) {
						if ("fontDisplay" in a.sheet.cssRules[j].style) {
							a.sheet.cssRules[j].style.fontDisplay = "block";
							_removeClass("font-sensitive");
							fonts_handled = true;
						}
					}
				}
				if (fonts_handled === false) {
					if ("fonts" in document) {
						document.fonts.ready.then(function(fontFaceSet) {
							_removeClass("font-sensitive");
							fonts_handled = true;
						});
					}
				}
			} catch (e) {
				console.error("ERROR SETTING FONT DISPLAY/API:", e);
			}
		}

	};

	var _include = function(url, type, id) {
		return new Promise((resolve, reject) => {
			var a = document.createElement(type);
			a.setAttribute("id", id);
			a.src = url;
			a.addEventListener("load", resolve);
			a.addEventListener("error", () => reject("Error loading script."));
			a.addEventListener("abort", () => reject("Script loading aborted."));
			document.head.appendChild(a);
		});
	};
	
	var _load = function(inputs, promise) {

		if (!(inputs && Array.isArray(inputs))) return Promise.reject(new TypeError("`inputs` must be an array"));
		if (promise && !(promise instanceof Promise)) return Promise.reject(new TypeError("`promise` must be a promise"));

		const resources = [];
		const deferreds = promise ? [].concat(promise) : [];
		const thenables = [];

		inputs = inputs.filter(input => document.getElementById(input.id) == null);

		inputs.forEach(input => {
			
			var is_css = !!input.url.match(/(\.|\/)css($|\?\S+)/gi);
			var is_fonts = !!input.url.match(/^https:\/\/fonts\.googleapis\.com\/css/gi);
			
			if (input.mode == "no-cors") {
				deferreds.push(_include(input.url, is_css ? "style" : "script", input.id));
			} else {
				deferreds.push(window.fetch(input.url, {mode: input.mode ? input.mode : "cors"}).then(res => {
					return [res.text(), input.id, input.url, is_css, is_fonts];
				}).then(promises => {
					return Promise.all(promises).then(resolved => {
						resources.push({
							text: resolved[0], id: resolved[1], url: resolved[2], css: resolved[3], fonts: resolved[4]
						});
					});
				}));
			}
		});

		return Promise.all(deferreds).then(() => {
			resources.forEach(resource => {
				thenables.push({
					then: resolve => {
						resource.css === true ? _inject(window, document, "style", resource, resolve) : _inject(window, document, "script", resource, resolve);
					}
				});
			});
			return Promise.all(thenables);
		});

	};
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		initialise: function(container) {

			/* <!-- Get Reference to Container --> */
			_ = container;
			
			/* <!-- Initialise Objects --> */
			if (_.Flags) _.Flags();
			if (_.Display) _.Display();
			if (_.Service) _.Service();
			if (_.Main) _.Main();
			
			/* <!-- Set Container Reference to this --> */
			container.Controller = this;

			/* <!-- Return for Chaining --> */
			return this;

		},
		
		load : function(inputs, promise) {

			return _load(inputs, promise);
		},
		
		start : function() {

			var _finalise = function(result) {
				if (result === true) {
					if (fonts_handled === false) _removeClass("font-sensitive");
					if (_.Main) _.Main.start();	
				}
			};

			var _proceed = function(result) {
				if (result === true) {
					if (_.templates) _.templates();
					if (_.SETUP && _.SETUP.SERVICE && _.Service) _.Service.register();
				}
				if (_.IMPORTS.LOAD_AFTER) {
					_load(_.IMPORTS.LOAD_AFTER).then(() => {_finalise(true);}).catch(e => {console.error(e); _finalise(true);});
				} else {
					_finalise(true);
				}
			};

			var _start = function(result, next) {
				if (result === true) {
					if (next) _load(next).then(() => {_proceed(true);}).catch(e => {console.error(e);_proceed(false);});
					_removeClass("css-sensitive");
					if (_.App && _.App.route) _.App.route(false);
				}
			};
			
			if (_.IMPORTS.LOAD_FIRST && _.IMPORTS.LOAD_LAST) {
				_load(_.IMPORTS.LOAD_FIRST).then(() => {_start(true, _.IMPORTS.LOAD_LAST);}).catch(e => {console.error(e);_proceed(false);});
			} else if (_.IMPORTS.LOAD_FIRST || _.IMPORTS.LOAD_LAST) {
				_load(_.IMPORTS.LOAD_FIRST || _.IMPORTS.LOAD_LAST).then(() => {_start(true); _proceed(true);}).catch(e => {console.error(e);_start(false);_proceed(false);});
			} else {
				_proceed(true);
			}
		
		},
		/* <!-- External Functions --> */

	};
	/* <!-- External Visibility --> */
};