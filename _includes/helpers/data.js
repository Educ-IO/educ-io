Data = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Form data to/from JSON Object --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.fields: Array of Selectors to select input fields / blocks [Optional]  --> */
  /* <!-- @options.inputs: Array of Selectors to select inputs (the children of fields) [Optional]  --> */
  /* <!-- @factory.Flags: Function to create a fields helper object --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      fields: [ /* <!-- Array of Selectors to pick up Input Fields / Groups for processing --> */
        "*[data-output-field]",
        ":input[data-output-name]:enabled",
        ":input[name]:enabled",
      ].join(", "),
      inputs: [ /* <!-- Array of Selectors to pick up child Inputs --> */
        "input",
        "textarea",
        "select",
      ].join(", "),
    },
    DEBUG = factory.Flags && factory.Flags.debug(),
    LOG = DEBUG ? factory.Flags.log : () => false;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Set-Up --> */
  if (!$.expr[":"].parents) $.expr[":"].parents = (a, i, m) => $(a).parents(m[3]).length > 0;
  /* <!-- Internal Set-Up --> */

  /* <!-- Internal Functions --> */
  var _dehydrate = form => {

    var valid = value => value === true || value === false || _.isNumber(value) || !_.isEmpty(value),
      set = (field, name, value) => _.tap(field, field =>
        field[name] = (field[name] === undefined || field[name] === null ? value :
          (_.isArray(field[name]) ? field[name].concat(value) : [field[name], value]))),
      value = el => {
        var simple = el => {
          var _type = el.data("output-type") || el.prop("type") || "string",
            _val = (el[0].type == "checkbox" && el.is("input:indeterminate")) ? "all" :
            (el[0].type == "checkbox" || el[0].type == "radio") ? el.prop("checked") :
            (el[0].nodeName == "P" || el[0].nodeName == "DIV" ||
              el[0].nodeName == "SPAN" || el[0].nodeName == "I") ?
            el.text().trim() : (el[0].nodeName == "A") ? {
              Id: el.prop("id"),
              Url: el.prop("href"),
              Text: el.text()
            } : (el[0].nodeName == "IMG") ? {
              Url: el.prop("src")
            } : (el[0].nodeName == "BUTTON") ?
            (el.data("default") && el.data("default") == el.text()) ? null : el.text().trim() :
            el.val();

          /* <!-- DEBUG: Log Return Value --> */
          if (DEBUG) LOG(`Returning Simple Value: ${JSON.stringify(_val)} of type ${_type} from element`, el);

          /* <!-- TODO: Handle Parsing of types here --> */
          return _val !== "" ?
            _type == "date" ? window.moment ? moment(_val) : _val :
            _type == "datetime" ? _val :
            _type == "number" ? Number(_val) :
            _val : _val;
        };

        var complex = descendants => {
          var _val = {};
          _.each(descendants, descendant => {
            var _el = $(descendant);
            /* <!-- Only Process Direct Descendents --> */
            if (_el.parents("*[data-output-name]")[0] === el[0]) {
              var __val = value(_el);
              if (!_.isEmpty(__val)) _val = set(_val, _el.data("output-name"), __val);
            }
          });
          return _val;
        };

        var descendants = el.find("*[data-output-name]");

        /* <!-- DEBUG: Log Requesting Value --> */
        if (DEBUG) LOG(`Requesting Value (${descendants.length} descendants) from:`, el);

        return el && el.length > 0 ? (descendants.length === 0) ? simple(el) : complex(descendants) : null;

      };

    /* <!-- DEBUG: Exclude Inputs already parented by an output-field --> */
    var _all = form.find(options.fields).not(":parents([data-output-field])");

    /* <!-- DEBUG: Log Dehydrating Start --> */
    if (DEBUG) LOG(`Dehydrating Form with ${_all.length} field/s:`, form);

    return _.reduce(_all, (values, input) => {

      var _$ = $(input),
        _inputs = _$.find("*[data-output-name]"),
        _multiple = _inputs.length > 1,
        _field = _.reduce(_multiple ? _inputs : [_$.is(":input") ? input : _$.find(options.inputs)[0]],
          (field, input) => {
            var _$ = $(input);
            /* <!-- Only Process Top-Level Values --> */
            if (_$.parents("*[data-output-name]").length < 1) {
              var _val = value(_$),
                _name = _$.data("output-name") ? _$.data("output-name") : "Value";
              if (valid(_val)) field = _multiple ? set(field, _name, _val) : _val;
            }
            return field;
          }, {});

      /* <!-- DEBUG: Log Dehydrating Field --> */
      if (DEBUG) LOG(`Dehydrating Field Element with ${_inputs.length} child input/s, creating Field Value = ${JSON.stringify(_field)} :`, input);

      var _name = _$.data("output-field") !== undefined ? _$.data("output-field") : _$.attr("name"),
        _order = _$.data("output-order") ? _$.data("output-order") : false;

      /* <!-- DEBUG: Log Dehydrating Start --> */
      if (DEBUG) LOG(`Field has name = ${_name} and order = ${_order}:`);

      if (_name && valid(_field)) values[_name] = (_.has(values, _name) ? {
        Values: _.extend(_field, values[_name].Values),
        Order: values[_name].Order === false ? _order : values[_name].Order
      } : (_.isObject(_field) && !_field._isAMomentObject) ? {
        Values: _field,
        Order: _order
      } : {
        Value: _field,
        Order: _order
      });

      /* <!-- DEBUG: Log Dehydrating Start --> */
      if (DEBUG) LOG(`Returning Values Object = ${JSON.stringify(values)}`);

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

    _.each(form.find(options.fields), input => { /* <!-- Iterate through all the fields in the form --> */
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