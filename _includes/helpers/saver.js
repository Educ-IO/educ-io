Saver = strings => {
	"use strict";
			
	/* <!-- MODULE: Provides Browser-based saving methdods --> */
  /* <!-- PARAMETERS: Receives the strings helper, for string to ArrayBuffer functionality --> */
	/* <!-- REQUIRES: Global Scope: Underscore, saveAs from FileSaver if no native support --> */
	
	/* <!-- Internal Constants --> */
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */ 
  var _save  = (data, name, type) => new Promise((resolve, reject) => {

    var value = (_.isString(data) && type == "application/octet-stream") ?
        strings.stringToArrayBuffer(data) : data;
    
    try {
      saveAs(new Blob([value], {
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