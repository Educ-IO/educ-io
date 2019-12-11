Google_Sheets_Properties = options => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Properties --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- REQUIRES: Global Scope: Underscore --> */

  /* <!-- Internal Visibility --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    sheet: 0,
  };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _grid = {

    frozen: {

      rows: count => ({
        "frozenRowCount": count
      }),

      columns: count => ({
        "frozenColumnCount": count
      }),

    }

  };

  var _update = grids => ({
    "updateSheetProperties": {
      "properties": {
        "sheetId": options.sheet,
        "gridProperties": _.extend.apply(null, grids),
      },
      "fields": `${_.reduce(grids, (a, f) => `${a}${a?",":""}gridProperties.${_.keys(f)[0]}`,"")}`
    }
  });
  /* <!-- Internal Functions --> */

  /* <!-- Internal Visibility --> */

  /* <!-- External Visibility --> */
  return {

    grid: _grid,

    update: _update,

  };
  /* <!-- External Visibility --> */
};