Analysis = (ಠ_ಠ, forms, reports, expected, signatures, decode) => {
  "use strict";
  /* <!-- MODULE: Provides an analysis of a form/s reports --> */
  /* <!-- PARAMETERS: Receives the global app context, the forms being analysed and the report data submitted --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Flags, Display, Datatable, Google --> */

  /* <!-- Internal Constants --> */
  const DB = new loki("reflect-analysis.db"),
    ID = "analysis",
    MISSING = "NO DATA",
    EMPTY = "",
    HIDDEN = ["ID", "Owner", "Complete", "When", "Total", "Count", "Average", "Signatures"],
    NUMERIC = /\d*\.?\d+/,
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal State Variable --> */
  var ರ‿ರ = {
    filter: () => true,
    stage: () => true,
    view: false,
    expected: expected || [],
    signatures: false,
    extras: [],
  };
  /* <!-- Internal State Variable --> */

  /* <!-- Internal Functions --> */

  /* <!-- Helper Functions --> */
  FN.helper = {

    complete: file => file.appProperties.COMPLETE,

    owner: file => file.ownedByMe ? "Me" : file.owners && file.owners.length > 0 ?
      `${file.owners[0].displayName}${file.owners[0].emailAddress ? ` (${file.owners[0].emailAddress})` : EMPTY}` : EMPTY,

    url: file => `${ಠ_ಠ.Flags.full()}${ಠ_ಠ.Flags.dir()}/#google,load.${file.id}`,

    headers: fields => _.map(fields, f => f.title ? {
      name: f.title,
      display: f.id
    } : f.id),

  };
  /* <!-- Helper Functions --> */


  /* <!-- Query Functions --> */
  FN.query = {

    slim: report => ({
      id: ಠ_ಠ.Display.template.get("hyperlink")({
        url: FN.helper.url(report.file),
        text: report.file.id,
        blank: true
      }).trim(),
      owner: FN.helper.owner(report.file),
      complete: FN.helper.complete(report.file),
      form: report.title,
      when: {
        Created: ಠ_ಠ.Dates.parse(report.file.createdTime).format("llll"),
        Modified: ಠ_ಠ.Dates.parse(report.file.modifiedTime).format("llll")
      }
    }),
    
    standard: report => _.tap(FN.query.slim(report), 
      value => value.signatures = report.signatures ? _.map(report.signatures, signature => ({
        __class: `o-75 ${signature.valid ? "text-success" : "text-danger"}`,
        Valid: signature.valid ? true : undefined,
        Invalid: signature.valid ? undefined : true,
        By: `${signature.who === true ? "Me" : signature.who}${signature.email ? ` | ${signature.email}`: ""}`,
        When: signature.when
      })) : null),

  };
  /* <!-- Query Functions --> */


  /* <!-- Generate Functions --> */
  FN.generate = {

    id: () => _.map(forms, "id").join("_"),

    names: () => _.map(forms, form => form.template.title),
   
    headers: fields => _.map(fields, v => ({
      name: v.name || v,
      display: v.display || null,
      hide: function(initial) {
        return !!(initial && this.hide_initially);
      },
      set_hide: function(now, always, initially) {
        this.hide_initially = initially;
      },
      hide_always: false,
      hide_now: false,
      hide_initially: HIDDEN.indexOf(v.name || v) >= 0 ? true : false,
      field: (v.name || v).toLowerCase(),
      icons: (v.name || v) === "When" ? ["access_time"] : null
    })),

    data: (id, columns, fields, reports, query) => {

      var _data = DB.addCollection(id, {
        unique: ["id"],
        indices: _.map((columns ? columns : [])
          .concat(_.map(fields, field => field.title || field.id)),
          index => index.toLowerCase())
      });

      _data.clear({
        removeIndices: true
      });

      var _values = _.map(reports, report => _.extend(query ? query(report) : {},
        decode.meta.properties(report.file, fields, true)));

      _data.insert(_values);

      return _data;
    }

  };
  /* <!-- Generate Functions --> */


  /* <!-- Display Functions --> */
  FN.display = {
    
    wrapper: element => ಠ_ಠ.Display.template.show({
        template: "analyse_body",
        classes: ["pt-2"],
        target: element || ಠ_ಠ.container,
        clear: true
      }),
    
    update: (filter, stage, view) => {
      if (view !== null && view !== undefined) ರ‿ರ.view = view;
      if (ರ‿ರ.table && ರ‿ರ.table.close) ರ‿ರ.table.close();
      return Promise.resolve(ರ‿ರ.table = FN.display.analysis(_.chain(reports)
        .filter(filter)
        .filter(stage)
        .value()));
    },

    analysis: (reports, process) => (ರ‿ರ.view ?
      FN.display[ರ‿ರ.view] : FN.display.summary)(FN.generate.id(), {
      classes: ["pt-1", "scroller"],
      id: ID,
      header: ಠ_ಠ.Display.template.get("analyse_header")({
        classes: ["pl-3", "pl-xl-4", "pt-2", "pb-0"],
        title: "Analysis",
        subtitle: FN.generate.names()
      }).trim()
    }, reports, target => process ? process(target) : target),

    summary: (id, wrapper, reports, after) => {

      var _fields = decode.meta.fields(forms),
        _row = _.find(_fields, {
          "type": "row"
        }),
        _contexts = _.filter(_fields, {
          "type": "context"
        }),
        _column = _.find(_fields, {
          "type": "column"
        }),
        _values = _.reject(_fields, "type");

      ರ‿ರ.extras = FN.helper.headers(_contexts);

      if (_row && _column && _values) {

        var _all = [_row, _column].concat(_contexts).concat(_values),
          _reports = _.reduce(_.map(reports,
              report => _.extend(decode.meta.properties(report.file, _all, true), {
                __id: report.file.id,
                __created: ಠ_ಠ.Dates.parse(report.file.createdTime).format("MMM D, YYYY HH:mm"),
                __modified: ಠ_ಠ.Dates.parse(report.file.modifiedTime).format("MMM D, YYYY HH:mm"),
                __owner: FN.helper.owner(report.file),
                __link: FN.helper.url(report.file),
                __complete: FN.helper.complete(report.file),
              })),
            (memo, data) => {
              var _key = data[(_row.title || _row.id).toLowerCase()],
                _name = _key;
              if (!_key) {
                _key = MISSING;
              } else if (_key.search(ಠ_ಠ.App.email) >= 0) {
                _key = _key.match(ಠ_ಠ.App.email)[0];
              }
              if (!memo[_key = _key.toLowerCase()]) {

                /* <!-- Add Basic --> */
                memo[_key] = {
                  name: _name,
                  total: null,
                  count: 0,
                  __count: 0,
                  average: null
                };

                /* <!-- Add Context --> */
                _.each(ರ‿ರ.extras, extra => memo[_key][extra.name.toLowerCase()] = []);

                /* <!-- Add Details --> */
                memo[_key].details = [];

              } else if (_.isString(memo[_key].name) && memo[_key].name != _name) {
                memo[_key].name = [memo[_key].name, _name];
              } else if (_.isArray(memo[_key].name) && memo[_key].name.indexOf(_name) < 0) {
                memo[_key].name = memo[_key].name.concat(_name);
              }

              /* <!-- Add Context Values Functions --> */
              _.each(_contexts, (context, index) => {
                var _data = data[(context.title || context.id).toLowerCase()],
                  _extra = ರ‿ರ.extras[index].name.toLowerCase();
                if (_data && memo[_key][_extra].indexOf(_data) < 0) memo[_key][_extra].push(_data);
              });

              /* <!-- Add Column / Values --> */
              _.each(_values, value => {

                /* <!-- Parse Data --> */
                var _data = [
                    data[(_column.title || _column.id).toLowerCase()],
                    data[(value.title || value.id).toLowerCase()]
                  ],
                  _badge = _data[1] === EMPTY ? "attention" : value.badges ?
                  _.property("badge")(_.find(value.badges, badge => badge.value == _data[1])) : null,
                  _numeric = _data[1] === EMPTY ? null : value.numerics ?
                  _.property("numeric")(_.find(value.numerics,
                    numeric => numeric.value == _data[1])) :
                  NUMERIC.test(_data[1]) ? parseFloat(_data[1].match(NUMERIC)[0]) : null;

                /* <!-- Log Numerics --> */
                if (_numeric !== null && _numeric !== undefined) {
                  memo[_key].total += _numeric;
                  memo[_key].__count += 1;
                }
                memo[_key].count += 1;

                /* <!-- Push Data to Details --> */
                memo[_key].details.push({
                  id: data.__id,
                  key: _data[0] ? _data[0] : MISSING,
                  value: _data[1] ? _data[1] : MISSING,
                  title: ಠ_ಠ.Display.template.get("report_link")(data),
                  badge: _badge || "action-dark",
                });

              });
              return memo;
            }, {}),
          _columns = ["Name", "Total", "Count", "Average"].concat(ರ‿ರ.extras).concat(["Details"]),
          _headers = FN.generate.headers(_columns);

        /* <!-- Clean Up Analysis Objects --> */
        _.each(_reports, value => {
          value.details = _.sortBy(value.details, value => value.key + "_" + value.value);
          if (_.isArray(value.name)) value.name = {
            name: value.name.sort()
          };
          if (value.total) value.average = (value.total / value.__count);
          delete value.__count;
        });

        /* <!-- Add in Expectations --> */
        if (ರ‿ರ.expected.length > 0) {

          /* <!-- Filter for missing values only (case insensitive) --> */
          var _key = (val, index) => _.isArray(val) ? index ? index < val.length ? val[index] : null : val[0] : val,
              _missing = _.filter(
                ರ‿ರ.expected.slice(),
                value => {
                  var _regexp = new RegExp(`^${RegExp.escape(_key(value))}$`, "i");
                  return _.every(_reports, (value, key) => key.search(_regexp) == -1);
                });

          ಠ_ಠ.Flags.log("Missing from Analysis:", _missing);

          /* <!-- Add details for missing values --> */
          _.each(_missing, missing => {
            
            var _address = _key(missing);
            _reports[_address] = {
              name: _address && _address.search(ಠ_ಠ.App.email) >= 0 ?
                ಠ_ಠ.Display.template.get({
                  template: "email",
                  address: _address.match(ಠ_ಠ.App.email)[0],
                  subject: "Missing Reflect Report Data",
                  text: _address
                }) : _address,
              total: null,
              count: null,
              average: null,
            };

            /* <!-- Add Contexts --> */
            _.each(ರ‿ರ.extras, (extra, index) => _reports[_address][extra.name.toLowerCase()] = _key(missing, index + 1));

            /* <!-- Add Details --> */
            _reports[_address].details = null;

          });

        }

        var _data = DB.addCollection(id, {
          unique: [_columns[0].toLowerCase()],
          indices: [_columns[1].toLowerCase()]
        });

        _data.clear({
          removeIndices: true
        });

        /* <!-- Map Reports from an object (key/value) to array --> */
        var _rows = _.map(_.keys(_reports).sort(), key => _reports[key]);

        /* <!-- Insert Rows into table --> */
        _data.insert(_rows);

        var _return = ಠ_ಠ.Datatable(ಠ_ಠ, {
          id: `${ID}_SUMMARY_TABLE`,
          name: id,
          data: _data,
          headers: _headers,
        }, {
          classes: ["table-hover"],
          collapsed: true,
          wrapper: wrapper,
        }, FN.display.wrapper(), after);

        if (ರ‿ರ.signatures) {
          _.each(reports, report => {
            var _target = $(`#${report.file.id}`);
            _target.find(".signature").remove();
            FN.append.signatures(_target, report.signatures);
          });
          FN.append.tooltips();
        }

        return _return;

      }

    },

    detail: (id, wrapper, reports, after) => {

      var _columns = ["ID", "Owner", "Complete", "Form", "When"]
        .concat(ರ‿ರ.signatures ? ["Signatures"] : []),
        _fields = decode.meta.fields(forms),
        _headers = FN.generate.headers(_columns.concat(FN.helper.headers(_fields))),
        _data = FN.generate.data(id, _columns, _fields, reports, 
                                  ರ‿ರ.signatures ? FN.query.standard : FN.query.slim);

      return ಠ_ಠ.Datatable(ಠ_ಠ, {
        id: `${ID}_DETAIL_TABLE`,
        name: id,
        data: _data,
        headers: _headers,
      }, {
        classes: ["table-hover"],
        collapsed: true,
        wrapper: wrapper,
      }, FN.display.wrapper(), after);

    },

  };
  /* <!-- Display Functions --> */


  /* <!-- Filter Functions --> */
  FN.filter = {

    all: () => FN.display.update(ರ‿ರ.filter = () => true, ರ‿ರ.stage),

    mine: () => FN.display.update(ರ‿ರ.filter = report => report.file.ownedByMe === true),

    shared: () => FN.display.update(ರ‿ರ.filter = report => report.file.ownedByMe === false),

  };
  /* <!-- Filter Functions --> */


  /* <!-- Stage Functions --> */
  FN.stage = {

    any: () => FN.display.update(ರ‿ರ.filter, ರ‿ರ.stage = () => true),

    complete: () => FN.display.update(ರ‿ರ.filter, ರ‿ರ.stage = report =>
      FN.helper.complete(report.file)),

  };
  /* <!-- Stage Functions --> */


  /* <!-- Append Functions --> */
  FN.append = {

    signatures: (target, signatures) => _.each(signatures,
      (signature, index) => target.append(ಠ_ಠ.Display.template.get({
        template: "valid",
        class: `${index === 0 ? "" : "ml-1 "}signature border border-dark rounded p-1${signature.valid ? " bg-success" : " bg-light text-danger"}`,
        valid: signature.valid,
        html: true,
        desc: ಠ_ಠ.Display.template.get("signature_summary")(signature).trim(),
      }))),

    tooltips: () => ಠ_ಠ.Display.tooltips($(`#${ID}`).find("[data-toggle='tooltip']"), {
      container: "body"
    })

  };
  /* <!-- Append Functions --> */



  /* <!-- Initial Run --> */
  ರ‿ರ.table = FN.display.analysis(reports);
  /* <!-- Initial Run --> */


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

    names: () => FN.generate.names().join(" | "),

    title: () => `Analysis - ${FN.generate.names().join(" | ")}`,

    expected: value => {
      if (value) {
        /* <!-- Parse incoming list, on new lines --> */
        ರ‿ರ.expected = _.chain(value.split("\n"))
          .flatten()
          .map(val => val.trim("").split("\t"))
          .compact()
          .value();

        FN.display.update(ರ‿ರ.filter, ರ‿ರ.stage, false);
      }
      return ರ‿ರ.expected;
    },

    verify: () => Promise.all(_.map(reports, report => {
        var _target = $(`#${report.file.id}`);
        _target.find(".signature").remove();

        return ಠ_ಠ.Google.files.download(report.file.id)
          .then(loaded => ಠ_ಠ.Google.reader().promiseAsText(loaded))
          .then(content => JSON.parse(content))
          .then(data => signatures.list(report.file, data))
          .then(signatures => FN.append.signatures(_target, report.signatures = signatures))
          .catch(e => ಠ_ಠ.Flags.error("Signature Error", e).negative())
          .then(ಠ_ಠ.Display.busy({
            target: _target,
            class: "loader-tiny loader-light mx-1",
            append: true,
            fn: true
          }));
      }))
      .then(() => ರ‿ರ.signatures = true)
      .then(FN.append.tooltips),

  };
  /* <!-- External Visibility --> */
};