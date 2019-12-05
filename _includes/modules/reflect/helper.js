Helper = (options, factory) => {
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
  FN.span = dates => {
    var _today = factory.Dates.now(),
      _past = _today.clone();
      _past = dates.span == "AY" ?
        _past.month() > 8 ?
        _past.month(8).startOf("month") :
        _past.subtract(1, "year").month(8).startOf("month") :
        _past.subtract(1, dates.span);
    
    dates.from = _past.startOf("day");
    dates.to = _today.endOf("day");
    return dates;
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    span : FN.span,
    
    
  };
  /* <!-- External Visibility --> */

};