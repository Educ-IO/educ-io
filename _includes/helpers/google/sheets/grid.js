Google_Sheets_Grid = options => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Grids --> */
  /* <!-- PARAMETERS: Options (see below) --> */
  /* <!-- @options.sheet: ID of the sheet to target (tab ID, not spreadsheet ID, defaults to 0)  --> */
  /* <!-- REQUIRES: Global Scope: Underscore --> */

  /* <!-- Internal Visibility --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    sheet: 0
  };
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _rows = (start_Row, end_Row) => ({
    "sheetId": options.sheet,
    "startRowIndex": start_Row,
    "endRowIndex": end_Row,
  });

  var _columns = (start_Col, end_Col) => ({
    "sheetId": options.sheet,
    "startColumnIndex": start_Col,
    "endColumnIndex": end_Col,
  });

  var _range = (start_Row, end_Row, start_Col, end_Col) => ({
    "sheetId": options.sheet,
    "startRowIndex": start_Row,
    "endRowIndex": end_Row,
    "startColumnIndex": start_Col,
    "endColumnIndex": end_Col,
  });

  var _dimension = (dimension, start, end) => {
    var _return = {
      "sheetId": options.sheet,
      "dimension": dimension,
      "startIndex": start,
    };
    if (end != null && end !== undefined) _return.endIndex = end;
    return _return;
  };
  /* <!-- Internal Functions --> */

  /* <!-- Internal Visibility --> */

  /* <!-- External Visibility --> */
  return {

    columns: (start, end) => ({

      dimension: width => width !== null && width !== undefined ? ({
        "range": _dimension("COLUMNS", start, end),
        "properties": {
          "pixelSize": width,
        },
        "fields": "pixelSize"
      }) : _dimension("COLUMNS", start, end),

      range: () => _columns(start, end),

    }),

    dimension: _dimension,

    range: _range,

    rows: (start, end) => ({

      dimension: height => height !== null && height !== undefined ? ({
        "range": _dimension("ROWS", start, end),
        "properties": {
          "pixelSize": height,
        },
        "fields": "pixelSize"
      }) : _dimension("ROWS", start, end),

      range: () => _rows(start, end),

    }),

    sheet: () => options.sheet,

  };
  /* <!-- External Visibility --> */
};