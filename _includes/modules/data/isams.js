iSAMS_API = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides an interface onto various Google APIs --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.timeout: Custom timeout for each network/API domain base --> */
  /* <!-- @factory.Network: Function to create a network helper object --> */
  /* <!-- REQUIRES: Global Scope: Underscore, quotedPrintable (for emails) --> */
  /* <!-- REQUIRES: Factory Scope: Network helper --> */
  
  /* <!-- Internal Constants --> */
  const DEFAULTS = {
          content: "application/xml",
          type: "json",
          responses: "application/json",
          database: "isams-data",
          collections: {
            summary: "summary",
            detail: "detail",
            student: "student",
          }
        },
        LAST_RESORT_TIMEOUT = 60000,
        FN = {};
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal State --> */
  var ರ‿ರ = {
        dialog : factory.Dialog({}, factory),
        cycles : [],
        trackers : [],
      }, /* <!-- State --> */
      ಱ = {
        db: new loki(`${options.database}.db`, {
          verbose: factory.Flags.verbose()
        }),
      }; /* <!-- Persistant --> */
  /* <!-- Internal State --> */
  
  /* <!-- Internal Functions --> */
  var _array = a => _.isArray(a) ? a : [a];
  
  var _terms = () => _.map(["Autumn", "Spring", "Summer"], 
                           (value, index) => options.functions.common.option(index + 1, value));
  
  var _grade = value => `${value.numeric && parseInt(value.numeric) ? 
                                  `${value.grade} [${value.numeric}]` : value.grade}`;
  /* <!-- Internal Functions --> */
  
  /* <!-- Config Functions --> */
  FN.config = () => ({
      name: "iSAMS",
      fields: {
        comparison: ["data", "view"],
      },
      defaults: {
        format : "api/batch/1.0/%s.ashx?apiKey=%s",
        filters : {
          wrapper : "<?xml version='1.0' encoding='utf-8'?><Filters>%s</Filters>",
          reports : {
            cycle : "<SchoolReports><ReportCycles reportTerm='%s' reportCycleType='%s' reportYear='%s' /></SchoolReports>",
            reports : "<SchoolReports><Reports reportCycleIdsToInclude='%s' ncYear='%s' reportType='%s' reportStatus='%s' /></SchoolReports>",
            tracking : "<TrackingManager><ExternalData idsToInclude='%s' /></TrackingManager>"
          }
        },
      },
      process: {
        url: values => ({
          base: options.functions.common.value(values, "base"),
          api : {
            metadata : options.functions.common.value(values, "api_metadata"),
            pupils : options.functions.common.value(values, "api_pupils"),
            reports : options.functions.common.value(values, "api_reports"),
            tracking : options.functions.common.value(values, "api_tracking"),
          },
        }),
      }
    });
  /* <!-- Config Functions --> */
  
  /* <!-- Load Functions --> */
  FN.load = config => {
    
    var _network = factory.Network({
      base: config.base,
      timeout: options.timeout ? options.timeout : LAST_RESORT_TIMEOUT,
      per_sec: options.rate ? options.rate : 0,
      concurrent: options.concurrent ? options.concurrent : 0,
      retry: r => new Promise(resolve => r.status === 403 || r.status === 429 ?
          r.json().then(result => result.error.message && result.error.message.indexOf("Rate Limit Exceeded") >= 0 ? resolve(true) : resolve(false)) : resolve(false))
    }, factory),
        _filter = filter => sprintf(config.filters.wrapper, filter);
    
    return {
      
      metadata : (year, term) => _network.post(sprintf(config.format, options.type, config.api.metadata),
        _filter(sprintf(config.filters.reports.cycle, term, "", year)), options.content, options.responses),
      
      reports : (cycles, group, type, status) => _network.post(sprintf(config.format, options.type, config.api.reports),
        _filter(sprintf(config.filters.reports.reports, cycles, group, type, status)), options.content, options.responses),
      
      pupils : () => _network.post(sprintf(config.format, options.type, config.api.pupils), null, options.content, options.responses),

      tracking : (trackers) => _network.post(sprintf(config.format, options.type, config.api.tracking),
         _filter(sprintf(config.filters.reports.tracking, trackers)), options.content, options.responses),
 
    };
    
  };
  /* <!-- Load Functions --> */
  
  /* <!-- Select Functions --> */
  FN.select = {
    
    year_groups : () => factory.Display.choose({
          id: "choose_year_groups",
          title: "Choose Year Group/s",
          chain: true,
          instructions: factory.Display.doc.get("IMPORT_ISAMS_DATA_NCYEAR"),
          multiple: true,
          choices: [{
            id: -1,
            name: "Nursery"
          },{
            id: 0,
            name: "Reception",
            selected: true,
          }].concat(_.times(13, i => ({
            id: i+1,
            name: `Year ${i+1}`
          }))),
        }),
    
    input_data : (config) => factory.Display.modal("import-isams", {
          id: "import_iSAMS",
          target: factory.container,
          title: "Import Data From iSAMS",
          instructions: factory.Display.doc.get("IMPORT_ISAMS_DATA"),
          year: new Date().getMonth() < 9 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
          terms: _terms(),
          validate: values => values && values.Series && values.Series.Values && values.Series.Values.Items,
          help: {},
          action: "Load",
        }, dialog => {
          factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {trigger: "hover"});
      
          /* <!-- Clear Cycles / Trackers --> */
          ರ‿ರ.cycles = [];
          ರ‿ರ.trackers = [];
          
          /* <!-- Handle Metadata Reloads & Refreshes --> */
          var _reload = () => {
            var _data = factory.Data({}, factory).dehydrate(dialog.find(".selector"));
            if (_data.Year && _data.Year.Value && /^\d{4}$/.test(_data.Year.Value) && _data.Term && _data.Term.Value) {
              
              /* <!-- Input selections appear valid, so load metadata --> */
              dialog.find("[data-content='cycles'], [data-content='trackers']").empty().append($("<option />").text("Loading ..."));
              FN.load(config).metadata(_data.Year.Value, _data.Term.Value)
                .then(metadata => {
                  
                  factory.Flags.log("iSAMS METADATA:", metadata);
                
                  if (ರ‿ರ.metadata && ರ‿ರ.metadata.iSAMS.SchoolReports.ReportCycles) {
                    /* <!-- Merge Metadata Report Cycles --> */
                    var _all = _array(ರ‿ರ.metadata.iSAMS.SchoolReports.ReportCycles.ReportCycle)
                          .concat(_array(metadata.iSAMS.SchoolReports.ReportCycles.ReportCycle));
                    ರ‿ರ.metadata.iSAMS.SchoolReports.ReportCycles.ReportCycle = _.chain(_all).uniq(false, "@Id").compact().value();
                  } else {
                    ರ‿ರ.metadata = metadata;
                  }
               
                  /* <!-- Get Cycles and Populate --> */
                  var _cycles = dialog.find("[data-content='cycles']").empty();
                  if (metadata.iSAMS && metadata.iSAMS.SchoolReports && metadata.iSAMS.SchoolReports.ReportCycles) {
                    (Array.isArray(metadata.iSAMS.SchoolReports.ReportCycles.ReportCycle) ? 
                      metadata.iSAMS.SchoolReports.ReportCycles.ReportCycle :
                      [metadata.iSAMS.SchoolReports.ReportCycles.ReportCycle])
                      .filter(cycle => !!cycle)
                      .forEach(cycle => _cycles.append($("<option />", {
                        value: cycle["@Id"],
                        "data-year": cycle.ReportYear,
                        "data-term": cycle.ReportTerm,
                        "data-type": cycle.ReportType,
                      }).text(cycle.ReportName)));
                  }

                  /* <!-- Get Tracking Options --> */
                  var _trackers = dialog.find("[data-content='trackers']").empty();
                  if (metadata.iSAMS && metadata.iSAMS.TrackingManager && metadata.iSAMS.TrackingManager.ExternalDataList) {
                    (Array.isArray(metadata.iSAMS.TrackingManager.ExternalDataList.Data) ? 
                      metadata.iSAMS.TrackingManager.ExternalDataList.Data :
                      [metadata.iSAMS.TrackingManager.ExternalDataList.Data])
                      .filter(tracking => tracking && tracking.Imported == 1)
                      .forEach(tracking => _trackers.append($("<option />", {value: tracking["@Id"]}).text(tracking.Name)));
                  }
                
                })
                .catch(e => (e ? factory.Flags.error("Import Error", e) : factory.Flags.log("Import Cancelled")))
                .then(factory.Main.busy(true, false, options.functions.events.load.progress, "Loading Cycles & Trackers", "medium", 
                        dialog.find(".modal-content"), "loader-medium h-100 w-100 position-absolute overflow-hidden", true));
            }
          };
          dialog.find("[data-action='load']").on("change.load", _reload);
          dialog.find("[data-action='refresh']").on("click.load", _reload);
          /* <!-- Handle Metadata Reloads & Refreshes --> */
      
          /* <!-- Handle Adding Series --> */
          dialog.find("[data-action='add']").on("click.add", e => {
            
            var _add = $(e.currentTarget),
                _content = dialog.find(_add.data("value")),
                _selected = _content.children("option:selected"),
                _types = _content.data("content");
            
            if (_selected.length === 1) {
              
              var _id = _selected.val(),
                  _name = _selected.text(),
                  _exists = _.find(ರ‿ರ[_types], series => series && series.id == _id);
              if (!_exists) {
                
                ರ‿ರ[_types].push({
                  id: _id,
                  name: _name
                });
                factory.Flags.log(`Added to ${_types}:`, ರ‿ರ[_types]);
                
                factory.Display.template.show({
                  template: "series-isams",
                  id: _id,
                  type: _add.data("type"),
                  types: _types,
                  name: _name,
                  year: _selected.data("year") || "",
                  term: _selected.data("term") || "",
                  target: dialog.find(_add.data("targets")),
                  append: true,
                }).find("[data-action='remove']").on("click.remove", e => {
                  var _remove = $(e.currentTarget),
                      _types = _remove.data("types"),
                      _id = _remove.data("id");
                  ರ‿ರ[_types] = _.without(ರ‿ರ[_types], _.find(ರ‿ರ[_types], series => series && series.id == _id));
                  factory.Flags.log(`Removed from ${_types}:`, ರ‿ರ[_types]);
                  _remove.parent(".list-item").remove();
                  factory.Display.tidy();
                });
              }
            }
            
          });
          /* <!-- Handle Metadata Reloads & Refreshes --> */
      
        })
        .catch(e => (e ? factory.Flags.error("Import Error", e) : factory.Flags.log("Import Cancelled")).negative()),
    
  };
  /* <!-- Select Functions --> */
  
  /* <!-- Populate Functions --> */
  FN.populate = {
    
    summary : data => {
      var _data = [];
      
      /* <!-- Years --> */
      if (data.source.years) _data.push({
        name: "Years",
        description: "Year Groups selected",
        type: "List",
        value: _.map(data.source.years, "name"),
      });
      
      /* <!-- Pupils --> */
      if (data.source.pupils) _data.push({
        name: "Total Pupils",
        description: "Number of current pupils on iSAMS",
        type: "Count",
        value: _array(data.source.pupils.iSAMS.PupilManager.CurrentPupils.Pupil).length,
      });
      
      /* <!-- Reports --> */
      if (data.source.reports) _data = _data.concat(_.map(_array(data.source.reports.iSAMS.SchoolReports.ReportCycles.ReportCycle), cycle => ({
        name: cycle.CycleName,
        description: "Report Cycle",
        type: "Reports Count",
        value: _array(cycle.Reports.Report).length,
      })));
    
      /* <!-- Trackers --> */
      if (data.source.trackers) _data = _data.concat(_.map(_array(data.source.trackers.iSAMS.TrackingManager.ExternalData.Data), tracker => ({
        name: tracker.Name,
        description: tracker.Description,
        type: "External Data Tracker",
        value: tracker.Aspects ? _.map(_array(tracker.Aspects.Aspect), 
          aspect => `${aspect.Name} = ${_array(aspect.Results.Result).length} Result${_array(aspect.Results.Result).length > 1 ? "s" : ""}`).sort() : ""
      })));
      
      /* <!-- Transformed --> */
      if (data.transformed) {
        
        _data.push({
          name: "Relevant Students",
          description: "Number of Students with data in selected cycles/trackers",
          type: "Transformed Data",
          value: _.map(_.reduce(data.transformed, (memo, student) => {
            memo[student.form] = memo[student.form] ? memo[student.form] + 1 : 1;
            return memo;
          }, {}), (total, name) => `${name} = ${total} Student${total > 1 ? "s" : ""}`).sort(),
        });
        
        _data.push({
          name: "Unique Subjects / Courses",
          description: "Number of Subjects with data in selected cycles/trackers",
          type: "Count",
          value: _.keys(_.reduce(data.transformed, (memo, student) => {
            return student.subjects ? _.reduce(student.subjects, (memo, subject, code) => {
              memo[code] = memo[code] ? memo[code] + 1 : 1;
              return memo;
            }, memo) : memo;
          }, {})).length,
        });
        
        _data.push({
          name: "Data Points",
          description: "Number of Students with data in selected cycles/trackers",
          type: "Transformed Data",
          value: _.map(_.reduce(data.transformed, (memo, student) => {
            if (student.subjects) {
              var _points = _.reduce(student.subjects, (memo, subject) => {
                return _.reduce(subject, (memo, points) => {
                  return points && points.length > 0 ? memo + points.length : memo;
                }, memo);
              }, 0);
              memo[student.form] = memo[student.form] ? memo[student.form] + _points : _points;
            }
            return memo;
          }, {}), (total, name) => `${name} = ${total} Point${total > 1 ? "s" : ""}`).sort(),
        });
        
      }
      
      return options.state.application.tabulate.data(ರ‿ರ, ಱ.db, options.collections.summary, {}, _data);
    },
    
    detail : data => {
      
      var _subjects = _.reduce(data.transformed, 
                        (memo, student) => student.subjects ? _.uniq(memo.concat(_.keys(student.subjects))) : memo, []).sort(),
          _data = _.map(data.transformed, student => {
            var _student = {
              id: {
                text: student.id,
                route: `show.student.${student.id}`,
                title: "Open Student Details",
              },
              name: `${student.chosenName}, ${student.surname}`,
              form: student.form,
            };
            _.each(_subjects, subject => {
              if (subject) {
                if (student.subjects[subject]) {
                  _student[subject] = _.reduce(student.subjects[subject], (memo, values, key) => {
                    memo.push(`${key} - ${_.map(values, 
                      value => _grade(value)).join(" | ")}`);
                    return memo;
                  }, []);
                  _student[subject].__small = true;
                  _student[subject].__tiny = true;
                  _student[subject].__condensed = true;
                } else {
                  _student[subject] = "";  
                }
              }
            });
            return _student;
          });
      
      /* <!-- Process Subject Names --> */
      _subjects = _.chain(_subjects).compact().map(subject => {
        var _split = subject.split(" - ");
        _split =  _split[_split.length - 1].trim();
        return {
          name : subject,
          display : _split,
          export : _split,
          class : "text-nowrap",
          help : factory.Display.doc.get("SUBJECT_NAME", subject, true)
        };
      }).value();
      
      return {
        data: options.state.application.tabulate.data(ರ‿ರ, ಱ.db, options.collections.detail, {}, _data),
        headers: ["ID", "Name", "Form"].concat(_subjects),
      };
      
    },
    
    student : (id, data) => {
      
      var _data = [],
          _student = _.find(_array(data.source.pupils.iSAMS.PupilManager.CurrentPupils.Pupil), student => student.SchoolId == id);
      
      if (_student) {
        
        _data.push({
          name: "ID",
          description: "",
          type: "",
          value: _student.SchoolId,
        });
        
        _data.push({
          name: "Code",
          description: "",
          type: "",
          value: _student.SchoolCode,
        });
        
        _data.push({
          name: "Name",
          description: "",
          type: "",
          value: _student.Fullname,
        });
        
        _data.push({
          name: "Form",
          description: "",
          type: "",
          value: _student.Form,
        });
        
        _data.push({
          name: "Division",
          description: "",
          type: "",
          value: _student.DivisionName,
        });
        
        _data.push({
          name: "House",
          description: "",
          type: "",
          value: _student.AcademicHouse,
        });
        
        _data.push({
          name: "Enrolment Year",
          description: "",
          type: "",
          value: _student.EnrolmentSchoolYear,
        });
        
      }
      
      if (data.transformed[id] && data.transformed[id].subjects) _.each(data.transformed[id].subjects, (values, subject) => {
        _.each(values, (grades, type) => {
          _.each(grades, grade => {
             _data.push({
                name: subject,
                description: [
                  `<strong>Author</strong>: ${grade.author}`,
                  `<strong>Cycle</strong>: ${grade.cycle}`,
                  `<strong>Date</strong>: ${grade.date}`
                ],
                type: type,
                value: _grade(grade),
              });
          });
           
        });
        
      });
      
      return options.state.application.tabulate.data(ರ‿ರ, ಱ.db, options.collections.student, {}, _data);
      
    },
  
  };
  /* <!-- Populate Functions --> */

  /* <!-- Extra Functions --> */
  FN.metadata = () => ರ‿ರ.metadata;
  /* <!-- Extra Functions --> */

  /* <!-- Public Functions --> */
  return FN;
  /* <!-- Public Functions --> */
  
};