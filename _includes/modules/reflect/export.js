Export = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.analysis = type => Promise.resolve(options.state.session.analysis.table().values(true))
    .then(values => options.state.session.analysis.table().expand(values))
    .then(values => _.tap(values, values => factory.Flags.log(`EXPORTING to ${type}`, values)))
    .then(values => type == "sheets" ?
      factory.Google.sheets.create(options.state.session.analysis.title(), "Analysis").then(sheet => {
        const length = values.length,
          width = options.state.session.analysis.table().width(values);
        var notation = factory.Google_Sheets_Notation(),
          grid = factory.Google_Sheets_Grid({
            sheet: sheet.sheets[0].properties.sheetId
          }),
          format = factory.Google_Sheets_Format({
            sheet: sheet.sheets[0].properties.sheetId
          }, factory),
          properties = factory.Google_Sheets_Properties({
            sheet: sheet.sheets[0].properties.sheetId
          });

        return factory.Google.sheets.update(sheet.spreadsheetId,
            notation.grid(0, length, 0, width, true), values)
          .then(sheet => factory.Google.sheets.batch(
            sheet.spreadsheetId, [
              format.cells(grid.rows(0, 1).range(), [
                format.background("BLACK"),
                format.align.horizontal("CENTER"),
                format.text("white", 12, true)
              ]),
              format.cells(grid.columns(0, width).range(), [
                format.wrap("WRAP"),
                format.align.vertical("MIDDLE")
              ]),
              properties.update([
                properties.grid.frozen.rows(1),
              ]),
              {
                "updateDimensionProperties": grid.columns(0, width)
                  .dimension(140)
              }
            ]))
          .catch(e => factory.Flags.error("Exporting", e).negative())
          .then(options.state.application.notify.actions.save("NOTIFY_SAVE_ANALYSIS_SUCCESS"));
      }) :
      (type == "md" ?
        options.state.session.analysis.table().markdown(values) :
        type == "csv" ?
        options.state.session.analysis.table().csv(values) :
        options.state.session.analysis.table().excel(values, "Analysis"))
      .then(data => factory.Saver({}, factory).save(data, `${options.state.session.analysis.title()}.${type}`,
        type == "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
        type == "md" ? "text/markdown" :
        type == "csv" ? "text/csv" : "application/octet-stream")))
    .catch(e => factory.Flags.error("Exporting", e).negative())
    .then(factory.Main.busy("Exporting"));

  FN.report = () => {
    var _exporting = options.functions.action.dehydrate();
    try {
      saveAs(new Blob([JSON.stringify(_exporting.data, options.functions.replacers.regex, 2)], {
        type: options.functions.files.type.report
      }), _exporting.name);
    } catch (e) {
      factory.Flags.error("Report Export", e);
    }
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};