Handlebars = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides handlebars helper methods --> */
  /* <!-- PARAMETERS: Options (see below) --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        STRINGS = factory.Strings();
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _bytes = (bytes, decimals) => {
    if (!bytes || _.isNaN(bytes) || bytes === 0 || bytes === "0") return "";
    var k = 1024,
      dm = decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };
  
  var _compile = (name, raw) => {

    var __compile = html => {

        if (Handlebars.templates === undefined) Handlebars.templates = {};

        /* <!-- Compile and add compiled template to Handlebars Template object --> */
        Handlebars.templates[name] = Handlebars.compile(html, {
          strict: factory.SETUP && factory.SETUP.DEBUG ? true : false,
        });

        /* <!-- Look for partial templates to register/compile too --> */
        var partial_names, partial_regex = /\s?{~?#?>\s?([a-zA-Z]{1}[^\r\n\t\f }]+)/gi;
        while ((partial_names = partial_regex.exec(html)) !== null) {
          if (partial_names && partial_names[1]) {
            if (Handlebars.templates[partial_names[1]] === undefined) {
              Handlebars.registerPartial(partial_names[1], _compile(partial_names[1]));
            } else {
              Handlebars.registerPartial(partial_names[1], Handlebars.templates[partial_names[1]]);
            }
          }
        }

        return Handlebars.templates[name];

      },
      __fetch = () => {

        var _template = $("#__template__" + name);

        if (_template.length === 1) {

          var _html = _template.html();

          return __compile(_html);

        }

      };

    return raw ? __compile(raw) : __fetch();

  };

  var _template = (name, raw) => Handlebars.templates === undefined || Handlebars.templates[name] === undefined ?
      _compile(name, raw) : Handlebars.templates[name];
  
  var _username = name => name && name.length == 3 ? name.split(" ").join("") : name;
  
  var _start = () => {
    
    if (window.Handlebars) {

      Handlebars.registerHelper("username", variable => _username(variable));

      Handlebars.registerHelper("stringify", variable => variable ?
        JSON.stringify(variable) : "");

      Handlebars.registerHelper("encode", variable => variable ?
        factory.url ? factory.url.encode(encodeURIComponent(variable)) : encodeURIComponent(variable) : "");

      Handlebars.registerHelper("humanize", variable => variable ? variable.humanize ?
        variable.humanize() : "" : "");

      Handlebars.registerHelper("string", variable => variable ? variable.toString ?
        variable.toString() : JSON.stringify(variable) : "");

      Handlebars.registerHelper("isString", function(variable, options) {
        if (typeof variable === "string" || variable instanceof String) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("isRegex", function(variable, options) {
        if (variable && typeof variable === "object" && variable.constructor === RegExp) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("isDate", function(variable, options) {
        if (variable && (variable instanceof Date || variable._isAMomentObject ||
            (window.dayjs && dayjs.isDayjs(variable)))) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("isArray", function(variable, options) {
        if (variable && typeof variable === "object" && variable.constructor === Array) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("isObject", function(variable, options) {
        if (variable && typeof variable === "object" && variable.constructor === Object) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("isoDate", (variable, short) => {
        if (!variable) return;
        if (!(variable = (variable._isAMomentObject || (window.dayjs && dayjs.isDayjs(variable)) ?
            variable : variable instanceof Date ? variable : false))) return;
        return (short === true || ((variable.hours ? variable.hours() : variable.getHours()) === 0 && 
          (variable.minutes ? variable.minutes() : variable.getMinutes()) === 0 && 
          (variable.seconds ? variable.seconds() : variable.getSeconds()) === 0 && 
          (variable.milliseconds ? variable.milliseconds() : variable.getMilliseconds()) === 0)) ?
            variable.toISOString(true).split("T")[0] : variable.toISOString(true);
      });

      Handlebars.registerHelper("localeDate", (variable, short) => {
        if (!variable) return;
        if (!(variable = (variable._isAMomentObject || (window.dayjs && dayjs.isDayjs(variable)) ?
            variable.toDate() : variable instanceof Date ? variable : false))) return;
        return (short === true || (variable.getHours() === 0 && variable.getMinutes() === 0 && variable.getSeconds() === 0 && variable.getMilliseconds() === 0)) ?
          variable.toLocaleDateString() : variable.toLocaleString();
      });

      Handlebars.registerHelper("localeTime", variable => {
        if (!variable) return;
        if (!(variable = (variable._isAMomentObject || (window.dayjs && dayjs.isDayjs(variable)) ?
            variable.toDate() : variable instanceof Date ? variable : false))) return;
        return variable.toLocaleTimeString();
      });
      
      Handlebars.registerHelper("localeString", variable => {
        if (variable === null || variable === undefined) return;
        return isNaN(variable) || !variable.toLocaleString ? variable : variable.toLocaleString();
      });

      Handlebars.registerHelper("fromNow", (variable, short) => {
        if (!variable || !(variable._isAMomentObject || (window.dayjs && dayjs.isDayjs(variable)))) return;
        return short === true ? variable.fromNow(true) : variable.fromNow();
      });

      Handlebars.registerHelper("formatBytes", variable => {
        if (variable && !isNaN(variable) && variable > 0) return _bytes(variable, 2);
      });

      Handlebars.registerHelper("formatYaml", (variable, field) => {
        if (variable !== null && variable !== undefined && window.jsyaml)
          return jsyaml.safeDump(_.omit(variable[field] || variable, (value, key) => value === null || value === undefined || key == "__class"), {
            skipInvalid: true
          });
      });

      Handlebars.registerHelper("exists", function(variable, options) {
        if (typeof variable !== "undefined") {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("contains", function(variable, contains, options) {
        if (variable && (
            (typeof variable === "object" && variable.constructor === Array) ||
            (typeof variable === "string" || variable instanceof String)
          ) && variable.indexOf(contains) >= 0) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("startsWith", function(variable, contains, options) {
        if (variable && (
            (typeof variable === "object" && variable.constructor === Array) ||
            (typeof variable === "string" || variable instanceof String)
          ) && variable.indexOf(contains) === 0) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("absent", function(variable, options) {
        if (typeof variable === "undefined" ||
          variable === null ||
          (variable.constructor === Object && Object.keys(variable).length === 0) ||
          (variable.constructor === Array && variable.length === 0) ||
          ((typeof variable === "string" || variable instanceof String) && variable == "")) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("present", function(variable, options) {
        if (typeof variable !== "undefined" &&
          variable !== null &&
          !(variable.constructor === Object && Object.keys(variable).length === 0) &&
          !(variable.constructor === Array && variable.length === 0) && 
          !((typeof variable === "string" || variable instanceof String) && variable === "")) {
          return options.fn ? options.fn(this) : true;
        } else {
          return options.inverse ? options.inverse(this) : false;
        }
      });

      Handlebars.registerHelper("is", function(v1, operator, v2, options) {

        if (arguments.length < 3) throw new Error("IS expects 2 or 3 parameters");
        if (options === undefined) {
          options = v2;
          v2 = operator;
          operator = v2 && v2.toLowerCase && (v2.toLowerCase() == "odd" || v2.toLowerCase() == "even") ?
            "is" : "===";
        }

        var fn = STRINGS.operators[operator];
        if (!fn) throw new Error(`IS doesn't understand the operator ${operator}`);
        return fn(v1, v2) ?
          options.fn ? options.fn(this) : true :
          options.inverse ? options.inverse(this) : false;

      });

      Handlebars.registerHelper("choose", (a, b, _default) => {
        var _b, _a = String(a);
        try {
          _b = JSON.parse(b);
        } catch (e) {
          _b = {};
        }
        return _b[_a] ? _b[_a] : _default ? _default : "";
      });

      Handlebars.registerHelper("length", variable => variable ? variable.length !== null && variable.length !== undefined ? variable.length : _.isObject(variable) ? _.keys(variable).length : 0 : 0);
      
      Handlebars.registerHelper("which", (which, a, b) => which ? a : b);

      Handlebars.registerHelper("add", (add, a, b) => add ? a + b : a);

      Handlebars.registerHelper("concat", function() {
        return _.reduce(Array.prototype.slice.call(arguments, 0, arguments.length - 1),
          (m, a) => _.isObject(a) ? m : (m + a), "");
      });

      Handlebars.registerHelper("val", function(_default) {
        var _val = _.find(Array.prototype.slice.call(arguments, 1, arguments.length - 1), arg => arg !== undefined && arg !== null);
        return _val === undefined ? _default : _val;
      });

      Handlebars.registerHelper("any", function() {
        return _.some(Array.prototype.slice.call(arguments, 0, arguments.length - 1),
          a => a !== undefined && a !== null && a !== false);
      });

      Handlebars.registerHelper("all", function() {
        return _.every(Array.prototype.slice.call(arguments, 0, arguments.length - 1),
          a => a !== undefined && a !== null && a !== false);
      });

      Handlebars.registerHelper("none", function() {
        return _.every(Array.prototype.slice.call(arguments, 0, arguments.length - 1),
          a => a === undefined || a === null || a === false);
      });

      Handlebars.registerHelper("either",
        (a, b) => (_.isUndefined(a) || _.isNull(a) || a === "") ? b : a);

      Handlebars.registerHelper("replace", (value, replace, replacement) =>
        value ? value.replace(new RegExp(replace, "g"), replacement) : "");

      Handlebars.registerHelper("inc", (number, options) => {
        if (typeof(number) === "undefined" || number === null) return null;
        return number + (options && options.hash.inc || 1);
      });
      
      Handlebars.registerHelper("truncate", (value, length, ending) =>
        value && _.isString(value) ? value.length > length ? `${value.substring(0, length - 1)}${ending}` : value : "");

      Handlebars.registerHelper("lowercase", value => value && value.toLowerCase ? value.toLowerCase() : value);
      
      Handlebars.registerHelper("uppercase", value => value && value.toUpperCase ? value.toUpperCase() : value);

      Handlebars.registerHelper("falsy", value => !value);
      
      Handlebars.registerHelper("truthy", value => !!value);
      
      Handlebars.registerHelper("resolve", function() {
        return _.reduce(Array.prototype.slice.call(arguments, 1, arguments.length - 1), 
          (memo, property) => memo ? memo[property] : null, Array.prototype.slice.call(arguments, 0, 1)[0]);
      });
      
      /* <!-- Map all templates as Partials too --> */
      if (Handlebars.templates) Handlebars.partials = Handlebars.templates;

    }
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Functions --> */
  _start();
  /* <!-- Initial Functions --> */
  
  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    compile: _compile,
    
    template: _template,
    
    username: _username,
    
    bytes: _bytes,
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};