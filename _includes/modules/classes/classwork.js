Classwork = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id : "classwork",
      format: "Do MMM",
    },
    FN = {},
    HIDDEN = ["ID", "Type", "Mode", "Description", "Updated", "Points"];
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
        title: "Classwork",
        subtitle: factory.Dates.parse(options.state.session.current).format(options.format)
      }).trim()
    }),
    
    classwork: classwork => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: options.functions.populate.classwork(classwork),
          headers: options.state.application.tabulate.headers(
            ["ID", "Type", "Mode", "Class", "Title", "Description", "Updated", "Created", "Due", "Points", "Responses", "Creator"], HIDDEN),
        }, {
          classes: ["table-hover"],
          advanced: false,
          collapsed: true,
          removable: true,
          removable_message: "Remove this piece of Classwork from the View",
          wrapper: FN.render.wrapper(),
          complex: true,
        }, FN.render.body()),
    
  };
  /* <!-- Render Functions --> */
  
  /* <!-- Public Functions --> */
  FN.display = classrooms => {
    var processed = 0;
    return Promise.all(_.map(classrooms, classroom => options.functions.classes.work(classroom, true).then(work => (
            factory.Main.event(options.functions.events.load.progress, 
                               factory.Main.message(processed += 1, "class", "classes", "processed")), work))))
    .then(classworks => _.reduce(classworks, (memo, classwork, index) => _.reduce(classwork, (memo, work) => {
      memo.push(_.extend(work, {
        $parent: classrooms[index].$id,
        $class: classrooms[index].name,
        $populated: {
          self: factory.Dates.now(),
        },
        class: {
          text: classrooms[index].name,
          title: classrooms[index].id.title,
          url: classrooms[index].id.url,
        }}));
      return memo;
    }, memo), []))
    .then(classwork => {
      factory.Flags.log("Loaded CLASSWORK", classwork);
      return (ರ‿ರ.table = FN.render.classwork(classwork));
    });
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    display: FN.display,
    
    remove: id => options.functions.populate.remove(id, "classwork"),
    
    table: () => ರ‿ರ.table,
    
  };
  /* <!-- External Visibility --> */

};