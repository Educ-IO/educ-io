App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) {
    return new this.App().initialise(this);
  }

  /* <!-- Internal Constants --> */
  const TYPE_SCALE = "application/x.educ-io.reflect-scale",
    TYPE_FORM = "application/x.educ-io.reflect-form",
    TYPE_REPORT = "application/x.educ-io.reflect-report",
    TYPE_REVIEW = "application/x.educ-io.reflect-review",
    TYPE_TRACKER = "application/x.educ-io.reflect-tracker",
    TYPE_ANALYSIS = "application/x.educ-io.reflect-analysis",
    TYPES = [TYPE_SCALE, TYPE_FORM, TYPE_REPORT, TYPE_REVIEW, TYPE_TRACKER, TYPE_ANALYSIS];
  const STATE_FILE_LOADED = "loaded-file",
    STATE_FORM_OPENED = "opened-form",
    STATE_REPORT_OPENED = "opened-report",
    STATE_REPORT_SIGNABLE = "signable-report",
    STATE_REPORT_EDITABLE = "editable-report",
    STATE_TRACKER_OPENED = "opened-tracker",
    STATE_SCALE_OPENED = "opened-scale",
    STATE_REPORT_COMPLETE = "report-complete",
    STATE_ANALYSIS = "analysis",
    STATE_ANALYSIS_SUMMARY = "analysis-summary",
    STATE_ANALYSIS_DETAIL = "analysis-detail",
    STATE_ANALYSIS_ALL = "analysis-reports-all",
    STATE_ANALYSIS_MINE = "analysis-reports-mine",
    STATE_ANALYSIS_SHARED = "analysis-reports-shared",
    STATE_ANALYSIS_ANY = "analysis-stage-any",
    STATE_ANALYSIS_COMPLETE = "analysis-stage-complete",
    STATE_ANALYSIS_VERIFY = "analysis-verify",
    STATES = [STATE_FILE_LOADED, STATE_FORM_OPENED, STATE_TRACKER_OPENED,
      STATE_REPORT_COMPLETE, STATE_REPORT_OPENED, STATE_REPORT_SIGNABLE, STATE_REPORT_EDITABLE,
      STATE_SCALE_OPENED, STATE_ANALYSIS, STATE_ANALYSIS_SUMMARY, STATE_ANALYSIS_DETAIL,
      STATE_ANALYSIS_ALL, STATE_ANALYSIS_MINE, STATE_ANALYSIS_SHARED,
      STATE_ANALYSIS_ANY, STATE_ANALYSIS_COMPLETE, STATE_ANALYSIS_VERIFY
    ];
  const EMAIL = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
    META = "__meta",
    INDEX = "index",
    PATH = "path",
    TRANSFORM = "transform",
    EXTRACT = "extract",
    SIGNATORY = "signatory",
    DESTINATION = "destination",
    EXTENSION = ".reflect",
    EXTENSION_REGEX = /.REFLECT$/i,
    REGEX_REPLACER = (key, value) => value && typeof value === "object" &&
    value.constructor === RegExp ? value.source : value,
    SAVING_REPLACER = (key, value) => key && key === "__extends" ?
    undefined : REGEX_REPLACER(key, value),
    EDITING_REPLACER = (key, value) => key && key.indexOf("$") === 0 ?
    undefined : REGEX_REPLACER(key, value),
    SIGNING_REPLACER = (key, value) => key &&
    (key === "__order" || key === "__type" || key === "__meta") ?
    undefined : EDITING_REPLACER(key, value),
    FN = {};
  
  const SCOPE_FULL_DRIVE = "https://www.googleapis.com/auth/drive";
  
  const LOADER = "loader",
        BUTTON = "#createRelectiveReport",
        LOADED = () => $(BUTTON).removeClass(LOADER);
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {}, /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */

  /* <-- Helper Functions --> */
  FN.helper = {

    prefix: mime => mime == TYPE_FORM ?
      "FORM" : mime == TYPE_SCALE ?
      "SCALE" : mime == TYPE_REVIEW ?
      "REVIEW" : mime == TYPE_TRACKER ?
      "TRACKER" : mime == TYPE_ANALYSIS ?
      "ANALYSIS" : "",

    span: dates => {
      var _today = ಠ_ಠ.Dates.now(),
        _past = dates.span == "AY" ?
        _today.month() > 8 ?
        _today.month(8).startOf("month") :
        _today.subtract(1, "year").month(8).startOf("month") :
        _today.subtract(1, dates.span);
      dates.from = _past.startOf("day");
      dates.to = _today.endOf("day");
      return dates;
    },

    title: (title, mime) => {
      var _prefix = FN.helper.prefix(mime);
      return `${_prefix ? `${_prefix} | ` : ""}${title}`;
    },

    values: (form, report, filter, use, initial) => _.reduce(form.groups, (memo, group) =>
      _.reduce(_.filter(group.fields, field => field[META] && filter(field[META])),
        (memo, field) => {
          var _field = report[field.field];
          if (_field && (_field.Value || _field.Values))
            use(_field.Value || _field.Values, field.field, field[META], memo);
          return memo;
        }, memo), initial),

    files: report => {
      var _reduction = (memo, values) => _.reduce(values, (memo, value) => {
        if (_.isObject(value)) value.Value && value.Kind && value.Mime && value.Value.Id ?
          memo.push({
            kind: value.Kind,
            id: value.Value.Id,
            mime: value.Mime
          }) : (memo = _reduction(memo, value));
        return memo;
      }, memo);
      return _reduction([], report);
    },

    addresses: (type, dehyrated) => {
      var _values = FN.helper.values((dehyrated ? dehyrated : (dehyrated = FN.action.dehydrate()))
        .data.form, dehyrated.data.report,
        meta => meta[type], (value, field, meta, memo) => memo.push(value), []);
      return _.chain(_values).reduce((memo, value) => memo.concat(value ?
        value.match(EMAIL) : []), []).filter(value => value).value();
    },

    emails: options => ಠ_ಠ.Display.modal("send", _.defaults(options, {
        id: "emails",
        validate: values => values && values.Email && values.Email.Values,
      }), dialog => {
        ಱ.fields.on(dialog);
        ಠ_ಠ.Dialog({}, ಠ_ಠ).handlers.list(dialog, EMAIL);
        dialog.find("textarea").focus();
      }).then(value => {
        if (!value) return false;
        var _map = email => {
          var _match = email.match(EMAIL);
          return _match ? _match[0] : "";
        };
        value.Email.Values = _.isArray(value.Email.Values) ?
          _.map(value.Email.Values, _map) : _map(value.Email.Values);
        return value;
      })
      .catch(e => (e ? ಠ_ಠ.Flags.error("Send Error", e) : ಠ_ಠ.Flags.log("Send Cancelled")).negative()),

    dirty: report => !ರ‿ರ.hash ||
      ರ‿ರ.hash !== new Hashes.MD5().hex(ಱ.strings.stringify(report, SIGNING_REPLACER)),

    scales: form => {
      
      form.find("button[data-expand='scale'],a[data-expand='scale']")
        .off("click.expand").on("click.expand", e => {
      
          var _this = $(e.currentTarget),
              _name = _this.data("targets"),
              _field = _this.data("field"),
              _action = _this.data("action"),
              _title = _this.data("value"),
              _instructions = _this.data("details"),
              _scale = ಱ.forms.scale(_name);

          if (_scale) return ಠ_ಠ.Display.modal("scale", {
              id: "dialog_Scale",
              markers: ಱ.forms.process(_scale.scale),
              title: _title,
              field: _field,
              instructions: _instructions,
              action: _action,
              wide: true
            }, dialog => {
              var _form = ಱ.fields.on(dialog.find("form")),
                  _selected = _this.data("selected");
              ಠ_ಠ.Data({}, ಠ_ಠ).rehydrate(_form, _selected || {});
            }).then(values => {
            
              /* <-- Action Button Clicked (e.g. not dismissed) --> */
              if (values) {
                _this.data("selected", _.isEmpty(values) ? null : values);
                _this.children("span.d-inline").remove();
                if (_.isEmpty(values)) {
                  _this.children("i.material-icons").removeClass("d-none");
                } else {
                  _this.find("i.material-icons").addClass("d-none");
                  var _reducer = (memo, value, key) => {
                      if (key !== "Value" && value && value.Value === true) {
                        memo.push(_.keys(value).length == 1 ? key :
                          _.map(_.reduce(value, _reducer, []), (value, i) => i === 0 ? `${key} - ${value}` : value).join("; "));
                      }
                      return memo;
                    };
                  var _details = values.Standards.Values ? _.reduce(values.Standards.Values, _reducer, []): [];
                  _.each(_details, detail => _this.append(ಠ_ಠ.Display.template.get({
                      template: "tag",
                      detail: detail
                    })));
                }
              }
            });

        });
      
    }
    
  };
  /* <-- Helper Functions --> */

  
  /* <!-- Find Functions --> */
  FN.find = {
    
    reports: form => ಠ_ಠ.Google.files.type(TYPE_REPORT, "domain,user,allTeamDrives", null, `(${form ? `appProperties has {key='FORM' and value='${form.$name ? form.$name : form.name ? form.name : form}'} and ` : ""}'me' in owners and not appProperties has {key='COMPLETE' and value='true'})`)
                      .catch(e => ಠ_ಠ.Flags.error("Reports Finding Error", e).negative())
                      .then(ಠ_ಠ.Main.busy("Looking for Existing Reports")),
    
  };
  /* <!-- Find Functions --> */

  
  /* <!-- Display Functions --> */
  FN.display = {

    report: (name, state, form, process, actions) => {
      var _initial = form ?
        ಱ.forms.create(name, form, actions.editable, actions.signable, actions.completed) :
        ಱ.forms.get(name, true, false),
        _return = _initial.form;
      ರ‿ರ.template = _initial.template;
      if (ರ‿ರ.template) ರ‿ರ.template.$name = name;
      _return.target = ಠ_ಠ.container.empty();
      ಠ_ಠ.Display.state().change(STATES, state).protect("a.jump").on("JUMP");

      var _shown = ಠ_ಠ.Display.template.show(_return),
          _form = _shown.find("form"),
          _fields = ಠ_ಠ.Fields({
            me: ಠ_ಠ.me ? ಠ_ಠ.me.full_name : undefined,
            templater: options => ಠ_ಠ.Display.template.process($(ಠ_ಠ.Display.template.get(options))),
            list_upload_content: "Evidence",
            list_web_content: "Evidence",
            forms: ಱ.forms
          }, ಠ_ಠ);

      /* <!-- Process 'first' field hookups --> */
      _fields.first(_shown);
      
      /* <!-- Handle Default Form Submission (Keyboard) etc. | Maybe doesn't get triggered? --> */
      _form.submit(actions && actions.editable ? e => {
        e.preventDefault();
        FN.action.save.report().then(result => result ? FN.process.signatures() : false);
      } : e => e.preventDefault());
      
      /* <!-- Process Scale Hookups --> */
      FN.helper.scales(_form);

      /* <!-- Handle Process argument, if supplied --> */
      if (process) process(_shown);
      
      /* <!-- Smooth Scroll Anchors --> */
      if (ಠ_ಠ.Scroll) ಠ_ಠ.Scroll({
        class: "smooth-scroll"
      }).start();

      /* <!-- Process 'last' field hookups --> */
      return _fields.last(_shown);
      
    },

    form: value => {
      if (value) {
        ರ‿ರ.preview = value;
        var _form = ಱ.forms.create("preview_Form", JSON.parse(value), false, false, false, true);
        _form.target = ಠ_ಠ.container.empty();
        ಠ_ಠ.Display
          .state().change(STATES, STATE_FORM_OPENED)
          .protect("a.jump").on("JUMP")
          .template.show(_form.form);
      }
    },

  };
  /* <!-- Display Functions --> */


  /* <-- Edit Functions --> */
  FN.edit = {

    generic: (value, help, title, id, mimeType, replacer, editable, clean) =>
      ಠ_ಠ.Display.text({
        id: id ? id : "generic_editor",
        title: title ? title : "Create / Edit ...",
        message: help ? ಠ_ಠ.Display.doc.get(help) : "",
        validate: value => {
          try {
            JSON.parse(value);
            if (value) return true;
          } catch (e) {
            return ಠ_ಠ.Flags.error("JSON Parsing", e).negative();
          }
        },
        state: {
          value: value && _.isObject(value) ? JSON.stringify(value, replacer, 2) : value
        },
        action: ರ‿ರ.file && mimeType == TYPE_FORM ? "Show" : editable === false ? false : "Save",
        actions: [{
          text: "Download",
          handler: values => {
            if (values && values.length === 1) {
              try {
                saveAs(new Blob([values[0].value], {
                  type: mimeType
                }), `${FN.helper.title(value && value.title ? 
                                       value.title : "download", mimeType)}${EXTENSION}`);
              } catch (e) {
                ಠ_ಠ.Flags.error("Download", e);
              }
            }
          }
        }],
        rows: 10
      })
      .then(values => values && ರ‿ರ.file ?
        mimeType == TYPE_FORM ?
        FN.display.form(values) :
        ಠ_ಠ.Google.files.upload(null, values, ರ‿ರ.file.mimeType, null, ರ‿ರ.file.id, true)
        .then(ಠ_ಠ.Main.busy("Updating"))
        .then(uploaded => ರ‿ರ.file = uploaded) :
        values)
      .catch(e => {
        if (clean) ಠ_ಠ.Router.clean(true);
        return e ? ಠ_ಠ.Flags.error("Edit Error", e).negative() :
          ಠ_ಠ.Flags.log("Edit Cancelled").reflect(null);
      }),

    report: report => FN.edit.generic(report.data, "REPORT", "Create / Edit Report ...",
      "form_report", TYPE_REPORT, REGEX_REPLACER),

    form: (form, editable) => FN.edit.generic(form, "FORM", "Create / Edit Form ...",
      "form_editor", TYPE_FORM, EDITING_REPLACER, editable, true),

    scale: (scale, editable) => FN.edit.generic(scale, "SCALE", "Create / Edit Scale ...",
      "scale_editor", TYPE_SCALE, EDITING_REPLACER, editable, true),

  };
  /* <-- Edit Functions --> */


  /* <!-- Create Functions --> */
  FN.create = {

    parent: id => new Promise(resolve => ಠ_ಠ.Google.files.get(id, true)
      .then(f => {
        ಠ_ಠ.Google.folders.is(true)(f) ?
          resolve(f) : ಠ_ಠ.Flags.error(`Supplied ID is not a folder: ${id}`) && resolve();
      }).catch(e => {
        ಠ_ಠ.Flags.error(`Opening Google Drive Folder: ${id}`, e) && resolve();
      })),

    load: (form, process, actions) => FN.create.report(form.__name || form.$name, actions, form, process),

    generic: (edit, value, mime) => edit(value)
      .then(result => {
        var _process = result => {
          var _title = result.title ?
            Promise.resolve(result.title) :
            result.name ?
            Promise.resolve(result.name) :
            ಠ_ಠ.Display.text({
              id: "file_name",
              title: "File Name",
              simple: true
            });
          return _title.then(title => ಠ_ಠ.Google.files.upload({
            name: `${FN.helper.title(title, mime)}${EXTENSION}`
          }, JSON.stringify(result, REGEX_REPLACER, 2), mime), null, null, true);
        };
        return result ? _process(JSON.parse(result)) : Promise.resolve(result);
      }),

    select: (files, name, actions, form, process) => {
      
      var _decoder = ಠ_ಠ.Decode(ಠ_ಠ, {
                      id: name,
                      template: ಱ.forms.template(name)
                     }),
          _fields = _decoder.fields(),
          _create = false;
              
      return FN.prompt.choose(_.map(files, file => ({
          value: file.id,
          name: file.name,
          title: ಠ_ಠ.Display.template.get(_.extend({
            template: "meta",
            Created: ಠ_ಠ.Dates.parse(file.createdTime).format("YYYY-MM-DD"),
            Modified: ಠ_ಠ.Dates.parse(file.modifiedByMeTime).format("YYYY-MM-DD")
          }, _.pick(_decoder.values(file, _fields), value => value || value === false || value === 0))),
          html: true,
        })), "Open Existing or Create New?", "EXISTING_REPORT_INSTRUCTIONS", false, [{
        text: "Create New",
        handler: () => _create = true
      }], null, "Open")
      .then(value => _create ? FN.create.report(name, actions, form, process) : value ? FN.action.load(_.find(files, file => file.id == value.value)) : false);
      
    },
    
    existing: (name, actions, form, process) => FN.find.reports(form || name)
      .then(results => results && results.length > 0 ? FN.create.select(results, name, actions, form, process) : FN.create.report(name, actions, form, process)),
    
    report: (name, actions, form, process) => FN.display.report(name, [STATE_REPORT_OPENED]
      .concat(!actions || (actions.editable && !actions.completed) ? [STATE_REPORT_EDITABLE] : [])
      .concat(actions && actions.signable ? [STATE_REPORT_SIGNABLE] : [])
      .concat(actions && actions.completed ? [STATE_REPORT_COMPLETE] : []),
      form, process, actions),

    form: name => FN.create.generic(FN.edit.form, name ?
        ಱ.forms.get(name).template : "", TYPE_FORM)
      .then(ಱ.notify.actions.save("NOTIFY_SAVE_FORM_SUCCESS"))
      .catch(e => e ? ಠ_ಠ.Flags.error("Displaying Form Create Prompt", e).negative() : false),

    scale: name => FN.create.generic(FN.edit.scale, name ?
        ಱ.forms.scale(name) : "", TYPE_SCALE)
      .then(value => value ?
        ಠ_ಠ.Display.state().enter(STATE_SCALE_OPENED).protect("a.jump").on("JUMP") : null)
      .catch(e => e ? ಠ_ಠ.Flags.error("Displaying Scale Create Prompt", e).negative() : false),

    tracker: name => name,
    /* <!-- TODO: Tracker Creation --> */
  };
  /* <!-- Create Functions --> */


  /* <!-- Prompt Functions --> */
  FN.prompt = {

    dates: () => ಠ_ಠ.Display.modal("dates", {
      id: "dates",
      instructions: ಠ_ಠ.Display.doc.get("ANALYSE_DATES"),
      validate: values => values && values.Range && values.Range.Values &&
        (values.Range.Values.Start || values.Range.Values.End),
      title: "Filter Date Range",
      field: "Range",
      icon: "query_builder",
      type: "Custom",
      options: [{
          value: "Custom",
          name: "Custom"
        },
        {
          span: "w",
          value: "Week",
          name: "Week"
        },
        {
          span: "M",
          value: "Month",
          name: "Month"
        },
        {
          span: "y",
          value: "Year",
          name: "Year"
        }
      ],
      periods: [{
          span: "w",
          value: "week",
          name: "Last Week"
        },
        {
          span: "M",
          value: "month",
          name: "Last Month"
        },
        {
          span: "Y",
          value: "year",
          name: "Last Year"
        },
        {
          span: "AY",
          value: "academic",
          name: "Academic Year"
        },
      ],
    }, dialog => {
      ಱ.fields.on(dialog);
      dialog.find("input[type='radio'][name='period_Select']").change(e => {
        var _$ = $(e.currentTarget),
          _span = _$.data("span"),
          _dates = dialog.find("fieldset[name='custom']");
        if (_span) {
          _dates.attr("disabled", "disabled");
          var _start = dialog.find("input[type='text'][data-output-name='Start']"),
            _end = dialog.find("input[type='text'][data-output-name='End']");
          var _format = "YYYY-MM-DD",
            _values = FN.helper.span({
              span: _span
            });
          _start.val(_values.from.format(_format));
          _end.val(_values.to.format(_format));
        } else {
          _dates.attr("disabled", null);
        }
      });
    }).then(values => values ? {
      span: values.Period && values.Period.Values ? values.Period.Values.Span : null,
      from: values.Range.Values.Start ? ಠ_ಠ.Dates.parse(values.Range.Values.Start) : null,
      to: values.Range.Values.End ? ಠ_ಠ.Date.parse(values.Range.Values.End).endOf("day") : null
    } : false),

    analysis: mine => {
      var _analyse = (results, dates) => {
          ಠ_ಠ.Router.clean(false); /* <!-- Clear any existing file/state --> */
          results = _.isArray(results) ? results : [results];
          var _ln = results.length;
          ಠ_ಠ.Flags.log(`${_ln} form${_ln > 1 ? "s" : ""} selected for Analysis`, results);
          return FN.process.analysis(_.map(results, result => ({
            id: result.value,
            name: `${result.name}${result.title ? ` [${result.title}]` : ""}`
          })), mine, false, dates).then(ಠ_ಠ.Main.busy("Finding Reports"));
        },
        _filter;
      return FN.prompt.choose(
          ಱ.forms.selection("forms", "Report"),
          "Select a Form ...", "ANALYSE", true, [{
            text: "Filter",
            handler: () => _filter = true
          }],
          value => _.isEmpty(value) === false)
        .then(results => results ? _filter ?
          FN.prompt.dates().then(dates => dates ? _analyse(results, dates) : false) :
          _analyse(results) : false);
    },

    choose: (options, title, instructions, multiple, actions, validate, action) =>
      ಠ_ಠ.Display.choose({
        id: "select_chooser",
        title: title,
        instructions: ಠ_ಠ.Display.doc.get(instructions),
        choices: options,
        multiple: multiple,
        action: action || "Select",
        actions: actions,
        validate: validate
      })
      .catch(e => (e ? ಠ_ಠ.Flags.error("Displaying Select Prompt", e) :
        ಠ_ಠ.Flags.log("Select Prompt Cancelled")).negative())
      .then(result => {
        if (result) ಠ_ಠ.Flags.log("Selected:", result);
        return result;
      }),

    create: (actions, folder) => ಠ_ಠ.Display.action({
      id: "create_chooser",
      title: "Create with Reflect ...",
      instructions: [ಠ_ಠ.Display.doc.get({
        name: "CREATE",
        content: folder ? folder : "Google Drive"
      })].concat(_.map(actions, action => ಠ_ಠ.Display.doc.get(action.doc))).join("\n"),
      actions: actions,
      large: true
    }).then(result => {
      return result.action.command ?
        (() => {
          ಠ_ಠ.Flags.log("Create Action Selected:", result);
          ಠ_ಠ.Router.clean(false); /* <!-- Clear any existing file/state --> */
          return FN.create[result.action.command](result.option.value);
        })() : null;
    }).catch(e => (e ? ಠ_ಠ.Flags.error("Create Select Prompt", e) :
      ಠ_ಠ.Flags.log("Create Prompt Cancelled")).negative()),

    scales: () => ({
      name: "Scale",
      desc: "Create Scale",
      command: "scale",
      doc: "CREATE_SCALE",
      options: [{
        name: "New ..."
      }].concat(ಱ.forms.selection("scales", "Scale"))
    }),

    forms: () => ({
      name: "Form",
      desc: "Create Form",
      command: "form",
      doc: "CREATE_FORM",
      options: [{
        name: "New ..."
      }].concat(ಱ.forms.selection("forms", "Report"))
    }),
    
    reports: () => ({
      name: "Report",
      desc: "Create Report",
      command: "existing", /* <!-- Runs through check for existing reports first --> */
      doc: "CREATE_REPORT",
      options: ಱ.forms.selection("forms", "Report"),
    }),

    trackers: () => ({
      name: "Tracker",
      desc: "Create Tracker",
      command: "tracker",
      doc: "CREATE_TRACKER",
      options: ಱ.forms.selection("scales", "Scale")
    }),

  };
  /* <!-- Prompt Functions --> */


  /* <!-- Process Functions --> */
  FN.process = {

    signatures: () => {

      var _data = FN.action.dehydrate().data,
        _target = ರ‿ರ.form.find(".signatures").empty(),
        _none = () => {

          _target.html(ಠ_ಠ.Display.doc.get("NO_SIGNATURES"));
          _target.parents(".card").find(".card-header h5").html("Signatures");

        },
        _display = signatures => {

          ರ‿ರ.signatures = signatures.length;
          ಠ_ಠ.Display.template.show({
            template: "count",
            name: "Signatures",
            count: signatures.length,
            clear: true,
            target: _target.parents(".card").find(".card-header h5")
          });

          _.each(signatures, signature => {
            signature.template = "signature";
            _target.append(ಠ_ಠ.Display.template.get(signature));
          });

          var _invalid = _.filter(signatures, signature => signature.valid === false).length > 0;
          _target.parents(".card").find(".card-header .count")
            .append(ಠ_ಠ.Display.template.get(_invalid == signatures.length ? {
                template: "valid",
                class: "ml-2 text-danger",
                valid: false,
                desc: "All signatures are invalid / out of date!"
              } : _invalid > 0 ? {
                template: "valid",
                class: "ml-2 text-warning",
                valid: false,
                desc: "Some signatures are invalid / out of date!"
              } : {
                template: "valid",
                valid: true,
                class: "ml-2 text-success",
              }));

        };

      if (ರ‿ರ.file) ಱ.signatures.list(ರ‿ರ.file, _data)
        .then(signatures => signatures && signatures.length > 0 ? _display(signatures) : _none());

    },

    report: (data, actions) => {
      FN.create.load(_.tap(data, data =>
          ಠ_ಠ.Flags.log(`Loaded Report File: ${JSON.stringify(data, REGEX_REPLACER, 2)}`)).form,
        form => {
          var _return = (ರ‿ರ.form = ಠ_ಠ.Data({}, ಠ_ಠ).rehydrate(form, data.report));
          /* <!-- Re-wire up refreshed (e.g. List) events --> */
          ಱ.fields.refresh(_return);
          return _return;
        }, actions);
      return FN.process.signatures();
    },

    form: (data, actions) => {
      FN.edit.form(_.tap(data, data => ಠ_ಠ.Flags.log(`Loaded Form File: ${data}`)), actions);
      return true;
    },

    tracker: (data, editable) => ({
      data: data,
      editable: editable
    }),
    /* <!-- TODO: Process Tracker Loading --> */

    analysis: (forms, mine, full, dates, expected) => Promise.resolve(_.map(forms, form => ({
      id: form.id,
      template: form.template || ಱ.forms.template(form.id)
    }))).then(
      forms => {
        ರ‿ರ.definition = {
          forms: forms,
          mine: mine,
          full: full,
          dates: dates
        };
        return Promise.all(_.map(forms,
            form => ಠ_ಠ.Google.files.search(TYPE_REPORT, `FORM=${form.id}`, mine, dates, true)))
          .then(reports => {
            return _.reduce(reports, (memo, reports) => memo.concat(reports), []);
          })
          .then(reports => full ?
            Promise.all(_.map(reports, report => ಠ_ಠ.Google.files.download(report.id)
              .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
              .then(content => ({
                file: report,
                content: JSON.parse(content)
              })))) :
            _.map(reports, report => ({
              file: report
            })))
          .then(reports => _.each(reports, report => {
            if (report.file.appProperties.FORM) {
              var _form = _.find(forms, {
                id: report.file.appProperties.FORM
              });
              report.title = _form ?
                _form.template.title ?
                _form.template.title : _form.template.name :
                report.file.appProperties.FORM;
            }
          }))
          .then(reports => {
            ರ‿ರ.analysis = ಠ_ಠ.Analysis(ಠ_ಠ, forms, reports, expected, ಱ.signatures);
            ಠ_ಠ.Display.state()
              .change(STATES, STATE_ANALYSIS)
              .protect("a.jump").on("JUMP");
            return reports;
          });
      }
    ),

  };
  /* <!-- Process Functions --> */


  /* <!-- Action Functions --> */
  FN.action = {

    recent: (file, silent) => _.tap(file,
      file => ಠ_ಠ.Recent.add((silent ? file : ರ‿ರ.file = file).id,
        file.name.replace(EXTENSION_REGEX, ""),
        "#google,load." + file.id, null, null,
        ಠ_ಠ.Google.files.is(TYPE_REPORT)(file) ? "assignment" :
        ಠ_ಠ.Google.files.is(TYPE_FORM)(file) ? "dashboard" :
        ಠ_ಠ.Google.files.is(TYPE_ANALYSIS)(file) ? "assessment" :
        ಠ_ಠ.Google.files.is(TYPE_REVIEW)(file) ? "search" :
        ಠ_ಠ.Google.files.is(TYPE_TRACKER)(file) ? "timeline" :
        ಠ_ಠ.Google.files.is(TYPE_SCALE)(file) ? "toc" : null)),

    revoke: () => ಠ_ಠ.Display.confirm({
        id: "confirm_Revoke",
        target: ಠ_ಠ.container,
        message: ಠ_ಠ.Display.doc.get("REVOKE_COMPLETION"),
        action: "Revoke",
        close: "Cancel"
      })
      .then(result => result !== true ?
        false : ಠ_ಠ.Google.files.update(ರ‿ರ.file.id, {
          appProperties: {
            COMPLETE: null
          }
        }, null, true)
        .then(ಠ_ಠ.Main.busy("Revoking"))
        .then(uploaded => uploaded ? FN.action.load(uploaded) : false)),

    screenshot: element => (window.html2canvas ?
        html2canvas(_.tap(element, () => window.scrollTo(0, 0)), {
          logging: ಠ_ಠ.Flags.debug(),
          ignoreElements: element => element.nodeName === "IFRAME"
        }) :
        Promise.reject(new Error(`HTML2Canvas Object Evalulates to ${window.html2canvas}`)))
      .then(canvas => ({
        thumbnail: {
          mimeType: "image/png",
          image: canvas.toDataURL("image/png")
            .replace(/^data:image\/png;base64,/i, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/, "")
        }
      }))
      .catch(e => ಠ_ಠ.Flags.error("Screenshot Error", e).negative())
      .then(result => result && result.thumbnail ? result : false),

    dehydrate: () => {

      var _title = ರ‿ರ.template && ರ‿ರ.template.title ?
        ರ‿ರ.template.title : ರ‿ರ.template && ರ‿ರ.template.name ?
        ರ‿ರ.template.name : "Report",
        _date = ಠ_ಠ.Dates.now().format("YYYY-MM-DD");

      return {
        name: ರ‿ರ.file ?
          ರ‿ರ.file.name : `${FN.helper.title(`${ಠ_ಠ.me ? `${ಠ_ಠ.me.display_name()} | ` : ""}${_title} | ${_date}`, TYPE_REPORT)}${EXTENSION}`,
        data: {
          form: _.omit(ರ‿ರ.template, META),
          report: ಠ_ಠ.Data({}, ಠ_ಠ).dehydrate(ರ‿ರ.form)
        }
      };

    },

    get: (value, force) => Promise.resolve(value ? value : FN.action.dehydrate())
      .then(ಠ_ಠ.Main.busy("Getting Report"))
      .then(dehydrated => !force && FN.helper.dirty(dehydrated.data.report) ?
        FN.action.save.report(false, dehydrated).then(() => dehydrated) : dehydrated),

    load: file => ಠ_ಠ.Google.files.download((ರ‿ರ.file = file).id)
      .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
      .then(content => ({
        content: file.mimeType === TYPE_REPORT ?
          _.tap(JSON.parse(content),
            data => ರ‿ರ.hash = new Hashes.MD5().hex(ಱ.strings.stringify(data.report,
              SIGNING_REPLACER))) : file.mimeType === TYPE_ANALYSIS ? JSON.parse(content) : content,
        actions: {
          editable: (file.capabilities && file.capabilities.canEdit),
          signable: file.capabilities && file.capabilities.canComment,
          completed: !!(file.appProperties && file.appProperties.COMPLETE),
          revisions: file.capabilities && file.capabilities.canReadRevisions
        }
      }))
      .then(value => _.tap(value, () => ಠ_ಠ.Display.state().enter(STATE_FILE_LOADED)))
      .then(value =>
        ಠ_ಠ.Google.files.is(TYPE_REPORT)(file) ?
          FN.process.report(value.content, value.actions) :
          ಠ_ಠ.Google.files.is(TYPE_FORM)(file) ?
            FN.process.form(value.content, value.actions) :
            ಠ_ಠ.Google.files.is(TYPE_ANALYSIS)(file) ?
              FN.process.analysis(value.content.forms, value.content.mine,
                value.content.full, value.content.dates ? _.tap(value.content.dates, FN.helper.span) : value.content.dates,
                value.content.expected)
        .then(() => ಠ_ಠ.Display.state()
          .enter([STATE_ANALYSIS_SUMMARY, STATE_ANALYSIS_ALL, STATE_ANALYSIS_ANY])) :
        Promise.reject(`Supplied ID is not a recognised Reflect File Type: ${file.id} | ${file.mimeType}`)),

    edit: () => Promise.resolve(FN.action.dehydrate())
      .then(ಠ_ಠ.Main.busy("Getting Report"))
      .then(FN.edit.report)
      .then(value => value === false || !ರ‿ರ.file ? false :
        FN.action.load(ರ‿ರ.file).then(ಠ_ಠ.Main.busy("Refreshing Report"))),

    export: {

      analysis: type => Promise.resolve(ರ‿ರ.analysis.table().values(true))
        .then(values => ರ‿ರ.analysis.table().expand(values))
        .then(values => _.tap(values, values => ಠ_ಠ.Flags.log(`EXPORTING to ${type}`, values)))
        .then(values => type == "sheets" ?
          ಠ_ಠ.Google.sheets.create(ರ‿ರ.analysis.title(), "Analysis").then(sheet => {
            const length = values.length,
              width = ರ‿ರ.analysis.table().width(values);
            var notation = ಠ_ಠ.Google_Sheets_Notation(),
              grid = ಠ_ಠ.Google_Sheets_Grid({
                sheet: sheet.sheets[0].properties.sheetId
              }),
              format = ಠ_ಠ.Google_Sheets_Format({
                sheet: sheet.sheets[0].properties.sheetId
              }, ಠ_ಠ),
              properties = ಠ_ಠ.Google_Sheets_Properties({
                sheet: sheet.sheets[0].properties.sheetId
              });

            return ಠ_ಠ.Google.sheets.update(sheet.spreadsheetId,
                notation.grid(0, length, 0, width, true), values)
              .then(sheet => ಠ_ಠ.Google.sheets.batch(
                sheet.spreadsheetId, [
                  format.cells(grid.rows(0, 1).range(), [
                    format.background("BLACK"),
                    format.align.horizontal("CENTER"),
                    format.text("white", 12, true)
                  ]),
                  format.cells(grid.columns(0, width).range(), [
                    format.wrap("WRAP"),
                    format.align.vertical("MIDDLE")
                  ]),
                  properties.update([
                    properties.grid.frozen.rows(1),
                  ]),
                  {
                    "updateDimensionProperties": grid.columns(0, width)
                      .dimension(140)
                  }
                ]))
              .catch(e => ಠ_ಠ.Flags.error("Exporting", e).negative())
              .then(ಱ.notify.actions.save("NOTIFY_SAVE_ANALYSIS_SUCCESS"));
          }) :
          (type == "md" ?
            ರ‿ರ.analysis.table().markdown(values) :
            type == "csv" ?
              ರ‿ರ.analysis.table().csv(values) :
              ರ‿ರ.analysis.table().excel(values, "Analysis"))
          .then(data => ಠ_ಠ.Saver({}, ಠ_ಠ).save(data, `${ರ‿ರ.analysis.title()}.${type}`,
            type == "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
            type == "md" ? "text/markdown" :
            type == "csv" ? "text/csv" : "application/octet-stream")))
        .catch(e => ಠ_ಠ.Flags.error("Exporting", e).negative())
        .then(ಠ_ಠ.Main.busy("Exporting")),

      report: () => {
        var _exporting = FN.action.dehydrate();
        try {
          saveAs(new Blob([JSON.stringify(_exporting.data, REGEX_REPLACER, 2)], {
            type: TYPE_REPORT
          }), _exporting.name);
        } catch (e) {
          ಠ_ಠ.Flags.error("Report Export", e);
        }
      },

    },

    save: {

      analysis: () => Promise.resolve(JSON.stringify(_.extend(ರ‿ರ.definition, {
          expected: ರ‿ರ.analysis.expected(),
        }), SAVING_REPLACER))
        .then(value => ಠ_ಠ.Google.files.upload(ರ‿ರ.file ? null : {
            name: `${FN.helper.title(ರ‿ರ.analysis.names(), TYPE_ANALYSIS)} | ${ಠ_ಠ.Dates.now().format("YYYY-MM-DD")}${EXTENSION}`
          }, value, TYPE_ANALYSIS, null, ರ‿ರ.file ? ರ‿ರ.file.id : null, true)
          .then(FN.action.recent)
          .then(ಠ_ಠ.Main.busy("Saving"))
          .then(uploaded => ರ‿ರ.file = uploaded)
          .then(ಱ.notify.actions.save("NOTIFY_SAVE_ANALYSIS_SUCCESS"))),

      form: value => FN.action.screenshot($("form[role='form'][data-name]")[0])
        .then(result => ಠ_ಠ.Google.files.upload(result ? {
              contentHints: result
            } : null,
            value, TYPE_FORM, null, ರ‿ರ.file ? ರ‿ರ.file.id : null, true)
          .then(ಠ_ಠ.Main.busy("Updating"))
          .then(uploaded => {
            ಱ.forms = ಠ_ಠ.Forms(LOADED);
            return (ರ‿ರ.file = uploaded);
          })
          .then(ಱ.notify.actions.save("NOTIFY_SAVE_FORM_SUCCESS"))),

      report: (force, dehydrated) => FN.action.get(dehydrated, true)
        .then(saving => (!ರ‿ರ.signatures || !FN.helper.dirty(saving.data.report) ?
            Promise.resolve(true) : ಠ_ಠ.Display.confirm({
              id: "confirm_Save",
              target: ಠ_ಠ.container,
              message: ಠ_ಠ.Display.doc.get("SIGNED_REPORT_SAVE_WARNING"),
              action: "Save",
              close: "Cancel"
            }))
          .then(result => {
            return result !== true ? false :
              FN.action.screenshot($("form[role='form'][data-name]")[0])
              .then(result => {
                return (force ? ಠ_ಠ.Display.text({
                  id: "file_name",
                  title: "File Name",
                  message: ಠ_ಠ.Display.doc.get("CLONE_NAME"),
                  state: {
                    value: saving.name.replace(EXTENSION_REGEX, "")
                  },
                  simple: true
                }) : Promise.resolve(saving.name)).then(name => {
                  var _meta = {
                      name: !name.endsWith(EXTENSION) ? `${name}${EXTENSION}` : name,
                      parents: (ರ‿ರ.folder ? ರ‿ರ.folder.id : null),
                      appProperties: FN.helper.values(saving.data.form, saving.data.report,
                        meta => meta[INDEX],
                        (value, field, meta, memo) => {
                          var _val = meta[TRANSFORM] ?
                            ಠ_ಠ.Display.template.compile(`REFLECT.FIELD.${memo.FORM}.${field}`,
                              meta[TRANSFORM])(value) :
                            meta[PATH] ?
                            value[meta[PATH]] :
                            meta[EXTRACT] ?
                            (_.isRegExp(meta[EXTRACT]) ?
                              meta[EXTRACT] : new RegExp(meta[EXTRACT], "i")).exec(value) : value;

                          memo[`FIELD.${field}`] = JSON.stringify(_.isArray(_val) && _val.length == 1 ?
                            _val[0] : _val);
                        }, {
                          FORM: saving.data.form.$name ? saving.data.form.$name : saving.data.form.name
                        }),
                    },
                    _data = JSON.stringify(saving.data, SAVING_REPLACER),
                    _mime = TYPE_REPORT;
                  if (result) _meta.contentHints = result;

                  return ಠ_ಠ.Google.files.upload.apply(this, [_meta, _data, _mime].concat(!ರ‿ರ.file || force ? [] : [null, ರ‿ರ.file.id, true])).then(uploaded => {
                    if (uploaded)
                      ರ‿ರ.hash = new Hashes.MD5()
                      .hex(ಱ.strings.stringify(saving.data.report, SIGNING_REPLACER));
                    return uploaded;
                  });
                });
              })
              .then(FN.action.recent)
              .then(uploaded => ಠ_ಠ.Flags.log("Saved:", uploaded).reflect(uploaded))
              .catch(e => ಠ_ಠ.Flags.error("Save Error", e).negative())
              .then(ಠ_ಠ.Main.busy("Saving Report"))
              .then(ಱ.notify.actions.save("NOTIFY_SAVE_REPORT_SUCCESS"));
          }).catch(() => ಠ_ಠ.Flags.log("Save Cancelled").negative())),

    },

    convey: (id, title, instructions_doc, type, message, action) => FN.action.get()
      .then(dehydrated => FN.helper.emails({
        id: id,
        title: title,
        instructions: ಠ_ಠ.Display.doc.get(instructions_doc),
        emails: FN.helper.addresses(type, dehydrated),
        action: action
      }).then(values => values ? Promise.resolve(values).then(values => ({
          dehydrated: dehydrated,
          files: FN.helper.files(dehydrated.data.report),
          emails: values.Email && values.Email.Values ?
            _.isArray(values.Email.Values) ? values.Email.Values : [values.Email.Values] : [],
          message: values.Message ? values.Message.Value : true
        }))
        .then(value => !value.files || value.files.length === 0 ?
          Promise.resolve(value) :
          Promise.all(_.map(value.files,
            file => ಠ_ಠ.Google.permissions.get(file.id)
            .then(permissions => Promise.all(_.map(value.emails, email => {
              _.find(permissions, permission =>
                  permission.type == "anyone" ||
                  (permission.type == "domain" &&
                    email.split("@")[1].localeCompare(permission.domain,
                      undefined, {
                        sensitivity: "accent"
                      }) === 0) ||
                  email.localeCompare(permission.emailAddress,
                    undefined, {
                      sensitivity: "accent"
                    }) === 0) ?
                Promise.resolve(true) :
                ಠ_ಠ.Google.permissions.share(file.id).user(email, "reader")
                .catch(ಱ.notify.failure("Share FAILED", () => ಠ_ಠ.Display.doc.get({
                  name: "NOTIFY_SHARE_FILE_FAILED",
                  content: email
                })));
            }))))).then(() => value))
        .then(value => _.tap(value, value => ಠ_ಠ.Flags.log("TO CONVEY:", value)))
        .then(ಠ_ಠ.Main.busy(message)) : false)),

    send: () => FN.action.convey("send_Report", "Send Report for Approval / Signature",
        "SEND_INSTRUCTIONS", SIGNATORY, "Sending Report", "Send")
      .then(value => value ? Promise.all(_.map(value.emails,
        email => ಠ_ಠ.Google.permissions.share(ರ‿ರ.file)
        .user(email, "commenter")
        .catch(ಱ.notify.failure("Share FAILED", () => ಠ_ಠ.Display.doc.get({
          name: "NOTIFY_SHARE_REPORT_FAILED",
          content: email
        })))
        .then(result => {
          var _subject = "Reflect Report - For Review",
            _url = `${ಠ_ಠ.Flags.full()}${ಠ_ಠ.Flags.dir()}/#google,load.${ರ‿ರ.file.id}`,
            _email = ಠ_ಠ.Display.template.get({
              name: "email_standard",
              subject: _subject,
              openings: [ಠ_ಠ.Display.doc.get("EMAIL_REPORT_SEND")],
              endings: value.message && _.isString(value.message) ? [{
                colour: "#dce8df",
                details: unescape(encodeURIComponent(value.message))
              }] : "",
              action: {
                display: "View Report",
                target: _url,
                description: ಠ_ಠ.Display.doc.get({
                  name: "EMAIL_ACTION_OPEN_REPORT",
                  content: "",
                  plain: true
                }).trim()
              },
            }),
            _plain = ಠ_ಠ.Display.doc.get({
              name: "EMAIL_STANDARD",
              content: $([ಠ_ಠ.Display.doc.get("EMAIL_REPORT_SEND")]
                .concat(value.message && _.isString(value.message) ? [encodeURIComponent(value.message)] : [])
                .concat(ಠ_ಠ.Display.doc.get({
                  name: "EMAIL_ACTION_OPEN_REPORT",
                  content: _url
                }))
                .join("\n")).text(),
              plain: true
            });
          if (result)
            return ಠ_ಠ.Google.mail.send(email, _subject, _email, _plain,
                `${ಠ_ಠ.me.display_name()} | via Reflect <${ಠ_ಠ.me.email}>`)
              .then(result => result ? _.tap(result, result => result.to = email) : result);
        }))).then(emails => {
        if (emails && _.filter(emails, email => email).length > 0 && value)
          ಱ.notify.success("Successful Send",
            ಠ_ಠ.Display.doc.get({
              name: "NOTIFY_SEND_SUCCESS",
              delay: 20000,
              content: _.map(emails, email => email ? ಠ_ಠ.Display.doc.get({
                name: "NOTIFY_SENT_EMAIL",
                content: `<a href="https://mail.google.com/mail/u/0/#${email.labelIds[0].toLowerCase()}/${email.id}" target="_blank">${email.to || "Email"}</a>`
              }) : email).join()
            }));
        return value;
      }) : value),

    share: () => FN.action.convey("share_Report", "Share Report for Approval / Signature",
        "SHARE_INSTRUCTIONS", SIGNATORY, "Sharing Report", "Share")
      .then(value => value ? Promise.all(_.map(value.emails,
        email => ಠ_ಠ.Google.permissions.share(ರ‿ರ.file, null, value.message)
        .user(email, "commenter")
        .catch(ಱ.notify.failure("Share FAILED", () => ಠ_ಠ.Display.doc.get({
          name: "NOTIFY_SHARE_REPORT_FAILED",
          content: email
        }))))) : value),

    validate: () => {
      var _form = ರ‿ರ.form.find("form.needs-validation"),
        _result = (ರ‿ರ.form.find("form.needs-validation")[0].checkValidity() !== false);
      _result = _.reduce(_form.find("[data-validate='true']"),
                  (result, el) => {
                    var _result = ಱ.fields.validate(el),
                        _el = $(el);
                    _el.siblings(`.${_result === false ? "invalid" : "valid"}-feedback`).addClass("d-flex");
                    _el.siblings(`.${_result === false ? "valid" : "invalid"}-feedback`).removeClass("d-flex");
                    return result === false ? result : _result;
                  }, _result);
      _form.toggleClass("was-validated", !_result);
      return _result;
    },

    complete: () => FN.action.validate() ?
      FN.action.convey("complete_Report", "Complete Report",
        "COMPLETE_INSTRUCTIONS", DESTINATION, "Submitting Report", "Submit")
      .then(value => value ?
        Promise.all(_.map(value.emails, email => ಠ_ಠ.Google.permissions.share(ರ‿ರ.file, null, value.message).user(email, "reader"))).then(value => value ? Promise.all(_.map(value.emails, email => ಠ_ಠ.Google.permissions.share(ರ‿ರ.file, null, value.message).user(email, "reader"))) : value)
        .then(() => ಠ_ಠ.Google.files.update(ರ‿ರ.file.id, {
          appProperties: {
            COMPLETE: true
          }
        }, null, true))
        .then(ಠ_ಠ.Main.busy("Completing"))
        .then(uploaded => uploaded ? FN.action.load(uploaded) : false) : false) : false,

  };
  /* <!-- Action Functions --> */


  /* <!-- Internal Functions --> */


  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;
      
      /* <!-- Set Up / Create the Function Modules --> */

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Reflect",
        state: ರ‿ರ,
        states: STATES,
        start: () => {
          if (!ಱ.forms || !ಱ.forms.loaded()) $(BUTTON).addClass(LOADER);
        },
        instructions: [{
            match: /SAVE/i,
            show: "SAVE_INSTRUCTIONS",
            title: "Saving your Report ..."
          },
          {
            match: /SIGN/i,
            show: "SIGN_INSTRUCTIONS",
            title: "Signing this Report ..."
          },
          {
            match: /SEND/i,
            show: ["SEND_INSTRUCTIONS", "SHARE_INSTRUCTIONS"],
            title: "Sending & Sharing your Report ..."
          },
          {
            match: /COMPLETE/i,
            show: "COMPLETE_INSTRUCTIONS",
            title: "How to Complete & Submit ..."
          },
          {
            match: /EXPORT/i,
            show: "EXPORT_INSTRUCTIONS",
            title: "How to Export Reports and Analysis ..."
          }
        ],
        routes: {

          open: {
            options: command => ({
              title: "Select a Reflect File to Open",
              view: "DOCS",
              mime: /FORM/i.test(command) ? TYPE_FORM : /REPORT/i.test(command) ? TYPE_REPORT : /REVIEW/i.test(command) ? TYPE_REVIEW : /TRACKER/i.test(command) ? TYPE_TRACKER : TYPES.join(","),
              mine: null,
              parent: null,
              include_folders: false,
              team: false,
            }),
            success: value => FN.action.load(value.result)
              .then(() => FN.action.recent(value.result, true))
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e).negative())
              .then(ಠ_ಠ.Main.busy("Opening Report")),
          },

          import: {
            clean: true,
            success: value => ಠ_ಠ.Google.reader().promiseAsText(value.result)
              .then(content => JSON.parse(content))
              .then(value => value.form && value.report ?
                FN.process.report(value, {
                  editable: true
                }) :
                FN.process.form(value, {
                  editable: true
                }))
              .then(ಠ_ಠ.Main.busy("Importing Report")),
          },

          load: {
            success: value => FN.action.load(value.result)
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e).negative())
              .then(ಠ_ಠ.Main.busy("Loading")),
          },

          analyse: {
            matches: /ANALYSE/i,
            routes: {
              save: {
                matches: /SAVE/i,
                state: STATE_ANALYSIS,
                length: 0,
                fn: FN.action.save.analysis
              },
              add: {
                matches: /ADD/i,
                state: STATE_ANALYSIS_SUMMARY,
                length: 0,
                fn: () => ಠ_ಠ.Display.text({
                  id: "add_expected",
                  title: "Add / Edit Expected ...",
                  message: ಠ_ಠ.Display.doc.get("ANALYSE_EXPECTED"),
                  validate: value => value,
                  state: {
                    value: ರ‿ರ.analysis.expected().join("\n")
                  },
                  action: "Analyse",
                  rows: 8
                }).then(value => {
                  if (value) ರ‿ರ.analysis.expected(value);
                })
              },
              summary: {
                matches: /SUMMARY/i,
                state: STATE_ANALYSIS_DETAIL,
                length: 0,
                fn: () => ರ‿ರ.analysis.summary()
                  .then(() => ಠ_ಠ.Display.state()
                    .change(STATE_ANALYSIS_DETAIL, STATE_ANALYSIS_SUMMARY))
              },
              detail: {
                matches: /DETAIL/i,
                state: STATE_ANALYSIS_SUMMARY,
                length: 0,
                fn: () => ರ‿ರ.analysis.detail()
                  .then(() => ಠ_ಠ.Display.state()
                    .change(STATE_ANALYSIS_SUMMARY, STATE_ANALYSIS_DETAIL))
              },
              stage: {
                matches: /STAGE/i,
                state: STATE_ANALYSIS,
                routes: {
                  any: {
                    matches: /ANY/i,
                    state: STATE_ANALYSIS_COMPLETE,
                    length: 0,
                    fn: () => ರ‿ರ.analysis.any()
                      .then(() => ಠ_ಠ.Display.state()
                        .change(STATE_ANALYSIS_COMPLETE, STATE_ANALYSIS_ANY)),
                  },
                  complete: {
                    matches: /COMPLETE/i,
                    state: STATE_ANALYSIS_ANY,
                    length: 0,
                    fn: () => ರ‿ರ.analysis.complete()
                      .then(() => ಠ_ಠ.Display.state()
                        .change(STATE_ANALYSIS_ANY, STATE_ANALYSIS_COMPLETE)),
                  },
                }
              },
              reports: {
                matches: /REPORTS/i,
                state: STATE_ANALYSIS,
                routes: {
                  all: {
                    matches: /ALL/i,
                    length: 0,
                    fn: () => (ರ‿ರ.analysis ? ರ‿ರ.analysis.all() : FN.prompt.analysis())
                      .then(() => ಠ_ಠ.Display.state()
                        .change([STATE_ANALYSIS_MINE, STATE_ANALYSIS_SHARED], STATE_ANALYSIS_ALL)),
                  },
                  mine: {
                    matches: /MINE/i,
                    length: 0,
                    fn: () => (ರ‿ರ.analysis ? ರ‿ರ.analysis.mine() : FN.prompt.analysis(true))
                      .then(() => ಠ_ಠ.Display.state()
                        .change([STATE_ANALYSIS_ALL, STATE_ANALYSIS_SHARED], STATE_ANALYSIS_MINE)),
                  },
                  shared: {
                    matches: /SHARED/i,
                    length: 0,
                    fn: () => (ರ‿ರ.analysis ? ರ‿ರ.analysis.shared() : FN.prompt.analysis(false))
                      .then(() => ಠ_ಠ.Display.state()
                        .change([STATE_ANALYSIS_ALL, STATE_ANALYSIS_MINE], STATE_ANALYSIS_SHARED)),
                  },
                }
              },
              export: {
                matches: /EXPORT/i,
                state: STATE_ANALYSIS,
                routes: {
                  csv: {
                    matches: /CSV/i,
                    length: 0,
                    fn: () => FN.action.export.analysis("csv"),
                  },
                  excel: {
                    matches: /EXCEL/i,
                    length: 0,
                    fn: () => FN.action.export.analysis("xlsx"),
                  },
                  markdown: {
                    matches: /MARKDOWN/i,
                    length: 0,
                    fn: () => FN.action.export.analysis("md"),
                  },
                  sheets: {
                    matches: /SHEETS/i,
                    length: 0,
                    fn: () => FN.action.export.analysis("sheets"),
                  },
                }
              },
              form: {
                length: 1,
                matches: /FORM/i,
                fn: command => {
                  var _form = ಱ.forms.get(command);
                  return _form ? FN.process.analysis([{
                      id: _form.id,
                      name: `${_form.name}${_form.title ? ` [${_form.title}]` : ""}`
                    }])
                    .then(() => ಠ_ಠ.Display.state()
                      .enter([STATE_ANALYSIS_SUMMARY, STATE_ANALYSIS_ALL, STATE_ANALYSIS_ANY]))
                    .catch(e => ಠ_ಠ.Flags.error(`Analysing Form: ${_form.id}`, e).negative())
                    .then(ಠ_ಠ.Main.busy("Finding Reports")) : false;
                },
              },
              verify: {
                length: 0,
                state: STATE_ANALYSIS,
                matches: /VERIFY/i,
                fn: () => ಠ_ಠ.Display.state().toggle(STATE_ANALYSIS_VERIFY) ? ರ‿ರ.analysis.verify() : false,
              },
              default: {
                length: 0,
                fn: () => FN.prompt.analysis()
                  .then(result => ಠ_ಠ.Display.state()
                    .enter(result ? [STATE_ANALYSIS_SUMMARY, STATE_ANALYSIS_ALL, STATE_ANALYSIS_ANY] :
                      null))
              }
            },
          },

          sign: {
            matches: /SIGN/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                routes: {
                  remove: {
                    matches: /REMOVE/i,
                    length: 0,
                    fn: () => ಱ.signatures.remove(ರ‿ರ.file)
                      .then(result => result ? FN.process.signatures() : false)
                  },
                  sign: {
                    length: 0,
                    fn: () => ಱ.signatures.sign.report(ರ‿ರ.file, FN.action.dehydrate().data)
                      .then(() => FN.process.signatures())
                  },
                }

              }
            }
          },

          scales: {
            matches: /SCALES/i,
            fn: () => EMAIL ? false : false
          },

          revoke: {
            matches: /REVOKE/i,
            state: STATE_REPORT_COMPLETE,
            fn: () => FN.action.revoke()
          },

          edit: {
            matches: /EDIT/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                length: 0,
                fn: () => FN.action.edit(),
              }
            }
          },

          save: {
            matches: /SAVE/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                routes: {
                  clone: {
                    matches: /CLONE/i,
                    fn: () => FN.action.save.report(true)
                      .then(result => result ? FN.process.signatures() : false)
                  },
                  export: {
                    matches: /EXPORT/i,
                    fn: () => FN.action.export.report()
                  },
                  save: {
                    state: STATE_REPORT_EDITABLE,
                    length: 0,
                    keys: ["shift+s", "shift+S"],
                    requires: "html2canvas",
                    fn: () => FN.action.save.report()
                      .then(result => result ? FN.process.signatures() : false)
                  },
                }
              },
              form: {
                matches: /FORM/i,
                state: STATE_FORM_OPENED,
                keys: ["alt+s", "alt+S"],
                requires: "html2canvas",
                fn: () => FN.action.save.form(ರ‿ರ.preview)
              }
            }
          },

          send: {
            matches: /SEND/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                length: 0,
                fn: () => FN.action.send(),
              }
            }
          },

          share: {
            matches: /SHARE/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                length: 0,
                fn: () => FN.action.share(),
              }
            }
          },

          validate: {
            matches: /VALIDATE/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                keys: ["v", "V"],
                length: 0,
                fn: () => FN.action.validate(),
              }
            }
          },
          
          complete: {
            matches: /COMPLETE/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                length: 0,
                fn: () => FN.action.complete(),
              }
            }
          },

          create: {
            matches: /CREATE/i,
            length: 0,
            fn: () => FN.prompt.create(
                [FN.prompt.scales(), FN.prompt.forms(), FN.prompt.reports(), FN.prompt.trackers()])
              .then(form => form ? ರ‿ರ.form = form : false),
            routes: {
              form: {
                matches: /FORM/i,
                routes: {
                  drive: () => FN.prompt.create([FN.prompt.forms()])
                    .then(form => ರ‿ರ.form = form),
                  folder: {
                    length: 1,
                    fn: command => FN.create.parent(command)
                      .then(folder => FN.prompt.create([FN.prompt.forms()], folder))
                      .then(form => ರ‿ರ.form = form)
                  },
                }
              },
              report: {
                matches: /REPORT/i,
                routes: {
                  prompt: () => FN.prompt.create([FN.prompt.reports()])
                    .then(form => form ? ರ‿ರ.form = form : false),
                  named: {
                    length: 1,
                    fn: command => ಱ.forms.persistent().loaded
                      .then(forms => (forms.has(command) ?
                          Promise.resolve(FN.create.existing(command)) :
                          FN.prompt.create([FN.prompt.reports()]))
                        .then(form => form ? ರ‿ರ.form = form : false))
                      .then(ಠ_ಠ.Main.busy("Loading Form"))
                  },
                  folder: {
                    length: 2,
                    fn: command => FN.create.parent(command[0])
                      .then(folder => ಱ.forms.has(command[1]) ?
                        Promise.resolve(FN.create.existing(command[1])) :
                        FN.prompt.create([FN.prompt.reports()], folder))
                      .then(form => form ? ರ‿ರ.form = form : false)
                  },
                },
              },
              tracker: {
                matches: /TRACKER/i,
                routes: {
                  prompt: () => FN.prompt.create([FN.prompt.trackers()])
                    .then(tracker => ರ‿ರ.tracker = tracker),
                  folder: {
                    length: 1,
                    fn: command => FN.create.parent(command)
                      .then(folder => FN.prompt.create([FN.prompt.trackers()], folder))
                      .then(tracker => ರ‿ರ.tracker = tracker)
                  },
                },
              },
              scale: {
                matches: /SCALE/i,
                routes: {
                  drive: () => FN.prompt.create([FN.prompt.scales()])
                    .then(scale => ರ‿ರ.scale = scale),
                  folder: {
                    length: 1,
                    fn: command => FN.create.parent(command)
                      .then(folder => FN.prompt.create([FN.prompt.scales()], folder))
                      .then(scale => ರ‿ರ.scale = scale)
                  },
                }
              },
              folder: {
                length: 1,
                fn: command => FN.create.parent(command)
                  .then(folder =>
                    FN.prompt.create([FN.prompt.scales(), FN.prompt.forms(), FN.prompt.reports()], folder))
                  .then(form => form ? ರ‿ರ.form = form : false)
              },
            },
          },

        },
        route: () => false,
        /* <!-- PARAMETERS: handled, command --> */
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: () => {
      if (window.underscoreDeepExtend && window._) _.mixin({
        "deepExtend": underscoreDeepExtend(_)
      });
      ಱ.strings = ಠ_ಠ.Strings();
      ಱ.notify = ಠ_ಠ.Notify({
        id : "reflect_Notify",
        autohide : true,
      }, ಠ_ಠ);
    },

    ready: () => {
      ಱ.forms = ಱ.forms || ಠ_ಠ.Forms(LOADED);
      ಱ.signatures = ಱ.signatures ||
        ಠ_ಠ.Signatures(ಠ_ಠ, ಱ.strings.stringify, SIGNING_REPLACER, ಠ_ಠ.Main.elevator(SCOPE_FULL_DRIVE));
      ಱ.fields = ಠ_ಠ.Fields({forms : ಱ.forms}, ಠ_ಠ);
    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,

    persistent: ಱ,

    email: EMAIL,

  };

};