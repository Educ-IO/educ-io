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
  const TYPE_SCALE = "application/x.educ-io.reflect-scale",
    TYPE_FORM = "application/x.educ-io.reflect-form",
    TYPE_REPORT = "application/x.educ-io.reflect-report",
    TYPE_REVIEW = "application/x.educ-io.reflect-review",
    TYPE_TRACKER = "application/x.educ-io.reflect-tracker",
    TYPES = [TYPE_SCALE, TYPE_FORM, TYPE_REPORT, TYPE_REVIEW, TYPE_TRACKER];
  const STATE_FORM_OPENED = "opened-form",
    STATE_REPORT_OPENED = "opened-report",
    STATE_TRACKER_OPENED = "opened-tracker",
    STATES = [STATE_FORM_OPENED, STATE_REPORT_OPENED, STATE_TRACKER_OPENED];
  const EMAIL = /\w+@[\w.-]+|\{(?:\w+, *)+\w+\}@[\w.-]+/gi;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Functions --> */

  /* <-- Edit Functions --> */
  var _edit = {

    form: form => ಠ_ಠ.Display.text({
      id: "form_editor",
      title: "Create/Edit Form ...",
      message: ಠ_ಠ.Display.doc.get({
        name: "FORM",
      }),
      state: {
        value: form ? JSON.stringify(form, null, 2) : "" /* <-- TODO: Default Template Form? --> */
      },
      action: "Save",
      rows: 10
    }),

  };
  /* <-- Edit Functions --> */


  /* <!-- Create Functions --> */
  var _create = {

    display: (name, state, form, process) => {
      var _initial = form ? ರ‿ರ.forms.create(name, form) : ರ‿ರ.forms.get(name),
        _return = _initial.form;
      ರ‿ರ.template = _initial.template;
      if (ರ‿ರ.template) ರ‿ರ.template.__name = name;
      _return.target = ಠ_ಠ.container.empty();
      ಠ_ಠ.Display.state().enter(state).protect("a.jump").on("JUMP");

      var _shown = ಠ_ಠ.Display.template.show(_return);

      if (process) process(_shown);

      return ಠ_ಠ.Fields({
          me: ಠ_ಠ.me ? ಠ_ಠ.me.full_name : undefined,
          templater: ಠ_ಠ.Display.template.get,
          list_upload_content: "Evidence",
          list_web_content: "Evidence"
        }, ಠ_ಠ)
        .on(_shown);
    },

    parent: id => new Promise(resolve => ಠ_ಠ.Google.files.get(id, true)
      .then(f => {
        ಠ_ಠ.Google.folders.is(true)(f) ?
          resolve(f) : ಠ_ಠ.Flags.error(`Supplied ID is not a folder: ${id}`) && resolve();
      }).catch(e => {
        ಠ_ಠ.Flags.error(`Opening Google Drive Folder: ${id}`, e) && resolve();
      })),

    report: (name, form, process) => _create.display(name.toLowerCase(), STATE_REPORT_OPENED, form, process),

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

    load: (form, process) => _create.report(form.__name, form, process)

  };
  /* <!-- Create Functions --> */


  /* <!-- Prompt Functions --> */
  var _prompt = {

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
      ಠ_ಠ.Flags.log("Create Action Selected:", result);
      return result.action.command ?
        _create[result.action.command](result.option.value) : null;
    }).catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) :
      ಠ_ಠ.Flags.log("Create Prompt Cancelled")),

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
  /* <!-- Prompt Functions --> */


  /* <!-- Process Functions --> */
  var _process = {

    report: data => _create.load(_.tap(data, data => ಠ_ಠ.Flags.log(`Loaded Report File: ${data}`)).form,
      form => (ರ‿ರ.form = ಠ_ಠ.Data({}, ಠ_ಠ).rehydrate(form, data.report))),

    form: data => _edit.form(_.tap(data, data => ಠ_ಠ.Flags.log(`Loaded Form File: ${data}`))),

  };
  /* <!-- Process Functions --> */


  /* <!-- Action Functions --> */
  var _action = {

    screenshot: element => (window.html2canvas ?
        html2canvas(element, {
          logging: window.scrollTo(0, 0)
        }) :
        Promise.reject(new Error(`HTML2Canvas Object Evalulates to ${html2canvas}`)))
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
      .catch(e => ಠ_ಠ.Flags.error("Screenshot Error", e ? e : "No Inner Error"))
      .then(result => result && result.thumbnail ? result : false),

    dehydrate: () => {

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

    },

    load: file => ಠ_ಠ.Google.files.download((ರ‿ರ.file = file).id)
      .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
      .then(content => JSON.parse(content))
      .then(content =>
        ಠ_ಠ.Google.files.is(TYPE_REPORT)(file) ? _process.report(content) :
        ಠ_ಠ.Google.files.is(TYPE_FORM)(file) ? _process.form(content) :
        Promise.reject(`Supplied ID is not a recognised Reflect File Type: ${file.id}`)),

    save: force => {
      _action.screenshot($("form[role='form'][data-name]")[0])
        .then(result => {
          var _saving = _action.dehydrate(),
            _meta = {
              name: _saving.name,
              parents: (ರ‿ರ.folder ? ರ‿ರ.folder.id : null),
              properties: {
                reflectForm: _saving.data.form
              }
            },
            _data = JSON.stringify(_saving.data),
            _mime = TYPE_REPORT;
          if (result) _meta.contentHints = result;

          return ಠ_ಠ.Google.files.upload.apply(this, [_meta, _data, _mime].concat(!ರ‿ರ.file || force ? [] : [null, ರ‿ರ.file.id]));
        })
        .then(uploaded => ಠ_ಠ.Recent.add((ರ‿ರ.file = uploaded).id,
          uploaded.name.replace(/.REFLECT$/i, ""), "#google,load." + uploaded.id))
        .then(() => ಠ_ಠ.Flags.log("Saved:", ರ‿ರ.file))
        .catch(e => ಠ_ಠ.Flags.error("Saving Error", e ? e : "No Inner Error"))
        .then(ಠ_ಠ.Display.busy({
          target: $("body"),
          fn: true
        }));

    },

    export: () => {
      var _exporting = _action.dehydrate();
      try {
        saveAs(new Blob([JSON.stringify(_exporting.data)], {
          type: "application/octet-stream"
        }), _exporting.name);
      } catch (e) {
        ಠ_ಠ.Flags.error("Report Export", e);
      }
    },

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

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Reflect",
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
            success: value => _action.load(value.result)
              .then(() => ಠ_ಠ.Recent.add(value.result.id,
                value.result.name.replace(/.REFLECT$/i, ""),
                `#google,load.${value.result.id}`))
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e))
              .then(ಠ_ಠ.Display.busy(true)),
          },

          import: {
            success: value => _action.process(value.result),
          },

          load: {
            success: value => _action.load(value.result).then(ಠ_ಠ.Display.busy(true)),
          },

          export: () => ರ‿ರ.form ? _action.export() : false,

          clone: () => ರ‿ರ.form ? _action.save(true) : false,

          scales: {
            matches: /SCALES/i,
            fn: () => EMAIL ? false : false
          },

          save: {
            matches: /SAVE/i,
            length: 0,
            fn: _action.save,
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
                    fn: () => $("#_cmd_Report_Save").click()
                  },
                }
              }
            }
          },

          create: {
            matches: /CREATE/i,
            length: 0,
            fn: () => _prompt.create([_prompt.scales(), _prompt.forms(), _prompt.reports()])
              .then(form => ರ‿ರ.form = form),
            routes: {
              form: {
                matches: /FORM/i,
                routes: {
                  drive: () => _prompt.create([_prompt.forms()])
                    .then(form => ರ‿ರ.form = form),
                  folder: {
                    length: 1,
                    fn: command => _create.parent(command)
                      .then(folder => _prompt.create([_prompt.forms()], folder))
                      .then(form => ರ‿ರ.form = form)
                  },
                }
              },
              report: {
                matches: /REPORT/i,
                routes: {
                  prompt: () => _prompt.create([_prompt.reports()])
                    .then(form => ರ‿ರ.form = form),
                  named: {
                    length: 1,
                    fn: command => (ರ‿ರ.forms.has(command.toLowerCase()) ?
                        Promise.resolve(_create.report(command.toLowerCase())) :
                        _prompt.create([_prompt.reports()]))
                      .then(form => ರ‿ರ.form = form)
                  },
                  folder: {
                    length: 2,
                    fn: command => _create.parent(command[0])
                      .then(folder => _prompt.create([_prompt.reports()], folder))
                      .then(form => ರ‿ರ.form = form)
                  },
                },
              },
              folder: {
                length: 1,
                fn: command => _create.parent(command[1])
                  .then(folder =>
                    _prompt.create([_prompt.scales(), _prompt.forms(), _prompt.reports()], folder))
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