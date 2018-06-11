Google_Sheets_Notation = () => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Notation --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.sheet: ID of the sheet to target (tab ID, not spreadsheet ID)  --> */
  /* <!-- @options.visibility: Metadata visibility (if none supplied in the function call, defaults to DOCUMENT) --> */
  /* <!-- @factory.Google_Sheets_Grid: Function to create a grid helper object --> */
  /* <!-- REQUIRES: Global Scope: Underscore --> */

  /* === Internal Visibility === */

  /* <!-- Internal Constants --> */
  const NOTATIONS = {
    A1: /^([A-Z]+)(\d+)$/,
    R1: /^R([1-9]\d*)$/,
    R1C1: /^R([1-9]\d*)C([1-9]\d*)$/,
    C1: /^C([1-9]\d*)$/
  };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _split = (notation, reference) => reference.replace(notation, "$1,$2").split(",");

  var _convertR1C1 = reference => {
    var _match = NOTATIONS.R1.test(reference) ? NOTATIONS.R1 : NOTATIONS.C1.test(reference) ? NOTATIONS.C1 : NOTATIONS.R1C1,
      _parts = _split(_match, reference),
      _row = "",
      _col, _column = "";

    if (_match == NOTATIONS.R1) {
      _row = _parts[0];
    } else if (_match == NOTATIONS.C1) {
      _col = _parts[0];
    } else {
      _row = _parts[0];
      _col = _parts[1];
    }
    if (_col !== undefined && _col !== null)
      for (; _col; _col = Math.floor((_col - 1) / 26)) _column = String.fromCharCode(((_col - 1) % 26) + 65) + _column;
    return `${_column}${_row}`;
  };

  var _convertA1 = reference => {
    var _parts = _split(NOTATIONS.A1, reference),
      _col = _parts[0],
      _row = _parts[1],
      _column = 0;
    for (var i = 0; i < _col.length; i++) _column = 26 * _column + _col.charCodeAt(i) - 64;
    return `R${_row}C${_column}`;
  };

  var _convert = reference => NOTATIONS.R1C1.test(reference) ?
    _convertR1C1(reference) : NOTATIONS.A1.test(reference) ?
    _convertA1(reference) : reference;
  /* <!-- Internal Functions --> */

  /* === Internal Visibility === */

  /* === External Visibility === */
  return {

    convert: _convert,

    convertA1: reference => NOTATIONS.A1.test(reference) ? _convertA1(reference) : reference,

    convertR1C1: reference => NOTATIONS.R1C1.test(reference) || NOTATIONS.R1.test(reference) || NOTATIONS.C1.test(reference) ? _convertR1C1(reference) : reference

  };
  /* === External Visibility === */
};