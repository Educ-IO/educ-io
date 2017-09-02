Display = function() {

	/* <!-- DEPENDS on JQUERY & HANDLEBARS to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Display)) return new this.Display().initialise(this);

	/* <!-- Internal Constants --> */
	const MAX_ITEMS = 6;
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var _root, _state = {},
		_debug = false;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _arrayize = (value, test) => value && test(value) ? [value] : value;

	var _target = function(options) {

		/* <!-- Ensure we have a target _element, and that it is wrapped in JQuery --> */
		var _element = (options && options.target) ? options.target : (_root ? _root : $("body"));
		if (_element instanceof jQuery !== true) _element = $(_element);
		return _element;

	};

	var _compile = function(name) {
		var _template = $("#__template__" + name);
		if (_template.length == 1) {
			if (Handlebars.templates === undefined) Handlebars.templates = {};
			Handlebars.templates[name] = Handlebars.compile(_template.html(), {
				strict: _debug
			});
			return Handlebars.templates[name];
		}
	};

	var _template = function(name) {

		return Handlebars.templates === undefined || Handlebars.templates[name] === undefined ?
			_compile(name) : Handlebars.templates[name];

	};
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		initialise: function(container) {

			/* <!-- Set Debug Flag, used for Template Compile etc --> */
			if (container.SETUP && container.SETUP.DEBUG) _debug = true;

			/* <!-- Set Root Element Reference--> */
			_root = (container._root) ? document.getElementById(container._root) : document.body;

			/* <!-- Set Container Reference to this --> */
			container.Display = this;

			/* <!-- Return for Chaining --> */
			return this;

		},

		start: function() {

			Handlebars.registerHelper("isDate", function(variable, options) {
				if (variable && variable instanceof Date) {
    			return options.fn(this);
  			} else {
  				return options.inverse(this);
				}
			});
			
			Handlebars.registerHelper("localeDate", function(variable, options) {
  			return variable.toLocaleString();
			});
			
			Handlebars.registerHelper("exists", function(variable, options) {
				if (typeof variable !== "undefined") {
					return options.fn(this);
				} else {
					return options.inverse(this);
				}
			});

			Handlebars.registerHelper({
				eq: function(v1, v2) {
					return v1 === v2;
				},
				ne: function(v1, v2) {
					return v1 !== v2;
				},
				lt: function(v1, v2) {
					return v1 < v2;
				},
				gt: function(v1, v2) {
					return v1 > v2;
				},
				lte: function(v1, v2) {
					return v1 <= v2;
				},
				gte: function(v1, v2) {
					return v1 >= v2;
				},
				and: function(v1, v2) {
					return v1 && v2;
				},
				or: function(v1, v2) {
					return v1 || v2;
				}
			});

		},

		doc: {

			wrap: function(wrapper, content, options) {
				return this.get(wrapper)
					.replace(/\{\{+\s*content\s*}}/gi, content)
					.replace(/\{\{+\s*title\s*}}/gi, options && options.title ? options.title : "Title")
					.replace(/\{\{+\s*close\s*}}/gi, options && options.close ? options.close : "Close");
			},
			/*
				Options are : {
					name : name of the document to display,
				}
			*/
			get: function(options) {
				options = _.isString(options) ? {
					name: options
				} : options;
				var _doc = $("#__doc__" + options.name)[0].innerText;
				return options.wrapper ? this.wrap(options.wrapper, _doc, options) : options.content !== undefined ?
					_doc.replace(/\{\{+\s*content\s*}}/gi, options.content) : _doc;
			},

			/*
				Options are : {
					name : name of the document to display,
					target : optional element to append the display to,
					prepend : optional boolean to prepend doc, rather than append,
					clear : ooption boolean to clear target first
				}
			*/
			show: function(options) {

				/* <!-- Ensure we have a target object, and that it is wrapped in JQuery --> */
				var _element = options.clear === true ? _target(options).empty() : _target(options);

				return options.prepend === true ?
					$(this.get(options)).prependTo(_element) : $(this.get(options)).appendTo(_element);

			},

		},

		template: {

			get: function(options) {

				return _.isString(options) ? _template(options) : _template(options.template ? options.template : options.name)(options);

			},

			show: function(options) {

				/* <!-- Ensure we have a target object, and that it is wrapped in JQuery --> */
				var _element = options.clear === true ? _target(options).empty() : _target(options);

				return options.prepend === true ?
					$(this.get(options)).prependTo(_element) : $(this.get(options)).appendTo(_element);

			},

		},

		/* <!--
			Options are : {
				target : element to append the loader to,
				clear : optional boolean to force clearing,
			}
		--> */
		busy: function(options) {

			var _element = _target(options);
			if (!options.class) options.class = "loader-large";
			(options && options.clear === true) || _element.find(".loader").length > 0 ?
				_element.find(".loader").remove() : _element.prepend(_template("loader")(options));

			return this;
		},

		/*
			Options are : {

			}
		*/
		confirm: function(options) {

			return new Promise((resolve, reject) => {

				if (!options) return reject();

				/* <!-- Great Modal Choice Dialog --> */
				var dialog = $(_template("confirm")(options));
				_target(options).append(dialog);

				/* <!-- Set Event Handlers --> */
				dialog.find("button.btn-primary").click(function() {
					resolve(true);
				});
				dialog.on("hidden.bs.modal", function() {
					dialog.remove();
					reject();
				});

				/* <!-- Show the Modal Dialog --> */
				dialog.modal("show");

			});

		},

		/*
			Options are : {

			}
		*/
		modal: function(template, options) {

			return new Promise((resolve, reject) => {

				if (!options) return reject();

				/* <!-- Great Modal Choice Dialog --> */
				var dialog = $(_template(template)(options));
				_target(options).append(dialog);

				if (dialog.find("button.btn-primary").length > 0 && dialog.find("form").length > 0) {
					/* <!-- Set Form / Return Event Handlers --> */
					dialog.find("button.btn-primary").click(function() {
						resolve(dialog.find("form").serializeArray());
					});
					dialog.on("hidden.bs.modal", function() {
						dialog.remove();
						reject();
					});
				} else {
					/* <!-- Set Basic Event Handlers --> */
					dialog.on("hidden.bs.modal", function() {
						dialog.remove();
						resolve();
					});
				}

				/* <!-- Show the Modal Dialog --> */
				dialog.modal("show");

			});

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
		alert: function(options) {

			return new Promise((resolve, reject) => {

				if (!options) return reject();

				var dialog = $(_template("alert")(options));
				_target(options).prepend(dialog);

				/* <!-- Set Event Handler (if required) --> */
				if (options.action) dialog.find("button.action").click(function() {
					resolve(true);
					dialog.alert("close");
				});

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
		choose: function(options) {

			return new Promise((resolve, reject) => {

				if (!options || !options.choices) return reject();

				/* <!-- Get the Options Length --> */
				var _length = Array.isArray(options.choices) ?
					_length = options.choices.length : _length = Object.keys(options.choices).length;
				options.__LONG = (_length > MAX_ITEMS);

				/* <!-- Great Modal Choice Dialog --> */
				var dialog = $(_template("choose")(options));
				_target(options).append(dialog);

				/* <!-- Set Event Handlers --> */
				dialog.find("button.btn-primary").click(function() {
					var _value = dialog.find("input[name='choices']:checked, select[name='choices'] option:selected").val();
					if (_value && options.choices[_value]) resolve(options.choices[_value]);
				});
				dialog.on("hidden.bs.modal", function() {
					dialog.remove();
					reject();
				});

				/* <!-- Show the Modal Dialog --> */
				dialog.modal("show");

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
		options: function(options) {

			return new Promise((resolve, reject) => {

				if (!options || !options.list || !options.choices) return reject();

				/* <!-- Great Modal Options Dialog --> */
				var dialog = $(_template("options")(options));
				_target(options).append(dialog);
				dialog.find("a.dropdown-item").on("click.toggler", (e) => $(e.target).closest(".input-group-btn").children("button")[0].innerText = e.target.innerText);
				dialog.find("a[data-toggle='tooltip']").tooltip({
					animation: false
				});

				/* <!-- Set Event Handlers --> */
				dialog.find("button.btn-primary").click(function() {
					var _return = [];
					dialog.find("div.input-group").each(function() {
						var e = $(this);
						_return.push({
							name: e.find("input").data("field"),
							value: e.find("button").text()
						});
					});
					resolve(_return);
				});
				dialog.on("shown.bs.modal", function() {});
				dialog.on("hidden.bs.modal", function() {
					dialog.remove();
					reject();
				});

				/* <!-- Show the Modal Dialog --> */
				dialog.modal("show");

			});

		},

		protect: function(query) {

			var _parent = this,
				_selector = $(query);

			return {

				on: function(message_doc, title) {
					_selector.off("click.protect").on("click.protect", function(e) {
						e.preventDefault();
						_parent.confirm({
							id: "__protect_confirm",
							title: title,
							message: _parent.doc.get(message_doc),
							action: "Proceed"
						}).then(function() {
							var link = $(e.target);
							if (!link.is("a")) link = link.closest("a");
							var target = link.attr("target");
							if (target && target.trim.length > 0) {
								window.open(link.attr("href"), target);
							} else {
								window.location = link.attr("href");
							}
						}).catch(function() {});
					});
					return _parent;
				},

				off: function() {
					_selector.off("click.protect");
					return _parent;
				},

			};

		},

		state: function() {

			var _parent = this;

			var _add = function(name) {
				if (!_state[name]) {
					_state[name] = true;
					return true;
				}
				return false;
			};

			var _remove = function(name) {
				if (_state[name]) {
					delete _state[name];
					return true;
				}
				return false;
			};

			var _all = function() {
				var _ret = [];
				for (var name in _state) {
					if (_state.hasOwnProperty(name)) _ret.push(name);
				}
				return _ret;
			};

			return {
				enter: function(names) {
					names = _arrayize(names, _.isString);
					_.each(names, name => {
						if (_add(name)) $(".state-" + name).removeClass("disabled");
					});
					return _parent;
				},

				exit: function(names) {
					names = _arrayize(names, _.isString);
					_.each(names, name => {
						if (_remove(name)) {
							$(".state-" + name).addClass("disabled");
							_all().forEach((v) => $(".state-" + v).removeClass("disabled"));
						}
					});
					return _parent;
				},

				clear: function() {
					_all().forEach((v) => _remove(v) ? $(".state-" + v).addClass("disabled") : null);
					return _parent;
				},
			};

		},
		/* <!-- External Functions --> */

	};
	/* <!-- External Visibility --> */
};