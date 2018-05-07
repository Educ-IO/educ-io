Css = (options, factory) => {
	"use strict";

	/* <!-- HELPER: Provides dynamic CSS rules for document insertion --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
	/* <!-- @options.suffix:  [Optional]  --> */
	/* <!-- @options.prefix:  [Optional]  --> */
	/* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
	
	/* <!-- Internal Constants --> */
	const DEFAULTS = {suffix: "", prefix : ""};
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  var _ids = [];
	options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _id = id => `${id}_${options.suffix}`;
	var _selector = selector => `${options.prefix ? `${options.prefix} ` : ""}${selector}`;
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    sheet : id => {
      var _styleSheet = document.getElementById(_id(id));
      if (!_styleSheet) {
        _styleSheet = document.createElement("style");
        _styleSheet.setAttribute("id", _id(id));
        _styleSheet.setAttribute("data-type", "generated");
        _styleSheet.appendChild(document.createTextNode(""));
        document.head.appendChild(_styleSheet);
        if (_ids.indexOf(id) < 0) _ids.push(id);
      }
      return _styleSheet.sheet;
    },
			
    delete : function(id) {
      $(`#${_id(id)}`).remove();
      return this;
    },
    
    deleteAll : function() {
      $.each(_ids, (i, id) => {$(`#${_id(id)}`).remove();});
			return this;
    },
			
    addRule : function(sheet, selector, rules, index) {
      if ("insertRule" in sheet) {
        sheet.insertRule(`${_selector(selector)} {${rules}}`, index);
      } else if ("addRule" in sheet) {
        sheet.addRule(selector, rules, index);
      }
      return this;
    },
			
    removeRule : function(sheet, selector) {
      $.each(sheet.cssRules, (i, rule) => {if (rule.selectorText === _selector(selector)) {sheet.deleteRule(i); return false;}});
      return this;
    },
		
		hasStyles : () => _ids.length > 0,
    
		hasStyleSheet : id => !!document.getElementById(_id(id))
		
  };
  /* <!-- External Visibility --> */
  
};