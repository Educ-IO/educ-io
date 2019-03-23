Analysis = (ಠ_ಠ, forms, reports) => {
  "use strict";
  /* <!-- MODULE: Provides an analysis of a form/s reports --> */
  /* <!-- PARAMETERS: Receives the global app context, the forms being analysed and the report data submitted --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags, Display, Datatable, Google --> */

  /* <!-- Internal Constants --> */
  const DB = new loki("reflect-analysis.db"),
    META = "__meta",
    ID = "analysis",
    MISSING = "NO DATA",
    EMPTY = "",
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal State Variable --> */
  var ರ‿ರ = {
    filter: () => true,
    stage: () => true,
    view: false,
  };
  /* <!-- Internal State Variable --> */

  /* <!-- Internal Functions --> */

  /* <-- Helper Functions --> */
  FN.helper = {

    complete: file => file.appProperties.COMPLETE,

    owner: file => file.ownedByMe ? "Me" : file.owners && file.owners.length > 0 ?
      `${file.owners[0].displayName}${file.owners[0].emailAddress ? ` (${file.owners[0].emailAddress})` : EMPTY}` : EMPTY,

    url: file => `${ಠ_ಠ.Flags.full()}${ಠ_ಠ.Flags.dir()}/#google,load.${file.id}`,

  };
  /* <-- Helper Functions --> */


  /* <-- Generate Functions --> */
  FN.query = {

    standard: report => ({
      "id": ಠ_ಠ.Display.template.get("hyperlink")({
        url: FN.helper.url(report.file),
        text: report.file.id,
        blank: true
      }).trim(),
      "owner": FN.helper.owner(report.file),
      "complete": FN.helper.complete(report.file),
      "form": report.title,
      "when": {
        Created: moment(report.file.createdTime).format("llll"),
        Modified: moment(report.file.modifiedTime).format("llll")
      }
    })

  };
  /* <-- Generate Functions --> */


  /* <-- Generate Functions --> */
  FN.generate = {

    id: () => _.map(forms, "id").join("_"),

    names: () => _.map(forms, form => form.template.title),

    values: (fields, report) => _.reduce(fields, (memo, field) => {
      var _val = report.appProperties[`FIELD.${field.id}`];
      memo[(field.title || field.id).toLowerCase()] = _val ? JSON.parse(_val) : EMPTY;
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
            title: field.title,
            type: field[META].analyse ? field[META].analyse.type : null,
            template: field.template,
            badges: field.template == "field_radio" && field.options ?
              _.map(field.options, option => ({
                value: option.value,
                badge: option.class && option.class.indexOf("-") >= 0 ?
                  option.class.split("-")[1] : EMPTY
              })) : null
          }), memo), memo);
    }, []),

    headers: fields => _.map(fields, v => ({
      name: v,
      hide: function(initial) {
        return !!(initial && this.hide_initially);
      },
      set_hide: function(now, always, initially) {
        this.hide_initially = initially;
      },
      hide_always: false,
      hide_now: false,
      hide_initially: v === "ID" || v === "Owner" || v === "Completed" || v === "When" ?
        true : false,
      field: v.toLowerCase(),
      icons: v === "When" ? ["access_time"] : null
    })),

    data: (id, columns, fields, reports, query) => {

      var _data = DB.addCollection(id, {
        unique: ["id"],
        indices: _.map((columns ? columns : []).concat(_.map(fields, field => field.title || field.id)),
          index => index.toLowerCase())
      });

      _data.clear({
        removeIndices: true
      });

      var _values = _.map(reports, report => _.extend(query ? query(report) : {},
        FN.generate.values(fields, report.file)));

      _data.insert(_values);

      return _data;
    }

  };
  /* <-- Generate Functions --> */


  /* <-- Display Functions --> */
  FN.display = {

    update: (filter, stage, view) => {
      if (view !== null && view !== undefined) ರ‿ರ.view = view;
      if (ರ‿ರ.table && ರ‿ರ.table.close) ರ‿ರ.table.close();
      return Promise.resolve(ರ‿ರ.table = FN.display.analysis(_.chain(reports)
        .filter(filter)
        .filter(stage)
        .value()));
    },

    analysis: (reports, process) => (ರ‿ರ.view ?
      FN.display[ರ‿ರ.view] : FN.display.summary)(FN.generate.id(), ಠ_ಠ.container.empty(), {
      classes: ["pt-1"],
      id: ID,
      header: ಠ_ಠ.Display.template.get("analyse_header")({
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: "Analysis",
        subtitle: FN.generate.names()
      }).trim()
    }, reports, target => process ? process(target) : target),

    summary: (id, target, wrapper, reports, after) => {

      var _fields = FN.generate.fields(),
        _row = _.find(_fields, {
          "type": "row"
        }),
        _column = _.find(_fields, {
          "type": "column"
        }),
        _values = _.reject(_fields, "type");

      if (_row && _column && _values) {

        var _all = [_row, _column].concat(_values),
          _reports = _.reduce(_.map(reports,
            report => _.extend(FN.generate.values(_all, report.file), {
              __created: moment(report.file.createdTime).format("MMM D, YYYY HH:mm"),
              __modified: moment(report.file.modifiedTime).format("MMM D, YYYY HH:mm"),
              __owner: FN.helper.owner(report.file),
              __link: FN.helper.url(report.file),
              __complete: FN.helper.complete(report.file),
            })), (memo, data) => {
            var _key = data[(_row.title || _row.id).toLowerCase()];
            if (!_key) _key = MISSING;
            if (!memo[_key]) memo[_key] = {
              name: _key,
              details: []
            };
            _.each(_values, value => {
              var _data = [
                  data[(_column.title || _column.id).toLowerCase()],
                  data[(value.title || value.id).toLowerCase()]
                ],
                _badge = value.badges && _data[1] !== MISSING ?
                _.find(value.badges, badge => badge.value == _data[1]) : null;
              if (_badge) _badge = _badge.badge;
              memo[_key].details.push({
                key: _data[0] ? _data[0] : MISSING,
                value: _data[1] ? _data[1] : MISSING,
                title: `<b>Owner</b> ${data.__owner}<br/><b>Created</b> ${data.__created}<br/><b>Modified</b> ${data.__modified}<br/>${data.__complete ? "<b>COMPLETE</b><br/>" : ""}<em><a href='${data.__link}' target='_blank' class='text-info'>Open Report</a></em>`,
                badge: _badge || "action-dark"
              });
            });
            return memo;
          }, {}),
          _columns = ["Name", "Details"],
          _headers = FN.generate.headers(_columns);

        _.each(_reports, value => value.details =
          _.sortBy(value.details, value => value.key + "_" + value.value));

        var _data = DB.addCollection(id, {
          unique: [_columns[0].toLowerCase()],
          indices: [_columns[1].toLowerCase()]
        });

        _data.clear({
          removeIndices: true
        });

        _data.insert(_.map(_reports, report => report));

        return ಠ_ಠ.Datatable(ಠ_ಠ, {
          id: `${ID}_SUMMARY_TABLE`,
          name: id,
          data: _data,
          headers: _headers,
        }, {
          classes: ["table-hover"],
          wrapper: wrapper,
        }, target, after);

      }

    },

    detail: (id, target, wrapper, reports, after) => {

      var _columns = ["ID", "Owner", "Completed", "Form", "When"],
        _fields = FN.generate.fields(),
        _headers = FN.generate.headers(_columns.concat(_.map(_fields, field => field.title || field.id))),
        _data = FN.generate.data(id, _columns, _fields, reports, FN.query.standard);

      return ಠ_ಠ.Datatable(ಠ_ಠ, {
        id: `${ID}_DETAIL_TABLE`,
        name: id,
        data: _data,
        headers: _headers,
      }, {
        classes: ["table-hover"],
        collapsed: true,
        wrapper: wrapper,
      }, target, after);

    },

  };
  /* <-- Display Functions --> */


  /* <-- Filter Functions --> */
  FN.filter = {

    all: () => FN.display.update(ರ‿ರ.filter = () => true, ರ‿ರ.stage),

    mine: () => FN.display.update(ರ‿ರ.filter = report => report.file.ownedByMe === true),

    shared: () => FN.display.update(ರ‿ರ.filter = report => report.file.ownedByMe === false),

  };
  /* <-- Filter Functions --> */


  /* <-- Stage Functions --> */
  FN.stage = {

    any: () => FN.display.update(ರ‿ರ.filter, ರ‿ರ.stage = () => true),

    complete: () => FN.display.update(ರ‿ರ.filter, ರ‿ರ.stage = report =>
      FN.helper.complete(report.file)),

  };
  /* <-- Stage Functions --> */


  /* <-- Initial Run --> */
  ರ‿ರ.table = FN.display.analysis(reports);
  /* <-- Initial Run --> */


  /* <!-- External Visibility --> */
  return {

    table: () => ರ‿ರ.table,

    all: FN.filter.all,

    mine: FN.filter.mine,

    shared: FN.filter.shared,

    any: FN.stage.any,

    complete: FN.stage.complete,

    summary: () => FN.display.update(ರ‿ರ.filter, ರ‿ರ.stage, false),

    detail: () => FN.display.update(ರ‿ರ.filter, ರ‿ರ.stage, "detail"),
    
    title: () => `Analysis - ${FN.generate.names().join(" | ")}`,

  };
  /* <!-- External Visibility --> */
};