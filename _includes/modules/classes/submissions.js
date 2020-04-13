Submissions = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {}, FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.submissions = (classroom, id, targets, event) => Promise.all([
      Promise.resolve(options.functions.populate.get(classroom)),
      Promise.resolve(options.functions.populate.get(id, "classwork"))
    ])
    .then(data => {
      var classroom = data[0],
          work = data[1];
      return classroom && work ? (options.functions.common.stale(work, "submissions") ?
                                    options.functions.classes.submissions(data[0], data[1], true) : Promise.resolve(work.$submissions))
        .then(submissions => {
          factory.Main.event(event, factory.Main.message(submissions ? submissions.length || 0 : 0, "submission", "submissions"));
          factory.Flags.log("Classwork Submissions:", submissions);
          work.calculated = {
            all: [],
            min: null,
            avg: null,
            max : null
          };
          var _all = _.reduce(submissions, (memo, submission) => {
            if (submission.assignedGrade !== undefined || submission.draftGrade !== undefined)
              work.calculated.all.push(submission.assignedGrade || submission.draftGrade);
            submission.max = work.points;
            memo[submission.state].submissions.push(submission);
            memo[submission.state].value += 1;
            if (submission.late) {
              memo.LATE.value += 1;
              memo.LATE.submissions.push(submission);
            }
            return memo;
          }, {
            NEW : {
              key : "New",
              value : 0,
              badge : "light",
              submissions : []
            },
            CREATED : {
              key : "Created",
              value : 0,
              badge : "dark",
              submissions : []
            },
            TURNED_IN : {
              key : "Turned In",
              value : 0,
              badge : "primary",
              submissions : []
            },
            RETURNED : {
              key : "Returned",
              value : 0,
              badge : "success",
              submissions : []
            },
            RECLAIMED_BY_STUDENT : {
              key : "Reclaimed",
              value : 0,
              badge : "warning",
              submissions : []
            },
            LATE : {
              key : "Late",
              value : 0,
              badge : "danger",
              submissions : []
            }
          });
        
          /* <!-- Calculate Grade Values --> */
          if (work.calculated.all.length > 0) {
            work.calculated.min = _.min(work.calculated.all);
            work.calculated.max = _.max(work.calculated.all);
            work.calculated.avg = Math.preciseRound(_.reduce(work.calculated.all, 
                                                             (total, value) => total + value, 0) / work.calculated.all.length, 2);
          }
        
          /* <!-- Add all significant data --> */
          _.each(_all, (value, key) => value.value > 0 ? 
            options.functions.common.badge(work.submissions, `${id}_submissions_${key.toLowerCase()}`, value.key, "",  value.value,
            value.badge, factory.Display.template.get("popover_submissions")(options.functions.common.parse(value.submissions))) : null);

          /* <!-- Update the classwork object, and call for a visual update --> */
          options.functions.populate.update(work, "classwork");

          /* <!-- Remove the loader to inform that loading has completed --> */
          _.each(["min", "avg", "max"], 
                 value => targets[value].empty().append(factory.Display.template.get("cell", true)(work.calculated[value])));
        
          _.each(["submissions", "fetched"], 
                 value => targets[value].empty().append(factory.Display.template.get("cell", true)(work[value])));
        
        }) : null;
    });
  /* <!-- Internal Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Public Functions --> */
  FN.meta = () => ({
    fetched:  options.functions.common.column("fetched") + 1,
    min: options.functions.common.column("min") + 1,
    avg: options.functions.common.column("avg") + 1,
    max: options.functions.common.column("max") + 1,
    submissions :  options.functions.common.column("submissions") + 1,
  });
  
  FN.row = (meta, row, force) => {
    
    var _submissions = row.find(`td:nth-child(${meta.submissions})`).first(),
        _min = row.find(`td:nth-child(${meta.min})`).first(),
        _avg = row.find(`td:nth-child(${meta.avg})`).first(),
        _max = row.find(`td:nth-child(${meta.max})`).first(),
        _fetched = row.find(`td:nth-child(${meta.fetched})`).first();
    
    var _id = row.data("id"),
        _event = `${options.functions.events.submissions.progress}-${_id}`;
        
    return _submissions && (force || _submissions.html() == "") ? FN.submissions(row.data("parent"), _id, {
      min : _min,
      avg : _avg,
      max : _max,
      fetched : _fetched,
      submissions : factory.Main.busy_element(force ? _submissions.empty() : _submissions, _event, "Loading Submissions")
    }, _event) : Promise.resolve(null);
    
  };
  /* <!-- Public Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
   
    generate: force => {
      var _meta = FN.meta();
      return Promise.all(_.map(options.state.session.table.table().find("tbody tr[data-id][data-parent]").toArray(), el => FN.row(_meta, $(el), force)));
    },
    
  };
  /* <!-- External Visibility --> */

};