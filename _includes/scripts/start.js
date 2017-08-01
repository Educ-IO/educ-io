(function() {
	
	var fonts_handled = false;
	const inject = (function(i,s,o,g,r,a,m) {
  	a=s.createElement(o);
		a.setAttribute("id", g.id);
		a.setAttribute("data-src", g.url);
  	m=s.getElementsByTagName(o)[0];
  	a.appendChild(s.createTextNode(g.text));
		a.onload=r(g);
  	if (m) {
    	m.parentNode.insertBefore(a, m);
  	} else {
    	s.head.appendChild(a);
  	}
		if (g.css === true && g.fonts === true) {
			try {
				for (var j=0; j < a.sheet.cssRules.length; j++) {
					if (a.sheet.cssRules[j].type == 5) {
						if ("fontDisplay" in a.sheet.cssRules[j].style) {
							a.sheet.cssRules[j].style.fontDisplay = "block";
							fonts_handled = true;
						}
					}
				}
				if (fonts_handled === false) {
					if ("fonts" in document) {
						document.fonts.ready.then(function(fontFaceSet) {
							var els = document.getElementsByClassName("font-sensitive");
							while(els.length > 0){els[0].classList.remove("font-sensitive");}
							fonts_handled = true;
						});
					}
				} else {
					var els = document.getElementsByClassName("font-sensitive");
					while(els.length > 0){els[0].classList.remove("font-sensitive");}
					fonts_handled = true;
				}
			} catch(e) {
				console.error("ERROR SETTING FONT DISPLAY/API:", e);
			}
		}
	});
	
	const include = (function(url, type) {
    return new Promise((resolve, reject) => {
        const script = document.createElement(type);
        script.src = url;
        script.addEventListener("load", resolve);
        script.addEventListener("error", () => reject("Error loading script."));
        script.addEventListener("abort", () => reject("Script loading aborted."));
        document.head.appendChild(script);
    });
	});

	window.controller = function (inputs, promise) {

		if (!(inputs && Array.isArray(inputs))) return Promise.reject(new TypeError("`inputs` must be an array"));
		if (promise && !(promise instanceof Promise)) return Promise.reject(new TypeError("`promise` must be a promise"));

		const resources = [];
		const deferreds = promise ? [].concat(promise) : [];
		const thenables = [];

		inputs = inputs.filter(input => document.getElementById(input.id) == null);
		
		inputs.forEach(input => deferreds.push(
			window.fetch(input.url, {mode: input.mode ? input.mode : "cors"}).then(res => {
				var is_css = !!input.url.match(/(\.|\/)css($|\?\S+)/gi);
				var is_fonts = !!input.url.match(/^https:\/\/fonts\.googleapis\.com\/css/gi);
				return [res.text(), input.id, input.url, is_css, is_fonts];
			}).then(promises => {
				return Promise.all(promises).then(resolved => {
					resources.push({ text: resolved[0], id: resolved[1], url: resolved[2], css: resolved[3], fonts: resolved[4]});
				});
			})
		));

		return Promise.all(deferreds).then(() => {
			resources.forEach(resource => {
				thenables.push({ then: resolve => {
					resource.css === true ? inject(window, document, "style", resource, resolve) : inject(window, document, "script", resource, resolve);
				}});
			});
			return Promise.all(thenables);
		});

	};

	var finalise = function(result) {
		if (result === true) {
				if (fonts_handled === false) $(".font-sensitive").removeClass("font-sensitive");
				if (window.start) window.start();	
		}
	};
	
	var proceed = function(result) {
		if (result === true) {
			if (window.templates) templates();
			if (!window.DEBUG) register_Worker();
		}
		if (window.LOAD_AFTER) {
			window.controller(window.LOAD_AFTER).then(() => {finalise(true);}).catch(e => {console.error(e); finalise(true);});
		} else {
			finalise(true);
		}
	};

	var start = function(result, next) {
		if (result === true) {
			if (next) window.controller(next).then(() => {proceed(true);}).catch(e => {console.error(e);proceed(false);});
			var els = document.getElementsByClassName("css-sensitive");
			while(els.length > 0){els[0].classList.remove("css-sensitive");}
			if (window.global && !window.global.container && window.jQuery) global.container = $(".content");
			if (window.global && !window.global.app) window.global.app = App().initialise();
			if (window.global) window.global.app.route(false);
		}
	};
	
	var load = function() {
		
		if (window.LOAD_FIRST && window.LOAD_LAST) {
			window.controller(window.LOAD_FIRST).then(() => {start(true, window.LOAD_LAST);}).catch(e => {console.error(e);proceed(false);});
		} else if (window.LOAD_FIRST || window.LOAD_LAST) {
			window.controller(window.LOAD_FIRST || window.LOAD_LAST).then(() => {start(true); proceed(true);}).catch(e => {console.error(e);start(false);proceed(false);});
		} else {
			proceed(true);
		}
		
	};

	/* <!-- Test Storage Availability (inc Mobile Safari | Incognito Mode) --> */
	var testStorage = function (storage) {
		if (typeof storage == "undefined") return false;
		try { /* hack for safari incognito */
			storage.setItem("__TEST__", "");
			storage.getItem("__TEST__");
			storage.removeItem("__TEST__");
			return true;
		}
		catch (err) {
			return false;
		}
	};
/* <!-- Test Storage Availability (inc Mobile Safari | Incognito Mode) --> */
	
	var polyfill = 
			!String.prototype.endsWith ||
			!Array.prototype.map ||
			!Array.prototype.filter ||
			typeof Object.assign != "function" ||
			!testStorage(window.localStorage) ||
			!testStorage(window.sessionStorage) ||
			!window.fetch;
	
	if (polyfill) {
		
		include("/polyfills.js", "script").then(() => {load();}).catch(e => {console.log(e);});
	
	} else {
	
		load();
	
	}
	
})();