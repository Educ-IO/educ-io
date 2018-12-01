Controller = function() {

	/* <!-- DEPENDS on JQUERY & HANDLEBARS to work, but not to initialise --> */
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Controller)) return new this.Controller().initialise(this);

	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, fonts_handled = false, err = (window && window.console ? window.console.error : e => e);
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
		if (o == "style") m = s.getElementsByTagName(o)[0]; else if (o == "script") a.setAttribute("aria-hidden", "true");
		var t = g.text;
		if (g.map === true) {
			var map_regex = /[/*|//]#[\s]*sourceMappingURL=(\S+)[\s]*[*/]?/gi, map_urls;
			while ((map_urls = map_regex.exec(t)) !== null) {
				if (map_urls && map_urls[1]) {
					var map_url = new URL(map_urls[1], g.url);
					var _s = map_urls.index + map_urls[0].indexOf(map_urls[1]);
					t = t.substr(0, _s) + map_url.href + t.substr(_s + map_urls[1].length);
				}
			}
		}
		if (g.overrides) for (var j = 0; j < g.overrides.length; j++) t = t.replace(g.overrides[j].replace, g.overrides[j].with);
		a.appendChild(s.createTextNode(t));
		a.onload = r(g);
		if (m) {
			m.parentNode.insertBefore(a, m);
		} else {
			s.head.appendChild(a);
		}
		if (g.css === true && g.fonts === true) {
			try {
				for (var k = 0; k < a.sheet.cssRules.length; k++) {
					if (a.sheet.cssRules[k].type == 5) {
						if ("fontDisplay" in a.sheet.cssRules[k].style) {
							a.sheet.cssRules[k].style.fontDisplay = "block";
							_removeClass("font-sensitive");
							fonts_handled = true;
						}
					}
				}
				if (fonts_handled === false) {
					if ("fonts" in document) {
						document.fonts.ready.then(function() {
							_removeClass("font-sensitive");
							fonts_handled = true;
						});
					}
				}
			} catch (e) { 
				err("ERROR SETTING FONT DISPLAY/API:", e);
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
				deferreds.push(window.fetch(input.url, {mode: input.mode ? input.mode : "cors", integrity : input.integrity ? input.integrity : ""}).then(res => {
					return [res.text(), input.id, input.url, is_css, is_fonts, input.map === true, input.overrides];
				}).then(promises => {
					return Promise.all(promises).then(resolved => {
						resources.push({
							text: resolved[0], id: resolved[1], url: resolved[2], css: resolved[3], fonts: resolved[4], map: resolved[5], overrides: resolved[6]
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
			ಠ_ಠ = container;
			
			/* <!-- Initialise Objects --> */
			if (ಠ_ಠ.Flags) ಠ_ಠ.Flags();
			if (ಠ_ಠ.Display) ಠ_ಠ.Display();
			if (ಠ_ಠ.Service) ಠ_ಠ.Service();
			if (ಠ_ಠ.Main) ಠ_ಠ.Main();
			
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
					if (ಠ_ಠ.Main) ಠ_ಠ.Main.start();
					var name = "controller-completed", now = new Date(), event = new CustomEvent(name, { detail: now });
					if (document) document.dispatchEvent(event);
				}
			};

			var _proceed = function(result) {
				if (result === true) {
					if (ಠ_ಠ.templates) ಠ_ಠ.templates();
					if (ಠ_ಠ.SETUP && ಠ_ಠ.SETUP.SERVICE && ಠ_ಠ.Service) ಠ_ಠ.Service.register();
				}
				if (ಠ_ಠ.IMPORTS.LOAD_AFTER) {
					_load(ಠ_ಠ.IMPORTS.LOAD_AFTER).then(() => {_finalise(true);}).catch(e => {err(e); _finalise(true);});
				} else {
					_finalise(true);
				}
			};

			var _start = function(result, next) {
				if (result === true) {
					if (next) _load(next).then(() => {_proceed(true);}).catch(e => {err(e);_proceed(false);});
					_removeClass("css-sensitive");
					if (ಠ_ಠ.App && ಠ_ಠ.App.route) ಠ_ಠ.App.route([false, false]);
				}
			};
			
			if (ಠ_ಠ.IMPORTS.LOAD_FIRST && ಠ_ಠ.IMPORTS.LOAD_LAST) {
				_load(ಠ_ಠ.IMPORTS.LOAD_FIRST).then(() => {_start(true, ಠ_ಠ.IMPORTS.LOAD_LAST);}).catch(e => {err(e);_proceed(false);});
			} else if (ಠ_ಠ.IMPORTS.LOAD_FIRST || ಠ_ಠ.IMPORTS.LOAD_LAST) {
				_load(ಠ_ಠ.IMPORTS.LOAD_FIRST || ಠ_ಠ.IMPORTS.LOAD_LAST).then(() => {_start(true); _proceed(true);}).catch(e => {err(e);_start(false);_proceed(false);});
			} else {
				_proceed(true);
			}
		
		},
		
		include :  function(url, type, id) {
			return _include(url, type, id);
		},
		/* <!-- External Functions --> */

	};
	/* <!-- External Visibility --> */
};