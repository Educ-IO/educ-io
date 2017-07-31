Interact = function() {
	
	/* <!-- Returns an instance of Interact if required --> */
  if (!(this instanceof Interact)) {return new Interact();}
	
	/* <!-- Internal Variables --> */
  const MAX_ITEMS = 6;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _target = function(options) {
		
		/* <!-- Ensure we have a target _element, and that it is wrapped in JQuery --> */
		var _element = (options && options.target) ? options.target : (global.container ? global.container : $("body"));
		if (_element instanceof jQuery !== true) _element = $(_element);
		return _element;
		
	};
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
		
    initialise : function() {
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },

		/* <!--
			Options are : {
				target : element to append the loader to,
				clear : optional boolean to force clearing,
			}
		--> */
		busy : function (options) {

			var _element = _target(options);

			if ((options && options.clear === true) || _element.find(".loader").length > 0) {

				_element.find(".loader").remove();

			} else {

				_element.prepend(global.display.template("loader")());

			}
			
		},
		
		/*
			Options are : {

			}
		*/
    confirm : function(options) {
      
    },
		
		/* <!--
			Options are : {
				type : type of alert (success, info, warning, danger),
				headline : main message,
				message : optional body message,
				action : optional name of action button
				target : optional name / element / jquery of containing element
			}
		--> */
		alert : function(options) {
      
			return new Promise((resolve, reject) => {
				
				/* <!-- Great Modal Choice Dialog --> */
				var dialog = $(global.display.template("alert")(options));
				_target(options).prepend(dialog);

				if (options.action) {
				
					/* <!-- Set Event Handler (if required) --> */
					dialog.find("button.action").click(function() {
						resolve(true);
						dialog.alert("close");
					});

				}
					
				dialog.on("closed.bs.alert", function() {
					resolve(false);
				});

				/* <!-- Show the Alert --> */
				dialog.alert();

    	});
			
    },
    
		/* <!--
			Options are : {
				title : main title of the options dialog,
				choices : array or object of name/desc items to choose from
				action : optional name of action button
				target : optional name / element / jquery of containing element
			}
		--> */
    choose : function(options) {
    
			return new Promise((resolve, reject) => {

				if (options && options.choices) {
				
					/* <!-- Get the Options Length --> */
					var _length;
					if (Array.isArray(options.choices)) {
						_length = options.choices.length;
					} else {
						_length = Object.keys(options.choices).length;
					}
					options.__LONG = (_length > MAX_ITEMS);
					
					/* <!-- Great Modal Choice Dialog --> */
					var dialog = $(global.display.template("choose")(options));
					_target(options).append(dialog);

					/* <!-- Set Event Handlers --> */
					dialog.find("button.btn-primary").click(function() {
						var _value = dialog.find("input[name='choices']:checked, select[name='choices'] option:selected").val();
						if (_value && options.choices[_value]) resolve(options.choices[_value]);
					});
					dialog.on("shown.bs.modal", function () {});
					dialog.on("hidden.bs.modal", function() {
						dialog.remove();
						reject();
					});

					/* <!-- Show the Modal Dialog --> */
					dialog.modal("show");
					
				} else {
					reject();
				}
				
			});
			
    },
    
		/* == Functions == */
	};

};