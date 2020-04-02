App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */

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
        },{
          name: "Tabulate"
        },{
          name: "Notify",
          options: {
            id: "classes_Notify",
            autohide: true,
          }
        },{
          name: "Config",
          options: {
            fields: {
              comparison: ["data"],
            },
            state: FN.states.config
          }
        },{
          name: "Exporter",
          options: {
            state: {
              application: ಱ
            }
          }
        }
      ], helper => ಱ[helper.name.toLowerCase()] = ಠ_ಠ[helper.name](helper.options || null, ಠ_ಠ));

      /* <!-- Setup Function Modules --> */
      var _options = {
        functions: FN,
        state: {
          session: ರ‿ರ,
          application: ಱ
        }
      };
      _.each(["Populate", "People", "Classes", "Overview", "Usage", "Roster"],
        module => FN[module.toLowerCase()] = ಠ_ಠ[module](_options, ಠ_ಠ));

    },

    /* <!-- App is ready for action - e.g. is authenticated but no initial routing done! --> */
    session: () => {

      return null;

    },

    /* <!-- App is authenticated and routed! --> */
    routed: () => {

      /* <!-- Sets the currently focussed date | Done here as this is called when app restarts etc. --> */
      ರ‿ರ.current = ಠ_ಠ.Dates.now().startOf("day");

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
        name: "Classes",
        state: ರ‿ರ,
        states: FN.states.all,
        start: FN.setup.routed,
        instructions: [{
            match: [
              /OVERVIEW/i,
              /EXPORT/i
            ],
            show: "OVERVIEW_EXPORT_INSTRUCTIONS",
            title: "Exporting the overview ..."
          }, {
          match: /OVERVIEW/i,
          show: "OVERVIEW_INSTRUCTIONS",
          title: "What is an overview ..."
        }, ],
        routes: {

          refresh: {
            matches: /REFRESH/i,
            state: "authenticated",
            length: 0,
            keys: ["r", "R"],
            fn: () => (ಠ_ಠ.Display.state().in(FN.states.overview.in) ? FN.overview.display().then(table => ರ‿ರ.table = table) : Promise.resolve(false))
              .catch(e => ಠ_ಠ.Flags.error("Refresh Error", e))
              .then(ಠ_ಠ.Main.busy("Refreshing", true)),
          },
          
          overview: {
            matches: /OVERVIEW/i,
            state: "authenticated",
            length: 0,
            keys: ["o", "O"],
            fn: () => FN.overview.display()
                .then(table => ರ‿ರ.table = table)
                .then(() => {
                  ಠ_ಠ.Display.state().change(FN.states.views, FN.states.overview.in);
                  if (!ಠ_ಠ.Display.state().in(FN.states.periods.all, true)) ಠ_ಠ.Display.state().enter(FN.states.periods.forever);
                })
                .catch(e => ಠ_ಠ.Flags.error("Classes Overview Error", e))
                .then(ಠ_ಠ.Main.busy(message => message || "", true, FN.events.load.progress, "Loading Classes")),
            routes: {
              usage: {
                matches: /USAGE/i,
                state: FN.states.overview.in,
                length: 0,
                keys: ["u", "U"],
                requires: "d3",
                scopes: [
                  "https://www.googleapis.com/auth/classroom.announcements.readonly",
                  "https://www.googleapis.com/auth/classroom.topics.readonly",
                  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
                  "https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly",
                ],
                fn: () => FN.usage.generate()
                            .then(() => ಠ_ಠ.Display.state().enter(FN.states.overview.usage)),
                routes: {
                  
                  force: {
                    matches: /FORCE/i,
                    length: 0,
                    requires: "d3",
                    scopes: [
                      "https://www.googleapis.com/auth/classroom.announcements.readonly",
                      "https://www.googleapis.com/auth/classroom.topics.readonly",
                      "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
                      "https://www.googleapis.com/auth/classroom.guardianlinks.students.readonly",
                    ],
                    keys: ["alt+u", "alt+U"],
                    fn: () => FN.usage.generate(true)
                                .then(() => ಠ_ಠ.Display.state().enter(FN.states.overview.usage)),
                  },
                  
                }
              },
              
              export: {
                matches: /EXPORT/i,
                state: FN.states.overview.in,
                routes: {
                  
                  sheets: {
                    matches: /SHEETS/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(FN.overview.table(), "sheets", "Google Classroom Overview", "Classes", "NOTIFY_EXPORT_OVERVIEW_SUCCESS")
                  },
                  
                  excel: {
                    matches: /EXCEL/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(FN.overview.table(), "xlsx", "Google Classroom Overview", "Classes")
                  },
                  
                  csv: {
                    matches: /CSV/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(FN.overview.table(), "csv", "Google Classroom Overview", "Classes")
                  },
                  
                  markdown: {
                    matches: /MARKDOWN/i,
                    length: 0,
                    fn: () => ಱ.exporter.export(FN.overview.table(), "md", "Google Classroom Overview", "Classes")
                  }
                  
                }
                
              }
              
            }
            
          },
          
          add: {
            
            matches: /ADD/i,
            state: FN.states.views,
            routes: {
              
              students: {
                matches: [/CLASS/i, /STUDENTS/i],
                state: FN.states.overview.in,
                length: 0,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                /* <!-- Error 409 : ALREADY_EXISTS = Returns false --> */
                fn: () => FN.roster.add.students(_.map(ರ‿ರ.table.table().find("tbody tr[data-id]").toArray(), el => FN.populate.get($(el).data("id"))))
                            .then(results => (ಠ_ಠ.Flags.log("Student Additions", results), 
                                              _.each(results, result => result && (result = _.compact(result)).length > 0 && result[0].courseId ? 
                                                    FN.usage.update(result[0].courseId, true, "students") : null)))
              },
              
              teachers: {
                matches: [/CLASS/i, /TEACHERS/i],
                state: FN.states.overview.in,
                length: 0,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                /* <!-- Error 409 : ALREADY_EXISTS = Returns false --> */
                fn: () => FN.roster.add.teachers(_.map(ರ‿ರ.table.table().find("tbody tr[data-id]").toArray(), el => FN.populate.get($(el).data("id"))))
                            .then(results => (ಠ_ಠ.Flags.log("Teachers Additions", results), 
                                              _.each(results, result => result && (result = _.compact(result)).length > 0 && result[0].courseId ? 
                                                    FN.usage.update(result[0].courseId, true, "teachers") : null)))
              },
              
            }
            
          },
          
          invite: {
            
            matches: /INVITE/i,
            state: FN.states.views,
            routes: {
              
              students: {
                matches: [/CLASS/i, /STUDENTS/i],
                state: FN.states.overview.in,
                length: 0,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                /* <!-- Error 409 : ALREADY_EXISTS = Returns false --> */
                fn: () => FN.roster.invite.students(_.map(ರ‿ರ.table.table().find("tbody tr[data-id]").toArray(), el => FN.populate.get($(el).data("id"))))
                            .then(results => (ಠ_ಠ.Flags.log("Student Invitations", results), 
                                              _.each(results, result => result && (result = _.compact(result)).length > 0 && result[0].courseId ? 
                                                    FN.usage.update(result[0].courseId, true, "invitations") : null)))
              },
              
              teachers: {
                matches: [/CLASS/i, /TEACHERS/i],
                state: FN.states.overview.in,
                length: 0,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                /* <!-- Error 409 : ALREADY_EXISTS = Returns false --> */
                fn: () => FN.roster.invite.teachers(_.map(ರ‿ರ.table.table().find("tbody tr[data-id]").toArray(), el => FN.populate.get($(el).data("id"))))
                            .then(results => (ಠ_ಠ.Flags.log("Teacher Invitations", results), 
                                              _.each(results, result => result && (result = _.compact(result)).length > 0 && result[0].courseId ? 
                                                    FN.usage.update(result[0].courseId, true, "invitations") : null)))
              },
              
            }
            
          },
          
          remove: {
            matches: /REMOVE/i,
            state: FN.states.views,
            length: 1,
            fn: command => ಠ_ಠ.Display.state().in(FN.states.overview.in) ? FN.overview.remove(command) : false,
            routes: {

              student: {
                matches: /STUDENT/i,
                state: FN.states.overview.in,
                length: 2,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                fn: commands => FN.roster.remove.student(FN.populate.get(commands[0]), commands[1])
                                  .then(result => (ಠ_ಠ.Flags.log("Student Removal", result), result ? FN.usage.update(commands[0], true, "students") : result))
              },
              
              students: {
                matches: [/CLASS/i, /STUDENTS/i],
                state: FN.states.overview.in,
                length: 0,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                fn: () => FN.roster.remove.students(_.map(ರ‿ರ.table.table().find("tbody tr[data-id]").toArray(), el => FN.populate.get($(el).data("id"))))
                                  .then(results => (ಠ_ಠ.Flags.log("Students Removals", results), 
                                              _.each(results, (result, index) => result && _.compact(result).length > 0 ? 
                                                    FN.usage.update(ರ‿ರ.table.table().find(`tbody tr:nth-child(${index + 1})`).data("id"), true, "students") :
                                                     null)))
              },
              
              teacher: {
                matches: /TEACHER/i,
                state: FN.states.overview.in,
                length: 2,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                fn: commands => FN.roster.remove.teacher(FN.populate.get(commands[0]), commands[1])
                                  .then(result => (ಠ_ಠ.Flags.log("Teacher Removal", result), result ? FN.usage.update(commands[0], true, "teachers") : result))
              },
              
              teachers: {
                matches: [/CLASS/i, /TEACHERS/i],
                state: FN.states.overview.in,
                length: 0,
                scopes: "https://www.googleapis.com/auth/classroom.rosters",
                fn: () => FN.roster.remove.teachers(_.map(ರ‿ರ.table.table().find("tbody tr[data-id]").toArray(), el => FN.populate.get($(el).data("id"))))
                                  .then(results => (ಠ_ಠ.Flags.log("Teachers Removals", results), 
                                              _.each(results, (result, index) => result && _.compact(result).length > 0 ? 
                                                    FN.usage.update(ರ‿ರ.table.table().find(`tbody tr:nth-child(${index + 1})`).data("id"), true, "teachers") :
                                                     null)))
              },
              
            }
            
          },

          period: {
            matches: /PERIOD/i,
            state: FN.states.views,
            routes: {
              
              forever: {
                matches: /FOREVER/i,
                length: 0,
                keys: ["f", "F"],
                fn: () => Promise.resolve(ಠ_ಠ.Flags.log("Period set to Forever"))
                            .then(() => ಠ_ಠ.Display.state().change(FN.states.periods.all, FN.states.periods.forever))
              },
              
              month: {
                matches: /MONTH/i,
                length: 0,
                keys: ["m", "M"],
                fn: () => Promise.resolve(ಠ_ಠ.Flags.log("Period set to Month"))
                            .then(() => ಠ_ಠ.Display.state().change(FN.states.periods.all, FN.states.periods.month))
              },
              
              week: {
                matches: /WEEK/i,
                length: 0,
                keys: ["w", "W"],
                fn: () => Promise.resolve(ಠ_ಠ.Flags.log("Period set to Week"))
                            .then(() => ಠ_ಠ.Display.state().change(FN.states.periods.all, FN.states.periods.week))
              },
              
              day: {
                matches: /DAY/i,
                length: 0,
                keys: ["d", "D"],
                fn: () => Promise.resolve(ಠ_ಠ.Flags.log("Period set to Day"))
                            .then(() => ಠ_ಠ.Display.state().change(FN.states.periods.all, FN.states.periods.day))
              },

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

    persistent: ಱ,

  };

};