Overview = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id : "overview",
      format: "Do MMM, YYYY",
      forever: "The start of time",
    },
    FN = {},
    HIDDEN = ["ID", "Calendar", "State", "Fetched", "Description", "Guardians", "Room", "Updated", "Students", "Code", "Folder"];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.id = () => `${options.id}_container`;
  /* <!-- Internal Functions --> */
  
  /* <!-- Render Functions --> */
  FN.render = {
    
    body: element => ರ‿ರ.body = factory.Display.template.show({
        template: "overview_body",
        id: FN.id(),
        classes: ["pt-2"],
        target: element || factory.container,
        clear: true
      }),
    
    wrapper: () => ({
      classes: ["pt-1", "scroller"],
      id: options.id,
      header: factory.Display.template.get("overview_header")({
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: "Overview",
        subtitle: ರ‿ರ.since ? 
          factory.Display.doc.get("CLASSES_SUBTITLE", 
            humanizeDuration(factory.Dates.parse(options.state.session.current) - ರ‿ರ.since, {largest: 1}), true) : null,
        details: ರ‿ರ.since ? factory.Display.doc.get({
          name: "VIEW_DETAILS",
          data: {
            since: ರ‿ರ.since ? ರ‿ರ.since.format(options.format) : options.forever,
            current: factory.Dates.parse(options.state.session.current).format(options.format),
          }
        }) : null,
        students: factory.Display.doc.get("STUDENTS_TITLE"),
        report: factory.Display.doc.get("REPORT_TITLE"),
        limited: factory.Display.doc.get("USAGE_LIMITED_TITLE"),
        force: factory.Display.doc.get("USAGE_FORCE_TITLE")
      }).trim()
    }),
    
    classes: data => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: data,
          headers: options.state.application.tabulate.headers(
            ["ID", "Calendar", "State", "Name", "Fetched", "Section", "Description", "Guardians", "Room", "Updated", "Created", "Teachers", "Students", "Code",
             {
               name : "__Usage",
               display : "Usage",
               export : "Usage",
               shortcut : "u",
               help : factory.Display.doc.get("OVERVIEW_USAGE_HEADER", null, true)
             },
             {
               name : "Engagement",
               shortcut : "e",
               help : factory.Display.doc.get("OVERVIEW_ENGAGEMENT_HEADER", null, true)
             }, "Folder", "Owner"], HIDDEN),
        }, {
          classes: ["table-hover"],
          advanced: false,
          collapsed: true,
          removable: true,
          removable_message: "Remove this Classroom from the Overview",
          wrapper: FN.render.wrapper(),
          complex: true,
        }, FN.render.body()),
    
  };
  /* <!-- Render Functions --> */
  
  /* <!-- Public Functions --> */
  FN.display = (since, status, limit, selected, teacher, student) => options.functions.classes.all(since, status, limit, teacher, student, selected)
    .then(options.functions.people.teachers)
    .then(classrooms => {
      factory.Flags.log("Loaded CLASSES", classrooms);
      since ? ರ‿ರ.since = factory.Dates.parse(since) : delete ರ‿ರ.since;
      return (ರ‿ರ.table = FN.render.classes(options.functions.populate.classes(classrooms)));
    });
  
  FN.show = () => ರ‿ರ.table = FN.render.classes(options.functions.populate.all());
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    display: FN.display,
    
    show: FN.show,
    
    refresh: () => FN.display(ರ‿ರ.since ? ರ‿ರ.since.toISOString() : null),
    
    remove: id => options.functions.populate.remove(id),
    
    table: () => ರ‿ರ.table,
    
    detach: () => {
      ರ‿ರ.body.detach();
      return Promise.resolve(ರ‿ರ.table);
    },
    
    attach: element => {
      (element || factory.container).empty().append(ರ‿ರ.body);
      return Promise.resolve(ರ‿ರ.table);
    },
    
    since: (since, force) => (since || force ? ರ‿ರ.since = _.isString(since) ? factory.Dates.parse(since) : since : ರ‿ರ.since) ? ರ‿ರ.since.toISOString() : null,
    
  };
  /* <!-- External Visibility --> */

};