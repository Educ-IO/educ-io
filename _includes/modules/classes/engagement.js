Engagement = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    periods : [
      {
        value : 7,
        unit : "days",
        text : "Last 7 Days"
      },
      {
        value : 2,
        unit : "weeks",
        text : "Last 2 Weeks"
      },
      {
        value : 30,
        unit : "days",
        text : "Last 30 Days"
      },
      {
        value : 3,
        unit : "months",
        text : "Last 3 Months"
      }
    ],
    /* <!-- CREATED - Does not mean what we want it to... --> */
    states : ["TURNED_IN", "RETURNED", "RECLAIMED_BY_STUDENT"],
    /* <!-- Include Announcements in calculating overall engagement stats --> */
    announcements : true,
  }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */
  
  /* <!-- Internal Variables --> */
  var ರ‿ರ = {
    from : factory.Dates.now().add(0 - options.periods[options.periods.length - 1].value, options.periods[options.periods.length - 1].unit),
    periods : _.map(options.periods, period => _.extend(period, {
      since : factory.Dates.now().add(0 - period.value, period.unit),
    })),
    titles : {},
  }; /* <!-- State --> */
  /* <!-- Internal Variables --> */
 
  /* <!-- Internal Functions --> */
  FN.code = period => `${period.value}${period.unit.substring(0, 1)}`;
  
  FN.title = (audience, type, period) => {
    
    /* <!-- Set up Holders, if required --> */
    if (!ರ‿ರ.titles[audience]) ರ‿ರ.titles[audience] = {};
    if (!ರ‿ರ.titles[audience][type]) ರ‿ರ.titles[audience][type] = {};
    
    /* <!-- Return or Fetch Document --> */
    return ರ‿ರ.titles[audience][type][period] || 
      (ರ‿ರ.titles[audience][type][period] = factory.Display.doc.get(`${audience.toUpperCase()}_${type.toUpperCase()}_TITLE`, period, true));
    
  };
  
  FN.person = (period, people, user, title, audience, type, badge, faded, icon) => {
    
     var _person = _.find(people, person => person.id == user);
     if (_person) {
       
       var _code = FN.code(period),
           _id = `${_person.id}_${type}`,
           _period = _.find(_person.children, child => child.id == _id);
       
       if (!_period) _person.children.push(_period = {
          id : _id,
          key : title,
          values : {},
          badge : badge,
          icon : icon || type,
          __class : faded ? "o-50" : null
        });
       
       var _value = _period.values[_code];
       if (!_value) _value = _period.values[_code] = {
         value: 0,
         title: FN.title(audience, type, period.text)
       };
       
       _value.value += 1;
       
     }
  };
  
  FN.calculate = {
    
    classroom : classroom => _.map(ರ‿ರ.periods, period => {
            
        /* <!-- Get the From Point, All Students to build a inactive list from, and the filtered list of classwork and announcements --> */
        var _from = period.since.toISOString(),
            _students = _.clone(classroom.$$$students),
            _classwork = _.filter(classroom.$work,
                                  work => work.scheduledTime >= _from || work.updateTime >= _from || work.creationTime >= _from),
            _announcements = _.filter(classroom.$announcements,
                                  announcement => announcement.updateTime >= _from || announcement.creationTime >= _from);

        /* <!-- Remove Students from list on inactive who have submitted work --> */
        _.each(_classwork, work => {

          /* <!-- Add to Teacher Classwork Badge --> */
          FN.person(period, classroom.teachers, work.creatorUserId, "C", "teacher", "work", "dark");

          _.each(work.$submissions || [], submission => {

              /* <!-- Only use if the state is in our desired list --> */
              if (options.states.indexOf(submission.state) >= 0) {

                /* <!-- Add to Student Submissions Badge --> */
                FN.person(period, classroom.students, submission.userId, "C", "student", "work", "dark", true);

                /* <!-- Exclude student from our inactive list --> */
                _students = _.without(_students, submission.userId);

              }

            });

        });

        /* <!-- Remove Students from list on inactive who have posted announcements --> */
        _.each(_announcements, announcement => {

           /* <!-- Add to Teacher Announcements Badge --> */
           FN.person(period, classroom.teachers, announcement.creatorUserId, "A", "teacher", "announcement");

           /* <!-- Add to Student Announcements Badge --> */
           FN.person(period, classroom.students, announcement.creatorUserId, "A", "student", "announcement");

            /* <!-- Exclude student from our inactive list --> */
           if (options.announcements) _students = _.without(_students, announcement.creatorUserId);

        });

        /* <!-- Return Badge Encapsulating Number of Engaged Students --> */
        return classroom.$students && classroom.$students.length > 0 ? {
          $numeric : (classroom.$students.length - _students.length) / classroom.$students.length,
          __small : true,
          __class : `badge badge-${_students.length === 0 ? "success" : _students.length == classroom.$students.length ?
                      "danger" : _students.length >= (classroom.$students.length / 10) ? "warning" : "light"} font-weight-light`,
          text: factory.Display.doc.get({
                    name : "ENGAGEMENT_PERIOD",
                    data : {
                      period : period.text,
                      value : classroom.$students.length - _students.length,
                      total : classroom.$students.length
                    },
                    trim : true,
                  }),
          title: _students.length > 0 ? "Inactive Students" : "All Students active during the Time Period",
          details: _students.length > 0 ? 
            factory.Display.template.get("popover_people")(_.filter(classroom.$students, student => _students.indexOf(student.userId) >= 0)) :
            null
        } : [];

      }),
    
    student: student => _.map(ರ‿ರ.periods, period => {
      
     /* <!-- Get the From Point, All Students to build a inactive list from, and the filtered list of classwork and announcements --> */
      var _from = period.since.toISOString(),
          _classes = _.map(student.$$$classes, classroom => classroom.toString()),
          _classwork = _.chain(student.$classes).map("$work").flatten()
                          .filter(w => w.scheduledTime >= _from || w.updateTime >= _from || w.creationTime >= _from).value(),
          _announcements = _.chain(student.$classes).map("$announcements").flatten()
                          .filter(a => a.creatorUserId == student.id && (a.updateTime >= _from || a.creationTime >= _from)).value();

      /* <!-- Remove Students from list on inactive who have submitted work --> */
      _.each(_classwork, work => _.each(work.$submissions || [], submission => {

        /* <!-- Only use if the state is in our desired list / Exclude Class from our inactive list --> */
        if (submission.userId == student.id && options.states.indexOf(submission.state) >= 0) 
          _classes = _.without(_classes, work.courseId.toString());

      }));
      
      /* <!-- Remove Students from list on inactive who have posted announcements / Exclude class from our inactive list--> */
      if (options.announcements) _.each(_announcements, 
            announcement => _classes = _.without(_classes, announcement.courseId.toString()));
      
      /* <!-- Return Badge Encapsulating Number of Engaged Classes --> */
        return student.$classes && student.$classes.length > 0 ? {
          $numeric : (student.$classes.length - _classes.length) / student.$classes.length,
          __small : true,
          __class : `badge badge-${_classes.length === 0 ? "success" : _classes.length == student.$classes.length ?
                      "danger" : _classes.length >= (student.$classes.length / 10) ? "warning" : "light"} font-weight-light`,
          text: factory.Display.doc.get({
                    name : "ENGAGEMENT_PERIOD",
                    data : {
                      period : period.text,
                      value : student.$classes.length - _classes.length,
                      total : student.$classes.length
                    },
                    trim : true,
                  }),
          title: _classes.length > 0 ? "Inactive Classes" : "All Classes active during the Time Period",
          details: _classes.length > 0 ? 
            factory.Display.template.get("popover_classes")(_.filter(student.$classes, classroom => _classes.indexOf(classroom.$id.toString()) >= 0)) :
            null
        } : [];
      
    }),
    
  };
  
  FN.engagement = (id, targets, types, event) => Promise.resolve(options.functions.populate.get(id))
    .then(classroom => classroom ? Promise.all([
        options.functions.common.type(types, "students", true) || options.functions.common.stale(classroom, "students") ?
          options.functions.people.students(classroom)
            .then(value => (factory.Main.event(event, factory.Main.message(classroom.$students.length || 0, "student", "students")), value)) : 
          Promise.resolve(true),
        options.functions.common.type(types, "teachers", true) || options.functions.common.stale(classroom, "teachers") ?
          options.functions.people.teachers(classroom)
            .then(value => (factory.Main.event(event, factory.Main.message(classroom.$teachers.length || 0, "teacher", "teachers")), value)) : 
          Promise.resolve(true),
        options.functions.common.type(types, "announcements") ? 
          options.functions.classes.announcements(classroom, true, null, ರ‿ರ.from.toISOString())
            .then(value => (factory.Main.event(event, factory.Main.message(value ? value.length || 0 : 0, "announcement", "announcements")), value)) : 
          Promise.resolve(true),
        options.functions.common.type(types, "work") ? options.functions.classes.work(classroom, true, null, ರ‿ರ.from.toISOString())
          .then(value => (factory.Main.event(event, factory.Main.message(value ? value.length || 0 : 0, "assignment", "assignments")), value))
          .then(classwork => {
            var processed = 0;
            return Promise.all(_.map(classwork, 
              work => options.functions.classes.submissions(classroom, work, true)
               .then(submissions => factory.Main.event(event, factory.Main.message(processed += (submissions ? submissions.length || 0 : 0),
                                                                                    "submission", "submissions", "processed")))))
              .then(() => classwork);
          }) : Promise.resolve(true),
      ]).then(results => {
    
        /* <!-- Log Classroom Engagement --> */
        factory.Flags.log(`Classroom [${id}]`, classroom);
        factory.Flags.log(`Engagement for Classroom [${id}]`, results);
    
        /* <!-- Calculate Engagement --> */
        if (results[3] && results[3] !== true && 
            ((classroom.$work && classroom.$work.length > 0) || (classroom.$announcements && classroom.$announcements.length > 0))) {
          classroom.engagement =  FN.calculate.classroom(classroom);
          classroom.engagement.__condensed = (classroom.engagement.length >= 2);
          var _numerics = _.map(classroom.engagement, "$numeric");
          classroom.$$engagement = Math.preciseRound(_.reduce(_numerics, (total, value) => total + value, 0) / _numerics.length, 2);
        }
        
        /* <!-- Update the class object, and call for a visual update --> */
        options.functions.populate.update(classroom);
      
        /* <!-- Remove the loader to inform that loading has completed --> */
        options.functions.common.refresh(["teachers", "students", "engagement", "fetched"], targets, classroom);
        
      }) : false);
  /* <!-- Internal Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Public Functions --> */
  FN.meta = () => ({
    fetched: options.functions.common.column("fetched") + 1,
    students : options.functions.common.column("students") + 1,
    teachers : options.functions.common.column("teachers") + 1,
    engagement : options.functions.common.column("engagement") + 1,
  });
  
  FN.row = (meta, row, force, types) => {
    
    var _students = row.find(`td:nth-child(${meta.students})`).first(),
        _teachers = row.find(`td:nth-child(${meta.teachers})`).first(),
        _fetched = row.find(`td:nth-child(${meta.fetched})`).first(),
        _engagement = row.find(`td:nth-child(${meta.engagement})`).first();
    
    var _id = row.data("id"),
        _event = `${options.functions.events.engagement.progress}-${_id}`;
    
    return _engagement && (force || _engagement.html() == "") ? FN.engagement(_id, {
      students: _students,
      teachers: _teachers,
      fetched: _fetched,
      engagement: factory.Main.busy_element(force ? _engagement.empty() : _engagement, _event, "Calculating Engagement"),
    }, types, _event) : Promise.resolve(null);
    
  };
  
  FN.generate = force => {
    var _meta = FN.meta();
    return Promise.all(_.map(options.state.session.table.table().find("tbody tr[data-id]").toArray(), el => FN.row(_meta, $(el), force)));
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
   
    generate: FN.generate,
    
    periods: () => _.map(options.periods, period => _.extend({
      code: FN.code(period),
    }, period)),
    
    student: student => {
      student.engagement =  FN.calculate.student(student);
      var _numerics = _.map(student.engagement, "$numeric");
      student.$$engagement = Math.preciseRound(_.reduce(_numerics, (total, value) => total + value, 0) / _numerics.length, 2);
      return student;
    },
    
    /* <!-- Types - array / string of usage that is used to update the usage (null / false) --> */
    update: (id, force, types) => FN.row(FN.meta(), options.state.session.table.table().find(`tbody tr[data-id='${id}']`), force, types),
    
  };
  /* <!-- External Visibility --> */

};