Grid = (ಠ_ಠ, data, options) => {
	"use strict";
	
	/* <!-- MODULE: Provides a interpreted grid object which essentially wraps Google Sheet/Tab Data --> */
  /* <!-- PARAMETERS: Receives the global app context, the Google sheet data, and options --> */
	/* <!-- REQUIRES: Global Scope: Moment, Underscore | App Scope: Flags --> */
	/* <!-- @options = see defaults below --> */
	/* <!-- NOTES: Data will be modified by this module, so pass in a shallow cloned array if required --> */
	
	/* <!-- Internal Constants --> */
	const defaults = {
		frozen: {
			cols: options.sheet && options.sheet.properties ? options.sheet.properties.gridProperties.frozenColumnCount : false,
			rows: options.sheet && options.sheet.properties ? options.sheet.properties.gridProperties.frozenRowCount : false,
		},
		size: {
			/* <!-- NOTE: should fall back to measuring the data first row length if possible? --> */
			cols: options.sheet && options.sheet.properties ? options.sheet.properties.gridProperties.columnCount : false,
			rows: options.sheet && options.sheet.properties ? options.sheet.properties.gridProperties.rowCount : false,
		},
		locale: options.sheets && options.sheet.properties ? 
			options.sheets.properties.locale ? options.sheets.properties.locale.replace("_", "-") : false : false,
		process: {
			hides: true,
			blanks: true,
			headers: true,
			dates: true,
			values: true
		}
	};
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	options = _.defaults(options, defaults);
	var headers = [],
		fields = [],
		values = [],
		dates = [],
		blanks = [],
		rows = options.header_rows !== undefined ? options.header_rows : options.frozen.rows ? options.frozen.rows : 1,
		hide = options.hide_rows !== undefined ? options.hide_rows : 0;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _hide = count => {
		if (count > 0) data.splice(0, count);
	};

	var _blanks = () => {

		/* <!-- Check for fully 'blank' columns --> */
		ಠ_ಠ.Flags.time("Checking Blank Columns");
		blanks = Array.apply(null, {
			length: options.size.cols
		}).map(Number.call, Number);
		/* <!-- NOTE: a fully 'blank' column is excluding the header and any hidden initial rows --> */
		_.find(data.slice(hide + rows), row => {
			_.each(row, (cell, index) => {
        if (!(/\S/.test(cell))) row[index] = null;
				if (cell) blanks = _.filter(blanks, number => number !== index);
			});
			return (blanks.length === 0);
		});
		ಠ_ಠ.Flags.time("Checking Blank Columns", true);
		ಠ_ಠ.Flags.log("Blank Columns in Sheet:", JSON.stringify(blanks));
		
	};

	var _headers = count => {

		/* <!-- Handle Headers --> */
		ಠ_ಠ.Flags.time("Generating Headers");
		while (count-- > 0) headers = data.shift().map((v, i) => v ? (headers[i] ? `${headers[i]} / ${v}` : v) : headers[i]);
		if (options.size.cols && headers.length === 0) headers = Array.apply(null, {
			length: options.size.cols
		});
		ಠ_ಠ.Flags.time("Generating Headers", true);

	};

	var _dates = () => {

		/* <!-- Check Array for Dates --> */
		ಠ_ಠ.Flags.time("Checking for Dates in Sheet Values");
		var _formats;
    
		if (options.locale && ಠ_ಠ.Dates.locale(options.locale)) {
			ಠ_ಠ.Flags.log("Spreadsheet Locale:", options.locale);
      _formats = ಠ_ಠ.Dates.formats();
			ಠ_ಠ.Flags.log("Date Parsing Formats:", _formats);
		} else if (options.locale) {
			ಠ_ಠ.Flags.error(`Could Not Set Date/Time Locale to ${options.locale}`);
		} else {
			ಠ_ಠ.Flags.log("No Locale Supplied for Parsing");
		}

		/* <!-- Check for Date Columns --> */
		var _check = {
			is: [],
			not: [],
			current: 0
		};
		while (data.length > _check.current && (_check.is.length + _check.not.length) < options.size.cols) {
			_check = _.reduce(data[_check.current++], (dates, value, index) => {
				if (value && dates.is.indexOf(index) < 0 && dates.not.indexOf(index) < 0)
					_.isString(value) && ಠ_ಠ.Dates.parse(value, _formats, true).isValid() ? dates.is.push(index) : dates.not.push(index);
				return dates;
			}, _check);
		}
		dates = _check.is;

		ಠ_ಠ.Flags.log("Date Column Indexes:", dates);

		if (dates.length > 0) _.each(data, row => _.each(dates, index => {
			row[index] = row[index] ? ಠ_ಠ.Dates.parse(row[index], _formats, true).toDate() : row[index];
		}));
		ಠ_ಠ.Flags.time("Checking for Dates in Sheet Values", true);

		ಠ_ಠ.Flags.log(`Had to iterate ${_check.current} rows to find dates`);

	};

	var _values = () => {

		/* <!-- Generate Objects from Row/Col Array --> */
		ಠ_ಠ.Flags.time("Creating Object Array from Sheet Values");
		values = _.map(data, v => Object.assign({}, v));
		fields = Array.apply(null, {
			length: options.size.cols
		}).map(Number.call, Number);
		ಠ_ಠ.Flags.time("Creating Object Array from Sheet Values", true);

	};
	/* <!-- Internal Functions --> */

	/* <!-- Internal Initialisation --> */
	if (data && data.length > 0) {
		
		options.process.hides ? _hide(hide) : false;
		options.process.blanks ? _blanks() : false;
		options.process.headers ? _headers(rows) : false;
		options.process.dates && ಠ_ಠ.Dates && ಠ_ಠ.Dates.available() ? _dates() : false;
		options.process.values ? _values() : false;
		
	}
	/* <!-- Internal Initialisation --> */

	/* <!-- External Visibility --> */
	return {

		dates: () => dates,

		headers: () => headers,

		fields: () => fields,

		values: () => values,

		frozen: () => options.frozen,

		size: () => options.size,

		locale: () => options.locale,

		header_rows: () => rows,

		hide_rows: () => hide,
		
		blanks: () => blanks
	};
	/* <!-- External Visibility --> */

};