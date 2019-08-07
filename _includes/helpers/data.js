Data = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Form data to/from JSON Object --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.fields: Array of Selectors to select input fields / blocks [Optional]  --> */
  /* <!-- @options.inputs: Array of Selectors to select inputs (children of fields) [Optional]  --> */
  /* <!-- @options.always: Whether to always output booleans (e.g. === false) [Optional]  --> */
  /* <!-- @factory.Flags: Function to create a fields helper object --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags, Dates --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      /* <!-- Array of Selectors to pick up Input Fields / Groups for processing --> */
      fields: [
        "[data-output-field]",
        "[data-holder-field]",
        ":input[data-output-name]:enabled",
        ":input[name]:enabled",
      ].join(", "),
      /* <!-- Array of Selectors to pick up child Inputs --> */
      inputs: [
        "input",
        "textarea",
        "select",
      ].join(", "),
      always: false,
    },
    DEBUG = factory.Flags && factory.Flags.debug(),
    LOG = DEBUG ? factory.Flags.log : () => false,
    ERROR = factory.Flags.error,
    GET = (id, parent) => {
      var ids = id.indexOf("||") > 0 ? id.split("||") : [id];
      var selector = _.reduce(ids, (memo, id) => `${memo ? `${memo}, `: ""}#${id}, #${id} > input`, "");
      return (parent ? parent : $)(selector);
    },
    MAGIC = "*",
    HIDDEN = "__hidden";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Set-Up --> */
  if (!$.expr[":"].parents) $.expr[":"].parents = (a, i, m) => $(a).parents(m[3]).length > 0;
  /* <!-- Internal Set-Up --> */

  /* <!-- Internal Functions --> */
  var _descendants = (el, holders, include_hidden) => el.find(`[data-output-name]${holders ? ", [data-holder-field]" : "" }`)
    .filter((i, val) => {
      var _val = $(val);
      return _val.parentsUntil(el, "[data-output-name]").length === 0 &&
        _val.parentsUntil(el.is("[data-output-field]") ?
          el : el.closest("[data-output-field]"))
        .filter((i, parent) => {
          var _parent = $(parent);
          var _hidden = _parent.css("display") == "none" && _parent.is("[class*='-none'][class*='d-']");
          if (_hidden) {
            _val.data(HIDDEN, true);
          }
          return include_hidden === true ? false : _hidden;
        }).length === 0;
    }),
    _valid = (value, positives) =>
    value === true || (options.always || !positives) && value === false ||
    _.isNumber(value) || !_.isEmpty(value);

  var _dehydrate = form => {

    var set = (field, name, value) => _.tap(field,
        field => field[name] = (field[name] === undefined || field[name] === null ? value :
          (_.isArray(field[name]) ?
            field[name].length === 1 && field[name][0] == value ?
            field[name] : field[name].concat(value) :
            field[name] === value ? field[name] : [field[name], value]))),
      value = el => {
        var simple = el => {
          var _type = el.data("output-type") || el.prop("type") || "string",
            _val = (el[0].type == "range" && el.data("value") === false) ? null :
            (el[0].type == "checkbox" && el.is("input:indeterminate")) ?
            el.data("output-always") ? "" : "all" :
            (el[0].type == "checkbox" || el[0].type == "radio") ? el.prop("checked") :
            (el[0].nodeName == "P" || el[0].nodeName == "DIV" ||
              el[0].nodeName == "SPAN" || el[0].nodeName == "I") ?
            el.text().trim() : (el[0].nodeName == "A") ? {
              Id: el.prop("id"),
              Url: el.prop("href"),
              Text: el.text().trim()
            } : (el[0].nodeName == "IMG") ? {
              Url: el.prop("src")
            } : (el[0].nodeName == "BUTTON") ?
            (el.data("default") && el.data("default") == el.text().trim()) ? null : el.text().trim() :
            el.val();

          /* <!-- DEBUG: Log Return Value --> */
          if (DEBUG) LOG(`Returning Simple Value: ${JSON.stringify(_val)} of type ${_type} from element`, el);

          /* <!-- TODO: Handle Parsing of types here --> */
          return _val !== "" ?
            _type == "date" ? factory.Dates.parse(_val) :
            _type == "datetime" ? _val :
            _type == "number" ? Number(_val) :
            _type == "boolean" ? (_val === "true") :
            _val : _val;
        };

        var complex = descendants => {

          var _val = {};
          _.each(descendants, descendant => {
            var _el = $(descendant),
              __val = value(_el);

            /* <!-- This will normally exclude (=== false) values --> */
            if (_valid(__val, !_el.data("output-always"))) {
              var _name = _el.data("output-name"),
                _type = ((_type = el.data("template")) ? _type : false);
              if (_type) _val.__type = _type;
              _val = set(_val, _name, __val);
            }

          });
          return _val;
        };

        /* <!-- Only Process Direct Descendents --> */
        var descendants = _descendants(el);

        /* <!-- DEBUG: Log Requesting Value --> */
        if (DEBUG) LOG(`Requesting Value (${descendants.length} descendants) from:`, el);

        return el && el.length > 0 ? (descendants.length === 0) ?
          simple(el) : complex(descendants) : null;

      };

    /* <!-- DEBUG: Exclude Inputs already parented by an output-field --> */
    var _all = form.find(options.fields).not(":parents([data-output-field])");

    /* <!-- DEBUG: Log Dehydrating Start --> */
    if (DEBUG) LOG(`Dehydrating Form with ${_all.length} field/s:`, form);

    var _return = _.reduce(_all, (values, input) => {

      var _$ = $(input),
        _inputs = _descendants(_$),
        _multiple = _inputs.length > 1,
        _field = _.reduce(_multiple ? _inputs : [_$.is(":input") ? input :
            _inputs.length == 1 ? _inputs[0] :
            _$.find(options.inputs)[0]
          ],
          (field, input) => {
            var _$ = $(input),
              _val = value(_$);

            /* <!-- This will normally exclude (=== false) values --> */
            if (_valid(_val, !_$.data("output-always"))) {
              var _type = ((_type = _$.data("template")) ? _type : false),
                _name = _$.data("output-name");
              if (_type && _.isObject(_val)) _val.__type = _type;

              field = _multiple || (_name && _name !== "Value") ?
                set(field, _name ? _name : "Value", _val) :
                _val;
            }

            return field;
          }, {});

      /* <!-- DEBUG: Log Dehydrating Field --> */
      if (DEBUG) LOG(`Dehydrating Field Element with ${_inputs.length} child input/s, creating Field Value = ${JSON.stringify(_field)} :`, input);

      var _name = _$.data("output-field") !== undefined ?
        _$.data("output-field") : _$.attr("name"),
        _order = _$.data("output-order") ? _$.data("output-order") : false,
        _type = _$.data("template") ? _$.data("template") : false;

      /* <!-- DEBUG: Log Dehydrating --> */
      if (DEBUG) LOG(`Field has name = ${_name} and order = ${_order}:`);

      if (_name && _valid(_field)) values[_name] = (_.has(values, _name) ? {
        Values: _.extend(_field, values[_name].Values),
        __order: values[_name].Order === false ? _order : values[_name].Order,
        __type: values[_name].Type === false ? _type : values[_name].Type
      } : _.isObject(_field) && !(_field._isAMomentObject || (window.dayjs && dayjs.isDayjs(_field))) ? {
        Values: _field[MAGIC] ? _field[MAGIC] : _field,
        __order: _order,
        __type: _type
      } : {
        Value: _field,
        __order: _order,
        __type: _type
      });

      /* <!-- DEBUG: Log Dehydrating Value --> */
      if (DEBUG) LOG(`Returning Values Object = ${JSON.stringify(values)}`);

      return values;

    }, {});

    /* <!-- DEBUG: Log Dehydrating Complete --> */
    if (DEBUG) LOG("== DE-HYDRATION COMPLETE ==", _return);

    return _return;

  };

  var _rehydrate = (form, data) => {

    var value = (el, val) => {

      var simple = _el => {
        if (el[0].type == "range" && el.data("value") === false) el.data("value", true);
        if (_el[0].type == "checkbox" || _el[0].type == "radio") {
          if (val || el.data("output-always")) {
            _el.prop("checked", !!(val))
              .prop("indeterminate", false)
              .triggerHandler("change");
            if (_el.data("reveal")) GET(_el.data("reveal")).show();
          }
        } else if (_el[0].nodeName == "BUTTON") { /* <!-- Handle Button Selectors --> */
          var __field = _el.closest("*[data-output-field]"),
            _option = __field.find(`*[data-value='${$.escapeSelector(val)}'][data-targets='${$.escapeSelector(_el[0].id)}']`);

          var _hidden = _option.data(HIDDEN) || _el.data(HIDDEN) ||
            _option.parentsUntil(__field)
            .filter((i, parent) => $(parent).data(HIDDEN) === true).length !== 0;

          /* <!-- Set text in all cases but also use click handler if available --> */
          !_hidden && _option.length == 1 ? _el.text(val) && _option[0].click() : _el.text(val);

        } else {
          var _holder = ((_holder = _el.data("holder-field")) ? _holder : false);
          if (_holder) {
            var _name = ((_name = _el.data("output-name")) ? _name : false),
              _val = _name ? val[_holder] : val;
            if (_val) _.each(_.isArray(_val) ? _val : [_val], item => {
              if (item.__type) {
                try {
                  var _template = _.extend(item, {
                    template: item.__type,
                    field: _holder,
                  });
                  if (_el.data("readonly")) _template.readonly = true;
                  _template = factory.Display.template.get(_template);
                  $(_template).appendTo(_el);
                } catch (e) {
                  ERROR("Item Templating Error", e);
                }
              }
            });
          } else {

            _el.val(val) && (_el.is("textarea.resizable")) ?
              autosize.update(_el[0]) : true; /* <!-- Fire autosize if required --> */

            /* <!-- Highlight Active Button --> */
            el.parent()
              .closest("*[data-output-name], *[data-output-field]")
              .find(`*[data-value='${$.escapeSelector(val)}']`)
              .closest(".btn")
              .addClass("active")
              .attr("aria-pressed", "true")
              .find(".md-inactive")
              .removeClass("md-inactive");
          }
        }
      };

      var complex = descendants => _.each(descendants, el => {
        var _el = $(el),
          _data = (_data = _el.data("output-name")) || _el.data("holder-field");
        if (_valid(val[_data], !_el.data("output-always"))) value(_el, val[_data]);
      });

      /* <!-- Only Process Direct Descendents --> */
      var descendants = _descendants(el, true, true);
      return (descendants.length === 0) ? simple(el) : complex(descendants);

    };

    /* <!-- Iterate through all the fields in the form --> */
    _.each(form.find(options.fields), input => {
      var _$ = $(input),
        _name = _$.data("output-field");

      if (_name && data[_name]) {

        var _values = ((_values = data[_name].Values) ? _values : {
            "Value": data[_name].Value
          }),
          _targets = _descendants(_$, true, true);

        /* <!-- Iterate through all the field parts --> */
        _.each(_targets, el => {
          var __$ = $(el),
            __name = (__name = __$.data("output-name")) || __$.data("holder-field");
          if (__name && _valid(_values[__name], !__$.data("output-always"))) value(__$, _values[__name]);
        });

      }
    });

    /* <!-- DEBUG: Log Rehydrating Complete --> */
    if (DEBUG) LOG("== RE-HYDRATION COMPLETE ==", form);

    return form;
  };
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    dehydrate: form => _dehydrate(form),

    rehydrate: (form, data) => _rehydrate(form, data),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};