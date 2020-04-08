Usage = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */
  
  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.recent = (value, classroom) => {
    if (!classroom.$usage || classroom.$usage < value) classroom.$usage = value;
    return value;
  };
  
  FN.members = (usage, id, key, value, badge, suffix, name) => options.functions.common.badge(usage, id, key, value === 0 ?
      `There are <strong>no</strong> ${name || "student"}s${suffix ? ` ${suffix}`: ""} in this class` : 
        value === 1 ? `There is <strong>one</strong> ${name || "student"}${suffix ? ` ${suffix}`: ""} in this class` :
          `There are <strong>${value}</strong> ${name || "student"}s${suffix ? ` ${suffix}`: ""} in this class`, value, badge);
  
  FN.update = (usage, id, key, date, type, text, creator) => options.functions.common.badge(usage, id, key,
      `Last Updated ${type}<br /><strong>${date.format("LLL")}</strong>${text && creator ? `<br /><em>${text}</em> | <strong>${creator}<strong>`: ""}`,
      date.fromNow(), options.functions.common.colour(0 - date.diff()));
  
  FN.usage = (id, targets, types, event) => Promise.resolve(options.functions.populate.get(id))
    .then(classroom => classroom ? Promise.all([
        options.functions.common.type(types, "students") ? options.functions.people.students(classroom)
            .then(value => (factory.Main.event(event, factory.Main.message(classroom.$students.length || 0, "student", "students")), value)) :
          Promise.resolve(true),
        options.functions.common.type(types, "announcements") ? options.functions.classes.announcements(classroom)
            .then(value => (factory.Main.event(event, factory.Main.message(value ? value.length || 0 : 0, "announcement", "announcements")), value)) :
          Promise.resolve(true),
        options.functions.common.type(types, "work") ? options.functions.classes.work(classroom)
            .then(value => (factory.Main.event(event, factory.Main.message(value ? value.length || 0 : 0, "assignment", "assignments")), value)) :
          Promise.resolve(true),
        options.functions.common.type(types, "invitations") ? options.functions.classes.invitations(classroom)
            .then(value => (factory.Main.event(event, factory.Main.message(value ? value.length || 0 : 0, "invitation", "invitations")), value)) :
          Promise.resolve(true),
        options.functions.common.type(types, "teachers", true) ? options.functions.people.teachers(classroom)
            .then(value => (factory.Main.event(event, factory.Main.message(classroom.$teachers.length || 0, "teacher", "teachers")), value)) :
          Promise.resolve(true),
        options.functions.common.type(types, "topics") ? options.functions.classes.topics(classroom, true)
            .then(value => (factory.Main.event(event, factory.Main.message(value ? value.length || 0 : 0, "topic", "topics")), value)) :
          Promise.resolve(true),
      ]).then(results => {
    
        /* <!-- Log Classroom Usage --> */
        factory.Flags.log(`Usage for Classroom [${id}]`, results);
    
        /* <!-- Add Student Numbers --> */
        if (results[0] !== true) FN.members(classroom.usage, `${id}_usage_students`, "Students", classroom.$students.length, "primary");
    
        /* <!-- Add Guardian Numbers --> */
        if (results[0] !== true && classroom.guardians) FN.members(classroom.usage, `${id}_usage_guardians`, "Guardians", 
          _.filter(classroom.$students, student => student.guardians && student.guardians.length > 0).length,
          "dark", "(with invited guardians)");
    
        /* <!-- Add Announcements --> */
        if (results[1] !== true && classroom.$announcements && classroom.$announcements.length > 0 && classroom.$announcements[0]) {
          
          var _teacher = options.functions.common.parse(_.filter(classroom.$announcements, 
                                                                 announcement => classroom.$$$teachers.indexOf(announcement.creatorUserId) >= 0)),
              _student = options.functions.common.parse(_.filter(classroom.$announcements,
                                                                 announcement => classroom.$$$students.indexOf(announcement.creatorUserId) >= 0));
          
          /* <!-- Teacher Announcements --> */
          if (_teacher.length > 0) {
            FN.recent(_teacher[0].timestamp, classroom);  
            options.functions.common.badge(classroom.usage, `${id}_usage_announcement_teacher`, "Teacher Announcement", "",
                    _teacher[0].date, _teacher[0].badge, factory.Display.template.get("popover_announcements")(_teacher)); 
          }

          /* <!-- Student Announcements --> */
          if (_student.length > 0) options.functions.common.badge(classroom.usage, `${id}_usage_announcement_student`, "Student Announcement", "",
                    _student[0].date, _student[0].badge, factory.Display.template.get("popover_announcements")(_student));
          
        }

        /* <!-- Add Work --> */
        if (results[2] !== true && classroom.$work && classroom.$work.length > 0 && classroom.$work[0]) {
          var _work = options.functions.common.parse(classroom.$work);
          FN.recent(_work[0].timestamp, classroom);
          options.functions.common.badge(classroom.usage, `${id}_usage_work`, "Classwork", "", _work[0].date,
                    _work[0].badge, factory.Display.template.get("popover_classworks")(_work));
        }

        /* <!-- Add Invitations --> */
        if (results[3] !== true && classroom.$invitations) {
          
          /* <!-- Add Student Invitations --> */
          if (classroom.$invitations.students && classroom.$invitations.students.length > 0)
            FN.members(classroom.usage, `${id}_usage_invites_student`, "Invited Students", classroom.$invitations.students.length, "light", "(invited)");
          
          /* <!-- Add Staff Invitations --> */
          if (classroom.$invitations.teachers && classroom.$invitations.teachers.length > 0)
            FN.members(classroom.usage, `${id}_usage_invites_teachers`, "Invited Teachers", classroom.$invitations.teachers.length, 
                       "light", "(invited)", "teacher");
          
        }
    
        /* <!-- Add Topics --> */
        if (results[5] !== true && classroom.$topics && classroom.$topics.length > 0)
          options.functions.common.badge(classroom.usage, `${id}_usage_topics`, "Topics", "", classroom.$topics.length, "info", 
                    factory.Display.template.get("popover_topics")(options.functions.common.parse(classroom.$topics)), "");
        
        /* <!-- Update the class object, and call for a visual update --> */
        options.functions.populate.update(classroom);
      
        /* <!-- Remove the loader to inform that loading has completed --> */
        _.each(["teachers", "students", "usage", "fetched"], 
               value => targets[value].empty().append(factory.Display.template.get("cell", true)(classroom[value])));
        
      }) : false);
  /* <!-- Internal Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Public Functions --> */
  FN.meta = () => ({
    fetched: options.functions.common.column("fetched") + 1,
    students : options.functions.common.column("students") + 1,
    teachers : options.functions.common.column("teachers") + 1,
    usage : options.functions.common.column("usage") + 1,
  });
  
  FN.row = (meta, row, force, types) => {
    
    var _students = row.find(`td:nth-child(${meta.students})`).first(),
        _teachers = row.find(`td:nth-child(${meta.teachers})`).first(),
        _fetched = row.find(`td:nth-child(${meta.fetched})`).first(),
        _usage = row.find(`td:nth-child(${meta.usage})`).first();
    
    var _id = row.data("id"),
        _event = `${options.functions.events.usage.progress}-${_id}`;
    
    return _usage && (force || _usage.html() == "") ? FN.usage(_id, {
      students: _students,
      teachers: _teachers,
      fetched: _fetched,
      usage: factory.Main.busy_element(force ? _usage.empty() : _usage, _event, "Gathering Usage")
    }, types, _event) : Promise.resolve(null);
    
  };
  
  FN.generate = force => {
    var _meta = FN.meta();
    return Promise.all(_.map(options.state.session.table.table().find("tbody tr[data-id]").toArray(), el => FN.row(_meta, $(el), force)));
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
   
    generate: FN.generate,
    
    /* <!-- Types - array / string of usage that is used to update the usage (null / false) --> */
    update: (id, force, types) => FN.row(FN.meta(), options.state.session.table.table().find(`tbody tr[data-id='${id}']`), force, types),
      
  };
  /* <!-- External Visibility --> */

};