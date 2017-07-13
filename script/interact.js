Interact = function() {
	
	// -- Returns an instance of Interact if required -- //
  if (!(this instanceof Interact)) {return new Interact();}
	
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

    confirm : function(question) {
      
    },
    
    choose : function(options) {
    
			return new Promise((resolve, reject) => {

				// -- Great Modal Choice Dialog -- //
				var template = Handlebars.compile($("#choose").html());
				var dialog = $(template(options));
      	global.container.append(dialog);
				
				// -- Set Event Handlers -- //
				dialog.find("button.btn-primary").click(function() {
					var _value = dialog.find("input[name='options']:checked").val();
					resolve(options.options[_value]);
				});
				dialog.on("shown.bs.modal", function () {});
				dialog.on("hidden.bs.modal", function() {
					dialog.remove();
					reject();
				});
				
				// -- Show the Modal Dialog -- //
				dialog.modal("show");
				
    	});
			
    },
    
		// == Functions == //
	}
		
}