Edit = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      email : /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi,
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
  FN.cell = (id, field) => options.state.session.table.table().find(`tbody tr[data-id='${id}']`)
    .find(`td:nth-child(${options.functions.common.column(field) + 1})`).first();
  
  FN.classes = classrooms => `${classrooms.length} ${classrooms.length > 1 ? "Classes" : "Class"}`;
  
  FN.prompt = (id, title, message, content, action) => factory.Display.text({
                    id: id,
                    title: title,
                    message: factory.Display.doc.get(message),
                    simple: true,
                    action: action
                  });
  
  FN.confirm = (id, title, message, classroom, action, value) => factory.Display.confirm({
                    id: id,
                    title: title,
                    message: factory.Display.doc.get({
                      name: message,
                      data: value ? {
                        content: classroom,
                        value: value,
                      } : {
                        content: classroom,
                      },
                    }),
                    action: action,
                  });
  
  FN.editing = (classroom, field, value) => factory.Display.template.show({
        template: "editing",
        target: FN.cell(classroom.$id, field),
        value: value ? value : _.isObject(classroom[field]) ? classroom[field].text : classroom[field],
        clear: true
      });
  
  FN.restore = (classroom, field) => options.functions.common.cell(FN.cell(classroom.$id, field), classroom[field]);
  
  FN.update = (classroom, field) => {
    options.functions.populate.update(classroom);
    FN.restore(classroom, field);
    return classroom;
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Edit Functions --> */
  FN.edit = {
    
    field : (classroom, field, value) => {
      var _update = {};
      _update[field] = value;
      return _.isObject(classroom[field]) && classroom[field].text === value || classroom[field] === value ?
        Promise.resolve(false) :
        factory.Google.classrooms.classroom(classroom).update(_update)
          .then(result => FN.update(_.tap(classroom, 
            classroom => {
              if (!result) return;
              if (classroom[`$$${field}`] !== undefined) classroom[`$$${field}`] = value;
              _.isObject(classroom[field]) ? classroom[field].text = value : classroom[field] = value;
            }), field))
          .catch(e => factory.Flags.error("Field Update Failed", e));
    },
    
    state : (filter, state, id, title, message, action, busy, error, cancel) => classrooms => Promise.resolve(_.filter(classrooms, filter))
      .then(classrooms => classrooms.length > 0 ? FN.confirm(id, title, message, FN.classes(classrooms), action)
        .then(confirm => confirm ? 
            Promise.all(_.map(classrooms, classroom => factory.Google.classrooms.classroom(classroom).update({
              courseState: state
            }).then(result => FN.update(_.tap(classroom, classroom => {
              classroom.$$state = result.courseState;
              classroom.state = options.functions.populate.state(result);
            }), "state"))))
            .catch(e => factory.Flags.error(error, e))
            .then(factory.Main.busy(busy, true)) : false)
      .catch(e => (e ? factory.Flags.error(error, e) : factory.Flags.log(cancel)).negative()) : false),                  
    
    owner : (classrooms, value) => FN.confirm("transfer_Classes", "Transfer Ownership", "TRANSFER_OWNERSHIP", FN.classes(classrooms), "Transfer", value).then(confirm => confirm ? 
            Promise.all(_.map(classrooms, classroom => Promise.resolve(factory.Google.classrooms.classroom(classroom).teachers())
              .then(api => api.add(value).catch(e => factory.Flags.error("Co-Teacher Add Error", e)))
              .then(() => factory.Google.classrooms.classroom(classroom).update({
                ownerId: value
              }))
              .then(result => options.functions.people.person(result.ownerId))
              .then(result => FN.update(_.tap(classroom, classroom => {
                classroom.$$owner = result.text;
                classroom.owner = _.extend(classroom.owner, options.functions.people.name(result));
              }), "owner"))))
              .catch(e => factory.Flags.error("Class Transfer Error", e))
              .then(factory.Main.busy("Transferring Classes", true)) : false)
        .catch(e => (e ? factory.Flags.error("Class Transfer Error", e) : factory.Flags.log("Class Transfer Cancelled")).negative()),
    
  };
  /* <!-- Edit Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
      
    activate : FN.edit.state(c => c.state == "ARCHIVED" || c.state.text == "ARCHIVED", "ACTIVE", "activate_Classes", "Activate Classes",
                             "ACTIVATE_CLASSES", "Activate", "Activating Classes", "Class Activation Error", "Class Activation Cancelled"),
    
    archive : FN.edit.state(c => c.state == "ACTIVE" || c.state.text == "ACTIVE", "ARCHIVED", "archive_Classes", "Archive Classes",
                            "ARCHIVE_CLASSES", "Archive", "Archiving Classes", "Class Archiving Error", "Class Archiving Cancelled"),
    
    field : (classroom, field, value) => {
      
      classroom = _.isObject(classroom) ? classroom : options.functions.populate.get(classroom);
      if (!classroom) return;
      
      var _edit = FN.editing(classroom, field, value),
          _restore = () => FN.restore(classroom, field),
          _save = () => {
            factory.Main.busy(null, false, null, null, "small", _restore().find("a[data-action='edit']"), null, false, true);
            return FN.edit.field(classroom, field, _edit.find("input").val()).then(_restore);
          };
      
      _edit.find("button").on("click.action", e => $(e.currentTarget || e.target).data("action") == "save" ? _save() : _restore());
      
      _edit.find("input").focus().on("keydown.action", e => {
        var code = typeof e.keyCode != "undefined" && e.keyCode ? e.keyCode : e.which;
        if (code === 13) {
          e.preventDefault(); /* <!-- Enter Pressed --> */
          _save();  
        } else if (code === 27) {
          e.preventDefault(); /* <!-- Escape Key Pressed --> */
          _restore();
        }
      });
                              
    },
    
    transfer : classrooms => classrooms.length > 0 ? FN.prompt("prompt_Owner", "New Owner", "ENTER_OWNER", "Transfer")
      .then(value => {
        if (!value) return false;
        value = value.match(options.email);
        return value && value.length > 0 ? FN.edit.owner(classrooms, value[0]) : false;
      }) : false,
    
  };
  /* <!-- External Visibility --> */

};