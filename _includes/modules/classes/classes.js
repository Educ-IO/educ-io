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
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.get = (status, since) => factory.Google.classrooms.list(status || "ACTIVE", true, since)
    .then(classrooms => (
        factory.Main.event(options.functions.events.load.progress, factory.Main.message(classrooms.length, "class", "classes")),
        classrooms
    ))
    .then(classrooms => _.chain(classrooms).uniq(false, "id").each(classroom => classroom.$populated = {
      self: factory.Dates.now()
    }).sortBy("creationTime").value().reverse())
    .then(options.functions.people.classes);
          
  FN.announcements = (classroom, all, number) => (all ? 
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).announcements().list(null, true) : 
      factory.Google.classrooms.classroom(classroom.$id || classroom.id).announcements().last(null, null, number))
    .then(options.functions.people.posts)
    .then(announcements => (classroom.$populated.announcements = factory.Dates.now(), announcements))
    .then(announcements => classroom.$announcements = announcements)
    .catch(e => (factory.Flags.error("Classroom Announcements Error", e), null));
  
  FN.invitations = classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).invitations().list(false)
    .then(options.functions.people.posts)
    .then(invitations => (classroom.$populated.invitations = factory.Dates.now(), invitations))
    .then(invitations => classroom.$invitations = {
      owners : _.filter(invitations, invitation => invitation && invitation.role == "OWNER"),
      students : _.filter(invitations, invitation => invitation && invitation.role == "STUDENT"),
      teachers : _.filter(invitations, invitation => invitation && invitation.role == "TEACHER")
    })
    .catch(e => (factory.Flags.error("Classroom Invitations Error", e), null));
  
  FN.work = (classroom, all, number) => (all ?
       factory.Google.classrooms.classroom(classroom.$id || classroom.id).work().list(null, true) :
       factory.Google.classrooms.classroom(classroom.$id || classroom.id).work().last(null, null, number))
    .then(options.functions.people.posts)
    .then(work => (classroom.$populated.work = factory.Dates.now(), work))
    .then(work => classroom.$work = work)
    .catch(e => (factory.Flags.error("Classroom Work Error", e), null));
  
  FN.responses = (classroom, work, all, number) => (all ?
       factory.Google.classrooms.classroom(classroom.$id || classroom.id).submissions(work.$id || work.id).list(null, null, true) :
       factory.Google.classrooms.classroom(classroom.$id || classroom.id).submissions(work.$id || work.id).last(null, null, null, number))
    .then(options.functions.people.submissions)
    .then(responses => (work.$populated.responses = factory.Dates.now(), responses))
    .then(responses => _.chain(responses).sortBy("updateTime").value().reverse())
    .then(responses => work.$responses = responses)
    .catch(e => (factory.Flags.error("Classwork Responses Error", e), null));
  
  FN.topics = (classroom, all, number) => (all ?
       factory.Google.classrooms.classroom(classroom.$id || classroom.id).topics().list(true) :
       factory.Google.classrooms.classroom(classroom.$id || classroom.id).topics().last(null, number))
    .then(topics => (classroom.$populated.topics = factory.Dates.now(), topics))
    .then(topics => _.chain(topics).sortBy("updateTime").value().reverse())
    .then(topics => classroom.$topics = topics)
    .catch(e => (factory.Flags.error("Classroom Topics Error", e), null));
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    all : since => FN.get(null, since),
    
    announcements : FN.announcements,
    
    invitations: FN.invitations,
    
    responses : FN.responses,
    
    topics : FN.topics,
    
    work : FN.work,
    
  };
  /* <!-- External Visibility --> */

};