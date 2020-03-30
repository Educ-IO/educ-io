Usage = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id : "summary",
    },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.column = name => options.state.session.table.index(name);
  
  FN.badge = duration => {
    var _days = duration.valueOf() / 1000 / 60 / 60 / 24;
    return _days >= 21 ? "danger" :
      _days >= 7 ? "warning" : "success";
  };
  
  FN.add = (usage, data) => {
    var _existing = _.findIndex(usage, value => value.type == data.type);
    _existing >= 0 ? usage[_existing] = data : usage.push(data);
  };
  
  FN.members = (usage, id, key, value, badge, suffix) => FN.add(usage, {
      id: id,
      key: key,
      type: key.toLowerCase(),
      title: value === 0 ? `There are <strong>no</strong> students${suffix ? ` ${suffix}`: ""} in this class` : 
        value === 1 ? `There is <strong>one</strong> student${suffix ? ` ${suffix}`: ""} in this class` :
          `There are <strong>${value}</strong> students${suffix ? ` ${suffix}`: ""} in this class`,
      value: value,
      badge: badge
    });
  
  FN.update = (usage, id, key, date, type, text, creator) => FN.add(usage, {
    id: id,
    key: key,
    type: key.toLowerCase(),
    title: `Last Updated ${type}<br /><strong>${date.format("LLL")}</strong>${text && creator ? `<br /><em>${text}</em> | <strong>${creator}<strong>`: ""}`,
    value: date.fromNow(),
    badge: FN.badge(0 - date.diff())
  });
  
  FN.type = (types, type) => types === null || types === undefined || types == type || _.indexOf(types, type) >= 0;
  
  FN.usage = (id, targets, types) => Promise.resolve(options.functions.populate.get(id))
    .then(classroom => classroom ? Promise.all([
        FN.type(types, "students") ? options.functions.people.students(classroom) : Promise.resolve(true),
        FN.type(types, "announcements") ? options.functions.classes.announcements(classroom) : Promise.resolve(true),
        FN.type(types, "work") ? options.functions.classes.work(classroom) : Promise.resolve(true),
        FN.type(types, "invitations") ? options.functions.classes.invitations(classroom) : Promise.resolve(true),
      ]).then(results => {
    
        /* <!-- Log Classroom Usage --> */
        factory.Flags.log(`Usage for Classroom [${id}]`, classroom);
    
        /* <!-- Add Student Numbers --> */
        if (results[0] !== true) FN.members(classroom.usage, `${id}_usage_students`, "Students", classroom.$students.length, "primary");
    
        /* <!-- Add Guardian Numbers --> */
        if (results[0] !== true && classroom.guardians) FN.members(classroom.usage, `${id}_usage_guardians`, "Guardians", 
          _.filter(classroom.$students, student => student.guardians && student.guardians.length > 0).length,
          "dark", "(with invited guardians)");
    
        /* <!-- Add Announcements --> */
        if (results[1] !== true && classroom.$announcements && classroom.$announcements.length > 0 && classroom.$announcements[0])
          FN.update(classroom.usage, `${id}_usage_announcement`, "Announcement", factory.Dates.parse(classroom.$announcements[0].updateTime), 
                    "Announcement", classroom.$announcements[0].text, classroom.$announcements[0].creator.text || classroom.$announcements[0].creator);

        /* <!-- Add Work --> */
        if (results[2] !== true && classroom.$work && classroom.$work.length > 0 && classroom.$work[0])
          FN.update(classroom.usage, `${id}_usage_announcement`, "Classwork", factory.Dates.parse(classroom.$work[0].updateTime),
                    "Classwork", classroom.$work[0].title, classroom.$work[0].creator.text || classroom.$work[0].creator);

        /* <!-- Add Student Invitations --> */
        if (results[3] !== true && classroom.$invitations && classroom.$invitations.students && classroom.$invitations.students.length > 0)
          FN.members(classroom.usage, `${id}_usage_invites`, "Invites", classroom.$invitations.students.length, "light", "(invited)");
    
        /* <!-- Update the class object, and call for a visual update --> */
        options.functions.populate.update(classroom);
      
        /* <!-- Remove the loader to inform that loading has completed --> */
        targets.students.empty().append(factory.Display.template.get("cell", true)(classroom.students));
        targets.usage.empty().append(factory.Display.template.get("cell", true)(classroom.usage));
    
      }) : false);
  /* <!-- Internal Functions --> */
  
  /* <!-- Render Functions --> */
  FN.busy = el => el.append($(factory.Display.template.get({
        name: "loader",
        size: "small"
      })));
  /* <!-- Render Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Public Functions --> */
  FN.meta = () => ({
    students : FN.column("students") + 1,
    teachers : FN.column("teachers") + 1,
    usage : FN.column("usage") + 1,
  });
  
  FN.row = (meta, row, force, types) => {
    
    var _students = row.find(`td:nth-child(${meta.students})`).first(),
        _teachers = row.find(`td:nth-child(${meta.teachers})`).first(),
        _usage = row.find(`td:nth-child(${meta.usage})`).first();
    
    return _usage && (force || _usage.html() == "") ? FN.usage(row.data("id"), {
      students: _students,
      teachers: _teachers,
      usage: FN.busy(force ? _usage.empty() : _usage),
    }, types) : Promise.resolve(null);
    
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