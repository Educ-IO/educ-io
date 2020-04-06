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
        text : "Last 7 Day"
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
    }))
  }; /* <!-- State --> */
  /* <!-- Internal Variables --> */
 
  /* <!-- Internal Functions --> */
  FN.engagement = (id, targets, types) => Promise.resolve(options.functions.populate.get(id))
    .then(classroom => classroom ? Promise.all([
        options.functions.common.type(types, "students", true) || options.functions.common.stale(classroom, "students") ?
          options.functions.people.students(classroom) : Promise.resolve(true),
        options.functions.common.type(types, "teachers", true) || options.functions.common.stale(classroom, "teachers") ?
          options.functions.people.teachers(classroom) : Promise.resolve(true),
        options.functions.common.type(types, "announcements") ? 
          options.functions.classes.announcements(classroom, true, null, ರ‿ರ.from.toISOString()) : Promise.resolve(true),
        options.functions.common.type(types, "work") ? options.functions.classes.work(classroom, true, null, ರ‿ರ.from.toISOString())
          .then(classwork => Promise.all(_.map(classwork, work => options.functions.classes.submissions(classroom, work, true))).then(() => classwork)) : Promise.resolve(true),
      ]).then(results => {
    
        /* <!-- Log Classroom Engagement --> */
        factory.Flags.log(`Classroom [${id}]`, classroom);
        factory.Flags.log(`Engagement for Classroom [${id}]`, results);
    
        if (results[3] && results[3] !== true &&
            classroom.$students && classroom.$students.length > 0 &&
            classroom.$work && classroom.$work.length > 0) classroom.engagement = _.map(ರ‿ರ.periods, period => {
            
          /* <!-- Get the From Point, All Students to build a inactive list from, and the filtered list of classwork and announcements --> */
            var _from = period.since.toISOString(),
                _students = _.clone(classroom.$$$students),
                _classwork = _.filter(classroom.$work,
                                      work => work.scheduledTime >= _from || work.updateTime >= _from || work.creationTime >= _from),
                _announcements = _.filter(classroom.$announcements,
                                      announcement => announcement.updateTime >= _from || announcement.creationTime >= _from);
            
            /* <!-- Remove Students from list on inactive who have submitted work --> */
            _.each(_classwork, work => _.each(work.$submissions || [],
              submission => _students = options.states.indexOf(submission.state) >= 0 ? _.without(_students, submission.userId) : _students));

            /* <!-- Remove Students from list on inactive who have posted announcements --> */
            _.each(_announcements, announcement => _students = _.without(_students, announcement.creatorUserId));
          
            return {
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
            };
            
          });
    
        /* <!-- Update the class object, and call for a visual update --> */
        options.functions.populate.update(classroom);
      
        /* <!-- Remove the loader to inform that loading has completed --> */
        _.each(["teachers", "students", "engagement", "fetched"], 
               value => targets[value].empty().append(factory.Display.template.get("cell", true)(classroom[value])));
        
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
    
    return _engagement && (force || _engagement.html() == "") ? FN.engagement(row.data("id"), {
      students: _students,
      teachers: _teachers,
      fetched: _fetched,
      engagement: factory.Main.busy_element(force ? _engagement.empty() : _engagement),
    }, types) : Promise.resolve(null);
    
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
    
    /* <!-- Types - array / string of usage that is used to update the usage (null / false) --> */
    update: (id, force, types) => FN.row(FN.meta(), options.state.session.table.table().find(`tbody tr[data-id='${id}']`), force, types),
      
  };
  /* <!-- External Visibility --> */

};