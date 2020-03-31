Templating = function() {
  "use strict";

  /* <!-- HELPER: Form data to/from JSON Object --> */
  /* <!-- PARAMETERS: Options (see below) and a factory context (to generate modules, helpers etc) --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    GEN = FACTORY.App.generate,
    PAUSE = () => DELAY(RANDOM(500, 1000));
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var expect, display, converter, markdown;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
    
  /* <!-- Scaffolding Functions --> */
  /* <!-- Scaffolding Functions --> */
      
  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => (
      expect = chai.expect, 
      display = FACTORY.Display,
      converter = window.showdown ? new showdown.Converter({
        tables: true
      }) : false,
      markdown = markdown => converter ? converter.makeHtml(markdown) : markdown,
      FACTORY.Flags.log("START Called").reflect(true)
    ),
    
    document: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          /* <!-- Generate Markdown --> */
          var _gen = () => GEN.t(GEN.i(5, 25)).replace(/_/g, ".").replace(/\|/g, "¦").trim();
          
          /* <!-- Test Simple Plain Text Document --> */
          var _name_1 = "SIMPLE_TEST",
              _doc_1 = display.doc.get({
                name: _name_1,
                plain: true
              }),
              _result_1 = "This is a test";
          expect(_doc_1)
            .to.be.a("string")
            .that.equals(_result_1);
          
          /* <!-- Test Simple Document --> */
          var _name_2 = "SIMPLE_TEST",
              _doc_2 = display.doc.get(_name_2),
              _result_2 = markdown("This is a test");
          expect(_doc_2)
            .to.be.a("string")
            .that.equals(_result_2);
          
          /* <!-- Test Content / Markdown Formatted Document --> */
          var _text_3 = _gen(),
              _name_3 = "FORMAT_TEST",
              _doc_3 = display.doc.get({
                name: _name_3,
                content: _text_3,
              }),
              _result_3 = markdown(`This is a test: __${_text_3}__`);
          expect(_doc_3)
            .to.be.a("string")
            .that.equals(_result_3);
          
          /* <!-- Test Complex Content / Markdown Formatted Document --> */
          var _text_4_1 = _gen(),
              _text_4_2 = _gen(),
              _text_4_3 = _gen(),
              _name_4 = "COMPLEX_TEST",
              _doc_4 = display.doc.get({
                name: _name_4,
                data: {
                  a: _text_4_1,
                  b: _text_4_2,
                  c: _text_4_3
                },
              }),
              _result_4 = markdown(`This is a test with multiple variables: a:__${_text_4_1}__ ¦ b:_${_text_4_2}_ ¦ c:${_text_4_3}`);
          expect(_doc_4)
            .to.be.a("string")
            .that.equals(_result_4);
            
          resolve(FACTORY.Flags.log("Document Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Document Test FAILED", err).reflect(false));
        }

      });

    }),

    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};