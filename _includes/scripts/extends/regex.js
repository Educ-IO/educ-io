/* <!-- Regex Escape --> */
RegExp.escape = function(value) {
  /* <!-- Previously: /[-/\\^$*+?.()|[\]{}]/g --> */
  return value ? value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"): value;
};
/* <!-- Regex Escape --> */

/* <!-- Regex All Chars --> */
RegExp.replaceChars = function(value, replacements) {
  if (value && replacements && (typeof value === "string" || value instanceof String)) {
    var _regEx = "", _replacements = Object.keys(replacements);
    for (var i = 0; i < _replacements.length; i++) {
      _regEx += (i > 0 ? "|" : "") + RegExp.escape(_replacements[i]);
    }
    return value.replace(new RegExp(_regEx, "g"), function(match) {return replacements[match];});
  } else {
    return value;
  }
};
/* <!-- Regex All Chars --> */