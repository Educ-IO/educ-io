Task = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored tasks --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Underscore | App Scope: schema --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
          zombie: 60,
          ghost: 120,
        },
        EXTRACT = {
          hours: /\b(\d{1,4}\.?\d{0,2})(h|hr|hrs|hour|hours|m|min|mins)\b/i,
          period: /(^|\s|\(|\{|\[)(all day|all morning|all afternoon|all evening|[ap]m)\b/i,
          time: /(?:^|\s)((0?[1-9]|1[012])([:.]?[0-5][0-9])?(\s?[ap]m)|([01]?[0-9]|2[0-3])([:.]?[0-5][0-9]))(?:[.!?]?)(?:\s|$)/i,
          date: /\b(\d{4})-(\d{2})-(\d{2})|((0?[1-9]|[12]\d|30|31)[^\w\d\r\n:](0?[1-9]|1[0-2]|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[^\w\d\r\n:](\d{4}|\d{2}))\b/i,
        },
        SPLIT = {
          tags: /[^a-zA-Z0-9#@!\?\-_]/, /* <!-- Valid Characters for Tags/Badges --> */
        },
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  var reference = factory.Dates.now().startOf("day"), process;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  
  /* <!-- Temporal Functions --> */
  FN.temporal = {
    
    before: (item, value) => value === false ? false : item[options.schema.columns.from.value].isBefore(value),
  };

  /* <!-- Dormancy Functions | Zombie and Ghost --> */
  FN.dormancy = {
    
    dormant: (item, ghostly, zombified) => FN.temporal.before(item, ghostly) ? 
            FN.dormancy.ghostly(item, true) : FN.dormancy.zombified(item,  FN.temporal.before(item, zombified)),
    
    ghostly: (item, value) => {
        item[options.schema.columns.is_ghost.value] = value;
        item[options.schema.columns.dormancy.value] = item[options.schema.columns.from.value].fromNow();
      },
    
    zombified: (item, value) => value ? item[options.schema.columns.is_zombie.value] = value : delete item[options.schema.columns.is_zombie.value],
    
  };
  
  /* <!-- Prepare : Includes display-dependent / performance heavy processing of items, called before display (rather than upon DB retrieval) --> */
  FN.prepare = {
    
    item: (item, force) => {
      (!item.DISPLAY || force) && item.DETAILS ? item.DISPLAY = options.state.application.showdown.makeHtml(item.DETAILS) : false;
      (!item._action || force) ? item._action = ((item.IS_COMPLETE && item.DONE) ?
        item.DONE : (item.IS_TIMED || item.FROM.isAfter(options.state.session.today)) ?
        item.FROM : factory.Dates.parse(options.state.session.today)).format(options.date_format) : false;
      (!item.__HASH || force) ? item.__HASH = options.state.session.database.hash(item) : false;
      item.IN_FUTURE ? item.SCHEDULED_IN = factory.Dates.duration(item.FROM.diff(options.state.session.today)).humanize() : delete item.SCHEDULED_FOR;
      return item;
    },
    
  };
  
  /* <!-- Process : Called on all items when retrieved from DB, to set extra properties and parse text etc. --> */
  FN.process = {
    
    items: (zombified, ghostly) => items => _.isArray(items) ? _.map(items, item => FN.process.item(item, zombified, ghostly)) : FN.process.item(items, zombified, ghostly),
      
    item: (item, zombified, ghostly) => {

      /* <!-- Add any undated items to todays docket --> */
      if (!item[options.schema.columns.from.value]) item[options.schema.columns.from.value] = factory.Dates.now().startOf("day");
      
      /* <!-- Extract Due Date from Details if found --> */
      var _due = item[options.schema.columns.details.value].match(EXTRACT.date);
      if (_due && _due.length >= 1) {

        item[options.schema.columns.due.value] = _due[0];

        /* <!-- Parse Due Date --> */
        item[options.schema.columns.due.parsed] = factory.Dates.parse(_due[0], ["DD/MM/YYYY", "D/M/YY", "DD-MM-YY", "DD-MM-YYYY", "DD-MMM-YY", "DD-MMM-YYYY", "YYYY-MM-DD"]);

        /* <!-- Countdown Days to Due --> */
        item[options.schema.columns.countdown.value] = item[options.schema.columns.due.parsed].diff(factory.Dates.now(), "days");

      } else {

        delete item[options.schema.columns.due.value];
        delete item[options.schema.columns.due.parsed];
        delete item[options.schema.columns.countdown.value];

      }

      /* <!-- Extract Time from Details if found --> */
      var _period = item[options.schema.columns.details.value].match(EXTRACT.period),
        _time = item[options.schema.columns.details.value].match(EXTRACT.time),
        _duration = item[options.schema.columns.details.value].match(EXTRACT.hours);

      /* <!-- If time is actually part of the due date, discard time (better than look-ahead regex matching?). --> */
      if (_due && _due.length >= 1 && _time && _time.length >= 1 && item[options.schema.columns.due.parsed] &&
          item[options.schema.columns.due.parsed].isValid() && _due[0].indexOf(_time[1]) >= 0) _time = null;


      /* <!-- Set Time if available --> */
      if ((item[options.schema.columns.time.value] = _period && _period.length >= 1 ?
           _period[_period.length >= 2 ? 2 : 1] : _time && _time.length >= 1 ? _time[1] : "")) {
        item[options.schema.columns.is_timed.value] = true;
        /* <!-- Only try to parse actual time (not All Day/AM/PM etc.) --> */
        _time && _time.length >= 1 ? item[options.schema.columns.time.parsed] = factory.Dates.parse(item[options.schema.columns.time.value], 
          ["ha", "hh:mma", "HH:mm", "HH:mm:ss"]).set({
            "year": item[options.schema.columns.from.value].year(),
            "month": item[options.schema.columns.from.value].month(),
            "date": item[options.schema.columns.from.value].date(),
          }) : delete item[options.schema.columns.time.parsed];
      } else {
        delete item[options.schema.columns.time.value];
        delete item[options.schema.columns.time.parsed];
        delete item[options.schema.columns.is_timed.value];
      }


      /* <!-- Set Duration if available --> */
      if (_duration && _duration.length >= 1 && parseFloat(_duration[1]) > 0) {
        item[options.schema.columns.duration.value] = _duration[0];
        item[options.schema.columns.duration.parsed] = factory.Dates.duration(parseFloat(_duration[1]), _duration[2].toLowerCase()[0]);
        item[options.schema.columns.has_duration.value] = true;
      } else {
        delete item[options.schema.columns.duration.value];
        delete item[options.schema.columns.duration.parsed];
        delete item[options.schema.columns.has_duration.value];
      }


      /* <!-- In the future --> */
      item[options.schema.columns.from.value].isAfter() ?
        item[options.schema.columns.in_future.value] = true :
        delete item[options.schema.columns.in_future.value];


      /* <!-- Split Tags into Badges --> */
      item[options.schema.columns.tags.value] ?
        item[options.schema.columns.badges.value] = _.compact(item[options.schema.columns.tags.value].split(SPLIT.tags).sort()) :
        delete item[options.schema.columns.badges.value];


      /* <!-- Set Has Tags --> */
      item[options.schema.columns.tags.value] && 
        _.find(item[options.schema.columns.badges.value], value => value && value.indexOf(options.markers.project) !== 0 && value.indexOf(options.markers.assignation) !== 0) ?
          item[options.schema.columns.has_tags.value] = true : delete item[options.schema.columns.has_tags.value];


      /* <!-- Set Has Projects --> */
      item[options.schema.columns.tags.value] && 
        _.find(item[options.schema.columns.badges.value], value => value && value.indexOf(options.markers.project) === 0) ?
          item[options.schema.columns.has_projects.value] = true : delete item[options.schema.columns.has_projects.value];      

      
      /* <!-- Set Has Assignations --> */
      item[options.schema.columns.tags.value] && 
        _.find(item[options.schema.columns.badges.value], value => value && value.indexOf(options.markers.assignation) === 0) ?
          item[options.schema.columns.has_assignations.value] = true : delete item[options.schema.columns.has_assignations.value];    
      
      
      /* <!-- Set Appropriate Status --> */
      options.schema.enums.status.complete.equals(item[options.schema.columns.status.value], true) ?
        item[options.schema.columns.is_complete.value] = true : delete item[options.schema.columns.is_complete.value];


      /* <!-- Set Zombie | Ghost Status --> */
      if (!item[options.schema.columns.is_timed.value] && !item[options.schema.columns.is_complete.value] && 
          item[options.schema.columns.countdown.value] === undefined) FN.dormancy.dormant(item, ghostly, zombified);


      return item;

    },
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    regexes: {

      period: EXTRACT.period,
      
      hours: EXTRACT.hours,
      
      time: EXTRACT.time,

      date: EXTRACT.date,

    },
    
    process: () => process ? process : (process = FN.process.items(
        options.zombie === false ? false : reference.clone().subtract(options.zombie, "days"),
        options.ghost === false ? false : reference.subtract(options.ghost, "days"))),
    
    prepare : (items, force) => _.isArray(items) ? _.map(items, item => FN.prepare.item(item, force)) : FN.prepare.item(items, force),
    
  };
  /* <!-- External Visibility --> */

};  