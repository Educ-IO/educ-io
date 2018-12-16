Google_Sheets_Format = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Formats --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @factory.Colours: Function to create a colours helper object --> */
  /* <!-- REQUIRES: Global Scope: Underscore --> */

  /* === Internal Visibility === */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  var _colours = factory.Colours(),
      _parseColour = value => _colours.convert(_colours.parse(value));
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _colour = {

    single: (red, green, blue) => ({
        "red": red === null ? 0.0 : red,
        "green": green === null ? 0.0 : green,
        "blue": blue === null ? 0.0 : blue,
      }),
    
    back: (red, green, blue) => _colour.any(red, green, blue, "backgroundColor"),

    fore: (red, green, blue) => _colour.any(red, green, blue, "foregroundColor"),

    any: (red, green, blue, type) => {
      var _return = {};
      _return[type ? type : "backgroundColor"] = _colour.single(red, green, blue);
      return _return;
    },
  };

  var _foreground = value => _colour.fore.apply(null, _parseColour(value));

  var _background = value => _colour.back.apply(null, _parseColour(value));

  var _align = {

    horizontal: orientation => ({
      "horizontalAlignment": orientation.toUpperCase()
    }),

    vertical: orientation => ({
      "verticalAlignment": orientation.toUpperCase()
    }),

  };

  var _text = (colour, size, bold, italic) => ({
    "textFormat": _.extend(
      colour ? _foreground(colour) : {},
      size ? {
        "fontSize": size
      } : {},
      bold ? {
        "bold": true
      } : {},
      italic ? {
        "italic": true
      } : {}
    )
  });

  var _wrap = strategy => ({
    "wrapStrategy": strategy.toUpperCase()
  });
  
  var _cells = (range, formats) => ({
    "repeatCell": {
      "range": range,
      "cell": {
        "userEnteredFormat": _.extend.apply(null, formats),
      },
      "fields": `userEnteredFormat(${_.reduce(formats, (a, f) => `${a}${a?",":""}${_.keys(f)[0]}`,"")})`
    }
  });
  /* <!-- Internal Functions --> */

  /* === Internal Visibility === */

  /* === External Visibility === */
  return {

    align: _align,

    colour: value => _colour.single.apply(null, _parseColour(value)),
    
    foreground: _foreground,

    background: _background,

    text: _text,

    cells: _cells,

    wrap: _wrap,
    
  };
  /* === External Visibility === */
};