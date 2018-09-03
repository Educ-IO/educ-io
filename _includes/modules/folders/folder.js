Folder = (ಠ_ಠ, folder, target, team, state, tally, complete) => {

  /* <!-- Internal Constants --> */
  const BATCH_SIZE = 50,
    CONCURRENT_SIZE = 2,
    TRACK_TIME = 200;
  const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));
  const SEARCH_TRIGGER = 20;

  const TYPE_CONVERT = "application/x.educ-io.folders-convert",
    TYPE_SEARCH = "application/x.educ-io.folders-search",
    TYPE_TAG = "application/x.educ-io.folders-tag",
    TYPE_CLONE = "application/x.educ-io.folders-clone";
  const DB = new loki("folders.db");
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var _tables = {},
    _search,
    _last,
    _tallyCache = tally ? tally : {},
    _team = team,
    _searches = {};
  /* <!-- Internal Variables --> */

  /* <!-- Internal Objects --> */
  var _exclude_Defaults = ["^(\\~\\$)", "^(\\*\\*\\*\\sARCHIVE\\s\\*\\*\\*\\s)", "\\$RECYCLE\\.BIN"],
    _dialog_Shortcuts = {
      search: {
        "Google Apps": {
          docs: {
            class: "btn-outline-primary",
            name: "Docs",
            include: [],
            exclude: [],
            mime: [ಠ_ಠ.Google.files.natives()[0]],
            properties: []
          },
          sheets: {
            class: "btn-outline-primary",
            name: "Sheets",
            include: [],
            exclude: [],
            mime: [ಠ_ಠ.Google.files.natives()[1]],
            properties: []
          },
          slides: {
            class: "btn-outline-primary",
            name: "Slides",
            include: [],
            exclude: [],
            mime: [ಠ_ಠ.Google.files.natives()[2]],
            properties: []
          },
          drawings: {
            class: "btn-outline-primary",
            name: "Drawings",
            include: [],
            exclude: [],
            mime: [ಠ_ಠ.Google.files.natives()[3]],
            properties: []
          },
          all: {
            class: "btn-outline-success",
            name: "All",
            include: [],
            exclude: [],
            mime: ಠ_ಠ.Google.files.all(),
            properties: []
          },
          audio: {
            class: "btn-outline-info",
            name: "Audio",
            include: [],
            exclude: [],
            mime: "audio/*",
            properties: []
          },
        },
        "Office Files": {
          word: {
            class: "btn-outline-secondary",
            name: "Word",
            include: ["(\\.docx)$", "(\\.doc)$"],
            exclude: _exclude_Defaults,
            mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/msword"],
            properties: []
          },
          excel: {
            class: "btn-outline-secondary",
            name: "Excel",
            include: ["(\\.xlsx)$", "(\\.xls)$"],
            exclude: _exclude_Defaults,
            mime: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/vnd.ms-excel"],
            properties: []
          },
          powerpoint: {
            class: "btn-outline-secondary",
            name: "Powerpoint",
            include: ["(\\.pptx)$", "(\\.ppt)$"],
            exclude: _exclude_Defaults,
            mime: ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip", "application/vnd.ms-powerpoint"],
            properties: []
          },
          office: {
            class: "btn-outline-dark",
            name: "All",
            include: ["(\\.docx)$", "(\\.doc)$", "(\\.xlsx)$", "(\\.xls)$", "(\\.pptx)$", "(\\.ppt)$"],
            exclude: _exclude_Defaults,
            mime: [
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "application/vnd.ms-excel", "application/msword", "application/vnd.ms-powerpoint",
              "application/zip"
            ],
            properties: []
          },
          pdf: {
            class: "btn-outline-info",
            name: "PDF",
            include: [],
            exclude: [],
            mime: ["application/pdf"],
            properties: []
          },
          temp: {
            class: "btn-outline-info",
            name: "Temps",
            exclude: [],
            include: ["^(\\s*\\~\\$).*(\\.docx)$", "^(\\s*\\~\\$).*(\\.doc)$",
              "^(\\s*\\~\\$).*(\\.pptx)$", "^(\\s*\\~\\$).*(\\.ppt)$", "^(\\s*\\~\\$).*(\\.xlsx)$", "^(\\s*\\~\\$).*(\\.xls)$", "thumbs\\.db"
            ],
            mime: [
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation",
              "application/vnd.ms-excel", "application/msword", "application/vnd.ms-powerpoint",
              "application/zip", "application/octet-stream"
            ],
            properties: []
          },
        },
        "Tag": {
          reviewed: {
            class: "btn-outline-success",
            name: "Reviewed",
            include: [],
            exclude: [],
            properties: ["@@[REVIEW]=[DONE]"]
          },
          review: {
            class: "btn-outline-danger",
            name: "Needs Review",
            include: [],
            exclude: [],
            properties: ["@@[REVIEW]=[NEEDED]"]
          },
          important: {
            class: "btn-warning",
            name: "Important",
            include: [],
            exclude: [],
            properties: ["Importance=High", "Importance=Medium"],
            properties_modifier: "or"
          },
          confidential: {
            class: "btn-warning",
            name: "Confidential",
            include: [],
            exclude: [],
            properties: ["Confidentiality=High", "Confidentiality=Medium"],
            properties_modifier: "or"
          },
          highlight: {
            class: "btn-bright",
            name: "Highlight",
            include: [],
            exclude: [],
            properties: ["Highlight=TRUE"]
          },
        },
      },
      convert: {
        "To Google": {
          docs: {
            class: "btn-outline-primary",
            name: "Word -> Docs",
            source: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            target: ಠ_ಠ.Google.files.natives()[0],
            prefix: "*** ARCHIVE *** "
          },
          sheets: {
            class: "btn-outline-primary",
            name: "Excel -> Sheets",
            source: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            target: ಠ_ಠ.Google.files.natives()[1],
            prefix: "*** ARCHIVE *** "
          },
          slides: {
            class: "btn-outline-primary",
            name: "Powerpoint -> Slides",
            source: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            target: ಠ_ಠ.Google.files.natives()[2],
            prefix: "*** ARCHIVE *** "
          },
        },
        "To Office": {
          word: {
            class: "btn-outline-secondary",
            name: "Zip -> Word",
            source: "application/zip",
            target: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          },
          excel: {
            class: "btn-outline-secondary",
            name: "Zip -> Excel",
            source: "application/zip",
            target: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          },
          powerpoint: {
            class: "btn-outline-secondary",
            name: "Zip -> Powerpoint",
            source: "application/zip",
            target: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
          },
        },
        "Others": {
          pdf: {
            class: "btn-outline-info",
            name: "Google Formats -> PDF",
            source: "",
            prefix: "",
            target: "application/pdf"
          },
        }
      },
      tag: {
        "Confidentiality": {
          high: {
            populate: "Confidentiality|High",
            class: "btn-outline-danger",
            name: "High"
          },
          medium: {
            populate: "Confidentiality|Medium",
            class: "btn-outline-warning",
            name: "Medium"
          },
          low: {
            populate: "Confidentiality|Low",
            class: "btn-outline-success",
            name: "Low"
          },
          none: {
            populate: "Confidentiality|None",
            class: "btn-outline-info",
            name: "None"
          },
        },
        "Importance": {
          high: {
            populate: "Importance|High",
            class: "btn-outline-danger",
            name: "High"
          },
          medium: {
            populate: "Importance|Medium",
            class: "btn-outline-warning",
            name: "Medium"
          },
          low: {
            populate: "Importance|Low",
            class: "btn-outline-success",
            name: "Low"
          },
          none: {
            populate: "Importance|None",
            class: "btn-outline-info",
            name: "None"
          },
        },
        "Review": {
          weekly: {
            populate: "Review|Weekly",
            class: "btn-outline-secondary",
            name: "Weekly"
          },
          monthly: {
            populate: "Review|Monthly",
            class: "btn-outline-secondary",
            name: "Monthly"
          },
          annually: {
            populate: "Review|Annually",
            class: "btn-outline-secondary",
            name: "Annually"
          },
          biennially: {
            populate: "Review|Biennially",
            class: "btn-outline-secondary",
            name: "Biennially"
          },
          reviewed: {
            populate: "Reviewed|@@NOW",
            class: "btn-success",
            name: "Reviewed"
          },
        },
        "Other": {
          highlight: {
            populate: "Highlight|TRUE",
            class: "btn-bright",
            name: "Highlight"
          },
        }
      }
    };
  /* <!-- Internal Objects --> */

  /* <!-- Internal Functions --> */
  var locate = row => {
      var _position = row.position().top - row.height();
      ಠ_ಠ.Flags.log(`Setting scroll position for id=${row.attr("id")} to ${_position}`);
      row.parents("div.tab-pane").animate({
        scrollTop: _position
      }, TRACK_TIME);
      return row;
    },
    busy = (cell, row, css_class, track) => on => {
      on ? ಠ_ಠ.Display.busy({
          target: cell,
          class: "loader-small w-100"
        }) && (track ? locate(row) : true) && row.addClass(css_class ? css_class : "bg-active") :
        ಠ_ಠ.Display.busy({
          target: cell,
          clear: true
        }) && row.removeClass(css_class ? css_class : "bg-active");
    };

  var parseProperties = f => _.union(f.appProperties ? _.pairs(f.appProperties) : [], f.properties ? _.pairs(f.properties) : []),
    parseReview = (review, when) => {
      var _m = when ? moment(when) : moment();
      switch (review) {
        case "Weekly":
          return _m.subtract(1, "weeks");
        case "Monthly":
          return _m.subtract(1, "months");
        case "Annually":
          return _m.subtract(1, "years");
        case "Biennially":
          return _m.subtract(2, "years");
      }
    };

  var needsReview = f => {
    var _props = parseProperties(f),
      _test = (review, reviewed) => review && review[1] && (!reviewed || !reviewed[1] || moment(reviewed[1]).isBefore(parseReview(review[1])));
    return _test(_.find(_props, property => property[0] == "Review"), _.find(_props, property => property[0] == "Reviewed"));
  };

  var mapItems = v => ({
    id: v.id,
    type: v.mimeType,
    mimeType: v.mimeType,
    name: v.name,
    description: v.description,
    parents: v.parents,
    icon: v.iconLink,
    thumbnail: v.thumbnailLink,
    url: v.webViewLink,
    star: v.starred,
    shared: v.shared,
    folder: ಠ_ಠ.Google.folders.is(v.mimeType),
    download: !!v.webContentLink,
    ancestors: v.paths,
    paths: _.map(v.paths, paths => _.pluck(paths, "name").join(" \\ ")),
    properties: v.properties ? v.properties : {},
    appProperties: v.appProperties ? v.appProperties : {},
    needs_Review: needsReview(v),
    team: _team,
    teamDriveId: v.teamDriveId,
    size: v.size,
    out: v.mimeType === "application/vnd.google-apps.spreadsheet" || ಠ_ಠ.Google.files.in("application/x.educ-io.view")(v) ? {
      name: "View",
      desc: "Open in View",
      url: "/view/#google,load." + v.id + ".lazy"
    } : ಠ_ಠ.Google.files.in("application/x.educ-io.folders")(v) ? {
      name: "Folders",
      desc: "Open in Folders",
      url: "/folders/#google,load." + v.id + ".lazy"
    } : ಠ_ಠ.Google.files.in("application/x.educ-io.reflect")(v) ? {
      name: "Reflect",
      desc: "Open in Reflect",
      url: "/reflect/#google,load." + v.id + ".lazy"
    } : null
  });

  var _dialogSaveHandler = (id, prefix, field, mime, decode, encode) => values => {

    if (!decode) decode = values => values;
    if (!encode) encode = values => values;
    var finish = ಠ_ಠ.Display.busy({
        target: $(`#${id}`),
        fn: true
      }),
      _meta = {
        name: `${prefix}: ${folder.name} [${new Date().toLocaleDateString()}].folders`,
        parents: (folder ? [folder.id] : null)
      },
      _state = {
        search: _search ? _searches[id] : null
      };
    _state[field] = encode(decode(values));
    var _data = JSON.stringify({
      folder: folder,
      state: _state
    });
    ಠ_ಠ.Google.upload(_meta, _data, mime).then(uploaded => ಠ_ಠ.Flags.log(`Folders ${prefix} File Saved`, uploaded))
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))
      .then(finish);
  };

  var _processItems = (name, action, parameters, values, collection, table, id, concurrent, highlight, batch, log, no_track) => new Promise(resolve => {

    var _range = (sheet, start_Row, end_Row, start_Col, end_Col) => ({
        "sheetId": sheet ? sheet : 0,
        "startRowIndex": start_Row,
        "endRowIndex": end_Row,
        "startColumnIndex": start_Col,
        "endColumnIndex": end_Col,
      }),
      _results = [],
      _fn = ಠ_ಠ._isF(name),
      _log = log || (parameters && parameters.log) ? `${_fn ? name() : name} Results ${folder && folder.name ? `for ${folder.name}` : ""} [${new Date().toUTCString()}]` : false,
      _logger,
      _write = () => {
        var _rows = [];
        try {
          _.each(_logger.failures, failure => _rows.push(
            ["FAILED", failure.start.id, failure.start.name, failure.start.paths ? failure.start.paths.join(" | ").trim() : "",
              "", "", "", failure.exception ? JSON.stringify(failure.exception) : ""
            ]
          )) && (_logger.failures = []);
          _.each(_logger.successes, success => _rows.push(
            ["Succeeded", success.start.id, success.start.name, success.start.paths ? success.start.paths.join(" | ").trim() : "",
              success.end.id ? success.end.id : "", success.end.name ? success.end.name : "", success.end.mimeType ? success.end.mimeType : "",
              success.end.id ? "" : JSON.stringify(success.end)
            ]
          )) && (_logger.successes = []);
        } catch (err) {
          return Promise.reject(err);
        }
        return ಠ_ಠ.Google.sheets.update(_logger.log.spreadsheetId, `A${_logger.start}:H${_logger.start += _rows.length}`, _rows);
      },
      _step = (step, all, index, fn, complete) => {
        var _next = all.splice(0, step);
        _next.length === 0 ? complete() : fn(_next, all, index += _next.length, step, complete);
      },
      _process = (items, remaining, index, step, complete) => { /* <!-- Process Items --> */

        var _count = items.length,
          _current = 0,
          _complete = () => table.update() && _step(step, remaining, index, _process, complete);

        _.each(items, item => {

          var _name = _fn ? name(item) : name;

          ಠ_ಠ.Flags.log(`${_name} item: ${item.name} (${item.id})`);

          var _container = $("#" + id + "_" + item.id),
            _result = collection.by("id", item.id);
          if (!_container || _container.length === 0) _container = $("#" + item.id);
          var _cell = _container.find(".file-name").parents("td"),
            _row = _cell.parents("tr"),
            _busy = busy(_cell, _row, null, !no_track);
          _busy(true);

          action(_result, parameters)
            .then(result => {
              if (result) {
                ಠ_ಠ.Flags.log(`Item (${_name}) Success: ${JSON.stringify(result)}`);
                if (highlight) _result.__success = true;
                if (_logger) _logger.successes.push({
                  index: index,
                  start: _result,
                  end: result
                });
              }
              _results.push({
                item: _result,
                result: result
              });
            })
            .catch(e => {
              ಠ_ಠ.Flags.error(`"Item ${item.id} ${_name} error`, e ? e : "No Inner Error");
              if (highlight) _result.__failure = true;
              if (_logger) _logger.failures.push({
                index: index,
                start: _result,
                exception: e
              });
            })
            .then(() => {
              _busy(false);
              collection.update(_result);
              if ((_current += 1) == _count) _complete();
            });

        });

      },
      _batch = (batch, remaining, index, step, complete) => { /* <!-- Process Batches --> */

        ಠ_ಠ.Flags.log(`${_fn ? name() : name} running: ${batch.length} items in batch (${concurrent} concurrently) using parameters: ${JSON.stringify(parameters)}`);

        _step(concurrent, batch, 0, _process, () => {
          (_logger ? _write() : Promise.resolve(true))
          .catch(e => ಠ_ಠ.Flags.error("Log Writing Failed", e ? e : "No Inner Error"))
            .then(() => _step(step, remaining, index, _batch, complete));
        });

      };

    /* <!-- Create/End Sheets Log --> */
    var _createLog = name => new Promise((resolve, reject) => {

        var _event = "log-creation-progress",
          _notify = message => window.dispatchEvent(new CustomEvent(_event, {
            detail: message
          })),
          _busy = ಠ_ಠ.Display.busy({
            target: ಠ_ಠ.container,
            fn: true,
            status: {
              event: _event
            }
          }),
          _complete;

        _notify("Creating Log");
        ಠ_ಠ.Google.sheets.create(name, "Results", {
            "red": 0.545,
            "green": 0.153,
            "blue": 0.153
          })
          .then(sheet => {
            _complete = (sheet => () => resolve(sheet))(sheet);
            ಠ_ಠ.Flags.log(`Created Log File: ${_log} - [${sheet.spreadsheetId}]`);
            return sheet;
          })
          .then(sheet => {
            _notify("Adding Headers");
            return ಠ_ಠ.Google.sheets.update(sheet.spreadsheetId, "A1:H2", [
              [
                "Result", "Source", "", "", "Destination", "", "", "Details"
              ],
              [
                "", "ID", "Name", "Paths", "ID", "Name", "Type", ""
              ]
            ]);
          })
          .then(sheet => {
            _notify("Formatting Log");
            return ಠ_ಠ.Google.sheets.batch(sheet.spreadsheetId, [{
              "mergeCells": {
                "range": _range(0, 0, 2, 0, 1),
                "mergeType": "MERGE_ALL",
              }
            }, {
              "mergeCells": {
                "range": _range(0, 0, 1, 1, 4),
                "mergeType": "MERGE_ALL",
              }
            }, {
              "mergeCells": {
                "range": _range(0, 0, 1, 4, 7),
                "mergeType": "MERGE_ALL",
              }
            }, {
              "mergeCells": {
                "range": _range(0, 0, 2, 7, 8),
                "mergeType": "MERGE_ALL",
              }
            }, {
              "repeatCell": {
                "range": {
                  "sheetId": 0,
                  "startRowIndex": 0,
                  "endRowIndex": 2
                },
                "cell": {
                  "userEnteredFormat": {
                    "backgroundColor": {
                      "red": 0.0,
                      "green": 0.0,
                      "blue": 0.0
                    },
                    "horizontalAlignment": "CENTER",
                    "verticalAlignment": "MIDDLE",
                    "textFormat": {
                      "foregroundColor": {
                        "red": 1.0,
                        "green": 1.0,
                        "blue": 1.0
                      },
                      "fontSize": 12,
                      "bold": true
                    }
                  }
                },
                "fields": "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)"
              }
            }, {
              "updateSheetProperties": {
                "properties": {
                  "sheetId": 0,
                  "gridProperties": {
                    "frozenRowCount": 2
                  }
                },
                "fields": "gridProperties.frozenRowCount"
              }
            }]);
          })
          .catch(e => reject(e))
          .then(result => _busy() && result ? _complete() : reject());

      }),
      _endLog = () => ಠ_ಠ.Google.sheets.batch(_logger.log.spreadsheetId, [{
        "autoResizeDimensions": {
          "dimensions": {
            "sheetId": 0,
            "dimension": "COLUMNS",
            "startIndex": 0,
            "endIndex": 8
          }
        }
      }]);

    /* <!-- Default to concurrency of 1 if none supplied --> */
    concurrent = concurrent ? concurrent : 1;

    /* <!-- Clear previous 'results' if we are highlighting --> */
    if (highlight) _.each(values, value => _.each(["__success", "__failure"], key => {
      delete value[key];
      delete collection.by("id", value.id)[key];
    })) && table.update();

    /* <!-- Kick off First Batch --> */
    var _start = log => {
      if (log) _logger = {
        log: log,
        start: 3,
        successes: [],
        failures: []
      };
      ಠ_ಠ.Flags.log(`${_fn ? name() : name} started: ${values.length} items to process`);
      _step(batch ? batch : values.length, values, 0, _batch, () => {
        (_logger ? _endLog() : Promise.resolve(true)).then(() => resolve(_results));
      });
    };

    (_log ? _createLog(_log) : Promise.resolve(false))
    .then(_start)
      .catch(e => ಠ_ಠ.Flags.error("Log Creation Error", e) && _start(false));

  });

  var _enableDownloads = target => {
    target.find("a.download").on("click.download", e => {
      ಠ_ಠ.Google.download($(e.target).data("id"), _team).then(binary => {
        try {
          saveAs(binary, $(e.target).data("name"));
        } catch (e) {
          ಠ_ಠ.Flags.error("Drive File Download", e);
        }
      });
    });
  };

  var _showData = (id, name, values, target) => {

    var headers = _.map(["Type", "Shared", "ID", "Name", "Actions", "Star"], v => ({
      name: v,
      hide: function(initial) {
        return !!(initial && this.hide_initially);
      },
      set_hide: function(now, always, initially) {
        this.hide_initially = initially;
      },
      hide_always: false,
      hide_now: false,
      hide_initially: v === "ID" ? true : false,
      field: v.toLowerCase(),
    }));

    var _data = DB.addCollection(id, {
      unique: ["id"],
      indices: ["type", "starred", "name", "shared"]
    });
    if (_tallyCache && values && values.length > 0) _.each(values, value => {
      if (_tallyCache[value.id]) value.results = _tallyCache[value.id];
    });

    _data.clear({
      removeIndices: false
    }); /* <!-- Clear in case this is a refresh --> */

    _data.insert(values);

    var _update = target => {

        /* <!-- Wire Up Download Buttons --> */
        _enableDownloads(target);

        /* <!-- Hide popovers on second click --> */
        var _popped = null;
        target.find(".name-link[data-toggle='popover']").on("click.again", e => {
          var _$ = $(e.currentTarget),
            _popover = _$.attr("aria-describedby");
          if (_popover && _popover.indexOf("popover") === 0) {
            (_popover == _popped) ? _$.popover("hide"): _popped = _popover;
          }
        });

      },
      _return = ಠ_ಠ.Datatable(ಠ_ಠ, {
        id: id,
        name: name,
        data: _data,
        headers: headers,
      }, {
        advanced: false,
        collapsed: true
      }, target, target => _update(target));

    /* <!-- Wire-Up Events --> */
    _update(target);

    return _return;

  };

  var _loadContents = (id, name, target) => {

    /* <!-- Start the Loader --> */
    var _busy = ಠ_ಠ.Display.busy({
      target: target,
      fn: true
    });

    var _loader = _team ? ಠ_ಠ.Google.folders.contents(id, [], _team) : ಠ_ಠ.Google.folders.contents(id);

    /* <!-- Need to load the contents of the folder --> */
    _loader.then(contents => {

      ಠ_ಠ.Flags.log("Google Drive Folder Opened", contents);
      _tables[id] = _showData(id, name, _.map(contents, mapItems), target);

      _busy().state().enter("opened").protect("a.jump").on("JUMP");

      /* <!-- Run Initial Complete if required --> */
      if (complete) complete() && (complete = null);

    }).catch(e => {
      ಠ_ಠ.Flags.error("Requesting Selected Google Drive Folder", e ? e : "No Inner Error");
      _busy().state().exit("opened").protect("a.jump").off("JUMP");
    });

  };

  var _showTab = tab => {

    var target = $(tab.data("target"));

    tab.closest(".nav-item").addClass("order-1").siblings(".order-1").removeClass("order-1");

    if (tab.data("type") == "team") _team = tab.data("id");
    if (target.children().length === 0 || tab.data("refresh")) {
      if (tab.data("type") == "folder" || tab.data("type") == "team") {
        _loadContents(tab.data("id"), tab.data("name"), target.empty());
      } else if (tab.data("type") == "search") {
        var _busy = ಠ_ಠ.Display.busy({
          target: target,
          fn: true
        });
        _tables[tab.data("id")] = _showData(tab.data("id"), tab.data("name"), _last, target.empty());
        _busy();
      }
    }

    if (tab.data("type") == "folder" || tab.data("type") == "team") {
      ಠ_ಠ.Display.state().exit("searched");
      _search = null;
      _last = null;
    } else if (tab.data("type") == "search") {
      ಠ_ಠ.Display.state().enter("searched");
      _search = tab.data("id");
    }

  };

  var _activateTab = tabs => {
    tabs.find("a.nav-link")
      .off("click.tabs").on("click.tabs", e => $(e.target).data("refresh", e.shiftKey))
      .off("shown.bs.tab").on("shown.bs.tab", e => _showTab($(e.target)))
      .last().tab("show");
  };

  var _showFolder = (folder, target) => {

    var _data = {
      tabs: [{
        id: folder.id,
        name: folder.name,
        type: folder.team ? "team" : "folder"
      }]
    };

    var _tabs = ಠ_ಠ.Display.template.show({
      template: "tab-list",
      id: folder.id,
      name: folder.name,
      nav: "folder_tabs",
      links: ಠ_ಠ.Display.template.get("tab-links")(_data),
      tabs: ಠ_ಠ.Display.template.get("tab-tabs")(_data),
      target: target
    });

    /* <!-- Set Load Tab Handler & Load Initial Values --> */
    _activateTab(_tabs);

  };

  var _showResults = (name, items) => {

    var _id = name.replace(/[^A-Z0-9]+/gi, "").toLowerCase(),
      _data = {
        tabs: [{
          id: _id,
          name: name,
          type: "search",
          actions: {
            close: {
              url: `#remove.tab.${_id}`,
              name: "Close",
              desc: "Close these search results"
            }
          }
        }]
      };

    var _items = _.each(_.map(items, mapItems), v => v.safe = (_id + "_" + v.id)),
      _folder_Count = _.reduce(items, (count, item) => ಠ_ಠ.Google.folders.is(item.mimeType) ? count + 1 : count, 0),
      _file_Count = _.reduce(items, (count, item) => !ಠ_ಠ.Google.folders.is(item.mimeType) ? count + 1 : count, 0),
      _file_Size = _.reduce(items, (total, item) => total + (item.size ? parseInt(item.size) : 0), 0);

    /* <!-- Need to remove duplicates (same file in more than one folder!) --> */
    _last = _.uniq(_items, false, v => v.id);

    $(ಠ_ಠ.Display.template.get("tab-tabs")(_data)).appendTo(".tab-content");
    _activateTab($(ಠ_ಠ.Display.template.get("tab-links")(_data)).appendTo("#folder_tabs").parent());

    /* <!-- Measure the Performance (end) --> */
    ಠ_ಠ.Flags.time(name, true);

    /* <!-- Display the Results (if the total results exceeds the trigger) --> */
    if (items.length >= SEARCH_TRIGGER) ಠ_ಠ.Display.modal("results", {
      id: "search_results",
      target: ಠ_ಠ.container,
      title: "Search Results",
      folders: _folder_Count,
      files: _file_Count,
      size: _file_Size,
    });

  };

  var _searchTag = (name, value) => {

    if (name && value) {

      var _name = "Search @ " + new Date().toLocaleTimeString();

      var _finish = ಠ_ಠ.Display.busy({
        target: ಠ_ಠ.container,
        fn: true
      });

      /* <!-- Measure the Performance (start) --> */
      ಠ_ಠ.Flags.time(_name);

      ಠ_ಠ.Flags.log(`Searching Drive for Files/Folders with Property: ${name} and Value: ${value}`);

      ಠ_ಠ.Google.folders.search("root", true, [], [], [], [], {
        simple: [`${name}=${value}`],
        complex: []
      }, [], null, _team, true).then(results => {
        _showResults(_name, results);
      }).catch((e) => {
        if (e) ಠ_ಠ.Flags.error("Search Error", e);
      }).then(_finish);
    }

  };

  var _searchFolder = id => {

    var _name = "Search @ " + new Date().toLocaleTimeString();

    var _decode = values => {

      var _regex = (regex, fallback) => f => {
        if (regex.indexOf("||") > 0) {
          return f.mimeType === regex.split("||")[0] && new RegExp(regex.split("||")[1], "i").test(f.name);
        } else if (regex) {
          return new RegExp(regex, "i").test(f.name);
        } else {
          return fallback;
        }
      };

      var _properties = _.find(values, v => v.name == "properties").value.trim();
      _properties = _properties ? _properties.split("\n") : null;
      var _simple = p => p.indexOf("=") > 0 && p.indexOf("<=") < 0 && p.indexOf(">=") < 0 && p.indexOf("!=") < 0 && p.indexOf("<>") < 0 && p.indexOf("@@") !== 0;
      var _complex = test => {

        if (test.toUpperCase().indexOf("@@[REVIEW]=") === 0) {

          var value = test.split("=")[1],
            _predicate = value.toUpperCase() == "[NEEDED]" ?
            (review, reviewed) => review && review[1] && (!reviewed || !reviewed[1] || moment(reviewed[1]).isBefore(parseReview(review[1]))) : value.toUpperCase() == "[DONE]" ?
            (review, reviewed) => review && (reviewed && moment(reviewed[1]).isAfter(parseReview(review[1]))) :
            (review, reviewed) => review && (!reviewed || moment(reviewed[1]).isBefore(parseReview(review[1], value)));

          return f => {
            var _props = parseProperties(f);
            return _predicate(_.find(_props, property => property[0] == "Review"), _.find(_props, property => property[0] == "Reviewed"));
          };

        } else {

          var _operators = {
              ">=": (name, value) => (n, v) => n == name && v >= value,
              "!=": (name, value) => (n, v) => n == name && v != value,
              "<=": (name, value) => (n, v) => n == name && v <= value,
              "<>": (name, value) => (n, v) => n == name && v != value
            },
            _operator = _.find(_.keys(_operators), operator => test.indexOf(operator) > 0);

          return f => _.some(parseProperties(f), property => property && (_operator ?
            _operators[_operator](test.split(_operator)[0], test.split(_operator)[1]) :
            n => n.toLowerCase() == test.toLowerCase())(property[0], property[1]));

        }

      };

      var _return = {
        names: _.find(values, v => v.name == "names").value.trim() ?
          _.map(_.find(values, v => v.name == "names").value.split("\n"), m => m.trim()) : [],
        mime: _.find(values, v => v.name == "mime").value.trim() ?
          _.map(_.find(values, v => v.name == "mime").value.split("\n"), m => m.trim()) : [],
        properties: {
          modifier: _.find(values, v => v.name == "properties_modifier").value,
          simple: _properties ? _.map(_.filter(_properties, p => p && _simple(p)), m => m.trim()) : null,
          complex: _properties ? _.map(_.reject(_properties, p => !p || _simple(p)), t => _complex(t.trim())) : null,
        },
        exclude: _.map(_.find(values, v => v.name == "exclude").value.split("\n"), r => _regex(r.trim(), false)),
        include: _.map(_.find(values, v => v.name == "include").value.split("\n"), r => _regex(r.trim(), true)),
        limited: !!(_.find(values, v => v.name == "limited")),
        domain: !!(_.find(values, v => v.name == "domain")),
        public: !!(_.find(values, v => v.name == "public")),
        recurse: !!(_.find(values, v => v.name == "recurse")),
        shared: !!(_.find(values, v => v.name == "shared")),
        entire: !!(_.find(values, v => v.name == "entire"))
      };
      _return.visibilities = []
        .concat(_return.limited ? ["limited"] : [])
        .concat(_return.domain ? ["domainWithLink", "domainCanFind"] : [])
        .concat(_return.public ? ["anyoneWithLink", "anyoneCanFind"] : []);
      _return.basic = _return.entire &&
        !(_.find(values, v => v.name == "exclude").value.trim()) &&
        !(_.find(values, v => v.name == "include").value.trim()) && (!_return.properties.complex || _return.properties.complex.length === 0);
      return _return;
    };
    var _encode = values => _.each(_.clone(values), (value, key, list) => _.isArray(value) ? list[key] = value.join("\n") : false);

    var _root = folder.name == "root" || !folder.parents || folder.parents.length === 0,
      _id = "start_search",
      _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
      _search = ಠ_ಠ.Display.modal("search", {
        id: _id,
        target: ಠ_ಠ.container,
        title: "Search Google Drive",
        instructions: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
        state: state && state.search ? state.search : null,
        shortcuts: _dialog_Shortcuts.search,
        entire: _root,
        handlers: {
          lock: _dialog.handlers.lock,
          clear: _dialog.handlers.clear,
          options: _dialog.handlers.options,
          populate: (target, dialog, options) => {

            var _shortcut = ಠ_ಠ.Dialog({}, ಠ_ಠ).populate.shortcuts(target, dialog, options, [
              ["mime", "#mimeTypes"],
              ["include", "#includeRegexes"],
              ["exclude", "#excludeRegexes"],
              ["properties", "#includeProperties"],
              ["properties_modifier", "#modifierProperties"]
            ]);
            dialog.find("textarea.resizable").each((i, el) => autosize.update(el));

            /* <!-- Tick Search All Drive if Possible --> */
            var _basic = false;
            if (_shortcut && _root) {
              if (!dialog.find("#includeRegexes, #excludeRegexes").val().trim()) {
                var _props = dialog.find("#includeProperties").val().trim();
                _basic = (!_props || !_.some(["!=", "<>", ">=", "<=", "@@"], test => _props.indexOf(test) >= 0));
              }
            }
            $("#entireDrive").prop("checked", _basic);
          }
        },
        actions: [{
          text: "Save",
          handler: _dialogSaveHandler(_id, "Search", "search", TYPE_SEARCH, _decode, _encode)
        }],
      }, dialog => {
        autosize(dialog.find("textarea.resizable"));
        dialog.find("#entireDrive").on("change", e => (e.currentTarget.checked) ?
          $("#recurseFolders").prop("checked", true) && $("#shared_WithMe").removeAttr("disabled") :
          $("#shared_WithMe").attr("disabled", true) && $("#shared_WithMe").prop("checked", false));
        dialog.find("#recurseFolders").on("change", e => {
          if (!e.currentTarget.checked) $("#entireDrive").prop("checked", false);
        });
      });

    _search.then(values => {

      if (values) {

        var _finish = ಠ_ಠ.Display.busy({
          target: ಠ_ಠ.container,
          fn: true,
          status: { /* <!-- Hook up to Progress Event --> */
            source: window,
            event: ಠ_ಠ.Google.events().SEARCH.PROGRESS,
            value: detail => `${ಠ_ಠ.Display.commarise(detail.folders)} ${detail.folders > 1 ? "folders" : "folder"} processed`
          }
        });

        /* <!-- Measure the Performance (start) --> */
        ಠ_ಠ.Flags.time(_name);

        values = _decode(values);
        ಠ_ಠ.Flags.log(`Searching folder ${id} with terms: ${JSON.stringify(values)}`);
        _searches[id] = _encode(values);

        ಠ_ಠ.Google.folders.search(id, values.recurse, values.names, values.mime, values.exclude, values.include,
          values.properties, values.visibilities, values.shared, _team, values.basic).then(results => {
          _showResults(_name, results);
        }).catch(e => {
          if (e) ಠ_ಠ.Flags.error("Search Error", e);
        }).then(_finish);

      }

    }).catch(e => {
      if (e) ಠ_ಠ.Flags.error("Search Error", e);
    });

  };

  var _closeSearch = search => {

    if (_search && !search) return _closeSearch(_search);

    if (search) {
      DB.removeCollection(search);
      $("#nav_" + search).remove();
      $("#tab_" + search).remove();
      $("#folder_tabs a.nav-link:last").tab("show");
    }

  };

  var _getTable = () => _search ? _tables[_search] : _tables[folder.id];
  /* <!-- Internal Functions --> */

  /* <!-- Item Processing --> */
  var _items = {

    process: (fn, file, filter, parameters) => {
      var _id = _search ? _search : folder.id,
        _collection = DB.getCollection(_id);
      if (_collection) {
        var _table = _tables[_id],
          _filter = filter ? filter : items => items,
          _items = _filter(file ? [_collection.by("id", file)] : _table.data());
        if (_items.length > 0) fn(_id, _collection, _table, _items, parameters);
      }
    },

    audit: (id, collection, table, results) => {

      _processItems("Auditing", item => new Promise((resolve, reject) => {
        (!item.shared && !item.teamDriveId) ? resolve(item.permissions = [{
            me: true,
            mine: true,
            mock: true
          }]):
          ಠ_ಠ.Google.permissions.get(item.id, _team).then(permissions => {
            var _owner = _.find(permissions, p => p.role == "owner" || p.role == "organizer"),
              _owningDomain = _owner && _owner.emailAddress ? _owner.emailAddress.split("@")[1].toLowerCase() : false;
            var _confidential = item.properties && (item.properties.Confidentiality == "Medium" || item.properties.Confidentiality == "High"),
              _slightlyConfidential = item.properties && item.properties.Confidentiality == "Low";
            _.each(permissions, p => {
              p.me = (p.emailAddress && p.emailAddress.toLowerCase() == ಠ_ಠ.me.email.toLowerCase());
              p.mine = (p.me && (p.role == "owner" || p.role == "organizer"));
              p.class = ((_confidential || _slightlyConfidential) && p.allowFileDiscovery) ?
                "alert-danger" : (_confidential && (p.type == "domain" || p.type == "anyone")) ? "alert-warning" :
                _owningDomain && p.emailAddress && p.emailAddress.split("@")[1].toLowerCase() != _owningDomain ? "alert-dark" : "";
            });
            resolve(item.permissions = permissions);
          }).catch(e => reject(e));
      }), {}, results, collection, table, id, 5, null, null, null, true).then(permissions => {

        if (permissions && (permissions = _.filter(permissions, i => i.item.shared || i.item.teamDriveId)).length > 1) {

          var _details = {
            searchable: 0,
            domain: 0,
            anyone: 0,
            group: 0,
            user: 0,
            read: 0,
            write: 0,
            comment: 0,
            domains: {},
            emails: {}
          };

          _.each(permissions, i => _.each(i.result, p => {

            _details.searchable += (p.allowFileDiscovery ? 1 : 0);

            _details.domain += (p.type && p.type == "domain" ? 1 : 0);
            _details.anyone += (p.type && p.type == "anyone" ? 1 : 0);
            _details.user += (p.type && p.type == "user" ? 1 : 0);
            _details.group += (p.type && p.type == "group" ? 1 : 0);

            _details.read += (p.role && p.role == "reader" ? 1 : 0);
            _details.write += (p.role && p.role == "writer" ? 1 : 0);
            _details.comment += (p.role && p.role == "commenter" ? 1 : 0);

            if (p.domain) _details.domains[p.domain] ?
              _details.domains[p.domain] += 1 : _details.domains[p.domain] = 1;
            if (p.emailAddress) _details.emails[p.emailAddress] ?
              _details.emails[p.emailAddress] += 1 : _details.emails[p.emailAddress] = 1;

          }));

          _details.id = "audit_results";
          _details.target = ಠ_ಠ.container;
          _details.title = "Audit Results";
          _details.instructions = ಠ_ಠ.Display.doc.get("AUDIT_EXPLANATION");

          _details.domains = _.sortBy(_.map(_details.domains, (value, domain) => ({
            value: domain,
            count: value
          })), "count").reverse();
          _details.emails = _.sortBy(_.map(_details.emails, (value, emails) => ({
            value: emails,
            count: value
          })), "count").reverse();

          /* <!-- Display the Results --> */
          ಠ_ಠ.Display.modal("audit", _details);

        }

      });

    },

    clone: (id, collection, table, results) => {

      var _decode = values => {
        var _return = {
          folders: !!(_.find(values, v => v.name == "folders")),
          properties: !!(_.find(values, v => v.name == "properties")),
          merge: !!(_.find(values, v => v.name == "merge")),
          prefix: _.find(values, v => v.name == "prefix") ? `${_.find(values, v => v.name == "prefix").value.trim()} ` : "",
          batch: _.find(values, v => v.name == "batch").value,
          output: _.find(values, v => v.name == "output") ? _.find(values, v => v.name == "output").value : null,
          relative: _.find(values, v => v.name == "relative") ? _.find(values, v => v.name == "relative").value : null
        };
        (!_return.batch || _return.batch <= 0) ? _return.batch = BATCH_SIZE: _return.log = true;
        return _return;
      };

      var _id = "clone_results",
        _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
        _clone = ಠ_ಠ.Display.modal("clone", {
          id: _id,
          target: ಠ_ಠ.container,
          title: `Clone <strong class="text-secondary">${ಠ_ಠ.Display.commarise(results.length)}</strong> File${results.length > 1 ? "s" : ""}`,
          instructions: ಠ_ಠ.Display.doc.get("CLONE_INSTRUCTIONS"),
          state: state && state.clone ? state.clone : null,
          relative: {
            id: folder.id,
            name: folder.name
          },
          advanced: !!_search,
          handlers: {
            clear: _dialog.handlers.clear,
            populate: (target, dialog) => dialog.find("textarea.resizable").each((i, el) => autosize.update(el))
          },
          actions: [{
            text: "Save",
            handler: _dialogSaveHandler(_id, "Clone", "clone", TYPE_CLONE, _decode)
          }]
        }, dialog => {
          autosize(dialog.find("textarea.resizable"));
          _dialog.handlers.picker(dialog);

          dialog.find("#folders").on("change", e => {
            if (!e.currentTarget.checked) $("#merge").prop("checked", false);
            dialog.find(`[data-controlled='${e.currentTarget.id}']`).toggle(!!e.currentTarget.checked);
          });

        });

      _clone.then(values => {

        var _folderCache = {};

        if (values) _processItems("Cloning", (item, parameters) => new Promise(resolve => {

          var prop_Name = "Cloned-From",
            prop_Value = item.id;

          var _root = parameters.output ? parameters.output : "root",
            _copy = parent => {

              var _action = () => {
                var _props = parameters.properties ? _.clone(item.properties) : null,
                  _appProps = parameters.properties ? _.clone(item.appProperties) : {};
                _appProps[prop_Name] = prop_Value;
                ಠ_ಠ.Google.files.copy(item.id, _team, {
                  name: `${parameters.prefix}${item.name}`,
                  properties: _props,
                  appProperties: _appProps,
                  parents: [parent]
                }).then(cloned => resolve(cloned));
              };

              /* <!-- Need to test for existing file if merge --> */
              parameters.merge ? ಠ_ಠ.Google.folders.contents(parent, item.mimeType, _team, {
                simple: [`${prop_Name}=${prop_Value}`]
              }).then(results => {
                !results || results.length === 0 ? _action() : resolve(false);
              }) : _action();

            };

          if (!parameters.folders || !item.parents || item.parents.length === 0) {

            _copy(_root);

          } else {

            /* <!-- Check for Merge Here and search for folders --> */
            var _createFolderFrom = (folder, parent) => new Promise(resolve => {

              var _create = () => {
                var _props = parameters.properties && folder.properties ? _.clone(folder.properties) : null,
                  _appProps = parameters.properties && folder.appProperties ? _.clone(folder.appProperties) : {};
                _appProps[prop_Name] = folder.id;

                ಠ_ಠ.Google.folders.create(`${parameters.prefix}${folder.name}`, parent, {
                  appProperties: _appProps,
                  properties: _props
                }, _team).then(created => {
                  ಠ_ಠ.Flags.log(`Created Clone Tree Folder for ${folder.name} (${folder.id}):`, JSON.stringify(created));
                  _folderCache[folder.id] = created.id;
                  resolve(created);
                });
              };

              /* <!-- Need to test for existing folder if merge --> */
              parameters.merge ?
                ಠ_ಠ.Google.folders.folders(parent, true, _team, {
                  simple: [`${prop_Name}=${folder.id}`]
                }).then(results => {
                  !results || results.length === 0 ? _create() : (_folderCache[folder.id] = results[0].id) && resolve(results[0]);
                }) : _create();

            });

            /* <!-- Need to create folder structure --> */
            if (_folderCache[item.parents[0]]) {

              /* <!-- Cloned Folder already created, so use that --> */
              _copy(_folderCache[item.parents[0]]);

            } else {

              /* <!-- Filter out ancestors on and above a certain level --> */
              var _filterAncestors = (ancestors, from) => {
                  var _position = _.findIndex(ancestors, ancestor => ancestor.id == from);
                  return _position >= 0 ? ancestors.slice(_position + 1) : ancestors;
                },
                _ancestors = (!item.ancestors || item.ancestors.length === 0) ? [] : parameters.relative ? _filterAncestors(item.ancestors[0], parameters.relative) : item.ancestors[0];

              if (_ancestors.length === 0) {

                /* <!-- No paths, but a parent, so clone that--> */
                (parameters.relative && item.parents[0] == parameters.relative) ?
                _copy(_root): ಠ_ಠ.Google.files.get(item.parents[0], _team).then(parent => {
                  _createFolderFrom(parent, _root).then(folder => _copy(folder.id));
                });

              } else {

                /* <!-- Recursively Create Folder Tree --> */
                var _createAncestor = (ancestors, index, _last) =>
                  _createFolderFrom(ancestors[index], _last).then(folder =>
                    (index += 1) >= ancestors.length ? _copy(folder.id) : _createAncestor(ancestors, index, folder.id));

                _createAncestor(_ancestors, 0, _root);

              }

            }


          }

        }), _decode(values), results, collection, table, id, CONCURRENT_SIZE, true, values.batch);

      }).catch(e => e ? ಠ_ಠ.Flags.error("Cloning Error", e) : ಠ_ಠ.Flags.log("Clone Cancelled"));

    },

    convert: (id, collection, table, results) => {

      var _id = "convert_results",
        _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
        _decode = values => {
          var _return = {
            source: _.find(values, v => v.name == "source") ? _.find(values, v => v.name == "source").value : null,
            target: _.find(values, v => v.name == "target").value,
            prefix: _.find(values, v => v.name == "prefix") ? _.find(values, v => v.name == "prefix").value : null,
            batch: _.find(values, v => v.name == "batch").value,
            inplace: !!(_.find(values, v => v.name == "inplace")),
            mirror: _.find(values, v => v.name == "mirror") ? _.find(values, v => v.name == "mirror").value : null
          };
          (!_return.batch || _return.batch <= 0) ? _return.batch = BATCH_SIZE: _return.log = true;
          return _return;
        },
        _export = (file, targetMimeType, inPlace, mirror) => new Promise((resolve, reject) => {

          ಠ_ಠ.Google.files.export(file.id, targetMimeType).then(binary => {

            var _name = file.name.lastIndexOf(".") > 0 ? file.name.substr(0, file.name.lastIndexOf(".")) : file.name;

            var _upload = (metadata, id) => {

              ಠ_ಠ.Google.upload(metadata ? metadata : {
                  name: _name,
                  parents: mirror ? (file.parents ? file.parents : []).concat(mirror) : file.parents,
                  teamDriveId: _team,
                }, binary, targetMimeType, _team, id)
                .then(uploaded => resolve(uploaded))
                .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error") && reject());

            };

            !inPlace ? _upload() : ಠ_ಠ.Google.folders.search(file.parents, false, [], targetMimeType, [],
              ((n, t) => f => (f.name == n) && f.mimeType == t)(_name, targetMimeType), [], [], null, _team, false).then(results => {
              if (results && results.length == 1) {
                _upload({}, results[0].id);
              } else {
                _upload();
              }
            });

          }).catch(e => ಠ_ಠ.Flags.error("Export Error", e ? e : "No Inner Error") && reject());

        }),
        _convert = (file, sourceMimeType, targetMimeType, prefixAfterConversion, inPlace, mirror) => new Promise((resolve, reject) => {

          var metadata = inPlace ? {} : {
            name: file.name.substr(0, file.name.lastIndexOf(".")),
            parents: mirror ? (file.parents ? file.parents : []).concat(mirror) : file.parents,
            teamDriveId: _team,
          };
          metadata.mimeType = targetMimeType;

          ಠ_ಠ.Google.download(file.id, _team).then(binary => {

            (inPlace ?
              ಠ_ಠ.Google.upload(metadata, binary, sourceMimeType, _team, file.id) :
              ಠ_ಠ.Google.upload(metadata, binary, sourceMimeType, _team))
            .then(uploaded => prefixAfterConversion ?
                ಠ_ಠ.Google.update(file.id, {
                  name: prefixAfterConversion + file.name
                }, _team)
                .then(() => resolve(uploaded))
                .catch(e => ಠ_ಠ.Flags.error("Renaming Source File Error", e ? e : "No Inner Error") && reject()) :
                resolve(uploaded))
              .catch(e => ಠ_ಠ.Flags.error("Conversion Error", e ? e : "No Inner Error") && reject());

          }).catch(e => ಠ_ಠ.Flags.error("Download Error", e ? e : "No Inner Error") && reject());

        });

      ಠ_ಠ.Display.modal("convert", {
        id: _id,
        target: ಠ_ಠ.container,
        title: `Convert <strong class="text-secondary">${ಠ_ಠ.Display.commarise(results.length)}</strong> File${results.length > 1 ? "s" : ""}`,
        instructions: ಠ_ಠ.Display.doc.get("CONVERT_INSTRUCTIONS"),
        state: results.length == 1 ? {
          source: results[0].mimeType
        } : state && state.convert ? state.convert : null,
        shortcuts: _dialog_Shortcuts.convert,
        handlers: {
          lock: _dialog.handlers.lock,
          clear: _dialog.handlers.clear,
          populate: (target, dialog, options) => {
            ಠ_ಠ.Dialog({}, ಠ_ಠ).populate.shortcuts(target, dialog, options, [
              ["source", "#sourceMimeType"],
              ["target", "#targetMimeType"],
              ["prefix", "#prefixAfterConversion"]
            ]);
            dialog.find("#convertInplace").prop("disabled", !!(dialog.find("#prefixAfterConversion").val()))
              .prop("checked", !(dialog.find("#prefixAfterConversion").val())); /* <!-- Reconcile Interface --> */
          }
        },
        actions: [{
          text: "Save",
          handler: _dialogSaveHandler(_id, "Convert", "convert", TYPE_CONVERT, _decode)
        }]
      }, dialog => {

        autosize(dialog.find("textarea.resizable"));
        _dialog.handlers.picker(dialog);

        /* <!-- Update whether we can do an inplace conversion, depending on the Target MIME Type --> */
        dialog.find("#targetMimeType").on("change", e => {
          var _native = ಠ_ಠ.Google.files.native($(e.target).val());
          $("#convertInplace").prop("disabled", _native).prop("checked", !_native);
        });

        /* <!-- If we are working inplace, we're not renaming --> */
        dialog.find("#convertInplace").on("change", e => {
          if (e.currentTarget.checked) $("#prefixAfterConversion").val("");
        });

      }).then(values => {

        if (values && (values = _decode(values))) _processItems(values.source ? "Converting" : "Exporting",
          (item, parameters) => (!(parameters.source || ಠ_ಠ.Google.files.native(item.type))) ? Promise.resolve(false) : parameters.source ?
          _convert(item, parameters.source, parameters.target, parameters.prefix, parameters.inplace, parameters.mirror) :
          _export(item, parameters.target, parameters.inplace, parameters.mirror), values, results, collection, table, id, CONCURRENT_SIZE, true, values.batch);

      }).catch(e => e ? ಠ_ಠ.Flags.error("Converting Error", e) : ಠ_ಠ.Flags.log("Converting Cancelled"));

    },

    delete: (id, collection, table, items) => {

      ಠ_ಠ.Display.confirm({
          id: "delete_results",
          target: ಠ_ಠ.container,
          message: `Please confirm that you wish to delete <strong>${items.length === 1 ? items[0].name : items.length}</strong>${items.length > 1 ? " Items" : ""} from Google Drive.`,
          action: "Delete"
        })
        .then(confirm => {

          if (confirm) {

            var totals = {
              files: 0,
              folders: 0,
              size: 0
            };

            _processItems("Deleting", item => new Promise(resolve => {

              ಠ_ಠ.Google.files.delete(item.id, _team, true).then(value => {

                if (value) {

                  /* <!-- Aggregate Results --> */
                  ಠ_ಠ.Google.folders.is(item.mimeType) ? totals.folders += 1 : totals.files += 1;
                  totals.size += item.size ? Number(item.size) : 0;
                  item.deleted = true;

                  resolve(item);

                }

              });

            }), null, items, collection, table, id).then(() => {

              /* <!-- Display the Results --> */
              if ((totals.folders + totals.file) > 1) ಠ_ಠ.Display.modal("results", {
                id: "delete_results",
                target: ಠ_ಠ.container,
                title: "Deletion Results",
                folders: totals.folders,
                files: totals.files,
                size: totals.size,
              });

            });

          }
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Deletion Error", e) : ಠ_ಠ.Flags.log("Deletion Cancelled"));

    },

    detag: (id, collection, table, items, parameters) => {

      ಠ_ಠ.Display.confirm({
          id: "remove_Tag",
          target: ಠ_ಠ.container,
          message: `Please confirm that you wish to remove the <strong>${parameters.tag}</strong> tag from <strong>${items.length === 1 ? items[0].name : items.length}</strong>${items.length > 1 ? " Items." : ""}`,
          action: "Remove"
        })
        .then(confirm => {
          if (confirm) _processItems("De-Tagging", item => new Promise(resolve => {

            var _private = item.appProperties && item.appProperties[parameters.tag],
              _properties = _private ? item.appProperties : item.properties;
            _properties[parameters.tag] = null;
            var _data = _private ? {
              appProperties: _properties
            } : {
              properties: _properties
            };
            ಠ_ಠ.Google.update(item.id, _data, _team).then(updated => {
              item.needs_Review = needsReview(item);
              resolve(updated);
            });

          }), null, items, collection, table, id);

        }).catch(e => e ? ಠ_ಠ.Flags.error("De-Tagging Error", e) : ಠ_ಠ.Flags.log("De-Tagging Cancelled"));

    },

    remove: (id, collection, table, results) => {
      _.each(results, result => collection.remove(collection.by("id", result.id)));
      table.update();
    },

    star: (id, collection, table, items) => {

      var _star = () => {

        _processItems(item => `${item && item.star ? "Un-" : ""}Starring`, item => new Promise(resolve => {

          var _star = !item.star;
          ಠ_ಠ.Google.update(item.id, {
            starred: _star
          }, _team).then(updated => {
            item.star = _star;
            resolve(updated);
          });

        }), null, items, collection, table, id);

      };

      if (items.length == 1) { /* <!-- No Need to confirm --> */

        _star();

      } else {

        ಠ_ಠ.Display.confirm({
            id: "star_results",
            target: ಠ_ಠ.container,
            message: "Please confirm that you want to star " + items.length + " Items.",
            action: "Star"
          })
          .then(confirm => confirm ? _star() : false)
          .catch(e => e ? ಠ_ಠ.Flags.error("Starring Error", e) : ಠ_ಠ.Flags.log("Starring Cancelled"));

      }

    },

    tag: (id, collection, table, items, parameters) => {

      var _decode = values => ({
        name: _.find(values, v => v.name == "name") ? _.find(values, v => v.name == "name").value : null,
        value: _.find(values, v => v.name == "value") ? _.find(values, v => v.name == "value").value : null,
        remove: !!(_.find(values, v => v.name == "remove")),
        private: !!(_.find(values, v => v.name == "private"))
      });

      var _id = "tag_results",
        _actions = items.length > 1 ? [{
          text: "Save",
          handler: _dialogSaveHandler(_id, "Tag", "tag", TYPE_TAG, _decode)
        }] : [],
        _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
        _tag = ಠ_ಠ.Display.modal("tag", {
          id: _id,
          target: ಠ_ಠ.container,
          title: `Tag <strong class="text-secondary">${ಠ_ಠ.Display.commarise(items.length)}</strong> Item${items.length > 1 ? "s" : ""}`,
          instructions: ಠ_ಠ.Display.doc.get("TAG_INSTRUCTIONS"),
          state: parameters ? {
            name: parameters.name,
            value: parameters.value
          } : state && state.tag ? state.tag : null,
          shortcuts: _dialog_Shortcuts.tag,
          validate: values => {
            values = _decode(values);
            return values.name && (values.value || values.remove) && (values.name.length + (values.remove ? 0 : values.value.length)) <= 124;
          },
          actions: _actions,
          handlers: {
            clear: _dialog.handlers.clear,
            populate: (target, dialog) => {
              var _populate = target.data("populate");
              if (_populate) {
                var _name = _populate.split("|")[0],
                  _value = _populate.split("|")[1];
                if (_value === "@@NOW") _value = new Date().toISOString().split("T")[0];
                dialog.find("#tagName").val(_name) && dialog.find("#tagValue").val(_value);
              }
            }
          }
        }, dialog => {
          autosize(dialog.find("textarea.resizable"));

          /* <!-- Disabled the Value Text Box if Remove is checked --> */
          dialog.find("#tagRemove").on("change", e => {
            $("#tagValue").prop("disabled", e.currentTarget.checked);
          });

        });

      _tag.then(values => {

        if (values) {

          values = _decode(values);
          var _properties = {};
          _properties[values.name] = values.remove ? null : values.value;
          var _data = values.private ? {
            appProperties: _properties
          } : {
            properties: _properties
          };

          _processItems("Tagging", (item, parameters) => new Promise(resolve => {

            ಠ_ಠ.Google.update(item.id, parameters, _team).then(() => {
              if (!item[values.private ? "appProperties" : "properties"]) item[values.private ? "appProperties" : "properties"] = {};
              item[values.private ? "appProperties" : "properties"][values.name] = values.value;
              item.needs_Review = needsReview(item);
              resolve(item);
            });

          }), _data, items, collection, table, id);

        }

      }).catch(e => e ? ಠ_ಠ.Flags.error("Tagging Error", e) : ಠ_ಠ.Flags.log("Tagging Cancelled"));

    },

    tally: (id, collection, table, items) => {

      var _name = "Tally @ " + new Date().toLocaleTimeString();

      /* <!-- Measure the Performance (start) --> */
      ಠ_ಠ.Flags.time(_name);

      /* <!-- Clear the Tally Cache --> */
      _tallyCache = {};

      var _isFile = ಠ_ಠ.Google.folders.check(false),
        _isFolder = ಠ_ಠ.Google.folders.check(true),
        _count = (items, results) => {

          /* <!-- Update File Count & Sizes --> */
          results.files += _.reduce(items, (count, item) => _isFile(item) ? count + 1 : count, 0);
          results.size += _.reduce(items, (total, item) => total + (item.size ? parseInt(item.size) : 0), 0);
          results.folders += _.reduce(items, (count, item) => _isFolder(item) ? count + 1 : count, 0);

          return results;

        },
        _aggregate = (values, results) => {

          if (results.folders || values.folders) results.folders += values.folders;
          results.files += values.files;
          results.size += values.size;
          if (results.mime && values.mime) _.each(values.mime, (mimes, mime) => {
            if (results.mime[mime]) {
              _aggregate(mimes, results.mime[mime]);
            } else {
              results.mime[mime] = mimes;
            }
          });

          return results;
        },
        _update = (items, results) => {

          /* <!-- Update Map of Size/Totals by Mime --> */
          _.each(_.groupBy(items, "mimeType"), (mimeItems, mime) => {
            if (!results.mime[mime]) {
              results.mime[mime] = _count(mimeItems, {
                files: 0,
                size: 0
              });
            } else {
              _count(mimeItems, results.mime[mime]);
            }
          });

          /* <!-- Update Map of Folder Parent IDs and Size/Totals --> */
          _.each(items, item => _.each(item.parents, parent => {
            if (!_tallyCache[parent]) _tallyCache[parent] = {
              files: 0,
              folders: 0,
              size: 0
            };
            _tallyCache[parent][_isFolder(item) ? "folders" : "files"] += 1;
            _tallyCache[parent].size += (item.size ? parseInt(item.size) : 0);
            if (_isFolder(item) && _tallyCache[item.id]) _aggregate(_tallyCache[item.id], _tallyCache[parent]);
          }));

          return _count(items, results);

        };

      var _tally = (folder_ids, results) => {

        return new Promise(resolve => {

          var _complete = items => {

            var _folders = _.filter(items, _isFolder);

            /* <!-- Recursive Iteration Function --> */
            var _iterate_batch = (batch, batches, complete) => {

              if (batch) {
                _tally(batch, {
                  files: 0,
                  folders: 0,
                  size: 0,
                  mime: {}
                }).then(values => {
                  _aggregate(values, results);
                  _iterate_batch(batches.shift(), batches, complete);
                });
              } else {
                complete();
              }

            };

            /* <!-- Update File & Folder Counts/Sizes before Resolving --> */
            var _finish = () => _update(items, results) && resolve(results);

            if (_folders && _folders.length > 0) {

              /* <!-- Batch these Child IDs into Arrays with length not longer than BATCH_SIZE --> */
              var _batches = _.chain(_folders).map(folder => folder.id).groupBy((v, i) => Math.floor(i / BATCH_SIZE)).toArray().value();
              _iterate_batch(_batches.shift(), _batches, () => _finish());

            } else {

              _finish();

            }

          };

          ಠ_ಠ.Google.folders.children(folder_ids, true, _team)
            .then(_complete)
            .catch(e => ಠ_ಠ.Flags.error("Processing Tally for Google Drive Folders: " + JSON.stringify(folder_ids), e ? e : "No Inner Error"));

        });

      };

      /* <!-- Check initial folder first --> */
      var __files = _.filter(items, _isFile),
        __folders = _.filter(items, _isFolder),
        _totals = _update(__files, {
          files: 0,
          folders: __folders.length,
          size: 0,
          mime: {}
        });

      _processItems("Tallying", item => new Promise(resolve => {

        _tally(item.id, {
          files: 0,
          folders: 0,
          size: 0,
          mime: {}
        }).then(results => {

          /* <!-- Aggregate Results --> */
          _aggregate(results, _totals);

          /* <!-- Format Results --> */
          results.empty = !!(!results.files && !results.folders && !results.size);

          /* <!-- Save Results (for filtering etc) --> */
          item.results = results;

          resolve(item);

        });

      }), null, __folders, collection, table, id).then(() => {

        /* <!-- Measure the Performance (end) --> */
        ಠ_ಠ.Flags.time(_name, true);

        /* <!-- Debug Log Results --> */
        ಠ_ಠ.Flags.log("TALLY TOTAL RESULTS:", _totals);

        /* <!-- Debug Log Results --> */
        if (!_search) _tallyCache[folder.id] = _totals;

        /* <!-- Filter and sort Mime Types --> */
        var _mimes = _.sortBy(_.reject(_.map(_totals.mime, (value, mime) => {
          value.mime = mime;
          return value;
        }), item => !item.files && !item.size), "size").reverse();

        /* <!-- Display the Results --> */
        ಠ_ಠ.Display.modal("results", {
          id: "tally_results",
          target: ಠ_ಠ.container,
          title: "Tally Results",
          folders: _totals.folders,
          files: _totals.files,
          size: _totals.size,
          mime: _mimes
        });
      });

    },

    rename: (id, collection, table, items) => {

      var _decode = values => ({
        names: _.find(values, v => v.name == "names") ? _.find(values, v => v.name == "names").value.split(/\r?\n/) : null,
      });

      var _id = "rename_results",
        _names = _.map(items, item => item.name).join("\r\n").trim(),
        _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
        _valid = values => values && values.names && values.names.length == items.length,
        _rename = ಠ_ಠ.Display.modal("rename", {
          id: _id,
          target: ಠ_ಠ.container,
          title: `Rename <strong class="text-secondary">${ಠ_ಠ.Display.commarise(items.length)}</strong> Item${items.length > 1 ? "s" : ""}`,
          instructions: ಠ_ಠ.Display.doc.get("RENAME_INSTRUCTIONS"),
          validate: values => _valid(_decode(values)),
          state: {
            names: _names
          },
          actions: [],
          handlers: {
            clear: _dialog.handlers.clear,
            replace: _dialog.handlers.replace,
          }
        }, dialog => {
          autosize(
            dialog.find("textarea.resizable")
          );
        });

      _rename.then(values => {

        values = _decode(values);

        if (_valid(values)) {

          var _name = "__NEW_NAME",
              _candidates = [];
          _.each(values.names, (name, index) => {
            if (items[index].name != name) {
              collection.by("id", items[index].id)[_name] = name;
              _candidates.push(items[index]);
            }
          });

          _processItems("Renaming", item => new Promise(resolve => {
            
            ಠ_ಠ.Google.update(item.id, {name: item[_name]}, _team).then(updated => {
              item.name = updated.name;
              delete item[_name];
              resolve(item);
            });

          }), true, _candidates, collection, table, id);

        }

      }).catch(e => e ? ಠ_ಠ.Flags.error("Renaming Error", e) : ಠ_ಠ.Flags.log("Renaming Cancelled"));

    },

    test: (id, collection, table, items, parameters) => {

      var _count = 0;
      _processItems("Testing", () => new Promise((resolve, reject) => DELAY(_.random(500, 1500)).then(() => {
            _count += 1;
            if (_.random(800, 3000) > 1000) {
              resolve(_.random(900, 2000) > 1000);
            } else {
              reject();
            }
          })), parameters, items, collection, table, id,
          parameters && parameters.concurrent ? parameters.concurrent : 1,
          true, parameters && parameters.batch ? parameters.batch : null)
        .then(() => ಠ_ಠ.Display.modal("results", {
          id: "test_results",
          target: ಠ_ಠ.container,
          title: "Test Results",
          files: _count
        }));

    },

  };
  /* <!-- Item Processing --> */

  /* <!-- Initial Calls --> */
  _showFolder(folder, target);

  /* <!-- External Visibility --> */
  return {

    id: () => folder.id,

    name: () => folder.name,

    folder: () => folder,

    search: id => _searchFolder(id ? id : folder.id),

    searchTag: (name, value) => _searchTag(name, value),

    audit: id => _items.process(_items.audit, id),

    tag: (id, name, value) => _items.process(_items.tag, id, null, name ? {
      name: name,
      value: value
    } : null),

    clone: id => _items.process(_items.clone, id, items => _.reject(items, item => ಠ_ಠ.Google.folders.is(item.mimeType))),

    convert: id => _items.process(_items.convert, id, items => _.reject(items, item => ಠ_ಠ.Google.folders.is(item.mimeType))),

    close: id => _closeSearch(id),

    delete: id => _items.process(_items.delete, id),

    rename: id => _items.process(_items.rename, id),

    filter: id => _getTable().filter("id", id),

    tally: {

      get: () => _tallyCache,

      run: id => _items.process(_items.tally, id),

    },

    remove: id => _items.process(_items.remove, id),

    detag: (id, tag) => _items.process(_items.detag, id, items => _.filter(items, item => item.properties[tag] || item.appProperties[tag]), {
      tag: tag
    }),

    table: () => _getTable(),

    star: id => _items.process(_items.star, id),

    refresh: () => _showFolder(folder, target),

    test: (concurrent, batch, log) => {
      var parameters = {};
      if (concurrent) parameters.concurrent = concurrent;
      if (batch) parameters.batch = batch;
      if (log) parameters.log = true;
      _items.process(_items.test, null, items => _.reject(items, item => ಠ_ಠ.Google.folders.is(item.mimeType)), parameters);
    }

  };
  /* <!-- External Visibility --> */

};