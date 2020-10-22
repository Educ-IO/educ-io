Display = function() {

  /* <!-- DEPENDS on JQUERY & HANDLEBARS to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Display)) return new this.Display().initialise(this);

  /* <!-- Internal Constants --> */
  const MAX_ITEMS = 6;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _root, _state = {},
    _log = false;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _string = value => typeof value === "string" || value instanceof String,
      _number = value => typeof value === "number" && isFinite(value);

  var _commarise = value => {
    var s = (value += "").split("."),
      a = s[0],
      b = s.length > 1 ? "." + s[1] : "",
      r = /(\d+)(\d{3})/;
    while (r.test(a)) a = a.replace(r, "$1" + "," + "$2");
    return a + b;
  };

  var _arrayize = (value, test) => value && test(value) ? [value] : value;

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

  var _popovers = (targets, options) => {
    if (targets && targets.popover) targets.popover(_.defaults(options ? options : {}, {
      trigger: "focus"
    }));
  };

  var _tooltips = (targets, options) => {
    if (targets && targets.tooltip) targets.tooltip(_.defaults(options ? options : {}, {
      placement: _placement
    }));
  };

  var _hover = (e, toggle) => {
    var _this = $(e.currentTarget),
      _targets = _this.data("targets"),
      _value = _this.data("value"),
      _first = _this.data("first");
    if (!_targets || !_value) return;
    _first ?
      $(_targets).first().toggleClass(_value, toggle) :
      $(_targets).each((i, el) => {
        var _el = $(el);
        _el.toggleClass(_value, toggle);
      });
  };

  var _hovers = targets => targets
    .off("mouseenter.hover").on("mouseenter.hover", e => _hover(e, true))
    .off("mouseleave.hover").on("mouseleave.hover", e => _hover(e, false));

  var _expands = targets => targets.off("click.expand").on("click.expand", e => {
    e.preventDefault();
    e.stopPropagation();
    var _this = $(e.currentTarget),
      _targets = _this.data("targets");
    if (!_targets) return;
    $(_targets).each((i, el) => {
      var _el = $(el),
        _classes = _el.attr("class").split(/\s+/);
      _.each(_classes, _class => {
        if (_class && _class != "col-12" && _class.indexOf("col-") === 0) {
          _el.removeClass(_class).addClass(`_${_class}`);
        } else if (_class && _class.indexOf("_col-") === 0) {
          _el.removeClass(_class).addClass(_class.substr(1));
        }
      });
    });
  });

  var _routes = targets => targets.off("click.route").on("click.route", e => {
    e.preventDefault();
    e.stopPropagation();
    var _this = $(e.currentTarget),
      _route = _this.data("route");
    if (_route) {
      var _command = $(`nav a[href='#${_route}']:not(.disabled), nav a[href^='#'][href$=',${_route}']:not(.disabled)`);
      _command && _command.length > 0 && _command.prop("onclick") ?
        _command.first().click() :
        _command && _command.length > 0 ?
        _command[0].click() : window.location.hash = `#${_route}`;
    }
  });

  var _target = options => {

    /* <!-- Ensure we have a target _element, and that it is wrapped in JQuery --> */
    var _element = (options && options.target) ? options.target : (_root ? _root : $("body"));
    if (_element instanceof jQuery !== true) _element = $(_element);
    return _element;

  };

  var _modal = run => {
      var _modals = $(".modal.show[role='dialog'][data-active='true']"),
        _after = fn => {
          if (run && _.isFunction(run)) run();
          if (fn && _.isFunction(fn)) fn();
        };
      if (_modals.length > 0) {
        _modals.addClass("d-none");
        $("div.modal-backdrop.show").addClass("d-none");
        $("body").removeClass("modal-open");
        return fn => {
          $(".modal.d-none[role='dialog'], div.modal-backdrop.d-none").removeClass("d-none");
          $(".modal[role='dialog']").focus();
          $("body").addClass("modal-open");
          _after(fn);
        };
      } else {
        return _after;
      }
    },
    _modalise = (element, fn) => {
      /* <!-- Handle Modal chaining by indicating this is active --> */
      element.data("active", true);
      element.on("hide.bs.modal", e => {
        /* <!-- Handle Modal chaining by indicating this is now inactive --> */
        $(e.currentTarget).data("active", false);
        $("div.modal-backdrop.d-none").removeClass("d-none");
      });
      element.on("hidden.bs.modal", _modal(() => element.remove() && (fn && _.isFunction(fn) ? fn() : true)));
      return element;
    };

  var _template = (name, raw) => ಠ_ಠ.handlebars ? ಠ_ಠ.handlebars.template(name, raw) : null;

  var _visuals = value => {
    _popovers(value.find("[data-toggle='popover'], [data-popover='true']").add(value.filter("[data-toggle='popover'], [data-popover='true']")));
    _tooltips(value.find("[data-toggle='tooltip'], [data-tooltip='true']").add(value.filter("[data-toggle='tooltip'], [data-tooltip='true']")));
    _expands(value.find("[data-toggle='expand'], [data-expand='true']").add(value.filter("[data-toggle='expand'], [data-expand='true']")));
    _hovers(value.find("[data-toggle='hover'], [data-hover='true']").add(value.filter("[data-toggle='hover'], [data-hover='true']")));
    return value;
  };

  var _listen = element => {
    _.each(element.find("[data-listen]"), input => {
      var _this = $(input),
        _selector = _this.data("listen"),
        _event = _this.data("event");
      ((trigger, selector, event) => {
        element.find(selector).off(event).on(event, e => {
          if ($(e.target).is(selector)) trigger.show(500).siblings("[data-listen]").hide(500);
        });
      })(_this, _selector, _event);
    });
    return element;
  };

  var _process = value => {
    _routes(_visuals(value).find("a[data-route], button[data-route], input[data-route]"));
    return _listen(value);
  };

  var _keys = (options, dialog) => {
    /* <!-- Handle Enter Key (if simple) --> */
    if (options.enter) dialog.keypress(e => {
      if (e.which === 13) {
        e.preventDefault();
        dialog.find(".modal-footer button.btn-primary").click();
      }
    });
  };

  var _clean = () =>  $(".modal.show[role='dialog']").length === 0 ? $("div.modal-backdrop.show").last().remove() &&
    $("body.modal-open").removeClass("modal-open") : null; /* <!-- Weird Modal Not Hiding Bug --> */

  var _tidy = () => {
    var _remove = $("div.tooltip.show");
    if (_log) _log("Tidying Tooltips:", _remove.length);
    _remove.last().remove();
  }; /* <!-- Tooltips Not Hiding --> */

  var _toggle = (state, toggle, container, all) => {

    var _$ = (container ? container.find : $);

    /* <!-- Will not enable elements that should remain disabled --> */
    toggle && all && all.length > 0 ?
      _$(`.disabled.state-${state}${_.reduce(all, (memo, name) => `${memo}:not(.disabled-state-${name})`, "")}`).toggleClass("disabled", !toggle) :
      _$(".state-" + state).toggleClass("disabled", !toggle);
    /* <!-- Disabled / Hide always takes precedence --> */
    _$(".disabled-state-" + state).toggleClass("disabled", toggle);

    /* <!-- Will not show elements that should remain hidden --> */
    toggle && all && all.length > 0 ?
      _$(`.d-none.show-${state}${_.reduce(all, (memo, name) => `${memo}:not(.hide-${name})`, "")}`).toggleClass("d-none", !toggle) :
      _$(".show-" + state).toggleClass("d-none", !toggle);
    /* <!-- Disabled / Hide always takes precedence --> */
    _$(".hide-" + state).toggleClass("d-none", toggle);

    _$(".tooltip-until-" + state).tooltip(toggle ? "disable" : "enable");
    /* <!-- Disabled / Hide always takes precedence --> */
    _$(".tooltip-while-" + state).tooltip(toggle ? "enable" : "disable");

    return true;
  };

  var _breakpoint = size => $(`div.bs-breakpoints span.${size}`).css("display") == "block";

  var _dialog = (dialog, options, handler, validator) => {

    if ((options.actions || options.handlers) &&
      dialog.find("button[data-action], a[data-action]").length > 0) {
      _.each(dialog.find("button[data-action], a[data-action]"), el => {
        $(el).on("click.action", e => {
          var _target = $(e.currentTarget),
            _action = _target.data("action");
          if (_action.indexOf("actions_") === 0) {
            _action = $(e.target).data("action").split("_");
            if (_action.shift() == "actions") {
              var _fn = options;
              while (_action.length > 0) {
                _fn = _fn && _fn.actions ? _fn.actions[_action.shift()] : null;
              }
              
              if (_fn && _fn.handler) {
                var _complete = values => _fn.handler(handler ? handler() : values, dialog);
                
                if (_fn.validate) {
                  
                  /* <!-- Run through the supplied validator before continuing (false === invalid) --> */
                  var _values = validator();
                  if (_values === false) {
                    e.preventDefault();
                    e.stopPropagation();
                  } else {
                    _complete(_values);
                  }
                  
                } else {
                  
                  _complete(ಠ_ಠ.Data ? ಠ_ಠ.Data({},
                    ಠ_ಠ).dehydrate(dialog.find("form")) : dialog.find("form").serializeArray());
                  
                }
                
              }
            }
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

    tidy: _tidy,

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
          .replace(/\{\{+\s*doc\s*}}/gi, options && options.name ? options.name : "name")
          .replace(/\{\{+\s*title\s*}}/gi, options && options.title ? options.title : "Title")
          .replace(/\{\{+\s*close\s*}}/gi, options && options.close ? options.close : "Close")
          .replace(/\{\{+\s*class\s*}}/gi, options && options.class ? ` ${options.class}` : "");
      },

      /* <!--
      	Options are : {
      		name : name of the document to display,
      	}
      --> */
      get: function(options, content, trim) {

        options = _string(options) || Array.isArray(options) ? {
          name: options
        } : options;
        if (content && (_string(content) || _number(content))) options.content = content;
        if (trim) options.trim = trim;

        var _get = name => $("#__doc__" + name)[0].innerText;
        var _doc = Array.isArray(options.name) ?
          _.reduce(options.name, (doc, name) => `${doc}\n\n${_get(name)}`, "") :
          _get(options.name);

        /* <!-- Trim Start / End <p> tags (if required) --> */
        if (options.trim) _doc = _doc.replace(/^<\/?p>|<\/?p>$/gi, "");

        var _return = options.content !== undefined ?
          _doc.replace(/\{\{+\s*content\s*}}/gi, options.content) :
          options.data !== undefined ?
          _.reduce(_.keys(options.data), (doc, key) => doc.replace(new RegExp(`\{\{+\s*${key}\s*}}`, "gi"), options.data[key]), _doc) :
          _doc;

        _return = options.wrapper ? this.wrap(options.wrapper, _return, options) : _return;

        return options.plain ? $(_return).text() : _return;

      },

      /* <!-- 
      	Options are : {
      		name : name of the document to display,
      		target : optional element to append the display to,
      		prepend : optional boolean to prepend doc, rather than append,
      		clear : ooption boolean to clear target first
      	}
      --> */
      show: function(options) {

        /* <!-- Ensure we have a target object, and that it is wrapped in JQuery --> */
        var _element = options.clear === true ? _target(options).empty() : _target(options),
          _return = $(this.get(options))[options.prepend === true ? "prependTo" : "appendTo"](_element);

        /* <!-- Allow for showing / hiding previous modals (e.g. help modals from help modals)	--> */
        if (options.wrapper && options.wrapper === "MODAL") _modalise(_return);

        return _visuals(_return);

      },

    },

    template: {

      compile: _template,

      get: (options, process) => {

        var _return = _string(options) ? _template(options) : _template(options.template ? options.template : options.name)(options);
        return process ? _string(options) ? options => _process($($.parseHTML(_return(options)))) : _process($(_return)) : _return;

      },

      show: function(options) {

        /* <!-- Ensure we have a target object, and that it is wrapped in JQuery --> */
        var _element = options.clear === true ? _target(options).empty() : _target(options);
        var _return = _process($(this.get(options)));

        return options.replace === true ? _return.replaceAll(_element) : options.prepend === true ? _return.prependTo(_element) : _return.appendTo(_element);

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
        options = _string(options) ? {
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
      var _clear = (options && options.clear === true) || _element.find("div.loader-large").length > 0,
          _create = () => _template("loader")(options ? options : {}),
          _loader = _clear ? options.clear = true && _element.find("div.loader").remove() :
            options && options.replace ? _element.replaceWith(_create()) :
            options && options.append ? _element.append(_create()) :
            _element.prepend(_create()),
        _handler;
      
      if (options && options.status) {
        _status = _loader.find(".status").removeClass("d-none");
        if (_string(options.status)) {
          /* <!-- Status is a string, so display it	--> */
          _status.text(options.status);
        } else {
          /* <!-- Status should describe an event to listen for	--> */
          var _source = options.status.source ? options.status.source : window;
          _handler = options.__statusHandler ? options.__statusHandler : e => _status.text(options.status.value ? options.status.value(e.detail) : e.detail);
          _source[_clear ? "removeEventListener" : "addEventListener"](options.status.event, _handler, false);
          if (options.status.initial && _string(options.status.initial)) _status.text(options.status.initial);
        }
      }

      return options && !options.clear && (options === true || options.fn === true) ? ((fn, opts) => {
        opts.clear = true;
        if (_handler) opts.__statusHandler = _handler;
        opts.__return = this;
        return value => value && value.message ? _status.text(value.message) : fn(opts);
      })(this.busy, options === true ? {} : options) : options && options.__return ? options.__return : this;

    },

    /* <!--
    	Options are : {}
    --> */
    confirm: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("confirm")(options)),
            confirmed;

        _target(options).append(_modalise(dialog, () => confirmed ? resolve(confirmed) : reject()));

        /* <!-- Set Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary").click(() => (confirmed = true) && _clean());

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", shown ? () => shown(dialog) : () => _visuals(dialog));

        /* <!-- Handle Enter Key (if simple) --> */
        _keys(options, dialog);

        /* <!-- Show the Modal Dialog --> */
        dialog.modal("show");

      });

    },

    /* <!-- 
			Options are : {}
		--> */
    inform: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("inform")(options));

        _target(options).append(_modalise(dialog, resolve));

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", shown ? () => shown(dialog) : () => _visuals(dialog));

        /* <!-- Handle Enter Key (if simple) --> */
        _keys(options, dialog);

        /* <!-- Show the Modal Dialog --> */
        dialog.modal("show");

      });

    },

    /* <!-- 
    	Options are : {}
    --> */
    modal: (template, options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        var dialog = $(_template(template)(options)),
          resolver = () => resolve();

        if (dialog.find("form").length > 0) {
          
          var _validator = () => {
            
            var _valid = true;
            _.each(dialog.find("form.needs-validation"), form => {
              if (form.checkValidity() === false) _valid = false;
              form.classList.add("was-validated");
            });

            var _form = dialog.find("form"),
              _values = ಠ_ಠ.Data ? ಠ_ಠ.Data({}, ಠ_ಠ).dehydrate(_form) : _form.serializeArray();
            if (!ಠ_ಠ.Data) _.each(_form.find("input:indeterminate"), el => _values.push({
              name: el.name,
              value: "all"
            }));

            /* <!-- Log is available, so debug log --> */
            if (_log) _log(`Parsed Values from Template: ${template} using ${ಠ_ಠ.Data ? "the Data helper" : "serializeArray"}`, _values);

            if (options.validate && !options.validate(_values, _form)) _valid = false;
            
            return _valid ? _values : false;
            
          };

          /* <!-- Set Form / Return Event Handlers --> */
          if (dialog.find(".modal-footer button.btn-primary").length > 0) {

            dialog.find(".modal-footer button.btn-primary").on("click.submit", e => {

              var _values = _validator();
              if (_values === false) {
                e.preventDefault();
                e.stopPropagation();
              } else {
                _clean();
                resolver = () => resolve(_values);
              }
              
            });

            /* <!-- Handle Enter Key (if simple) --> */
            _keys(options, dialog);

          }

          /* <!-- Wire Up Action and Update Handlers --> */
          _dialog(dialog, options, null, _validator);

        }

        /* <!-- Modal Submission Clicks --> */
        _target(options).append(_modalise(dialog, () => resolver()));

        /* <!-- Modal Dismissing Clicks --> */
        dialog.find("btn[data-click='dismiss-modal'], a[data-click='dismiss-modal']").on("click.dismiss",
          () => {
            _clean();
            dialog.modal("hide");
          });

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", _.compose(() => dialog.find("textarea:visible, input:visible").first().focus(), shown ? 
                                                () => shown(dialog) : () => _visuals(dialog)));

        /* <!-- Show the Modal Dialog --> */
        dialog.modal({
          show: true,
          backdrop: options.backdrop !== undefined ? options.backdrop : true,
        });

        /* <!-- Clean-up any old tool-tips --> */
        _tidy();

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
    alert: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options) return reject();

        var dialog = $(_template("alert")(options));
        _target(options).prepend(dialog);

        /* <!-- Get / Set the Existing Scroll (if required) --> */
        var _result = false,
          _complete = options.scroll && Element.prototype.scrollIntoView ?
          (element => result => {
            element.scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });
            return resolve(result);
          })(document.scrollingElement || document.documentElement) :
          result => resolve(result);

        /* <!-- Set Event Handlers (if required) --> */
        if (options.action) dialog.find("button.action").click(() => (_result = true) && dialog.alert("close"));
        dialog.on("closed.bs.alert", () => _complete(_result));

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.alert", shown ? () => shown(dialog) : () => _visuals(dialog));

        /* <!-- Show the Alert --> */
        dialog.alert();

        /* <!-- Scroll to the alert (if required) --> */
        if (options.scroll && Element.prototype.scrollIntoView) dialog[0].scrollIntoView({
          block: "start",
          inline: "nearest"
        });

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
    choose: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options || !options.choices) return reject();

        /* <!-- Get the Options Length --> */
        var _length = Array.isArray(options.choices) ?
          _length = options.choices.length : _length = Object.keys(options.choices).length;
        options.__LONG = (_length > MAX_ITEMS);

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("choose")(options)), parsed, resolved;

        _target(options).append(_modalise(dialog, () => _.isEmpty(parsed) ? reject() : resolved ? null : (resolved = true) && resolve(parsed)));

        /* <!-- Parsing Method --> */
        var choice = () => {
            var _value = dialog.find(
              ["input[name='choices']:checked", "select[name='choices'] option:selected"]
              .join(", ")
            );
            _value = (!options.multiple || _value.length === 1) ?
              options.choices[_value.val()] :
              _.map(_value, value => options.choices[$(value).val()]);
            return _value;
          },
          parse = (complete, values) => {
            var _values = values || choice();
            if (values || !options.validate || options.validate(_values)) _clean();
            return complete ? _values : parsed = _values;
          };

        /* <!-- Wire Up Action and Update Handlers --> */
        _dialog(dialog, options, parse);

        /* <!-- Set Form / Return Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary, .modal-footer button[data-action]")
          .on("click.submit", e => {
            var _values = choice();
            if (options.validate && !options.validate(_values)) {
              e.preventDefault();
              e.stopPropagation();
            } else if ($(e.currentTarget).is(".btn-primary")) {
              options.chain ? parse(false, _values) : _.tap(parse(true, _values), 
                  value => value ? resolved ? null : (resolved = true) && resolve(value) : false);
            }
          });

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", shown ? () => shown(dialog) : () => _visuals(dialog));

        /* <!-- Handle Enter Key (if simple) --> */
        dialog.keypress(e => {
          if (e.which === 13) {
            e.preventDefault();
            dialog.find(".modal-footer button.btn-primary").click();
          }
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
    options: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options || !options.list || !options.choices) return reject();

        /* <!-- Create Modal Options Dialog --> */
        var dialog = $(_template("options")(options)), _return, _resolved;

        /* <!-- Modalise, handles Hidden event which will reject unless data available for resolving --> */
        _target(options).append(_modalise(dialog, () => _return ? _resolved ? null : resolve(_return) : reject()));

        dialog.find("a.dropdown-item").on("click.toggler", (e) => $(e.target).closest(".input-group-append, .input-group-prepend").children("button")[0].innerText = e.target.innerText);
        dialog.find("a[data-toggle='tooltip'], a[data-tooltip='true']").tooltip({
          animation: false,
          trigger: "hover",
          placement: _placement
        });

        /* <!-- Set Event Handlers --> */
        dialog.find(".modal-footer button.btn-primary").click(() => {
          _return = [];
          dialog.find("div.input-group").each(function() {
            var e = $(this);
            _return.push({
              name: e.find("input").data("field"),
              value: e.find("button").text()
            });
          });
          _resolved ? null : (_resolved = true) && resolve(_return);
        });

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", shown ? () => shown(dialog) : () => _visuals(dialog));

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
    text: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options || (!options.simple && !options.message)) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var dialog = $(_template("text")(options));

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

        _target(options).append(_modalise(dialog, () => _submitted ? _submit() : reject()));

        /* <!-- Handle Enter Key (if simple) --> */
        if (options.simple || options.password) dialog.keypress(e => {
          if (e.which === 13) {
            e.preventDefault();
            dialog.find(".modal-footer button.btn-primary").click();
          }
        });

        /* <!-- Wire Up Action and Update Handlers --> */
        _dialog(dialog, options);

        /* <!-- Handle Clicked Submit --> */
        dialog.find(".modal-footer button.btn-primary").click(_submit);

        var _focus = () => dialog.find("textarea[name='value'], input[type='text'][name='value'], input[type='password'][name='value']").focus();

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", _.compose(_focus, shown ? () => shown(dialog) : () => _visuals(dialog)));

        /* <!-- Show the Modal Dialog --> */
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
    files: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options || !options.message) return reject();

        /* <!-- Great Modal Choice Dialog --> */
        var confirmed, files = [],
          dialog = $(_template("upload")(options));

        _target(options).append(_modalise(dialog,
          () => confirmed && files && files.length > 0 ? resolve(options.single ? files[0] : files) : reject()));

        /* <!-- Handle Files Population --> */
        var _populate = () => {
          var _files = $(_template("files")(_.map(files, file => _.pick(file, "type", "name", "lastModifiedDate", "size"))));
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
          confirmed = true;
          _clean();
        });

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", shown ? () => shown(dialog) : () => _visuals(dialog));

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
    action: (options, shown) => {

      return new Promise((resolve, reject) => {

        if (!options || !options.actions) return reject();

        /* <!-- Get the Options Length --> */
        var _length = Array.isArray(options.actions) ?
          _length = options.actions.length : _length = Object.keys(options.actions).length;
        options.__LONG = (_length > MAX_ITEMS);

        /* <!-- Great Modal Options Dialog --> */
        var dialog = $(_template("action")(options)), _return, _resolved;

        _target(options).append(_modalise(dialog, () => _return ? _resolved ? null : resolve(_return): reject()));

        dialog.find("a[data-toggle='tooltip'], a[data-tooltip='true']").tooltip({
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
          _return = {
            action: _action,
            option: _action.options ? _action.options[_this.parents(".action").find("select option:selected").val()] : null
          };
          _resolved ? null : (_resolved = true) && resolve(_return);

        });

        /* <!-- Set Shown Event Handler (if present, otherwise use default visuals / popovers etc) --> */
        dialog.on("shown.bs.modal", shown ? () => shown(dialog) : () => _visuals(dialog));

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

      var _all = () => {
        var _ret = [];
        for (var name in _state) {
          if (_state.hasOwnProperty(name)) _ret.push(name);
        }
        return _ret;
      };

      var _add = name => {
        if (!_state[name]) {
          _state[name] = true;
          if (_log) _log(`${LOG}: Added State: ${name}`, JSON.stringify(_state));
          return true;
        }
        return false;
      };

      var _enter = names => {
        var all = _all();
        names = _arrayize(names, _string);
        _.each(names, name => {
          if (_add(name)) _toggle(name, true, null, all);
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

      var _exit = names => {
        names = _arrayize(names, _string);
        _.each(names, name => {
          var a;
          if (_remove(name)) _toggle(name, false) &&
            (a = _all()).forEach(v =>
              $(`.state-${v}`).not(_.reduce(a, (q, n) => `${q}${(q ?",":"")}.disabled-state-${n}`, ""))
              .removeClass("disabled"));
        });
        return _parent;
      };

      var _change = (exit, enter) => {
        _exit(exit);
        _enter(enter);
        return _parent;
      };

      var _swap = (exit, enter) => {
        if (exit) _exit(exit);
        if (enter) _enter(enter);
        return _parent;
      };

      var _clear = () => {
        $(".d-none[class^='.hide-']", ".d-none[class*=' .hide-']").removeClass("d-none");
        $("[class^='.show-']", "[class*=' .show-']").addClass("d-none");
        _all().forEach(v => _remove(v) ? $(".state-" + v).addClass("disabled") : null);
        return _parent;
      };

      var _in = (names, or) => {
        names = _arrayize(names, _string);
        var all = _all();
        return (or ? _.some : _.every)(names, name => all.indexOf(name) >= 0);
      };

      return {

        all: _all,

        change: _change,

        enter: _enter,

        exit: _exit,

        swap: _swap,

        clear: _clear,

        in: _in,

        toggle: names => {
          var all = _all();
          _arrayize(names, _string)
            .forEach(name => all.indexOf(name) >= 0 ? _exit(name) : _enter(name));
          return _in(names);
        },
        
        set: (names, toggle) => _arrayize(names, _string).forEach(name => toggle ? _enter(name) : _exit(name)),

      };

    },

    status: (function() {

      var _get = () => $(".navbar-status > .btn-outline-status");

      var _set = {

        details: (status, title, details) => (title && details ? status.popover("dispose").popover({
          title: title,
          content: details,
          trigger: "click",
          html: /<\/?[a-z][\s\S]*>/i.test(details),
        }) : null, status),

        text: (status, text) => (text ? status.find(".text").text(text) : null, status),

      };

      var _hide = {

        icons: status => (status.find(".material-icons").addClass("d-none"), status),

        status: status => {
          var _status = (status || _get()).removeClass("loader").css("opacity", 0)
            .one("transitionend MSTransitionEnd webkitTransitionEnd oTransitionEnd", () => {
              _status.addClass("d-none");
              _hide.icons(_status);
              _status.find(".text").text("");
              _status.popover("dispose");
            });
        },

      };

      var _show = (text, title, details, working) => {
        var _status = _get().removeClass("d-none").css("opacity", 1);
        if (working) _status.addClass("loader");
        _set.text(_hide.icons(_status), text);
        _set.details(_status, title, details);
        return _status;
      };

      return {

        working: (text, title, details) => {
          var _status = _show(text, title, details, true);
          return (result, text, title, details, hide) => {
            _set.text(_hide.icons(_status), text).removeClass("loader");
            _set.details(_status, title, details);
            _status.find(`.material-icons.result-${result ? "success" : "failure"}`).removeClass("d-none");
            if (hide) _.delay(() => _hide.status(_status), _.isNumber(hide) ? hide : 15000);
          };
        },

        show: (text, title, details) => {
          _show(text, title, details);
        },

        hide: () => {
          _hide.status();
        }

      };

    })(),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};