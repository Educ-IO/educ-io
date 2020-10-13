Generate = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
          property: {
            name: "EDUC-IO-DATA",
            value: "ACADEMIC DATA",
          },
          format: "YYYY-MM-DD",
        },
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Functions --> */
  var _formats = () => _.map(["Wide", "Hybrid", "Long"], 
                             (value, index) => options.functions.common.option(value.toLowerCase(), value, index === 0));
  
  
  var _grades = () => _.map(["All Grades", "Last Grade", "Max Grade", "Min Grade"], 
                             (value, index) => options.functions.common.option(value.split(" ")[0].toLowerCase(), value, index === 0));
  
  var _square = (rows, length, placeholder) => _.map(rows, row => row.length < length ? 
                                 row.concat(Array(length - row.length).fill(placeholder === undefined ? null : placeholder)) : row);
  /* <!-- Internal Variables --> */

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
    sorts: factory.Google_Sheets_Sorts()
  });
  /* <!-- Helper Functions --> */
  
  /* <!-- Internal Functions --> */
  FN.titles = {
    
    name : value => `Academic Data | ${factory.Dates.parse(value).format(options.format)}`,
    
    tab : (groups, format, selector) => sprintf("Yr%s | %s%s", _.isArray(groups) ? 
            _.pluck(groups, "id").join(",") : groups.id || groups, format, selector == "min" ? "-" : selector == "max" ? "+" : "")
    
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Sheet Functions --> */
  FN.sheet = {
   
    create : (name, tab, colour) => factory.Google.sheets.create(name, tab, colour)
      .then(sheet => _.tap(sheet, sheet => factory.Google.files.update(sheet.spreadsheetId, 
                                             factory.Google.files.tag(options.property.name, options.property.value))))
      .then(sheet => ({
        sheet: sheet,
        helpers: FN.helpers(sheet.sheets[0].properties.sheetId),
      })),
    
    add : (id, tab, sheet, colour) => factory.Google.sheets.get(id).then(existing => {
      
      /* <!-- Check for existing tabs --> */
      factory.Flags.log(`Existing Sheet: ${id}`, existing);
      var _tab = tab, index = 1;
      while (_.find(existing.sheets, sheet => sheet.properties && sheet.properties.title == tab)) {
        tab = `${_tab} | ${index}`;
        index++;
      }
      
      /* <!-- Create new tab --> */
      return factory.Google.sheets.tab(id, sheet, tab, colour).then(sheet => ({
        sheet: sheet,
        helpers: FN.helpers(sheet.sheets[sheet.sheets.length - 1].properties.sheetId),
      }));
      
    }),
    
    update: (value, grid, values, input) => factory.Google.sheets.update(value.sheet.spreadsheetId, grid, values, input)
      .then(response => {
        factory.Flags.log(`Updating Values for Sheet: ${value.sheet.spreadsheetId}`, response);
        value.response = response;
        return value;
      }),

    batch: (value, values, reply) => values && values.length > 0 ? 
      factory.Google.sheets.batch(value.sheet.spreadsheetId, values, reply, reply)
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
      }),
    
    tab: (format, colour, groups, selector, date, id, sheet) => id ? 
      FN.sheet.add(id, FN.titles.tab(groups, format, selector), sheet, colour) :
      FN.sheet.create(FN.titles.name(date), FN.titles.tab(groups, format, selector), colour),
    
    finally: sheet => {
      sheet.spreadsheetUrl = sheet.spreadsheetUrl ?
        `${sheet.spreadsheetUrl}#gid=${sheet.sheets[sheet.sheets.length - 1].properties.sheetId}` : sheet.spreadsheetUrl;
      return sheet;
    },
    
  };
  /* <!-- Sheet Functions --> */
  
  /* <!-- Internal Functions --> */
  var iterate = (data, iterator) => {
    for (var value in data) if (data.hasOwnProperty(value)) iterator(data[value], value);
  };
 
  var getGrades = (grades, selector) => {

    // -- De-dupe Grades -- //
    var _grades = [];

    grades.forEach(function(grade) {

      var _existing = _grades.find(function(existing) {
        return existing.cycle == grade.cycle && (selector == "min" || selector == "max" || selector == "last" || 
          (existing.author == grade.author || (_.isArray(existing.author) && existing.author.indexOf(grade.author) >= 0) ||
           existing.grade == grade.grade));
      });

      if (_existing) {

        if (selector == "all" && new Date(grade.date) > new Date(_existing.date) && _existing.grade != grade.grade) {
          _existing.grade = grade.grade;
          _existing.date = grade.date;
        } else if (selector == "min" && _existing.numeric > grade.numeric) {
          _existing.grade = grade.grade;
          _existing.date = grade.date;
        } else if (selector == "max" && _existing.numeric < grade.numeric) {
          _existing.grade = grade.grade;
          _existing.date = grade.date;
        } else if (selector == "last" && new Date(grade.date) > new Date(_existing.date)) {
          _existing.grade = grade.grade;
          _existing.date = grade.date;
        }

        if (_.isArray(_existing.author)) {
          if (_existing.author.indexOf(grade.author) < 0) _existing.author.push(grade.author);
        } else {
          if (_existing.author != grade.author) _existing.author = [_existing.author, grade.author];
        }

      } else {
        _grades.push(grade);
      }

    });

    return _grades;
  };
  
  var generate = (sheet, data, callback, sort) => {
    
    // -- Handle Initial Headers -- //
    var _columns = {
      student: ["ID", "Chosen Name", "Surname", "Form"],
      trackers: [],
      main: []
    }, _values = {
      student: [],
      trackers: [],
      main: [],
    };
    
    var _process = property => {
      
      // -- Square Off Array (prevent jagged array) -- //
      _values[property] = _square(_values[property], _columns[property].length);

      var _sort = _.isObject(sort) ? sort[property] : sort;
      
      if (_sort !== null && _sort !== undefined) {
        
        // -- Sort Columns -- //
        var _sorted = _sort === true ? 
            Array.columnSort(_columns[property], _values[property]) :
            Array.columnSort(_columns[property], _values[property], null, _sort);
        _columns[property] = _sorted[0];
        _values[property] = _sorted[1];
        
      }
      
    };

    // -- Handle Students / Trackers -- //
    iterate(data, student => {

      // -- Main Student Details -- //
      _values.student.push([student.id, student.chosenName, student.surname, student.form]);
      
      // -- Array to Handle Tracker Details -- //
      var _row = [];

      // -- Handle Trackers -- //
      if (student.tracking) iterate(student.tracking, (tracking, key) => {
        iterate(tracking, (value, name) => {
          var _header = sprintf("%s | %s", key, name),
              _index = _columns.trackers.indexOf(_header) >= 0 ? 
                _columns.trackers.indexOf(_header) : 
                _columns.trackers.push(_header) - 1;
          if (_row.length < _index + 1) {
            _row = _row.concat(Array(_index+1-_row.length).fill(null));
          }
          _row[_index] = value.result;
        });
      });

      // -- Push Row into Rows -- //
      _values.trackers.push(_row);
      
      // -- Add Placeholder for Main Rows / Values -- //
      _values.main.push([]);

    });
    
    // -- We have trackers -- //
    if (_columns.trackers.length > 0) _process("trackers");
    
    // -- Hit Callback (if supplied) -- //
    if (callback) {

      // -- Call Callback to further process data -- //
      callback(data, _columns.main, _values.main, _values.student, _values.trackers);

      if (_columns.main.length > 0) _process("main");
      
    }
    
    var _concat = function() {
      var _array = [];
      for (var i = 0; i < arguments.length; i++) {
        _array = _array.concat(arguments[i]);
        if (i < arguments.length - 1 && arguments[i] && arguments[i].length > 0) _array.push(null);
      }
      return _array;
    };
    
    var _all_Columns = _concat(_columns.student, _columns.trackers, _columns.main),
        _all_Values = _.map(_values.student, 
                          (student, index) => _concat(_values.student[index], _values.trackers[index], _values.main[index])),
        _all_Spacers = [_columns.student.length]
          .concat(_columns.trackers.length > 0 && _columns.main.length > 0 ? _columns.student.length + 1 + (_columns.trackers.length > 0 ? _columns.trackers.length + 1 : 0) : []);
    
    // -- Add Headers to Output Sheet -- //
    return FN.sheet.update(sheet, 
        sheet.helpers.notation.grid(0, 0, 0, _all_Columns.length - 1, true,
        sheet.sheet.sheets[sheet.sheet.sheets.length - 1].properties.title), [_all_Columns], "USER_ENTERED")
    
      // -- Add Values to Output Sheet -- //
      .then(() => FN.sheet.update(sheet, 
        sheet.helpers.notation.grid(1, _all_Values.length, 0, _all_Columns.length - 1, true,
        sheet.sheet.sheets[sheet.sheet.sheets.length - 1].properties.title), _all_Values, "USER_ENTERED"))
    
      // -- Format Output Sheet -- //
      .then(() => FN.sheet.batch(sheet, 
                      
         // -- Format Spacer Columns -- //
         _.map(_all_Spacers,
          spacer => sheet.helpers.format.cells(sheet.helpers.grid.columns(spacer, spacer + 1).range(), [
            sheet.helpers.format.background("back"),
            sheet.helpers.format.align.horizontal("CENTER"),
            sheet.helpers.format.align.vertical("MIDDLE"),
            sheet.helpers.format.text("white", 8, true)
          ]))

        // -- Dimension Spacer Columns -- //
        .concat(_.map(_all_Spacers,
          spacer => sheet.helpers.format.dimension(sheet.helpers.grid.columns(spacer, spacer + 1).dimension(10))))
                                 
        .concat([
          
          /* <!-- Set Header Row to Black --> */
          sheet.helpers.format.cells(sheet.helpers.grid.rows(0, 1).range(), [
            sheet.helpers.format.background("back"),
            sheet.helpers.format.wrap("OVERFLOW_CELL"),
            sheet.helpers.format.align.horizontal("CENTER"),
            sheet.helpers.format.align.vertical("MIDDLE"),
            sheet.helpers.format.text("white", 9, true)
          ]),
      
          /* <!-- Set Rotation of Headers --> */
          sheet.helpers.format.cells(sheet.helpers.grid.range(0, 1, _columns.student.length, _all_Columns.length), [
            sheet.helpers.format.text("white", 6, true, false, 90)
          ]),

        ])

      ))
    
      // -- Format Output Sheet | Final Pass -- //
      .then(() => FN.sheet.batch(sheet, [
      
        /* <!-- Set Autosize Columns --> */
        sheet.helpers.format.autosize(sheet.helpers.grid.columns(0, _all_Columns.length).dimension()),
      
        /* <!-- Set Number Format (maybe this should be earlier?) --> */
        sheet.helpers.format.cells(sheet.helpers.grid.range(1, _values.student.length + 1, _columns.student.length, _all_Columns.length), [
          sheet.helpers.format.type("NUMBER", "@"),
          sheet.helpers.format.align.horizontal("CENTER"),
          sheet.helpers.format.align.vertical("MIDDLE"),
        ]),
      
        /* <!-- Freeze Heading Rows & Student Columns --> */
        sheet.helpers.properties.update([
          sheet.helpers.properties.grid.frozen.rows(1),
          sheet.helpers.properties.grid.frozen.columns(_columns.student.length),
        ]),
      
      ]))
    
      /* <!-- Return Sheet to Caller --> */
      .then(sheet => {
        sheet.extents = {
          height: _all_Values.length + 1,
          width: _all_Columns.length,
          data: {
            row: 1,
            column: _columns.student.length
          },
        };
        return sheet;
      });

  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.property = () => _.object([options.property.name], [options.property.value]);
  
  FN.generator = (date, id, sheet) => ({
  
    wide : (groups, selector, data) => FN.sheet.tab("W", factory.Google_Sheets_Format({}, factory).colour("00ff00"), 
                                                    groups, selector, date, id, sheet)
      .then(value => generate(value, data, (data, columns, values, students) => {

        // -- Handle Students / Trackers -- //
        iterate(data, function(student) {

          var _row = students.findIndex(function(row) {
                return row[0] == student.id;
              });

          // -- Handle Subject Gradings -- //
          if (student.subjects) iterate(student.subjects, function(subject, subject_Name) {

            iterate(subject, function(grades, grade_Name) {

              getGrades(grades, selector).forEach(function(grade) {

                var _header = sprintf("%s\n%s\n%s", grade_Name, subject_Name, grade.cycle);
                var _index = columns.indexOf(_header) >= 0 ? columns.indexOf(_header) : columns.push(_header) - 1;
                var _length = values[_row].length;

                if (_length < _index + 1) {
                  values[_row] = values[_row].concat(Array(_index + 1-_length).fill(""));
                }

                values[_row][_index] = (values[_row][_index] ? values[_row][_index] + "\n" + grade.grade : grade.grade);

              });

            });

          });

        });

      }, true))

      // -- Return Sheet to Caller -- //
      .then(sheet => sheet ? FN.sheet.finally(sheet.sheet) : null),

      long : (groups, selector, data) => FN.sheet.tab("L", factory.Google_Sheets_Format({}, factory).colour("0000ff"),
                                                      groups, selector, date, id, sheet)
        .then(value => generate(value, data, function(data, columns, values, students, trackers) {

          // -- Handle Report Grades -- //
          columns.splice(columns.length, 0, "Subject", "Cycle", "Grading", "Date", "User", "Value");

          iterate(data, student => {

            var _updated = false,
                _finder = row => row[0] == student.id,
                _index = students.findIndex(_finder),
                _student = students[_index].slice(0),
                _tracker = trackers[_index].slice(0);

            if (student.subjects) iterate(student.subjects, (subject, subject_Name) => {

              iterate(subject, (grades, grade_Name) => {

                getGrades(grades, selector).forEach(grade => {

                  var _row = [subject_Name, grade.cycle, grade_Name, grade.date,
                      _.isArray(grade.author) ? grade.author.join("\n") : grade.author, grade.grade];

                  // -- Add or Update Main & Student Rows -- //
                  if (_updated) {
                    students.push(_student);
                    trackers.push(_tracker);
                    values.push(_row);
                  } else {
                    values[_index] = _row;
                    _updated = true;
                  }

                });

              });

            });

          });

        })

        /* <!-- Sort Students, Conditional Formats / Autosize Columns --> */
        .then(value => FN.sheet.batch(value, [

            // -- Hide ID Column -- //
            value.helpers.format.hide(value.helpers.grid.columns(0, 1).dimension()),

            // -- Hide Date/User Column -- //
            value.helpers.format.hide(value.helpers.grid.columns(value.extents.width - 3, value.extents.width - 1).dimension()),

            // -- Sort Data -- //
            value.helpers.sorts.range(
              value.helpers.grid.rows(value.extents.data.row, value.extents.height).range(),
              [
                3, 2, 1, value.extents.width - 3,  value.extents.width - 2, {
                  dimension: value.extents.width,
                  order: "DESCENDING"
                }
              ]),
          ]))

        // -- Return Sheet to Caller -- //
        .then(sheet => sheet ? FN.sheet.finally(sheet.sheet) : null)),

      hybrid : (groups, selector, data) => FN.sheet.tab("H", factory.Google_Sheets_Format({}, factory).colour("ff0000"),
                                                        groups, selector, date, id, sheet).then(value => {

        var _length;
        return generate(value, data, (data, columns, values, students, trackers) => {

          // -- Handle Subject Names -- //
          columns.splice(columns.length, 0, "Subject", "User");

          iterate(data, student => {

            var _updated = false,
                _finder = row => row[0] == student.id,
                _student = students[students.findIndex(_finder)].slice(0),
                _tracker = trackers[students.findIndex(_finder)].slice(0);

            if (student.subjects) iterate(student.subjects, (subject, subject_Name) => {

              var _row = [];
              
              // -- Add subject name / user placeholder to row -- //
              _row.push(subject_Name);
              _row.push([]);

              iterate(subject, (grades, grade_Name) => {

                getGrades(grades, selector).forEach(grade => {

                  var _header = sprintf("%s\n%s", grade_Name, grade.cycle),
                      _index = columns.indexOf(_header) >= 0 ? columns.indexOf(_header) : columns.push(_header) - 1;
                  
                  var _length = _row.length;

                  if (_length < _index + 1) _row = _row.concat(Array(_index + 1 - _length).fill(null));

                  _row[_index] = (_row[_index] ? _row[_index] + "\n" + grade.grade : grade.grade);

                  if (grade.author) {
                    var _author = _.isArray(grade.author) ? grade.author : [grade.author];
                    _author.forEach(author => {
                      if (_row[1].indexOf(author) < 0) _row[1].push(author);
                    });
                  } 

                });

              });

              // -- Tidy up User / Author Cell -- //
              _row[1] = _row[1].join("\n");

              // -- Add or Update Values -- //
              if (_updated) {
                students.push(_student);
                trackers.push(_tracker);
                values.push(_row);
              } else {
                values[students.findIndex(_finder)] = _row;
                _updated = true;
              }
              
            });

          });

          // -- Get Length of Reports (for sorting / hiding purposes) -- //
          _length = columns.length - 2;
          
        }, {
          trackers : true,
          main : 2
        })
        
        /* <!-- Sort Students, Conditional Formats / Autosize Columns --> */
        .then(value => FN.sheet.batch(value, [
          
            // -- Hide ID Column -- //
            value.helpers.format.hide(value.helpers.grid.columns(0, 1).dimension()),
          
            // -- Hide User Column -- //
            value.helpers.format.hide(value.helpers.grid.columns(value.extents.width - (_length + 1), 
                                                                  value.extents.width - _length).dimension()),
          
            // -- Sort Data -- //
            value.helpers.sorts.range(
              value.helpers.grid.rows(value.extents.data.row, value.extents.height).range(),
              [3, 2, 1, value.extents.width - (_length + 1)]),
          
          ]))
        
        // -- Return Sheet to Caller -- //
        .then(sheet => sheet ? FN.sheet.finally(sheet.sheet) : null);

      }),

  });
  
  FN.output = (data, date) => {
    
    var _output = (values, file) => {
      var _format = values.Format.Value,
          _grades = values.Grades.Value,
          _generator = FN.generator(date, file ? file.id : null);
      factory.Flags.log("Selected Output Options:", `Format=${_format} / Grades=${_grades}`);
      return (_format == "wide" ? _generator.wide(data.source.years, _grades, data.transformed) : 
                      _format == "hybrid" ? _generator.hybrid(data.source.years, _grades, data.transformed) :
                        _generator.long(data.source.years, _grades, data.transformed))
        .then(options.state.application.notify.actions.save("NOTIFY_EXPORT_GENERATE_SUCCESS"));
    };
    
    return factory.Display.modal("format-output", {
      id: "format_Output",
      target: factory.container,
      title: "Format Output Data",
      instructions: factory.Display.doc.get("OUTPUT_DATA_FORMAT"),
      formats: _formats(),
      grades: _grades(),
      help: {},
      validate: values => values && values.Format && values.Grades,
      action: "Create New",
      actions: [{
        text: "Update Existing",
        handler: values => values ? factory.Router.pick.single({
            title: "Select a Sheet to Update",
            mime: factory.Google.files.natives()[1],
            all: true,
            team: true,
            recent: true,
            properties: FN.property()
          })
          .then(file => _output(values, file)
                .then(factory.Main.busy(true, true, options.functions.events.output.progress, "Updating Output")))
          .catch(e => e ? factory.Flags.error("Output Updating Error", e).negative() : 
                          factory.Flags.log("Output Update Cancelled").nothing()) : null,
        dismiss: true,
      }],
      enter: true
    })
    .then(values => values ? 
          _output(values).then(factory.Main.busy(true, true, options.functions.events.output.progress, "Creating Output")) : null)
    .catch(e => (e ? factory.Flags.error("Output Error", e) : factory.Flags.log("Output Cancelled")).negative());
    
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};