Query = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored tasks --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, Underscore | App Scope: schema --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  
  /* <-- General Queries --> */
  FN.general = {
    
    timeless: () => _.tap({}, q => (q[options.schema.columns.time.value] = {}).$exists = false),
  
    timed: () => _.tap({}, q => (q[options.schema.columns.time.value] = {}).$exists = true),
    
  };
  
  /* <-- Temporal Queries --> */
  FN.temporal = {
    
    from: (date, comparator) => _.tap({}, q => (q[options.schema.columns.from.value] = {})[comparator] = date),
    
    before: date => date ? FN.temporal.from(date.endOf ? date.endOf("day").toDate() : date, "$lte")  : {},
    
    after: date => date ? FN.temporal.from(date.startOf ? date.startOf("day").toDate() : date, "$gte")  : {},
    
    between: (from, until) => from ? until ? {"$and": [FN.temporal.after(from), FN.temporal.before(until)]} : FN.temporal.after(from) : until ? FN.temporal.before(until) : {},
    
    future: () => FN.temporal.from(factory.Dates.now().startOf("day").toDate(), "$gt"),
    
  };
  
  /* <-- Done Queries --> */
  FN.done = {
    
    from: (date, comparator) => _.tap({}, q => (q[options.schema.columns.done.value] = {})[comparator] = date),
    
    before: date => date ? FN.done.from(date.endOf ? date.endOf("day").toDate() : date, "$lte")  : {},
    
    after: date => date ? FN.done.from(date.startOf ? date.startOf("day").toDate() : date, "$gte")  : {},
    
  };
  
  /* <-- Status Queries --> */
  FN.status = {
    
    none: () => _.tap({}, q => (q[options.schema.columns.status.value] = {}).$exists = false),
    
    ready: () => _.tap({}, q => (q[options.schema.columns.status.value] = {}).$eq = options.schema.enums.status.ready),
    
    underway: () => _.tap({}, q => (q[options.schema.columns.status.value] = {}).$eq = options.schema.enums.status.underway),
    
    complete: () => _.tap({}, q => (q[options.schema.columns.status.value] = {}).$eq = options.schema.enums.status.complete),
  
    incomplete: () => _.tap({}, q => (q[options.schema.columns.status.value] = {}).$ne = options.schema.enums.status.complete),
    
    completed: (from, until) => ({
        "$or": [{"$and": [FN.general.timeless(), FN.done.before(until || from), FN.done.after(from), FN.status.complete()]},
                {"$and": [FN.general.timed(), FN.temporal.before(until || from), FN.temporal.after(from), FN.status.complete()]}]
      }),
    
  };
  
  /* <-- Content Queries --> */
  FN.content = {
    
    details : text => _.tap({}, q => (q[options.schema.columns.details.value] = {}).$regex = new RegExp(RegExp.escape(text), "i")),
    
    tag : text => _.tap({}, q => (q[options.schema.columns.tags.value] = {}).$regex = new RegExp(RegExp.escape(text), "i")),
    
    badge : text => _.tap({}, q => (q[options.schema.columns.badges.value] = {}).$regex = new RegExp(RegExp.escape(text), "i")),
    
    badges : text => _.isArray(text) ? {"$or": _.map(text, FN.content.badge)} : FN.content.badge(text),
    
    tagged : () => _.tap({}, q => (q[options.schema.columns.tags.value] = {}).$ne = ""),
    
    tagless : () => _.tap({}, q => (q[options.schema.columns.tags.value] = {}).$eq = ""),
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    /* <-- General Queries --> */
    timeless: FN.general.timeless,
    
    timed: FN.general.timed,
    /* <-- General Queries --> */
    
    /* <-- Temporal Queries --> */
    from: FN.temporal.from,
    
    before: FN.temporal.before,
    
    after: FN.temporal.after,
    
    between: FN.temporal.between,
    /* <-- Temporal Queries --> */

    /* <-- Status Queries --> */
    none: FN.status.none,
    
    complete: FN.status.complete,
    
    pending: FN.status.pending,
    
    underway: FN.status.underway,
    
    incomplete: FN.status.incomplete,
    /* <-- Status Queries --> */

    /* <-- Main Queries --> */
    status: (status, until, since) => ({
      "$and": [status, since ? FN.temporal.between(since, until) : FN.temporal.before(until)]
    }),
    
    current: (date, status) => ({"$and": [{"$or": [FN.general.timeless(), FN.temporal.after(date)]}, FN.temporal.before(date), status || FN.status.incomplete()]}),
    
    completed: FN.status.completed,

    dated: date => ({
        "$or": [{"$and": [{"$or": [FN.general.timed(), FN.temporal.future()]},
                          FN.temporal.before(date), FN.temporal.after(date), FN.status.incomplete()]}, FN.status.completed(date)]}),
    
    all_tagged: (tags, since, until) => since || until ? {"$and": [FN.temporal.between(since, until), FN.content.badges(tags)]} : FN.content.badges(tags),
    
    tagged: tag => ({"$and": [FN.content.badge(tag), FN.status.incomplete()]}),

    project: value => _.tap({}, query => query[options.schema.columns.has_projects.value] = {$eq: value === false ? false : true}),
    
    tagless: (since, until) => since || until ? {"$and": [FN.temporal.between(since, until), FN.content.tagless()]} : FN.content.tagless(),

    text: (value, from) => from ?
      {"$and": [
        {"$or": [FN.content.details(value), FN.content.tag(value)]},
        {"$or": [{"$and": [FN.status.incomplete(), FN.general.timeless()]},
                 {"$and": [FN.general.timed(), FN.temporal.after(from)]}]
      }]} : {"$or": [FN.content.details(value), FN.content.tag(value)]},

  };
  /* <!-- External Visibility --> */

};