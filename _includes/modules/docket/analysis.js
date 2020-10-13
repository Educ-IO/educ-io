Analysis = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored tasks --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, Underscore | App Scope: schema, query, filter, [db] --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _generate = (items, detailed) => {
    
    var _complete = options.filter.complete(items),
        _timed = options.filter.timed(items),
        _future = options.filter.future(items),
        _pending = options.filter.pending(items),
        _total = _complete.length - _timed.length,
        _done = items.length - _future.length - _timed.length;
    
    var _analysis = {
      total: items.length,
      pending: _pending.length,
      complete: _complete.length,
      percentage_complete: Math.round((_total === 0 && _done === 0 ? 1 : _total / _done) * 100),
      percentage_all_complete: Math.round(_complete.length / items.length * 100),
      timed: _timed.length,
      future: _future.length,
    };
    
    _analysis.percentage_colour = _analysis.percentage_complete >= 75 ? 
      "success" : _analysis.percentage_complete >= 25 ? "warning" : "danger";
    
    if (detailed) {
      
      _analysis.detailed = true;
      
      var _empty = value => !value,
          _project = value => value && value.indexOf(options.markers.project) === 0,
          _assignment = value => value && value.indexOf(options.markers.assignation) === 0,
          _label = value => value && value.indexOf(options.markers.label) === 0,
          _uniq = value => value ? value.toLowerCase() : value,
          _all = _.chain(items).pluck(options.schema.columns.badges.value).flatten().compact()
                    .uniq(false, _uniq).value().sort();
      
      _analysis.tags = _.chain(_all)
        .reject(item => _empty(item) || _project(item) || _assignment(item) || _label(item))
        .map(value => value.toUpperCase()).value();
      
      _.each([
        {name: "projects", fn: _project}, 
        {name: "assignments", fn: _assignment}, 
        {name: "labels", fn: _label}
      ], item => _analysis[item.name] = _.chain(_all).reject(_empty).filter(item.fn).map(
        value => ({
          name: value.substr(1).toUpperCase(),
          count: _.chain(items).pluck(options.schema.columns.badges.value).flatten().reject(_empty)
            .map(tag => tag.toUpperCase()).filter(tag => tag == value.toUpperCase()).value().length,
        })
      ).value());
      
    }
    
    return _analysis;
    
  };
  
  var _dates = items => {
    
    var today = factory.Dates.now().startOf("day"),
        data = _.reduce(items, (memo, item) => {
          var _from = item[options.schema.columns.from.value],
              _due = item[options.schema.columns.due.parsed],
              _done = item[options.schema.columns.done.value];
          if (_from) {
            if (_from.isBefore(memo.from.earliest)) memo.from.earliest = _from;
            memo.from.latest = !memo.from.latest || _from.isAfter(memo.from.latest) ? _from : memo.from.latest;
          }
          if (_due) {
            memo.due.earliest = !memo.due.earliest || _due.isBefore(memo.due.earliest) ? _due : memo.due.earliest;
            memo.due.next = _due.isSameOrAfter(today) && (!memo.due.next || _due.isBefore(memo.due.next)) ? _due : memo.due.next;
            memo.due.latest = !memo.due.latest || _due.isAfter(memo.due.latest) ? _due : memo.due.latest;
          }
          if (_done) {
            memo.done.earliest = !memo.done.earliest || _done.isBefore(memo.done.earliest) ? _done : memo.done.earliest;
            memo.done.last = _done.isSameOrBefore(today) && (!memo.done.last || _done.isAfter(memo.done.last)) ? _done : memo.done.last;
            memo.done.latest = !memo.done.latest || _done.isAfter(memo.done.latest) ? _done : memo.done.latest;
          }
          return memo;
        }, {
          from: {
            earliest : factory.Dates.now().startOf("day"),
            latest : null
          },
          due: {
            earliest : null,
            next : null,
            latest : null
          },
          done: {
            earliest : null,
            last : null,
            latest : null
          }
        });
      
    if (items && items.length > 0) {
      
      /* <!-- Duration between earliest from and latest done date --> */
      if (data.done.latest) 
        data.duration = factory.Dates.duration(data.done.latest.diff(data.from.earliest));
      data.from.end = data.from.latest.isAfter(today) && (data.from.future = true) ? data.from.latest : today;
      
      /* <!-- Rangse and Historical Ranges (from today) --> */
      if (!data.from.earliest.isSame(data.from.latest))
        data.from.range = factory.Dates.duration(data.from.latest.diff(data.from.earliest));
      if (data.from.earliest.isBefore(today)) 
        data.from.history = factory.Dates.duration(today.diff(data.from.earliest));
      
      if (data.due.earliest && data.due.latest && !data.due.earliest.isSame(data.due.latest))
        data.due.range = factory.Dates.duration(data.due.latest.diff(data.due.earliest));
      if (data.due.latest && !data.due.latest.isSame(data.from.earliest))
        data.due.history = factory.Dates.duration(data.due.latest.diff(data.from.earliest));
      
      if (data.done.earliest && data.done.latest && !data.done.earliest.isSame(data.done.latest))
        data.done.range = factory.Dates.duration(data.done.latest.diff(data.done.earliest));
      if (data.done.latest && !data.done.latest.isSame(data.from.earliest))
        data.done.history = factory.Dates.duration(data.done.latest.diff(data.from.earliest));
      
      if (data.done.last) {
        data.done.since = factory.Dates.duration(today.diff(data.done.last));
        if (data.done.since.months() > 1) data.done.dormant = true;
      }
      
    }
    
    return data;
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    generate: _generate,

    analysis: (tag, db) => {
      
      var _query = options.query.all_tagged(tag);
      factory.Flags.log(`Query [ALL] for: ${tag}`, _query);
      var _all = (db ? db : options.db).find(_query);
      factory.Flags.log(`Result Values for: ${tag}`, _all);
      
      var _results = _generate(_all);
      factory.Flags.log(`Analysis for: ${tag}`, _results);
      
      return _results;
    
    },
    
    summary: (since, db) => {
      
      var _query = options.query.forward(since);
      if (since) factory.Flags.log(`Query [Since] for: ${since}`, _query);
      var _all = (db ? db : options.db).find(_query);
      factory.Flags.log(since ? `Query [Since] for: ${since}` : "Query [all]", _all);
      
      var _results = _generate(_all, true);
      factory.Flags.log(since ? `Analysis [Since] for: ${since}` : 
                        "Analysis for all", _results);
      return _results;
      
    },
    
    series: (tags, projects, timed, since, until, durationed, exclude, touched, db) => {
      
      factory.Flags.log(`Series | TAGS = ${tags} | PROJECTS = ${projects} | TIMED = ${timed} | SINCE = ${since} | DURATIONED = ${durationed} | EXCLUDE = ${exclude}`);
      
      var _query = tags === false ? /* <!-- Tags === FALSE | All results, regardless of tags --> */
          since || until ? 
            (touched ? options.query.touched : options.query).between(since, until) :
             null : 
          tags === true ? 
            options.query.tagless(since, until, touched) : /* <!-- Tags === TRUE | Has no tag --> */
            options.query.all_tagged(tags, since, until, touched);
      
      if (projects !== false && projects !== undefined) {
        var _projects = projects === true ? /* <!-- Projects === TRUE | Has any project --> */
           options.query.project() : 
           projects === null ? /* <!-- Projects === NULL | Has no project --> */
            options.query.project(false) : 
            options.query.all_tagged(_.map(_.isArray(projects) ? projects : [projects], value => `#${value}`));
        _query = _query ? {"$and": [_query, _projects]} : _projects;
      } /* <!-- Projects === FALSE | All results, regardless of projects --> */
      
      /* <!-- Set timed / yes or no | null or undefined = ignore --> */
      _query = timed === false ? {"$and": [_query, options.query.timeless()]} :
                timed === true ? {"$and": [_query, options.query.timed()]} :
                  _query;
      
      /* <!-- Set durationed / yes or no | null or undefined = ignore --> */
      _query = durationed === false ? {"$and": [_query, options.query.durationless()]} :
                durationed === true ? {"$and": [_query, options.query.durationed()]} :
                  _query;
      
      factory.Flags.log(since ? `Query [Since] for: ${since}` : "Query [all]", _query);
      var _all = (db ? db : options.db).find(_query);
      
      /* <!-- Exclude Tags if appropriate --> */
      if (exclude && _.isArray(exclude) && exclude.length > 0) {
        var _exclude = options.query.all_tagged(exclude, since, until, touched),
            _exclusions = new Set((db ? db : options.db).find(_exclude).map(v => v.$loki));
        _all = _.reject(_all, v => _exclusions.has(v.$loki));
      }
      
      factory.Flags.log(since ? `Series [Since] for: ${since}` : "Series [all]", _all);
      
      var _count = (holder, name, count) => name ? 
          holder[name] ? holder[name] += count || 1 : holder[name] = count || 1 : null;
                    
      var _series = value => ([
        {name: "months", value: value.format("YYYY-MM"), date: factory.Dates.parse(value).startOf("month").toDate()},
        {name: "weeks", value: value.format("YYYY-WW"), date: factory.Dates.parse(value).startOf("isoWeek").toDate()},
        {name: "days", value: value.format("YYYY-DDDD"), date: factory.Dates.parse(value).startOf("day").toDate()},
        {name: "weekdays", value: value.format("E"), date: value.format("ddd")},
        {name: "monthdays", value: value.format("DD"), date: value.format("D")}
      ]);
      
      var _summary = _.reduce(_all, (memo, item) => {
        
        var _from = item[options.schema.columns.from.value] || null,
            _done = item[options.schema.columns.done.value] || null;
        
        /* <!-- Update Total Counts --> */
        if (_from) {
              
          _.each(_series(_from), series => {
            
            /* <!-- Add Series Started Counts --> */
            memo.series[series.name][series.value] ? 
                memo.series[series.name][series.value].counts.Started += 1 : 
                memo.series[series.name][series.value] = {date: series.date, counts : {Started : 1, Completed : 0, Timed: 0, Duration: 0}};
            
            /* <!-- Add Series Timed Counts --> */
            if (item[options.schema.columns.time.value]) memo.series[series.name][series.value].counts.Timed += 1;
            
            /* <!-- Add Series Duration Counts --> */
            if (item[options.schema.columns.duration.value]) memo.series[series.name][series.value].counts.Duration += 1;
            
            /* <!-- Add Series Tags | Badges Counts --> */
            if (item[options.schema.columns.badges.value]) _.each(_.reject(item[options.schema.columns.badges.value], badge => !badge),
                  badge => {
                    badge = (badge.indexOf("#") === 0 ? badge.substr(1) : badge).toUpperCase();

                    memo.series[series.name][series.value].counts[badge] ? 
                       memo.series[series.name][series.value].counts[badge] += 1 :
                       memo.series[series.name][series.value].counts[badge] = 1;

                  });
            
          });
          
          if (_done && (!until || _done.isSameOrBefore(until))) {
            
            _.each(_series(_done), series => memo.series[series.name][series.value] ? 
                 memo.series[series.name][series.value].counts.Completed += 1 : 
                 memo.series[series.name][series.value] = {date: series.date, counts : {Started : 0, Completed : 1, Timed : 0, Duration: 0}});
            
            var _duration = item[options.schema.columns.done.value].diff(item[options.schema.columns.from.value], "days");
            memo.stats.count += 1;
            memo.stats.total += _duration;
            memo.stats.all.push(_duration);
            
          }
          
        }

        /* <!-- Update Status Counts --> */
        if (item[options.schema.columns.status.value]) _count(memo.statuses, item[options.schema.columns.status.value].toUpperCase());
        if (item[options.schema.columns.is_zombie.value] || item[options.schema.columns.is_ghost.value]) _count(memo.statuses, "INACTIVE");
        if (item[options.schema.columns.is_zombie.value]) _count(memo.statuses, "ZOMBIES");
        if (item[options.schema.columns.is_ghost.value]) _count(memo.statuses, "GHOSTS");
        
        /* <!-- Update Type Count --> */
        if (item[options.schema.columns.type.value]) _count(memo.types, item[options.schema.columns.type.value].toUpperCase());
        
        /* <!-- Update Total Counts --> */
        if (item[options.schema.columns.duration.parsed]) {
          memo.durations.add(item[options.schema.columns.duration.parsed]);
          memo.durationed += 1;
        }
          
        /* <!-- Update Timed Counts --> */
        if (item[options.schema.columns.time.value]) memo.timed += 1;
        
        /* <!-- Update Future Counts --> */
        if (item._future) memo.future += 1;
        
        return memo;
        
      }, _.extend(_dates(_all), {
        series : {
          days : {},
          weeks : {},
          months : {},
          weekdays : {},
          monthdays : {}
        },
        stats : {
          count : 0,
          total : 0,
          all : [],
        },
        statuses : {
          "COMPLETE" : null,
          "IN PROGRESS" : null,
          "READY" : null,
          "ZOMBIES" : null,
          "GHOSTS" : null,
          "INACTIVE" : null
        },
        types : {},
        timed : 0,
        durations : factory.Dates.duration(0),
        durationed : 0,
        future : 0,
      }));
      
      _summary.total = _.reduce(_summary.statuses, (total, value) => value ? total + value : total, 0); 
        
      _summary.data = _all;
      _summary.percentages = _.mapObject(_summary.statuses, value => value ? Math.preciseRound(value / _summary.data.length, 2) * 100 : value);
      _summary.stats.average = _summary.stats.count ? Math.preciseRound(_summary.stats.total / _summary.stats.count, 2) : 0;
      _summary.stats.sd =  Math.preciseRound(_summary.stats.all.stdDev(), 1);
      
      return _summary;
      
    },
    
  };
  /* <!-- External Visibility --> */

};