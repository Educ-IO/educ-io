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
    STATE_SCALE_OPENED = "opened-tracker",
    STATES = [STATE_FORM_OPENED, STATE_REPORT_OPENED, STATE_TRACKER_OPENED, STATE_SCALE_OPENED];
  const EMAIL = /\w+@[\w.-]+|\{(?:\w+, *)+\w+\}@[\w.-]+/gi;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Functions --> */

  /* <-- Edit Functions --> */
  var _edit = {

    generic: (value, help, title, id) => ಠ_ಠ.Display.text({
      id: id ? id : "generic_editor",
      title: title ? title : "Create/Edit ...",
      message: help ? ಠ_ಠ.Display.doc.get(help) : "",
      state: {
        value: value ? JSON.stringify(value, null, 2) : ""
      },
      action: "Save",
      rows: 10
    }),

    form: form => _edit.generic(form, "FORM", "Create/Edit Form ...", "form_editor"),

    scale: scale => _edit.generic(scale, "SCALE", "Create/Edit Scale ...", "scale_editor"),

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

    load: (form, process) => _create.report(form.__name, form, process),

    generic: (edit, value, mime) => edit(value).then(result => {
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
          name: `${title}.reflect`
        }, JSON.stringify(result), mime));
      };
      result ? _process(JSON.parse(result)) : Promise.reject();
    }),


    report: (name, form, process) => _create.display(name, STATE_REPORT_OPENED, form, process),

    form: name => _create.generic(_edit.form, ರ‿ರ.forms.get(name).template, TYPE_FORM)
      .then(() => ಠ_ಠ.Display.state().enter(STATE_FORM_OPENED).protect("a.jump").on("JUMP"))
      .catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) : false),

    scale: name => _create.generic(_edit.scale, ರ‿ರ.forms.scale(name), TYPE_SCALE)
      .then(() => ಠ_ಠ.Display.state().enter(STATE_SCALE_OPENED).protect("a.jump").on("JUMP"))
      .catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) : false),

    tracker: name => name,
    /* <!-- TODO: Tracker Creation --> */

  };
  /* <!-- Create Functions --> */


  /* <!-- Prompt Functions --> */
  var _prompt = {

    choose: (options, title, instructions, multiple) => ಠ_ಠ.Display.choose({
        id: "select_chooser",
        title: title,
        instructions: ಠ_ಠ.Display.doc.get(instructions),
        choices: options,
        multiple: multiple,
        action: "Select",
      })
      .catch(e => ಠ_ಠ.Flags.error(e ? "Displaying Select Prompt" : "Select Prompt Cancelled", e))
      .then(result => {
        ಠ_ಠ.Flags.log("Selected:", result);
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
      ಠ_ಠ.Flags.log("Create Action Selected:", result);
      return result.action.command ?
        _create[result.action.command](result.option.value) : null;
    }).catch(e => ಠ_ಠ.Flags.error(e ? "Displaying Create Prompt" : "Create Prompt Cancelled", e)),

    scales: () => ({
      name: "Scale",
      desc: "Create Scale",
      command: "scale",
      doc: "CREATE_SCALE",
      options: [{
        name: "New ..."
      }].concat(ರ‿ರ.forms.selection("scales", "Scale"))
    }),

    forms: () => ({
      name: "Form",
      desc: "Create Form",
      command: "form",
      doc: "CREATE_FORM",
      options: [{
        name: "New ..."
      }].concat(ರ‿ರ.forms.selection("forms", "Report"))
    }),

    reports: () => ({
      name: "Report",
      desc: "Create Report",
      command: "report",
      doc: "CREATE_REPORT",
      options: ರ‿ರ.forms.selection("forms", "Report"),
    }),

    trackers: () => ({
      name: "Tracker",
      desc: "Create Tracker",
      command: "tracker",
      doc: "CREATE_TRACKER",
      options: ರ‿ರ.forms.selection("scales", "Scale")
    }),

  };
  /* <!-- Prompt Functions --> */


  /* <!-- Process Functions --> */
  var _process = {

    report: data => {
      _create.load(_.tap(data, data => ಠ_ಠ.Flags.log(`Loaded Report File: ${data}`)).form,
        form => (ರ‿ರ.form = ಠ_ಠ.Data({}, ಠ_ಠ).rehydrate(form, data.report)));
      return true;
    },

    form: data => {
      _edit.form(_.tap(data, data => ಠ_ಠ.Flags.log(`Loaded Form File: ${data}`)));
      return true;
    },

    tracker: data => data,
    /* <!-- TODO: Process Tracker Loading --> */

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
              appProperties: {
                FORM: _saving.data.form,
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
        start: () => ರ‿ರ.forms = ರ‿ರ.forms ? ರ‿ರ.forms : ಠ_ಠ.Forms(),
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
              .then(ಠ_ಠ.Main.busy()),
          },

          import: {
            success: value => _action.process(value.result),
          },

          load: {
            success: value => _action.load(value.result).then(ಠ_ಠ.Main.busy()),
          },

          export: () => ರ‿ರ.form ? _action.export() : false,

          clone: () => ರ‿ರ.form ? _action.save(true) : false,

          analyse: {
            matches: /ANALYSE/i,
            fn: () => _prompt.choose(
                ರ‿ರ.forms.selection("forms", "Report"), "Select a Form ...", "ANALYSE", true)
              .then(result => result) /* <!-- TODO: Display Analysis --> */
          },

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
            fn: () => _prompt.create(
                [_prompt.scales(), _prompt.forms(), _prompt.reports(), _prompt.trackers()])
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
                    fn: command => (ರ‿ರ.forms.has(command) ?
                        Promise.resolve(_create.report(command)) :
                        _prompt.create([_prompt.reports()]))
                      .then(form => ರ‿ರ.form = form)
                  },
                  folder: {
                    length: 2,
                    fn: command => _create.parent(command[0])
                      .then(folder => ರ‿ರ.forms.has(command[1]) ?
                        Promise.resolve(_create.report(command[1])) :
                        _prompt.create([_prompt.reports()], folder))
                      .then(form => ರ‿ರ.form = form)
                  },
                },
              },
              tracker: {
                matches: /TRACKER/i,
                routes: {
                  prompt: () => _prompt.create([_prompt.trackers()])
                    .then(tracker => ರ‿ರ.tracker = tracker),
                  folder: {
                    length: 1,
                    fn: command => _create.parent(command)
                      .then(folder => _prompt.create([_prompt.trackers()], folder))
                      .then(tracker => ರ‿ರ.tracker = tracker)
                  },
                },
              },
              scale: {
                matches: /SCALE/i,
                routes: {
                  drive: () => _prompt.create([_prompt.scales()])
                    .then(scale => ರ‿ರ.scale = scale),
                  folder: {
                    length: 1,
                    fn: command => _create.parent(command)
                      .then(folder => _prompt.create([_prompt.scales()], folder))
                      .then(scale => ರ‿ರ.scale = scale)
                  },
                }
              },
              folder: {
                length: 1,
                fn: command => _create.parent(command)
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
      moment().format();
    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false)

  };

};