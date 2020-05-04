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
  var _get = (status, since, last, teacher, student, loaded) => loaded ? Promise.resolve(loaded) : last ? 
    factory.Google.classrooms.last(status === false ? null : status || "ACTIVE", _fields.classroom, last, teacher, student) :
    factory.Google.classrooms.list(status === false ? null : status || "ACTIVE", _fields.classroom, since, teacher, student,
       count => factory.Main.event(options.functions.events.load.progress, factory.Main.message(count, "class", "classes")));
  /* <!-- Internal Functions --> */

  /* <!-- Public Functions --> */
  FN.get = (status, since, last, teacher, student, loaded) => _get(status, since, last, teacher, student, loaded)
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

  FN.announcements = (classroom, all, number, since) => {
    var _announcements = factory.Google.classrooms.classroom(classroom.$id || classroom.id).announcements();
    return _announcements.authorised() ? (all ? _announcements.list(null, true, since) : _announcements.last(null, null, number))
      .then(options.functions.people.posts)
      .then(announcements => (classroom.fetched.announcements = (all ? factory.Dates.now().toISOString() : null),
        classroom.$$fetched = classroom.fetched.announcements > classroom.$$fetched ? classroom.fetched.announcements : classroom.$$fetched,
        announcements))
      .then(announcements => classroom.$announcements = announcements)
      .catch(e => (factory.Flags.error("Classroom Announcements Error", e), null)) : Promise.resolve([]);
  };

  FN.invitations = classroom => {
    var _invitations = factory.Google.classrooms.classroom(classroom.$id || classroom.id).invitations();
    return _invitations.authorised() ? _invitations.list(false)
      .then(options.functions.people.posts)
      .then(invitations => (classroom.fetched.invitations = factory.Dates.now().toISOString(),
        classroom.$$fetched = classroom.fetched.invitations > classroom.$$fetched ? classroom.fetched.invitations : classroom.$$fetched,
        invitations))
      .then(invitations => classroom.$invitations = {
        owners: _.filter(invitations, invitation => invitation && invitation.role == "OWNER"),
        students: _.filter(invitations, invitation => invitation && invitation.role == "STUDENT"),
        teachers: _.filter(invitations, invitation => invitation && invitation.role == "TEACHER")
      })
      .catch(e => (factory.Flags.error("Classroom Invitations Error", e), null)) : Promise.resolve([]);
  };

  FN.work = (classroom, all, number, since) => {
    var _work = factory.Google.classrooms.classroom(classroom.$id || classroom.id).work();
    return _work.authorised() ? (all ? _work.list(null, true, since) : _work.last(null, null, number))
      .then(options.functions.people.posts)
      .then(work => {
        var loaded = factory.Dates.now().toISOString();
        return _.map(work, value => {
          var _topic = value.topicId && classroom.$topics && classroom.$topics.length > 0 ?
              _.find(classroom.$topics, topic => topic.topicId == value.topicId) : null;
          if (value.materials) value.workType = _.find(value.materials, material => material.form) ? "QUIZ_ASSIGNMENT" : value.workType;
          return _.extend(value, {
            $parent: classroom.$id,
            $$fetched: loaded,
            fetched: {
              self: loaded,
            },
            class: {
              text: classroom.name,
              title: classroom.id.title,
              url: classroom.id.url,
            },
            topic: _topic ? {
              id: _topic.topicId,
              text: _topic.name,
            } : "",
          });
        });
      })
      .then(work => (classroom.fetched.work = (all ? factory.Dates.now().toISOString() : null),
        classroom.$$fetched = classroom.fetched.work > classroom.$$fetched ? classroom.fetched.work : classroom.$$fetched,
        work))
      .then(work => classroom.$work = work)
      .catch(e => (factory.Flags.error("Classroom Work Error", e), null)) : Promise.resolve([]);                             
  };

  FN.submissions = (classroom, work, all, number) => {
    var _submissions = factory.Google.classrooms.classroom(classroom.$id || classroom.id).submissions(work.$id || work.id);
    return _submissions.authorised() ? (all ?
        _submissions.list(null, null, true) :
        _submissions.last(null, null, null, number))
      .then(options.functions.people.submissions)
      .then(submissions => (work.fetched.submissions = (all ? factory.Dates.now().toISOString() : null),
        work.$$fetched = work.fetched.submissions > work.$$fetched ? work.fetched.submissions : work.$$fetched,
        submissions))
      .then(submissions => _.chain(submissions).sortBy("updateTime").value().reverse())
      .then(submissions => work.$submissions = submissions)
      .catch(e => (factory.Flags.error("Classwork Submissions Error", e), null)) : Promise.resolve([]);
  };

  FN.topics = (classroom, all, number) => {
    var _topics = factory.Google.classrooms.classroom(classroom.$id || classroom.id).topics();
    return _topics.authorised() ? (all ? _topics.list(true) : _topics.last(null, number))
      .then(topics => (classroom.fetched.topics = (all ? factory.Dates.now().toISOString() : null),
        classroom.$$fetched = classroom.fetched.topics > classroom.$$fetched ? classroom.fetched.topics : classroom.$$fetched,
        topics))
      .then(topics => _.chain(topics).sortBy("updateTime").value().reverse())
      .then(topics => classroom.$topics = topics)
      .catch(e => (factory.Flags.error("Classroom Topics Error", e), null)) : Promise.resolve([]);
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    all: (since, status, limit, teacher, student, loaded) => FN.get(status, since, limit, teacher, student, loaded),

    announcements: FN.announcements,

    invitations: FN.invitations,

    submissions: FN.submissions,

    topics: FN.topics,

    work: FN.work,

  };
  /* <!-- External Visibility --> */

};