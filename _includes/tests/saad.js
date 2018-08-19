SaaD = options => {
  "use strict";

  /* <!-- HELPER: Form data to/from JSON Object --> */
  /* <!-- PARAMETERS: Options (see below) and a factory context (to generate modules, helpers etc) --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DEFAULTS = {
    DELAY : ms => new Promise(resolve => setTimeout(resolve, ms)),
    RANDOM : (lower, higher) => Math.random() * (higher - lower) + lower
  }, DEBUG = FACTORY.Flags && FACTORY.Flags.debug(),
     LOG = DEBUG ? FACTORY.Flags.log : () => false;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
		start: () => options.DELAY(options.RANDOM(100, 500)).then(() => {
      LOG("START Called");
      return true;
    }),
    
    create: () => options.DELAY(options.RANDOM(200, 2000)).then(() => {
      LOG("CREATE Complete");
      return true;
    }),
    
    query: () => options.DELAY(options.RANDOM(300, 3000)).then(() => {
      LOG("QUERY Complete");
      return true;
    }),
    
    finish: () => {
      LOG("FINISH Called");
      return true;
    },
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};
