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
        _pending = options.filter.pending(items);
    
    var _analysis = {
      total: items.length,
      pending: _pending.length,
      complete: _complete.length,
      percentage_complete: Math.round(_complete.length / (items.length - _future.length - _timed.length) * 100),
      percentage_all_complete: Math.round(_complete.length / items.length * 100),
      timed: _timed.length,
      future: _future.length,
    };
    
    _analysis.percentage_colour = _analysis.percentage_complete >= 75 ? "success" : _analysis.percentage_complete >= 25 ? "warning" : "danger";
    
    if (detailed) {
      
      _analysis.detailed = true;
      
      var _empty = value => !value,
          _project = value => value && value.indexOf(options.markers.project) === 0,
          _assignment = value => value && value.indexOf(options.markers.assignation) === 0,
          _uniq = value => value ? value.toLowerCase() : value,
          _all = _.chain(items).pluck(options.schema.columns.badges.value).flatten().compact()
                    .uniq(false, _uniq).value().sort();
      
      _analysis.tags = _.chain(_all).reject(item => _empty(item) || _project(item) || _assignment(item)).map(value => value.toUpperCase()).value();
      
      _.each([{name: "projects", fn: _project}, {name: "assignments", fn: _assignment}], 
              item => _analysis[item.name] = _.chain(_all).reject(_empty).filter(item.fn).map(
                value => ({
                  name: value.substr(1).toUpperCase(),
                  count: _.chain(items).pluck(options.schema.columns.badges.value).flatten().reject(_empty)
                    .map(tag => tag.toUpperCase()).filter(tag => tag == value.toUpperCase()).value().length,
                })
              ).value());
      
    }
    
    return _analysis;
    
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
    
    series: (tags, projects, timed, since, until, db) => {
      
      factory.Flags.log(`Series | TAGS = ${tags} | PROJECTS = ${projects} | TIMED = ${timed} | SINCE = ${since}`);
      
      var _query = tags === false ? /* <!-- Tags === FALSE | All results, regardless of tags --> */
          since || until ? 
            options.query.between(since, until) :
             null : 
          tags === true ? 
            options.query.tagless(since, until) : /* <!-- Tags === TRUE | Has no tag --> */
            options.query.all_tagged(tags, since, until);
      
      if (projects) {
        var _projects = projects === true ? /* <!-- Projects === TRUE | Has any project --> */
           options.query.project() : 
           projects === null ? /* <!-- Projects === NULL | Has no project --> */
            options.query.project(false) : 
            options.query.all_tagged(_.map(_.isArray(projects) ? projects : [projects], value => `#${value}`));
        _query = _query ? {"$and": [_query, _projects]} : _projects;
      } /* <!-- Projects === FALSE | All results, regardless of projects --> */
      
      if (timed === false) _query = {"$and": [_query, options.query.timeless()]}; 
        
      factory.Flags.log(since ? `Query [Since] for: ${since}` : "Query [all]", _query);
      var _all = (db ? db : options.db).find(_query);
      factory.Flags.log(since ? `Series [Since] for: ${since}` : "Series [all]", _all);
      
      var _earliest = _.reduce(_all, (earliest, item) => item[options.schema.columns.from.value] && item[options.schema.columns.from.value].isBefore(earliest) ?
                               item[options.schema.columns.from.value] : earliest,
                                        factory.Dates.now().startOf("day")),
          _latest = _.reduce(_all, (latest, item) => item[options.schema.columns.from.value] && item[options.schema.columns.from.value].isAfter(latest) ?
                             item[options.schema.columns.from.value] : latest, _earliest);
          
      var _count = (holder, name, count) => name ? holder[name] ? holder[name] += count || 1 : holder[name] = count || 1 : null;
                    
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
            if (item[options.schema.columns.badges.value]) _.each(_.reject(item[options.schema.columns.badges.value], badge => !badge), badge => {
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
        
      }, {
        bounds : {
          earliest : _earliest,
          latest : _latest,
          range : factory.Dates.duration(_latest.diff(_earliest))
        },
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
      });
      
      _summary.data = _all;
      _summary.percentages = _.mapObject(_summary.statuses, value => value ? Math.preciseRound(value / _summary.data.length, 2) * 100 : value);
      _summary.stats.average = _summary.stats.count ? Math.preciseRound(_summary.stats.total / _summary.stats.count, 2) : 0;
      _summary.stats.sd =  Math.preciseRound(_summary.stats.all.stdDev(), 1);
      
      return _summary;
      
    },
    
  };
  /* <!-- External Visibility --> */

};