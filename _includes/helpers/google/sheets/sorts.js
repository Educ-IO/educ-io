Google_Sheets_Sorts = options => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Sorts --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- REQUIRES: Global Scope: Underscore --> */

  /* <!-- Internal Visibility --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    order: "ASCENDING",
    /* <!-- Dimension is zero-indexed in range --> */   
    dimension: 0,
  };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _spec = spec => _.extend({
        /* <!-- ASCENDING | DESCENDING --> */
        "sortOrder": spec.order || options.order,
        "dimensionIndex": _.isNumber(spec) ? spec : (spec.dimension || options.dimension)
      },
       /* <!-- Colour formatted from format.foreground | format.background --> */                           
      spec.colour ? spec.colour : {});
  
  var _range = (range, specs) => ({
    "sortRange": {
      "range": range,
      "sortSpecs": _.map(_.isArray(specs) ? specs : [specs], _spec)
    }
  });
  /* <!-- Internal Functions --> */

  /* <!-- Internal Visibility --> */

  /* <!-- External Visibility --> */
  return {

    range: _range,

  };
  /* <!-- External Visibility --> */
};