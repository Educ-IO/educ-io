Fields = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Wires up form field behaviours (clear, increments, spans etc) --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.me: Function to get value of me for name/email address fields [Optional]  --> */
  /* <!-- @options.templater: Function to get template for rendering (e.g. Display.template.get) [Optional for all but complex add fields]  --> */
  /* <!-- @options.list_*: See below [All Optional] --> */
  /* <!-- @options.doc_*: See below [All Optional] --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore, Moment, autosize | App Scope: Flags, Display, Google; --> */

  /* <!-- Internal Constants --> */
  const DATE_FORMAT = "yyyy-mm-dd",
    DATE_FORMAT_M = DATE_FORMAT.toUpperCase();
  const EVENT_CHANGE_DT = "change.datetime";
  const DEFAULTS = {
    me: () => "",
    list_holder: ".list-holder",
    list_template: "list_item",
    list_data: ".list-data",
    list_item: ".list-item",
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
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var _steps;
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _listen = form => {

    /* <!-- Wire up event / visibility listeners --> */
    _.each(form.find("[data-listen]"), input => {
      var _this = $(input);
      $(_this.data("listen")).off(_this.data("event")).on(_this.data("event"), () => {
        _this.show().siblings("[data-listen]").hide();
      });
    });

  };

  var _spans = form => {

    var _handler = control => {

      if (control.data("targets") && control.data("value")) {

        var _target = $("#" + control.data("targets"));

        if (_target.data("targets")) {

          var _span = control.data("span") ? control.data("span") : "";
          _target.data("span", _span);

          _target = $("#" + _target.data("targets"));

          var _start = _target.find(`input[name='${_target.attr("id")}_start']`),
            _end = _target.find(`input[name='${_target.attr("id")}_end']`);
          var _start_Date = _start.val() ? moment(_start.val(), DATE_FORMAT_M) : moment(),
            _end_Date;

          if (_span) {

            if (_start_Date.isValid()) {

              _end_Date = _start_Date.clone().add(1, _span).subtract(1, "d");
              _start.val(_start_Date.format(DATE_FORMAT_M));
              _end.val(_end_Date.format(DATE_FORMAT_M));

              ((start, span, end) => {
                start.off(EVENT_CHANGE_DT).on(EVENT_CHANGE_DT, e => {
                  var _value = $(e.currentTarget).val();
                  if (_value) {
                    _value = moment(_value, DATE_FORMAT_M);
                    if (_value.isValid()) end.val(_value.add(1, span).subtract(1, "d").format(DATE_FORMAT_M));
                  } else {
                    end.val("");
                  }
                });
              })(_start, _span, _end);

            }

          } else {

            ((start, end) => {
              start.off(EVENT_CHANGE_DT).on(EVENT_CHANGE_DT, e => {
                var _value_S = $(e.currentTarget).val();
                if (_value_S) {
                  _value_S = moment(_value_S, DATE_FORMAT_M);
                  if (_value_S.isValid()) {
                    var _value_E = moment(end.val(), DATE_FORMAT_M);
                    if (!end.val() || (_value_E.isValid() && _value_E.isSameOrBefore(_value_S)))
                      end.val(moment(_value_S, DATE_FORMAT_M).add(1, "d").format(DATE_FORMAT_M));
                  }
                } else {
                  end.val("");
                }
              });
            })(_start, _end);

          }

        }

      }

    };

    form.find("button.alter-span, a.alter-span").click(e => _handler($(e.currentTarget)));

    form.find("button.alter-span:first-child, a.alter-span:first-child").each((i, el) => _handler($(el)));

  };

  var _numerical = form => {

    /* <!-- Wire up numerical fields --> */
    form.find(".alter-numerical").click(e => {
      var _this = $(e.currentTarget);
      if (_this.data("targets") && _this.data("value")) {

        var _target = $(`#${_this.data("targets")}`),
          _value = Number(_this.data("value"));
        var _min = _target.data("min") ? Number(_target.data("min")) : 0,
          _max = _target.data("max") ? Number(_target.data("max")) : Number.MAX_VALUE;

        if (_target.hasClass("input-daterange") && _this.data("modifier")) {

          var _modifier = $(`#${_this.data("modifier")}`);
          var _span = _modifier.data("span") ? _modifier.data("span") : "d";

          var _start = _target.find(`input[name='${_target.attr("id")}_start']`),
            _start_Date = _start.val() ? moment(_start.val(), DATE_FORMAT_M) : moment();
          _start.val(_start_Date.add(_value, _span).format(DATE_FORMAT_M)).trigger(EVENT_CHANGE_DT);


        } else {

          var _suffix = _target.data("suffix"),
            _current = Number(_target.val() ? (_suffix ? _target.val().split(" ")[0] : _target.val()) : 0);
          if (_current + _value <= _max) _current += _value;
          if (_current <= _min) {
            _target.val("");
          } else if (_suffix) {
            _target.val(`${_current} ${_suffix}`);
          } else {
            _target.val(_current);
          }
          if (_target.data("targets")) $("#" + _target.data("targets")).val(_current <= _min ? 0 : _current);

        }

      }
    });

  };

  var _erase = form => {

    /* <!-- Wire up eraser actions --> */
    form.find(".eraser").click(e => {
      var _this = $(e.currentTarget),
        _target = _this.data("targets");
      if (_target) {
        $(`#${_target}, #${_target} > input`).val("").removeClass("invalid").filter("textarea.resizable").map((i, el) => autosize.update(el));
      }
      if (_this.data("reset")) {
        var _reset = $(`#${_this.data("reset")}`);
        if (_reset.data("default")) _reset.text(_reset.data("default"));
      }
    });

  };

  var _radio = form => {

    /* <!-- Wire up radio fields --> */
    form.find("input[type='radio'], input[type='checkbox']").change(e => {
      var _this = $(e.currentTarget);
      if (_this.data("targets")) {

        _this.parents("div").find(".to-dim").addClass("md-inactive");
        _this.siblings(".to-dim").removeClass("md-inactive");

        if (_this.data("value") && _this.prop("checked")) {
          autosize.update($(`#${_this.data("targets")}`).val(_this.data("value")));
        } else {
          autosize.update($(`#${_this.data("targets")}`).val(""));
        }

      }
    });

  };

  var _menus = form => {

    form.find("button.dropdown-item, a.dropdown-item").click(e => {
      var _this = $(e.currentTarget);
      if (_this.data("targets") && _this.data("value")) {
        e.preventDefault();
        form.find(`#${_this.data("targets")}, #${_this.data("targets")}:first-child`).text(_this.data("value"));
      }
    });

  };

  var _complex = form => {

    form.find("button.complex-list-add, a.complex-list-add").click(e => {
      var _this = $(e.currentTarget);
      var _holder = form.find(`#${_this.data("details")}`),
        _details = _holder.val();
      if (_details) {

        /* <!-- Get Type and Defaults --> */
        var _selector = form.find(`#${_this.data("type")}`),
          _type = _selector.text().trim(),
          _default = _selector.data("default");
        if (_type == _default) _type = "";

        /* <!-- Add new Item to List --> */
        var _list = form.find(`#${_this.data("targets")}`);
        if (_list.children(".list-item").length === 0) _this.closest(".input-group").children("input[type='checkbox']").prop("checked", true);
        if (options.templater) $(options.templater({
          template: "list_item",
          details: `${_details}${_type ? ` [${_default}: ${_type}]` : ""}`,
          type: _this.data("item"),
          delete: "Remove"
        })).appendTo(_list).find("a.delete").click(e => {
          e.preventDefault();
          if ($(e.currentTarget).parent().siblings(".list-item").length === 0) {
            _this.closest(".input-group").children("input[type='checkbox']").prop("checked", false);
          }
          $(e.currentTarget).parent().remove();
        });

        /* <!-- Clear Up ready for next list item --> */
        _holder.off("change.validity.test").val("")
          .removeClass("invalid").filter("textarea.resizable").map((i, el) => autosize.update(el));
        _selector.text(_default);

      } else {

        _holder.addClass("invalid");
        _holder.on("change.validity.test", e => {
          var _this = $(e.currentTarget);
          if (_this.val()) _this.removeClass("invalid");
          _this.off("change.validity.test");
        });

      }

    });

  };

  var _autosize = form => {

    form.find("textarea.resizable").on("focus.autosize", e => autosize(e.currentTarget));

  };

  var _reveal = form => {

    /* <!-- Wire up event / visibility listeners --> */
    form.find("[data-reveal]").off("change.reveal").on("change.reveal", e => {
      $($(e.currentTarget).data("reveal")).slideToggle();
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
      .on("click.me", e => $(`#${$(e.currentTarget).data("targets")}`).val(options.me()));

    form.find("input[data-input-default='me'], textarea[data-input-default='me']").val(options.me());

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
    }

  };

  var _list = form => {

    var _handlers = {

      default: e => $(_.tap(e, e => e.preventDefault()).currentTarget).parents(options.list_holder),

      add: (value, list, check) => {

        if (check !== false) {
          var checks = list.find("input[type='checkbox']");
          if (checks && checks.length == 1 && !checks.prop("checked")) checks.prop("checked", true);
        }

        if (!value.template) value.template = options.list_template;
        if (!value.delete) value.delete = "Remove";

        /* <!-- Add new Item to List --> */
        $(factory.Display.template.get(value))
          .appendTo(list.find(options.list_data))
          .find("a.delete")
          .click(e => {
            e.preventDefault();
            var _this = $(e.currentTarget).parent();
            if (_this.siblings(options.list_item).length === 0)
              _this.closest(".input-group")
              .children("input[type='checkbox']")
              .prop("checked", false);
            _this.remove();
          });
      },

      picker: e => {
        var _pick = list => {
          factory.Router.pick.multiple({
              title: options.list_picker_title,
              view: options.list_picker_view
            })
            .then(files => _.each(files, (file, i) => _handlers.add({
              id: file[google.picker.Document.ID],
              url: file[google.picker.Document.URL],
              details: file[google.picker.Document.NAME],
              type: list.find("button[data-default]").data("default"),
              icon_url: file[google.picker.Document.ICON_URL]
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
              class: "loader-small w-100",
              fn: true
            });
          var _complete = () => ++_current == _total ? _finish() : false;
          _.each(files, source => {
            factory.Google.files.upload({
                name: source.name
              }, source, source.type)
              .then(uploaded => factory.Google.files.get(uploaded.id).then(file => {
                _handlers.add({
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
        _upload(_handlers.default(e));
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
        var _$ = $(`#${$(e.target).data("targets")}`).val(text);
        if (_$.is("textarea.resizable") && window && window.autosize) autosize.update(_$[0]);
        finish ? finish() : true;
      }).catch(() => finish ? finish() : false);
    };

    form.find("button[data-action='load-g-doc'], a[data-action='load-g-doc']")
      .off("click.doc").on("click.doc", _handle);

  };

  var _start = () => {
    _steps = [
      _listen, _numerical, _erase, _radio, _menus,
      _complex, _reveal, _dim, _autosize, _me, _datetime,
      _spans, _list, _doc
    ];
  };
  /* <!-- Internal Functions --> */

  _start();

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    on: form => {
      _.each(_steps, step => step(form));
      return form;
    },

  };
  /* <!-- External Visibility --> */

};