Css = function(suffix, prefix) {
	"use strict";
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Css)) return new this.Css().initialise(this, suffix, prefix);
	
	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  var _prefix, _suffix, _ids = [];
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _id = (id) => id + "_" + _suffix;
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container, suffix, prefix) {
			
			/* <!-- Set identifying prefix --> */
			_prefix = prefix;
			
      /* <!-- Set identifying suffix --> */
      _suffix = suffix;
      
			/* <!-- Return for Chaining --> */
			return this;
			
    },
    
    sheet : function(id) {
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
      $("#" + _id(id)).remove();
      return this;
    },
    
    deleteAll : function() {
      $.each(_ids, function(i, id) {$("#" + _id(id)).remove();});
			return this;
    },
			
    addRule : function(sheet, selector, rules, index) {
			selector = _prefix ? "#" + _prefix + " " + selector : selector;
      if ("insertRule" in sheet) {
        sheet.insertRule(selector + "{" + rules + "}", index);
      } else if ("addRule" in sheet) {
        sheet.addRule(selector, rules, index);
      }
      return this;
    },
			
    removeRule : function(sheet, selector) {
			selector = _prefix ? "#" + _prefix + " " + selector : selector;
      $.each(sheet.cssRules, function(i, rule) {if (rule.selectorText === selector) {sheet.deleteRule(i); return false;}});
      return this;
    },
		
		hasStyles : () => _ids.length > 0,
    
		hasStyleSheet : (id) => !!document.getElementById(_id(id))
		
  };
  /* <!-- External Visibility --> */
  
};