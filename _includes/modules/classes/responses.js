Responses = (options, factory) => {
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
  FN.responses = (classroom, id, targets) => Promise.all([
      Promise.resolve(options.functions.populate.get(classroom)),
      Promise.resolve(options.functions.populate.get(id, "classwork"))
    ])
    .then(data => {
      var classroom = data[0],
          work = data[1];
      return classroom && work ? options.functions.classes.responses(data[0], data[1], true)
        .then(responses => {
          factory.Flags.log("Classwork Responses:", responses);
          var _all = _.reduce(responses, (memo, response) => {
            response.max = work.points;
            memo[response.state].responses.push(response);
            memo[response.state].value += 1;
            if (response.late) {
              memo.LATE.value += 1;
              memo.LATE.responses.push(response);
            }
            return memo;
          }, {
            NEW : {
              key : "New",
              value : 0,
              badge : "light",
              responses : []
            },
            CREATED : {
              key : "Created",
              value : 0,
              badge : "dark",
              responses : []
            },
            TURNED_IN : {
              key : "Turned In",
              value : 0,
              badge : "primary",
              responses : []
            },
            RETURNED : {
              key : "Returned",
              value : 0,
              badge : "success",
              responses : []
            },
            RECLAIMED_BY_STUDENT : {
              key : "Reclaimed",
              value : 0,
              badge : "warning",
              responses : []
            },
            LATE : {
              key : "Late",
              value : 0,
              badge : "danger",
              responses : []
            }
          });
        
          /* <!-- Add all significant data --> */
          _.each(_all, (value, key) => value.value > 0 ? 
                 options.functions.common.badge(work.responses, `${id}_responses_${key.toLowerCase()}`, value.key, "",  value.value, value.badge,
                    factory.Display.template.get("popover_responses")(options.functions.common.parse(value.responses))) : null);

          /* <!-- Update the classwork object, and call for a visual update --> */
          options.functions.populate.update(work, "classwork");

          /* <!-- Remove the loader to inform that loading has completed --> */
          targets.responses.empty().append(factory.Display.template.get("cell", true)(work.responses));
        
        }) : null;
    });
  /* <!-- Internal Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Generate Functions --> */
  
  /* <!-- Public Functions --> */
  FN.meta = () => ({
    responses : options.state.session.table.index("responses") + 1,
  });
  
  FN.row = (meta, row, force, types) => {
    
    var _responses = row.find(`td:nth-child(${meta.responses})`).first();
    
    return _responses && (force || _responses.html() == "") ? FN.responses(row.data("parent"), row.data("id"), {
      responses: factory.Main.busy_element(force ? _responses.empty() : _responses),
    }, types) : Promise.resolve(null);
    
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