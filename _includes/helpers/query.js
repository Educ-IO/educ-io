Query = DB => {
	"use strict";
  
	/* <!-- MODULE: Provides helper functions for querying Loki Databases --> */
  /* <!-- PARAMETERS: Receives the the Loki DB --> */
	/* <!-- REQUIRES: Global Scope: Loki --> */

  return {
    
    table : (name, details, options) => {
      var table = DB.getCollection(name);
      table ? options && options.preserve ? true : table.clear() : table = DB.addCollection(name, {
        unique: details && details.unique || [],
        indices: details && details.indices || [],
        serializableIndices: false
      });
      if (details && details.data) table.insert(details.data);
      return options && options.fn ? () => table : table;
    }
    
  };
 
};