Process = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      format: "HH:mm",
      margin: 0.9975,
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
  
  var _period = (date, from) => date.hour() + (Math.floor(factory.Dates.duration(date.diff(from)).asDays()) * 24) + (date.minute() / 60);
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

  FN.integrate = all => _.reduce(all, (memo, periods) => {
      if (memo.length === 0) {
        _.each(periods, period => {
          if (period.title !== undefined) {
            period.title = "Not Available";
            period.organiser = "N/A";
          }
        });
        return periods;  
      } else {
        return _.reduce(periods, (memo, period) => {
          if (period.title !== undefined) { /* <!-- This is a period of unavailability --> */
            
            period.title = "Not Available";
            period.organiser = "N/A";
            
            if (period.width < 100) {
              
              /* <!-- Removed any contained existing periods --> */
              memo = _.reject(memo, existing => existing.start >= period.start && 
                              (existing.end === undefined && period.end === undefined || 
                                (existing.end && period.end && existing.end <= period.end)));
              
              /* <!-- Get Insertion Position --> */
              var insert = Math.max(_.findIndex(memo, existing => existing.start >= period.start), 0);
              
              /* <!-- Insert in at specified position --> */
              memo.splice(insert, 0, period);
              
              if (insert > 0) { /* <!-- Adjust Previous if required --> */
                memo[insert - 1].end = period.start;
                memo[insert - 1].until = period.from;
                memo[insert - 1].width = period.start_pos - memo[insert - 1].start_pos;
                if (period.time && memo[insert - 1].time)
                      memo[insert - 1].time = `${memo[insert - 1].time.split(" - ")[0]} - ${period.time.split(" - ")[0]}`;
              }
              if (insert < memo.length - 1) { /* <!-- Adjust Next if required --> */
                if (memo[insert + 1].start < period.start) { /* <!-- Need to split across the newly inserted period --> */
                  var _new = _.clone(memo[insert + 1]);
                  _new.end = period.start;
                  _new.until = period.from;
                  _new.width = period.start_pos - _new.start_pos;
                  if (period.time && _new.time)
                      _new.time = `${_new.time.split(" - ")[0]} - ${period.time.split(" - ")[0]}`;
                  memo.splice(insert, 0, _new);
                  insert += 1;
                }
                memo[insert + 1].start = period.end;
                memo[insert + 1].from = period.until;
                memo[insert + 1].width = (memo[insert + 1].end_pos || 100) - period.end_pos;
                if (period.time && memo[insert + 1].time)
                      memo[insert + 1].time = `${period.time.split(" - ")[1]} - ${memo[insert + 1].time.split(" - ")[1]}`;
              }
            } else {
              memo = [period];
            }
          }
          return memo;
        }, memo);
      }
    }, []),
    
  FN.periods = (events, from, until) => {

    var _hours = Math.ceil(factory.Dates.duration(until.diff(from)).asHours()),
        _base = 24,
        _multi = _hours >_base;
    
    return _.chain(events).reduce((memo, event, index) => {

      var _convert = value => value / _hours * 100,
        _from = factory.Dates.parse(event.start.dateTime || event.start),
        _until = factory.Dates.parse(event.end.dateTime || event.end),
        _start = !_multi && _from.date() < _until.date() && _from.date() < from.date() ? 0 : _period(_from, from),
        _end = _multi && _until.date() > from.date() ? 
                (_base * (_until.date() - from.date())) + (_until.date() > until.date() ? _base : _period(_until, _until.clone().startOf("day"))) : 
                _period(_until, from),
        _width = _convert(_end - _start);

      if (_width > 0) {

        /* <!-- Resize / Remove Previous Spacer --> */
        var _last = _convert(_start - memo[memo.length - 1].start);
        _last <= 0 ? memo.pop() : (memo[memo.length - 1].width = _last,
          memo[memo.length - 1].time = options.functions.calendar.times(memo[memo.length - 1].from, _from, _multi),
          memo[memo.length - 1].until = _from, memo[memo.length - 1].end = _start, memo[memo.length - 1].end_pos = _convert(_start));

        /* <!-- Add Current Event --> */
        memo.push({
          title: event.summary || "",
          time: options.functions.calendar.times(!_multi && _from.date() < from.date() ? from : _from, _until, _multi),
          organiser: event.organizer ? event.organizer.displayName || event.organizer.email : "",
          width: _width,
          from: _from,
          until: _until,
          start: _start,
          start_pos: _convert(_start),
          end: _end,
          end_pos: _convert(_end)
        });
 
        /* <!-- Add Spacer, but only if we aren't within about 3 mins of the end of period --> */
        if (_end < (_hours * options.margin)) memo.push({
          from: _until,
          start: _end,
          start_pos: _convert(_end),
          width: _convert(_hours - _end),
        });

        /* <!-- Final Free Period of the Day --> */
        if (_end == _base || (index == events.length - 1 && memo[memo.length - 1].from)) {
          var _final = memo[memo.length - 1];
          _final.until = _multi ? until.clone().endOf("day") : _final.from.clone().endOf("day");
          _final.time = options.functions.calendar.times(!_multi && _final.from.date() < from.date() ? from : _final.from, _final.until, _multi);
        }

      }

      return memo;

    }, [{
      from: from,
      until: until,
      time: options.functions.calendar.times(from, until, _multi),
      start: 0,
      start_pos: 0,
      width: 100,
    }]).each((event, index, events) => {
        if (index > 0 && event.title !== undefined && events[index - 1].title !== undefined && !events[index - 1].class) event.class = "danger";
      }).value();
  };
  
  FN.busy = (calendars, tolerance, from, until) => {
    
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
              });
              existing.start = _start;
            }

            /* <!-- 2/ Handle Existing Ends after our current Busy period --> */
            if (existing.end.isAfter(_end)) {
              memo.push({
                start: factory.Dates.parse(_end),
                end: factory.Dates.parse(existing.end),
                resources: _.clone(existing.resources),
              });
              existing.end = _end;
            }

            /* <!-- 3/ Handle Current Starts before Existing --> */
            if (_start.isBefore(existing.start)) memo.push({
                start: factory.Dates.parse(_start),
                end: factory.Dates.parse(existing.start),
                resources: [key],
              });

            /* <!-- 4/ Handle Current Ends after Existing --> */
            if (_end.isAfter(existing.end)) memo.push({
                start: factory.Dates.parse(existing.end),
                end: factory.Dates.parse(_end),
                resources: [key],
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
    return tolerance < 0 ? [{
          title: "NO AVAILABILITY",
          time: "Start - End",
          organiser: "",
          start: 0,
          start_pos: 0,
          width: 100,
          from: from,
          until: until,
        }] : FN.periods(_.chain(_all).reject(busy => busy.resources.length <= tolerance).sortBy("end").sortBy("start").value(), from, until);
    
  };
  
  FN.available = periods => _.filter(periods, period => period.title === undefined);
      
  FN.resources = resources => _.reduce(resources, (memo, resource) => {
    if (resource.parents && resource.parents.length > 0) {
      _.each(resource.parents, parent => {
        var _parent = _.find(memo, value => String.equal(value.id, parent, true));
        if (!_parent) memo.push(_parent = {
          id: parent,
          name: parent,
          children: [],
        });
        _parent.children.push(resource);  
      });
    } else {
      memo.push(resource);
    }
    return memo;
  }, []);
  
  FN.bundles = (bundles, resources, all) => _.reduce(bundles, (memo, bundle) => {
    var _resources = _.filter(resources, resource => _.find(resource.bundles, resBundle => String.equal(resBundle.name, bundle, true)));
    if (all || (_resources && _resources.length > 0)) memo.push({
        id: bundle,
        name: bundle,
        children: (all ? 
          _.reduce(_.filter(all, allBundle => String.equal(allBundle.name, bundle, true)), (memo, childBundle) => {
            var _child = _.find(memo, child => child.sequence == childBundle.sequence) || memo[memo.push({
                sequence : childBundle.sequence,
                quantity : childBundle.quantity,
                children : []
              }) - 1];
            var _childResources = _.filter(resources, resource => _.find(resource.bundles, 
              resBundle => String.equal(resBundle.name, bundle, true) && resBundle.sequence == childBundle.sequence && resBundle.quantity == childBundle.quantity));
            if (_childResources && _childResources.length > 0) Array.prototype.push.apply(_child.children, _childResources);
            return memo;
          }, []) : 
          _.reduce(_resources, (memo, resource) => {
            var _bundles = _.filter(resource.bundles, resBundle => String.equal(resBundle.name, bundle, true));
            _.each(_bundles, _bundle => {
              var _child = _.find(memo, child => child.sequence == _bundle.sequence) || memo[memo.push({
                sequence : _bundle.sequence,
                quantity : _bundle.quantity,
                children : []
              }) - 1];
              _child.children.push(resource);
            });
            return memo;
          }, [])).sort((a, b) => a.sequence - b.sequence),
      });
    return memo;
  }, []);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};