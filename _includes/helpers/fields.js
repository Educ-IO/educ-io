Fields = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Wires up form field behaviours (clear, increments, spans etc) --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.me: Function to get value of me for name/email address fields [Optional]  --> */
  /* <!-- @options.templater: Function to get template for rendering (e.g. Display.template.get) [Optional for all but complex add fields]  --> */
  /* <!-- @options.list_*: See below [All Optional] --> */
  /* <!-- @options.doc_*: See below [All Optional] --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore, DayJS/Moment, autosize | App Scope: Flags, Display, Google, Router, Dates; --> */

  /* <!-- Internal Constants --> */
  const DATE_FORMAT = "yyyy-mm-dd",
    DATE_FORMAT_M = DATE_FORMAT.toUpperCase(),
    TIME_FORMAT = "HH:mm";

  const EVENT_CHANGE_DT = "change.datetime",
    EVENT_CHANGE_AUTOSIZE = "change.autosize";
  const DEFAULTS = {
    me: () => "",
    list_holder: ".list-holder",
    list_template: "list_item",
    list_data: ".list-data",
    list_item: ".list-group-item",
    list_picker_title: "Select a File / Folder to Use",
    list_picker_view: "DOCS",
    list_upload_title: "Please upload file/s ...",
    list_upload_template: "FILE",
    list_upload_content: "files",
    list_web_title: "Please enter a URL ...",
    list_web_template: "URL",
    list_web_content: "links",
    list_web_regex: /^((?:(ftps?|https?):\/\/)?((?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9]))|(?:(?:(?:[a-zA-Z0-9._-]+){1,2}[\w]{2,4})))(?::(\d+))?((?:\/[\w]+)*)(?:\/|(\/[\w]+\.[\w]{3,4})|(\?(?:([\w]+=[\w]+)&)*([\w]+=[\w]+))?|\?(?:(wsdl|wadl))))$/i,
    list_web_name: "Web Link",
    list_paper_title: "Paper",
    list_offline_title: "Offline",
    doc_picker_title: "Select a Document to Load Text From",
    doc_picker_view: "DOCUMENTS"
  };
  const STEPS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _get = id => {
    if (!id) return false;
    var ids = id.indexOf("||") > 0 ? id.split("||") : [id];
    var selector = _.reduce(ids, (memo, id) => `${memo ? `${memo}, `: ""}#${id}, #${id} > input`, "");
    return $(selector);
  };

  var _number = (value, target, min, max) => {

    /* <!-- Fall back to defaults --> */
    max = (max === undefined || max === null) ?
      Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : Number.MAX_VALUE : max;
    min = (min === undefined || min === null) ?
      Number.MIN_SAFE_INTEGER ? Number.MIN_SAFE_INTEGER : Number.MIN_VALUE : min;

    var _suffix = target.data("suffix"),
      _current = Number(target.val() ?
        (_suffix ? target.val().split(" ")[0] : target.val()) : 0);
    (_current + value <= max) ? _current += value: _current = max;
    if (_current <= min) {
      target.val("");
    } else if (_suffix) {
      target.val(`${_current} ${_suffix}`);
    } else {
      target.val(_current);
    }
    if (target.data("targets")) $("#" + target.data("targets")).val(_current <= min ? 0 : _current);

  };

  var _remove = e => {
    e.preventDefault();
    var _this = $(e.currentTarget).closest(options.list_item);
    if (_this.siblings(options.list_item).length === 0) {
      var _controls = _this.closest("[data-controls]").data("controls");
      if (_controls) {
        _controls = $(`#${_controls}`);
        if (_controls.is("input[type='checkbox']")) _controls.prop("checked", false);
      }
    }

    /* <!-- Get Optional Tags --> */
    var _field = _this.closest("[data-output-field]");
    _.each(_this.find("[data-output-name]"), el => {
      var _el = $(el),
        _links = _field.find(`[data-item='${_el.data("output-name")}']`);
      if (_links.length > 0 && _links.data("targets")) {
        var _target = $(`#${_links.data("targets")}`);
        if (_links.attr("type") == "number") _number(Number("-" + _el.text()), _target, 0);
      }
    });
    
    _this.remove();
    
    factory.Display.tidy();
  };

  var _updates = form => {

    /* <!-- Wire up select fields --> */
    form.find("select[data-updates], input[data-updates]").change(e => {
      var _this = $(e.currentTarget),
        _val = val => val == _this.data("default") ? "" : val;
      $(`#${_this.data("updates")}`).val(_val(_this.val())).change();
    });

  };

  var _spans = form => {

    var _handler = control => {

      if (control.data("targets") && control.data("value")) {

        var _target = $("#" + control.data("targets"));

        if (_target.data("targets")) {

          var _span = control.data("span") ?
            control.data("span") :
            control.parent(".dropdown-menu").siblings("button[data-span]") ?
            control.parent(".dropdown-menu").siblings("button[data-span]").data("span") : "";
          _target.data("span", _span);

          _target = $("#" + _target.data("targets"));

          var _start = _target.find(`input[name='${_target.attr("id")}_start']`),
            _end = _target.find(`input[name='${_target.attr("id")}_end']`),
            _historical = _target.data("historical"),
            _initial = _historical ? _end : _start,
            _derived = _historical ? _start : _end;

          var _initial_Date = _initial.val() ?
            factory.Dates.parse(_initial.val()) : factory.Dates.now(),
            _dervied_Date;

          if (_span) {

            if (_initial_Date.isValid()) {

              _dervied_Date = _historical ?
                _initial_Date.clone().add(-1, _span).add(1, "d") :
                _initial_Date.clone().add(1, _span).subtract(1, "d");

              _initial.val(_initial_Date.format(DATE_FORMAT_M)).change();
              _derived.val(_dervied_Date.format(DATE_FORMAT_M)).change();

              ((start, span, end) => {
                start.off(EVENT_CHANGE_DT).on(EVENT_CHANGE_DT, e => {
                  var _value = $(e.currentTarget).val();
                  if (_value) {
                    _value = factory.Dates.parse(_value);
                    if (_value.isValid())
                      end.val(_value.add(1, span).subtract(1, "d").format(DATE_FORMAT_M)).change();
                  } else {
                    end.val("").change();
                  }
                });
              })(_start, _span, _end);

            }

          } else {

            ((start, end) => {
              start.off(EVENT_CHANGE_DT).on(EVENT_CHANGE_DT, e => {
                var _value_S = $(e.currentTarget).val();
                if (_value_S) {
                  _value_S = factory.Dates.parse(_value_S);
                  if (_value_S.isValid()) {
                    var _value_E = factory.Dates.parse(end.val());
                    if (!end.val() || (_value_E.isValid() && _value_E.isSameOrBefore(_value_S)))
                      end.val(factory.Dates.parse(_value_S).add(1, "d").format(DATE_FORMAT_M)).change();
                  }
                } else {
                  end.val("").change();
                }
              });
            })(_start, _end);

          }

        }

      }
      
      factory.Display.tidy();

    };

    form.find("button.alter-span, a.alter-span")
      .click(e => _handler($(e.currentTarget)));

    form.find("button.alter-span:first-child, a.alter-span:first-child")
      .each((i, el) => _handler($(el)));

  };

  var _range = form => {

    var _change = e => {
      var _this = $(e.currentTarget);
      _this.data("value", true);
      if (_this.data("targets")) {
        var _target = _get(_this.data("targets")),
          _suffix = _target.data("suffix"),
          _range = _target.data("range"),
          _append = _target.data("append"),
          _value = _this.val(),
          _display = _value;
        if (_range) {
          if (_range.indexOf("**SPREAD**||") === 0) {
            _range = _range.substring(12).split(";");
            var _max = Number(_this[0].max || 100),
                _step = _max / _range.length,
                _index = Math.min(Math.floor(Number(_value) / _step), _range.length - 1) || 0;
            _display = _range[_index];
          } else {
            _range = _range.split(";");
            _display = _range[Number(_value)];
          }
        }
        _target.val(`${_display}${_suffix ? `${_suffix.length > 1 ? " " : ""}${_suffix}` : ""}`).change();
        if (_append) _target.parent().find(`[data-show='${_append}']`).each((i, element) => {
          var _element = $(element),
              _text = _append == "value" ? _value : "";
          if (_element.text() != _text) _element.text(_text).trigger(`change.${_append}`); 
        });
      }
    };

    /* <!-- Wire up numerical fields --> */
    form.find("input[type='range'].show-numerical").off("click.change").on("click.change", _change)
      .each((i, element) => {
        element.removeEventListener("touchstart", _change, {passive: true});
        element.addEventListener("touchstart", _change, {passive: true});
      });
    form.find("input[type='range'].show-numerical").off("change.change").on("change.change", _change);
    form.find("input[type='range'].show-numerical.show-realtime").off("input.change").on("input.change", _change);
  };

  var _numerical = form => {

    /* <!-- Wire up numerical fields --> */
    form.find(".alter-numerical").click(e => {
      var _this = $(e.currentTarget);
      if (_this.data("targets") && (_this.data("value") || _this.is("input[type='range']"))) {

        var _target = $(`#${_this.data("targets")}`),
          _value = Number(_this.data("value") || _this.val());
        var _min = _target.data("min") ? Number(_target.data("min")) : 0,
          _max = _target.data("max") ? Number(_target.data("max")) : null;

        if (_target.hasClass("input-daterange") && _this.data("modifier")) {

          var _modifier = $(`#${_this.data("modifier")}`),
              _span = _modifier.data("span") ? _modifier.data("span") : "d";

          var _start = _target.find(`input[name='${_target.attr("id")}_start']`),
            _start_Date = _start.val() ? factory.Dates.parse(_start.val()) : factory.Dates.now();
          _start.val(_start_Date.add(_value, _span).format(DATE_FORMAT_M)).trigger(EVENT_CHANGE_DT).change();

        } else {

          _number(_value, _target, _min, _max);

        }

      }
      
      factory.Display.tidy();
      
    });

  };

  var _reset = element => {
    var _$ = element && element.jquery ? element : $(element),
        _default = _$.data("default");
    if (_default) _$.text(_default);
    _$.children(".d-none").removeClass("d-none");
    _$.children(".d-inline").remove();
    _$.data("selected", null);
  };
  
  var _erase = form => {

    /* <!-- Wire up eraser actions --> */
    form.find(".eraser").click(e => {
      var _this = $(e.currentTarget),
        _targets = _get(_this.data("targets")),
        _clear = _get(_this.data("reset"));

      if (_targets) _targets.each((i, element) => {
        var _this = $(element);
        _this.is(":checkbox") ?
          _this.prop("checked", false)
          .prop("indeterminate", true)
          .change() :
          _this.val("")
          .change()
          .removeClass("invalid")
          .filter("textarea.resizable").map((i, el) => autosize.update(el));
      });

      if (_clear) _clear.each((i, element) => _reset(element));
      
      factory.Display.tidy();

    });

  };

  
  var _radio = form => {

    /* <!-- Wire up radio fields --> */
    form.find("input[type='radio'], input[type='checkbox']").change(e => {
      var _this = $(e.currentTarget);
      if (_this.data("targets") && !_this.hasClass("disabled")) {

        _this.parents("div").find(".to-dim").addClass("md-inactive");
        _this.siblings(".to-dim").removeClass("md-inactive");

        if (_this.data("value") && _this.prop("checked")) {
          autosize.update($(`#${_this.data("targets")}`).val(_this.data("value")).change());
        } else {
          autosize.update($(`#${_this.data("targets")}`).val("").change());
        }

      }
    });

  };

  var _menus = form => {

    form.find("button.dropdown-item, a.dropdown-item").click(e => {
      var _this = $(e.currentTarget),
        _targets = _this.data("targets"),
        _value = _this.data("value");
      
      if (_targets && _value) {
        var _process = _.reduce(["g-picker", "g-file", "web", "paper", "offline"], (memo, css_class) => !memo || _this.hasClass(css_class) ? false : memo, true);
        if (_process) {
          e.preventDefault();
          _targets = _targets.indexOf("||") > 0 ? _targets.split("||") : [_targets];
          var _selector = _.reduce(_targets, (memo, id) => `${memo ? `${memo}, `: ""}#${id}, #${id}:first-child`, ""),
              _elements = form.find(_selector);
          _.each(_elements, element => (element = $(element)).html(element.html().replace(element.text(), _value))); 
        }
      }
    });

  };

  var _autosize = form => {

    form.find("textarea.resizable").on("focus.autosize", e => {
      autosize(e.currentTarget);
      $(e.currentTarget).trigger(EVENT_CHANGE_AUTOSIZE);
    });

  };

  var _reveal = form => {

    /* <!-- Wire up event / visibility listeners --> */
    form.find("[data-reveal]").off("change.reveal").on("change.reveal", e => {
      var _revealer = $(e.currentTarget),
        _target = _get(_revealer.data("reveal"));
      _target.collapse(_revealer.is("input[type=checkbox]") ?
        _revealer.prop("checked") === true ? "show" : "hide" : "toggle");
    });

  };

  var _change = form => {

    /* <!-- Wire up event / change listeners --> */
    form.find("input[type='checkbox'][data-for][data-on][data-off]")
      .off("change.change").on("change.change", e => {
        var _this = $(e.currentTarget),
            _on = _this.data("on"),
            _off = _this.data("off"),
            _target = $(_this.data("for"));
        _this.prop("checked") === true ? 
          _target.removeClass(_off).addClass(_on) :
          _target.removeClass(_on).addClass(_off);
      });

  };
  
  var _dim = form => {

    /* <!-- Wire up event / visibility listeners --> */
    form.find(".dim").off("click.dim").on("click.dim", e => {
      var _this = $(e.currentTarget);
      if (_this.hasClass("dim")) {
        _this.siblings().addClass("dim").find("button, a[type='button']").prop("disabled", true);
        _this.removeClass("dim").find("button, a[type='button']").prop("disabled", false);
      }
    });

  };

  var _me = form => {

    form.find(".textual-input-button[data-action='me']").off("click.me")
      .on("click.me", e => $(`#${$(e.currentTarget).data("targets")}`).val(options.me()).change());

    form.find("input[data-input-default='me'], textarea[data-input-default='me']").val((index, value) => value ? value : options.me()).change();

  };

  var _datetime = form => {

    if ($.fn.datepicker) {

      form.find("div.dt-picker, input.dt-picker").datepicker({
        format: DATE_FORMAT,
        todayBtn: "linked",
        todayHighlight: true,
        autoclose: true
      });

    } else if ($.fn.bootstrapMaterialDatePicker) {

      form.find("div.dt-picker > input, input.dt-picker").bootstrapMaterialDatePicker({
        format: DATE_FORMAT_M,
        clearButton: true,
        nowButton: true,
        time: false,
        switchOnClick: true,
      });

      form.find("div.dt-picker-time > input, input.dt-picker-time").bootstrapMaterialDatePicker({
        format: TIME_FORMAT,
        clearButton: true,
        nowButton: true,
        date: false,
        switchOnClick: true,
      });

      /* <!-- Time Default to now --> */
      form.find("div.dt-picker-time[data-input-default='now'] > input, input.dt-picker-time[data-input-default='now']")
        .val((index, value) => value ? value :
          factory.Dates.now().startOf("hour").add(index, "hours").format(TIME_FORMAT));

    }

    /* <!-- General Default NOW --> */
    form.find("input[data-input-default='now'], textarea[data-input-default='now']")
      .val((index, value) => value ? value : factory.Dates.now().format(DATE_FORMAT_M));

  };

  var _list = form => {

    var _handlers = {

      default: e => $(_.tap(e, e => e.preventDefault()).currentTarget).parents(options.list_holder),
      
      add: (value, list, check) => {

        if (check !== false) {
          var _controls = list.data("controls");
          _controls = _controls ? _controls : list.find("[data-controls]").data("controls");
          var checks = _controls ?
            list.parents("[data-output-field]").find(`#${_controls}`) :
            list.find("input[type='checkbox']");
          if (checks && checks.length === 1 &&
            checks.is("input[type='checkbox']") && !checks.prop("checked"))
            checks.prop("checked", true);
        }

        if (!value.template) value.template = options.list_template;
        if (!value.delete) value.delete = "Remove";

        /* <!-- Add new Item to List --> */
        FN.generate(value, list.find(options.list_data));
        
      },

      picker: e => {
        var _pick = list => {
          factory.Router.pick.multiple({
              title: options.list_picker_title,
              view: options.list_picker_view
            })
            .then(files => _.each(files, (file, i) => _handlers.add({
              kind: file.kind,
              mime: file[google.picker.Document.MIME_TYPE],
              id: file[google.picker.Document.ID],
              url: file[google.picker.Document.URL] ?
                file[google.picker.Document.URL] : file.webViewLink,
              details: file[google.picker.Document.NAME],
              type: list.find("button[data-default]").data("default"),
              icon_url: file[google.picker.Document.ICON_URL] ?
                file[google.picker.Document.ICON_URL] : file.iconLink
            }, list, i === 0)))
            .catch(e => e ? factory.Flags.error("Picking Google Drive File", e) : false);
        };
        _pick(_handlers.default(e));
      },

      file: e => {
        var _upload = list => factory.Display.files({
          id: "fields_prompt_file",
          title: options.list_upload_title,
          message: factory.Display.doc.get({
            name: options.list_upload_template,
            content: options.list_upload_content,
          }),
          action: "Upload"
        }).then(files => {
          var _total = files.length,
            _current = 0,
            _finish = factory.Display.busy({
              target: list.closest("li"),
              class: "loader-small w-100 h-0",
              fn: true
            });
          var _complete = () => ++_current == _total ? _finish() : false;
          _.each(files, source => {
            factory.Google.files.upload({
                name: source.name
              }, source, source.type)
              .then(uploaded => factory.Google.files.get(uploaded.id).then(file => {
                _handlers.add({
                  kind: file.kind,
                  mime: file.mimeType,
                  id: file.id,
                  url: file.webViewLink,
                  details: file.name,
                  type: list.find("button[data-default]").data("default"),
                  icon_url: file.iconLink
                }, list, true);
                _complete();
              }))
              .catch(e => {
                factory.Flags.error("Upload Error", e ? e : "No Inner Error");
                _complete();
              });
          });
        }).catch(e => e ? factory.Flags.error("Displaying File Upload Prompt", e) :
          factory.Flags.log("File Upload Cancelled"));
        _upload(_handlers.default(e)).then();
      },

      web: e => {
        var _enter = list => factory.Display.text({
          id: "fields_prompt_url",
          title: options.list_web_title,
          name: "Name",
          value: "URL",
          message: factory.Display.doc.get({
            name: options.list_web_template,
            content: options.list_web_content,
          }),
          validate: options.list_web_regex,
        }).then(url => {
          var _url = url.value ? url.value : url,
            _name = url.name ? url.name : options.list_web_name;
          _handlers.add({
            url: _url.indexOf("://") > 0 ? _url : "http://" + _url,
            details: _name,
            type: list.find("button[data-default]").data("default"),
            icon: "public"
          }, list, true);
        }).catch(e => e ? factory.Flags.error("Displaying URL Prompt", e) :
          factory.Flags.log("URL Prompt Cancelled"));
        _enter(_handlers.default(e));
      },

      simple: title => e => {
        var _offline = list => _handlers.add({
          details: title,
          type: list.find("button[data-default]").data("default"),
          icon: "local_printshop"
        }, list, true);
        _offline(_handlers.default(e));
      },

    };

    /* <!-- Handle List Selection Buttons --> */
    form.find("button.g-picker, a.g-picker")
      .off("click.picker").on("click.picker", _handlers.picker);
    form.find("button.g-file, a.g-file")
      .off("click.file").on("click.file", _handlers.file);
    form.find("button.web, a.web")
      .off("click.web").on("click.web", _handlers.web);
    form.find("button.paper, a.paper")
      .off("click.paper").on("click.paper", _handlers.simple(options.list_paper_title));
    form.find("button.offline, a.offline")
      .off("click.offline").on("click.offline", _handlers.simple(options.list_offline_title));

  };

  var _load = form => {
    
    /* <!-- Handle Populate Fields from File --> */
    var _handle = e => {
      var _this = $(e.currentTarget);
      factory.Flags.log("Load Handler", _this);
      /* <!-- TODO: Can load be handled here, or kicked back to the controlling app (e.g. Reflect) --> */
    };
    
    form.find("button[data-action='load'], a[data-action='load']")
      .off("click.load").on("click.load", _handle);
    
  };
  
  var _doc = form => {

    /* <!-- Handle Populate Textual Fields from Google Doc --> */
    var _handle = e => {
      var finish;
      return new Promise((resolve, reject) => {
        factory.Router.pick.single({
          title: options.doc_picker_title,
          view: options.doc_picker_view
        }).then(file => {
          finish = factory.Display.busy({
            class: "loader-medium w-100 h-100",
            fn: true
          });
          file ? factory.Flags.log("Google Drive Document Picked", file) &&
            (file.mimeType == "text/plain" ? factory.Google.files.download(file.id) :
              factory.Google.files.export(file.id, "text/plain"))
            .then(download => factory.Google.reader().promiseAsText(download)
              .then(text => resolve(text)))
            .catch(e => factory.Flags.error(`Failed to download file: ${file.id}`, e) &&
              reject(e)) : reject();
        });
      }).then(text => {
        var _$ = $(`#${$(e.target).data("targets")}`).val(text).change();
        if (_$.is("textarea.resizable") && window && window.autosize) autosize.update(_$[0]);
        finish ? finish() : true;
      }).catch(() => finish ? finish() : false);
    };

    form.find("button[data-action='load-g-doc'], a[data-action='load-g-doc']")
      .off("click.doc").on("click.doc", _handle);

  };

  var _deletes = form => {

    form.find(`${options.list_item} a.delete`).click(_remove);

  };

  var _toggles = form => {

    var _buttons = ["btn-primary", "btn-secondary", "btn-success", "btn-danger",
        "btn-warning", "btn-info", "btn-light", "btn-dark", "btn-action",
        "btn-highlight", "btn-outline-primary", "btn-outline-secondary",
        "btn-outline-success", "btn-outline-danger", "btn-outline-warning",
        "btn-outline-info", "btn-outline-light", "btn-outline-dark",
        "btn-outline-action", "btn-outline-highlight"
      ],
      _all = _buttons.join(" "),
      _on = "btn-success",
      _off = "btn-danger";

    var _update = (element, value, icon) => {

      var _colour = name => element.removeClass(_all).addClass(name);

      element.find("[class^='toggle-']")
        .addClass("d-none")
        .filter(`[class^='toggle-${icon}']`)
        .removeClass("d-none");

      value === true ?
        _colour(_on) :
        value === false ?
        _colour(_off) :
        _colour(element.data("initial"));

    };

    /* <!-- Wire up Toggle Buttons --> */
    form.find(".btn-toggle[data-targets]")
      .click(e => {

        var _this = $(e.currentTarget),
          _target = _get(_this.data("targets"));

        _target.prop("checked", !_target.prop("checked")).prop("indeterminate", false).change();

      }).each((index, element) => {

        var _this = $(element),
          _target = _get(_this.data("targets"));
        _target.prop("indeterminate", true);
        _this.addClass("indeterminate");
        _target.on(`change.${element.id}`, (target => e => {

          var _this = $(e.currentTarget),
            _value = _this.prop("checked") === true ?
            true : _this.prop("indeterminate") === true ? null : false;

          _update(target, _value, _value === true ?
            "true" : _value === false ? "false" : "indeterminate");

          if (_value === true || _value === false) target.removeClass("indeterminate");

        })(_this));

      });

  };
  
  var _complex = form => {

    form.find("button.complex-list-add, a.complex-list-add").click(e => {
      
      var _this = $(e.currentTarget);
      var _field = _this.closest("[data-output-field]"),
        _holder = form.find(`#${_this.data("details")}`),
        _details = _holder.val();
      if (!_holder.data("required") || _details) {

        /* <!-- Get Type and Defaults --> */
        var _selector = form.find(`#${_this.data("type")}`),
          _type = _selector.text().trim(),
          _default = _selector.data("default");
        _default = _default ? _default.trim() : _default;
        if (_type == _default) _type = "";
        
        /* <!-- Get Tags --> */
        var _tags = [];
        if (_this.data("tags")) {
          var _buttons = form.find(`#${_this.data("tags")}`);
          if (_buttons.length === 1) _.each(_buttons.children(".tag"), tag => _tags.push($(tag).text()));
        }

        /* <!-- Get the List we are adding to --> */
        var _list = form.find(`#${_this.data("targets")}`);

        /* <!-- Check the Checked Value input control if required --> */
        if (_list.children(".list-item").length === 0) {
          var _controls = _list.data("controls");
          if (_controls) {
            _controls = $(`#${_controls}`);
            if (_controls.is("input[type='checkbox']")) _controls.prop("checked", true);
          }
        }
        
        /* <!-- Create Template Options --> */
        var _item = _this.data("item");
        var _template = {
          template: _this.data("list-template") || options.list_template,
          options: _this.data("list-options") ? 
            _.isString(_this.data("list-options")) ? 
              JSON.parse(_this.data("list-options")) : _this.data("list-options") : null,
          prefix: _this.data("list-prefix") || "",
          details: `${_details}${(_details && _type) ? " | " : ""}${_type ? `${_default}: ${_type}` : ""}`,
          type: _item,
          tags: _tags
        };
        if (_list.data("holder-field")) _template.field = _list.data("holder-field");

        /* <!-- Get Optional Tags --> */
        _.reduce(_field.find(`input[data-item][data-item!='${$.escapeSelector(_item)}']`),
          (memo, input) => _.tap(memo, memo => {
            var _input = $(input),
              _val = _input.val(),
              _type = _input.data("item").toLowerCase();
            if (_val && _type && memo[_type] === undefined) memo[_type] = _val;
            if (_input.data("targets")) {
              var _target = $(`#${_input.data("targets")}`);
              if (_input.attr("type") == "number") _number(Number(_val), _target, 0);
            }
          }), _template);

        /* <!-- Create & Append Item --> */
        FN.generate(_template, _list);
        
        /* <!-- Clear Up ready for next list item --> */
        _holder.off("change.validity.test").val("").change()
          .removeClass("invalid").filter("textarea.resizable").map((i, el) => autosize.update(el));
        
        var _eraser = _field.find(".eraser:visible");
        _eraser.length === 1 ? _eraser.click() : _reset(_selector);

      } else {

        _holder.addClass("invalid");
        _holder.on("change.validity.test", e => {
          var _this = $(e.currentTarget);
          if (_this.val()) _this.removeClass("invalid");
          _this.off("change.validity.test");
        });

      }

      factory.Display.tidy();
      
    });

  };
  
  /* <!-- Create & Append Item --> */
  FN.generate = (value, target) => {
    
    var _generated = options.templater ? 
        options.templater(value) : $(factory.Display.template.get(value));
    _generated = _generated.appendTo(target);
    _generated.find("a.delete").click(_remove);
    _list(_generated);
    _autosize(_generated);
  
  };
  
  /* <!-- Validate individual complex elements --> */
  FN.validate = element => {
    var _element = $(element),
        _min = _element.data("min"),
        _max = _element.data("max"),
        _items = _element.children(".list-item,.list-group-item"),
        _count = _items.length;
    
    return _min ? 
            _max ? 
              _count >= _min && _count <= _max :
              _count >= _min : 
              _max ? _count <= _max : true;
    
  };
  
  FN.start = () => {
    STEPS.first = [
      _numerical, _erase, _radio, _menus,
      _complex, _reveal, _dim, _me, _datetime,
      _spans, _list, _doc, _updates, _range,
      _toggles, _load, _change
    ];
    STEPS.refresh = [_list],
    STEPS.last = [_deletes, _autosize];
  };

  FN.first = form => _.tap(form, form => _.each(STEPS.first, step => step(form)));

  FN.refresh = form => _.tap(form, form => _.each(STEPS.refresh, step => step(form)));
  
  FN.last = form => _.tap(form, form => _.each(STEPS.last, step => step(form)));

  FN.on = form => _.tap(form, form => {
    _.each(STEPS.first, step => step(form));
    _.each(STEPS.last, step => step(form));
  });
  /* <!-- Internal Functions --> */

  FN.start();

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    first: FN.first,

    on: FN.on,

    refresh: FN.refresh,
    
    last: FN.last,
    
    validate: FN.validate,

    types: {
      
      datetime: _datetime,
      
    },
    
  };
  /* <!-- External Visibility --> */

};