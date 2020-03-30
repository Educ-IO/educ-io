Tracking = (tracker, options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to display and show tracking --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
          id : "tracking"
        }, 
        FN = {},
        DB = new loki("tracking.db"),
        HIDDEN = ["Count"];
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal State Variable --> */
  var ರ‿ರ = {};
  /* <!-- Internal State Variable --> */
  
  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Generate Functions --> */
  FN.data = () => {
    
    var _data = DB.addCollection(options.id, {
      unique: ["id"],
      indices: _.map(([], a => a)
        .concat(_.map("fields", field => field.title || field.id)),
        index => index.toLowerCase())
    });

    _data.clear({
      removeIndices: true
    });

    _data.insert([]);

    return _data;

  };
  /* <!-- Generate Functions --> */
  
  /* <!-- Display Functions --> */
  FN.display = {
    
    body: element => factory.Display.template.show({
        template: "tracker_body",
        classes: ["pt-2"],
        target: element || factory.container,
        clear: true
      }),
    
    wrapper: () => ({
      classes: ["pt-1", "scroller"],
      id: options.id,
      header: factory.Display.template.get("tracker_header")({
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: "Tracking",
        subtitle: tracker.name || tracker.scale.name
      }).trim()
    }),
    
    tracking : tracker => {
      
      return factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: [] || tracker, /* <!-- TODO: Remove this! --> */
          headers: options.state.application.tabulate.headers([], HIDDEN),
        }, {
          classes: ["table-hover"],
          collapsed: true,
          wrapper: FN.display.wrapper(),
        }, FN.display.body());
    },
    
  };
  /* <!-- Display Functions --> */
  
  /* <!-- Main Functions --> */
  
  /* <!-- Main Functions --> */

  /* <!-- Initial Run --> */
  ರ‿ರ.table = FN.display.tracking(tracker);
  /* <!-- Initial Run --> */

  /* <!-- External Visibility --> */
  return {
    
  };
  /* <!-- External Visibility --> */

};