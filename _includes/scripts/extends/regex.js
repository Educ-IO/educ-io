/* <!-- Regex Escape --> */
RegExp.escape = function(value) {
  return value.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};
/* <!-- Regex Escape --> */

/* <!-- Regex All Chars --> */
RegExp.replaceChars = function(value, replacements) {
  if (value && replacements) {
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