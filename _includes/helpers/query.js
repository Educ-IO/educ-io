Query = (options, factory) => {
	"use strict";
  
	/* <!-- HELPER: Provides helper functions for querying Loki Databases --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
	/* <!-- @options.db = the Loki DB --> */
	/* <!-- REQUIRES: Global Scope: Loki --> */

	/* <!-- Internal Constants --> */
	const DEFAULTS = {};
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */
	
  return {
    
    table : (name, details, options) => {
      var table = options.db.getCollection(name);
      table ? options && options.preserve ? true : table.clear() : table = options.db.addCollection(name, {
        unique: details && details.unique || [],
        indices: details && details.indices || [],
        serializableIndices: false
      });
      if (details && details.data) table.insert(details.data);
      return options && options.fn ? () => table : table;
    }
    
  };
 
};