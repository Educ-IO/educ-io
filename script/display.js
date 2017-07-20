Display = function() {
	
	// -- Returns an instance of Display if required -- //
  if (!(this instanceof Display)) {return new Display();}
	
	// -- Internal Variables -- //
  // -- Internal Variables -- //
	
	// -- Internal Functions -- //
  
	// -- Internal Functions -- //
	
	// -- External Visibility -- //
  return {

    // -- External Functions -- //
    initialise : function() {
			
			// -- Return for Chaining -- //
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

			// -- Ensure we have a target object, and that it is wrapped in JQuery -- //
			var _target = (options && options.target) ? options.target : (global.container ? global.container : $("body"));
			if (_target instanceof jQuery !== true) _target = $(_target);
			
      // -- Clear Target if required -- //
      if (options.clear === true) _target = _target.empty();
      
      var _output = Handlebars.compile($("#" + options.name).html())();
      if (options.wrapper) {
          _output = Handlebars.compile($("#" + options.wrapper).html())({content : _output});
      }
      
      if (options.prepend === true) {
        _target.prepend(_output);
      } else {
        _target.append(_output);
      }
      
		},
   // -- External Functions -- //
    
	}
  // -- External Visibility -- //
}