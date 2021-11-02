Transform = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    labels : {
      comments: "~COMMENTS~",
    }
  },
    FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var transformGradeName = (name) => {
    name = name.toUpperCase().trim();
    if (name.endsWith("GRADES") || name.endsWith("DESCRIPTORS"))
      name = name.substring(0,name.length-1);
    return name;
  };
  
  var transformResultName = (name) => {
    name = name.toUpperCase().trim();
    return name;
  };

  var getGradeValue = (text, grade) => {
    return (_.isArray(grade.Values.Value) ? grade.Values.Value : [grade.Values.Value]).find(function(value) {
      return value.Grade == text;
    });
  };
  
  var getResultValue = (text, result) => {
    return result.IsNumericValue && result.UseResult && text ? Number(text) : text;
  };

  var getGrade = (id, template) => {
    return template && template.Gradings ? (_.isArray(template.Gradings.Grading) ? template.Gradings.Grading : [template.Gradings.Grading]).find(function(grade) {
      return grade["@Id"] == id;
    }) : null;
  };
  
  var getResult = (id, template) => {
    return template && template.Results ?  (_.isArray(template.Results.Result) ? template.Results.Result : [template.Results.Result]).find(function(result) {
      return result["@Id"] == id;
    }) : null;
  };
  
  var getTemplate = (id, metadata) => {
    return metadata.iSAMS.SchoolReports.Templates.Template.find(function(template) {
      return template["@Id"] == id;
    });
  };
  
  var getTracking = (id, trackers) => {
    var _tracking = {};
    (_.isArray(trackers) ? trackers : [trackers]).forEach(function(tracker) {
      var _code = tracker.Code.trim(),
          _type = _tracking[_code] ? _tracking[_code] : (_tracking[_code] = {});
      if (tracker.Aspects && tracker.Aspects.Aspect) 
        (_.isArray(tracker.Aspects.Aspect) ? tracker.Aspects.Aspect : [tracker.Aspects.Aspect]).forEach(function(aspect) {
          if (aspect.Results && aspect.Results.Result) {
            var _result = (_.isArray(aspect.Results.Result) ? aspect.Results.Result : [aspect.Results.Result])
              .find(function(result) {
                return result.SchoolId == id;
              });
            if (_result) {
              _type[aspect.Name.trim()] = {
                date : _result.LastUpdated,
                result : _result.Result,
              };
            }
          }
        });
    });
    return _tracking;
  };
  
  var getPupil = (id, pupils, trackers) => {
    var _pupil = pupils.iSAMS.PupilManager.CurrentPupils.Pupil.find(function(pupil) {
      return pupil.SchoolId == id;
    });
    if (_pupil) {
      return {
        id: _pupil.SchoolId,
        form: _pupil.Form,
        chosenName: _pupil.Preferredname || _pupil.Forename,
        surname: _pupil.Surname,
        enroled: _pupil.EnrolmentDate,
        tracking: trackers ? getTracking(_pupil.SchoolId, trackers) : {},
        subjects: {},
      };
    } else {
      return null;
    }
  };
  
  var transformGrade = (template, grade, name, author, date, subject) => {

    var _grade = getGrade(grade["@GradeId"], template);
    if (_grade) {
      var _name = transformGradeName(_grade.Name),
          _value = getGradeValue(grade.Grade, _grade);
      if (_value) {
        var __value = {
            cycle: name,
            author: author,
            date: date,
            grade: _value.Grade,
            numeric: _value.TransposeValue,
          };
        if (subject[_name]) {
          subject[_name].push(__value);
        } else {
          subject[_name] = [__value];
        }
      } else {
        factory.Flags.log(`Can't find grade value for ID: ${grade["@GradeId"]} and grade ${grade.Grade}`);
      }
    } else {
      factory.Flags.log(`Can't find grade definition for ID: ${grade["@GradeId"]}`);
    }

  };
  
  var transformResult = (template, result, name, author, date, subject) => {

    var _result = getResult(result["@ResultId"], template);
    if (_result) {
      var _name = transformResultName(_result.Name),
          _value = getResultValue(result.Result, _result);
      if (_value) {
        var __value = {
            cycle: name,
            author: author,
            date: date,
            result: _value,
            grade: _value,
          };
        if (typeof __value.result === "number" && isFinite(__value.result)) __value.numeric = __value.result;
        if (subject[_name]) {
          subject[_name].push(__value);
        } else {
          subject[_name] = [__value];
        }
      } else {
        factory.Flags.log(`Can't parse result value for ID: ${result["@ResultId"]} and result ${result.Result}`);
      }
    } else {
      factory.Flags.log(`Can't find result definition for ID: ${result["@ResultId"]}`);
    }

  };
  
  var transformPupilReport = (metadata, pupilReport, pupils, trackers, name, output) => {
    var _pupil = pupilReport.SchoolId,
        _subject = (pupilReport.AssociatedEntityName || "").toUpperCase().trim(),
        _template = getTemplate(pupilReport["@TemplateId"], metadata),
        _author = pupilReport.Author,
        _date = pupilReport.LastUpdated;

    if (!output[_pupil]) {
      var __pupil = getPupil(_pupil, pupils, trackers);
      if (__pupil) output[_pupil] = __pupil;
      _pupil = __pupil;
    } else {
      _pupil = output[_pupil];
    }

    /* <!-- Only Run if there are Grades --> */
    if (_pupil && pupilReport.Grades && pupilReport.Grades.Grade) {
      var __grade_subject = _pupil.subjects[_subject] || (_pupil.subjects[_subject] = {});
      (_.isArray(pupilReport.Grades.Grade) ? pupilReport.Grades.Grade : [pupilReport.Grades.Grade])
        .forEach(function(grade) {
          transformGrade(_template, grade, name, _author, _date, __grade_subject);
        });
    }
    
    /* <!-- Only Run if there are Results --> */
    if (_pupil && pupilReport.Results && pupilReport.Results.Result) {
      var __result_subject = _pupil.subjects[_subject] || (_pupil.subjects[_subject] = {});
      (_.isArray(pupilReport.Results.Result) ? pupilReport.Results.Result : [pupilReport.Results.Result])
        .forEach(function(result) {
          transformResult(_template, result, name, _author, _date, __result_subject);
        });
    }

    /* <!-- Only Run if there are Comments --> */
    if (_pupil && pupilReport.Comments && pupilReport.Comments.Comment && pupilReport.Comments.Comment.Comment) {
      var __comment_subject = _pupil.subjects[_subject] || (_pupil.subjects[_subject] = {}),
          _value = {
            cycle: name,
            author: _author,
            date: _date,
            comment: pupilReport.Comments.Comment.Comment,
          };
      if (__comment_subject[options.labels.comments]) {
        __comment_subject[options.labels.comments].push(_value);
      } else {
        __comment_subject[options.labels.comments] = [_value];
      }
    }

  };
  
  var transformReport = (metadata, report, pupils, trackers, output) => {
  
    var _name = report.CycleName;

    if (report.Reports && report.Reports.Report) report.Reports.Report.forEach(function(pupilReport) {
      transformPupilReport(metadata, pupilReport, pupils, trackers, _name, output);
    });

  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Public Functions --> */
  FN.process = (metadata, reports, pupils, trackers) => {
  
    /* <!-- Get Report Data --> */
    var _data = reports.iSAMS.SchoolReports.ReportCycles.ReportCycle;
    _data = _.isArray(_data) ? _data : [_data];

    var _output = {};
    trackers = trackers && trackers.iSAMS && trackers.iSAMS.TrackingManager && trackers.iSAMS.TrackingManager.ExternalData.Data ?
      trackers.iSAMS.TrackingManager.ExternalData.Data : null;

    _data.forEach(function(report) {
      transformReport(metadata, report, pupils, trackers, _output);
    });

    factory.Flags.log("Transformed Data:", _output);

    return _output;
    
  };

  FN.labels = () => options.labels;
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */

};