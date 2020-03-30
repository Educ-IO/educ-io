Overview = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id : "overview",
      format: "Do MMM",
    },
    FN = {},
    HIDDEN = ["ID", "Calendar", "State", "Guardians", "Room", "Updated", "Students", "Code", "Folder"];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Render Functions --> */
  FN.render = {
    
    body: element => factory.Display.template.show({
        template: "overview_body",
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
        subtitle: factory.Dates.parse(options.state.session.current).format(options.format)
      }).trim()
    }),
    
    classes: classes => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: options.functions.populate.classes(classes),
          headers: options.state.application.tabulate.headers(
            ["ID", "Calendar", "State", "Name", "Section", "Guardians", "Room", "Updated", "Created",
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
  FN.display = () => options.functions.classes.all()
    .then(options.functions.people.teachers)
    .then(classrooms => {
      factory.Flags.log("Loaded CLASSES", classrooms);
      return (ರ‿ರ.table = FN.render.classes(classrooms));
    });
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    display: FN.display,
    
    remove: id => {
      options.functions.populate.remove(id);
      $(`table tr[data-id='${id}']`).remove();
      factory.Display.tidy();
    },
    
    table: () => ರ‿ರ.table,
    
    update: () => ರ‿ರ.table ? ರ‿ರ.table.update() : false,
    
  };
  /* <!-- External Visibility --> */

};