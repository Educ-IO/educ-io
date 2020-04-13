Classes = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var _fields = {
    classroom : ["id", "name", "section", "description", "room", "ownerId", "creationTime", "updateTime", "enrollmentCode", "courseState",
                  "alternateLink", "teacherFolder", "guardiansEnabled", "calendarId"], 
  };
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- Public Functions --> */
  FN.get = (status, since) => factory.Google.classrooms.list(status || "ACTIVE", _fields.classroom, since,
       count => factory.Main.event(options.functions.events.load.progress, factory.Main.message(count, "class", "classes")))
    .then(classrooms => (
      factory.Main.event(options.functions.events.load.progress, factory.Main.message(classrooms.length, "class", "classes")),
      classrooms
    ))
    .then(classrooms => _.chain(classrooms).uniq(false, "id").each(classroom => {
      classroom.fetched = {
        self: factory.Dates.now().toISOString()
      };
      classroom.$$fetched = classroom.fetched.self;
    }).sortBy("creationTime").value().reverse())
    .then(options.functions.people.classes);

  FN.announcements = (classroom, all, number, since) => (all ?
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).announcements().list(null, true, since) :
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).announcements().last(null, null, number))
    .then(options.functions.people.posts)
    .then(announcements => (classroom.fetched.announcements = (all ? factory.Dates.now().toISOString() : null),
      classroom.$$fetched = classroom.fetched.announcements > classroom.$$fetched ? classroom.fetched.announcements : classroom.$$fetched,
      announcements))
    .then(announcements => classroom.$announcements = announcements)
    .catch(e => (factory.Flags.error("Classroom Announcements Error", e), null));

  FN.invitations = classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).invitations().list(false)
    .then(options.functions.people.posts)
    .then(invitations => (classroom.fetched.invitations = factory.Dates.now().toISOString(),
      classroom.$$fetched = classroom.fetched.invitations > classroom.$$fetched ? classroom.fetched.invitations : classroom.$$fetched,
      invitations))
    .then(invitations => classroom.$invitations = {
      owners: _.filter(invitations, invitation => invitation && invitation.role == "OWNER"),
      students: _.filter(invitations, invitation => invitation && invitation.role == "STUDENT"),
      teachers: _.filter(invitations, invitation => invitation && invitation.role == "TEACHER")
    })
    .catch(e => (factory.Flags.error("Classroom Invitations Error", e), null));

  FN.work = (classroom, all, number, since) => (all ?
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).work().list(null, true, since) :
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).work().last(null, null, number))
    .then(options.functions.people.posts)
    .then(work => {
      var loaded = factory.Dates.now().toISOString();
      return _.map(work, value => _.extend(value, {
        $parent: classroom.$id,
        $class: classroom.name,
        $$fetched: loaded,
        fetched: {
          self: loaded,
        },
        class: {
          text: classroom.name,
            title: classroom.id.title,
            url: classroom.id.url,
        }
      }));
    })
    .then(work => (classroom.fetched.work = (all ? factory.Dates.now().toISOString() : null),
      classroom.$$fetched = classroom.fetched.work > classroom.$$fetched ? classroom.fetched.work : classroom.$$fetched,
      work))
    .then(work => classroom.$work = work)
    .catch(e => (factory.Flags.error("Classroom Work Error", e), null));

  FN.submissions = (classroom, work, all, number) => (all ?
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).submissions(work.$id || work.id).list(null, null, true) :
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).submissions(work.$id || work.id).last(null, null, null, number))
    .then(options.functions.people.submissions)
    .then(submissions => (work.fetched.submissions = (all ? factory.Dates.now().toISOString() : null),
      work.$$fetched = work.fetched.submissions > work.$$fetched ? work.fetched.submissions : work.$$fetched,
      submissions))
    .then(submissions => _.chain(submissions).sortBy("updateTime").value().reverse())
    .then(submissions => work.$submissions = submissions)
    .catch(e => (factory.Flags.error("Classwork Submissions Error", e), null));

  FN.topics = (classroom, all, number) => (all ?
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).topics().list(true) :
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).topics().last(null, number))
    .then(topics => (classroom.fetched.topics = (all ? factory.Dates.now().toISOString() : null),
      classroom.$$fetched = classroom.fetched.topics > classroom.$$fetched ? classroom.fetched.topics : classroom.$$fetched,
      topics))
    .then(topics => _.chain(topics).sortBy("updateTime").value().reverse())
    .then(topics => classroom.$topics = topics)
    .catch(e => (factory.Flags.error("Classroom Topics Error", e), null));
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    all: since => FN.get(null, since),

    announcements: FN.announcements,

    invitations: FN.invitations,

    submissions: FN.submissions,

    topics: FN.topics,

    work: FN.work,

  };
  /* <!-- External Visibility --> */

};