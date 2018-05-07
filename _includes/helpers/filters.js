Filters = (options, factory) => {
	"use strict";
  
  /* <!-- MODULE: Parse string Filters and Builds a Filter Query for Loki --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
	/* <!-- @options.normal: Normal Filters [Optional]  --> */
	/* <!-- @options.inverted: Inverted Filters [Optional]  --> */
	/* <!-- REQUIRES: Global Scope: Underscore, Moment --> */
  
  /* <!-- Internal Consts --> */
  const NEGATE = "!!", CONTAINS = "$", REGEX = "##", 
        LTE = ["<=", "=<"], GTE = [">=","=>"],
        NOW = "now", NE = "<>", CONTAINS_NONE = ["!$", "$!"],
        EQ = "=", GT = ">", LT = "<", BETWEEN = "->",
        PAST = "past", FUTURE = "future", TODAY = "today", VALUED = "@@";
	const DEFAULTS = {normal : {}, inverted : {}};
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
	options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Methods --> */
  var _createQuery = (filters, join) => {
    var _query, _join = join ? join : "$and";
    _.map(_.keys(filters), field => {
      var _condition = {};
      _condition[field] = filters[field];
      if (!_query) {
        _query = _condition;
      } else {
        if (_query[_join]) {
          _query[_join].push(_condition);
        } else {
          _query = {
            [_join]: [_query, _condition]
          };
        }
      }
    });
    return _query;
  };

  var _addFilter = (field, value) => {
    var _invert, _filter;
    if (value.startsWith(NEGATE)) {
      _invert = true;
      value = value.substr(NEGATE.length).trim();
    }
    if (value.startsWith(CONTAINS)) {
      value = value.substr(CONTAINS.length).trim();
      if (value) _filter = {
        "$contains": [value]
      };
    } else if (value.startsWith(REGEX)) {
      value = value.substr(REGEX).trim();
      if (value) _filter = {
        "$regex": [RegExp.escape(value), "i"]
      };
    } else if (value.startsWith(LTE[0]) || value.startsWith(LTE[1])) {
      value = value.substr(LTE[0]).trim();
      if (value) _filter = {
        "$lte": value.toLowerCase() == NOW ? new Date() : value
      };
    } else if (value.startsWith(GTE[0]) || value.startsWith(GTE[1])) {
      value = value.substr(GTE[0]).trim();
      if (value) _filter = {
        "$gte": value.toLowerCase() == NOW ? new Date() : value
      };
    } else if (value.startsWith(NE)) {
      value = value.substr(NE.length).trim();
      if (value) _filter = {
        "$ne": value
      };
    } else if (value.startsWith(CONTAINS_NONE[0]) || value.startsWith(CONTAINS_NONE[1])) {
      value = value.substr(CONTAINS_NONE[0].lengh).trim();
      if (value) _filter = {
        "$containsNone": [value]
      };
    } else if (value.startsWith(EQ)) {
      value = value.substr(EQ.length).trim();
      if (value) _filter = {
        "$aeq": value
      };
    } else if (value.startsWith(GT)) {
      value = value.substr(GT.length).trim();
      if (value) _filter = {
        "$gt": value.toLowerCase() == NOW ? new Date() : value
      };
    } else if (value.startsWith(LT)) {
      value = value.substr(LT.length).trim();
      if (value) _filter = {
        "$lt": value.toLowerCase() == NOW ? new Date() : value
      };
    } else if (value.indexOf(BETWEEN) > 0) {
      var _value = value.split(BETWEEN);
      if (_value.length == 2) {
        var val_1 = _value[0].trim(),
            val_2 = _value[1].trim();
        if (val_1 && val_2) _filter = {
          "$between": [val_1, val_2]
        };
      } else if (value) {
        _filter = {
          "$regex": [RegExp.escape(value), "i"]
        };
      }
    } else if (value == VALUED) {
      _filter = {
        "$aeq" : undefined
       };
    } else if (value) {
      if (value.toLowerCase() == PAST) {
        _filter = {
          "$lt": new Date()
        };
      } else if (value.toLowerCase() == FUTURE) {
        _filter = {
          "$gt": new Date()
        };
      } else if (value.toLowerCase() == TODAY) {
        _filter = {
          "$between": [moment().startOf("day"), moment().endOf("day")]
        };
      } else {
        _filter = {
          "$regex": [RegExp.escape(value), "i"]
        };
      }
    }
    if (_filter) {
      if (_invert) {
        options.inverted[field] = _filter;
        delete options.normal[field];
      } else {
        options.normal[field] = _filter;
        delete options.inverted[field];
      }
    } else {
      delete options.normal[field];
      delete options.inverted[field];
    }
  };

  var _removeFilter = (field, filters) => filters ? delete filters[field] : false;
  /* <!-- Internal Methods --> */

  /* <!-- External Visibility --> */
  return {

    add: (field, value) => _addFilter(field, value),

    get: field => options.inverted[field] ? {
      filter: options.inverted[field],
      inverted: true
    } : options.normal[field] ? {
      filter: options.normal[field]
    } : null,

    remove: field => _removeFilter(field, options.normal[field] ? options.normal : options.inverted[field] ? options.inverted : false),

    filter: rows => {
      if (!_.isEmpty(options.inverted)) {
        var _inversion = _createQuery(options.inverted, "$or");
        var _exclude = new Set(rows.copy().find(_inversion).data().map(v => v.$loki));
        rows = rows.where(v => !_exclude.has(v.$loki));
      }
      if (!_.isEmpty(options.normal)) {
        rows = rows.find(_createQuery(options.normal));
      }
      return rows;
    },

    normal: () => options.normal,

    inverted: () => options.inverted,

  };
  /* <!-- External Visibility --> */

};