SaaD = function() {
  "use strict";

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DELAY = FACTORY.App.delay,
     RANDOM = FACTORY.App.random;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
		start: () => DELAY(RANDOM(100, 500)).then(() => {
      FACTORY.Flags.log("START Called");
      return true;
    }),
    
    create: () => DELAY(RANDOM(200, 2000)).then(() => {
      FACTORY.Flags.log("CREATE Complete");
      return true;
    }),
    
    query: () => DELAY(RANDOM(300, 3000)).then(() => {
      FACTORY.Flags.log("QUERY Complete");
      return true;
    }),
    
    finish: () => {
      FACTORY.Flags.log("FINISH Called");
      return true;
    },
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};
