Display = function() {

  /* <!-- DEPENDS on JQUERY & HANDLEBARS to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Display)) return new this.Display().initialise(this);

  /* <!-- Internal Constants --> */
  const MAX_ITEMS = 6;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _root, _state = {},
    _debug = false;
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
    trigger: "hover",
    placement: _placement
  }));

  var _target = options => {

    /* <!-- Ensure we have a target _element, and that it is wrapped in JQuery --> */
    var _element = (options && options.target) ? options.target : (_root ? _root : $("body"));
    if (_element instanceof jQuery !== true) _element = $(_element);
    return _element;

  };

  var _compile = name => {

    var _template = $("#__template__" + name);
    if (_template.length == 1) {
      if (Handlebars.templates === undefined) Handlebars.templates = {};

      var _html = _template.html();

      /* <!-- Compile and add compiled template to Handlebars Template object --> */
      Handlebars.templates[name] = Handlebars.compile(_html, {
        strict: _debug
      });

      /* <!-- Look for partial templates to register/compile too --> */
      var partial_names, partial_regex = /\s?{>\s?([a-zA-Z]{1}[^\r\n\t\f }]+)/gi;
      while ((partial_names = partial_regex.exec(_html)) !== null) {
        if (partial_names && partial_names[1]) {
          if (Handlebars.templates[partial_names[1]] === undefined) {
            Handlebars.registerPartial(partial_names[1], _compile(partial_names[1]));
          } else {
            Handlebars.registerPartial(partial_names[1], Handlebars.templates[partial_names[1]]);
          }
        }
      }

      return Handlebars.templates[name];
    }
  };

  var _template = name => {

    return Handlebars.templates === undefined || Handlebars.templates[name] === undefined ?
      _compile(name) : Handlebars.templates[name];

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

      if (window.Handlebars) {

        Handlebars.registerHelper("isDate", function(variable, options) {
          if (variable && variable instanceof Date) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        });

        Handlebars.registerHelper("localeDate", variable => {
          if (!variable) return;
          if (!(variable = (variable._isAMomentObject ? variable.toDate() : variable instanceof Date ? variable : false))) return;
          return (variable.getHours() === 0 && variable.getMinutes() === 0 && variable.getSeconds() === 0 && variable.getMilliseconds() === 0) ? variable.toLocaleDateString() : variable.toLocaleString();
        });

        Handlebars.registerHelper("formatBytes", variable => {
          if (variable && !isNaN(variable) && variable > 0) return _bytes(variable, 2);
        });

        Handlebars.registerHelper("exists", function(variable, options) {
          if (typeof variable !== "undefined") {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        });

        Handlebars.registerHelper("present", function(variable, options) {
          if (typeof variable !== "undefined" &&
            variable !== null &&
            !(Object.keys(variable).length === 0 && variable.constructor === Object)) {
            return options.fn(this);
          } else {
            return options.inverse(this);
          }
        });

        Handlebars.registerHelper("is", function(v1, operator, v2, options) {

          if (arguments.length < 3) throw new Error("IS expects 2 or 3 parameters");
          if (options === undefined) {
            options = v2;
            v2 = operator;
            operator = v2 && (v2.toLowerCase() == "odd" || v2.toLowerCase() == "even") ? "is" : "===";
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
              try {_b = JSON.parse(b);} catch (e) {b = {};}
              return _b[_a];
            },
          };

          if (!operators[operator]) throw new Error(`IS doesn't understand the operator ${operator}`);
          return operators[operator](v1, v2) ? options.fn(this) : options.inverse(this);

        });

        Handlebars.registerHelper("choose", (a, b, _default) => {
          var _b, _a = String(a);
          try {_b = JSON.parse(b);} catch (e) {_b = {};}
          return _b[_a] ? _b[_a] : _default ? _default : "";
        });
        
        Handlebars.registerHelper("concat", (...args) => _.reduce(args, (m, a) => _.isObject(a) ? m : (m + a), ""));

        Handlebars.registerHelper("replace", (value, replace, replacement) => value ? value.replace(new RegExp(replace, "g"), replacement) : "");

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

    popovers: (targets, options) => _popovers(targets, options),

    tooltips: (targets, options) => _tooltips(targets, options),

    commarise: value => _commarise(value),

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
        var _return = $(this.get(options));

        return options.prepend === true ? _return.prependTo(_element) : _return.appendTo(_element);

      },

    },

    template: {

      get: options => {

        return (_ && _.isString(options)) ? _template(options) : _template(options.template ? options.template : options.name)(options);

      },

      show: function(options) {

        /* <!-- Ensure we have a target object, and that it is wrapped in JQuery --> */
        var _element = options.clear === true ? _target(options).empty() : _target(options);
        var _return = $(this.get(options));

        _popovers(_return.find("[data-toggle='popover']"));
        _tooltips(_return.find("[data-toggle='tooltip']"));

        return options.prepend === true ? _return.prependTo(_element) : _return.appendTo(_element);

      },

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
        options.clear = true && _element.find(".loader").remove() : _element.prepend(_template("loader")(options ? options : {})),
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
    inform: options => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("inform")(options));
        _target(options).append(dialog);

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
              if (ಠ_ಠ.Flags && ಠ_ಠ.Flags.debug()) ಠ_ಠ.Flags.log(`Parsed Values from Template: ${template} using ${ಠ_ಠ.Data ? "the Data helper" : "serializeArray"}`, _values);

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

          if ((options.actions || options.handlers) && dialog.find("button[data-action], a[data-action]").length > 0) {
            _.each(dialog.find("button[data-action], a[data-action]"), el => {
              $(el).on("click.action", e => {
                var _target = $(e.currentTarget),
                  _action = _target.data("action");
                if (_action.indexOf("actions_") === 0) {
                  _action = $(e.target).data("action").split("_");
                  if (_action[0] == "actions") options.actions[_action[1]].handler(dialog.find("form").serializeArray());
                } else if (options.handlers && options.handlers[_action]) {
                  options.handlers[_action](_target, dialog, options);
                }
              });
            });
          }

          if ((options.updates) && dialog.find("input[data-action], textarea[data-action]").length > 0) {
            _.each(dialog.find("input[data-action], textarea[data-action]"), el => {
              $(el).on("input.action", e => {
                var _target = $(e.currentTarget),
                  _action = _target.data("action");
                if (options.updates[_action]) options.updates[_action](_target, dialog, options);
              });
            });
          }
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

        /* <!-- Set Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary").click(() => {
          var _value = dialog.find("input[name='choices']:checked, select[name='choices'] option:selected").val();
          _clean();
          if (_value && options.choices[_value]) resolve(options.choices[_value]);
        });

        dialog.on("hidden.bs.modal", () => dialog.remove() && reject());

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

        if (!options || !options.message) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("text")(options));
        _target(options).append(dialog);

        /* <!-- Set Event Handlers --> */
        var _submitted = false,
          _submit = () => {
            var _name = dialog.find("textarea[name='name'], input[type='text'][name='name']").val();
            var _value = dialog.find("textarea[name='value'], input[type='text'][name='value']").val();
            _clean();
            if (_value && (!options.validate || options.validate.test(_value)))
              resolve(_name ? {
                name: _name,
                value: _value
              } : _value);
          };

        /* <!-- Handle Enter Key (if simple) --> */
        if (options.simple) dialog.keypress(e => {
          if (e.which == 13) {
            event.preventDefault();
            _submitted = true;
            dialog.modal("hide");
          }
        });

        /* <!-- Handle Clicked Submit --> */
        dialog.find(".modal-footer button.btn-primary").click(() => {
          _submitted = true;
        });
        dialog.on("hidden.bs.modal", () => dialog.remove() && (_submitted ? _submit() : reject()));

        /* <!-- Show the Modal Dialog --> */
        dialog.on("shown.bs.modal", () => dialog.find("textarea[name='value'], input[type='text'][name='value']").focus());
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

      var _parent = this;

      var _add = name => {
        if (!_state[name]) {
          _state[name] = true;
          return true;
        }
        return false;
      };

      var _remove = name => {
        if (_state[name]) {
          delete _state[name];
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

      return {

        all: () => _all(),

        enter: names => {
          names = _arrayize(names, _.isString);
          _.each(names, name => {
            if (_add(name)) _toggle(name, true);
          });
          return _parent;
        },

        exit: names => {
          names = _arrayize(names, _.isString);
          _.each(names, name => {
            if (_remove(name)) _toggle(name, false) && _all().forEach(v => $(".state-" + v).removeClass("disabled"));
          });
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
      };

    },
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};