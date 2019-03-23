Google_Sheets_Notation = () => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Notation --> */

  /* === Internal Visibility === */

  /* <!-- Internal Constants --> */
  const NOTATIONS = {
    A1: /^([A-Z]+)(\d+)$/,
    R1: /^R([1-9]\d*)$/,
    R1C1: /^R([1-9]\d*)C([1-9]\d*)$/,
    C1: /^C([1-9]\d*)$/
  }, RANGE = ":";
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
  
  var _range = (reference, convert) => {
      if (reference && reference.indexOf(RANGE) > 0) {
        reference = [
          (convert ? convert : _convert)(reference.split(RANGE)[0]),
          (convert ? convert : _convert)(reference.split(RANGE)[1])
        ].join(RANGE);
      }
      return reference;
    };
  
  var _grid = (start_Row, end_Row, start_Col, end_Col, zero) => {
    var i = zero ? 1 : 0;
    return _range(`R${start_Row + i}C${start_Col + i}:R${end_Row + i}C${end_Col + i}`, _convertR1C1);
  };
  /* <!-- Internal Functions --> */

  /* === Internal Visibility === */

  /* === External Visibility === */
  return {

    grid: _grid,
    
    range: _range,
    
    rangeA1: reference => _range(reference, _convertA1),
    
		rangeR1C1: reference => _range(reference, _convertR1C1),
    
    convert: _convert,

    convertA1: reference => NOTATIONS.A1.test(reference) ? _convertA1(reference) : reference,

    convertR1C1: reference => NOTATIONS.R1C1.test(reference) || NOTATIONS.R1.test(reference) || NOTATIONS.C1.test(reference) ? _convertR1C1(reference) : reference

  };
  /* === External Visibility === */
};