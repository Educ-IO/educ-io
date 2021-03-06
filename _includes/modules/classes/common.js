Common = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    stale: 15
  }, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {
    titles: {},
  }; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.truncate = (length, ending) => value => value && _.isString(value) ? 
    value.length > length ? `${value.substring(0, length - 1)}${ending}` : value : "";
  
  FN.add = (usage, data) => {
    var _existing = _.findIndex(usage, value => value.type == data.type);
    _existing >= 0 ? usage[_existing] = data : usage.push(data);
  };
  
  FN.badge = (usage, id, key, title, value, badge, details) => FN.add(usage, {
      id: id,
      key: key,
      type: key.toLowerCase(),
      title: title,
      details: details || undefined,
      value: value,
      badge: badge
    });
  
  FN.column = name => options.state.session.table.index(name);
  
  FN.colour = duration => {
    var _days = duration.valueOf() / 1000 / 60 / 60 / 24;
    return _days >= 21 ? "danger" :
      _days >= 7 ? "warning" : "success";
  };
  
  FN.parse = list => _.chain(list)
        .each(value => value.date = factory.Dates.parse(value.updateTime || value.creationTime))
        .map(value => ({
          name: value.name || value.text || value.title,
          creator: value.creator ? value.creator.text : "",
          user: value.user ? value.user.text : "",
          timestamp: value.date,
          date: value.date.fromNow(),
          badge: FN.colour(0 - value.date.diff()),
          grade: value.assignedGrade || value.draftGrade || "",
          max: value.max,
          answer: value.multipleChoiceSubmission ? value.multipleChoiceSubmission.answer : 
                    value.shortAnswerSubmission ? value.shortAnswerSubmission.answer : "", 
        }))
        .value();
  
  FN.stale = (classroom, type) => factory.Display.state().in(options.functions.states.file.loaded) ? false :
    !classroom.fetched || !classroom.fetched[type] || (0 - factory.Dates.parse(classroom.fetched[type]).diff()) > (1000 * 60 * options.stale);
  
  FN.type = (types, type, force) => (!force && types === null) || (!force && types === undefined) || types == type || _.indexOf(types, type) >= 0;
  
  FN.cell = (cell, value) => cell.empty().append(factory.Display.template.get("cell", true)(value))
                                .toggleClass("py-1 px-2", !!(value && value.__condensed));
  
  FN.refresh = (names, targets, value) => _.each(names, name => FN.cell(targets[name], value[name]));
  
  FN.title = (name, content) => {
    if (!ರ‿ರ[name]) ರ‿ರ[name] = {};
    return ರ‿ರ[name][content] ? 
      ರ‿ರ[name][content] : ರ‿ರ[name][content] = factory.Display.doc.get(name, content, true);
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};