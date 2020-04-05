Overview = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id : "overview",
      format: "Do MMM, YYYY",
    },
    FN = {},
    HIDDEN = ["ID", "Calendar", "State", "Fetched", "Guardians", "Room", "Updated", "Students", "Code", "Folder"];
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
          factory.Display.doc.get("OVERVIEW_CLASSES_SUBTITLE", 
            humanizeDuration(factory.Dates.parse(options.state.session.current) - ರ‿ರ.since, {largest: 1}), true) : null,
        details: factory.Display.doc.get({
          name: "OVERVIEW_DETAILS",
          data: {
            since: ರ‿ರ.since.format(options.format),
            current: factory.Dates.parse(options.state.session.current).format(options.format),
          }
        }),
      }).trim()
    }),
    
    classes: classes => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: options.functions.populate.classes(classes),
          headers: options.state.application.tabulate.headers(
            ["ID", "Calendar", "State", "Name", "Fetched", "Section", "Guardians", "Room", "Updated", "Created",
             "Teachers", "Students", "Code", "Usage", "Folder", "Owner"], HIDDEN),
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
  FN.display = since => options.functions.classes.all(since)
    .then(options.functions.people.teachers)
    .then(classrooms => {
      factory.Flags.log("Loaded CLASSES", classrooms);
      since ? ರ‿ರ.since = factory.Dates.parse(since) : delete ರ‿ರ.since;
      return (ರ‿ರ.table = FN.render.classes(classrooms));
    });
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    display: FN.display,
    
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
    
  };
  /* <!-- External Visibility --> */

};