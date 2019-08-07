Dates = function() {
	"use strict";
	
	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Dates)) {return new this.Dates().initialise(this);}
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _date;
  /* <!-- Internal Variables --> */
    
  /* <!-- Internal Functions --> */
  var _locale = locale => (locale = locale || window.navigator.userLanguage || window.navigator.language) && (window.moment || window["dayjs_locale_" + locale.replace("-", "_")]) ?
      _date.locale(locale) == locale.toLowerCase() : false;
  
  var _momentFormats = () => {
    
    var _locales = moment.localeData()._longDateFormat,
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
    return _formats;
    
  };
  
  var _formats = () => window.moment ? _momentFormats() : [];
  /* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

		initialise: function(container) {

			/* <!-- Get a reference to the Container --> */
			ಠ_ಠ = container;

			/* <!-- Set Container Reference to this --> */
			container.Dates = this;
      
			/* <!-- Return for Chaining --> */
			return this;

		},

    /* <!-- External Functions --> */
		start : () => {
      
      _date = window.moment || window.dayjs;
      
      /* <!-- Initialise Date Library --> */
      if (_date) {

        /* <!-- Initialise Locale (if possible) --> */
        _locale();

        /* <!-- Initialise Day JS Plugins (if available) --> */
        if (window.dayjs) [
          "dayjs_plugin_relativeTime",
          "dayjs_plugin_isSameOrAfter",
          "dayjs_plugin_isSameOrBefore",
          "dayjs_plugin_customParseFormat",
          "dayjs_plugin_advancedFormat",
          "dayjs_plugin_localizedFormat"
        ].forEach(plugin => window[plugin] ? dayjs.extend(window[plugin]) : false);

      }
      
    },
    
    formats: _formats,
    
    locale: _locale,
    
    isoWeekday : date => date ? ಠ_ಠ._isF(date.isoWeekday) ? date.isoWeekday() : date.day() === 0 ? 7 : date.day() : null,

    now : () => _date ? _date() : new Date(),
    
    parse : function() {
      /* <!-- (value, _formats, true) --> */
      return _date ? _date.apply(null, arguments) : new Date();
    },
    
    duration: function() {
      /* <!-- (value, units) --> */
      return _date && _date.duration ? _date.duration.apply(null, arguments) : false;
    }
		/* <!-- External Functions --> */
		
	};
	/* <!-- External Visibility --> */
};