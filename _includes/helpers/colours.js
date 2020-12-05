Colours = options => {
  "use strict";

  /* <!-- HELPER: Provides colour helper methods --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.default: Default Colour ([R,G,B] Array, CSS Colour String or Name) [Optional] --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      default: [0, 0, 0]
    },
    NAMED_COLOURS = {
      "ALICEBLUE": "#F0F8FF",
      "ANTIQUEWHITE": "#FAEBD7",
      "AQUA": "#00FFFF",
      "AQUAMARINE": "#7FFFD4",
      "AZURE": "#F0FFFF",
      "BEIGE": "#F5F5DC",
      "BISQUE": "#FFE4C4",
      "BLACK": "#000000",
      "BLANCHEDALMOND": "#FFEBCD",
      "BLUE": "#0000FF",
      "BLUEVIOLET": "#8A2BE2",
      "BROWN": "#A52A2A",
      "BURLYWOOD": "#DEB887",
      "CADETBLUE": "#5F9EA0",
      "CHARTREUSE": "#7FFF00",
      "CHOCOLATE": "#D2691E",
      "CORAL": "#FF7F50",
      "CORNFLOWERBLUE": "#6495ED",
      "CORNSILK": "#FFF8DC",
      "CRIMSON": "#DC143C",
      "CYAN": "#00FFFF",
      "DARKBLUE": "#00008B",
      "DARKCYAN": "#008B8B",
      "DARKGOLDENROD": "#B8860B",
      "DARKGRAY": "#A9A9A9",
      "DARKGREY": "#A9A9A9",
      "DARKGREEN": "#006400",
      "DARKKHAKI": "#BDB76B",
      "DARKMAGENTA": "#8B008B",
      "DARKOLIVEGREEN": "#556B2F",
      "DARKORANGE": "#FF8C00",
      "DARKORCHID": "#9932CC",
      "DARKRED": "#8B0000",
      "DARKSALMON": "#E9967A",
      "DARKSEAGREEN": "#8FBC8F",
      "DARKSLATEBLUE": "#483D8B",
      "DARKSLATEGRAY": "#2F4F4F",
      "DARKSLATEGREY": "#2F4F4F",
      "DARKTURQUOISE": "#00CED1",
      "DARKVIOLET": "#9400D3",
      "DEEPPINK": "#FF1493",
      "DEEPSKYBLUE": "#00BFFF",
      "DIMGRAY": "#696969",
      "DIMGREY": "#696969",
      "DODGERBLUE": "#1E90FF",
      "FIREBRICK": "#B22222",
      "FLORALWHITE": "#FFFAF0",
      "FORESTGREEN": "#228B22",
      "FUCHSIA": "#FF00FF",
      "GAINSBORO": "#DCDCDC",
      "GHOSTWHITE": "#F8F8FF",
      "GOLD": "#FFD700",
      "GOLDENROD": "#DAA520",
      "GRAY": "#808080",
      "GREY": "#808080",
      "GREEN": "#008000",
      "GREENYELLOW": "#ADFF2F",
      "HONEYDEW": "#F0FFF0",
      "HOTPINK": "#FF69B4",
      "INDIANRED ": "#CD5C5C",
      "INDIGO ": "#4B0082",
      "IVORY": "#FFFFF0",
      "KHAKI": "#F0E68C",
      "LAVENDER": "#E6E6FA",
      "LAVENDERBLUSH": "#FFF0F5",
      "LAWNGREEN": "#7CFC00",
      "LEMONCHIFFON": "#FFFACD",
      "LIGHTBLUE": "#ADD8E6",
      "LIGHTCORAL": "#F08080",
      "LIGHTCYAN": "#E0FFFF",
      "LIGHTGOLDENRODYELLOW": "#FAFAD2",
      "LIGHTGRAY": "#D3D3D3",
      "LIGHTGREY": "#D3D3D3",
      "LIGHTERGRAY": "#D9D9D9",
      "LIGHTERGREY": "#D9D9D9",
      "LIGHTGREEN": "#90EE90",
      "LIGHTPINK": "#FFB6C1",
      "LIGHTHOTPINK": "#FD95FD",
      "LIGHTORANGE": "#ECD18A",
      "LIGHTRED": "#FFCCCB",
      "LIGHTSALMON": "#FFA07A",
      "LIGHTSEAGREEN": "#20B2AA",
      "LIGHTSKYBLUE": "#87CEFA",
      "LIGHTSLATEGRAY": "#778899",
      "LIGHTSLATEGREY": "#778899",
      "LIGHTSTEELBLUE": "#B0C4DE",
      "LIGHTYELLOW": "#FFFFE0",
      "LIME": "#00FF00",
      "LIMEGREEN": "#32CD32",
      "LINEN": "#FAF0E6",
      "MAGENTA": "#FF00FF",
      "MAROON": "#800000",
      "MEDIUMAQUAMARINE": "#66CDAA",
      "MEDIUMBLUE": "#0000CD",
      "MEDIUMORCHID": "#BA55D3",
      "MEDIUMPURPLE": "#9370DB",
      "MEDIUMSEAGREEN": "#3CB371",
      "MEDIUMSLATEBLUE": "#7B68EE",
      "MEDIUMSPRINGGREEN": "#00FA9A",
      "MEDIUMTURQUOISE": "#48D1CC",
      "MEDIUMVIOLETRED": "#C71585",
      "MEDIUMRED": "#E06666",
      "MEDIUMDARKRED": "#A23636",
      "MEDIUMLIGHTRED": "#E49D9D",
      "MEDIUMGREEN": "#6AA84F",
      "MEDIUMLIGHTGREEN": "#5FC75F",
      "MIDNIGHTBLUE": "#191970",
      "MEDIUMYELLOW": "#FFE599",
      "MEDIUMGRAY": "#B7B7B7",
      "MEDIUMGREY": "#B7B7B7",
      "MEDIUMDARKGRAY": "#999999",
      "MEDIUMDARKGREY": "#999999",
      "MINTCREAM": "#F5FFFA",
      "MISTYROSE": "#FFE4E1",
      "MOCCASIN": "#FFE4B5",
      "NAVAJOWHITE": "#FFDEAD",
      "NAVY": "#000080",
      "OLDLACE": "#FDF5E6",
      "OLIVE": "#808000",
      "OLIVEDRAB": "#6B8E23",
      "ORANGE": "#FFA500",
      "ORANGERED": "#FF4500",
      "ORCHID": "#DA70D6",
      "PALEGOLDENROD": "#EEE8AA",
      "PALEGREEN": "#98FB98",
      "PALETURQUOISE": "#AFEEEE",
      "PALEVIOLETRED": "#DB7093",
      "PAPAYAWHIP": "#FFEFD5",
      "PEACHPUFF": "#FFDAB9",
      "PERU": "#CD853F",
      "PINK": "#FFC0CB",
      "PLUM": "#DDA0DD",
      "POWDERBLUE": "#B0E0E6",
      "PURPLE": "#800080",
      "REBECCAPURPLE": "#663399",
      "RED": "#FF0000",
      "ROSYBROWN": "#BC8F8F",
      "ROYALBLUE": "#4169E1",
      "SADDLEBROWN": "#8B4513",
      "SALMON": "#FA8072",
      "SANDYBROWN": "#F4A460",
      "SEAGREEN": "#2E8B57",
      "SEASHELL": "#FFF5EE",
      "SIENNA": "#A0522D",
      "SILVER": "#C0C0C0",
      "SKYBLUE": "#87CEEB",
      "SLATEBLUE": "#6A5ACD",
      "SLATEGRAY": "#708090",
      "SLATEGREY": "#708090",
      "SNOW": "#FFFAFA",
      "SPRINGGREEN": "#00FF7F",
      "STEELBLUE": "#4682B4",
      "TAN": "#D2B48C",
      "TEAL": "#008080",
      "THISTLE": "#D8BFD8",
      "TOMATO": "#FF6347",
      "TURQUOISE": "#40E0D0",
      "VIOLET": "#EE82EE",
      "WHEAT": "#F5DEB3",
      "WHITE": "#FFFFFF",
      "WHITESMOKE": "#F5F5F5",
      "YELLOW": "#FFFF00",
      "YELLOWGREEN": "#9ACD32",
      "VERYLIGHTGREY": "#F3F3F3",
      "VERYLIGHTGRAY": "#F3F3F3",
      "VERYDARKGREY": "#525252",
      "VERYDARKGRAY": "#525252",
      "VERYLIGHTGREEN": "#C2E9C2",
      "VERYLIGHTBLUE": "#CCD9E4",
      "VERYLIGHTORANGE": "#F7ECCC",
      "ALMOSTBLACK": "#3A3A3A"
    };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _three = matches => {
    var match = matches[1];
    return [
      parseInt(match.charAt(0), 16) * 0x11,
      parseInt(match.charAt(1), 16) * 0x11,
      parseInt(match.charAt(2), 16) * 0x11
    ];
  };

  var _six = matches => {
    var match = matches[1];
    return [
      parseInt(match.substr(0, 2), 16),
      parseInt(match.substr(2, 2), 16),
      parseInt(match.substr(4, 2), 16)
    ];
  };

  var _hsl = value => {

    if (typeof value === "string") value = value.match(/(\d+(\.\d+)?)/g);

    var h = value[0] / 360,
      s = value[1] / 100,
      l = value[2] / 100,
      a = value[3] === undefined ? 1 : value[3],
      t1, t2, t3, rgb, val;

    if (s === 0) {
      val = Math.round(l * 255);
      rgb = [val, val, val, a];
    } else {
      if (l < 0.5)
        t2 = l * (1 + s);
      else
        t2 = l + s - l * s;
      t1 = 2 * l - t2;
      rgb = [0, 0, 0];
      for (var i = 0; i < 3; i++) {
        t3 = h + 1 / 3 * -(i - 1);
        t3 < 0 && t3++;
        t3 > 1 && t3--;
        if (6 * t3 < 1)
          val = t1 + (t2 - t1) * 6 * t3;
        else if (2 * t3 < 1)
          val = t2;
        else if (3 * t3 < 2)
          val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
        else
          val = t1;
        rgb[i] = Math.round(val * 255);
      }
    }
    if (a < 1) rgb.push(a);
    return rgb;

  };

  var _parse = value => {

    if (value) {

      if (Object.prototype.toString.call(value) === "[object Array]") return value;

      var three = value.match(/^#?([0-9a-f]{3})$/i);
      if (three) return _three(three);

      var six = value.match(/^#?([0-9a-f]{6})$/i);
      if (six) return _six(six);

      var rgba = value.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+.*\d*)\s*\)$/i) ||
        value.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
      if (rgba) {
        var _return = [
          parseInt(rgba[1], 10),
          parseInt(rgba[2], 10),
          parseInt(rgba[3], 10),
        ];
        if (rgba[4] !== undefined && rgba[4] !== 1 && rgba[4] !== "1")
          _return.push(Number.parseFloat(rgba[4]));
        return _return;
      }

      var rgb = value.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
      if (rgb) return [
        parseInt(rgb[1], 10),
        parseInt(rgb[2], 10),
        parseInt(rgb[3], 10)
      ];

      if (value.indexOf("hsl") === 0) return _hsl(value);

      var named = NAMED_COLOURS[value.toUpperCase()];
      if (named) return _parse(named);

    }

    return _parse(!options.default || options.default == value ? [0, 0, 0] : options.default);

  };
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    parse: _parse,
    
    convert: values => _.map(values, (v, i) => v !== 0 && i < 3 ? parseFloat((v / 255).toFixed(3)) : v)

    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};