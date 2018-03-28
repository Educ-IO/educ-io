Sheet = function(ಠ_ಠ, data, options) {
	"use strict";
	
  /* <!-- Internal Constants --> */
  const defaults = {
    frozen : {
      cols : options.sheet ? options.sheet.properties.gridProperties.frozenColumnCount : false,
      rows : options.sheet ? options.sheet.properties.gridProperties.frozenRowCount : false,
    },
    size : {
      cols : options.sheet ? options.sheet.properties.gridProperties.columnCount : false,
      rows : options.sheet ? options.sheet.properties.gridProperties.rowCount : false,
    },
    locale : options.sheets ? options.sheets.properties.locale ? options.sheets.properties.locale.replace("_", "-") : false : false,
    process : {
      blanks : true,
      headers : true,
      dates : true,
      values : true
    }
  };
	/* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
	var headers = [], fields = [], values = [];
  options = _.defaults(options, defaults);
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  var _blanks = () => {
    
    /* <!-- Check for fully 'blank' columns --> */
    ಠ_ಠ.Flags.time("Checking Blank Columns");
    var _hasValues = Array.apply(null, {
      length: options.size.cols
    }).map(Number.call, Number);
    _.find(data, row => {
      _.each(row, (cell, index) => {
        if (cell) _hasValues = _.filter(_hasValues, (number) => number !== index);
      });
      return (_hasValues.length === 0);
    });
    if (_hasValues && _hasValues.length > 0) {
      ಠ_ಠ.Flags.log("Blank Columns in Sheet:", JSON.stringify(_hasValues));
      _hasValues.reverse();
      data = _.map(data, row => {
        _.each(_hasValues, function(index) {
          if (row.length > index + 1) row.splice(index, 1);
        });
        return row;
      });
    }
    ಠ_ಠ.Flags.time("Checking Blank Columns", true);
    
  };
  
  var _headers = () => {
    
    /* <!-- Handle Headers --> */
    ಠ_ಠ.Flags.time("Generating Headers");
    headers = data.shift();
    var rows = options.frozen.rows ? options.frozen.rows - 1 : 0;
    while (rows > 0) {
      headers = data.shift().map((v, i) => v ? (headers[i] ? headers[i] + " / " + v : v) : headers[i]);
      rows--;
    }
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
		} else if (options.locale){
			ಠ_ಠ.Flags.error(`Could Not Set Date/Time Locale to ${options.locale}`);
		} else {
			ಠ_ಠ.Flags.log("No Locale Supplied for Parsing");
		}
		
    var _date_Indexes = _.reduce(data[0], (dates, value, index) => {
      if (value && _.isString(value) && moment(value, _formats, true).isValid()) dates.push(index);
      return dates;
    }, []);
    ಠ_ಠ.Flags.log("Date Column Indexes:", _date_Indexes);
    if (_date_Indexes.length > 0) _.each(data, row => _.each(_date_Indexes, index => {
      row[index] = row[index] ? moment(row[index], _formats, true).toDate() : row[index];
    }));
		ಠ_ಠ.Flags.time("Checking for Dates in Sheet Values", true);
    
  };
  
  var _values = () => {
    
    /* <!-- Generate Objects from Row/Col Array --> */
		ಠ_ಠ.Flags.time("Creating Object Array from Sheet Values");
		values = data.map(v => Object.assign({}, v));
		fields = Array.apply(null, {
			length: options.size.cols
		}).map(Number.call, Number);
		ಠ_ಠ.Flags.time("Creating Object Array from Sheet Values", true);
    
  };
  /* <!-- Internal Functions --> */
	
  /* <!-- Internal Initialisation --> */
  if (data && data.length > 0) {
    options.process.blanks ? _blanks() : false;
    options.process.headers ? _headers() : false;
    options.process.dates && moment ? _dates() : false;
    options.process.values ? _values() : false;  
  }
  /* <!-- Internal Initialisation --> */
  
	/* <!-- External Visibility --> */
  return {
		
    headers : () => headers,
    
    fields : () => fields,
    
    values : () => values,
		
		frozen : () => options.frozen,
		
		size : () => options.size,
		
		locale : () => options.locale
		
	};
  /* <!-- External Visibility --> */
	
};