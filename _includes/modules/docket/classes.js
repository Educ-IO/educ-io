Classes = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle different views --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const SCOPE_COURSES = "https://www.googleapis.com/auth/classroom.courses.readonly",
    SCOPE_CLASSWORK = "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
    SCOPE_COURSEWORK = "https://www.googleapis.com/auth/classroom.coursework.me.readonly";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _load = classes => Promise.all(_.map(classes, course => factory.Google.classrooms.classroom(course).work().list()
          .then(results => _.each(results, result => result ?
            result._title = `COURSE: ${course.name}` : null))))
        .then(_.flatten)
        .then(_.compact)
        .then(results => _.tap(results, results => _.each(results, result => {
          result.due = factory.Dates.parse(factory.Google.classrooms.due(result));
          if (result.dueTime) {
            result.IS_TIMED = true;
            result.TIME = result.due.format("HH:mm");
          }
          result.DISPLAY = result.title;
          result._link = result.alternateLink;
          result._icon = result.workType == "ASSIGNMENT" ?
            "assignment" : result.workType == "SHORT_ANSWER_QUESTION" ?
            "question_answer" : result.workType == "MULTIPLE_CHOICE_QUESTION" ?
            "assessment" : "class";

        })))
        .catch(e => factory.Flags.error("Classroom Course Work List:", e).negative());

  var _choose = () => factory.Main.prompt("Course", course => ({
      id: course.id,
      name: course.section ? `${course.section} | ${course.name}` : course.name,
      calendar: course.calendarId ? course.calendarId : false,
      teacher: !!course.teacherFolder
    }), factory.Google.classrooms.list);
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    choose: () => factory.Main.authorise(SCOPE_COURSES)
                    .then(result => result === true ? _choose() : Promise.resolve(false)),
      
    load: classes => factory.Main.authorise([].concat(
                        _.filter(classes, course => course.teacher).length > 0 ? SCOPE_CLASSWORK : [],
                        _.filter(classes, course => !course.teacher).length > 0 ? SCOPE_COURSEWORK : [])
                     ).then(result => result === true ? _load(classes) : Promise.resolve(false)),

  };
  /* <!-- External Visibility --> */

};