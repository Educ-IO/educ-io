Sheet = function(ಠ_ಠ, data, options) {
	"use strict";

	/* <!-- Internal Constants --> */
	const defaults = {
		frozen: {
			cols: options.sheet ? options.sheet.properties.gridProperties.frozenColumnCount : false,
			rows: options.sheet ? options.sheet.properties.gridProperties.frozenRowCount : false,
		},
		size: {
			cols: options.sheet ? options.sheet.properties.gridProperties.columnCount : false,
			rows: options.sheet ? options.sheet.properties.gridProperties.rowCount : false,
		},
		locale: options.sheets ? options.sheets.properties.locale ? options.sheets.properties.locale.replace("_", "-") : false : false,
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
		rows = options.header_rows !== undefined ? options.header_rows : options.frozen.rows ? options.frozen.rows : 1,
		cols, hide = options.hide_rows !== undefined ? options.hide_rows : 0;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _hide = count => {
		if (count > 0) data.splice(0, count);
	};

	var _blanks = () => {

		/* <!-- Check for fully 'blank' columns --> */
		ಠ_ಠ.Flags.time("Checking Blank Columns");
		var _hasValues = Array.apply(null, {
			length: options.size.cols
		}).map(Number.call, Number);
		_.find(data.slice(rows), row => {
			_.each(row, (cell, index) => {
				if (cell) _hasValues = _.filter(_hasValues, (number) => number !== index);
			});
			return (_hasValues.length === 0);
		});
		if (_hasValues && _hasValues.length > 0) {
			ಠ_ಠ.Flags.log("Blank Columns in Sheet:", JSON.stringify(_hasValues));
			_hasValues.reverse();
			data = _.map(data, row => {
				_.each(_hasValues, index => row.length > (index + 1) ? row.splice(index, 1) : false);
				return row;
			});
		}
		ಠ_ಠ.Flags.time("Checking Blank Columns", true);
		return options.size.cols - _hasValues.length;
	};

	var _headers = count => {

		/* <!-- Handle Headers --> */
		ಠ_ಠ.Flags.time("Generating Headers");
		while (count-- > 0) headers = data.shift().map((v, i) => v ? (headers[i] ? `${headers[i]} / ${v}` : v) : headers[i]);
		if (cols && headers.length === 0) headers = Array.apply(null, {
			length: cols
		});
		ಠ_ಠ.Flags.time("Generating Headers", true);

	};

	var _dates = () => {

		/* <!-- Check Array for Dates --> */
		ಠ_ಠ.Flags.time("Checking for Dates in Sheet Values");
		var _formats;
		if (options.locale && moment.locale(options.locale) == options.locale.toLowerCase()) {
			ಠ_ಠ.Flags.log("Spreadsheet Locale:", options.locale);
			var _locales = moment.localeData()._longDateFormat;
			_formats = [moment.ISO_8601];
			if (_locales) {
				if (_locales.L) {
					_formats.unshift(_locales.L);
					if (_locales.LT) _formats.unshift(_locales.L + " " + _locales.LT);
					if (_locales.LT) _formats.unshift(_locales.L + " " + _locales.LTS);
				}
				if (_locales.LL) _formats.unshift(_locales.LL);
				if (_locales.LLL) _formats.unshift(_locales.LLL);
				if (_locales.LLLL) _formats.unshift(_locales.LLLL);
			}
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
		while (data.length > _check.current && (_check.is.length + _check.not.length) < cols) {
			_check = _.reduce(data[_check.current++], (dates, value, index) => {
				if (value && dates.is.indexOf(index) < 0 && dates.not.indexOf(index) < 0)
					_.isString(value) && moment(value, _formats, true).isValid() ? dates.is.push(index) : dates.not.push(index);
				return dates;
			}, _check);
		}
		dates = _check.is;

		/* dates = _.reduce(data[0], (dates, value, index) => {
      if (value && _.isString(value) && moment(value, _formats, true).isValid()) dates.push(index);
      return dates;
    }, []); */

		ಠ_ಠ.Flags.log("Date Column Indexes:", dates);

		if (dates.length > 0) _.each(data, row => _.each(dates, index => {
			row[index] = row[index] ? moment(row[index], _formats, true).toDate() : row[index];
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
		cols = options.process.blanks ? _blanks() : options.size.cols;
		options.process.headers ? _headers(rows) : false;
		options.process.dates && moment ? _dates() : false;
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

		hide_rows: () => hide
	};
	/* <!-- External Visibility --> */

};