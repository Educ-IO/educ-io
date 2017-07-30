(function() {
	
	const inject = (function(i,s,o,g,r,a,m) {
  	a=s.createElement(o);
		a.setAttribute("data-src", g.url);
  	m=s.getElementsByTagName(o)[0];
  	a.appendChild(s.createTextNode(g.text));
  	a.onload=r(g);
  	if (m) {
    	m.parentNode.insertBefore(a, m);
  	} else {
    	s.head.appendChild(a);
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

	const controller = function (inputs, promise) {

		if (!(inputs && Array.isArray(inputs))) return Promise.reject(new TypeError("`inputs` must be an array"));
		if (promise && !(promise instanceof Promise)) return Promise.reject(new TypeError("`promise` must be a promise"));

		const resources = [];
		const deferreds = promise ? [].concat(promise) : [];
		const thenables = [];

		inputs.forEach(input => deferreds.push(
			window.fetch(input).then(res => {
				var is_css = !!input.match(/(\.|\/)css($|\?\S+)/gi);
				return [res.text(), is_css, input];
			}).then(promises => {
				return Promise.all(promises).then(resolved => {
					resources.push({ text: resolved[0], css: resolved[1], url: resolved[2]});
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
				$(".font-sensitive").removeClass("font-sensitive");
				$(".css-sensitive").removeClass("css-sensitive");
		}
	};
	
	var proceed = function(result) {
		if (result === true) {
			if (window.templates) templates();
			register_Worker();
			if (window.start) start();	
		}
		if (window.LOAD_AFTER) {
			controller(window.LOAD_AFTER).then(() => {finalise(true);}).catch(e => {console.error(e); finalise(true);});
		} else {
			finalise(true);
		}
	};

	var load = function() {
		
		if (window.LOAD_FIRST && window.LOAD_LAST) {
			controller(window.LOAD_LAST, controller(window.LOAD_FIRST)).then(() => {proceed(true);}).catch(e => {console.error(e);proceed(false);});
		} else if (window.LOAD_FIRST || window.LOAD_LAST) {
			controller(window.LOAD_FIRST || window.LOAD_LAST).then(() => {proceed(true);}).catch(e => {console.error(e);proceed(false);});
		} else {
			proceed(true);
		}
		
	};
	
	/* -- Test Storage Availability (inc Mobile Safari | Incognito Mode) -- */
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
/* -- Test Storage Availability (inc Mobile Safari | Incognito Mode) -- */
	
	var polyfill = 
			!String.prototype.endsWith ||
			!Array.prototype.map ||
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
 






	
	 
	
	
		