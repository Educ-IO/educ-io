Display = function() {
	
	/* <!-- Returns an instance of Display if required --> */
  if (!(this instanceof Display)) {return new Display();}
	
	/* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _template = function(name) {
			
		if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {

			var _template = $("#" + name);
			if (_template.length == 1) {
				if (Handlebars.templates === undefined) Handlebars.templates = {};
				Handlebars.templates[name] = Handlebars.compile(_template.html());
				return Handlebars.templates[name];
			}

		} else {
			
			return Handlebars.templates[name];
		
		}
		
	};
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function() {
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },

		/*
			Options are : {
				name : name of the document to display,
        target : optional element to append the display to,
        prepend : optional boolean to prepend doc, rather than append,
        clear : ooption boolean to clear target first
			}
		*/
		doc : function (options) {

			/* <!-- Ensure we have a target object, and that it is wrapped in JQuery --> */
			var _target = (options && options.target) ? options.target : (global.container ? global.container : $("body"));
			if (_target instanceof jQuery !== true) _target = $(_target);
			
      /* <!-- Clear Target if required --> */
      if (options.clear === true) _target = _target.empty();
      
			var _template = $("#" + options.name)[0].innerText;
      if (options.wrapper) _template = $("#WRAPPER")[0].innerText.replace(/\{+\s*content\s*}}/gi, _template);
			
      if (options.prepend === true) {
        _target.prepend(_template);
      } else {
        _target.append(_template);
      }
      
		},
		
		template : function(name) {
			
			return _template(name);
			
		},
		
		partialTemplates : function(names) {
			if (names) {
				if (typeof names == "string") names = [names];
				for (var i = 0, l = names.length; i < l; i += 1) {
					Handlebars.partials[names[i]] = _template(names[i]);
				}
			}
		}
		
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};