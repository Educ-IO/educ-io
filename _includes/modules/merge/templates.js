Templates = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.load = file => {

     if (file.mimeType.toLowerCase() == factory.Google.files.natives()[0].toLowerCase()) {

       return factory.Google.files.export(file.id, "text/html")
         .then(factory.Google.reader().promiseAsText)
         .then(result => {
           ರ‿ರ.result = result;
           ರ‿ರ.resize = factory.Display.size.resizer.height("#site_nav", `#${options.id}_template_frame`, "height", 25);
           ರ‿ರ.template = $(result);
           ರ‿ರ.nodes = $.parseHTML($.trim(result));
           ರ‿ರ.file = file;

           var _frame = $(`#${options.id}_template_frame`),
             _doc = _frame[0].contentDocument || _frame[0].contentWindow.document;
           _doc.open();
           _doc.writeln(result);
           _doc.close();

         });

     } else {

       return Promise.reject(`Can't load ${file.name}, as we can't process type: ${file.mimeType}`);

     }

   };
  
  FN.state = () => ರ‿ರ;
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};