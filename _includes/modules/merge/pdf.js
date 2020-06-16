PDF = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- Public Functions --> */
  FN.generate = template => {
    var pdf = new jsPDF();
    pdf.fromHTML(template);
    return pdf;
  };

  FN.upload = template => {
    var metadata = {
      name: "TEST UPLOAD",
      mimeType: "application/pdf"
    };

    return factory.Google.files.upload(metadata,
      new Blob(FN.generate(template).output("blob"), {
        type: "application/pdf"
      }), "application/pdf");

  };

  FN.save = () => {
    var _frame = $(`#${options.id}_template_frame`),
      _doc = _frame[0].contentDocument || _frame[0].contentWindow.document;
    factory.Flags.log("DOC:", _doc);
    FN.generate(_doc).save("Test.pdf");
    return Promise.resolve();

    /* <!-- 
	var blob = pdf.output("blob");
	window.open(URL.createObjectURL(blob));
	--> */

  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};