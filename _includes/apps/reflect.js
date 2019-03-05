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
    TYPES = [TYPE_SCALE, TYPE_FORM, TYPE_REPORT, TYPE_REVIEW, TYPE_TRACKER];
  const STATE_FORM_OPENED = "opened-form",
    STATE_REPORT_OPENED = "opened-report",
    STATE_TRACKER_OPENED = "opened-tracker",
    STATE_SCALE_OPENED = "opened-tracker",
    STATES = [STATE_FORM_OPENED, STATE_REPORT_OPENED, STATE_TRACKER_OPENED, STATE_SCALE_OPENED];
  const EMAIL = /\w+@[\w.-]+|\{(?:\w+, *)+\w+\}@[\w.-]+/gi,
    MARKER = "=== SIGNED ===",
    META = "__meta",
    INDEX = "index",
    SIGNATORY = "signatory",
    DESTINATION = "destination",
    EXTENSION = ".reflect",
    EXTENSION_REGEX = /.REFLECT$/i,
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <-- Helper Functions --> */
  FN.helper = {

    values: (form, report, filter, use, initial) => _.reduce(form.groups, (memo, group) =>
      _.reduce(_.filter(group.fields, field => field[META] && filter(field[META])),
        (memo, field) => {
          var _field = report[field.field];
          if (_field && (_field.Value || _field.Values))
            use(_field.Value || _field.Values, field.field, memo);
          return memo;
        }, memo), initial),

    addresses: type => {
      var _value = FN.action.dehydrate(),
        _values = FN.helper.values(_value.data.form, _value.data.report,
          meta => meta[type], (value, field, memo) => memo.push(value), []);
      return _.reduce(_values, (memo, value) => memo.concat(value ? value.match(EMAIL) : []), []);
    },

    emails: options => ಠ_ಠ.Display.modal("send", _.defaults(options, {
        id: "emails",
      }), dialog => {
        ಠ_ಠ.Fields().on(dialog);
        ಠ_ಠ.Dialog({}, ಠ_ಠ).handlers.list(dialog, EMAIL);
      })
      .catch(e => e ? ಠ_ಠ.Flags.error("Send Error", e) : ಠ_ಠ.Flags.log("Send Cancelled")),

  };
  /* <-- Helper Functions --> */


  /* <-- Edit Functions --> */
  FN.edit = {

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

    form: (form, editable) => FN.edit.generic(form, "FORM", "Create/Edit Form ...", "form_editor", editable),

    scale: scale => FN.edit.generic(scale, "SCALE", "Create/Edit Scale ...", "scale_editor"),

  };
  /* <-- Edit Functions --> */


  /* <!-- Create Functions --> */
  FN.create = {

    display: (name, state, form, process, actions) => {
      var _initial = form ?
        ರ‿ರ.forms.create(name, form, actions.editable, actions.signable) :
        ರ‿ರ.forms.get(name, true, false),
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

    load: (form, process, actions) => FN.create.report(form.__name, actions, form, process),

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
          name: `${title}${EXTENSION}`
        }, JSON.stringify(result), mime));
      };
      result ? _process(JSON.parse(result)) : Promise.reject();
    }),


    report: (name, actions, form, process) => FN.create.display(name, STATE_REPORT_OPENED, form, process, actions),

    form: name => FN.create.generic(FN.edit.form, ರ‿ರ.forms.get(name).template, TYPE_FORM)
      .then(() => ಠ_ಠ.Display.state().enter(STATE_FORM_OPENED).protect("a.jump").on("JUMP"))
      .catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) : false),

    scale: name => FN.create.generic(FN.edit.scale, ರ‿ರ.forms.scale(name), TYPE_SCALE)
      .then(() => ಠ_ಠ.Display.state().enter(STATE_SCALE_OPENED).protect("a.jump").on("JUMP"))
      .catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) : false),

    tracker: name => name,
    /* <!-- TODO: Tracker Creation --> */

  };
  /* <!-- Create Functions --> */


  /* <!-- Prompt Functions --> */
  FN.prompt = {

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
        FN.create[result.action.command](result.option.value) : null;
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
  FN.process = {

    signatures: () => {
      var _target = $(ರ‿ರ.form).find(".signatures").empty(),
        _display = comments => {
          ರ‿ರ.form.signatures = comments.length;
          ಠ_ಠ.Display.template.show({
            template: "count",
            name: "Signatures",
            count: comments.length,
            clear: true,
            target: _target.parents(".card").find(".card-header h5")
          });
          Promise.all(_.map(comments, comment => FN.sign.verify(comment.signature)
              .then(valid => _.tap(valid, valid => _target.append(ಠ_ಠ.Display.template.get({
                template: "signature",
                valid: valid,
                who: comment.author.me ? true : comment.author.displayName,
                email: comment.author.emailAddress,
                when: moment(comment.modifiedTime).fromNow(),
                link: `${ಠ_ಠ.Flags.full()}${ಠ_ಠ.Flags.dir()}/#google,load.${ರ‿ರ.file.id}`
              }))))))
            .then(results => _target.parents(".card").find(".card-header .count")
              .append(_.filter(results, result => result === false).length > 0 ?
                ಠ_ಠ.Display.template.get({
                  template: "valid",
                  class: "ml-2 text-danger",
                  valid: false,
                  desc: "Some signatures are invalid / out of date!"
                }) : ಠ_ಠ.Display.template.get({
                  template: "valid",
                  valid: true,
                  class: "ml-2 text-success",
                })));
        },
        _none = () => {
          _target.html(ಠ_ಠ.Display.doc.get("NO_SIGNATURES"));
          _target.parents(".card").find(".card-header h5").html("Signatures");
        };

      ಠ_ಠ.Google.files.comments(ರ‿ರ.file).list()
        .then(comments => comments && (comments = _.filter(comments, comment => {
            var _signature, _set = signature => {
              comment.signature = JSON.parse(signature[0]);
              return true;
            };
            return comment.content.indexOf(MARKER) === 0 &&
              (_signature = comment.content.match(/{.+}/gi)) ?
              _set(_signature) : false;
          })).length > 0 ?
          _display(comments) : _none())
        .catch(e => ಠ_ಠ.Flags.error("Loading Comments", e));
    },

    report: (data, actions) => {
      FN.create.load(_.tap(data, data =>
          ಠ_ಠ.Flags.log(`Loaded Report File: ${JSON.stringify(data, null, 2)}`)).form,
        form => (ರ‿ರ.form = ಠ_ಠ.Data({}, ಠ_ಠ).rehydrate(form, data.report)), actions);
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

  };
  /* <!-- Process Functions --> */


  /* <!-- Action Functions --> */
  FN.action = {

    screenshot: element => (window.html2canvas ?
        html2canvas(_.tap(element, () => window.scrollTo(0, 0)), {
          logging: ಠ_ಠ.Flags.debug()
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
      .catch(e => ಠ_ಠ.Flags.error("Screenshot Error", e))
      .then(result => result && result.thumbnail ? result : false),

    dehydrate: () => {

      var _title = ರ‿ರ.template && ರ‿ರ.template.title ?
        ರ‿ರ.template.title : ರ‿ರ.template && ರ‿ರ.template.name ?
        ರ‿ರ.template.name : "Report",
        _date = new moment().format("YYYY-MM-DD");

      return {
        name: `${ಠ_ಠ.me ? `${ಠ_ಠ.me.display_name()} | ` : ""}${_title} | ${_date}${EXTENSION}`,
        data: {
          form: ರ‿ರ.template,
          report: ಠ_ಠ.Data({}, ಠ_ಠ).dehydrate(ರ‿ರ.form)
        }
      };

    },

    load: file => ಠ_ಠ.Google.files.download((ರ‿ರ.file = file).id)
      .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
      .then(content => ({
        content: JSON.parse(content),
        actions: {
          editable: file.capabilities && file.capabilities.canEdit,
          signable: file.capabilities && file.capabilities.canComment,
          revisions: file.capabilities && file.capabilities.canReadRevisions
        }
      }))
      .then(value =>
        ಠ_ಠ.Google.files.is(TYPE_REPORT)(file) ? FN.process.report(value.content, value.actions) :
        ಠ_ಠ.Google.files.is(TYPE_FORM)(file) ? FN.process.form(value.content, value.actions) :
        Promise.reject(`Supplied ID is not a recognised Reflect File Type: ${file.id}`)),

    save: force => (!ರ‿ರ.form.signatures ? Promise.resolve(true) : ಠ_ಠ.Display.confirm({
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
            var _saving = FN.action.dehydrate();
            return (force ? ಠ_ಠ.Display.text({
              id: "file_name",
              title: "File Name",
              message: ಠ_ಠ.Display.doc.get("CLONE_NAME"),
              state: {
                value: _saving.name.replace(EXTENSION_REGEX, "")
              },
              simple: true
            }) : Promise.resolve(_saving.name)).then(name => {
              var _meta = {
                  name: !name.endsWith(EXTENSION) ? `${name}${EXTENSION}` : name,
                  parents: (ರ‿ರ.folder ? ರ‿ರ.folder.id : null),
                  appProperties: FN.helper.values(_saving.data.form, _saving.data.report,
                    meta => meta[INDEX],
                    (value, field, memo) => memo[field] = JSON.stringify(value), {
                      FORM: _saving.data.form.name
                    }),
                },
                _data = JSON.stringify(_saving.data),
                _mime = TYPE_REPORT;
              if (result) _meta.contentHints = result;

              return ಠ_ಠ.Google.files.upload.apply(this, [_meta, _data, _mime].concat(!ರ‿ರ.file || force ? [] : [null, ರ‿ರ.file.id]));
            });
          })
          .then(uploaded => _.tap(uploaded, uploaded => ಠ_ಠ.Recent.add((ರ‿ರ.file = uploaded).id,
            uploaded.name.replace(EXTENSION_REGEX, ""), "#google,load." + uploaded.id)))
          .then(uploaded => ಠ_ಠ.Flags.log("Saved:", uploaded).reflect(uploaded))
          .catch(e => (e ? ಠ_ಠ.Flags.error("Save Error", e) : ಠ_ಠ.Flags.log("Save Cancelled")).negative())
          .then(ಠ_ಠ.Main.busy("Saving Report"));
      }),

    send: () => FN.helper.emails({
      id: "send_Report",
      title: "Send Report for Approval / Signature",
      instructions: ಠ_ಠ.Display.doc.get("SEND_INSTRUCTIONS"),
      emails: FN.helper.addresses(SIGNATORY),
    }).then(values => {
      if (values) ಠ_ಠ.Flags.log("TODO: SEND", values);
    }),

    share: () => {
      ಠ_ಠ.Flags.log("TODO:", "SHARE");
      return true;
    },

    complete: () => FN.helper.emails({
      id: "complete_Report",
      title: "Complete Report",
      instructions: ಠ_ಠ.Display.doc.get("COMPLETE_INSTRUCTIONS"),
      emails: FN.helper.addresses(DESTINATION),
    }).then(values => {
      if (values) ಠ_ಠ.Flags.log("TODO: COMPLETE", values);
    }),

    export: () => {
      var _exporting = FN.action.dehydrate();
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


  /* <!-- Sign Functions --> */
  FN.sign = {

    supported: () => window.crypto &&
      window.crypto.getRandomValues &&
      window.crypto.subtle &&
      window.crypto.subtle.generateKey &&
      window.crypto.subtle.sign &&
      window.crypto.subtle.verify &&
      window.TextEncoder &&
      window.TextDecoder,

    crypto: window.crypto.subtle,

    encode: value => ಠ_ಠ.Strings().hex.encode(value),

    decode: value => ಠ_ಠ.Strings().hex.decode(value),

    raw: () => new TextEncoder().encode(JSON.stringify(FN.action.dehydrate()).trim()),

    key: () => ({
      name: "ECDSA",
      namedCurve: "P-256",
    }),

    algorithm: () => ({
      name: "ECDSA",
      hash: {
        name: "SHA-256"
      },
    }),

    verify: signature => FN.sign.crypto.importKey("raw",
        FN.sign.encode(signature.key), FN.sign.key(), false, ["verify"])
      .then(key => FN.sign.crypto.verify(FN.sign.algorithm(), key,
        FN.sign.encode(signature.signature), FN.sign.raw()))
      .then(result => _.tap(result,
        result => ಠ_ಠ.Flags.log(`Verification Result: ${result}`, signature)))
      .catch(e => ಠ_ಠ.Flags.error("Verifying Error", e)),

    remove: () => ಠ_ಠ.Google.files.comments(ರ‿ರ.file).list()
      .then(comments => _.filter(comments, comment =>
        comment.content.indexOf(MARKER) === 0 && comment.author && comment.author.me === true))
      .then(comments => comments.length > 0 ? ಠ_ಠ.Display.confirm({
        id: "confirm_Remove",
        message: ಠ_ಠ.Display.doc.get({
          name: "REMOVE_SIGNATURES",
          content: comments.length,
        }),
        action: "Remove",
        close: "Cancel"
      }).then(result => result === true ? Promise.all(_.map(comments, comment =>
        ಠ_ಠ.Google.files.comments(ರ‿ರ.file).delete(comment.id))) : false) : false)
      .catch(e => ಠ_ಠ.Flags.error("Loading Comments", e)),

    report: () => FN.sign.supported() ? FN.sign.crypto.generateKey(
        FN.sign.key(), true, ["sign", "verify"]
      ).then(key => FN.sign.crypto.sign(FN.sign.algorithm(), key.privateKey, FN.sign.raw())
        .then(signature => {
          return FN.sign.crypto.exportKey("raw", key.publicKey)
            .then(value => _.tap({
              signature: FN.sign.decode(signature),
              key: FN.sign.decode(value)
            }, signature => ಠ_ಠ.Flags.log("Signature:", signature)));
        }))
      .then(signature => `${MARKER}\n\n${JSON.stringify(signature)}`)
      .then(signature => ಠ_ಠ.Google.files.comments(ರ‿ರ.file).list()
        .then(comments => _.filter(comments, comment =>
          comment.content.indexOf(MARKER) === 0 && comment.author && comment.author.me === true))
        .then(comments => comments.length > 0 ?
          ಠ_ಠ.Google.files.comments(ರ‿ರ.file).update(comments[0].id, signature) :
          ಠ_ಠ.Google.files.comments(ರ‿ರ.file)
          .create(signature, {
            r: "head",
            a: [{
              rect: {
                mw: 1,
                mh: 1,
              }
            }],
          })
        )
      )
      .catch(e => ಠ_ಠ.Flags.error("Signing Error", e))
      .then(ಠ_ಠ.Main.busy("Signing Report")) : false,

  };
  /* <!-- Sign Functions --> */


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
            title: "Saving your Report ..."
          },
          {
            match: /SIGN/i,
            show: "SIGN_INSTRUCTIONS",
            title: "Signing this Report ..."
          },
          {
            match: /SEND/i,
            show: "SEND_INSTRUCTIONS",
            title: "Sending & Sharing your Report ..."
          },
          {
            match: /COMPLETE/i,
            show: "COMPLETE_INSTRUCTIONS",
            title: "How to Complete & Submit ..."
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
              .then(() => ಠ_ಠ.Recent.add(value.result.id,
                value.result.name.replace(EXTENSION_REGEX, ""),
                `#google,load.${value.result.id}`))
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e))
              .then(ಠ_ಠ.Main.busy("Opening Report")),
          },

          import: {
            success: value => ಠ_ಠ.Google.reader().promiseAsText(value.result)
              .then(content => JSON.parse(content))
              .then(value => value.form && value.report ?
                FN.process.report(value, true) :
                FN.process.form(value, true))
              .then(ಠ_ಠ.Main.busy("Importing Report")),
          },

          load: {
            success: value => FN.action.load(value.result).then(ಠ_ಠ.Main.busy("Loading")),
          },

          analyse: {
            matches: /ANALYSE/i,
            fn: () => FN.prompt.choose(
                ರ‿ರ.forms.selection("forms", "Report"), "Select a Form ...", "ANALYSE", true)
              .then(result => result) /* <!-- TODO: Display Analysis --> */
          },

          sign: {
            matches: /SIGN/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                routes: {
                  export: {
                    matches: /REMOVE/i,
                    length: 0,
                    fn: () => FN.sign.remove()
                      .then(result => result ? FN.process.signatures() : false)
                  },
                  sign: {
                    length: 0,
                    fn: () => FN.sign.report().then(() => FN.process.signatures())
                  },
                }

              }
            }
          },

          scales: {
            matches: /SCALES/i,
            fn: () => EMAIL ? false : false
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
                    fn: () => FN.action.save(true)
                      .then(result => result ? FN.process.signatures() : false)
                  },
                  export: {
                    matches: /EXPORT/i,
                    fn: () => FN.action.export()
                  },
                  save: {
                    length: 0,
                    fn: () => FN.action.save()
                      .then(result => result ? FN.process.signatures() : false)
                  },
                }
              }
            }
          },

          send: {
            matches: /SEND/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                routes: {
                  send: {
                    length: 0,
                    fn: () => FN.action.send(),
                  },
                }
              }
            }
          },

          share: {
            matches: /SHARE/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: STATE_REPORT_OPENED,
                routes: {
                  send: {
                    length: 0,
                    fn: () => FN.action.share(),
                  },
                }
              }
            }
          },

          create: {
            matches: /CREATE/i,
            length: 0,
            fn: () => FN.prompt.create(
                [FN.prompt.scales(), FN.prompt.forms(), FN.prompt.reports(), FN.prompt.trackers()])
              .then(form => ರ‿ರ.form = form),
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
                    .then(form => ರ‿ರ.form = form),
                  named: {
                    length: 1,
                    fn: command => (ರ‿ರ.forms.has(command) ?
                        Promise.resolve(FN.create.report(command, true)) :
                        FN.prompt.create([FN.prompt.reports()]))
                      .then(form => ರ‿ರ.form = form)
                  },
                  folder: {
                    length: 2,
                    fn: command => FN.create.parent(command[0])
                      .then(folder => ರ‿ರ.forms.has(command[1]) ?
                        Promise.resolve(FN.create.report(command[1], true)) :
                        FN.prompt.create([FN.prompt.reports()], folder))
                      .then(form => ರ‿ರ.form = form)
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