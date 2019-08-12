Filter = options => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored tasks --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Underscore | App Scope: schema --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  
  /* <-- General Filters --> */
  FN.general = {
    
    timed: items => _.filter(items, result => result[options.schema.columns.is_timed.value] === true && !result[options.schema.columns.in_future.value]),
    
    pending: items => _.filter(items, result => result[options.schema.columns.status.value] != options.schema.enums.status.complete && 
                               (result[options.schema.columns.in_future.value] === true || result[options.schema.columns.is_timed.value] === false)),
    
  };
  
  FN.temporal = {
    
    future: items => _.filter(items, result => result[options.schema.columns.in_future.value] === true),
    
  };
  
  FN.status = {
    
    none: items => _.reject(items, result => result[options.schema.columns.status.value]),
                            
    complete: items => _.filter(items, result => result[options.schema.columns.status.value] == options.schema.enums.status.complete),
    
    incomplete: items => _.filter(items, result => result[options.schema.columns.status.value] != options.schema.enums.status.complete),
    
    ready: items => _.filter(items, result => result[options.schema.columns.status.value] == options.schema.enums.status.ready),
    
    underway: items => _.filter(items, result => result[options.schema.columns.status.value] == options.schema.enums.status.underway),
    
  };
  
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    timed: FN.general.timed,
    
    pending: FN.general.pending,
    
    future: FN.temporal.future,
    
    /* <!-- Status Functions --> */
    none: FN.status.none,
    
    complete: FN.status.complete,
    
    incomplete: FN.status.incomplete,
    
    ready: FN.status.ready,
    
    underway: FN.status.underway,
    
  };
  /* <!-- External Visibility --> */

};