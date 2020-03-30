Exporter = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides colour helper methods --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.export = (table, type, name, title, success) => Promise.resolve(table.values(true))
    .then(values => table.expand(values))
    .then(values => _.tap(values, values => factory.Flags.log(`EXPORTING to ${type}`, values)))
    .then(values => type == "sheets" ?
      factory.Google.sheets.create(name, title).then(sheet => {
        const length = values.length,
          width = table.width(values);
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
          .then(options.state.application.notify.actions.save(success));
      }) :
      (type == "md" ? table.markdown(values) :
        type == "csv" ? table.csv(values) : table.excel(values, title))
      .then(data => factory.Saver({}, factory).save(data, `${name}.${type}`,
        type == "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :
        type == "md" ? "text/markdown" :
        type == "csv" ? "text/csv" : "application/octet-stream")))
    .catch(e => factory.Flags.error("Exporting", e).negative())
    .then(factory.Main.busy("Exporting"));
  /* <!-- Public Functions --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
};