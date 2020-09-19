Students = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
          id : "students",
          format: "Do MMM, YYYY",
          db : "students"
        }, 
        FN = {},
        HIDDEN = ["Fetched", "Teachers"];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Render Functions --> */
  FN.render = {
    
    body: element => ರ‿ರ.body = factory.Display.template.show({
        template: "students_body",
        classes: ["pt-2"],
        target: element || factory.container,
        clear: true
      }),
    
    wrapper: () => ({
      classes: ["pt-1", "scroller"],
      id: options.id,
      header: factory.Display.template.get("students_header")({
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: "Students",
        subtitle: ರ‿ರ.since ? 
          factory.Display.doc.get("STUDENTS_SUBTITLE", 
            humanizeDuration(factory.Dates.parse(options.state.session.current) - ರ‿ರ.since, {largest: 1}), true) : null,
        details: factory.Display.doc.get({
          name: "VIEW_DETAILS",
          data: {
            since: ರ‿ರ.since ? ರ‿ರ.since.format(options.format) : "",
            current: factory.Dates.parse(options.state.session.current).format(options.format),
          }
        }),
      }).trim()
    }),
    
    students: students => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: options.functions.populate.students(students, options.db),
          headers: options.state.application.tabulate.headers(
            ["ID", "Name", "Fetched", "Classes", "Teachers", {
              name: "Engagement",
              help : factory.Display.doc.get("STUDENTS_ENGAGEMENT_HEADER", null, true)
            }], HIDDEN),
        }, {
          classes: ["table-hover"],
          advanced: false,
          collapsed: true,
          removable: true,
          removable_message: "Remove this Student from the Overview",
          wrapper: FN.render.wrapper(),
          complex: true,
        }, FN.render.body()),
    
  };
  /* <!-- Render Functions --> */
  
  /* <!-- General Functions --> */
  FN.class = (student, classroom) => ({
    id : student.userId,
    parent : classroom.$id,
    text : classroom.$$name,
    type : "student",
    title : "Remove Student from this Classroom",
    $removable : true,
  });
  /* <!-- General Functions --> */
  
  /* <!-- Transformation Functions --> */
  FN.transform = classes => {
    
    var _students = _.reduce(classes, (memo, classroom) => {
      
      _.each(classroom.$students, student => {
        
        var _student = memo[student.userId];
        if (_student) {
          
          /* <!-- Add Teachers --> */
          _student.teachers =_.union(_student.teachers, classroom.$$teachers);
              
          /* <!-- Add Class --> */
          _student.$$$classes.push(classroom.$id);
          _student.$$classes.push(classroom.$$name);
          _student.$classes.push(classroom);
          _student.classes.push(FN.class(student, classroom));
          
        } else {
          
          memo[student.userId] = (_student = {
          
            /* <!-- Student Details --> */
            id : student.userId,
            name : student.profile.name.fullName,

            /* <!-- Teachers Initialisation --> */
            teachers : _.clone(classroom.$$teachers),

            /* <!-- Classes Initialisation --> */
            $$$classes : [classroom.$id],
            $$classes : [classroom.$$name],
            $classes : [classroom],
            classes : [FN.class(student, classroom)],

            /* <!-- Engagement Holders --> */
            $$engagement : null,
            engagement : [],

            /* <!-- Fetched Metadata --> */
            $fetched : classroom.$fetched,
            fetched : {
              self : classroom.fetched.students,
              classroom : classroom.fetched.self,
            },

          });
          
        }
        
      });
      
      return memo;
      
    }, {});
    
    /* <!-- Calculate Engagement --> */
    _.each(_students, student => options.functions.engagement.student(student));
    
    return _.values(_students);
  };
  /* <!-- Transformation Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    display: (since, classes) => {
      since ? ರ‿ರ.since = factory.Dates.parse(since) : delete ರ‿ರ.since;
      return Promise.resolve(ರ‿ರ.table = FN.render.students(FN.transform(classes)));
    },
    
    remove: id => options.functions.populate.remove(id, options.db),
    
    table: () => ರ‿ರ.table,
    
    detach: () => {
      ರ‿ರ.body.detach();
      return Promise.resolve(ರ‿ರ.table);
    },
    
    attach: element => {
      (element || factory.container).empty().append(ರ‿ರ.body);
      return Promise.resolve(ರ‿ರ.table);
    },

  };
  /* <!-- External Visibility --> */

};