Report = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id: "report",
      format: "Do MMM, YYYY",
      db : "report"
    },
    FN = {},
    HIDDEN = ["ID", "State", "Code", "Owner", "Updated", "Students", "All_Students", "Teachers", "All_Teachers"];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- General Functions --> */
  FN.headers = {
    
    all : periods => ["ID", "State", "Code", {
          name : "Name",
          export : "Course Name",
        }, {
          name : "Section",
          export : "Course Section",
        }, {
          name : "Room",
          export : "Course Room",
        }, "Owner", "Guardians", "Created", "Updated", "Topics", "Students", {
          name : "All_Students",
          display : "All Students",
          export : "All Students",
          help : "Both current and invited Students"
        }, "Teachers", {
          name : "All_Teachers",
          display : "All Teachers",
          export : "All Teachers",
          help : "Both current and invited Teachers"
        }, "Person", "Role"]
      .concat(_.map(periods, period => ({
        name: `A_${period.code}`,
        display: `A: ${period.value} ${period.unit}`,
        help: `Announcements - ${period.text}`,
        icon: "chat_bubble_outline"
      })))
      .concat(_.map(periods, period => ({
        name: `C_${period.code}`,
        display: `C: ${period.value} ${period.unit}`,
        help: `Classwork - ${period.text}`,
        icon: "work_outline"
      })))
      .concat([{
        name : "Engaged",
        display : `Active in ${periods[periods.length - 1].text}`,
        help : "Whether individual has shown enagement with the Classroom in specified time period"
      }]),
    
    hidden : name => HIDDEN.indexOf(name) >= 0 || _.find(["A_", "C_"], value => name && name.indexOf(value) === 0),
    
  };
  
  FN.flatten = value => value ? value : "";
  /* <!-- General Functions --> */
  
  /* <!-- Render Functions --> */
  FN.render = {

    body: element => ರ‿ರ.body = factory.Display.template.show({
      template: "report_body",
      classes: ["pt-2"],
      target: element || factory.container,
      clear: true
    }),

    wrapper: () => ({
      classes: ["pt-1", "scroller"],
      id: options.id,
      header: factory.Display.template.get("report_header")({
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: "Report",
        subtitle: ರ‿ರ.since ?
          factory.Display.doc.get("CLASSES_SUBTITLE",
            humanizeDuration(factory.Dates.parse(options.state.session.current) - ರ‿ರ.since, {
              largest: 1
            }), true) : null,
        details: ರ‿ರ.since ? factory.Display.doc.get({
          name: "VIEW_DETAILS",
          data: {
            since: ರ‿ರ.since.format(options.format),
            current: factory.Dates.parse(options.state.session.current).format(options.format),
          }
        }) : null,
      }).trim()
    }),

    report: (classes, periods) => factory.Datatable(factory, {
      id: `${options.id}_TABLE`,
      name: options.id,
      data: options.functions.populate.report(classes, options.db),
      headers: options.state.application.tabulate.headers(FN.headers.all(periods), FN.headers.hidden),
    }, {
      classes: ["table-hover"],
      advanced: false,
      collapsed: true,
      wrapper: FN.render.wrapper(),
      complex: true,
    }, FN.render.body()),

  };
  /* <!-- Render Functions --> */

  /* <!-- Transform Functions --> */
  FN.class = (classroom, periods) => {
    
    var _classroom = {
      $id: classroom.$id,
      id: classroom.id,
      state: classroom.state,
      code: classroom.code,
      name : classroom.name,
      section : classroom.section,
      room : classroom.room,
      $$owner: classroom.$$owner,
      owner: classroom.owner,
      guardians : classroom.guardians,
      $$created: classroom.$$created,
      created: classroom.created,
      $$updated: classroom.$$updated,
      updated: classroom.updated,
      topics: FN.flatten(classroom.$topics ? classroom.$topics.length : 0),
      students: FN.flatten(classroom.students ? classroom.students.length : 0),
      all_students: FN.flatten((classroom.students ? classroom.students.length : 0) + 
                      (classroom.$invitations && classroom.$invitations.students ? classroom.$invitations.students.length : 0)),
      teachers: FN.flatten(classroom.students ? classroom.students.length : 0),
      all_teachers: FN.flatten((classroom.students ? classroom.students.length : 0) + 
                      (classroom.$invitations && classroom.$invitations.students ? classroom.$invitations.students.length : 0)),
      person: "",
      role: "",
    };
    
    _.each(["A_", "C_"], prefix => _.each(periods, period => _classroom[`${[prefix]}${period.code}`] = ""));
    
    _classroom.engaged = "";
    
   return _classroom;
    
  };
  
  FN.person = (classroom, person, role) => {
    var _value = _.clone(classroom);
    _value.$id = `${_value.$id}_${person.id}`;
    _value.role = role,
    _value.person = person.text;
    
    /* <!-- Add Usage (if available) --> */
    if (person.children && person.children.length > 0) {
      
      _.each(person.children, child => _.each(child.values, (value, key) => _value[`${child.key}_${key}`] = value.value));
      
      /* <!-- Add Engagement --> */
      _value.engaged = "Yes";
      
    }
      
    return _value;
  };
  
  FN.transform = (classes, periods) => _.reduce(classes, (memo, classroom) => {
    
    var _class = FN.class(classroom, periods);

    /* <!-- Add Teachers --> */
    memo = memo.concat(_.map(classroom.teachers, teacher => FN.person(_class, teacher, "Teacher")));
    
    /* <!-- Add Students --> */
    memo = memo.concat(_.map(classroom.students, student => FN.person(_class, student, "Student")));
    
    /* <!-- Add Classroom without Teachers or Students (if none available) --> */
    if ((!classroom.teachers || classroom.teachers.length === 0) && (!classroom.students || classroom.students.length === 0)) memo.push(_class);
    
    return memo;
    
  }, []);
  /* <!-- Transform Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    display: (since, classes) => {
      var _periods = options.functions.engagement.periods();
      since ? ರ‿ರ.since = factory.Dates.parse(since) : delete ರ‿ರ.since;
      return Promise.resolve(ರ‿ರ.table = FN.render.report(FN.transform(classes, _periods), _periods));
    },

    remove: id => options.functions.populate.remove(id, options.db),

    table: () => ರ‿ರ.table,

    close: () => options.functions.populate.close(options.db),
    
  };
  /* <!-- External Visibility --> */

};