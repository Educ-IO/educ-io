(function() {

  /* <!-- Test Storage Availability (inc Mobile Safari | Incognito Mode) --> */
  window.__storageAvailable = function(storage) {
    if (typeof storage == "undefined") return false;
    try { /* <!-- Hack for IOS/Safari Incognito Mode) --> */
      var name = "__TEST_NAME__",
        value = "__TEST_VALUE__",
        result = true;
      storage.setItem(name, value);
      result = (storage.getItem(name) == value);
      storage.removeItem(name);
      return result;
    }
    catch (err) {
      return false;
    }
  };
  /* <!-- Test Storage Availability (inc Mobile Safari | Incognito Mode) --> */
  
	/*jshint ignore:start*/
	if ({{ site.app.namespace }} && {{ site.app.namespace }}._isF({{ site.app.namespace }}.Controller)) {{ site.app.namespace }}.Controller();
	/*jshint ignore:end*/
	
	var polyfill = 
			!String.prototype.endsWith ||
			!Array.prototype.map ||
			!Array.prototype.filter ||
			typeof Object.assign != "function" ||
			!window.__storageAvailable(window.localStorage) ||
			!window.__storageAvailable(window.sessionStorage) ||
			!window.fetch;
	
	if (polyfill) {
		
		/*jshint ignore:start*/
		{{ site.app.namespace }}.Controller.include("/polyfills.js", "script", "polyfills").then(() => {{ site.app.namespace }}.Controller.start()).catch(e => {console.log(e);});
		/*jshint ignore:end*/
		
	} else {
	
		/*jshint ignore:start*/
		{{ site.app.namespace }}.Controller.start();
		/*jshint ignore:end*/
		
	}
	
})();