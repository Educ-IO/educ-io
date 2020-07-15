Google_Sheets_Format = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides an helper set of functions for dealing with Google Sheets Formats --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @factory.Colours: Function to create a colours helper object --> */
  /* <!-- REQUIRES: Global Scope: Underscore --> */

  /* <!-- Internal Visibility --> */

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

  var _autofill = (range, alternate) => ({
    "autoFill": {
      "useAlternateSeries": !!alternate,
      "range": range
    }
  });

  /* <!-- Border Types can be: DOTTED | DASHED | SOLID | SOLID_MEDIUM | SOLID_THICK | NONE | DOUBLE --> */
  var _border = (type, colour) => ({
    "style": type || "SOLID",
    "color": _colour.single.apply(null, _parseColour(colour || "black")),
  });
  
  var _borders = (top, bottom, left, right) => ({
    "borders" : _.extend({}, 
      top ? {"top": top} : {},
      bottom ? {"bottom": bottom} : {},
      left ? {"left": left} : {},
      right ? {"right": right} : {})
  });
      
  var _text = (colour, size, bold, italic, rotate) => _.extend({
    "textFormat": _.extend(
      colour ? _foreground(colour) : {},
      size ? {
        "fontSize" : size
      } : {},
      bold ? {
        "bold" : true
      } : {},
      italic ? {
        "italic" : true
      } : {}
    )
  }, rotate !== null && rotate !== undefined ? rotate === true ? {
        "textRotation" : {
          "vertical" : true
        },
      } : {
        "textRotation" : {
          "angle": rotate
        }
      } : {});

  var _wrap = strategy => ({
    "wrapStrategy": strategy.toUpperCase()
  });
  
  var _cells = (range, formats) => ({
    "repeatCell": {
      "range": range,
      "cell": {
        "userEnteredFormat": (formats = _.extend.apply(null, formats)),
      },
      "fields": `userEnteredFormat(${_.reduce(_.keys(formats), (a, f) => `${a}${a?",":""}${f}`,"")})`
    }
  });
  
  var _update = range => ({
    
    borders : (top, bottom, left, right, innerHorizontal, innerVertical) => ({
      "updateBorders": _.extend({
        "range": range
      },
      top ? {"top": top} : {},
      bottom ? {"bottom": bottom} : {},
      left ? {"left": left} : {},
      right ? {"right": right} : {},
      innerHorizontal ? {"innerHorizontal" : innerHorizontal} : {},
      innerVertical ? {"innerVertical" : innerVertical} : {})
    }),

  });
  
  var _merge = range => ({
    "mergeCells": {
      "range": range,
      "mergeType": "MERGE_ALL",
    }
  });
  
  var _dimension = dimension => ({
    "updateDimensionProperties": dimension
  });
  
  var _delete = dimension => ({
    "deleteDimension": {
       "range": dimension,
    }
  });
    
  var _autosize = dimension => ({
    "autoResizeDimensions": {
      "dimensions" : dimension 
    }
  });
  
  var _visibility = hide => range => _dimension({
      "range": range,
      "properties": {
        "hiddenByUser": !!hide,
      },
      "fields": "hiddenByUser",
  });
  
  var _value = value => ({
    "userEnteredValue": value
  });
  
  var _conditional = (ranges, index) => {
  
    var _generic = body => ({
          "addConditionalFormatRule": {
            rule: _.extend({
              ranges : _.isArray(ranges) ? ranges : [ranges],
            }, body),
            index: index || 0
          }
        }),
        /* <!-- Type = MIN | MAX | NUMBER | PERCENT | PERCENTILE --> */
        _point = (colour, type, value) => _.extend({
          "color" : _colour.single.apply(null, _parseColour(colour || "white")),
          "type" : type || "MIN",
        }, value !== undefined && value !== null ? {
          "value" : value.toString ? value.toString() : value,
        } : {}),
        _value = property => (value, fallback) => value && value[property] ? value[property] : fallback,
        _getColour = _value("colour"),
        _getType = _value("type"),
        _getValue = _value("value");
    
    return {
    
      /* <!-- Type = See https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/other#ConditionType --> */
      /* <!-- TODO: Parse Format and Values --> */
      boolean : (type, values, format) => _generic({
        booleanRule : {
          "condition" : {
            "type" : type,
            "values" : values ? _.isArray(values) ? values : [values] : null,
          },
          "format" : format  
        }
      }),

      gradient : (min, mid, max) => _generic({
        "gradientRule": {
          "minpoint": _point(_getColour(min, "mediumlightred"), _getType(min, "MIN"), _getValue(min)),
          "midpoint": _point(_getColour(mid, "white"), _getType(mid, "PERCENTILE"), _getValue(mid, 50)),
          "maxpoint": _point(_getColour(max, "mediumlightgreen"), _getType(max, "MAX"), _getValue(max)),
        }
      }),

    };
  };
  
  /* <!-- Type: TEXT, NUMBER, PERCENT, CURRENCY, DATE, TIME, DATE_TIME, SCIENTIFIC --> */
  /* <!-- See: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets/cells#NumberFormat --> */
  var _type = (type, pattern) => ({
    "numberFormat": _.extend({
      "type": type,
    }, pattern ? {
      "pattern" : pattern
    } : {})
  });
  /* <!-- Internal Functions --> */

  /* <!-- Internal Visibility --> */

  /* <!-- External Visibility --> */
  return {

    align : _align,
    
    autosize : _autosize,
    
    autofill : _autofill,

    colour : value => _colour.single.apply(null, _parseColour(value)),
    
    conditional : _conditional,
    
    delete : _delete,
    
    foreground : _foreground,

    background : _background,

    text : _text,

    cells : _cells,

    merge : _merge,
    
    wrap : _wrap,
    
    dimension : _dimension,
    
    hide :  _visibility(true),
    
    show :  _visibility(false),
    
    borders : _borders,
    
    border : _border,
    
    update : _update,
    
    type : _type,
    
    value : _value
    
  };
  /* <!-- External Visibility --> */
};