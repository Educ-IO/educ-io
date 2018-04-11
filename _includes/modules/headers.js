Headers = ಠ_ಠ => {
	"use strict";
	
	/* <!-- Internal Constants --> */
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
  var _update = (sheet, raw, value) => new Promise(resolve => {
    
		if (value === null || value === undefined) {
      
			raw.target.empty();
      resolve(raw);
      
		} else {
			
			var _rows = sheet.header_rows(), _values = sheet.values().length;
			if ((_rows += value) >= 0 && value < _values) {
        raw.target.empty();
        resolve(_.extend({header_rows : _rows}, raw));
      } else {
        resolve();
      }
			
		}
  });
  
  var _manage = (sheet, raw) => ಠ_ಠ.Display.modal("headers", {
				id: "manage_headers",
				target: ಠ_ಠ.container,
				title: "Manage Headers",
				instructions: ಠ_ಠ.Display.doc.get("HEADERS"),
				handlers: {},
				count: sheet.header_rows(),
				hide: sheet.hide_rows()
			}, dialog => ಠ_ಠ.Fields().on(dialog))
		.then(data => {

			if (data && (data.Hide || data.Count)) {
				
				var _return = raw;
				if (data.Hide) _return = _.extend({hide_rows : data.Hide.Values.Number}, _return);
				if (data.Count) _return = _.extend({header_rows : data.Count.Values.Number}, _return);
				raw.target.empty();
				return _return;
				
			} else {
				
				return false;
				
			}
      
		});
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    update : (sheet, raw, value) => _update(sheet, raw, value),
    
		manage : (sheet, raw) => _manage(sheet, raw)
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};