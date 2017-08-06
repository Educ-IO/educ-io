Display = function() {
	
	/* <!-- DEPENDS on JQUERY & HANDLEBARS to work, but not to initialise --> */
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Display)) return new this.Display().initialise(this);
	
	/* <!-- Internal Constants --> */
	const MAX_ITEMS = 6;
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
	var _root, _debug = false;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _target = function(options) {
		
		/* <!-- Ensure we have a target _element, and that it is wrapped in JQuery --> */
		var _element = (options && options.target) ? options.target : (_root ? _root : $("body"));
		if (_element instanceof jQuery !== true) _element = $(_element);
		return _element;
		
	};
	
  var _template = function(name) {
			
		if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {

			var _template = $("#" + name);
			if (_template.length == 1) {
				if (Handlebars.templates === undefined) Handlebars.templates = {};
				Handlebars.templates[name] = Handlebars.compile(_template.html(), {strict : _debug});
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
    initialise : function(container) {
			
			/* <!-- Set Debug Flag, used for Template Compile etc --> */
			if (container.SETUP && container.SETUP.DEBUG) _debug = true;
			
			/* <!-- Set Root Element Reference--> */
			_root = (container._root) ? document.getElementById(container._root) : document.body;
			
			/* <!-- Set Container Reference to this --> */
			container.Display = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },

		start : function() {
			
			Handlebars.registerHelper({
				eq: function (v1, v2) {
						return v1 === v2;
				},
				ne: function (v1, v2) {
						return v1 !== v2;
				},
				lt: function (v1, v2) {
						return v1 < v2;
				},
				gt: function (v1, v2) {
						return v1 > v2;
				},
				lte: function (v1, v2) {
						return v1 <= v2;
				},
				gte: function (v1, v2) {
						return v1 >= v2;
				},
				and: function (v1, v2) {
						return v1 && v2;
				},
				or: function (v1, v2) {
						return v1 || v2;
				}
			});

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
			var _element = options.clear === true ? _target(options).empty() : _target(options);
      
			var _doc = $("#" + options.name)[0].innerText;
      if (options.wrapper) _doc = $("#" + options.wrapper)[0].innerText.replace(/\{+\s*content\s*}}/gi, _doc);
			
      if (options.prepend === true) {
        _element.prepend(_doc);
      } else {
        _element.append(_doc);
      }
      
		},
		
		template : function(name) {
			
			return _template(name);
			
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

				_element.prepend(_template("loader")());

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
				
				var dialog = $(_template("alert")(options));
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
					var dialog = $(_template("choose")(options));
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
		
		/* <!--
			Options are : {
				title : main title of the options dialog,
				instructions: optional instructions
				list : array or objects for choices to be attached to
				choices : array or object of name/desc items to choose from
				action : optional name of action button
				target : optional name / element / jquery of containing element
			}
		--> */
    options : function(options) {
    
			return new Promise((resolve, reject) => {

				if (options && options.list && options.choices) {

					/* <!-- Great Modal Options Dialog --> */
					var dialog = $(_template("options")(options));
					_target(options).append(dialog);

					/* <!-- Set Event Handlers --> */
					dialog.find("button.btn-primary").click(function() {
						var _return = [];
						dialog.find("div.input-group").each(function() {
							var e = $(this);
							_return.push({name: e.find("input").data("field"), value: e.find("button").text()});
						});
						resolve(_return);
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
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};