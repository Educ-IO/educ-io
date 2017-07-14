Interact = function() {
	
	// -- Returns an instance of Interact if required -- //
  if (!(this instanceof Interact)) {return new Interact();}
	
	// -- Internal Variables -- //
  const MAX_ITEMS = 6;
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

		busy : function (target, height) {

			// -- Ensure we have a target object, and that it is wrapped in JQuery -- //
			var _target = target ? target : global.container;
			if (_target instanceof jQuery !== true) _target = $(_target);
			
			if (_target.find(".loader").length > 0) {
				
				// If we are already 'busy', clear this!
				_target.find(".loader").remove();
				
			} else {
				
				// Add an overlay loader to the target
				$("<div />", {class : "loader"})
					.css("height", height ? height : _target.height())
					.css("z-index", 999)
					.append($("<div />", {class : "loading"}))
				.prependTo(_target);
				
			}
			
		},
		
    confirm : function(question) {
      
    },
    
    choose : function(options) {
    
			return new Promise((resolve, reject) => {

				if (options && options.choices) {
				
					// -- Get the Options Length -- //
					var _length;
					if (Array.isArray(options.choices)) {
						_length = options.choices.length;
					} else {
						_length = Object.keys(options.choices).length
					}
					options.__LONG = (_length > MAX_ITEMS);
					
					// -- Great Modal Choice Dialog -- //
					var template = Handlebars.compile($("#choose").html());
					var dialog = $(template(options));
					global.container.append(dialog);

					// -- Set Event Handlers -- //
					dialog.find("button.btn-primary").click(function() {
						var _value = dialog.find("input[name='choices']:checked, select[name='choices'] option:selected").val();
						if (_value && options.choices[_value]) resolve(options.choices[_value]);
					});
					dialog.on("shown.bs.modal", function () {});
					dialog.on("hidden.bs.modal", function() {
						dialog.remove();
						reject();
					});

					// -- Show the Modal Dialog -- //
					dialog.modal("show");
					
				} else {
					reject();
				}
				
    	});
			
    },
    
		// == Functions == //
	}
		
}