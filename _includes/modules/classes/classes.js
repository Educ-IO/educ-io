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
  FN.get = status => factory.Google.classrooms.list(status || "ACTIVE", true)
    .then(classrooms => (
        factory.Main.event(options.functions.events.load.progress, factory.Main.message(classrooms.length, "class", "classes")),
        classrooms
    ))
    .then(classrooms => _.chain(classrooms).uniq(false, "id").sortBy("creationTime").value().reverse())
    .then(options.functions.people.classes);
  
  FN.announcements = classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).announcements().list()
    .then(announcements => classroom.$announcements = announcements)
    .then(options.functions.people.posts)
    .catch(e => (factory.Flags.error("Classroom Announcements Error", e), null));
  
  FN.invitations = classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).invitations().list(false)
    .then(invitations => classroom.$invitations = {
      owners : _.filter(invitations, invitation => invitation && invitation.role == "OWNER"),
      students : _.filter(invitations, invitation => invitation && invitation.role == "STUDENT"),
      teachers : _.filter(invitations, invitation => invitation && invitation.role == "TEACHER")
    })
    .then(options.functions.people.posts)
    .catch(e => (factory.Flags.error("Classroom Invitations Error", e), null));
  
  FN.work = classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).work().list()
    .then(work => classroom.$work = work)
    .then(options.functions.people.posts)
    .catch(e => (factory.Flags.error("Classroom Work Error", e), null));
  
  FN.topics = classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).topics().list()
    .then(topics => _.chain(topics).sortBy("updateTime").value().reverse())
    .then(topics => classroom.$topics = topics)
    .catch(e => (factory.Flags.error("Classroom Topics Error", e), null));
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    all : FN.get,
    
    announcements : FN.announcements,
    
    invitations: FN.invitations,
    
    work : FN.work,
    
    topics : FN.topics,
    
  };
  /* <!-- External Visibility --> */

};