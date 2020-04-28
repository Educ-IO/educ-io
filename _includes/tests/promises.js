Promises = function() {
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
  var expect;
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
      FACTORY.Flags.log("START Called").reflect(true)
    ),
    
    sequential: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          /* <!-- Results Holder --> */
          var _results = [];
          
          /* <!-- Setup --> */
          var _name = index => `Result No: ${index + 1}`,
              _count = GEN.i(5, 25),
              _promises = _.times(_count, index => () => DELAY(RANDOM(100, 2000)).then(() => _results.push(_name(index))));
                                                 
          /* <!-- Test Promises are executed sequentially --> */
          Promise.each(_promises).then(() => {
            
            try {
              
              expect(_results)
                .to.be.an("array")
                .that.deep.equals(_.times(_count, _name));

              resolve(FACTORY.Flags.log("Sequential Test SUCCEEDED").reflect(true));
              
            } catch (err) {
              resolve(FACTORY.Flags.error("Sequential Test FAILED", err).reflect(false));
            }

          });

        } catch (err) {
          resolve(FACTORY.Flags.error("Sequential Test FAILED", err).reflect(false));
        }

      });

    }),

    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};