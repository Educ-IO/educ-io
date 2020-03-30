iSAMS_API = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides an interface onto various Google APIs --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.timeout: Custom timeout for each network/API domain base --> */
  /* <!-- @factory.Network: Function to create a network helper object --> */
  /* <!-- REQUIRES: Global Scope: Underscore, quotedPrintable (for emails) --> */
  /* <!-- REQUIRES: Factory Scope: Network helper --> */
  
  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    type: "json",
    responses: "application/json",
    keys: {
      pupils: ""
    },
    tenancy: ""
  };
  const LAST_RESORT_TIMEOUT = 60000;
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */
  
  /* <!-- Network Constants --> */
  const NETWORK = factory.Network({
      base: `https://${options.tenancy}.isams.cloud/`,
      timeout: options.timeout ? options.timeout : LAST_RESORT_TIMEOUT,
      per_sec: options.rate ? options.rate : 0,
      concurrent: options.concurrent ? options.concurrent : 0,
      retry: r =>
        new Promise(resolve => r.status == 403 || r.status == 429 ?
          r.json().then(result => result.error.message && result.error.message.indexOf("Rate Limit Exceeded") >= 0 ? resolve(true) : resolve(false)) : resolve(false))
    }, factory);
  
  return {
    
    pupils : () => NETWORK.get(`api/batch/1.0/${options.type}.ashx?apiKey=${options.keys.pupils}`, null, null, options.responses)
                    .then(data => data),
    
  };
  
};