Gradesheet = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      property: {
        name: "EDUC-IO-CLASSES",
        value: "GRADESHEET",
      },
      format: "YYYY-MM-DD",
    },
    FN = {};
  
  const SCHEMAS = [
    {
      key: "CLASSES_SCHEMA_VERSION",
      value : 1,
      keys: {
        classroom : "CLASSROOM",
        classwork : "CLASSWORK",
        topic : "TOPIC",
        student : "STUDENT",
      },
      values : {
        classwork : (classroom, classwork) => `${classroom.$id}_${classwork.$id}`
      }
    },
    {
      key: "CLASSES_SCHEMA_VERSION",
      value : 2,
      keys: {
        classroom : "C",
        classwork : "W",
        topic : "T",
        student : "S",
      },
      values : {
        classwork : (classroom, classwork) => `${classroom.$id}_${classwork.$id}`
      }
    }
  ];
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var _schema;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.titles = {
    
    name : since => `Classes | Gradesheet${since ? ` [${factory.Dates.parse(since).format(options.format)}]` : ""}`,
    
    tab : number => `Grades | ${factory.Dates.now().format(options.format)}${number ? ` | ${number}` : ""}`
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Row Functions --> */
  FN.row = row => _.tap({
    classroom: options.functions.populate.get(row.classroom),
    classwork: options.functions.populate.get(row.classwork, "classwork"),
  }, value => value.key = `${value.classroom.$$created}_${value.classroom.name}_${value.classwork.$topic || "*"}_${value.classwork.$$created}`);

  FN.rows = () => _.map(options.state.session.table.table().find("tbody tr[data-id][data-parent]").toArray(), el => {
    var _el = $(el);
    return FN.row({
      classroom: _el.data("parent"),
      classwork: _el.data("id"),
    });
  });
  /* <!-- Row Functions --> */

  /* <!-- Helper Functions --> */
  FN.helpers = sheetId => ({
    grid: factory.Google_Sheets_Grid({
      sheet: sheetId
    }),
    meta: factory.Google_Sheets_Metadata({
      sheet: sheetId,
      visibility: "PROJECT"
    }, factory),
    format: factory.Google_Sheets_Format({
      sheet: sheetId
    }, factory),
    properties: factory.Google_Sheets_Properties({
      sheet: sheetId
    }),
    notation: factory.Google_Sheets_Notation(),
  });
  /* <!-- Helper Functions --> */

  /* <!-- Sheet Functions --> */
  FN.sheet = {

    create : (name, tab) => factory.Google.sheets.create(name, tab, null, [_.pick(_schema, "key", "value")])
      .then(sheet => ({
        sheet: sheet,
        helpers: FN.helpers(sheet.sheets[0].properties.sheetId),
      })),
    
    add : (id, tab, sheet) => factory.Google.sheets.tab(id, sheet, tab).then(sheet => ({
        sheet: sheet,
        helpers: FN.helpers(sheet.sheets[sheet.sheets.length - 1].properties.sheetId),
      })),
    
    update: (value, grid, values, input) => factory.Google.sheets.update(value.sheet.spreadsheetId, grid, values, input)
      .then(response => {
        factory.Flags.log(`Updating Values for Sheet: ${value.sheet.spreadsheetId}`, response);
        value.response = response;
        return value;
      }),

    batch: (value, values, reply) => values && values.length > 0 ? factory.Google.sheets.batch(value.sheet.spreadsheetId, values, reply, reply)
      .then(response => {
        factory.Flags.log(`Batch Update for Sheet: ${value.sheet.spreadsheetId}`, response);
        value.response = response;
        return value;
      }) : Promise.resolve(value),

    values: (value, range, all) => factory.Google.sheets.get(value.sheet.spreadsheetId, all, range)
      .then(response => {
        factory.Flags.log(`Values for Sheet: ${value.sheet.spreadsheetId}`, response);
        value.response = response;
        return value;
      })
  };
  /* <!-- Sheet Functions --> */

  FN.metadata = {

    value: (key, value) => ({
      key: key,
      value: value,
    }),

    columns: (helpers, column, key, value) => ({
      "createDeveloperMetadata": helpers.meta.columns(column, column + 1).tag(FN.metadata.value(key, value))
    }),

    rows: (helpers, row, key, value) => ({
      "createDeveloperMetadata": helpers.meta.rows(row, row + 1).tag(FN.metadata.value(key, value))
    }),

    sheet: (helpers, key, value) => ({
      "createDeveloperMetadata": helpers.meta.sheet().tag(FN.metadata.value(key, value))
    }),
    
  };

  /* <!-- General Functions --> */
  FN.resize = (value, sheet) => FN.sheet.batch(value, _.reduce(sheet.data[0].columnMetadata, (memo, column, index) => {

    /* <!-- Only Process Classwork Columns --> */
    if (column.developerMetadata && _.find(column.developerMetadata, meta => meta.metadataKey == _schema.keys.classwork) && memo.headers[2].values[index].formattedValue) {

      var _title_Width = memo.headers[0].values[index].formattedValue ? column.pixelSize : 0,
        _topic_Width = memo.headers[1].values[index].formattedValue ? column.pixelSize : 0,
        _title_Merge = memo.headers[0].values[index].merge,
        _topic_Merge = memo.headers[1].values[index].merge,
        _length = memo.headers[2].values[index].formattedValue.length;

      if (_title_Width && _title_Merge) _title_Width = Math.ceil(_title_Width / (_title_Merge.endColumnIndex - _title_Merge.startColumnIndex));
      if (_topic_Width && _topic_Merge) _topic_Width = Math.ceil(_topic_Width / (_topic_Merge.endColumnIndex - _topic_Merge.startColumnIndex));

      /* <!-- One Line = 30 width, two lines = 50 width & three lines = 60 width --> */
      var _width = Math.max(_length > 30 ? 60 : _length > 20 ? 50 : 30, _title_Width, _topic_Width);
      if (_width < column.pixelSize) memo.requests.push(value.helpers.format.dimension(value.helpers.grid.columns(index, index + 1).dimension(_width)));

    }
    return memo;

  }, {
    headers: _.map(_.first(sheet.data[0].rowData, 3), (row, index) => {
      var _merges = _.filter(sheet.merges, merge => merge.startRowIndex == index);
      _.each(row.values, (cell, index) => cell.merge = _.find(_merges, merge => merge.startColumnIndex == index));
      return row;
    }),
    requests: [],
  }).requests);

  FN.merge = (value, row_start, row_end) => (memo, heading, index, all) => {

    /* <!-- Merge Back to Last Value --> */
    if (index > 0 && !all[index - 1] && (heading || index == all.length - 1))
      memo.values.push(value.helpers.format.merge(
        value.helpers.grid.range(row_start, row_end, value.add.first + (memo.last || 0), value.add.first + index +
          (index == all.length - 1 && !heading ? 1 : 0))));
    if (heading) memo.last = index;
    return memo;

  };

  FN.border = (value, rows, background) => (memo, heading, index, all) => {

    /* <!-- Set Last Column Border for each Row --> */
    if (index == all.length - 1 || (heading != all[index + 1] && (!heading || all[index + 1]))) {
      var _col = value.add.first + index;

      _.each(_.isArray(rows) ? rows : [rows],
        row => memo.values.push(value.helpers.format.update(
            value.helpers.grid.range(row.start, row.end, _col, _col + 1))
          .borders(null, null, null, value.helpers.format.border(row.style || "SOLID", row.colour || "white"))));

      if (background) {
        if (memo.background) memo.values.push(
          value.helpers.format.cells(value.helpers.grid.range(background.start, background.end, memo.last + 1, _col + 1), [
            value.helpers.format.background(background.colour || "lightgrey"),
          ]));
        memo.background = !memo.background;
      }

      if (memo.last !== undefined) memo.last = _col;
    }
    return memo;

  };

  FN.process = (value, rows) => _.reduce(rows, (memo, row) => {

    factory.Flags.log("Reducing Gradesheet Row:", row);

    /* <!-- Only Process Classwork with Submissions --> */
    if (row.classwork.$submissions && row.classwork.$submissions.length > 0) {

      var _column = memo.first + memo.length;

      /* <!-- Add Classroom Name or Null is the classroom is the same as the last iteration --> */
      memo.values[0].push(row.classroom.$id != memo.last.classroom ?
        (
          memo.metadata.push(FN.metadata.columns(value.helpers, _column, _schema.keys.classroom, row.classroom.$id.toString())),
          memo.last.classroom = row.classroom.$id,
          row.classroom.name
        ) : null);

      /* <!-- Add Topic Name or Null is the topic is the same as the last iteration --> */
      memo.values[1].push(row.classwork.topic && row.classwork.topic.id != memo.last.topic ?
        (
          memo.metadata.push(FN.metadata.columns(value.helpers, _column, _schema.keys.topic, row.classwork.topic.id.toString())),
          memo.last.topic = row.classwork.topic.id,
          row.classwork.$topic
        ) : null);

      /* <!-- Push Metadata Keys into holding arrays --> */
      memo.metadata.push(FN.metadata.columns(value.helpers, _column, _schema.keys.classwork, _schema.values.classwork(row.classroom, row.classwork)));

      /* <!-- Column Indexing --> */
      if (!memo.columns[row.classroom.$id]) memo.columns[row.classroom.$id] = {};
      memo.columns[row.classroom.$id][row.classwork.$id] = _column;

      /* <!-- Add Classwork Name --> */
      memo.values[2].push(memo.truncate(row.classwork.title));
      memo.notes.push({
        "updateCells": {
          "rows": [{
            "values": [{
              note: `${row.classwork.title}\n\nCreated: ${row.classwork.created}${row.classwork.created != row.classwork.updated ? `\nUpdated: ${row.classwork.updated}${row.classwork.due ? `\nDue: ${row.classwork.due.toDate().toLocaleString()}` : ""}` : ""}`
            }]
          }],
          range: value.helpers.grid.range(2, 3, _column, _column + 1),
          fields: "note"
        }
      });

      /* <!-- Add Formulas --> */
      memo.values[3].push(`=IF(COUNT(INDIRECT("R${memo.data.row + 1}C"&COLUMN()&":C"&COLUMN(),false))>0,
  ROUND(AVERAGE(INDIRECT("R${memo.data.row + 1}C"&COLUMN()&":C"&COLUMN(),false)),1),)`);
      memo.values[4].push(`=IF(COUNT(INDIRECT("R${memo.data.row + 1}C"&COLUMN()&":C"&COLUMN(),false))>0,
  ROUND(STDEVP(INDIRECT("R${memo.data.row + 1}C"&COLUMN()&":C"&COLUMN(),false)),1),)`);

      /* <!-- Add Max Scores --> */
      memo.values[5].push(row.classwork.points || "");

      memo.length += 1;

      /* <!-- Notify Progress back to Loader --> */
      factory.Main.event(options.functions.events.gradesheet.progress, factory.Main.message(memo.length, "assignment", "assignments", "processed"));

    }

    return memo;
  }, {
    first: 5,
    column: 5,
    data: {
      row: 6,
    },
    last: {
      classroom: null,
      topic: null,
    },
    length: 0,
    values: [
      [], /* <!-- Classroom Names --> */
      [], /* <!-- Topic Names --> */
      [], /* <!-- Classwork Names --> */
      [], /* <!-- Average Formulas --> */
      [], /* <!-- SD Formulas --> */
      [], /* <!-- Max Scores --> */
    ],
    truncate: options.functions.common.truncate(26, "…"),
    metadata: [],
    columns: {},
    notes: [],
  });

  FN.students = (value, rows, start) => _.reduce(rows, (memo, row) => {

    _.each(row.classwork.$submissions, submission => {

      if (!memo.students[submission.userId]) memo.students[submission.userId] = {
        row: memo.row++,
        requests: [{
          "createDeveloperMetadata": value.helpers.meta.rows(memo.row - 1, memo.row).tag({
            key: _schema.keys.student,
            value: submission.userId,
          })
        }, {
          "updateCells": {
            "rows": [{
              "values": [{
                "userEnteredValue": {
                  "stringValue": submission.userId
                }
              }, {
                "userEnteredValue": {
                  "stringValue": submission.user.text
                }
              }, {
                "userEnteredValue": {
                  "formulaValue": `=COUNTIF(${memo.col}${memo.row}:${memo.row}, "<>")`,
                }
              }, {
                "userEnteredValue": {
                  "formulaValue": `=IFERROR(AVERAGE(ARRAYFORMULA(IF(${memo.col}${memo.row}:${memo.row} <> "", IF(${memo.col}${memo.row}:${memo.row} <= ${memo.col}$6:$6, ${memo.col}${memo.row}:${memo.row}/${memo.col}$6:$6,1),))), "")`
                }
              }, {
                "userEnteredValue": {
                  "formulaValue": `=IFERROR(SPARKLINE(ARRAYFORMULA(IF(${memo.col}${memo.row}:${memo.row} <> "", ${memo.col}${memo.row}:${memo.row}-IF(${memo.col}$4:$4>${memo.col}$6:$6,${memo.col}$6:$6,${memo.col}$4:$4),)), {"charttype","column";"axis", true;"axiscolor", "eeeeee";"color","green";"negcolor","red";"ymin",MIN(0,MIN(ARRAYFORMULA(IF(${memo.col}${memo.row}:${memo.row} <> "", ${memo.col}${memo.row}:${memo.row}-${memo.col}$4:$4,))));"ymax",MAX(0,MAX(ARRAYFORMULA(IF(${memo.col}${memo.row}:${memo.row} <> "", ${memo.col}${memo.row}:${memo.row}-${memo.col}$4:$4,))))}), "")`,
                }
              }]
            }],
            range: value.helpers.grid.range(memo.row - 1, memo.row, 0, 5),
            fields: "userEnteredValue.stringValue,userEnteredValue.formulaValue"
          }
        }],
      };

      /* <!-- Only Add Grades for work that has beenhanded in / returned --> */
      if (submission.state == "TURNED_IN" || submission.state == "RETURNED" ||
        (submission.assignedGrade !== null && submission.assignedGrade !== undefined) ||
        (submission.draftGrade !== null && submission.draftGrade !== undefined)) {

        var _row = memo.students[submission.userId],
          _col = value.add.columns[row.classroom.$id][row.classwork.$id],
          _fields = ["userEnteredValue.numberValue"],
          _value = {
            "userEnteredValue": {
              "numberValue": submission.assignedGrade != null && submission.assignedGrade != undefined ?
                submission.assignedGrade : submission.draftGrade
            }
          };

        var _bold = submission.state == "RETURNED" ? true : null,
          _italic = (submission.assignedGrade == null || submission.assignedGrade == undefined) ? true : null,
          _fore = (submission.assignedGrade == null || submission.assignedGrade == undefined) ? "verydarkgrey" : null,
          _back = null,
          _borders = null;

        if (submission.late) {

          /* <!-- Add Note --> */
          var _handedIn = _.last(_.filter(submission.submissionHistory, event => event.stateHistory && event.stateHistory.state == "TURNED_IN"));
          _value.note = `LATE${row.classwork.due && _handedIn ? ` by ${humanizeDuration(row.classwork.due.diff(_handedIn.stateHistory.stateTimestamp), {largest: 3})}` : ""}`;
          _fields.push("note");

          /* <!-- Set Background Colour --> */
          _back = "lightred";

          /* <!-- Set the Borders --> */
          var _red = value.helpers.format.border("SOLID_THICK", "red");
          _borders = value.helpers.format.borders(_red, _red, _red, _red);

        }

        /* <!-- Set all the formats --> */
        _row.requests.push(value.helpers.format.cells(
          value.helpers.grid.range(_row.row, _row.row + 1, _col, _col + 1), [
            value.helpers.format.align.vertical("MIDDLE"),
            value.helpers.format.align.horizontal("CENTER"),
          ]
          .concat(_back ? [value.helpers.format.background(_back)] : [])
          .concat(_bold || _italic || _fore ? [value.helpers.format.text(_fore, null, _bold, _italic)] : [])
          .concat(_borders ? [_borders] : [])
        ));

        /* <!-- Add Update Request to Student Object --> */
        _row.requests.push({
          "updateCells": {
            "rows": [{
              "values": [_value]
            }],
            range: value.helpers.grid.range(_row.row, _row.row + 1, _col, _col + 1),
            fields: _fields.join(",")
          }
        });

      }

      memo.length += 1;

      factory.Main.event(options.functions.events.gradesheet.progress, factory.Main.message(memo.length, "submission", "submissions", "processed"));

    });

    return memo;

  }, {
    students: {},
    row: start,
    col: "F",
    length: 0
  });
  /* <!-- General Functions --> */

  /* <!-- Public Functions --> */
  FN.create = (name, tab, id, sheet) => (id ?  FN.sheet.add(id, tab, sheet) : FN.sheet.create(name, tab))
    .then(value => FN.sheet.update(value, value.helpers.notation.grid(0, 5, 0, 4, true,
      value.sheet.sheets[value.sheet.sheets.length - 1].properties.title), [
        ["Classrooms ⇨", null, null, null, null],
        ["Students ⬇", null, null, null, "Topics ➡"],
        ["ID", "Name", "Graded⬇", "Average⬇", "Classwork ➡"],
        [null, null, "=COUNTIF(F4:4, \"<>\")", "=IFERROR(AVERAGEIF(D7:D, \">0\"),)", "Averages ➡"],
        [null, null, null, null, "Standard Deviations ➡"],
        [null, null, null, null, "Points ➡"]
      ], "USER_ENTERED")
      .then(() => FN.sheet.batch(value, [

        /* <!-- Set First Column to Dull Grey --> */
        value.helpers.format.cells(value.helpers.grid.columns(0, 1).range(), [
          value.helpers.format.background("lightgrey"),
          value.helpers.format.align.horizontal("CENTER"),
          value.helpers.format.align.vertical("MIDDLE"),
          value.helpers.format.text("darkgrey", 8, true)
        ]),

        /* <!-- Set Top Three Columns as Headers --> */
        value.helpers.format.cells(value.helpers.grid.rows(0, 3).range(), [
          value.helpers.format.background("black"),
          value.helpers.format.align.horizontal("CENTER"),
          value.helpers.format.align.vertical("MIDDLE"),
          value.helpers.format.text("white", 11, true)
        ]),

        value.helpers.format.cells(value.helpers.grid.rows(3, 6).range(), [
          value.helpers.format.background("black"),
          value.helpers.format.align.horizontal("CENTER"),
          value.helpers.format.align.vertical("MIDDLE"),
          value.helpers.format.text("white", 8, true)
        ]),

        /* <!-- Row 1 Classroom | Name Headers --> */
        value.helpers.format.cells(value.helpers.grid.rows(0, 1).range(), [
          value.helpers.format.text("mediumyellow", 12, true)
        ]),

        /* <!-- Column & Row 1 / 2 Main Headers --> */
        value.helpers.format.cells(value.helpers.grid.range(0, 2, 0, 1), [
          value.helpers.format.text("yellow", 14, true)
        ]),

        /* <!-- Row 3 Classwork Headers --> */
        value.helpers.format.cells(value.helpers.grid.range(2, 3, 4, 26), [
          value.helpers.format.text("white", 8, true, false, 75),
          value.helpers.format.wrap("WRAP"),
          value.helpers.format.align.vertical("BOTTOM"),
          value.helpers.format.align.horizontal("CENTER"),
        ]),

        /* <!-- Set Wrapping and Text Alignment for Columns 3 --> */
        value.helpers.format.cells(value.helpers.grid.columns(0, 4).range(), [
          value.helpers.format.wrap("WRAP"),
          value.helpers.format.align.vertical("MIDDLE")
        ]),

        /* <!-- Set Wrapping and Text Alignment for Rows 1 / 2 --> */
        value.helpers.format.cells(value.helpers.grid.rows(0, 2).range(), [
          value.helpers.format.wrap("OVERFLOW_CELL"),
          value.helpers.format.align.vertical("MIDDLE")
        ]),

        /* <!-- Right Align Main Header --> */
        value.helpers.format.cells(value.helpers.grid.range(0, 1, 0, 1), [
          value.helpers.format.align.horizontal("RIGHT")
        ]),

        /* <!-- Right Align Sub-Headers --> */
        value.helpers.format.cells(value.helpers.grid.range(1, 6, 4, 5), [
          value.helpers.format.align.horizontal("RIGHT")
        ]),

        /* <!-- Set Text Alignment for Column 3 & 4  | Graded & Student / Average --> */
        value.helpers.format.cells(value.helpers.grid.columns(2, 4).range(), [
          value.helpers.format.align.horizontal("CENTER"),
          value.helpers.format.align.vertical("MIDDLE")
        ]),

        /* <!-- Set Format/Text Alignment for Graded & Student / Average --> */
        value.helpers.format.cells(value.helpers.grid.range(2, 3, 2, 4), [
          value.helpers.format.align.vertical("BOTTOM"),
          value.helpers.format.text("lightgrey", 9, true)
        ]),

        /* <!-- Set Format for Graded Count --> */
        value.helpers.format.cells(value.helpers.grid.range(3, 4, 2, 3), [
          value.helpers.format.background("yellow"),
          value.helpers.format.text("black", 11, true)
        ]),
    
        /* <!-- Set Format for Student / Average --> */
        value.helpers.format.cells(value.helpers.grid.range(3, 4, 3, 4), [
          value.helpers.format.background("lighthotpink"),
          value.helpers.format.text("black", 10, true)
        ]),

        /* <!-- Merge Main Headers --> */
        value.helpers.format.merge(value.helpers.grid.range(0, 1, 0, 4)),
        value.helpers.format.merge(value.helpers.grid.range(1, 2, 0, 3)),

        value.helpers.format.merge(value.helpers.grid.range(2, 6, 0, 1)), /* <!-- Student / ID --> */
        value.helpers.format.merge(value.helpers.grid.range(2, 6, 1, 2)), /* <!-- Student / Name --> */
        value.helpers.format.merge(value.helpers.grid.range(3, 6, 2, 3)), /* <!-- Graded / Count --> */
        value.helpers.format.merge(value.helpers.grid.range(3, 6, 3, 4)), /* <!-- Student / Average --> */

        /* <!-- Freeze Heading Rows & Student Columns --> */
        value.helpers.properties.update([
          value.helpers.properties.grid.frozen.rows(6),
          value.helpers.properties.grid.frozen.columns(5),
        ]),

        /* <!-- Resize and Hide first Column | ID --> */
        value.helpers.format.dimension(value.helpers.grid.columns(0, 1).dimension(150)),
        value.helpers.format.hide(value.helpers.grid.columns(0, 1).dimension()),

        /* <!-- Resize second Column | Name --> */
        value.helpers.format.dimension(value.helpers.grid.columns(1, 2).dimension(140)),

        /* <!-- Resize third Column | Graded --> */
        value.helpers.format.dimension(value.helpers.grid.columns(2, 3).dimension(50)),
    
        /* <!-- Resize fourth Column | Student / Average --> */
        value.helpers.format.dimension(value.helpers.grid.columns(3, 4).dimension(55)),

        /* <!-- Resize fifth Column | Overall --> */
        value.helpers.format.dimension(value.helpers.grid.columns(5, 6).dimension(120)),

        /* <!-- Hide fifth & sixth Row (Standard Deviation / Max) --> */
        value.helpers.format.hide(value.helpers.grid.rows(4, 6).dimension()),

        /* <!-- Resize first and second Rows (Classroom / Topic Names) --> */
        value.helpers.format.dimension(value.helpers.grid.rows(0, 2).dimension(24)),

        /* <!-- Resize third Row (Classwork Names) --> */
        value.helpers.format.dimension(value.helpers.grid.rows(2, 3).dimension(90)),

        /* <!-- Resize fourth, fifth and sixth Rows (Numerical Data) --> */
        value.helpers.format.dimension(value.helpers.grid.rows(3, 6).dimension(20)),

      ])));
  
  FN.chunk = rows => {
        
        _schema = _.last(SCHEMAS);
        
        var _classwork =_.chain(rows).map(row => _schema.values.classwork(row.classroom, row.classwork)).uniq().value(),
            _classrooms = _.chain(rows).map(row => row.classroom.$id.toString()).uniq().value(),
            _topics = _.chain(rows).map(row => row.classwork.topic ? row.classwork.topic.id : "").compact().uniq().value(),
            _students = _.chain(rows)
              .map(row => row.classwork.$submissions ? _.pluck(row.classwork.$submissions, "userId") : [])
              .flatten()
              .uniq()
              .value();
       
        factory.Flags.log("Gradesheet Data ID Lengths", {
          classrooms : _classrooms.length,
          topics : _topics.length,
          classwork : _classwork.length,
          students : _students.length
        });
        
        var _lengths = {
          classrooms : (key => _.reduce(_classrooms, 
                          (memo, value) => memo + (value ? (value.length + key) : 0), 0))(_schema.keys.classroom.length) * 2,
          topics : (key =>  +_.reduce(_topics,
                          (memo, value) => memo + (value ? (value.length + key) : 0), 0))(_schema.keys.topic.length),
          classwork : (key => _.reduce(_classwork, 
                          (memo, value) => memo + (value ? (value.length + key) : 0), 0))(_schema.keys.classwork.length),
          students : (key => _.reduce(_students,
                          (memo, value) => memo + (value ? (value.length + key) : 0), 0))(_schema.keys.student.length),
        };
        
        _lengths.total = _.chain(_lengths).values().reduce((total, value) => total + value, 0).value();
        
        factory.Flags.log("Anticipated Meta Data Character Lengths", _lengths);
       
        var _max = {
          classwork : (27 * 26) - 5,
          metadata : 30000 - (_schema.key.length + _schema.value.toString().length),
        };
        
        if (_classwork.length > _max.classwork)
          factory.Flags.log(`Length of Classwork Columns (${_classwork.length}) greater than max allowed (${_max.classwork})`);
        
        if (_lengths.total > _max.metadata)
          factory.Flags.log(`Length of Metadata Characters (${_lengths.total}) greater than max allowed (${_max.metadata})`);
        
        /* <!-- Work out Approximate Chunk Sizes --> */
        var _chunk = 1;
    
        if (_classwork.length > _max.classwork) {
          
          _chunk = Math.ceil(_classwork.length / _max.classwork);
          var _prediction = chunk => _lengths.students + ((_lengths.classrooms + _lengths.topics + _lengths.classwork) / chunk),
              _predicted = _prediction(_chunk);
              
          while (_predicted > (_max.metadata * 0.9)) _predicted = _prediction(_chunk += 1);
          
          factory.Flags.log(`Splitting Classwork Rows (Col Span Limit) into ${_chunk} sheet${_chunk > 1 ? "s" : ""}`);
          
        } else if (_lengths.total > _max.metadata) {
          
          _chunk = Math.ceil(_lengths.total / (_max.metadata * 0.9));
          
          factory.Flags.log(`Splitting Classwork Rows (Metadata Limit) into ${_chunk} sheet${_chunk > 1 ? "s" : ""}`);
          
        }
    
        return _.chunk(rows, Math.ceil(rows.length / _chunk));
    
      };
  
  FN.populate = (value, index) => Promise.resolve(_.tap(value, value => {
        value.classes = _.chain(value.rows).map(row => row.classroom.$id).uniq().value();
        value.add = FN.process(value, value.rows);
        value.students = FN.students(value, value.rows, value.add.data.row).students;
      }))

      /* <!-- Update Header Cell Values --> */
      .then(value => FN.sheet.update(value, value.helpers.notation.grid(0, 5, value.add.first,
                      value.add.first + value.add.length, true, value.sheet.sheets[index].properties.title), value.add.values, "USER_ENTERED"))

      /* <!-- Add Sheet Metadata --> */
      .then(value => FN.sheet.batch(value, _.map(value.classes, classroom => FN.metadata.sheet(value.helpers,
                       _schema.keys.classroom, classroom.toString())).concat(value.add.metadata)))

      /* <!-- Update Header Cell Formats --> */
      .then(value => FN.sheet.batch(value, []

        /* <!-- Add Per-Topic Borders --> */
        .concat(_.reduce(value.add.values[1], FN.border(value, [{
          start: 1,
          end: 2,
          style: "DASHED"
        }, {
          start: 3,
          end: value.add.data.row,
          style: "DASHED"
        }, {
          start: value.add.data.row,
          end: 1000,
          style: "DASHED",
          colour: "darkslategrey"
        }], {
          start: value.add.data.row,
          end: 1000,
          colour: "verylightgrey",
        }), {
          values: [],
          last: value.add.first,
          background: false,
        }).values)

        /* <!-- Add Per-Classroom Borders --> */
        .concat(_.reduce(value.add.values[0], FN.border(value, [{
          start: 0,
          end: 2,
          style: "DOUBLE"
        }, {
          start: 3,
          end: value.add.data.row,
          style: "DOUBLE"
        }, {
          start: value.add.data.row,
          end: 1000,
          style: "DOUBLE",
          colour: "black"
        }]), {
          values: []
        }).values)

        /* <!-- Add Bottom Borders (to entire header rows) --> */
        .concat([

          /* <!-- Row 2 Headers Top/Bottom Border --> */
          value.helpers.format.update(value.helpers.grid.rows(1, 2).range())
          .borders(value.helpers.format.border("DASHED", "grey"), value.helpers.format.border("SOLID", "white")),

          /* <!-- Row 3 Headers Bottom Border --> */
          value.helpers.format.update(value.helpers.grid.range(2, 3, value.add.first, value.add.first + value.add.length))
          .borders(null, value.helpers.format.border("DOTTED", "white")),

        ])

      ))
  
       /* <!-- Add Merges --> */
      .then(value => FN.sheet.batch(value, []
                                    
        /* <!-- Merge Classroom Name Cells --> */
        .concat(_.reduce(value.add.values[0], FN.merge(value, 0, 1), {
          values: []
        }).values)

        /* <!-- Merge Topic Name Cells --> */
        .concat(_.reduce(value.add.values[1], FN.merge(value, 1, 2), {
          values: []
        }).values)
                                    
      ))

      /* <!-- Add Notes (as required) --> */
      .then(value => value.add.notes && value.add.notes.length > 0 ?
            FN.sheet.batch(value, value.add.notes) : value)

      /* <!-- Add student rows --> */
      .then(value => FN.sheet.batch(value, _.chain(value.students).values().pluck("requests").flatten().value()))

      /* <!-- Conditional Formats / Autosize Columns --> */
      .then(value => FN.sheet.batch(value, [
        value.helpers.format.conditional(value.helpers.grid.range(value.add.data.row, Math.max(1000, value.students.length + value.add.data.row), 2, 3))
        .gradient(),
        value.helpers.format.conditional(value.helpers.grid.range(value.add.data.row, Math.max(1000, value.students.length + value.add.data.row), 3, 4))
        .gradient(),
        value.helpers.format.cells(value.helpers.grid.range(3, Math.max(1000, value.students.length + value.add.data.row), 3, 4), [
          value.helpers.format.type("PERCENT", "0.00%"),
        ]),
        value.helpers.format.autosize(value.helpers.grid.columns(value.add.first, value.add.first + value.add.length).dimension()),
        value.helpers.format.cells(value.helpers.grid.range(2, 3, value.add.first, value.add.first + value.add.length), [
          value.helpers.format.align.horizontal("LEFT"),
        ])
      ]))
  
      .then(value => FN.sheet.values(value, 
        `${value.helpers.notation.sheet(value.sheet.sheets[index].properties.title)}!A1:3`, true))

      /* <!-- Adjust Autosize to Account for Merges --> */
      /* <!-- Index is Zero as we are just requesting values for a single sheet --> */
      .then(value => FN.resize(value, value.response.sheets[0]))

      /* <!-- Return sheet to caller to signify success --> */
      .then(value => value.sheet);
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    create: since => Promise.resolve(_.sortBy(FN.rows(), "key"))
    
      /* <!-- Check Sizes (will it fit into a spreadsheet, in terms of width and developer metadata) --> */
      .then(FN.chunk)
    
      .then(chunks => FN.create(FN.titles.name(since), FN.titles.tab())
            
            .then(value => _.tap(value, value => value.rows = chunks.shift()))
            
            .then(value => Promise.all(chunks.length > 0 ?
                    _.map(chunks, (rows, index) => FN.create(null, FN.titles.tab(index + 1), value.sheet.spreadsheetId, index + 1)
                      .then(value => _.tap(value, value => value.rows = rows))
                      .then(value => FN.populate(value, index + 1))) : [])
                  .then(() => FN.populate(value, 0)))),

    property: () => _.object([options.property.name], [options.property.value]),

    update: file => {
      factory.Flags.log(`Updating Gradesheet: ${file.id}`, FN.rows());
      return new Promise(resolve => _.delay(resolve, _.random(1000, 3000)));
    },
  };
  /* <!-- External Visibility --> */

};