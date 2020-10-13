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
        db: new loki("classes.db", {
          verbose: factory.Flags.verbose()
        }),
      }; /* <!-- Persistant --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Field Functions --> */
  FN.state = value => value.courseState ? {
        text: value.courseState,
        $commands: value.courseState === "ARCHIVED" ? [{
          action : "activate",
          class : "o-75",
          command : `edit.activate.${value.id}`,
          title :  options.functions.common.title("CHANGE_STATUS", "Activate"),
          icon : "unarchive"
        }] : value.courseState === "ACTIVE" ? [{
          action : "archive",
          class : "o-50",
          command : `edit.archive.${value.id}`,
          title :  options.functions.common.title("CHANGE_STATUS", "Archive"),
          icon : "archive"
        }] : null,
      } : "";
  /* <!-- Field Functions --> */
  
  /* <!-- Population Functions --> */
  FN.classwork = (data, db) => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, db, {
    unique: ["$id"],
    indices: ["$$class", "$parent", "title", "$$topic", "$$creator"]
  }, data, value => ({
    $id: parseInt(value.id, 10),
    $$class: value.class ? value.class.text : "", /* <!-- Class Name (for searching/sorting) --> */
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
    $$topic: value.topic ? value.topic.text : "", /* <!-- Topic Name (for searching/sorting) --> */
    topic: value.topic,
    $$updated: value.updateTime, /* <!-- Updated Date/Time in ISO Format (for searching/sorting) --> */
    __updated: value.updateTime ? factory.Dates.parse(value.updateTime).toDate().toLocaleDateString() : null,
    $$created: value.creationTime, /* <!-- Created Date/Time in ISO Format (for searching/sorting) --> */
    __created: value.creationTime ? factory.Dates.parse(value.creationTime).toDate().toLocaleDateString() : null,
    $$due: value.dueDate ? factory.Dates.parse(factory.Google.classrooms.due(value, null)).toISOString() : null, 
    __due: value.dueDate ? factory.Dates.parse(factory.Google.classrooms.due(value, null)) : null,
    points: value.maxPoints,
    min: value.$calculated ? value.$calculated.min : value.min,
    avg: value.$calculated ? value.$calculated.avg : value.avg,
    max: value.$calculated ? value.$calculated.max : value.max,
    $$submissions: value.$$submissions, /* <!--  (for searching/sorting) --> */
    submissions: value.submissions || [],
    $$creator: value.creator ? value.creator.text : null, /* <!-- Creator Name (for searching/sorting) --> */
    creator: value.creator /* <!-- Hidden Column cannot be last! --> */
  }));
  
  FN.classes = (data, db) => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, db || "classes", {
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
        title: "Open in Classroom",
      },
      calendar: {
        text: value.calendarId,
        url: `https://calendar.google.com/render?cid=${value.calendarId}&authuser=${factory.Google.user()}`,
        title: "Open in Calendar"
      },
      $$state: value.courseState || "", /* <!-- Class State (for searching/sorting) --> */
      state: FN.state(value),
      $$name: value.name ? value.name.text : "", /* <!-- Class Name (for searching/sorting) --> */
      name: value.name || "",
      $$fetched: value.$$fetched, /* <!-- Fetched Date/Time in ISO Format (for searching/sorting) --> */
      fetched: value.fetched || {}, /* <!-- Fetched & Populated Dates / Times --> */
      $$section: value.section ? value.section.text : "", /* <!-- Class Section (for searching/sorting) --> */
      section: value.section || "",
      $$description: value.description ? value.description.text : "", /* <!-- Class Description (for searching/sorting) --> */
      description: value.description || "",
      guardians: value.guardiansEnabled ? "Enabled" : "",
      $$room: value.room ? value.room.text : "", /* <!-- Class Room (for searching/sorting) --> */
      room: value.room || "",
      $$updated: value.updateTime, /* <!-- Updated Date/Time in ISO Format (for searching/sorting) --> */
      updated: value.updateTime ? factory.Dates.parse(value.updateTime).toDate().toLocaleDateString() : null,
      $$created: value.creationTime, /* <!-- Created Date/Time in ISO Format (for searching/sorting) --> */
      created: value.creationTime ? {
        $id: "created",
        text: factory.Dates.parse(value.creationTime).toDate().toLocaleDateString()
      } : null,
      teachers: value.teachers || [],
      students: value.students || [],
      code: value.enrollmentCode || "",
      $$usage: value.$$usage, /* <!-- Usage Date/Time in ISO Format (for searching/sorting) --> */
      $usage: value.$usage, /* <!-- Full Date/Time Object for Latest Usage --> */
      __usage: value.__usage || [], /* <!-- Prefixed with __ to prevent sorting / searching --> */
      $$engagement: value.$$engagement, /* <!-- Engagement as String/Number (for searching/sorting) --> */
      engagement: value.engagement || [],
      folder: value.teacherFolder ? {
        text: value.teacherFolder.id,
        url: `/folders/#load.${value.teacherFolder.id}`,
        title: "Open in Folders App"
      } : null,
      $$owner: value.owner ? value.owner.text : null, /* <!-- Owner Name (for searching/sorting) --> */
      owner: value.owner ? _.extend(value.owner, {
        $commands: [{
          action : "transfer",
          class : "o-75",
          command : `edit.transfer.${value.id}`,
          title :  factory.Display.doc.get("CHANGE_OWNER"),
          icon : "transform"
        }]
      }) : "" /* <!-- Hidden Column cannot be last! --> */
    }));
  
  FN.students = (data, db) => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, db, {
      unique: ["$id"],
      indices: ["name"]
    }, data, value => ({
      $id: parseInt(value.id, 10),
      $classes: value.$classes || [], /* <!-- Full Class Objects --> */
      $$classes: value.$$classes || [], /* <!-- Class Names (for searching/sorting) --> */
      id: {
        text: value.id,
        route: `overview.student.${value.id}`,
        title: "View Student Details"
      },
      name: value.name,
      $$fetched: value.$$fetched, /* <!-- Fetched Date/Time in ISO Format (for searching/sorting) --> */
      fetched: value.fetched || {}, /* <!-- Fetched & Populated Dates / Times --> */
      classes: value.classes || [],
      $$engagement: value.$$engagement, /* <!-- Engagement as String/Number (for searching/sorting) --> */
      teachers: value.teachers || [],
      engagement: value.engagement || [],
    }));
  
  FN.details = (data, db) => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, db, {
      unique: ["$id"],
      indices: ["type", "state"]
    }, data, value => ({
      $id: value.id,
      id: {
        text: value.id,
        url: value.url,
        title: "Open in Classroom"
      },
      class: value.class,
      $$created: value.created, /* <!-- Created Date/Time in ISO Format (for searching/sorting) --> */
      created: value.created ? factory.Dates.parse(value.created).toDate().toLocaleDateString() : null,
      $$updated: value.updated, /* <!-- Updated Date/Time in ISO Format (for searching/sorting) --> */
      updated: value.updated ? factory.Dates.parse(value.updated).toDate().toLocaleDateString() : null,
      type: value.type,
      state: value.state,
      late: value.late,
      title: options.functions.common.truncate(50, "…")(value.text),
      answer: options.functions.common.truncate(30, "…")(value.answer),
      max: value.max,
      grade: value.grade
    }));
  
  FN.report = (data, db) => options.state.application.tabulate.data(ರ‿ರ, ಱ.db, db, {
      unique: ["$id"],
      indices: ["name", "person", "role"]
    }, data);
  /* <!-- Population Functions --> */
  
  /* <!-- Common Functions --> */
  FN.collection = collection => ರ‿ರ[collection || "classes"];
  /* <!-- Common Functions --> */
  
  /* <!-- Public Functions --> */
  FN.all = collection => FN.collection(collection);

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
  
  /* <!-- Load / Save Functions --> */
  FN.load = json => {
    _.isString(json) ? ಱ.db.loadJSON(json, {retainDirtyFlags: false}) : ಱ.db.loadJSONObject(json, {retainDirtyFlags: false});
    _.each(_.pluck(ಱ.db.listCollections(), "name"), collection => ರ‿ರ[collection] = ಱ.db.getCollection(collection));
  };
  
  FN.save = () => ಱ.db.serialize();
  /* <!-- Load / Save Functions --> */
  
  /* <!-- Close Function --> */
  FN.close = collection => collection ? ಱ.db.removeCollection(collection) : false;
  /* <!-- Close Function --> */
  
  /* <!-- Debug Access --> */
  FN.db = () => ಱ.db;
  
  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};