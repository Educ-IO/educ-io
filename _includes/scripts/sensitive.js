(function(){
  var createStylesheet = function() {
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-src", "sensitive");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style;
  };
  var addRule = function(sheet, selector, rules, index) {
    if("insertRule" in sheet) {
      sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else if("addRule" in sheet) {
      sheet.addRule(selector, rules, index);
    }
  };
  var style = createStylesheet();
  addRule(style.sheet, ".font-sensitive", "visibility: hidden;");
  addRule(style.sheet, ".css-sensitive", "display: none;");
})();