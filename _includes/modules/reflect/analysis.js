Analysis = (ಠ_ಠ, forms, reports) => {
  "use strict";
  /* <!-- MODULE: Provides an analysis of a form/s reports --> */
  /* <!-- PARAMETERS: Receives the global app context, the forms being analysed and the report data submitted --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags, Display, Datatable, Google --> */

  /* <!-- Internal Constants --> */
  const DB = new loki("reflect-analysis.db"),
    META = "__meta",
    ID = "analysis",
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var _table;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */

  /* <-- Helper Functions --> */
  FN.helper = {};
  /* <-- Helper Functions --> */

  /* <-- Generate Functions --> */
  FN.generate = {

    id: () => _.map(forms, "id").join("_"),

    names: () => _.map(forms, form => form.template.title),

    values: (fields, report) => _.reduce(fields, (memo, field) => {
      memo[field.title] = JSON.parse(report.appProperties[`FIELD.${field.id}`]);
      return memo;
    }, {}),

    fields: type => _.reduce(forms, (memo, form) => {
      return _.reduce(form.template.groups, (memo, group) =>
        _.reduce(_.filter(group.fields, field => field[META] && field[META].index &&
            (!type || (type && field[META].analyse.type == type))),
          (memo, field) => _.find(memo, {
            title: field.title
          }) ? memo :
          memo.concat({
            id: field.field,
            title: field.title
          }), memo), memo);
    }, []),

    headers: fields => _.map(["ID", "Owner", "Form", "When"]
      .concat(_.map(fields, "title")), v => ({
        name: v,
        hide: function(initial) {
          return !!(initial && this.hide_initially);
        },
        set_hide: function(now, always, initially) {
          this.hide_initially = initially;
        },
        hide_always: false,
        hide_now: false,
        hide_initially: v === "ID" || v === "Owner" || v === "When" ? true : false,
        field: v.toLowerCase(),
        icons: v === "When" ? ["access_time"] : null
      })),

    data: (id, fields) => {
      var _data = DB.addCollection(id, {
        unique: ["id"],
        indices: ["owner", "form", "who", "when"]
      });

      _data.clear({
        removeIndices: false
      });

      _data.insert(_.map(reports, report => _.extend({
        "ID": ಠ_ಠ.Display.template.get("hyperlink")({
          url: `${ಠ_ಠ.Flags.full()}${ಠ_ಠ.Flags.dir()}/#google,load.${report.file.id}`,
          text: report.file.id,
          blank: true
        }),
        "Owner": report.file.ownedByMe ? "Me" : report.file.owner && report.file.owner.length > 0 ?
          `${report.file.owner[0].displayName}${report.file.owner[0].emailAddress ? ` (${report.file.owner[0].emailAddress})` : ""}` : "",
        "Form": report.title,
        "When": {
          Created: moment(report.file.createdTime).format("llll"),
          Modified: moment(report.file.modifiedTime).format("llll")
        }
      }, FN.generate.values(fields, report.file))));

      return _data;
    }

  };
  /* <-- Generate Functions --> */


  /* <-- Display Functions --> */
  FN.display = {

    analysis: (target, process) => {

      var _id = FN.generate.id(),
        _fields = FN.generate.fields();

      ಠ_ಠ.Datatable(ಠ_ಠ, {
        id: `${ID}_TABLE`,
        name: _id,
        data: FN.generate.data(_id, _fields),
        headers: FN.generate.headers(_fields),
      }, {
        classes: ["table-hover"],
        filters: {},
        inverted_Filters: {},
        sorts: {},
        advanced: false,
        collapsed: true,
        wrapper: {
          classes: ["pt-1"],
          id: ID,
          header: ಠ_ಠ.Display.template.get("analyse_header")({
            classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
            title: "Analysis",
            subtitle: FN.generate.names()
          }),

        },
      }, target, target => process ? process(target) : target);

    },

  };
  /* <-- Display Functions --> */

  _table = FN.display.analysis(ಠ_ಠ.container.empty());

  /* <!-- External Visibility --> */
  return {

    table: () => _table,

  };
  /* <!-- External Visibility --> */
};