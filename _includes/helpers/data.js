Data = () => {
	"use strict";
	
	/* <!-- Internal Constants --> */
	const INPUTS = "*[data-output-field], :input[name]:enabled";
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	var _dehydrate = form => {

			var value = el => {

				var simple = el => {
					var _type = el.data("output-type"),
						_val = (el[0].type == "checkbox" || el[0].type == "radio") ?
							el.is("input:indeterminate") ? "all" : el.prop("checked") :
						(el[0].nodeName == "P" || el[0].nodeName == "DIV" || el[0].nodeName == "SPAN") ?
						el.text().trim() : (el[0].nodeName == "A") ? {
							Id: el.prop("id"),
							Url: el.prop("href"),
							Text: el.text()
						} : (el[0].nodeName == "IMG") ? {
							Url: el.prop("src")
						} : (el[0].nodeName == "BUTTON") ?
						(el.data("default") && el.data("default") == el.text()) ? null : el.text() :
						el.val();
					
					/* <!-- TODO: Handle Parsing of types here --> */
					return _type == "datetime" ? _val : _val;
				};

				var complex = descendants => {
					var _val = {};
					_.each(descendants, descendant => {
						var _el = $(descendant);
						if (_el.parents("*[data-output-name]")[0] === el[0]) { /* <!-- Only Process Direct Descendents --> */
							var __val = value(_el);
							if (!_.isEmpty(__val)) _val[_el.data("output-name")] = __val;
						}
					});
					return _val;
				};

				var descendants = el.find("*[data-output-name]");
				return (descendants.length === 0) ? simple(el) : complex(descendants);
			};

			/* <!-- TODO: Evidence Only Outputs One List Item ** BUG ** --> */
		
			return _.reduce(form.find(INPUTS), (values, input) => {
				
				var _$ = $(input), 
						_inputs = _$.find("*[data-output-name]"), 
						_field = _.reduce(_inputs.length > 0 ? _inputs : [input], (field, input) => {
							var _$ = $(input);
							if (_$.parents("*[data-output-name]").length === 0) { /* <!-- Only Process Top-Level Values --> */
								var _val = value(_$), _name = _$.data("output-name") ? _$.data("output-name") : "Value";
								if (_val === true || _val === false || !_.isEmpty(_val)) field[_name] = (field[_name] !== undefined ? 
											(_.isArray(field[_name]) ? field[_name].concat(_val) : [field[_name], _val]) : _val);
							}
							return field;
						}, {});
				
				var _name = _$.data("output-field") !== undefined ? _$.data("output-field") : _$.attr("name"), 
						_order = _$.data("output-order") ? _$.data("output-order") : false;
						
				if (!_.isEmpty(_field)) values[_name] = (_.has(values, _name) ?
						{
							Values: _.extend(_field, values[_name].Values),
							Order: values[_name].Order === false ? _order : values[_name].Order
						} : {
							Values: _field,
							Order: _order
						});
				
				return values;

			}, {});
		
		};

	var _rehydrate = (form, data) => {

			var value = (el, val) => {

				var simple = _el => {
					if (_el[0].type == "checkbox" || _el[0].type == "radio") {
						if (val) _el.prop("checked", !!(val)).triggerHandler("change");
					} else if (_el[0].nodeName == "BUTTON") { /* <!-- Handle Button Selectors --> */
						var _option = _el.closest("*[data-output-field]").find(`*[data-value='${val}']`);
						_option.length == 1 ? _option.click() : _el.text(val); /* <!-- Defer to click handler if available --> */
					} else {
						_el.val(val) && (_el.is("textarea.resizable")) ?
							autosize.update(_el[0]) : true; /* <!-- Fire autosize if required --> */
					}
					if (val.Items) _.each(_.isArray(val.Items) ? val.Items : [val.Items], item => item);
				};

				var complex = (descendants) => {
					descendants.each(function() {
						var _el = $(this);
						if (_el.parents("*[data-output-name]")[0] === el[0] && val[_el.data("output-name")]) value(_el, val[_el.data("output-name")]); /* <!-- Only Process Direct Descendents --> */
					});
				};

				var descendants = el.find("*[data-output-name]");
				return (descendants.length === 0) ? simple(el) : complex(descendants);

			};

			_.each(form.find(INPUTS), input => { /* <!-- Iterate through all the fields in the form --> */
				var _$ = $(input),
					_name = _$.data("output-field");
				if (_name && data[_name]) {

					var _values = data[_name].Values,
						_targets = _$.find("*[data-output-name]"),
						_text = _$.find("textarea, input[type='text']"),
						_button = _$.find("button.btn-primary");

					_targets.each(function() { /* <!-- Iterate through all the field parts --> */
						var __$ = $(this),
							__name = __$.data("output-name");
						if (__name && _values[__name]) {
							_$.find(`*[data-value='${_values[__name]}']`).closest(".btn").addClass("active").find(".md-inactive").removeClass("md-inactive"); /* <!-- Highlight Active Button --> */
							value(__$, _values[__name]);
						}
					});

					if (_values.Items && _text.length == 1 && _button.length == 1) _.each(_.isArray(_values.Items) ? _values.Items : [_values.Items], item => {
						if (item.Value) _text.val(item.Value) && _button.click(); /* <!-- Iterate through all the Items --> */
					});

				}
			});

			return form;
		};
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    dehydrate: form => _dehydrate(form),
    
    rehydrate: (form, data) => _rehydrate(form, data)
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};