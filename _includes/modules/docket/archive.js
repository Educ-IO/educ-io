Archive = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle archiving of items --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const TEMPLATE = "archive",
        ID = "archive";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */
  
  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _archive = years => Promise.all(
      _.map(years, year => options.state.session.database.archive(year, options.state.application.schema.sheets.sheet_archive))
    ).then(items => {
      var _items = _.sortBy(_.compact(_.flatten(items, true)), "__ROW").reverse();
      if (!_items || _items.length === 0) return false;
      var _batches = _.reduce(_items, (groups, item, index, all) => {
          (index === 0 || all[index - 1].__ROW == (item.__ROW + 1)) ?
          groups[groups.length - 1].push(item):
            groups.push([item]);
          return groups;
        }, [
          []
        ]),
        _results = [];

      var _complete = () => _.reduce(_batches, (promise, items) => {
        return promise
          .then(() => options.state.session.database.items.delete(items).then(result => _results.push(result)));
      }, Promise.resolve());

      return _complete().then(() => _results);

    });
  
  var _prompt = () => factory.Display.modal(TEMPLATE, {
          target: factory.container,
          id: ID,
          title: "Archive Docket Items",
          instructions: factory.Display.doc.get("ARCHIVE_INSTRUCTIONS"),
          years: options.state.session.database.years(),
        })
        .then(values => _.isEmpty(values) ? false : 
            _archive(_.reduce(values.Archive.Values, (list, value, year) => (value === true) ? list.concat([year]) : list, []))
              .then(factory.Main.busy("Archiving Data"))
              .then(() => options.functions.action.refresh()))
        .catch(options.functions.errors.generic("Archive"));
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    run : years => years ? _archive(years) : _prompt(),
    
  };
  /* <!-- External Visibility --> */

};