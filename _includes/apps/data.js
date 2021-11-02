App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Functions --> */
	/* <!-- Internal Functions --> */
  
	/* <!-- Internal Constants --> */
  const FN = {},
    MIME = "application/x.educ-io.data-data",
    CONFIG = [];
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
  var _load = data => {
    ಠ_ಠ.Flags.log("Loaded Data:", data);
    ರ‿ರ.provider = data.provider;
    ರ‿ರ.data = data.data;
    ಠ_ಠ.Display.state().change(FN.states.active, [
        FN.states.loaded.in, FN.states.processed.in,
        FN.states.loaded[ರ‿ರ.provider], FN.states.processed[ರ‿ರ.provider]
      ]);
    ರ‿ರ.table = FN.overview.show(ರ‿ರ.provider.toUpperCase(), ರ‿ರ.current, FN[ರ‿ರ.provider].populate.summary(ರ‿ರ.data));
    ಠ_ಠ.Display.state().enter([FN.states.view.in, FN.states.view.overview]);
  };
	/* <!-- Internal Functions --> */
  
  /* <!-- Export Functions --> */
  FN.export = {

    file: () => ಠ_ಠ.Display.state().in(FN.states.view.overview) ? "Academic Data Overview" : 
      ಠ_ಠ.Display.state().in(FN.states.view.detail) ? "Academic Data Detail" : 
      ಠ_ಠ.Display.state().in(FN.states.view.student) ? "Student Academic Data" : 
      "Overview",

    table: () => "Data",

  };
  /* <!-- Export Functions --> */
  
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

      /* <!-- Setup Function Modules --> */
      var _options = {
        mime: MIME,
        functions: FN,
        state: {
          session: ರ‿ರ,
          application: ಱ
        }
      };
      
      /* <!-- Add Provider Modules --> */
      _.each(["iSAMS_API"],
        module => CONFIG.push((FN[module.split("_")[0].toLowerCase()] = ಠ_ಠ[module](_options, ಠ_ಠ)).config()));
      
      /* <!-- Config Helpers --> */
      var _config = _.map(CONFIG, config => ({
        name: `Config_${config.name.toUpperCase()}`,
        module: "Config",
        options : _.extend({
          state: FN.states.config[config.name.toLowerCase()],
          name: `${config.name.toLowerCase()}_config.json`,
        }, _.omit(config, ["name", "process"]))
      }));
      
      /* <!-- Setup Helpers --> */
      _.each(_config.concat([{
        name: "Strings"
      }, {
        name: "Tabulate"
      }, {
        name: "Notify",
        options: {
          id: "data_Notify",
          autohide: true,
        }
      }, {
        name: "Exporter",
        options: {
          state: {
            application: ಱ
          }
        }
      }]), helper => ಱ[helper.name.toLowerCase()] = ಠ_ಠ[helper.module || helper.name](helper.options || null, ಠ_ಠ));

      /* <!-- Add Function Modules --> */
      _.each(["Common", "Files", "Transform", "Generate", "Overview", "Detail", "Student"],
        module => FN[module.toLowerCase()] = ಠ_ಠ[module](_options, ಠ_ಠ));

    },

    /* <!-- App is ready for action - e.g. is authenticated but no initial routing done! --> */
    session: () => {

      return null;

    },

    /* <!-- App is authenticated and routed! --> */
    routed: () => {

      /* <!-- Sets the currently focussed date | Done here as this is called when app restarts etc. --> */
      /* <!-- Overidden when a file is loaded --> */
      ರ‿ರ.current = ಠ_ಠ.Dates.now().startOf("day");
      
      /* <!-- Set Up / Create the Configuration Modules --> */
      FN.configuration = _.reduce(CONFIG, (memo, config) => {
        memo[config.name.toLowerCase()] = ಠ_ಠ.Configuration(_.extend({
          preferences: {
            id : `${config.name.toLowerCase()}_Configuration`,
            template : `config-${config.name.toLowerCase()}`,
            title : `${config.name} Config`,
            actions: [{
              text: "Delete Saved Config",
              class: "btn-danger",
              desc: ಠ_ಠ.Display.doc.get("DELETE_SAVED_CONFIG"),
              handler: () => ಠ_ಠ.Display.confirm({
                id: "delete_Config",
                target: ಠ_ಠ.container,
                message: ಠ_ಠ.Display.doc.get("CONFIRM_DELETE_SAVED_CONFIG", config.name),
                action: "Delete"
              })
              .then(confirm => confirm && ಱ[`config_${config.name.toLowerCase()}`] ? ಱ[`config_${config.name.toLowerCase()}`].clear()
                .then(ಠ_ಠ.Main.busy("Deleting Saved Config"))
                .catch(e => ಠ_ಠ.Flags.error(`Deleting ${config.name} Config from Google Drive App Data`, e).negative()) : false)
            }, {
              text: "Get URL",
              class: "btn-dark",
              desc: ಠ_ಠ.Display.doc.get("GET_URL"),
              handler: values => ಠ_ಠ.Link({
                app: "data",
                route: `settings.import.${config.name.toLowerCase()}`,
                persistent: false,
                offer_persistent: true,
                /* <!-- UK/US Keyboard Language Mapping Issues for # --> */
                hide_link: true,
                hide_shorten: true,
                force_qr: true,
                options_bottom: true,
                qr_size: 480,
                title: "Data Shortcut",
                data: config.process.url(values)
              }, ಠ_ಠ).generate(),
            }],
          },
        }, ಱ), ಠ_ಠ);
        return memo;
      }, {});

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
        name: "Data",
        state: ರ‿ರ,
        states: FN.states.session,
        start: FN.setup.routed,
        instructions: [{
          match: [
            /CONFIG/i,
            /ISAMS/i
          ],
          show: "CONFIG_ISAMS_INSTRUCTIONS",
          title: "iSAMS Configuration ..."
        }, {
          match: [
            /CONFIG/i
          ],
          show: "CONFIG_INSTRUCTIONS",
          title: "Configuration ..."
        }, {
          match: [
            /IMPORT/i,
            /ISAMS/i
          ],
          show: "IMPORT_ISAMS_INSTRUCTIONS",
          title: "Importing from iSAMS ..."
        }, {
          match: [
            /IMPORT/i
          ],
          show: "IMPORT_INSTRUCTIONS",
          title: "Importing data ..."
        }, {
          match: [
            /SAVE/i
          ],
          show: "SAVE_INSTRUCTIONS",
          title: "Saving data ..."
        }, {
          match: [
            /OVERVIEW/i,
            /EXPORT/i
          ],
          show: "OVERVIEW_EXPORT_INSTRUCTIONS",
          title: "Exporting Overview ..."
        }, ],
        routes: {
          
          close: {
            keys: ["ctrl+alt+c", "ctrl+alt+C"],
            length: 0,
          },
          
          load: {
            options: {
              busy: true,
              mime: MIME
            },
            scopes: "https://www.googleapis.com/auth/drive.file",
            success: value => FN.files.parse(value.result)
              .then(_load)
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e).negative()),
          },
          
          open: {
            options: {
              busy: true,
              team: true,
              all: true,
              recent: true,
              mime: MIME
            },
            scopes: "https://www.googleapis.com/auth/drive.file",
            success: value => FN.files.parse(value.result)
              .then(_load)
              .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e).negative()),
          },
          
          import: {

            success: value => ಠ_ಠ.Google.reader().promiseAsText(value.result)
                .then(ಠ_ಠ.Main.busy("Loading Academic Data"))
                .then(FN.files.hydrate)
                .then(_load)
                .catch(e => ಠ_ಠ.Flags.error("Importing Data File", e).negative()),
            
          },
          
          save: {
            
            matches: /SAVE/i,
            scopes: "https://www.googleapis.com/auth/drive.file",
            requires: ["filesaver","google"],
            
            routes: {

              isams: {
                matches: /ISAMS/i,
                state: FN.states.processed.isams,
                length: 0,
                fn: () => ರ‿ರ.data ? FN.files.action("isams", ರ‿ರ.data, ರ‿ರ.current).save() : false
              },
              
            },
            
          },
          
          download: {
            
            matches: /DOWNLOAD/i,
            requires: "filesaver",
            state: FN.states.processed.in,
            
            routes: {

              isams: {
                matches: /ISAMS/i,
                state: FN.states.processed.isams,
                length: 0,
                fn: () => ರ‿ರ.data ? FN.files.action("isams", ರ‿ರ.data, ರ‿ರ.current)
                  .download(`iSAMS Academic Data | ${_.pluck(ರ‿ರ.data.source.years, "name").join(" ")}`) : false
              },
              
            },
            
          },
          
          settings: {
            
            matches: /SETTINGS/i,
            routes: {
              
              config: {

                matches: /CONFIG/i,
                routes: {

                  isams: {
                    matches: /ISAMS/i,
                    length: 0,
                    fn: () => FN.configuration.isams.edit(ಱ.config__isams ? ಱ.config__isams.settings : {}, ಱ.config_isams.fields())
                    .then(values => values !== undefined ? ಱ.config_isams.update(ಱ.config__isams.id, 
                            _.defaults(ಱ.config_isams.process(values, ಱ.config__isams.settings), 
                                       ಱ.config__isams ? _.omit(ಱ.config__isams.settings, "imported") : {}))
                        .then(ಠ_ಠ.Main.busy("Saving Config")) : false)
                  },

                }

              },
              
              import: {
                
                matches: /IMPORT/i,
                routes: {

                  isams: {
                    matches: /ISAMS/i,
                    length: 1,
                    fn: command => {
                      try {
                        ಱ.config__isams = {
                          imported : true,
                          settings : _.defaults(ಱ.config_isams.defaults() || {},
                                                JSON.parse(ಠ_ಠ.Strings().base64.decode(command)))
                        };
                        ಠ_ಠ.Display.state().enter(FN.states.config.isams);
                        ಠ_ಠ.Flags.log("Imported iSAMS Config:", ಱ.config__isams);
                      } catch (e) {
                        ಠ_ಠ.Flags.error("Failed to Parse iSAMS Imported Config", e ? e : "No Inner Error");
                      }
                    }
                  },

                }
                
              },
              
            }
            
          },
          
          query: {

            matches: /QUERY/i,
            
            routes: {

              isams: {
                matches: /ISAMS/i,
                state: FN.states.config.isams,
                length: 0,
                fn: () => FN.isams.select.year_groups()
                  .then(years => {
                    if (years && years.id !== undefined) years = [years];
                    if (_.isArray(years) && years.length > 0) {
                      ಠ_ಠ.Flags.log("Selected NC Years:", years);
                      return FN.isams.select.input_data(ಱ.config__isams.settings)
                        .then(values => {
                          if (values) {
                            var _series = _.isArray(values.Series.Values.Items) ? 
                                values.Series.Values.Items : [values.Series.Values.Items];
                            ಠ_ಠ.Flags.log("Selected Series:", _series);
                            
                            var _load = FN.isams.load(ಱ.config__isams.settings),
                                _cycles = _.chain(_series).filter(s => s.Type == "Report Cycle").groupBy("Year").value(),
                                _trackers = _.chain(_series).filter(s => s.Type == "Academic Tracker").pluck("ID").value().join(",");
                                
                            /* <!-- Adjust Academic Years to match the Reporting Year (as required) --> */
                            var _current = new Date(),
                                _currentYear = _current.getMonth() < 9 ? _current.getFullYear() - 1 : _current.getFullYear();
                            var _reports = _.reduce(_cycles, (memo, cycles, year) => {
                              var _diff = _currentYear - year,
                                  _ids = _.pluck(cycles, "ID").join(",");
                              memo = memo.concat(_.map(years, year => _load.reports(_ids, year.id - _diff, "", "")));
                              return memo;
                            }, []), _length = _reports.length;
                                
                            return Promise.each([_load.pupils()].concat(_reports).concat(_trackers ? _load.tracking(_trackers) : []))
                              .then(data => {
                                  
                                var _pupils = data[0],
                                    _reports = data.slice(1, _length + 1),
                                    _trackers = data.length > _length + 1 ? data.slice(_length + 1) : [],
                                    _metadata = FN.isams.metadata();

                                _reports = _reports.length ? 
                                  _.reduce(_reports.slice(1), (memo, report) => {
                                    memo.iSAMS.SchoolReports.ReportCycles.ReportCycle =
                                      (_.isArray(memo.iSAMS.SchoolReports.ReportCycles.ReportCycle) ? 
                                        memo.iSAMS.SchoolReports.ReportCycles.ReportCycle : 
                                        [memo.iSAMS.SchoolReports.ReportCycles.ReportCycle])
                                          .concat(report.iSAMS.SchoolReports.ReportCycles.ReportCycle);
                                    return memo;
                                  }, _reports[0]) : null;

                                _trackers = _trackers.length ? 
                                  _.reduce(_trackers.slice(1), (memo, tracker) => {
                                    memo.iSAMS.TrackingManager.ExternalData.Data =
                                      (_.isArray(memo.iSAMS.TrackingManager.ExternalData.Data) ? 
                                        memo.iSAMS.TrackingManager.ExternalData.Data : 
                                        [memo.iSAMS.TrackingManager.ExternalData.Data])
                                          .concat(tracker.iSAMS.TrackingManager.ExternalData.Data);
                                    return memo;
                                  }, _trackers[0]) : null;

                                ಠ_ಠ.Flags.log("Loaded Metadata:", _metadata);  
                                ಠ_ಠ.Flags.log("Loaded Pupils:", _pupils);
                                ಠ_ಠ.Flags.log("Loaded Reports:", _reports);
                                ಠ_ಠ.Flags.log("Loaded Trackers:", _trackers);
                                 
                                return {
                                  years: years,
                                  metadata: _metadata,
                                  pupils: _pupils,
                                  reports: _reports,
                                  trackers: _trackers
                                };
                                
                              })
                              .then(ಠ_ಠ.Main.busy("Loading Data from iSAMS"))
                              .then(data =>  {
                                ಠ_ಠ.Display.state().enter([FN.states.loaded.in, FN.states.loaded.isams]);
                                return Promise.resolve({
                                  source: data,
                                  transformed: FN.transform.process(data.metadata, data.reports, data.pupils, data.trackers),
                                  labels: FN.transform.labels(),
                                }).then(ಠ_ಠ.Main.busy("Transforming iSAMS Data"));
                              })
                              .then(data => {
                                ಠ_ಠ.Flags.log("Final Data:", data);
                                ಠ_ಠ.Display.state().enter([FN.states.processed.in, FN.states.processed.isams]);
                                FN.overview.show("ISAMS", ರ‿ರ.current = _current, FN.isams.populate.summary(data));
                                ಠ_ಠ.Display.state().enter([FN.states.view.in, FN.states.view.overview]);
                                ರ‿ರ.provider = "isams";
                                return (ರ‿ರ.data = data);
                              });
                          }
                      });
                    }
                  })
              },

            }

          },
          
          export: {

            matches: /EXPORT/i,
            state: FN.states.processed.in,
            routes: {

              sheets: {
                matches: /SHEETS/i,
                scopes: "https://www.googleapis.com/auth/drive.file",
                requires: "google",
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "sheets", FN.export.file(), FN.export.table(),
                                                  "NOTIFY_EXPORT_VIEW_SUCCESS"),
               
              },

              excel: {
                matches: /EXCEL/i,
                requires: ["xlsxpopulate", "filesaver"],
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "xlsx", FN.export.file(), FN.export.table())
                
              },

              csv: {
                matches: /CSV/i,
                requires: "filesaver",
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "csv", FN.export.file())
                
              },

              markdown: {
                matches: /MARKDOWN/i,
                requires: "filesaver",
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "md", FN.export.file())
                
              }

            }

          },
          
          output: {
            
            matches: /OUTPUT/i,
            requires: "google",
            state: FN.states.processed.in,
            scopes: "https://www.googleapis.com/auth/drive.file",
            fn: () => FN.generate.output(ರ‿ರ.data, ರ‿ರ.current)
            
          },
          
          show: {
            
            matches: /SHOW/i,
            state: FN.states.processed.in,
            tidy: true,
            
            routes: {

              overview: {
                matches: /OVERVIEW/i,
                length: 0,
                fn: () => {
                  ರ‿ರ.table = FN.overview.show(ರ‿ರ.provider.toUpperCase(), ರ‿ರ.current, 
                                                FN[ರ‿ರ.provider].populate.summary(ರ‿ರ.data));
                  ಠ_ಠ.Display.state().change(FN.states.view.all, [FN.states.view.in, FN.states.view.overview]);
                }
              },
              
              detail: {
                matches: /DETAIL/i,
                length: 0,
                fn: () => {
                  var _detail = FN[ರ‿ರ.provider].populate.detail(ರ‿ರ.data);
                  ರ‿ರ.table = FN.detail.show(ರ‿ರ.provider.toUpperCase(), ರ‿ರ.current, _detail.data, _detail.headers);
                  ಠ_ಠ.Display.state().change(FN.states.view.all, [FN.states.view.in, FN.states.view.detail]);
                }
              },
              
              student: {
                matches: /STUDENT/i,
                state: FN.states.view.detail,
                length: 1,
                fn: command => {
                  ರ‿ರ.table = FN.student.show(ರ‿ರ.provider.toUpperCase(), ರ‿ರ.current, 
                                    FN[ರ‿ರ.provider].populate.student(command, ರ‿ರ.data));
                  ಠ_ಠ.Display.state().change(FN.states.view.all, [FN.states.view.in, FN.states.view.student]);
                }
              }
              
            },
            
          },
          
        },
        route: () => false, /* <!-- PARAMETERS: handled, command --> */
      });

			/* <!-- Return for Chaining --> */
			return this;

		},
    
    /* <!-- Start App after fully loaded (but BEFORE routing) --> */
    start: () => {
      ಠ_ಠ.Flags.log("APP Start Called");
      FN.setup.initial();
    },

    /* <!-- App is ready for action! --> */
    ready: () => {
      ಠ_ಠ.Flags.log("App is now READY");
      FN.setup.session();
    },
    
    /* <!-- App is usable (all initial routes processed!) --> */
    /* <!-- This is run here (rather than router start) to ensure any initial loads are done first --> */
    finally: () => _.each(ಱ, (value, key) => /^config_\S+$/i.test(key) && value.get ? value.get()
          .then(config => config ? ರ‿ರ[key] = config : ರ‿ರ[key] && !ರ‿ರ[key].imported ? delete ರ‿ರ[key] : false) : null),
    
		/* <!-- Clear the existing state --> */
		clean: () => ಠ_ಠ.Router.clean(false),
    
    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,
    
    /* <!-- Present Internal Modules / Functions (for debugging etc) --> */
    fn: FN,

    persistent: ಱ,
		
	};

};