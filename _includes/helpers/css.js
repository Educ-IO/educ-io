Css = (suffix, prefix) => {
	"use strict";

	/* <!-- MODULE: Provides dynamic CSS rules for document insertion --> */
  /* <!-- PARAMETERS: suffix and prefix for rules --> */
	/* <!-- REQUIRES: Global Scope: JQuery --> */
	
	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  var _ids = [];
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _id = id => `${id}_${suffix}`;
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
			selector = prefix ? `#${prefix} ${selector}` : selector;
      if ("insertRule" in sheet) {
        sheet.insertRule(`${selector} {${rules}}`, index);
      } else if ("addRule" in sheet) {
        sheet.addRule(selector, rules, index);
      }
      return this;
    },
			
    removeRule : function(sheet, selector) {
			selector = prefix ? `#${prefix} ${selector}` : selector;
      $.each(sheet.cssRules, (i, rule) => {if (rule.selectorText === selector) {sheet.deleteRule(i); return false;}});
      return this;
    },
		
		hasStyles : () => _ids.length > 0,
    
		hasStyleSheet : id => !!document.getElementById(_id(id))
		
  };
  /* <!-- External Visibility --> */
  
};