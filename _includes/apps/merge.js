App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const ID = "merge_split",
    FN = {},
    MIME = "application/x.educ-io.merge";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.options = {
    
    open : (type, view, mime) => ({
              title: `Select a ${type} to Open`,
              view: view,
              mime: mime,
              folders: true,
              all: true,
              team: true,
            }),
    
    load : mime => mime ? {
      mime: mime,
    } : {
      mime: MIME,
      busy: true,
      download: true,
    },
    
  };
  
  FN.open = value => (/DATA/i.test(value.command) ?
                FN.load.data(value.result)
                  .then(records => ರ‿ರ.records = records, ಠ_ಠ.Display.state().enter(FN.states.data.loaded)) :
                               
                /TEMPLATE/i.test(value.command) ?
                  FN.load.template(value.result)
                    .then(template => ರ‿ರ.template = template, ಠ_ಠ.Display.state().enter(FN.states.template.loaded)) :
                               
                  FN.load.file(value.result).then(() => ಠ_ಠ.Display.state().enter(FN.states.opened)))
  
                .then(() => FN.recent(value.result, 
                              (value.command.length === 3 ? value.command[1] : value.command[0]).toLowerCase()))
            
                .then(FN.resize)
            
                .catch(e => ಠ_ಠ.Flags.error("Loading Failure: ", e ? e : "No Inner Error"))
            
                .then(ಠ_ಠ.Display.busy({
                  target: ಠ_ಠ.container,
                  status: "Loading Data",
                  fn: true
                }));
  
  FN.resize = () => ಠ_ಠ.Display.size.resizer.height("#site_nav, #data_tabs", "div.tab-pane");
  
  FN.recent = (file, type) => {
    
    /* <!-- Store in Relevant Recent Items --> */
    var _recent = ರ‿ರ.recent[type].db,
        _type = file.mimeType == ಠ_ಠ.Google.files.natives()[0] ? "doc" :
                file.mimeType == ಠ_ಠ.Google.files.natives()[1] ? "sheet" :
                file.mimeType == ಠ_ಠ.Google.files.natives()[2] ? "presentation" :
                file.mimeType == ಠ_ಠ.Google.files.natives()[4] ? "form" : "";
     _recent ? _recent.add(file.id, file.name, `#google,load.${file.id}.${type}${_type ? `.${_type}` : ""}`) : false;

  };
  /* <!-- Internal Functions --> */

  /* <!-- Setup Functions --> */
  FN.setup = {

    /* <!-- Setup required for everything, almost NOTHING is loaded at this point (e.g. ಠ_ಠ.Flags) --> */
    now: () => {

      /* <!-- Set Up / Create the States Module --> */
      FN.states = ಠ_ಠ.States();

      /* <!-- Set Up / Create the Events Module --> */
      FN.events = ಠ_ಠ.Events();

    },

    /* <!-- Start App after fully loaded (but BEFORE routing or authentication) --> */
    initial: () => {

      /* <!-- Setup Helpers --> */
      _.each([{
        name: "Strings"
      }, {
        name: "Tabulate"
      }, {
        name: "Notify",
        options: {
          id: "classes_Notify",
          autohide: true,
        }
      }, {
        name: "Config",
        options: {
          fields: {
            comparison: ["data"],
          },
          state: FN.states.config
        }
      }, {
        name: "Exporter",
        options: {
          state: {
            application: ಱ
          }
        }
      }], helper => ಱ[helper.name.toLowerCase()] = ಠ_ಠ[helper.name](helper.options || null, ಠ_ಠ));

      /* <!-- Setup Function Modules --> */
      var _options = {
        id: ID,
        mime: MIME,
        functions: FN,
        state: {
          session: ರ‿ರ,
          application: ಱ
        }
      };
      _.each(["Common", "Load", "PDF", "Doc", "Merge", "Templates"],
        module => FN[module.toLowerCase()] = ಠ_ಠ[module](_options, ಠ_ಠ));

    },

    /* <!-- App is ready for action - e.g. is authenticated but no initial routing done! --> */
    session: () => null,

    /* <!-- App is authenticated and routed! --> */
    routed: () => {
      
      /* <!-- Sets the recent DB holder. --> */
      ರ‿ರ.recent = {};
      
    },

  };
  /* <!-- Setup Functions --> */

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
        name: "Merge",
        states: FN.states.all,
        start: FN.setup.routed,
        instructions: [{
          match: [
            /LOAD/i,
            /DATA/i,
          ],
          show: "LOAD_DATA_INSTRUCTIONS",
          title: "Loading Data ..."
        }, {
          match: [
            /LOAD/i,
            /TEMPLATE/i,
          ],
          show: "LOAD_TEMPLATE_INSTRUCTIONS",
          title: "Loading a Template ..."
        }],
        routes: {

          open: {
            
            options: command => /DOC/i.test(command) ? 
                FN.options.open("Document", "DOCUMENTS", ಠ_ಠ.Google.files.natives()[0]) : 
              /PRESENTATION/i.test(command) ? 
                FN.options.open("Presentation", "PRESENTATIONS", ಠ_ಠ.Google.files.natives()[2]) :
              /SHEET/i.test(command) ?
                FN.options.open("Sheet", "SPREADSHEETS", ಠ_ಠ.Google.files.natives()[1]) :
              /FORM/i.test(command) ? 
                FN.options.open("Form", "DOCS", ಠ_ಠ.Google.files.natives()[4]) :
                _.extend(FN.options.open("Merge", "DOCS", MIME), {download: true}),
            
            success: FN.open
            
          },

          load: {
            
            options: command => _.isArray(command) ? 
              /DOC/i.test(command) ?
                FN.options.load(ಠ_ಠ.Google.files.natives()[0]) :
              /PRESENTATION/i.test(command) ? 
                FN.options.load(ಠ_ಠ.Google.files.natives()[2]) :
              /SHEET/i.test(command) ?
                FN.options.load(ಠ_ಠ.Google.files.natives()[1]) :
              /FORM/i.test(command) ? 
                FN.options.load(ಠ_ಠ.Google.files.natives()[4]) : 
                FN.options.load() :
              FN.options.load(),
            
            scopes: "https://www.googleapis.com/auth/drive.file",
            
            success: FN.open
            
          },
          
          save: {
            matches: /SAVE/i,
            routes: {

              pdf: {
                matches: /PDF/i,
                length: 0,
                fn: () => FN.pdf.save()
                  .catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
                  .then(ಠ_ಠ.Display.busy({
                    target: ಠ_ಠ.container,
                    status: "Processing Merge",
                    fn: true
                  }))
              }

            }
          },
          
          create: () => FN.merge.create().then(() => ಠ_ಠ.Display.state().enter(FN.states.opened)),

          headers: {
            matches: /HEADERS/i,
            length: 0,
            fn: () => ರ‿ರ.records.headers.restore().then(FN.resize),
            routes: {

              increment: {
                matches: /INCREMENT/i,
                length: 0,
                fn: () => ರ‿ರ.records.headers.increment().then(FN.resize)
              },
              
              decrement: {
                matches: /DECREMENT/i,
                length: 0,
                fn: () => ರ‿ರ.records.headers.decrement().then(FN.resize)
              },
              
              manage: {
                matches: /MANAGE/i,
                length: 0,
                fn: () => ರ‿ರ.records.headers.manage().then(FN.resize)
              },

            }
          },

          merge: {
            matches: /MERGE/i,
            routes: {
              
              doc: {
                matches: /DOC/i,
                length: 0,
                fn: () => {
                  ಠ_ಠ.Flags.log("TEMPLATE FILE:", FN.templates.state().file);
                  ಠ_ಠ.Google.files.copy(FN.templates.state().file.id, false, {
                      name: `${FN.templates.state().file.name} [Merged]`,
                      parents: FN.templates.state().file.parents,
                    })
                    .then(merge => {
                      ಠ_ಠ.Flags.log("MERGED FILE:", merge);
                      return ಠ_ಠ.Google.scripts.execute(ಠ_ಠ.SETUP.CONFIG.api, "test", [merge.id]);
                    })
                    .then(result => ಠ_ಠ.Flags.log("RESULT FROM MERGE:", result))
                    .catch(e => ಠ_ಠ.Flags.error("Merging Failure: ", e ? e : "No Inner Error"))
                    .then(ಠ_ಠ.Display.busy({
                      target: ಠ_ಠ.container,
                      status: "Processing Merge",
                      fn: true
                    }));
                }
              },
              
            }
          },

          upload: {
            matches: [/UPLOAD/i, /DOC/i],
            routes: {
              
              doc : {
                matches: /DOC/i,
                length: 0,
                fn: () => {
                  FN.doc.upload(FN.template.result).then(uploaded => {
                      ಠ_ಠ.Flags.log("PROCESSED UPLOAD:", uploaded);
                    })
                    .catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
                    .then(ಠ_ಠ.Display.busy({
                      target: ಠ_ಠ.container,
                      status: "Processing Merge",
                      fn: true
                    }));
                }
              },
              
              pdf: {
                matches: /PDF/i,
                length: 0,
                fn: () => {
                  FN.pdf.upload(FN.templates.state().result).then(uploaded => {
                      ಠ_ಠ.Flags.log("PROCESSED UPLOAD:", uploaded);
                    })
                    .catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
                    .then(ಠ_ಠ.Display.busy({
                      target: ಠ_ಠ.container,
                      status: "Processing Merge",
                      fn: true
                    }));
                }
              }
              
            }
            
          },

          test: {
            matches: /DUMP/i,
            fn: () => {
              ಠ_ಠ.Flags.log("Records:", ರ‿ರ.records);
              ಠ_ಠ.Flags.log("Master:", ರ‿ರ.master);
              ಠ_ಠ.Flags.log("Output:", ರ‿ರ.output);
              ಠ_ಠ.Flags.log("Template:", FN.templates.state().template);
              ಠ_ಠ.Flags.log("Nodes:", FN.templates.state().nodes);
            }
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

    /* <!-- Present Internal Modules / Functions (for debugging etc) --> */
    fn: FN,

    persistent: ಱ,

  };

};