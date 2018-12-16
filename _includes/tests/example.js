Example = function() {
  "use strict";

  /* <!-- HELPER: Form data to/from JSON Object --> */
  /* <!-- PARAMETERS: Options (see below) and a factory context (to generate modules, helpers etc) --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    RACE = FACTORY.App.race(500);
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => FACTORY.Flags.log("START Called").reflect(true),

    test1: () => DELAY(RANDOM(200, 2000)).then(() =>
      FACTORY.Flags.log("TEST 1 Complete").reflect(true)),

    test2: () => DELAY(RANDOM(300, 3000)).then(() =>
      FACTORY.Flags.log("TEST 2 Complete").reflect(false)),

    test3: () => RACE(DELAY(1000).then(() =>
      FACTORY.Flags.log("TEST 3 Complete").reflect(true))),

    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};