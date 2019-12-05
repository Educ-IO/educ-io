Decode = options => {
  "use strict";
  
  /* <!-- MODULE: Provides an decoding of a form/s report files --> */
  /* <!-- PARAMETERS: Receives the global app context, the forms being analysed and the saved report files --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
          meta : "__meta",
          empty : "",
          email : /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi
        }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */
  
  /* <!-- Internal State Variable --> */
  /* <!-- Internal State Variable --> */

  /* <-- Meta Functions --> */
  FN.meta = {
    
    fields : (forms, type) => _.reduce(_.isArray(forms) ? forms : [forms], (memo, form) => {
      return _.reduce(form.template.groups, (memo, group) =>
        _.reduce(_.filter(group.fields, field => field[options.meta] && field[options.meta].index &&
            (!type || (type && field[options.meta].analyse.type == type))),
          (memo, field) => _.find(memo, {
            title: field.title || field.field
          }) ? memo :
          memo.concat({
            id: field.field,
            title: field.title || field.field,
            type: field[options.meta].analyse ? field[options.meta].analyse.type : null,
            template: field.template,
            badges: field.template == "field_radio" && field.options ?
              _.map(field.options, option => ({
                value: option.value,
                badge: option.class && option.class.indexOf("-") >= 0 ?
                  option.class.split("-")[1] : options.empty
              })) : null,
            numerics: field.template == "field_radio" && field.options ?
              _.map(field.options, option => ({
                value: option.value,
                numeric: option.numeric === null || option.numeric === undefined ?
                  null : option.numeric
              })) : null
          }), memo), memo);
    }, []),
  
    properties : (report, fields, lower) => _.reduce(fields, (memo, field) => {
      var _val = report.appProperties[`FIELD.${field.id}`],
          _name = field.title || field.id;
      memo[lower ? _name.toLowerCase() : _name] = _val ? JSON.parse(_val) : options.empty;
      return memo;
    }, {}),
    
  };
  /* <-- Meta Functions --> */
  
  /* <-- Value Functions --> */
  FN.values = (form, report, filter, use, initial) => _.reduce(form.groups, (memo, group) =>
      _.reduce(_.filter(group.fields, field => field[options.meta] && filter(field[options.meta])),
        (memo, field) => {
          var _field = report[field.field];
          if (_field && (_field.Value || _field.Values))
            use(_field.Value || _field.Values, field.field, field[options.meta], memo);
          return memo;
        }, memo), initial);

  FN.addresses = (type, form, report) => {
      var _values = FN.values(form, report, meta => meta[type], (value, field, meta, memo) => memo.push(value), []);
      return _.chain(_values).reduce((memo, value) => memo.concat(value ?
        value.match(options.email) : []), []).filter(value => value).value();
    },
  /* <-- Value Functions --> */
  
  /* <-- Get Files (e.g. Evidence Files) from Report --> */
  FN.files = report => {
    var _reduction = (memo, values) => _.reduce(values, (memo, value) => {
      if (_.isObject(value)) value.Value && value.Kind && value.Mime && value.Value.Id ?
        memo.push({
          kind: value.Kind,
          id: value.Value.Id,
          mime: value.Mime
        }) : (memo = _reduction(memo, value));
      return memo;
    }, memo);
    return _reduction([], report);
  };
  
  /* <!-- External Visibility --> */
  return {

    clean : form => _.omit(form, options.meta),
    
    email : options.email,
    
    meta : FN.meta,
    
    addresses : FN.addresses,
    
    files : FN.files,
    
    values : FN.values,
    
  };
  /* <!-- External Visibility --> */
};