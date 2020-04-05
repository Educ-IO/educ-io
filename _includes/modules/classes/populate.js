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
  
  /* <!-- Population Functions --> */
  FN.classwork = data => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, "classwork", {
    unique: ["$id"],
    indices: ["$class", "$parent", "title", "$$creator"]
  }, data, value => ({
    $id: parseInt(value.id, 10),
    $class: value.$class,
    $parent: value.$parent,
    $submissions: value.$submissions || [], /* <!-- Full Response Objects --> */
    id: {
      text: value.id,
      url: value.alternateLink,
      title: "Open in Classroom"
    },
    type: value.workType,
    mode: value.assigneeMode,
    class: value.class,
    $$fetched: value.$$fetched, /* <!-- Fetched Date/Time in ISO Format (for searching/sorting) --> */
    fetched: value.fetched || {}, /* <!-- Fetched & Populated Dates / Times --> */
    title: value.title,
    description: value.description,
    $$updated: value.updateTime, /* <!-- Updated Date/Time in ISO Format (for searching/sorting) --> */
    updated: value.updateTime ? factory.Dates.parse(value.updateTime) : null,
    $$created: value.creationTime, /* <!-- Created Date/Time in ISO Format (for searching/sorting) --> */
    created: value.creationTime ? factory.Dates.parse(value.creationTime) : null,
    $$due: value.dueDate ? factory.Dates.parse(factory.Google.classrooms.due(value, null)).toISOString() : null, 
    due: value.dueDate ? factory.Dates.parse(factory.Google.classrooms.due(value, null)) : null,
    points: value.maxPoints,
    $$submissions: value.$$submissions, /* <!--  (for searching/sorting) --> */
    submissions: value.submissions || [],
    $$creator: value.creator ? value.creator.text : null, /* <!-- Creator Name (for searching/sorting) --> */
    creator: value.creator /* <!-- Hidden Column cannot be last! --> */
  }));
  
  FN.classes = data => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, "classes", {
      unique: ["$id"],
      indices: ["calendar", "name", "section"]
    }, data, value => ({
      $id: parseInt(value.id, 10),
      $teachers: value.$teachers || [], /* <!-- Full Teachers Objects --> */
      $$teachers: value.$$teachers || [], /* <!-- Teacher Names (for searching/sorting) --> */
      $$$teachers: value.$$$teachers || [], /* <!-- Teacher IDs (for filtering) --> */
      $students: value.$students || [], /* <!-- Full Students Objects --> */
      $$students: value.$$students || [], /* <!-- Student Names (for searching/sorting) --> */
      $$$students: value.$$$students || [], /* <!-- Student IDs (for filtering) --> */
      $invitations: value.$invitations || [], /* <!-- Full Invitation Objects --> */
      $announcements: value.$announcements || [], /* <!-- Full Announcement Objects --> */
      $topics: value.$topics || [], /* <!-- Full Topic Objects --> */
      $work: value.$work || [], /* <!-- Full Course Work Objects --> */
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
      $$fetched: value.$$fetched, /* <!-- Fetched Date/Time in ISO Format (for searching/sorting) --> */
      fetched: value.fetched || {}, /* <!-- Fetched & Populated Dates / Times --> */
      section: value.section,
      guardians: value.guardiansEnabled,
      room: value.room,
      $$updated: value.updateTime, /* <!-- Updated Date/Time in ISO Format (for searching/sorting) --> */
      updated: value.updateTime ? factory.Dates.parse(value.updateTime) : null,
      $$created: value.creationTime, /* <!-- Created Date/Time in ISO Format (for searching/sorting) --> */
      created: value.creationTime ? factory.Dates.parse(value.creationTime) : null,
      teachers: value.teachers || [],
      students: value.students || [],
      code: value.enrollmentCode,
      $$usage: value.$$usage, /* <!-- Usage Date/Time in ISO Format (for searching/sorting) --> */
      usage: value.usage || [],
      folder: value.teacherFolder ? {
        text: value.teacherFolder.id,
        url: `/folders/#load.${value.teacherFolder.id}`,
        title: "Open in Folders App"
      } : null,
      $$owner: value.owner ? value.owner.text : null, /* <!-- Owner Name (for searching/sorting) --> */
      owner: value.owner /* <!-- Hidden Column cannot be last! --> */
    }));
  /* <!-- Population Functions --> */
  
  /* <!-- Common Functions --> */
  FN.collection = collection => ರ‿ರ[collection || "classes"];
  /* <!-- Common Functions --> */
  
  /* <!-- Public Functions --> */
  FN.all = (collection) => FN.collection(collection);

  FN.get = (id, collection) => FN.collection(collection).findOne({
    "$or" : [
      {
        "id" : {
          "$aeq": id /* <!-- Allows for either string or numerical --> */
        }
      },
      {
        "$id" : {
          "$aeq": id /* <!-- Allows for either string or numerical --> */
        }
      },
  ]});
  
  FN.update = (value, collection) => FN.collection(collection).update(value);
  
  FN.remove = (value, collection) => FN.collection(collection).remove(FN.get(value.$id || value.id || value, collection));
  /* <!-- Public Functions --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};