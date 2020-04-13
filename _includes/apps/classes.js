App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const FN = {},
        MIME = "application/x.educ-io.classes-data";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.current = {

    classes: () => _.chain(ರ‿ರ.table.table().find("tbody tr[data-id]").toArray())
                      .map(el => FN.populate.get($(el).data("id"))).compact().value(),

  };

  FN.export = {

    file: () => ಠ_ಠ.Display.state().in(FN.states.overview.in) ?
      "Google Classroom Overview" : ಠ_ಠ.Display.state().in(FN.states.classwork.in) ? "Google Classwork Overview" : "Overview",

    table: () => ಠ_ಠ.Display.state().in(FN.states.overview.in) ? 
      "Classes" : ಠ_ಠ.Display.state().in(FN.states.classwork.in) ? "Classwork" : "Data",

  };

  FN.view = {

    state: (state, exit) => () => {
      ಠ_ಠ.Display.tidy();
      ಠ_ಠ.Display.state().change(FN.states.views.concat(exit ? _.isString(exit) ? [exit] : exit : []), (_.isString(state) ? [state] : state).concat([FN.states.view]));
      if (!ಠ_ಠ.Display.state().in(FN.states.periods.all, true)) ಠ_ಠ.Display.state().enter(FN.states.periods.forever);
    },
    
    generic: (fn, state, messages, exit) => fn()
      .then(table => ರ‿ರ.table = table)
      .then(FN.view.state(state, exit))
      .catch(e => ಠ_ಠ.Flags.error(messages.error, e))
      .then(ಠ_ಠ.Main.busy(true, true, FN.events.load.progress, messages.loading)),

    overview: since => FN.view.generic(() => FN.overview.display(since), FN.states.overview.in, {
      error: "Classes Overview Error",
      loading: since ? "Loading Classes" : "Loading All Classes"
    }, FN.states.file.loaded),

    classwork: since => (ಠ_ಠ.Display.state().in(FN.states.overview.in) ? FN.overview.detach() : Promise.resolve(true))
      .then(() => FN.view.generic(() => FN.classwork.display(FN.current.classes(), since), FN.states.classwork.in, {
        error: "Classwork View Error",
        loading: since ? "Loading Classwork" : "Loading All Classwork"
      })),

    refresh: () => (
        ಠ_ಠ.Display.state().in(FN.states.overview.in) ? FN.overview.refresh() :
        ಠ_ಠ.Display.state().in(FN.states.classwork.in) ? FN.classwork.refresh() :
        Promise.resolve(false)
      )
      .then(table => table === false ? delete ರ‿ರ.table : ರ‿ರ.table = table)
      .catch(e => ಠ_ಠ.Flags.error("Refresh Error", e))
      .then(ಠ_ಠ.Main.busy("Refreshing", true)),

    students: () => (ಠ_ಠ.Display.state().in(FN.states.overview.in) ? FN.overview.detach() : Promise.resolve(true))
      .then(() => FN.view.generic(() => FN.students.display(FN.overview.since(), FN.current.classes()), FN.states.overview.students, {
        error: "Students View Error",
        loading: "Transforming Overview"
      })),
    
    student: id => (ಠ_ಠ.Display.state().in(FN.states.overview.students) ? FN.students.detach() : Promise.resolve(true))
      .then(() => FN.view.generic(() => FN.student.display(FN.overview.since(), FN.populate.get(id, "students")), FN.states.overview.student, {
        error: "Student View Error",
        loading: "Transforming Overview"
      })),
    
    table: table => {
      if (!table) return;
      ರ‿ರ.table = table;
      table.table().find("a.value-remove").hide();
      FN.view.state([FN.states.overview.in, FN.states.overview.engagement, FN.states.overview.usage])();
    },
    
    close: () => (ಠ_ಠ.Display.state().in(FN.states.overview.student) ? FN.students.attach() : FN.overview.attach())
                  .then(table => ರ‿ರ.table = table)
                  .then(() => (ಠ_ಠ.Display.tidy(), ಠ_ಠ.Display.state().change(
                    [FN.states.classwork.in, FN.states.classwork.submissions, FN.states.overview.students, FN.states.overview.student],
                    ಠ_ಠ.Display.state().in(FN.states.overview.student) ? FN.states.overview.students : FN.states.overview.in))),
    
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
        mime: MIME,
        functions: FN,
        state: {
          session: ರ‿ರ,
          application: ಱ
        }
      };
      _.each(["Common", "Populate", "People", "Classes", "Overview", "Usage", "Engagement", "Roster",
                "Classwork", "Submissions", "Gradesheet", "Students", "Student", "Files"],
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
            /CLASSWORK/i,
            /SUBMISSIONS/i,
            /GRADESHEET/i
          ],
          show: "GRADESHEET_INSTRUCTIONS",
          title: "Creating Gradesheets ..."
        }, {
          match: [
            /OVERVIEW/i,
            /STUDENTS/i
          ],
          show: "STUDENTS_INSTRUCTIONS",
          title: "Viewing Engagement Data by Student ..."
        }, {
          match: [
            /OVERVIEW/i,
            /EXPORT/i
          ],
          show: "VIEW_EXPORT_INSTRUCTIONS",
          title: "Exporting the classes overview ..."
        }, {
          match: [
            /STUDENT/i,
            /EXPORT/i
          ],
          show: "VIEW_EXPORT_INSTRUCTIONS",
          title: "Exporting the student overview ..."
        }, {
          match: [
            /STUDENTS/i,
            /EXPORT/i
          ],
          show: "VIEW_EXPORT_INSTRUCTIONS",
          title: "Exporting the students overview ..."
        }, {
          match: [
            /CLASSWORK/i,
            /EXPORT/i
          ],
          show: "VIEW_EXPORT_INSTRUCTIONS",
          title: "Exporting the classwork ..."
        }, {
          match: /OVERVIEW/i,
          show: "OVERVIEW_INSTRUCTIONS",
          title: "What is an overview ..."
        }, {
          match: /LOAD/i,
          show: "LOAD_INSTRUCTIONS",
          title: "Loading Existing Classes Data ..."
        },],
        routes: {

          close: {
            keys : ["ctrl+alt+c", "ctrl+alt+C"],
            length : 0,
          },
          
          load: {
            options: {
              busy: true,
              mime: MIME
            },
            scopes: "https://www.googleapis.com/auth/drive.file",
            success: value => FN.files.parse(value.result)
                .then(FN.view.table)
                .catch(e => ಠ_ಠ.Flags.error(`Loading from Google Drive: ${value.result.id}`, e).negative()),
          },
          
          import: {
            success: value => {
              if (value.result && value.result.lastModifiedDate) ರ‿ರ.current = ಠ_ಠ.Dates.parse(value.result.lastModifiedDate).startOf("day");
              return ಠ_ಠ.Google.reader().promiseAsText(value.result)
                .then(ಠ_ಠ.Main.busy("Loading Classes Data"))
                .then(FN.files.hydrate)
                .then(FN.view.table)
                .catch(e => ಠ_ಠ.Flags.error("Importing Data File", e).negative());
            }
            ,
          },
          
          refresh: {
            matches: /REFRESH/i,
            state: FN.states.views,
            length: 0,
            keys: ["r", "R"],
            fn: () => FN.view.refresh()
          },

          overview: {
            matches: /OVERVIEW/i,
            state: "authenticated",
            length: 0,
            keys: ["o", "O"],
            fn: () => FN.view.overview(ಠ_ಠ.Dates.now().add(-370, "days").toISOString()),

            routes: {

              all: {
                matches: /ALL/i,
                length: 0,
                keys: ["ctrl+alt+o", "ctrl+alt+O"],
                fn: () => FN.view.overview(),
              },
              
              close: {
                matches: /CLOSE/i,
                state: [FN.states.overview.students, FN.states.classwork.in],
                length: 0,
                keys: ["c", "C"],
                fn: () => FN.view.close()
              },

              classwork: {
                matches: /CLASSWORK/i,
                state: FN.states.overview.in,
                length: 0,
                keys: ["a", "A"],
                scopes: [
                  "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
                  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
                ],
                fn: () => FN.view.classwork(FN.overview.since()),

                routes: {

                  all: {
                    matches: /ALL/i,
                    length: 0,
                    keys: ["ctrl+alt+w", "ctrl+alt+W"],
                    scopes: [
                      "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
                      "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
                    ],
                    fn: () => FN.view.classwork(),
                  },

                  submissions: {
                    matches: /SUBMISSIONS/i,
                    state: FN.states.classwork.in,
                    length: 0,
                    keys: ["b", "B"],
                    scopes: [
                      "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
                    ],
                    fn: () => FN.submissions.generate()
                      .then(() => ಠ_ಠ.Display.state().enter(FN.states.classwork.submissions)),
                    
                    routes : {
                    
                      gradesheet : {
                        
                        matches: /GRADESHEET/i,
                        state: FN.states.classwork.submissions,
                        
                        routes : {
                        
                          create : {
                            matches: /CREATE/i,
                            keys: ["g", "G"],
                            scopes: [
                              "https://www.googleapis.com/auth/drive.file",
                            ],
                            fn: () => FN.gradesheet.create()
                                        .catch(e => ಠ_ಠ.Flags.error("Gradesheet Creation Error", e))
                                        .then(ಠ_ಠ.Main.busy(true, true, FN.events.gradesheet.progress, "Creating Gradesheet"))
                                        .then(() => ಱ.notify.failure("Not Implemented", "Gradesheet functionality not yet complete!", 5000))
                            
                          },
                          
                          update : {
                            matches: /UPDATE/i,
                            keys: ["ctrl+alt+g", "ctrl+alt+G"],
                            scopes: [
                              "https://www.googleapis.com/auth/drive.file",
                            ],
                            requires: "google",
                            fn: () => ಠ_ಠ.Router.pick.single({
                              title: "Select a Gradesheet to Update",
                              view: "FOLDERS",
                              mime: ಠ_ಠ.Google.files.natives()[1],
                              folders: true,
                              all: true,
                              team: true,
                              properties: FN.gradesheet.property()
                            }).then(FN.gradesheet.update)
                                        .catch(e => e ? ಠ_ಠ.Flags.error("Gradesheet Updating Error", e) :
                                                ಠ_ಠ.Flags.log("Gradesheet Update Cancelled"))
                                        .then(ಠ_ಠ.Main.busy(true, true, FN.events.gradesheet.progress, "Updating Gradesheet"))
                                        .then(() => ಱ.notify.failure("Not Implemented", "Gradesheet functionality not yet complete!", 5000))
                          },
                          
                        }
                        
                      }
                      
                    }

                  },

                }
              },

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
                    keys: ["ctrl+alt+u", "ctrl+alt+U"],
                    fn: () => FN.usage.generate(true)
                      .then(() => ಠ_ಠ.Display.state().enter(FN.states.overview.usage)),
                  },

                }
              },

              engagement: {
                matches: /ENGAGEMENT/i,
                state: FN.states.overview.in,
                length: 0,
                keys: ["e", "E"],
                requires: "d3",
                scopes: [
                  "https://www.googleapis.com/auth/classroom.announcements.readonly",
                  "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
                ],
                fn: () => {
                  var _button = $("[role='button'][data-busy='engagement']").addClass("loader");
                  return FN.engagement.generate()
                    .then(() => {
                      _button.removeClass("loader");
                      ಠ_ಠ.Display.state().enter(FN.states.overview.engagement);
                    });
                },

                routes: {

                  force: {
                    matches: /FORCE/i,
                    length: 0,
                    requires: "d3",
                    scopes: [
                      "https://www.googleapis.com/auth/classroom.announcements.readonly",
                      "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
                    ],
                    keys: ["ctrl+alt+e", "ctrl+alt+E"],
                    fn: () => FN.engagement.generate(true)
                      .then(() => ಠ_ಠ.Display.state().enter(FN.states.overview.engagement)),
                  },

                }
              },

              students: {
                matches: /STUDENTS/i,
                state: [FN.states.overview.in, FN.states.overview.engagement],
                all: true,
                length: 0,
                keys: ["s", "S"],
                fn: () => FN.view.students(),
                
              },
              
              student: {
                matches: /STUDENT/i,
                state: FN.states.overview.students,
                length: 1,
                fn: command => FN.view.student(command),
              },
              
            }

          },

          export: {
            
            matches: /EXPORT/i,
            state: FN.states.view,
            routes: {

              sheets: {
                matches: /SHEETS/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "sheets", FN.export.file(), FN.export.table(), "NOTIFY_EXPORT_VIEW_SUCCESS")
              },

              excel: {
                matches: /EXCEL/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "xlsx", FN.export.file(), FN.export.table())
              },

              csv: {
                matches: /CSV/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "csv", FN.export.file())
              },

              markdown: {
                matches: /MARKDOWN/i,
                length: 0,
                fn: () => ಱ.exporter.export(ರ‿ರ.table, "md", FN.export.file())
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
                fn: () => FN.roster.add.students(FN.current.classes())
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
                fn: () => FN.roster.add.teachers(FN.current.classes())
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
                fn: () => FN.roster.invite.students(FN.current.classes())
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
                fn: () => FN.roster.invite.teachers(FN.current.classes())
                  .then(results => (ಠ_ಠ.Flags.log("Teacher Invitations", results),
                    _.each(results, result => result && (result = _.compact(result)).length > 0 && result[0].courseId ?
                      FN.usage.update(result[0].courseId, true, "invitations") : null)))
              },

            }

          },

          remove: {
            matches: /REMOVE/i,
            state: [FN.states.overview.in, FN.states.classwork.in, FN.states.overview.students, FN.states.overview.student],
            length: 1,
            fn: command => {
              ರ‿ರ.table.table().find(`tr[data-id='${command}']`).remove();
              ಠ_ಠ.Display.tidy();
              ಠ_ಠ.Display.state().in(FN.states.overview.in) ? FN.overview.remove(command) :
                ಠ_ಠ.Display.state().in(FN.states.classwork.in) ? FN.classwork.remove(command) : 
                ಠ_ಠ.Display.state().in(FN.states.overview.students) ? FN.students.remove(command) : 
                ಠ_ಠ.Display.state().in(FN.states.overview.student) ? FN.student.remove(command) : false;
            },
            routes: {

              student: {
                matches: /STUDENT/i,
                state: [FN.states.overview.students, FN.states.overview.in],
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
                fn: () => FN.roster.remove.students(FN.current.classes())
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
                fn: () => FN.roster.remove.teachers(FN.current.classes())
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

          data: {
            matches: /DATA/i,
            state: "authenticated",

            routes: {
              
              load: {
                matches: /LOAD/i,
                length: 0,
                scopes: [
                  "https://www.googleapis.com/auth/drive.file",
                ],
                requires: "google",
                fn: () => FN.files.load().then(FN.view.table)
              },
              
              save: {
                matches: /SAVE/i,
                length: 0,
                scopes: [
                  "https://www.googleapis.com/auth/drive.file",
                ],
                requires: [
                  "google",
                  "filesaver"
                ],
                fn: () => FN.files.save()  
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

    start: FN.setup.initial,

    ready: FN.setup.session,

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,

    persistent: ಱ,

  };

};