Portfolio = (tracker, options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to display and show evidence --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    id : "portfolio"
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
    
    evidence : tracker => {
      factory.Flags.log("LOADED PORTFOLIO", tracker);

      return true;  
    },
    
  };
  
  FN.state = () => ರ‿ರ;
  /* <!-- Display Functions --> */
  
  /* <!-- Main Functions --> */
  
  /* <!-- Main Functions --> */

  /* <!-- Initial Run --> */
  ರ‿ರ.table = FN.display.evidence(tracker);
  /* <!-- Initial Run --> */

  /* <!-- External Visibility --> */
  return {
    
    state: FN.state,
    
  };
  /* <!-- External Visibility --> */

};