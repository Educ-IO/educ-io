Scroll = (options, factory) => {
	"use strict";

	/* <!-- HELPER: Provides smooth scrolling for same-page anchor links --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
	
	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _attach = function(to, fn, event) {
    to.addEventListener ?
      to.addEventListener(event ? event : "load", fn, false) :
      to.attachEvent ? 
        to.attachEvent("on" + (event ? event : "load"), fn) : 
        (to.onload = fn);
  };
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start : function(element) {
      
      if (Element.prototype.scrollIntoView) {
    
        var hrefs = (element ? element : document).getElementsByTagName("a"), fn = function(e) {
          if (e.target.hash && e.target.hash.length > 1) {
            var el = document.getElementById(e.target.hash.slice(1));
            if (el && el.scrollIntoView) {
              e.preventDefault();
              el.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
              return false;
            }
          }
        };

        for (var i= 0; i < hrefs.length; ++i) {
          if (hrefs[i].hash && hrefs[i].host == window.location.host && hrefs[i].pathname == window.location.pathname) _attach(hrefs[i], fn, "click");
        }

      }
      
    }
		
  };
  /* <!-- External Visibility --> */
  
};