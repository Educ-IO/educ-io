Roster = (options, factory) => {
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
  FN.classes = classrooms => classrooms.length > 1 ? `${classrooms.length} Classes` : "Class";
  
  FN.prompt = (id, title, message, content, action) => factory.Display.text({
                    id: id,
                    title: title,
                    message: factory.Display.doc.get({
                      name: message,
                      content: content
                    }),
                    action: action,
                    rows: options.rows
                  }).then(values => !values ? false : _.chain(values.split("\n")).map(value => value.trim()).compact().value());
  
  FN.confirm = (id, message, person, classroom, action) => factory.Display.confirm({
                    id: id,
                    message: [
                      factory.Display.doc.get("REMOVE"),
                      factory.Display.doc.get({
                        name: message,
                        content: person
                      }),
                      factory.Display.doc.get({
                        name: "CLASSROOM",
                        content: classroom
                      })
                    ].trim().join("\n"),
                    action: action,
                  });
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
      
    add : {
      
      students : classrooms => FN.prompt("add_Students", "Add Students", "ADD_STUDENTS", FN.classes(classrooms), "Add")
                                .then(students => students ? Promise.all(_.map(classrooms, 
                                        classroom => Promise.resolve(factory.Google.classrooms.classroom(classroom).students())
                                          .then(api => Promise.all(_.map(students, student => api.add(student, classroom.code)
                                                         .catch(e => factory.Flags.error("Add Student Error", e).negative()))))))
                                      .then(factory.Main.busy("Adding Students", true)) : false)
                  .catch(e => (e ? factory.Flags.error("Add Students Error", e) : factory.Flags.log("Add Students Cancelled")).negative()),
      
      teachers : classrooms => FN.prompt("add_Teachers", "Add Teachers", "ADD_TEACHERS", FN.classes(classrooms), "Add")
                                .then(teachers => teachers ? Promise.all(_.map(classrooms, 
                                        classroom => Promise.resolve(factory.Google.classrooms.classroom(classroom).teachers())
                                          .then(api => Promise.all(_.map(teachers, teacher => api.add(teacher)
                                                         .catch(e => factory.Flags.error("Add Teacher Error", e).negative()))))))
                                      .then(factory.Main.busy("Adding Teachers", true)) : false)
                  .catch(e => (e ? factory.Flags.error("Add Teachers Error", e) : factory.Flags.log("Add Teachers Cancelled")).negative()),
      
    },
    
    invite : {
      
      students : classrooms => FN.prompt("invite_Students", "Invite Students", "INVITE_STUDENTS", FN.classes(classrooms), "Invite")
                                .then(students => students ? Promise.all(_.map(classrooms, 
                                        classroom => Promise.resolve(factory.Google.classrooms.classroom(classroom).students())
                                          .then(api => Promise.all(_.map(students, student => api.invite(student)
                                                         .catch(e => factory.Flags.error("Invite Student Error", e).negative()))))))
                                      .then(factory.Main.busy("Inviting Students", true)) : false)
                  .catch(e => (e ? factory.Flags.error("Invite Students Error", e) : factory.Flags.log("Invite Students Cancelled")).negative()),
      
      teachers : classrooms => FN.prompt("invite_Teachers", "Invite Teachers", "INVITE_TEACHERS", FN.classes(classrooms), "Invite")
                                .then(teachers => teachers ? Promise.all(_.map(classrooms, 
                                        classroom => Promise.resolve(factory.Google.classrooms.classroom(classroom).teachers())
                                          .then(api => Promise.all(_.map(teachers, teacher => api.invite(teacher)
                                                         .catch(e => factory.Flags.error("Invite Teacher Error", e).negative()))))))
                                      .then(factory.Main.busy("Inviting Teachers", true)) : false)
                  .catch(e => (e ? factory.Flags.error("Invite Teachers Error", e) : factory.Flags.log("Invite Teachers Cancelled")).negative()),
      
    },
    
    remove : {
      
      student : (classroom, person) => {
        person = _.find(classroom.$students, student => student.profile.id == person);
        return FN.confirm("remove_Student", "STUDENT", person.profile.name.fullName,
                            `${classroom.name} (Owned By: ${classroom.owner.text})`, "Remove")
                .then(confirm => confirm ? 
                      factory.Google.classrooms.classroom(classroom).students().remove(person.profile.id)
                        .then(factory.Main.busy("Removing Student", true)) : false)
                .catch(e => (e ? factory.Flags.error("Student Removal Error", e) : factory.Flags.log("Student Removal Cancelled")).negative());
      },
      
      students : classrooms => FN.prompt("remove_Students", "Remove Students", "REMOVE_STUDENTS", FN.classes(classrooms), "Remove")
                                .then(students => students ? Promise.all(_.map(classrooms, 
                                        classroom => Promise.resolve(factory.Google.classrooms.classroom(classroom).students())
                                          .then(api => Promise.all(_.map(students, student => api.remove(student)
                                                         .catch(e => factory.Flags.error("Remove Student Error", e).negative()))))))
                                      .then(factory.Main.busy("Removing Students", true)) : false)
                  .catch(e => (e ? factory.Flags.error("Remove Students Error", e) : factory.Flags.log("Remove Students Cancelled")).negative()),
      
      teacher : (classroom, person) => {
        person = _.find(classroom.$teachers, teacher => teacher.profile.id == person);
        return FN.confirm("remove_Teacher", "TEACHER", person.profile.name.fullName,
                            `${classroom.name} (Owned By: ${classroom.owner.text})`, "Remove")
                .then(confirm => confirm ? 
                      factory.Google.classrooms.classroom(classroom).teachers().remove(person.profile.id)
                        .then(factory.Main.busy("Removing Teacher", true)) : false)
                .catch(e => (e ? factory.Flags.error("Teacher Removal Error", e) : factory.Flags.log("Teacher Removal Cancelled")).negative());
      },
      
      teachers : classrooms => FN.prompt("remove_Teachers", "Remove Teachers", "REMOVE_TEACHERS", FN.classes(classrooms), "Remove")
                                .then(teachers => teachers ? Promise.all(_.map(classrooms, 
                                        classroom => Promise.resolve(factory.Google.classrooms.classroom(classroom).teachers())
                                          .then(api => Promise.all(_.map(teachers, teacher => api.remove(teacher)
                                                         .catch(e => factory.Flags.error("Remove Teacher Error", e).negative()))))))
                                      .then(factory.Main.busy("Removing Teachers", true)) : false)
                  .catch(e => (e ? factory.Flags.error("Remove Teachers Error", e) : factory.Flags.log("Remove Teachers Cancelled")).negative()),
      
    },
    
    move : {
      
      student : (classroom, person) => {
        
        person = _.find(classroom.$students, student => student.profile.id == person);

        return factory.Display.modal("select", {
          id: "select_target",
          target: factory.container,
          title: "Select Target Class/es",
          instructions: factory.Display.doc.get("SELECT_TARGETS"),
          validate: values => values && values.Classes,
          data: _.chain(options.functions.populate.all().data).map(classroom => ({
            id : classroom.$id,
            name : `${classroom.section ? `${classroom.section} | `: ""}${classroom.name}`,
          })).sortBy("name").value(),
          enter: true
        })
        .then(values => values && values.Classes && values.Classes.Values ? 
                factory.Display.confirm({
                    message: [
                      factory.Display.doc.get({
                        name: "MOVE",
                        content: person.profile.name.fullName
                      }),
                      factory.Display.doc.get({
                        name: "CLASSROOM",
                        content: classroom.name
                      }),
                      factory.Display.doc.get({
                        name: "TARGET",
                        content: values.Classes.Values.length
                      })
                    ].trim().join("\n"),
                    action: "Move",
                  })
                .then(confirm => confirm ? Promise.all([factory.Google.classrooms.classroom(classroom).students().remove(person.profile.id).catch(() => false)]
                .concat(_.map(values.Classes.Values, 
                      classroom => factory.Google.classrooms.classroom(classroom = options.functions.populate.get(classroom)).students()
                              .add(person.profile.id, classroom.code).catch(() => false)))).then(factory.Main.busy("Moving Student", true)) : 
                      null) : null)
        .catch(e => (e ? factory.Flags.error("Move Error", e) : factory.Flags.log("Move Cancelled")).negative());

      },
      
    },
    
  };
  /* <!-- External Visibility --> */

};