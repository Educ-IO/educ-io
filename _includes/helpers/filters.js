Filters = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Parse string Filters and Builds a Filter Query for Loki --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.normal: Normal Filters [Optional]  --> */
  /* <!-- @options.inverted: Inverted Filters [Optional]  --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore, Moment or Day.Js | App Scope: Dates --> */

  /* <!-- Internal Consts --> */
  const NEGATE = "!!",
    CONTAINS = "$",
    REGEX = "##",
    LTE = ["<=", "=<"],
    GTE = [">=", "=>"],
    NOW = "now",
    NE = "<>",
    CONTAINS_NONE = ["!$", "$!"],
    EQ = "=",
    GT = ">",
    LT = "<",
    BETWEEN = "->",
    PAST = "past",
    FUTURE = "future",
    TODAY = "today",
    VALUED = "@@";
  const DEFAULTS = {
    normal: {},
    inverted: {}
  };
  const COMPLEX = ["$magic", "$regex", "$lte", "$gte", "$lt", "$gt", "$aeq", "$between"];
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Methods --> */
  var _createMagicFilter = filter => filter.$magic == PAST ? {
          "$lt": new Date()
        } : filter.$magic == FUTURE ? {
          "$gt": new Date()
        } : filter.$magic == TODAY ? {
          "$between": [factory.Dates.now().startOf("day"), factory.Dates.now().endOf("day")]
        } : filter;
  
  var _createFilter = filter => filter.$magic ? _createMagicFilter(filter) : filter;
  
  var _createQuery = (filters, join) => {
    
    var _query, _join = join ? join : "$and";
    _.map(_.keys(filters), field => {
      
      var _condition;
      /* <!-- Only run complex query if we are allowed and the comparator is in the COMPLEX list above --> */
      if (options.complex && COMPLEX.indexOf(_.keys(filters[field])[0]) >= 0) {
        var _condition_Normal = {},
            _condition_Complex = {},
            _condition_Primitive = {"$or" : _.map(["string", "number", "date"], primitive => {
              var _value = {};
              _value[field] = {"$type" : primitive};
              return _value;
            })};
        _condition_Normal[field] = _createFilter(filters[field]);
        /* <!-- If the 'normal' version of the property is not a primitive data type, e.g. it is an object, it won't match! --> */
        _condition_Normal = {"$and" : [_condition_Primitive, _condition_Normal]};
        _condition_Complex[options.complex == true ? 
                           `$$${field.replace(/^_+/, "")}` : 
                           `${options.complex}${field.replace(/^_+/, "")}`] = _createFilter(filters[field]);
        _condition = field.indexOf("__") === 0 ? _condition_Complex : {
          "$or" : [_condition_Normal, _condition_Complex],
        };
      } else {
        _condition = {};
        _condition[field] = _createFilter(filters[field]);
      }
      
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
      value = value.substr(LTE[0].length).trim();
      if (value) _filter = {
        "$lte": value.toLowerCase() == NOW ? new Date() : value
      };
    } else if (value.startsWith(GTE[0]) || value.startsWith(GTE[1])) {
      value = value.substr(GTE[0].length).trim();
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
      if (_value.length === 2) {
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
        "$or": [{
          "$in" : [undefined, null, ""]  
        }, {
          "$size" : 0  
        }]
      };
    } else if (value) {
      _filter = (value.toLowerCase() == PAST || value.toLowerCase() == FUTURE || value.toLowerCase() == TODAY) ? {
        "$magic": value.toLowerCase()
      } : {
        "$regex": [RegExp.escape(value), "i"]
      };
    }
    if (_filter) {
      if (_invert) {
        /* <!-- Add / Or for $fields here? --> */
        options.inverted[field] = _filter;
        delete options.normal[field];
      } else {
        /* <!-- Add / Or for $fields here? --> */
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
        factory.Flags.log("Inverted Rows Query:", _inversion);
        var _exclude = new Set(rows.copy().find(_inversion).data().map(v => v.$loki));
        rows = rows.where(v => !_exclude.has(v.$loki));
      } 
      if (!_.isEmpty(options.normal)) {
        var _query = _createQuery(options.normal);
        factory.Flags.log("Normal Rows Query:", _query);
        rows = rows.find(_query);
      }
      return rows;
    },

    normal: () => options.normal,

    inverted: () => options.inverted,

  };
  /* <!-- External Visibility --> */

};