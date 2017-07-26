App = function() {
	
	/* -- Returns an instance of App if required -- */
  if (!(this instanceof App)) {return new App();}
	
	/* -- Internal Variables -- */
	var __docs = "/docs/labels/";
	
	/* -- Internal Functions -- */
	var _display = function(value) {

		$("<div />", {class : "row"}).append(
			$("<div />", {class : "col-12"}).html(
				new showdown.Converter().makeHtml(value)
			)
		).appendTo(
			$("<div />", {"class" : "container"})
				.appendTo(global.container.empty()
			)
		);

	};
	/* -- Internal Functions -- */
	
	/* -- External Visibility -- */
  return {

    /* -- External Functions -- */
		
    initialise : function() {
			
			/* -- Return for Chaining -- */
			return this;
			
    },

    route : function(command) {
      
			if (!command || command === false || command == "PUBLIC") {
				
				/* -- Load the Public Instructions -- */
				$.ajax({
					url: __docs + "PUBLIC.md", type: "get", dataType: "html",
					async: true, success: function(result) {
						if (result) _display(result);
					}
				});
				
			} else if (command === true || command == "AUTH") {
				
				/* -- Load the Initial Instructions -- */
				$.ajax({
					url: __docs + "README.md", type: "get", dataType: "html",
					async: true, success: function(result) {
						if (result) _display(result);
					}
				});
				
			} else if (command == "INSTRUCTIONS") {
				
				/* -- Load the Instructions -- */
				$.ajax({
					url: __docs + "INSTRUCTIONS.md", type: "get", dataType: "html",
						async: true, success: function(result) {
						if (result) _display(result);
					}
				});
				
			}
      
    },

	};
		
};