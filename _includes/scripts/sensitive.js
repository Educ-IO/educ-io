(function(){
  var createStylesheet = (function() {
    var style = document.createElement("style");
    style.setAttribute("type", "text/css");
    style.setAttribute("data-src", "sensitive");
    style.appendChild(document.createTextNode(""));
    document.head.appendChild(style);
    return style.sheet;
  });
  var sheet = createStylesheet();
  sheet.insertRule(".font-sensitive { visibility: hidden; }");
  sheet.insertRule(".css-sensitive { display: none; }");
})();