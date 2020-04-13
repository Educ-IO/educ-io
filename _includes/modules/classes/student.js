Student = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
          id : "student",
          format: "Do MMM, YYYY",
        }, 
        FN = {},
        HIDDEN = ["ID", "Created", "State", "Late", "Type"];
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
        template: "student_body",
        classes: ["pt-2"],
        target: element || factory.container,
        clear: true
      }),
    
    wrapper: title => ({
      classes: ["pt-1", "scroller"],
      id: options.id,
      header: factory.Display.template.get("student_header")({
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: title,
        subtitle: ರ‿ರ.since ? 
          factory.Display.doc.get("STUDENT_SUBTITLE", 
            humanizeDuration(factory.Dates.parse(options.state.session.current) - ರ‿ರ.since, {largest: 1}), true) : null,
        details: factory.Display.doc.get({
          name: "VIEW_DETAILS",
          data: {
            since: ರ‿ರ.since.format(options.format),
            current: factory.Dates.parse(options.state.session.current).format(options.format),
          }
        }),
      }).trim()
    }),

    student: (name, details) => factory.Datatable(factory, {
          id: `${options.id}_TABLE`,
          name: options.id,
          data: options.functions.populate.details(details),
          headers: options.state.application.tabulate.headers(
            ["ID", "Class", "Created", "Updated", "Type", "State", "Late", "Title", "Answer", "Max", "Grade"], HIDDEN),
        }, {
          classes: ["table-hover"],
          advanced: false,
          collapsed: true,
          removable: true,
          removable_message: "Remove this Student from the Overview",
          wrapper: FN.render.wrapper(name),
          complex: true,
        }, FN.render.body()),
    
  };
  /* <!-- Render Functions --> */
  
  /* <!-- General Functions --> */
  /* <!-- General Functions --> */
  
  /* <!-- Transformation Functions --> */
  FN.transform = student => {
    
    var _return = [];
    var _submission = s => s.userId == student.$id,
        _classwork = _.chain(student.$classes).map("$work").flatten()
                          .filter(w => !!_.find(w.$submissions, _submission)).value(),
        _announcements = _.chain(student.$classes).map("$announcements").flatten()
                          .filter(a => a.creatorUserId == student.$id).value();

    _.each(_classwork, work => _.each(_.filter(work.$submissions, _submission), submission => {
      _return.push({
        id: submission.id,
        url: submission.alternateLink,
        course: submission.courseId,
        class: work.class,
        created: submission.creationTime,
        updated: submission.updateTime,
        type: work.workType,
        state: submission.state,
        late: submission.late ? true : "",
        text: work.title,
        answer: submission.multipleChoiceSubmission ? submission.multipleChoiceSubmission.answer : 
                submission.shortAnswerSubmission ? submission.shortAnswerSubmission.answer : "",
        max: work.maxPoints,
        grade: submission.assignedGrade ? submission.assignedGrade : submission.draftGrade ? `${submission.draftGrade}*` : ""
      });
    }));

    _.each(_announcements, announcement => {
      _return.push({
        id: announcement.id,
        url: announcement.alternateLink,
        course: announcement.courseId,
        created: announcement.creationTime,
        updated: announcement.updateTime,
        type: "POST",
        state: announcement.state,
        late: "",
        text: announcement.text,
      });
    });
    
    return _.map(_return, value => {
      
      if (!value.class && value.course) {
        var classroom = _.find(student.$classes, course => course.$id == value.course);
        value.class = {
          text: classroom.name,
          title: classroom.id.title,
          url: classroom.id.url,
        };
      }
      
      return value;
    });
  };
  /* <!-- Transformation Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    display: (since, student) => {
      since ? ರ‿ರ.since = factory.Dates.parse(since) : delete ರ‿ರ.since;
      return Promise.resolve(ರ‿ರ.table = FN.render.student(student.name, FN.transform(student)));
    },
    
    remove: id => options.functions.populate.remove(id, "details"),

  };
  /* <!-- External Visibility --> */

};