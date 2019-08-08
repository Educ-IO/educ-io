Decode = (ಠ_ಠ, forms) => {
  "use strict";
  /* <!-- MODULE: Provides an decoding of a form/s report files --> */
  /* <!-- PARAMETERS: Receives the global app context, the forms being analysed and the saved report files --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const META = "__meta",
        EMPTY = "";
  /* <!-- Internal Constants --> */

  /* <!-- Internal State Variable --> */
  /* <!-- Internal State Variable --> */

  /* <!-- Internal Functions --> */

  /* <-- Generate Functions --> */
  var _fields = type => _.reduce(_.isArray(forms) ? forms : [forms], (memo, form) => {
      return _.reduce(form.template.groups, (memo, group) =>
        _.reduce(_.filter(group.fields, field => field[META] && field[META].index &&
            (!type || (type && field[META].analyse.type == type))),
          (memo, field) => _.find(memo, {
            title: field.title
          }) ? memo :
          memo.concat({
            id: field.field,
            title: field.title,
            type: field[META].analyse ? field[META].analyse.type : null,
            template: field.template,
            badges: field.template == "field_radio" && field.options ?
              _.map(field.options, option => ({
                value: option.value,
                badge: option.class && option.class.indexOf("-") >= 0 ?
                  option.class.split("-")[1] : EMPTY
              })) : null,
            numerics: field.template == "field_radio" && field.options ?
              _.map(field.options, option => ({
                value: option.value,
                numeric: option.numeric === null || option.numeric === undefined ?
                  null : option.numeric
              })) : null
          }), memo), memo);
    }, []);
  
  var _values = (report, fields, lower) => _.reduce(fields || _fields(), (memo, field) => {
      var _val = report.appProperties[`FIELD.${field.id}`],
          _name = field.title || field.id;
      memo[lower ? _name.toLowerCase() : _name] = _val ? JSON.parse(_val) : EMPTY;
      return memo;
    }, {});
  /* <-- Generate Functions --> */

  /* <!-- External Visibility --> */
  return {

    values: _values,
    
    fields: _fields,
    
  };
  /* <!-- External Visibility --> */
};