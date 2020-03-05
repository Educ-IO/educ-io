Tracking = (tracker, options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to display and show tracking --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    id : "tracking"
  }, FN = {};
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal State Variable --> */
  var ರ‿ರ = {};
  /* <!-- Internal State Variable --> */
  
  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Display Functions --> */
  FN.display = {
    
    tracking : tracker => {
      factory.Display.template.show({
        template: "analyse_body",
        classes: ["pt-2"],
        target: factory.container,
        clear: true
      });
      factory.Flags.log("LOADING TRACKING", tracker);
      return true;  
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