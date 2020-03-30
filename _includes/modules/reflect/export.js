Export = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.report = () => {
    var _exporting = options.functions.action.dehydrate();
    try {
      saveAs(new Blob([JSON.stringify(_exporting.data, options.functions.replacers.regex, 2)], {
        type: options.functions.files.type.report
      }), _exporting.name);
    } catch (e) {
      factory.Flags.error("Report Export", e);
    }
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};