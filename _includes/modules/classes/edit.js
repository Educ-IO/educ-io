Edit = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      rows : 5,
    },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.classes = classrooms => `${classrooms.length} ${classrooms.length > 1 ? "Classes" : "Class"}`;
  
  FN.confirm = (id, title, message, classroom, action) => factory.Display.confirm({
                    id: id,
                    title: title,
                    message: factory.Display.doc.get({
                      name: message,
                      content: classroom
                    }),
                    action: action,
                  });
  
  FN.update = (classroom, field) => {
    options.functions.populate.update(classroom);
    var _row = options.state.session.table.table().find(`tbody tr[data-id='${classroom.$id}']`),
        _cell = _row.find(`td:nth-child(${options.functions.common.column(field) + 1})`).first();
    
    /* <!-- Updated the Edited Cell --> */
    options.functions.common.cell(_cell, classroom[field]);
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Edit Functions --> */
  FN.edit = {
    
    state : (filter, state, id, title, message, action, busy, error, cancel) => classrooms => Promise.resolve(_.filter(classrooms, filter))
      .then(classrooms => classrooms.length > 0 ? FN.confirm(id, title, message, FN.classes(classrooms), action)
        .then(confirm => confirm ? 
            Promise.all(_.map(classrooms, classroom => factory.Google.classrooms.classroom(classroom).update({
              courseState: state
            }).then(result => FN.update(_.tap(classroom, classroom => classroom.state = result.courseState), "state"))))
            .catch(e => factory.Flags.error(error, e))
            .then(factory.Main.busy(busy, true)) : false)
      .catch(e => (e ? factory.Flags.error(error, e) : factory.Flags.log(cancel)).negative()) : false),
    
  };
  /* <!-- Edit Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
      
    activate : FN.edit.state(c => c.state == "ARCHIVED", "ACTIVE", "activate_Classes", "Activate Classes", "ACTIVATE_CLASSES", "Activate",
                              "Activating Classes", "Class Activation Error", "Class Activation Cancelled"),
    
    archive : FN.edit.state(c => c.state == "ACTIVE", "ARCHIVED", "archive_Classes", "Archive Classes", "ARCHIVE_CLASSES", "Archive",
                              "Archiving Classes", "Class Archiving Error", "Class Archiving Cancelled"),
    
  };
  /* <!-- External Visibility --> */

};