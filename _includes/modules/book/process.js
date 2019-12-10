Process = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      format: "HH:mm"
    },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _mine = event => event.organizer && event.organizer.email == factory.me.email;
  
  var _period = date => date.hour() + (date.minute() / 60);
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.me = (events, calendar) => _.chain(events)
                    .filter(_mine)
                    .each(options.functions.calendar.time)
                    .each(event => {
                      event.calendar = calendar;
                      event.properties = options.functions.calendar.properties(event);
                    })
                    .value();

  FN.periods = events => _.chain(events).reduce((memo, event, index) => {

    var _convert = value => value / 24 * 100,
      _from = factory.Dates.parse(event.start.dateTime || event.start),
      _until = factory.Dates.parse(event.end.dateTime || event.end),
      _start = _period(_from),
      _end = _until.date() > _from.date() ? 24 : _period(_until),
      _width = _convert(_end - _start);

    if (_width > 0) {

      /* <!-- Resize / Remove Previous Spacer --> */
      var _last = _convert(_start - memo[memo.length - 1].start);
      _last <= 0 ? memo.pop() : (memo[memo.length - 1].width = _last,
        memo[memo.length - 1].time = options.functions.calendar.times(memo[memo.length - 1].from, _from),
        memo[memo.length - 1].until = _from);

      /* <!-- Add Current Event --> */
      memo.push({
        title: event.summary || "",
        time: options.functions.calendar.times(_from, _until),
        organiser: event.organizer ? event.organizer.displayName || event.organizer.email : "",
        width: _width
      });

      /* <!-- Add Spacer, but only if we aren't within about 3 mins of the end of day --> */
      if (_end < 23.95) memo.push({
        from: _until,
        start: _end,
        width: _convert(24 - _end),
      });

      /* <!-- Final Free Period of the Day --> */
      if (index == events.length - 1 && memo[memo.length - 1].from) {
        var _final = memo[memo.length - 1];
        _final.until = _final.from.clone().endOf("day");
        _final.time = options.functions.calendar.times(_final.from, _final.until);
      }

    }

    return memo;

  }, [{
    from: options.state.session.current,
    until: factory.Dates.parse(options.state.session.current).add(1, "day"),
    start: 0,
    width: 100,
  }]).each((event, index, events) => {
      if (index > 0 && event.title !== undefined && events[index - 1].title !== undefined && !events[index - 1].class) event.class = "danger";
    }).value();

  FN.busy = (calendars, tolerance) => {
    
    var _all = _.reduce(calendars, (memo, calendar, key) => {
    
      return _.reduce(calendar.busy, (memo, busy) => {

        var _start = factory.Dates.parse(busy.start),
            _end = factory.Dates.parse(busy.end),
            _handled = false;

        memo = _.reduce(memo, (memo, existing) => {

          if (!_handled && existing.start.isBefore(_end) && existing.end.isAfter(_start)) {
            /* <!-- We have an intersection --> */

            /* <!-- 1/ Handle Existing Starts before our current Busy period --> */
            if (existing.start.isBefore(_start)) {
              memo.push({
                start: factory.Dates.parse(existing.start),
                end: factory.Dates.parse(_start),
                resources: _.clone(existing.resources),
                case: 1
              });
              existing.start = _start;
            }

            /* <!-- 2/ Handle Existing Ends after our current Busy period --> */
            if (existing.end.isAfter(_end)) {
              memo.push({
                start: factory.Dates.parse(_end),
                end: factory.Dates.parse(existing.end),
                resources: _.clone(existing.resources),
                case: 2
              });
              existing.end = _end;
            }

            /* <!-- 3/ Handle Current Starts before Existing --> */
            if (_start.isBefore(existing.start)) memo.push({
                start: factory.Dates.parse(_start),
                end: factory.Dates.parse(existing.start),
                resources: [key],
                case: 3
              });

            /* <!-- 4/ Handle Current Ends after Existing --> */
            if (_end.isAfter(existing.end)) memo.push({
                start: factory.Dates.parse(existing.end),
                end: factory.Dates.parse(_end),
                resources: [key],
                case: 4
              });
            
            /* <!-- Update Existing --> */
            existing.resources.push(key);
            _handled = true;

          }

          memo.push(existing);
          return memo;

        }, []);

        if (!_handled && _end.isAfter(_start)) memo.push({
          start: _start,
          end: _end,
          resources: [key],
        });

        return memo;

      }, memo);

    }, []);
    
    /* <!-- Filter by Busy periods below the tolerance threshold (e.g. has enough resources) --> */
    return FN.periods(_.chain(_all).reject(busy => busy.resources.length <= tolerance).sortBy("end").sortBy("start").value());
    
  };
  
  FN.available = periods => _.filter(periods, period => period.title === undefined);
      
  FN.resources = resources => _.reduce(resources, (memo, resource) => {
    if (resource.parent) {
      var _parent = _.find(memo, value => String.equal(value.id, resource.parent, true));
      if (!_parent) memo.push(_parent = {
        id: resource.parent,
        name: resource.parent,
        children: [],
      });
      _parent.children.push(resource);
    } else {
      memo.push(resource);
    }
    return memo;
  }, []);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};