App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) {
    return new this.App().initialise(this);
  }

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _forms, _template, _form, _tracker, _folder, _file;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Constants --> */
  /* <!-- const EMAIL = /\w+@[\w.-]+|\{(?:\w+, *)+\w+\}@[\w.-]+/gi; --> */

  const TYPE_SCALE = "application/x.educ-io.reflect-scale",
    TYPE_FORM = "application/x.educ-io.reflect-form",
    TYPE_REPORT = "application/x.educ-io.reflect-report",
    TYPE_REVIEW = "application/x.educ-io.reflect-review",
    TYPE_TRACKER = "application/x.educ-io.reflect-tracker",
    _types = [TYPE_SCALE, TYPE_FORM, TYPE_REPORT, TYPE_REVIEW, TYPE_TRACKER],
    STATE_FORM_OPENED = "opened-form",
    STATE_REPORT_OPENED = "opened-report",
    STATE_TRACKER_OPENED = "opened-tracker",
    STATES = [STATE_FORM_OPENED, STATE_REPORT_OPENED, STATE_TRACKER_OPENED];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Handlers --> */
  var _evidence = {

    default: e => {
      e.preventDefault();
      return $(e.currentTarget).parents(".evidence-holder");
    },

    add: (o, list, check) => {

      if (check !== false) {
        var checks = list.find("input[type='checkbox']");
        if (checks && checks.length == 1 && !checks.prop("checked")) checks.prop("checked", true);
      }

      if (!o.template) o.template = "list_item";
      if (!o.delete) o.delete = "Remove";

      /* <!-- Add new Item to List --> */
      $(ಠ_ಠ.Display.template.get(o)).appendTo(list.find(".list-data")).find("a.delete").click(
        function(e) {
          e.preventDefault();
          var _this = $(e.currentTarget).parent();
          if (_this.siblings(".list-item").length === 0) {
            _this.closest(".input-group").children("input[type='checkbox']").prop("checked", false);
          }
          _this.remove();
        }
      );
    },

    picker: e => {
      var _pickEvidence = list => {
          ಠ_ಠ.Router.pick.multiple({
              title: "Select a File / Folder to Use",
              view: "DOCS"
            })
            .then(files => _.each(files, (file, i) => _evidence.add({
              id: file[google.picker.Document.ID],
              url: file[google.picker.Document.URL],
              details: file[google.picker.Document.NAME],
              type: list.find("button[data-default]").data("default"),
              icon_url: file[google.picker.Document.ICON_URL]
            }, list, i === 0)))
            .catch(e => e ? ಠ_ಠ.Flags.error("Picking Google Drive File", e) : false);
        },
        _list = _evidence.default(e);
      _pickEvidence(_list);
    },

    file: e => {
      var _list = _evidence.default(e);
      ಠ_ಠ.Display.files({
        id: "reflect_prompt_file",
        title: "Please upload file/s ...",
        message: ಠ_ಠ.Display.doc.get({
          name: "FILE",
          content: "evidence",
        }),
        action: "Upload"
      }).then(files => {
        var _total = files.length,
          _current = 0;
        var finish = ಠ_ಠ.Display.busy({
          target: _list.closest("li"),
          class: "loader-small w-100",
          fn: true
        });
        var _complete = function() {
          if (++_current == _total) finish();
        };
        _.each(files, source => {
          ಠ_ಠ.Google.files.upload({
              name: source.name
            }, source, source.type)
            .then(uploaded => ಠ_ಠ.Google.files.get(uploaded.id).then(file => {
              _evidence.add({
                id: file.id,
                url: file.webViewLink,
                details: file.name,
                type: _list.find("button[data-default]").data("default"),
                icon_url: file.iconLink
              }, _list, true);
              _complete();
            }))
            .catch(e => {
              ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error");
              _complete();
            });
        });

      }).catch(e => e ? ಠ_ಠ.Flags.error("Displaying File Upload Prompt", e) : ಠ_ಠ.Flags.log("File Upload Cancelled"));
    },

    web: e => {
      var _list = _evidence.default(e);
      ಠ_ಠ.Display.text({
        id: "reflect_prompt_url",
        title: "Please enter a URL ...",
        name: "Name",
        value: "URL",
        message: ಠ_ಠ.Display.doc.get({
          name: "URL",
          content: "evidence",
        }),
        validate: /^((?:(ftps?|https?):\/\/)?((?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9]))|(?:(?:(?:[a-zA-Z0-9._-]+){1,2}[\w]{2,4})))(?::(\d+))?((?:\/[\w]+)*)(?:\/|(\/[\w]+\.[\w]{3,4})|(\?(?:([\w]+=[\w]+)&)*([\w]+=[\w]+))?|\?(?:(wsdl|wadl))))$/i
      }).then(url => {
        var _url = url.value ? url.value : url,
          _name = url.name ? url.name : "Web Link";
        _evidence.add({
          url: _url.indexOf("://") > 0 ? _url : "http://" + _url,
          details: _name,
          type: _list.find("button[data-default]").data("default"),
          icon: "public"
        }, _list, true);
      }).catch(e => e ? ಠ_ಠ.Flags.error("Displaying URL Prompt", e) : ಠ_ಠ.Flags.log("URL Prompt Cancelled"));
    },

    paper: e => {
      var _list = _evidence.default(e);
      _evidence.add({
        details: "Offline / Paper",
        type: _list.find("button[data-default]").data("default"),
        icon: "local_printshop"
      }, _list, true);
    },

  };
  /* <!-- Internal Handlers --> */

  /* <!-- Action Functions --> */
  var _actions = {

    scales: () => ({
      name: "Scale",
      desc: "Create Scale",
      command: "scale",
      options: [{
          name: "New ..."
        },
        {
          value: "uk_teachers",
          name: "UK Teachers' Standards"
        }
      ]
    }),

    forms: () => ({
      name: "Form",
      desc: "Create Form",
      command: "form",
      options: [{
          name: "New ..."
        },
        {
          value: "report",
          name: "Reflective Report"
        }
      ]
    }),

    reports: () => ({
      name: "Report",
      desc: "Create Report",
      command: "report",
      options: _.reduce(
        _.filter(_forms.all(), item => item.type == "Report"), (list, item) => {
          list.push({
            value: item.key,
            name: item.title,
          });
          return list;
        }, []),
    }),

    trackers: () => ({
      name: "Tracker",
      desc: "Create Tracker",
      command: "tracker",
      options: [{
        value: "uk_teachers",
        name: "UK Teachers' Standards"
      }]
    }),

  };
  /* <!-- Action Functions --> */

  /* <!-- Create Functions --> */
  var _create = {

    display: (name, state, template) => {
      var _initial = template ? _forms.create(name, template) : _forms.get(name),
        _return = _initial.form;
      _template = _initial.template;
      if (_template) _template.__name = name;
      _return.target = ಠ_ಠ.container.empty();
      ಠ_ಠ.Display.state().enter(state).protect("a.jump").on("JUMP");
      return ಠ_ಠ.Fields({
          me: ಠ_ಠ.me ? ಠ_ಠ.me.full_name : undefined,
          templater: ಠ_ಠ.Display.template.get
        })
        .on(ಠ_ಠ.Display.template.show(_return));
    },

    parent: id => new Promise(resolve => ಠ_ಠ.Google.files.get(id, true).then(f => {
      ಠ_ಠ.Google.folders.is(true)(f) ? resolve(f) : ಠ_ಠ.Flags.error(`Supplied ID is not a folder: ${id}`) && resolve();
    }).catch(e => {
      ಠ_ಠ.Flags.error(`Opening Google Drive Folder: ${id}`, e) && resolve();
    })),

    prompt: (actions, folder) => ಠ_ಠ.Display.action({
      id: "create_chooser",
      title: "Create with Reflect ...",
      instructions: ಠ_ಠ.Display.doc.get({
        name: "CREATE",
        content: folder ? folder : "Google Drive"
      }),
      actions: actions,
      large: true
    }).then(result => {
      ಠ_ಠ.Flags.log("Create Action Selected:", result);
      return result.action.command == "scale" ?
        _create.scale(result.option.value) :
        result.action.command == "form" ?
        Promise.resolve(_create.display("template", STATE_FORM_OPENED)) :
        result.action.command == "report" ?
        _create.report(result.option.value) :
        result.action.command == "tracker" ?
        _create.tracker(result.option.value) : null;
    }).catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) : ಠ_ಠ.Flags.log("Create Prompt Cancelled")),

    template: (name, loaded, state) => {

      /* <!-- Display Relevant Form --> */
      var template = _create.display(name.toLowerCase(), state, loaded);

      /* <!-- Handle Evidence Selection Buttons --> */
      template.find("button.g-picker, a.g-picker").off("click.picker").on("click.picker", _evidence.picker);
      template.find("button.g-file, a.g-file").off("click.file").on("click.file", _evidence.file);
      template.find("button.web, a.web").off("click.web").on("click.web", _evidence.web);
      template.find("button.paper, a.paper").off("click.paper").on("click.paper", _evidence.paper);

      /* <!-- Handle Populate Textual Fields from Google Doc --> */
      template.find("button[data-action='load-g-doc'], a[data-action='load-g-doc']").off("click.doc").on("click.doc", e => {
        var finish;
        return new Promise((resolve, reject) => {
          ಠ_ಠ.Router.pick.single({
            title: "Select a Document to Load Text From",
            view: "DOCUMENTS"
          }).then(file => {
            finish = ಠ_ಠ.Display.busy({
              class: "loader-medium w-100 h-100",
              fn: true
            });
            file ? ಠ_ಠ.Flags.log("Google Drive Document Picked", file) && (file.mimeType == "text/plain" ? ಠ_ಠ.Google.files.download(file.id) : ಠ_ಠ.Google.files.export(file.id, "text/plain"))
              .then(download => ಠ_ಠ.Google.reader().promiseAsText(download).then(text => resolve(text))).catch(e => ಠ_ಠ.Flags.error(`Failed to download file: ${file.id}`, e) && reject(e)) : reject();
          });
        }).then(text => {
          var _$ = $("#" + $(e.target).data("targets")).val(text);
          if (_$.is("textarea.resizable")) autosize.update(_$[0]);
          finish ? finish() : true;
        }).catch(() => finish ? finish() : false);
      });

      return template;

    },

    report: (name, loaded) => _create.template(name, loaded, STATE_REPORT_OPENED),

    tracker: (name, loaded) => _create.template(name, loaded, STATE_TRACKER_OPENED),

    load: form => _create.report(form.__name, form)

  };
  /* <!-- Create Functions --> */

  /* <!-- Internal Functions --> */
  var _prepare = () => {

    var _title = _template && _template.title ? _template.title : _template && _template.name ? _template.name : "Report",
      _date = new Date().toLocaleDateString();

    return {
      name: `${_title} [${_date}].reflect`,
      data: {
        form: _template,
        report: ಠ_ಠ.Data({}, ಠ_ಠ).dehydrate(_form)
      }
    };

  };

  var _process = loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded).then(report => {
    ಠ_ಠ.Flags.log(`Loaded Report File: ${report}`);
    report = JSON.parse(report);
    _form = ಠ_ಠ.Data({}, ಠ_ಠ).rehydrate(_create.load(report.form), report.report);
  });

  /* <!-- TODO: Need to check type / format in process if route is from IMPORT - maybe need a further facading function? Maybe inference by properties? --> */

  var _load = file => {
    if (ಠ_ಠ.Google.files.is(TYPE_REPORT)(file)) {
      _file = file;
      return ಠ_ಠ.Google.files.download(file.id).then(_process);
    } else {
      ಠ_ಠ.Flags.error(`Supplied ID is not a recognised Reflect File Type: ${file.id}`);
      return Promise.reject();
    }
  };

  var _save = force => {

    var finish = ಠ_ಠ.Display.busy({
      target: $("body"),
      fn: true
    });

    var _toSave = _prepare(),
      saver = (thumbType, thumb) => {
        var _meta = {
            name: _toSave.name,
            parents: (_folder ? _folder.id : null),
            properties: {
              reflectForm: _toSave.data.form
            },
            contentHints: {
              thumbnail: {
                image: thumb,
                mimeType: thumbType
              }
            }
          },
          _data = JSON.stringify(_toSave.data),
          _mime = TYPE_REPORT;
        ((!_file || force) ?
          ಠ_ಠ.Google.files.upload(_meta, _data, _mime) :
          ಠ_ಠ.Google.files.upload(_meta, _data, _mime, null, _file.id))
        .then(uploaded => {
            _file = uploaded;
            return ಠ_ಠ.Recent.add(uploaded.id, uploaded.name.replace(/.REFLECT$/i, ""), "#google,load." + uploaded.id).then(() => ಠ_ಠ.Flags.log("Saved:", uploaded));
          })
          .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))
          .then(finish);
      };

    (html2canvas ?
      html2canvas($("form[role='form'][data-name]")[0], {
        logging: window.scrollTo(0, 0)
      }) :
      Promise.reject(new Error(`HTML2Canvas Object Evalulates to ${html2canvas}`)))
    .then(canvas => saver("image/png", canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/i, "").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")))
      .catch(e => {
        ಠ_ಠ.Flags.error("Screenshot Error", e ? e : "No Inner Error");
        saver();
      });

  };

  var _export = () => {
    var _toExport = _prepare();
    try {
      saveAs(new Blob([JSON.stringify(_toExport.data)], {
        type: "application/octet-stream"
      }), _toExport.name);
    } catch (e) {
      ಠ_ಠ.Flags.error("Report Export", e);
    }
  };
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Folders",
        states: STATES,
        test: () => !!(_form || _folder || _tracker),
        clear: () => {
          _form = null;
          _folder = null;
          _tracker = null;
        },
        instructions: [{
            match: /SAVE/i,
            show: "SAVE_INSTRUCTIONS",
            title: "How to save your Form ..."
          },
          {
            match: /SEND/i,
            show: "SEND_INSTRUCTIONS",
            title: "How to send your Form ..."
          },
          {
            match: /COMPLETE/i,
            show: "COMPLETE_INSTRUCTIONS",
            title: "How to complete your Form ..."
          }
        ],
        routes: {
          open: {
            options: {
              title: "Select a Reflect File to Open",
              view: "DOCS",
              mime: _types.join(","),
            },
            success: value => _load(value.result)
              .then(() => ಠ_ಠ.Recent.add(value.result.id, value.result.name.replace(/.REFLECT$/i, ""), "#google,load." + value.result.id))
              .catch(e => ಠ_ಠ.Flags.error(`Loading File from Google Drive: ${value.result.id}`, e))
              .then(ಠ_ಠ.Display.busy(true)),
          },
          import: {
            success: value => _process(value.result),
          },
          load: {
            success: value => _load(value.result).then(ಠ_ಠ.Display.busy(true)),
          },
          export: () => _form ? _export() : false,
          /* <!-- Create and download a new saved file  --> */
          clone: () => _form ? _save(true) : false,
          /* <!-- Force creation of a new file on save --> */
          scales: { /* <!-- We're managing existing scales --> */
            matches: /SCALES/i,
            fn: () => _form ? _save(true) : false,
            active: true,
          },
          report_save_clone: {
            matches: [/SAVE/i, /CLONE/i],
            state: STATE_REPORT_OPENED,
            fn: () => $("#_cmd_Report_Clone").click()
          },
          report_save_export: {
            matches: [/SAVE/i, /EXPORT/i],
            state: STATE_REPORT_OPENED,
            fn: () => $("#_cmd_Report_Export").click()
          },
          report_save: {
            matches: [/SAVE/i, /REPORT/i],
            state: STATE_REPORT_OPENED,
            fn: () => $("#_cmd_Report_Clone").click()
          },
          save: {
            fn: _save
          },
          create_form: {
            matches: [/CREATE/i, /FORM/i],
            length: 0,
            fn: () => _create.prompt([_actions.forms()]).then(form => _form = form)
          },
          create_form_in_folder: {
            matches: [/CREATE/i, /FORM/i],
            length: 1,
            fn: command => _create.parent(command).then(folder => _create.prompt([_actions.forms()], folder)).then(form => _form = form)
          },
          create_report: {
            matches: [/CREATE/i, /REPORT/i],
            length: 1,
            fn: command => (_forms.has(command.toLowerCase()) ?
                Promise.resolve(_create.report(command.toLowerCase())) :
                _create.prompt([_actions.reports()]))
              .then(form => _form = form)
          },
          create_report_in_folder: {
            matches: [/CREATE/i, /REPORT/i],
            length: 2,
            fn: command => _create.parent(command[0]).then(folder => _create.prompt([_actions.reports()], folder)).then(form => _form = form)
          },
          create_tracker: {
            matches: [/CREATE/i, /TRACKER/i],
            length: 1,
            fn: command => (_forms.has(command.toLowerCase()) ?
                Promise.resolve(_create.tracker(command.toLowerCase())) :
                _create.prompt([_actions.trackers()]))
              .then(tracker => _tracker = tracker)
          },
          create_tracker_in_folder: {
            matches: [/CREATE/i, /TRACKER/i],
            length: 1,
            fn: command => _create.parent(command[0]).then(folder => _create.prompt([_actions.trackers()], folder)).then(tracker => _tracker = tracker)
          },
          create_in_folder: {
            matches: /CREATE/i,
            length: 1,
            fn: command => _create.parent(command[1]).then(folder => _create.prompt([_actions.scales(), _actions.forms(), _actions.reports()], folder)).then(form => _form = form)
          },
          create: () => _create.prompt([_actions.scales(), _actions.forms(), _actions.reports()]).then(form => _form = form),
        },
        route: () => false,
        /* <!-- PARAMETERS: handled, command --> */
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: () => {
      if (!_forms) _forms = ಠ_ಠ.Forms();
      moment().format();
    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false)

  };

};