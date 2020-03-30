Populate = (options, factory) => {
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
  var ರ‿ರ = {},
      /* <!-- State --> */
      ಱ = {
        db: new loki("classes.db"),
      }; /* <!-- Persistant --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Public Functions --> */
  FN.all = () => ರ‿ರ.classes;
  
  FN.classes = data => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, "classes", {
      unique: ["$id"],
      indices: ["calendar", "name", "section"]
    }, data, value => ({
      $id: parseInt(value.id, 10),
      $teachers: value.$teachers || [], /* <!-- Full Teachers Objects --> */
      $$teachers: value.$$teachers || [], /* <!-- Teacher Names (for searching) --> */
      $students: value.$students || [], /* <!-- Full Students Objects --> */
      $$students: value.$$students || [], /* <!-- Student Names (for searching) --> */
      $invitations: value.$invitations || [], /* <!-- Full Invitation Objects --> */
      id: {
        text: value.id,
        url: value.alternateLink,
        title: "Open in Classroom"
      },
      calendar: {
        text: value.calendarId,
        url: `https://calendar.google.com/render?cid=${value.calendarId}&authuser=${factory.Google.user()}`,
        title: "Open in Calendar"
      },
      state: value.courseState,
      name: value.name,
      section: value.section,
      guardians: value.guardiansEnabled,
      room: value.room,
      updated: value.updateTime ? factory.Dates.parse(value.updateTime) : null,
      created: value.creationTime ? factory.Dates.parse(value.creationTime) : null,
      teachers: value.teachers || [],
      students: value.students || [],
      code: value.enrollmentCode,
      usage: value.usage || [],
      folder: value.teacherFolder ? {
        text: value.teacherFolder.id,
        url: `/folders/#load.${value.teacherFolder.id}`,
        title: "Open in Folders App"
      } : null,
      $$owner: value.owner ? value.owner.text : null, 
      owner: value.owner /* <!-- Hidden Column cannot be last! --> */
    }));
  
  FN.get = id => ರ‿ರ.classes.findOne({
    $id: {
      "$aeq": id /* <!-- Allows for either string or numerical --> */
    }
  });
  
  FN.update = classroom => ರ‿ರ.classes.update(classroom);
  
  FN.remove = classroom => ರ‿ರ.classes.remove(FN.get(classroom.$id || classroom.id || classroom));
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};