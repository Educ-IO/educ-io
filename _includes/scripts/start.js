(function() {

	/*jshint ignore:start*/
	if ({{ site.app.namespace }} && {{ site.app.namespace }}._isF({{ site.app.namespace }}.Controller)) {{ site.app.namespace }}.Controller();
	/*jshint ignore:end*/
	
	var polyfill = 
			!String.prototype.endsWith ||
			!Array.prototype.map ||
			!Array.prototype.filter ||
			typeof Object.assign != "function" ||
			!__storageAvailable(window.localStorage) ||
			!__storageAvailable(window.sessionStorage) ||
			!window.fetch;
	
	if (polyfill) {
		
		/*jshint ignore:start*/
		include("/polyfills.js", "script").then(() => {if ({{ site.app.namespace }}.Main) {{ site.app.namespace }}.Main.load();}).catch(e => {console.log(e);});
		/*jshint ignore:end*/
		
	} else {
	
		/*jshint ignore:start*/
		{{ site.app.namespace }}.Controller.start();
		/*jshint ignore:end*/
		
	}
	
})();