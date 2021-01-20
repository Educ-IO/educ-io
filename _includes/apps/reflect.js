App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) {
    return new this.App().initialise(this);
  }

  /* <!-- Internal Constants --> */
  const FN = {};

  const SCOPE_FULL_DRIVE = "https://www.googleapis.com/auth/drive";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {}, /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  
  /* <!-- Mark Forms loading / loaded --> */
  FN.loading = () => $("#createRelectiveReport").addClass("loader");
  FN.loaded = () => $("#createRelectiveReport").removeClass("loader");
  
  /* <!-- Setup Functions --> */
  FN.setup = {

    /* <!-- Setup required for everything --> */
    now: () => {
      
      /* <!-- Set Up / Create the States and Files Module --> */
      FN.states = ಠ_ಠ.States(ಠ_ಠ);
      FN.files = ಠ_ಠ.Files(ಠ_ಠ);
      FN.replacers = ಠ_ಠ.Replacers(ಠ_ಠ);
      /* <!-- Set Up / Create the Function Modules --> */
      
    },
    
    /* <!-- Start App after fully loaded (but BEFORE routing) --> */
    initial: () => {

      ಠ_ಠ.Flags.log("APP Start Called", "Initial");

      if (window.underscoreDeepExtend && window._) _.mixin({
        "deepExtend": underscoreDeepExtend(_)
      });
      
      /* <!-- Setup Helpers --> */
      _.each([{
        name: "Strings"
      }, {
        name: "Tabulate"
      }, {
        name: "Notify",
        options: {
          id: "reflect_Notify",
          autohide: true,
        }
      },{
          name: "Exporter",
          options: {
            state: {
              application: ಱ
            }
          }
        }], helper => ಱ[helper.name.toLowerCase()] = ಠ_ಠ[helper.name](helper.options || null, ಠ_ಠ));

      /* <!-- Setup Showdown --> */
      ಱ.showdown = new showdown.Converter({
        strikethrough: true
      });

      /* <!-- Get Window Title --> */
      ಱ.title = window.document.title;
      
      /* <!-- Setup Function Modules --> */
      var _options = {
        functions: FN,
        state: {
          session: ರ‿ರ,
          application: ಱ
        }
      };
     _.each(["Decode", "Scales", "Elicit", "Helper", "Show", "Edit", "Create",
              "Prompt", "Process", "Action", "Export", "Load", "Save", "Query", "Update", "Table"], 
                module => FN[module.toLowerCase()] = ಠ_ಠ[module](_options, ಠ_ಠ));
      
    },

    /* <!-- App is ready for action! --> */
    session: () => {

      ಠ_ಠ.Flags.log("App is now READY", "Session");

      ಱ.forms = ಱ.forms || ಠ_ಠ.Forms(FN.loaded);

      ಱ.signatures = ಱ.signatures || ಠ_ಠ.Signatures(ಠ_ಠ, ಱ.strings.stringify, FN.replacers.signing, ಠ_ಠ.Main.elevator(SCOPE_FULL_DRIVE));

      ಱ.fields = ಠ_ಠ.Fields({
        forms: ಱ.forms
      }, ಠ_ಠ);

      ಱ.trackers = ಠ_ಠ.Trackers({
        forms: ಱ.forms,
        type: FN.files.type.tracker,
        title: FN.files.title,
        choose: FN.prompt.choose,
        functions: FN,
        state: {
          session: ರ‿ರ,
        }
      }, ಠ_ಠ);
      
      ಱ.evidence = ಠ_ಠ.Evidence({
        fields: ಱ.fields,
        forms: ಱ.forms,
        trackers: ಱ.trackers,
        functions: FN,
        state: {
          session: ರ‿ರ,
        }
      }, ಠ_ಠ);

    },

    routed: () => {

      ಠ_ಠ.Flags.log("Router is Started", "Routed");
      
      /* <!-- Reset Window Title (if required) --> */
      if (window.document.title != ಱ.title) window.document.title = ಱ.title;

      if (!ಱ.forms || !ಱ.forms.loaded()) FN.loading();

    },

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

      /* <!-- Initial Setup Call --> */
      FN.setup.now();

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Reflect",
        state: ರ‿ರ,
        states: FN.states.all,
        start: FN.setup.routed,
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
          },
          {
            match: /REPORT/i,
            show: "REPORT_INSTRUCTIONS",
            title: "What is a Reflective Report ..."
          },
          {
            match: /EVIDENCE/i,
            show: "EVIDENCE_INSTRUCTIONS",
            title: "How to Log Evidence ..."
          },
          {
            match: /FORM/i,
            show: "FORM_INSTRUCTIONS",
            title: "What is a Form in Reflect ..."
          }
        ],
        routes: {

          open: {
            options: command => ({
              title: "Select a Reflect File to Open",
              view: "DOCS",
              mime: /FORM/i.test(command) ? 
                      FN.files.type.form : /REPORT/i.test(command) ? 
                        FN.files.type.report : /REVIEW/i.test(command) ?
                        FN.files.type.review : /TRACKER/i.test(command) ? 
                        FN.files.type.tracker : FN.files.type.all.join(","),
              mine: null,
              parent: null,
              include_folders: false,
              team: false,
              full: true,
            }),
            success: value => ಱ.forms.safe().then(() => FN.load.file(value.result))
              .then(() => FN.action.recent(value.result, true))
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e).negative())
              .then(ಠ_ಠ.Main.busy("Opening File")),
          },

          import: {
            reset: true,
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
            options: {
              full: true, 
            },
            success: value => ಱ.forms.safe().then(() => FN.load.file(value.result, 
                                 value.command && _.isArray(value.command) && value.command.length > 1 ? value.command.slice(1) : null))
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e).negative())
              .then(ಠ_ಠ.Main.busy("Loading")),
          },

          analyse: {
            matches: /ANALYSE/i,
            routes: {
              save: {
                matches: /SAVE/i,
                state: FN.states.analysis.in,
                length: 0,
                fn: () => FN.save.analysis()
              },
              add: {
                matches: /ADD/i,
                state: FN.states.analysis.summary,
                length: 0,
                fn: () => ಠ_ಠ.Display.text({
                  id: "add_expected",
                  title: "Add / Edit Expected ...",
                  message: ಠ_ಠ.Display.doc.get("ANALYSE_EXPECTED"),
                  validate: value => value,
                  state: {
                    value: _.map(ರ‿ರ.analysis.expected(), 
                                 value => value && _.isArray(value) ? value.join("\t") : value)
                            .join("\n")
                  },
                  action: "Analyse",
                  rows: 8
                }).then(value => {
                  if (value) ರ‿ರ.analysis.expected(value);
                })
              },
              summary: {
                matches: /SUMMARY/i,
                state: FN.states.analysis.detail,
                length: 0,
                fn: () => ರ‿ರ.analysis.summary()
                  .then(() => ಠ_ಠ.Display.state()
                    .change(FN.states.analysis.detail, FN.states.analysis.summary))
              },
              detail: {
                matches: /DETAIL/i,
                state: FN.states.analysis.summary,
                length: 0,
                fn: () => ರ‿ರ.analysis.detail()
                  .then(() => ಠ_ಠ.Display.state()
                    .change(FN.states.analysis.summary, FN.states.analysis.detail))
              },
              stage: {
                matches: /STAGE/i,
                state: FN.states.analysis.in,
                routes: {
                  any: {
                    matches: /ANY/i,
                    state: FN.states.analysis.stages.complete,
                    length: 0,
                    fn: () => ರ‿ರ.analysis.any()
                      .then(() => ಠ_ಠ.Display.state()
                        .change(FN.states.analysis.stages.complete, FN.states.analysis.stages.any)),
                  },
                  complete: {
                    matches: /COMPLETE/i,
                    state: FN.states.analysis.stages.any,
                    length: 0,
                    fn: () => ರ‿ರ.analysis.complete()
                      .then(() => ಠ_ಠ.Display.state()
                        .change(FN.states.analysis.stages.any, FN.states.analysis.stages.complete)),
                  },
                }
              },
              reports: {
                matches: /REPORTS/i,
                state: FN.states.analysis.in,
                routes: {
                  all: {
                    matches: /ALL/i,
                    length: 0,
                    fn: () => (ರ‿ರ.analysis ? ರ‿ರ.analysis.all() : FN.prompt.analysis())
                      .then(() => ಠ_ಠ.Display.state()
                        .change([FN.states.analysis.reports.mine, FN.states.analysis.reports.shared], FN.states.analysis.reports.all)),
                  },
                  mine: {
                    matches: /MINE/i,
                    length: 0,
                    fn: () => (ರ‿ರ.analysis ? ರ‿ರ.analysis.mine() : FN.prompt.analysis(true))
                      .then(() => ಠ_ಠ.Display.state()
                        .change([FN.states.analysis.reports.all, FN.states.analysis.reports.shared], FN.states.analysis.reports.mine)),
                  },
                  shared: {
                    matches: /SHARED/i,
                    length: 0,
                    fn: () => (ರ‿ರ.analysis ? ರ‿ರ.analysis.shared() : FN.prompt.analysis(false))
                      .then(() => ಠ_ಠ.Display.state()
                        .change([FN.states.analysis.reports.all, FN.states.analysis.reports.mine], FN.states.analysis.reports.shared)),
                  },
                }
              },
              export: {
                matches: /EXPORT/i,
                state: FN.states.analysis.in,
                routes: {
                  csv: {
                    matches: /CSV/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(ರ‿ರ.analysis.table(), "csv", ರ‿ರ.analysis.title())
                  },
                  excel: {
                    matches: /EXCEL/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(ರ‿ರ.analysis.table(), "xlsx", ರ‿ರ.analysis.title(), "Analysis")
                  },
                  markdown: {
                    matches: /MARKDOWN/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(ರ‿ರ.analysis.table(), "md", ರ‿ರ.analysis.title())
                  },
                  sheets: {
                    matches: /SHEETS/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(ರ‿ರ.analysis.table(), "sheets", ರ‿ರ.analysis.title(), "Analysis", "NOTIFY_SAVE_ANALYSIS_SUCCESS")
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
                      .enter([FN.states.analysis.summary, FN.states.analysis.reports.all, FN.states.analysis.stages.any]))
                    .catch(e => ಠ_ಠ.Flags.error(`Analysing Form: ${_form.id}`, e).negative())
                    .then(ಠ_ಠ.Main.busy("Finding Reports")) : false;
                },
              },
              verify: {
                length: 0,
                state: FN.states.analysis.in,
                matches: /VERIFY/i,
                fn: () => ಠ_ಠ.Display.state().toggle(FN.states.analysis.verify) ? ರ‿ರ.analysis.verify() : false,
              },
              default: {
                length: 0,
                fn: () => FN.prompt.analysis()
                  .then(result => ಠ_ಠ.Display.state()
                    .enter(result ? [FN.states.analysis.summary, FN.states.analysis.reports.all, FN.states.analysis.stages.any] : null))
              }
            },
          },

          sign: {
            matches: /SIGN/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: FN.states.report.opened,
                routes: {
                  remove: {
                    matches: /REMOVE/i,
                    state: FN.states.report.signed,
                    length: 0,
                    fn: () => ಱ.signatures.remove(ರ‿ರ.file)
                      .then(result => result ? FN.process.signatures() : false)
                  },
                  sign: {
                    length: 0,
                    state: FN.states.report.signable,
                    fn: () => ಱ.signatures.sign.report(ರ‿ರ.file, FN.action.dehydrate().data)
                      .then(() => FN.process.signatures())
                  },
                }

              }
            }
          },

          revoke: {
            matches: /REVOKE/i,
            state: FN.states.report.revocable,
            fn: () => FN.action.revoke()
          },

          edit: {
            matches: /EDIT/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: FN.states.report.opened,
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
                state: FN.states.report.opened,
                routes: {
                  autosave: {
                    state: FN.states.report.editable,
                    matches: /AUTO/i,
                    keys: ["a", "A"],
                    fn: () => FN.save.autosave(ಠ_ಠ.Display.state().in(FN.states.report.autosave))
                      .then(result => result ? ಠ_ಠ.Display.state().enter(FN.states.report.autosave) : ಠ_ಠ.Display.state().exit(FN.states.report.autosave))
                  },
                  clone: {
                    matches: /CLONE/i,
                    fn: () => FN.save.report(true)
                      .then(result => result ? FN.process.signatures() : false)
                  },
                  export: {
                    matches: /EXPORT/i,
                    fn: () => FN.export.report()
                  },
                  save: {
                    state: FN.states.report.editable,
                    length: 0,
                    keys: ["shift+s", "shift+S"],
                    requires: "html2canvas",
                    fn: () => FN.save.report()
                      .then(result => result ? FN.process.signatures() : false)
                  },
                }
              },
              form: {
                matches: /FORM/i,
                state: FN.states.form.opened,
                keys: ["alt+s", "alt+S"],
                requires: "html2canvas",
                fn: () => FN.save.form(ರ‿ರ.preview)
              }
            }
          },

          send: {
            matches: /SEND/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: FN.states.report.opened,
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
                state: FN.states.report.opened,
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
                state: FN.states.report.opened,
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
                state: FN.states.report.opened,
                length: 0,
                fn: () => FN.action.complete(),
              }
            }
          },

          create: {
            matches: /CREATE/i,
            reset: true,
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
                    fn: command => ಱ.forms.safe()
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

          evidence: {
            matches: /EVIDENCE/i,
            routes: {
              report: {
                matches: /CREATE/i,
                length: 0,
                fn: () => ಱ.forms.safe().then(() => (ರ‿ರ.tracker ? Promise.resolve(ರ‿ರ.tracker) : ಱ.trackers.choose())
                  .then(tracker => tracker ? ಱ.evidence.add(tracker).then(() => delete ರ‿ರ.file) : false))
              }
            }
          },

          query: {
            matches: /QUERY/i,
            routes: {
              report: {
                matches: /REPORT/i,
                state: FN.states.report.opened,
                length: 2,
                fn: command => FN.query.report(
                  decodeURIComponent(ಠ_ಠ.url.decode(command[0])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[1])),
                  ಠ_ಠ.Main.elevator(SCOPE_FULL_DRIVE))
              },
              reply: {
                matches: /REPLY/i,
                state: FN.states.report.opened,
                length: 3,
                fn: command => FN.query.reply(
                  decodeURIComponent(ಠ_ಠ.url.decode(command[0])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[1])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[2])),
                  ಠ_ಠ.Main.elevator(SCOPE_FULL_DRIVE))
              },
              resolve: {
                matches: /RESOLVE/i,
                state: FN.states.report.opened,
                length: 3,
                fn: command => FN.query.resolve(
                  decodeURIComponent(ಠ_ಠ.url.decode(command[0])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[1])),
                  decodeURIComponent(ಠ_ಠ.url.decode(command[2])),
                  ಠ_ಠ.Main.elevator(SCOPE_FULL_DRIVE))
              }
            }
          },
          
          test: {
            matches: /TEST/i,
            length: 0,
            state: FN.states.report.opened,
            keys: ["t", "T"],
            fn: () => ಱ.notify.success("Testing Notifications", "Here is some <b>HTML</b> body text for testing. Some of it is <em>italic</em>, and some <u>underlined</u> or <s>striked through</s>.", 100000)
          },

          overview: {
            matches: /OVERVIEW/i,
            length: 0,
            state: [FN.states.report.opened, FN.states.file.loaded],
            all: true,
            fn: () => FN.action.overview()
          },
          
        },
        route: () => false,
        /* <!-- PARAMETERS: handled, command --> */
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: FN.setup.initial,

    ready: FN.setup.session,

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,

    persistent: ಱ,

  };

};