Gradesheet = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    property: {
        name: "EDUC-IO-CLASSES",
        value: "GRADESHEET",
      },
  },
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Row Functions --> */
  /* <!-- Row Functions --> */
  
  /* <!-- Public Functions --> */
  FN.row = row => Promise.all([
      Promise.resolve(options.functions.populate.get(row.classroom)),
      Promise.resolve(options.functions.populate.get(row.classwork, "classwork"))
    ])
    .then(data => {
      row.classroom = data[0];
      row.classwork = data[1];
      return row;
    });
  
  FN.rows = () => _.map(options.state.session.table.table().find("tbody tr[data-id][data-parent]").toArray(), el => {
    var _el = $(el);
    return FN.row({
      classroom : _el.data("parent"),
      classwork : _el.data("id"),
    });
  });
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    create: () => {
      factory.Flags.log("Creating Gradesheet", FN.rows());
      return new Promise(resolve => _.delay(resolve, _.random(1000, 3000)));
    },

    property: () => _.object([options.property.name], [options.property.value]),
    
    update: file => {
      factory.Flags.log(`Updating Gradesheet: ${file.id}`, FN.rows());
      return new Promise(resolve => _.delay(resolve, _.random(1000, 3000)));
    },
  };
  /* <!-- External Visibility --> */

};