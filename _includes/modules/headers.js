Headers = (ಠ_ಠ, grid, source) => {
	"use strict";
	
	/* <!-- MODULE: Provides ability to manipulate the number of header or hidden rows at the start of a grid --> */
  /* <!-- PARAMETERS: Receives the global app context, the grid and the original source (returned as resolved promise) --> */
	/* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display, Grid --> */
	
	/* <!-- Internal Constants --> */
  /* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	var _empty = source => {
		source.target.empty();
		return source;
	};

  var _update = (get, set) => value => new Promise(resolve => {

		var _rows = get(), _values = grid.values().length;
		if ((_rows += value) >= 0 && value < _values) {
			resolve(_.extend(set(_rows), _empty(source)));
		} else {
			resolve();
		}

  });
  
  var _manage = () => ಠ_ಠ.Display.modal("headers", {
			id: "manage_headers",
			target: ಠ_ಠ.container,
			title: "Manage Headers",
			instructions: ಠ_ಠ.Display.doc.get("HEADERS"),
			handlers: {},
			count: grid.header_rows(),
			hide: grid.hide_rows()
		}, dialog => ಠ_ಠ.Fields().on(dialog))
		.then(data => {
			if (!data || !(data.Hide || data.Count)) return false;
			if (data.Hide) source = _.extend({hide_rows : data.Hide.Values.Number}, source);
			if (data.Count) source = _.extend({header_rows : data.Count.Values.Number}, source);
			return _empty(source);
	});
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    update : (value, type) => (value === null || value === undefined) ?
			Promise.resolve(_empty(source)) : 
			(type && type == "hide") ? 
				_update(grid.hide_rows, value => ({hide_rows : value}))(value) : 
				_update(grid.header_rows, value => ({header_rows : value}))(value),
    
		manage : () => _manage()
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};