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
    HIDDEN = ["ID", "Type", "Mode", "Fetched", "Description", "Updated", "Points"];
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
        subtitle: ರ‿ರ.since ? 
          factory.Display.doc.get("OVERVIEW_CLASSWORK_SUBTITLE", 
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
    
    classwork: classwork => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: options.functions.populate.classwork(classwork),
          headers: options.state.application.tabulate.headers(
            ["ID", "Type", "Mode", "Class", "Fetched", "Title", "Description", "Updated", "Created", "Due", "Points", "Submissions", "Creator"],
            HIDDEN),
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
  FN.display = (classrooms, since) => {
    var processed = 0,
        loaded = factory.Dates.now().toISOString();
    return Promise.all(_.map(ರ‿ರ.classrooms = classrooms, classroom => options.functions.classes.work(classroom, true).then(work => (
            factory.Main.event(options.functions.events.load.progress, 
                               factory.Main.message(processed += 1, "class", "classes", "processed")), work))))
    .then(classworks => _.reduce(classworks, (memo, classwork, index) => _.reduce(classwork, (memo, work) => {
      memo.push(_.extend(work, {
        $parent: classrooms[index].$id,
        $class: classrooms[index].name,
        $$fetched: loaded,
        fetched: {
          self: loaded,
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
      since ? ರ‿ರ.since = factory.Dates.parse(since) : delete ರ‿ರ.since;
      return (ರ‿ರ.table = FN.render.classwork(classwork));
    });
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    display: FN.display,
    
    refresh: () => FN.display(ರ‿ರ.classrooms, ರ‿ರ.since ? ರ‿ರ.since.toISOString() : null),
    
    remove: id => options.functions.populate.remove(id, "classwork"),
    
    table: () => ರ‿ರ.table,
    
  };
  /* <!-- External Visibility --> */

};