People = (options, factory) => {
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
  var ರ‿ರ = {
    cache: {},
    guardians: {},
    titles: {},
  }; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.title = (name, content) => {
    if (!ರ‿ರ[name]) ರ‿ರ[name] = {};
    return ರ‿ರ[name][content] ? 
      ರ‿ರ[name][content] : ರ‿ರ[name][content] = factory.Display.doc.get(name, content, true);
  };
  
  FN.person = key => ರ‿ರ.cache[key] !== undefined ? 
      Promise.resolve(ರ‿ರ.cache[key]) : 
      (ರ‿ರ.cache[key] = factory.Google.classrooms.person(key).catch(() => null));
  
  FN.guardian = key => ರ‿ರ.guardians[key] !== undefined ? 
    Promise.resolve(ರ‿ರ.guardians[key]) : 
    (ರ‿ರ.guardians[key] = factory.Google.classrooms.guardians(key).list()
      .catch(() => null)
      .then(guardians => guardians && guardians.length > 0 && guardians[0] ? guardians : null));
  
  FN.name = profile => ({
                  id : profile.id,
                  text : factory.handlebars.username(profile.name.fullName),
                  formal : profile.name.fullName.length > 3 && profile.name.givenName && profile.name.familyName ?
                    `${profile.name.familyName}, ${profile.name.givenName}` : profile.name.fullName
                });
  
  FN.generic = (list, property, output, singular, plural, action) => {
    var processed = 0;
    return Promise.all(_.map(_.chain(list).pluck(property).compact().uniq().value(), id => FN.person(id)
                             .then(person => (singular && plural ? factory.Main.event(options.functions.events.load.progress, 
                                 factory.Main.message(processed += 1, singular, plural, action || "processed")) : null, person))))
      .then(people => {
        _.each(people, person => person && person.name ? 
                _.chain(list).filter(value => value[property] == person.id).each(value => value[output] = FN.name(person)) : null);
        return list;
      });
  };
  
  FN.process = people => (_.each(_.isArray(people) ? people : [people], 
                                person => person.userId ? ರ‿ರ.cache[person.userId] = person.profile : ರ‿ರ.cache[person.id] = person), people);
  
  FN.simple = people => _.reduce(people, (memo, person) => (person && person.profile ? 
                                                            memo.push(factory.handlebars.username(person.profile.name.fullName)) : null, memo), []);
  
  FN.identifiers = people => _.reduce(people, (memo, person) => (person && person.userId ? memo.push(person.userId) : null, memo), []);
  
  FN.list = (people, parent, type, removable, children) => _.reduce(people, (memo, person) => {
            if (person && person.profile) {
              var _person = _.extend(FN.name(person.profile), {
                parent : parent,
                type : type,
                title: `Remove this ${type} from the Class`,
                children: [],
                $removable : removable
              });
              if (type == "student") {
                _person.$commands = [{
                  command : `move.${type}.${parent}.${_person.id}`,
                  title :  FN.title("MOVE_TITLE", type),
                  icon : "directions_run"
                }];
                _person.__small = true;
              }
              if (children) _person.children = children === true ? [] : children;
              memo.push(_person);
            } 
            return memo;
          }, []);
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.classes = classrooms => FN.generic(classrooms, "ownerId", "owner", "owner", "owners", "retrieved");
  
  FN.posts = posts => FN.generic(posts, "creatorUserId", "creator");
  
  FN.submissions = submissions => FN.generic(submissions, "userId", "user");
  
  FN.guardians = students => {
    var _students = _.isArray(students) ? students : [students];
    return factory.Google.classrooms.guardians().authorised() ? Promise.all(_.map(_.chain(_students).pluck("userId").compact().uniq().value(), student => FN.guardian(student)
      .then(guardians => guardians ? _.chain(_students).filter(value => value.userId == student).each(value => value.guardians = guardians) : false)))
      .then(() => students) : Promise.resolve(students);
  };
  
  FN.teachers = classrooms => {
    var processed = 0,
        loaded = factory.Dates.now().toISOString();
    return Promise.all(_.map(_.isArray(classrooms) ? classrooms : [classrooms], 
    classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).teachers().list()
          .then(teachers => (
            factory.Main.event(options.functions.events.load.progress, 
                               factory.Main.message(processed += 1, "class", "classes", "processed")),
            teachers
          ))
          .then(FN.process)
          .then(teachers => (classroom.fetched.teachers = loaded, 
                             classroom.$$fetched = loaded > classroom.$$fetched ? loaded : classroom.$$fetched, 
                             teachers))
          .then(teachers => (
            classroom.$teachers = teachers,
            classroom.$$teachers = FN.simple(teachers),
            classroom.$$$teachers = FN.identifiers(teachers),
            classroom.teachers = FN.list(teachers, classroom.$id || classroom.id, "teacher", true, true), 
            classroom.teachers.__condensed = (teachers.length >= 2),
            teachers
          ))
          .catch(e => (factory.Flags.error("Teachers Error", e), null)))).then(() => classrooms);
  };
  
  FN.students = (classrooms, guardians) => {
    
    var loaded = factory.Dates.now().toISOString();
    return Promise.all(_.map(_.isArray(classrooms) ? classrooms : [classrooms], 
        classroom => factory.Google.classrooms.classroom(classroom.$id || classroom.id).students().list()
          .then(options.functions.people.process)
          .then(students => guardians && classroom.guardians ? options.functions.people.guardians(students) : students)
          .then(students => (classroom.fetched.students = loaded,
                             classroom.$$fetched = loaded > classroom.$$fetched ? loaded : classroom.$$fetched,
                             students))
          .then(students => (
            classroom.$students = students,
            classroom.$$students = FN.simple(students),
            classroom.$$$students = FN.identifiers(students),
            classroom.students = FN.list(students, classroom.$id || classroom.id, "student", true, true),
            classroom.students.__condensed = (students.length >= 2),
            students
          ))
          .catch(e => (factory.Flags.error("Students Error", e), null)))).then(() => classrooms);
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    classes : FN.classes,
    
    guardians : FN.guardians,
    
    posts : FN.posts,
    
    students : FN.students,
    
    submissions : FN.submissions,
    
    teachers : FN.teachers,
    
  };
  /* <!-- External Visibility --> */

};