Display = function() {

  /* <!-- DEPENDS on JQUERY & HANDLEBARS to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Display)) return new this.Display().initialise(this);

  /* <!-- Internal Constants --> */
  const MAX_ITEMS = 6;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _root, _state = {},
    _debug = false,
    _log = false;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _commarise = value => {
    var s = (value += "").split("."),
      a = s[0],
      b = s.length > 1 ? "." + s[1] : "",
      r = /(\d+)(\d{3})/;
    while (r.test(a)) a = a.replace(r, "$1" + "," + "$2");
    return a + b;
  };

  var _arrayize = (value, test) => value && test(value) ? [value] : value;

  var _bytes = (bytes, decimals) => {
    if (!bytes || _.isNaN(bytes) || bytes === 0 || bytes === "0") return "";
    var k = 1024,
      dm = decimals || 2,
      sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  var _calculate = element => {
    var _o = element.offset(),
      _l = _o.left,
      _w = element.width(),
      _r = _l + _w,
      _t = _o.top,
      _h = element.height(),
      _b = _t + _h,
      _width = $(window).width(),
      _height = $(window).height();
    return (_l < _w && (_width - _r) < _w) || _t < _h ?
      _t > (_height - _b) ? "top" : "bottom" :
      _l > (_width - _r) ? "left" : "right";
  };

  var _top = () => (document.scrollingElement || document.documentElement).scrollTop;

  var _drag = () => {
    var div = document.createElement("div");
    return ("draggable" in div) || ("ondragstart" in div && "ondrop" in div);
  };

  var _placement = (show, trigger) => $(trigger).data("placement") ? $(trigger).data("placement") : _calculate($(trigger));

  var _popovers = (targets, options) => targets.popover(_.defaults(options ? options : {}, {
    trigger: "focus"
  }));

  var _tooltips = (targets, options) => targets.tooltip(_.defaults(options ? options : {}, {
    placement: _placement
  }));

  var _routes = targets => targets.off("click.route").on("click.route", e => {
    e.preventDefault();
    e.stopPropagation();
    var _this = $(e.currentTarget),
      _route = _this.data("route");
    if (_route) {
      var _command = $(`nav a[href='#${_route}']:not(.disabled), nav a[href^='#'][href$=',${_route}']:not(.disabled)`);
      _command && _command.prop("onclick") ?
        _command.first().click() :
        _command ?
        _command[0].click() : window.location.hash = `#${_route}`;
    }
  });

  var _target = options => {

    /* <!-- Ensure we have a target _element, and that it is wrapped in JQuery --> */
    var _element = (options && options.target) ? options.target : (_root ? _root : $("body"));
    if (_element instanceof jQuery !== true) _element = $(_element);
    return _element;

  };

  var _compile = (name, raw) => {

    var __compile = html => {

        if (Handlebars.templates === undefined) Handlebars.templates = {};

        /* <!-- Compile and add compiled template to Handlebars Template object --> */
        Handlebars.templates[name] = Handlebars.compile(html, {
          strict: _debug
        });

        /* <!-- Look for partial templates to register/compile too --> */
        var partial_names, partial_regex = /\s?{#?>\s?([a-zA-Z]{1}[^\r\n\t\f }]+)/gi;
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

        if (_template.length == 1) {

          var _html = _template.html();

          return __compile(_html);

        }

      };

    return raw ? __compile(raw) : __fetch();

  };

  var _template = (name, raw) => {

    return Handlebars.templates === undefined || Handlebars.templates[name] === undefined ?
      _compile(name, raw) : Handlebars.templates[name];

  };

  var _process = value => {
    _popovers(value.find("[data-toggle='popover']"));
    _tooltips(value.find("[data-toggle='tooltip']"));
    _routes(value.find("a[data-route], button[data-route], input[data-route]"));
    return value;
  };

  var _clean = () => $(".modal-backdrop").remove() && $(".modal-open").removeClass("modal-open"); /* <!-- Weird Modal Not Hiding Bug --> */

  var _toggle = (state, toggle, container) => {
    var _$ = (container ? container.find : $);
    _$(".state-" + state).toggleClass("disabled", !toggle);
    _$(".hide-" + state).toggleClass("d-none", toggle);
    _$(".show-" + state).toggleClass("d-none", !toggle);
    return true;
  };

  var _breakpoint = size => $(`div.bs-breakpoints span.${size}`).css("display") == "block";

  var _username = name => name && name.length == 3 ? name.split(" ").join("") : name;

  var _dialog = (dialog, options, handler) => {

    if ((options.actions || options.handlers) &&
      dialog.find("button[data-action], a[data-action]").length > 0) {
      _.each(dialog.find("button[data-action], a[data-action]"), el => {
        $(el).on("click.action", e => {
          var _target = $(e.currentTarget),
            _action = _target.data("action");
          if (_action.indexOf("actions_") === 0) {
            _action = $(e.target).data("action").split("_");
            if (_action[0] == "actions") options.actions[_action[1]].handler(handler ?
              handler() : dialog.find("form").serializeArray());
          } else if (options.handlers && options.handlers[_action]) {
            options.handlers[_action](_target, dialog, options);
          }
        });
      });
    }

    if ((options.updates) &&
      dialog.find("input[data-action], textarea[data-action]").length > 0) {
      _.each(dialog.find("input[data-action], textarea[data-action]"), el => {
        $(el).on("input.action", e => {
          var _target = $(e.currentTarget),
            _action = _target.data("action");
          if (options.updates[_action]) options.updates[_action](_target, dialog, options);
        });
      });
    }

  };
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get Reference to Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Debug Flag, used for Template Compile etc --> */
      if (container.SETUP && container.SETUP.DEBUG) _debug = true;

      /* <!-- Set Root Element Reference--> */
      _root = (container._root) ? document.getElementById(container._root) : document.body;

      /* <!-- Set Container Reference to this --> */
      container.Display = this;

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: () => {

      /* <!-- Set Logging State --> */
      if (ಠ_ಠ.Flags && ಠ_ಠ.Flags.debug()) _log = ಠ_ಠ.Flags.log;

      if (window.Handlebars) {

        Handlebars.registerHelper("username", variable => _username(variable));

        Handlebars.registerHelper("stringify", variable => variable ?
          JSON.stringify(variable) : "");

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
          if (variable && (variable instanceof Date || variable._isAMomentObject)) {
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

        Handlebars.registerHelper("localeDate", (variable, short) => {
          if (!variable) return;
          if (!(variable = (variable._isAMomentObject ? variable.toDate() : variable instanceof Date ? variable : false))) return;
          return (short || (variable.getHours() === 0 && variable.getMinutes() === 0 && variable.getSeconds() === 0 && variable.getMilliseconds() === 0)) ? variable.toLocaleDateString() : variable.toLocaleString();
        });

        Handlebars.registerHelper("formatBytes", variable => {
          if (variable && !isNaN(variable) && variable > 0) return _bytes(variable, 2);
        });

        Handlebars.registerHelper("formatYaml", (variable, field) => {
          if (variable !== null && variable !== undefined && window.jsyaml)
            return jsyaml.safeDump(variable[field] || variable, {
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

        Handlebars.registerHelper("present", function(variable, options) {
          if (typeof variable !== "undefined" &&
            variable !== null &&
            !(variable.constructor === Object && Object.keys(variable).length === 0) &&
            !(variable.constructor === Array && variable.length === 0)) {
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

          var operators = {
            "==": (a, b) => a == b,
            "===": (a, b) => a === b,
            "!=": (a, b) => a != b,
            "!==": (a, b) => a !== b,
            "<": (a, b) => a < b,
            "lt": (a, b) => a < b,
            ">": (a, b) => a > b,
            "gt": (a, b) => a > b,
            "<=": (a, b) => a <= b,
            "lte": (a, b) => a <= b,
            ">=": (a, b) => a = b,
            "gte": (a, b) => a = b,
            "~=": (a, b) => a == b || a && b && a.toUpperCase() == b.toUpperCase(),
            "typeof": (a, b) => typeof a == b,
            "and": (a, b) => a && b,
            "or": (a, b) => a || b,
            "is": (a, b) => (a % 2 === 0 ? b.toLowerCase() == "even" : b.toLowerCase() == "odd"),
            "in": (a, b) => {
              var _b, _a = String(a);
              try {
                _b = JSON.parse(b);
              } catch (e) {
                b = {};
              }
              return _b[_a];
            },
            "eq": (a, b) => _.isEqual(a, b)
          };

          if (!operators[operator]) throw new Error(`IS doesn't understand the operator ${operator}`);
          return operators[operator](v1, v2) ?
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

        /* <!-- Map all templates as Partials too --> */
        if (Handlebars.templates) Handlebars.partials = Handlebars.templates;

      }

      /* <!-- Enable Tooltips & Popovers --> */
      _popovers($("[data-toggle='popover']"));
      _popovers($("#site_nav [data-toggle='popover']"), {
        trigger: "hover"
      });
      _tooltips($("[data-toggle='tooltip']"));

      /* <!-- Enable Closing Bootstrap Menu after Action --> */
      var navMain = $(".navbar-collapse");
      navMain.on("click.collapse", "a:not([data-toggle='dropdown'])", () => navMain.collapse("hide"));
      navMain.on("click.tooltip-remove", "a[data-toggle='tooltip']", (e) => $(e.target).tooltip("dispose"));

    },

    username: _username,

    popovers: (targets, options) => _popovers(targets, options),

    tooltips: (targets, options) => _tooltips(targets, options),

    commarise: value => _commarise(value),

    highlight: () => {

      if (ಠ_ಠ.Flags.highlight()) {
        var _none = "highlight_none order-2";
        var _highlight = "order-1";
        $(".highlight_all").addClass(_none).removeClass(_highlight)
          .filter(".highlight_" + ಠ_ಠ.Flags.highlight().toLowerCase()).removeClass(_none).addClass(_highlight);
      }

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

        options = _.isString(options) || _.isArray(options) ? {
          name: options
        } : options;

        var _get = name => $("#__doc__" + name)[0].innerText;
        var _doc = _.isArray(options.name) ?
          _.reduce(options.name, (doc, name) => `${doc}\n\n${_get(name)}`, "") :
          _get(options.name);

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
        var _return = $(this.get(options));

        return options.prepend === true ? _return.prependTo(_element) : _return.appendTo(_element);

      },

    },

    template: {

      compile: _template,

      get: options => {

        return (_ && _.isString(options)) ? _template(options) : _template(options.template ? options.template : options.name)(options);

      },

      show: function(options) {

        /* <!-- Ensure we have a target object, and that it is wrapped in JQuery --> */
        var _element = options.clear === true ? _target(options).empty() : _target(options);
        var _return = _process($(this.get(options)));

        return options.prepend === true ? _return.prependTo(_element) : _return.appendTo(_element);

      },

      process: _process,

    },

    drag: _drag,

    top: _top,

    size: {

      is: {

        xs: () => _breakpoint("xs"),

        sm: () => _breakpoint("sm"),

        md: () => _breakpoint("md"),

        lg: () => _breakpoint("lg"),

        xl: () => _breakpoint("xl"),

      },

      resizer: {

        height: (measure, target, property, bottom, source) => {

          var _resize = () => {

            /* <!-- Handle Screen / Window Resize Events --> */
            var _source = source ? source : window,
              _resizer = () => {
                var _height = 0;
                _.each($(measure), el => {
                  _height += $(el).outerHeight(true);
                });
                $(target).css(property ? property : "max-height", $(_source).height() - _height -
                  ((bottom !== null && bottom !== undefined) ? bottom : 20));
              };
            var _resize_Timeout = 0;
            $(_source).off("resize.height").on("resize.height", () => {
              clearTimeout(_resize_Timeout);
              _resize_Timeout = setTimeout(_resize, 50);
            });
            _resizer();

            return () => $(_source).off("resize.height");

          };

          return _resize();

        },

      },

    },

    /* <!--
    	Options are : {
    	}
    --> */
    notify: function(options) {

      return new Promise((resolve, reject) => {

        if (!options) return reject();
        options = _.isString(options) ? {
          title: ಠ_ಠ.Flags.dir().toUpperCase(),
          content: options
        } : options;

        var notification = $(_template("notify")(options));
        _target(options).append(notification);

        /* <!-- Set Basic Event Handlers --> */
        notification.on("shown.bs.toast", () => resolve());
        notification.on("hidden.bs.toast", () => notification.remove());

        /* <!-- Show the Modal Dialog --> */
        notification.toast("show");

      });

    },

    /* <!--
    	Options are : {
    		target : element to append the loader to,
    		clear : optional boolean to force clearing,
    	}
    --> */
    busy: function(options) {

      options = options ? options : {};
      var _element = _target(options),
        _status;
      var _clear = (options && options.clear === true) || _element.find(".loader").length > 0,
        _loader = _clear ?
        options.clear = true && _element.find(".loader").remove() :
        _element.prepend(_template("loader")(options ? options : {})),
        _handler;

      if (options && options.status) {
        _status = _loader.find(".status");
        if (_.isString(options.status)) {
          /* <!-- Status is a string, so display it	--> */
          _status.text(options.status);
        } else {
          /* <!-- Status should describe an event to listen for	--> */
          var _source = options.status.source ? options.status.source : window;
          _handler = options.__statusHandler ? options.__statusHandler : e => _status.text(options.status.value ? options.status.value(e.detail) : e.detail);
          _source[_clear ? "removeEventListener" : "addEventListener"](options.status.event, _handler, false);
        }
      }

      return options && !options.clear && (options === true || options.fn === true) ? ((fn, opts) => {
        opts.clear = true;
        if (_handler) opts.__statusHandler = _handler;
        opts.__return = this;
        return value => value && value.message ? _status.text(value.message) : fn(opts);
      })(this.busy, options === true ? {} : options) : options && options.__return ? options.__return : this;

    },

    /*
    	Options are : {

    	}
    */
    confirm: options => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("confirm")(options));
        _target(options).append(dialog);

        /* <!-- Set Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary").click(() => _clean() && resolve(true));
        dialog.on("hidden.bs.modal", () => dialog.remove() && reject());

        /* <!-- Show the Modal Dialog --> */
        dialog.modal("show");

      });

    },

    /*
			Options are : {

			}
		*/
    inform: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("inform")(options));
        _target(options).append(dialog);

        /* <!-- Set Shown Event Handler (if present) --> */
        if (shown) dialog.on("shown.bs.modal", () => shown(dialog));

        /* <!-- Set Basic Event Handlers --> */
        dialog.on("hidden.bs.modal", () => dialog.remove() && resolve());

        /* <!-- Show the Modal Dialog --> */
        dialog.modal("show");

      });

    },

    /*
    	Options are : {

    	}
    */
    modal: (template, options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template(template)(options));
        _target(options).append(dialog);

        if (dialog.find("form").length > 0) {

          /* <!-- Set Form / Return Event Handlers --> */
          if (dialog.find(".modal-footer button.btn-primary").length > 0) {

            dialog.find(".modal-footer button.btn-primary").on("click.submit", e => {

              var _valid = true;
              _.each(dialog.find("form.needs-validation"), form => {
                if (form.checkValidity() === false) _valid = false;
                form.classList.add("was-validated");
              });

              /* <!-- NOTES: Reliance on serializeArray can be removed once all Apps are ready for dyhydrated objects (e.g. Folders) --> */
              var _form = dialog.find("form"),
                _values = ಠ_ಠ.Data ? ಠ_ಠ.Data({}, ಠ_ಠ).dehydrate(_form) : _form.serializeArray();
              if (!ಠ_ಠ.Data) _.each(_form.find("input:indeterminate"), el => _values.push({
                name: el.name,
                value: "all"
              }));

              /* <!-- Log is available, so debug log --> */
              if (_log) _log(`Parsed Values from Template: ${template} using ${ಠ_ಠ.Data ? "the Data helper" : "serializeArray"}`, _values);

              if (options.validate && !options.validate(_values)) _valid = false;
              if (_valid) {
                _clean();
                resolve(_values);
              } else {
                e.preventDefault();
                e.stopPropagation();
              }
            });

          }

          /* <!-- Wire Up Action and Update Handlers --> */
          _dialog(dialog, options);

        }

        /* <!-- Modal Dismissing Clicks --> */
        dialog.find("btn[data-click='dismiss-modal'], a[data-click='dismiss-modal']").on("click.dismiss", () => {
          _clean();
          dialog.modal("hide");
        });

        /* <!-- Set Shown Event Handler (if present) --> */
        if (shown) dialog.on("shown.bs.modal", () => shown(dialog));

        /* <!-- Set Basic Event Handlers --> */
        dialog.on("hidden.bs.modal", () => dialog.remove() && resolve());

        /* <!-- Show the Modal Dialog --> */
        dialog.modal({
          show: true,
          backdrop: options.backdrop !== undefined ? options.backdrop : true,
        });

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
    alert: options => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        var dialog = $(_template("alert")(options));
        _target(options).prepend(dialog);

        /* <!-- Get / Set the Existing Scroll (if required) --> */
        var _result = false,
          _complete = options.scroll ?
          (top => result => $("html, body").animate({
            scrollTop: top
          }, 100, "swing", () => resolve(result)))(_top()) :
          result => resolve(result);

        /* <!-- Set Event Handlers (if required) --> */
        if (options.action) dialog.find("button.action").click(() => (_result = true) && dialog.alert("close"));
        dialog.on("closed.bs.alert", () => _complete(_result));

        /* <!-- Show the Alert --> */
        dialog.alert();

        /* <!-- Scroll to the alert (if required) --> */
        if (options.scroll) {
          Element.prototype.scrollIntoView ?
            dialog[0].scrollIntoView({
              block: "start",
              inline: "nearest"
            }) :
            $("html, body").animate({
              scrollTop: dialog.offset().top
            }, 100);
        }

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
    choose: options => {

      return new Promise((resolve, reject) => {

        if (!options || !options.choices) return reject();

        /* <!-- Get the Options Length --> */
        var _length = Array.isArray(options.choices) ?
          _length = options.choices.length : _length = Object.keys(options.choices).length;
        options.__LONG = (_length > MAX_ITEMS);

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("choose")(options));
        _target(options).append(dialog);

        /* <!-- Parsing Method --> */
        var parsed, parse = complete => {
          var _value = dialog.find(
            ["input[name='choices']:checked", "select[name='choices'] option:selected"].join(", ")
          );
          _value = (!options.multiple || _value.length === 1) ?
            options.choices[_value.val()] :
            _.map(_value, value => options.choices[$(value).val()]);
          _clean();
          return complete ? _value : parsed = _value;
        };

        /* <!-- Wire Up Action and Update Handlers --> */
        _dialog(dialog, options, parse);

        /* <!-- Set Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary").click(() =>
          _.tap(parse(true), value => value ? resolve(value) : false));

        dialog.on("hidden.bs.modal", () => dialog.remove() && (parsed ? resolve(parsed) : reject()));

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
    options: options => {

      return new Promise((resolve, reject) => {

        if (!options || !options.list || !options.choices) return reject();

        /* <!-- Great Modal Options Dialog --> */
        var dialog = $(_template("options")(options));
        _target(options).append(dialog);
        dialog.find("a.dropdown-item").on("click.toggler", (e) => $(e.target).closest(".input-group-append, .input-group-prepend").children("button")[0].innerText = e.target.innerText);
        dialog.find("a[data-toggle='tooltip']").tooltip({
          animation: false,
          trigger: "hover",
          placement: _placement
        });

        /* <!-- Set Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary").click(() => {
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
        dialog.on("shown.bs.modal", () => {});
        dialog.on("hidden.bs.modal", () => dialog.remove() && reject());

        /* <!-- Show the Modal Dialog --> */
        dialog.modal("show");

      });

    },

    /* <!--
    	Options are : {
    		title : main title of the options dialog,
    		message : message for the dialog
    		name : name of the name field, triggers splitting of name and value
    		value : name of the value field (if name/value are split)
    		validate : a regex to test the resultant value against (a mismatch will result in rejected promise)
    		action : optional name of action button
    		target : optional name / element / jquery of containing element
    	}
    --> */
    text: options => {

      return new Promise((resolve, reject) => {

        if (!options || (!options.simple && !options.message)) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("text")(options));
        _target(options).append(dialog);

        /* <!-- Set Event Handlers --> */
        var _submitted = false,
          _submit = e => {
            var _name = dialog.find("textarea[name='name'], input[type='text'][name='name']").val(),
              _value = dialog.find("textarea[name='value'], input[type='text'][name='value'], input[type='password'][name='value']").val(),
              _valid = ((_value || options.allowblank) && (!options.validate ||
                ((
                  _.isFunction(options.validate) && options.validate(_value)
                ) || (
                  _.isRegExp(options.validate) && options.validate.test(_value)
                ))
              ));
            if (_valid) {
              _clean();
              resolve(_name ? {
                name: _name,
                value: _value
              } : _value);
            } else if (e) {
              e.preventDefault();
              e.stopPropagation();
            }
          };

        /* <!-- Handle Enter Key (if simple) --> */
        if (options.simple || options.password) dialog.keypress(e => {
          if (e.which == 13) {
            e.preventDefault();
            dialog.find(".modal-footer button.btn-primary").click();
          }
        });

        /* <!-- Wire Up Action and Update Handlers --> */
        _dialog(dialog, options);

        /* <!-- Handle Clicked Submit --> */
        dialog.find(".modal-footer button.btn-primary").click(_submit);
        dialog.on("hidden.bs.modal", () => dialog.remove() && (_submitted ? _submit() : reject()));

        /* <!-- Show the Modal Dialog --> */
        dialog.on("shown.bs.modal", () => dialog.find("textarea[name='value'], input[type='text'][name='value'], input[type='password'][name='value']").focus());
        dialog.modal("show");

      });

    },

    /* <!--
    	Options are : {
    		title : main title of the options dialog,
    		message : message for the dialog
    		action : optional name of action button
    		target : optional name / element / jquery of containing element
    	}
    --> */
    files: options => {

      return new Promise((resolve, reject) => {

        if (!options || !options.message) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var files = [],
          dialog = $(_template("upload")(options));
        _target(options).append(dialog);

        /* <!-- Handle Files Population --> */
        var _populate = () => {
          var _files = $(_template("files")(files));
          _files.find("a.close").click(e => {
            e.preventDefault();
            files.splice($(e.target).closest("li.list-group-item").index(), 1);
            _populate();
          });
          dialog.find("ul").empty().append(_files);
        };

        /* <!-- Handle File Upload --> */
        dialog.find("input[type='file']").on("change", e => {
          files = options.single ? _.toArray(e.target.files) : files.concat(_.toArray(e.target.files));
          if (files.length > 0) _populate();
        });

        /* <!-- Set Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary").click(() => {
          _clean();
          if (files && files.length > 0) resolve(options.single ? files[0] : files);
        });
        dialog.on("hidden.bs.modal", () => dialog.remove() && reject());

        /* <!-- Show the Modal Dialog --> */
        dialog.modal("show");

      });

    },

    /* <!--
    	Options are : {
    		title : main title of the action dialog,
    		instructions: optional instructions
    		actions : array or objects for actions to be attached to {
    			name, desc, options
    		}
    		target : optional name / element / jquery of containing element
    	}
    --> */
    action: options => {

      return new Promise((resolve, reject) => {

        if (!options || !options.actions) return reject();

        /* <!-- Get the Options Length --> */
        var _length = Array.isArray(options.actions) ?
          _length = options.actions.length : _length = Object.keys(options.actions).length;
        options.__LONG = (_length > MAX_ITEMS);

        /* <!-- Great Modal Options Dialog --> */
        var dialog = $(_template("action")(options));
        _target(options).append(dialog);
        dialog.find("a[data-toggle='tooltip']").tooltip({
          animation: false,
          trigger: "hover",
          placement: _placement
        });

        /* <!-- Set Event Handlers --> */
        dialog.find("button[data-action]").click(function(e) {

          e.preventDefault();

          _clean();

          var _this = $(this),
            _action = options.actions[_this.data("action")];
          resolve({
            action: _action,
            option: _action.options ? _action.options[_this.parents(".action").find("select option:selected").val()] : null
          });

        });
        dialog.on("shown.bs.modal", () => {});
        dialog.on("hidden.bs.modal", () => dialog.remove() && reject());

        /* <!-- Show the Modal Dialog --> */
        dialog.modal("show");

      });

    },

    protect: function(query) {

      var _parent = this,
        _selector = $(query);

      return {

        on: (message_doc, title) => {
          _selector.off("click.protect").on("click.protect", e => {
            e.preventDefault();
            _parent.confirm({
              id: "__protect_confirm",
              title: title,
              message: _parent.doc.get(message_doc),
              action: "Proceed"
            }).then(() => {
              var link = $(e.target);
              if (!link.is("a")) link = link.closest("a");
              var target = link.attr("target");
              if (target && target.trim.length > 0) {
                window.open(link.attr("href"), target);
              } else {
                window.location = link.attr("href");
              }
            }).catch(() => {});
          });
          return _parent;
        },

        off: () => {
          _selector.off("click.protect");
          return _parent;
        },

      };

    },

    state: function() {

      const LOG = "STATE MANAGEMENT";

      var _parent = this;

      var _add = name => {
        if (!_state[name]) {
          _state[name] = true;
          if (_log) _log(`${LOG}: Added State: ${name}`, JSON.stringify(_state));
          return true;
        }
        return false;
      };

      var _enter = names => {
        names = _arrayize(names, _.isString);
        _.each(names, name => {
          if (_add(name)) _toggle(name, true);
        });
        return _parent;
      };

      var _remove = name => {
        if (_state[name]) {
          delete _state[name];
          if (_log) _log(`${LOG}: Removed State: ${name}`, JSON.stringify(_state));
          return true;
        }
        return false;
      };

      var _all = () => {
        var _ret = [];
        for (var name in _state) {
          if (_state.hasOwnProperty(name)) _ret.push(name);
        }
        return _ret;
      };

      var _exit = names => {
        names = _arrayize(names, _.isString);
        _.each(names, name => {
          if (_remove(name)) _toggle(name, false) && _all().forEach(v => $(".state-" + v).removeClass("disabled"));
        });
        return _parent;
      };

      var _change = (exit, enter) => {
        _exit(exit);
        _enter(enter);
        return _parent;
      };

      return {

        all: _all,

        change: _change,

        enter: _enter,

        exit: _exit,

        swap: (exit, enter) => {
          if (exit) _exit(exit);
          if (enter) _enter(enter);
          return _parent;
        },

        clear: () => {
          $(".d-none[class^='.hide-']", ".d-none[class*=' .hide-']").removeClass("d-none");
          $("[class^='.show-']", "[class*=' .show-']").addClass("d-none");
          _all().forEach(v => _remove(v) ? $(".state-" + v).addClass("disabled") : null);
          return _parent;
        },

        in: (names, or) => {
          names = _arrayize(names, _.isString);
          var all = _all();
          return (or ? _.some : _.every)(names, name => all.indexOf(name) >= 0);
        },

        toggle: names => {
          var all = _all();
          _arrayize(names, _.isString)
            .forEach(name => all.indexOf(name) >= 0 ? _exit(name) : _enter(name));
        }

      };

    },
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};