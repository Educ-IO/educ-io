Query = options => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored tasks --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, Underscore | App Scope: schema --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.event = event => _.tap({}, q => (q[options.schema.columns.event.value] = {}).$eq = event);
  
  FN.resource = resource => _.tap({}, q => (q[options.schema.columns.resource.value] = {}).$eq = resource);
  
  FN.loan = (event, resource) => ({"$and": [FN.event(event), FN.resource(resource)]});
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    loan : FN.loan,
    
    event : FN.event,
    
  };
  /* <!-- External Visibility --> */

};