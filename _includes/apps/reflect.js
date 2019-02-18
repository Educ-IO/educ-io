App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) {
    return new this.App().initialise(this);
  }

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Constants --> */
  /* <!-- const EMAIL = /\w+@[\w.-]+|\{(?:\w+, *)+\w+\}@[\w.-]+/gi; --> */

  const TYPE_SCALE = "application/x.educ-io.reflect-scale",
    TYPE_FORM = "application/x.educ-io.reflect-form",
    TYPE_REPORT = "application/x.educ-io.reflect-report",
    TYPE_REVIEW = "application/x.educ-io.reflect-review",
    TYPE_TRACKER = "application/x.educ-io.reflect-tracker",
    TYPES = [TYPE_SCALE, TYPE_FORM, TYPE_REPORT, TYPE_REVIEW, TYPE_TRACKER],
    STATE_FORM_OPENED = "opened-form",
    STATE_REPORT_OPENED = "opened-report",
    STATE_TRACKER_OPENED = "opened-tracker",
    STATES = [STATE_FORM_OPENED, STATE_REPORT_OPENED, STATE_TRACKER_OPENED];
  /* <!-- Internal Constants --> */

  /* <!-- Action Functions --> */
  var _actions = {

    scales: () => ({
      name: "Scale",
      desc: "Create Scale",
      command: "scale",
      doc: "CREATE_SCALE",
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
      doc: "CREATE_FORM",
      options: [{
        name: "New ..."
      }].concat(ರ‿ರ.forms.selection("Report"))
    }),

    reports: () => ({
      name: "Report",
      desc: "Create Report",
      command: "report",
      doc: "CREATE_REPORT",
      options: ರ‿ರ.forms.selection("Report"),
    }),

    trackers: () => ({
      name: "Tracker",
      desc: "Create Tracker",
      command: "tracker",
      doc: "CREATE_TRACKER",
      options: [{
        value: "uk_teachers",
        name: "UK Teachers' Standards"
      }]
    }),

  };
  /* <!-- Action Functions --> */

  /* <-- Edit Functions --> */
  var _edit = {

    form: form => ಠ_ಠ.Display.text({
      id: "form_editor",
      title: "Create/Edit Form ...",
      message: ಠ_ಠ.Display.doc.get({
        name: "FORM",
      }),
      state: {
        value: JSON.stringify(form, null, 2)
      },
      action: "Save",
      rows: 10
    }),

  };
  /* <-- Edit Functions --> */

  /* <!-- Create Functions --> */
  var _create = {

    display: (name, state, template) => {
      var _initial = template ? ರ‿ರ.forms.create(name, template) : ರ‿ರ.forms.get(name),
        _return = _initial.form;
      ರ‿ರ.template = _initial.template;
      if (ರ‿ರ.template) ರ‿ರ.template.__name = name;
      _return.target = ಠ_ಠ.container.empty();
      ಠ_ಠ.Display.state().enter(state).protect("a.jump").on("JUMP");

      /* <!-- ToDo - Maybe DEFER this until after load for loaded forms --> */
      return ಠ_ಠ.Fields({
          me: ಠ_ಠ.me ? ಠ_ಠ.me.full_name : undefined,
          templater: ಠ_ಠ.Display.template.get,
          list_upload_content: "Evidence",
          list_web_content: "Evidence"
        }, ಠ_ಠ)
        .on(ಠ_ಠ.Display.template.show(_return));
    },

    parent: id => new Promise(resolve => ಠ_ಠ.Google.files.get(id, true)
      .then(f => {
        ಠ_ಠ.Google.folders.is(true)(f) ?
          resolve(f) : ಠ_ಠ.Flags.error(`Supplied ID is not a folder: ${id}`) && resolve();
      }).catch(e => {
        ಠ_ಠ.Flags.error(`Opening Google Drive Folder: ${id}`, e) && resolve();
      })),

    prompt: (actions, folder) => ಠ_ಠ.Display.action({
      id: "create_chooser",
      title: "Create with Reflect ...",
      instructions: [ಠ_ಠ.Display.doc.get({
        name: "CREATE",
        content: folder ? folder : "Google Drive"
      })].concat(_.map(actions, action => ಠ_ಠ.Display.doc.get(action.doc))).join("\n"),
      actions: actions,
      large: true
    }).then(result => {
      ಠ_ಠ.Flags.log("Create Action Selected:", result);
      return result.action.command ?
        _create[result.action.command](result.option.value) : null;
    }).catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) :
      ಠ_ಠ.Flags.log("Create Prompt Cancelled")),

    template: (name, loaded, state) => {

      /* <!-- Display Relevant Form --> */
      var template = _create.display(name.toLowerCase(), state, loaded);

      return template;

    },

    report: (name, loaded) => _create.template(name, loaded, STATE_REPORT_OPENED),

    tracker: (name, loaded) => _create.template(name, loaded, STATE_TRACKER_OPENED),

    form: name => _edit.form(ರ‿ರ.forms.get(name).template).then(result => {
        if (result) {
          var _result = JSON.parse(result);
          var _title = _result.title ?
            Promise.resolve(_result.title) :
            _result.name ?
            Promise.resolve(_result.name) :
            ಠ_ಠ.Display.text({
              id: "form_name",
              title: "File Name for Form",
              simple: true
            });
          return _title.then(title => {
            var _meta = {
                name: `${title}.reflect`
              },
              _mime = TYPE_FORM;
            return ಠ_ಠ.Google.files.upload(_meta, _result, _mime);
          });
        } else {
          return Promise.reject();
        }
      })
      .then(uploaded => uploaded)
      .then(() => ಠ_ಠ.Display.state().enter(STATE_FORM_OPENED).protect("a.jump").on("JUMP"))
      .catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) : false),

    load: form => _create.report(form.__name, form)

  };
  /* <!-- Create Functions --> */

  /* <!-- Internal Functions --> */
  var _prepare = () => {

    var _title = ರ‿ರ.template && ರ‿ರ.template.title ?
      ರ‿ರ.template.title : ರ‿ರ.template && ರ‿ರ.template.name ?
      ರ‿ರ.template.name : "Report",
      _date = new Date().toLocaleDateString();

    return {
      name: `${_title} [${_date}].reflect`,
      data: {
        form: ರ‿ರ.template,
        report: ಠ_ಠ.Data({}, ಠ_ಠ).dehydrate(ರ‿ರ.form)
      }
    };

  };

  var _process = loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded)
    .then(report => {
      ಠ_ಠ.Flags.log(`Loaded Report File: ${report}`);
      report = JSON.parse(report);
      ರ‿ರ.form = ಠ_ಠ.Data({}, ಠ_ಠ).rehydrate(_create.load(report.form), report.report);
    });

  /* <!-- TODO: Need to check type / format in process if route is from IMPORT - maybe need a further facading function? Maybe inference by properties? --> */

  var _load = file => {
    if (ಠ_ಠ.Google.files.is(TYPE_REPORT)(file)) {
      ರ‿ರ.file = file;
      return ಠ_ಠ.Google.files.download(file.id).then(_process);
    } else if (ಠ_ಠ.Google.files.is(TYPE_FORM)(file)) {
      /* <!-- TODO: Process Loading Form here! --> */
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
            parents: (ರ‿ರ.folder ? ರ‿ರ.folder.id : null),
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
        ((!ರ‿ರ.file || force) ?
          ಠ_ಠ.Google.files.upload(_meta, _data, _mime) :
          ಠ_ಠ.Google.files.upload(_meta, _data, _mime, null, ರ‿ರ.file.id))
        .then(uploaded => {
            ರ‿ರ.file = uploaded;
            return ಠ_ಠ.Recent.add(uploaded.id, uploaded.name.replace(/.REFLECT$/i, ""), "#google,load." + uploaded.id).then(() => ಠ_ಠ.Flags.log("Saved:", uploaded));
          })
          .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))
          .then(finish);
      };

    (window.html2canvas ?
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
        state: ರ‿ರ,
        states: STATES,
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
              mime: TYPES.join(","),
            },
            success: value => _load(value.result)
              .then(() => ಠ_ಠ.Recent.add(value.result.id,
                value.result.name.replace(/.REFLECT$/i, ""),
                `#google,load.${value.result.id}`))
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e))
              .then(ಠ_ಠ.Display.busy(true)),
          },

          import: {
            success: value => _process(value.result),
          },

          load: {
            success: value => _load(value.result).then(ಠ_ಠ.Display.busy(true)),
          },

          export: () => ರ‿ರ.form ? _export() : false,

          clone: () => ರ‿ರ.form ? _save(true) : false,

          scales: { /* <!-- We're managing existing scales --> */
            matches: /SCALES/i,
            fn: () => ರ‿ರ.form ? _save(true) : false,
            active: true,
          },

          save: {
            matches: /SAVE/i,
            length: 0,
            fn: _save,
            routes: {
              report: {
                state: STATE_REPORT_OPENED,
                routes: {
                  clone: {
                    matches: /CLONE/i,
                    fn: () => $("#_cmd_Report_Clone").click()
                  },
                  export: {
                    matches: /EXPORT/i,
                    fn: () => $("#_cmd_Report_Export").click()
                  },
                  report_save: {
                    matches: /REPORT/i,
                    fn: _save
                  },
                }
              }
            }
          },

          create: {
            matches: /CREATE/i,
            length: 0,
            fn: () => _create.prompt([_actions.scales(), _actions.forms(),
                _actions.reports()
              ])
              .then(form => ರ‿ರ.form = form),
            routes: {
              form: {
                matches: /FORM/i,
                routes: {
                  drive: () => _create.prompt([_actions.forms()])
                    .then(form => ರ‿ರ.form = form),
                  folder: {
                    length: 1,
                    fn: command => _create.parent(command)
                      .then(folder => _create.prompt([_actions.forms()], folder))
                      .then(form => ರ‿ರ.form = form)
                  },
                }
              },
              report: {
                matches: /REPORT/i,
                routes: {
                  prompt: () => _create.prompt([_actions.reports()])
                    .then(form => ರ‿ರ.form = form),
                  named: {
                    length: 1,
                    fn: command => (ರ‿ರ.forms.has(command.toLowerCase()) ?
                        Promise.resolve(_create.report(command.toLowerCase())) :
                        _create.prompt([_actions.reports()]))
                      .then(form => ರ‿ರ.form = form)
                  },
                  folder: {
                    length: 2,
                    fn: command => _create.parent(command[0])
                      .then(folder => _create.prompt([_actions.reports()], folder))
                      .then(form => ರ‿ರ.form = form)
                  },
                },
              },
              folder: {
                length: 1,
                fn: command => _create.parent(command[1])
                  .then(folder => _create.prompt([_actions.scales(),
                    _actions.forms(), _actions.reports()
                  ], folder))
                  .then(form => ರ‿ರ.form = form)
              }
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
      ರ‿ರ.forms = ರ‿ರ.forms ? ರ‿ರ.forms : ಠ_ಠ.Forms();
      moment().format();
    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false)

  };

};