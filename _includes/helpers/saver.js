Saver = (options, factory) => {
	"use strict";
			
	/* <!-- HELPER: Provides Browser-based saving methdods --> */
	/* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
	/* <!-- @factory.Strings: Function to create a strings helper object --> */
	/* <!-- REQUIRES: Global Scope: Underscore, saveAs from FileSaver if no native support --> */
	/* <!-- REQUIRES: Factory Scope: Strings helper --> */
	
	/* <!-- Internal Constants --> */
	const DEFAULTS = {};
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */ 
  var _save  = (data, name, type) => new Promise((resolve, reject) => {

    var value = (_.isString(data) && type == "application/octet-stream") ?
        factory.Strings().arraybuffer.encode(data) : data;
    
    try {
      (factory.saveAs ? factory.saveAs : saveAs)(new Blob([value], {
        type: type
      }), name);
      resolve(name);
    } catch (e) {
      reject(e);
    }
  });

	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    save: (data, fileName, fileType) => _save(data, fileName, fileType)
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};