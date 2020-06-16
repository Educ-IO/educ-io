Schema = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to supplied versioned schemas --> */

  /* <!-- Internal Constants --> */
  const FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Version Functions --> */
  FN.versions = {
    
    v1_1 : () => ({
      
      db: {
        name: id => `Tasks_${id}`,
        file: "docket.db",
      },
      
      names: {
        spreadsheet: "EDUC.IO | Docket Data",
        sheet: "Tasks",
      },
      
      schema: {
        version: 1.1,
        colour: [0.545, 0.153, 0.153],
      },
      
      options: {
        ingest: false,
        always_hash: false,
        check: true
      },
      
      property: {
        name: "DOCKET",
        value: "DATA",
      },

      sheets: {
        sheet_tasks: {
          key: "SHEET_NAME",
          value: "TASKS",
        },
        sheet_archive: {
          key: "SHEET_ARCHIVE",
        },
      },
      
      columns: {
        
        /* <!-- Database | Spreadsheet Columns --> */
        type: {
          key: "COLUMN_NAME",
          value: "TYPE",
          _meta: {
            group: "Meta",
            title: "Type",
            index: true,
            hash: true,
          }
        }, /* <!-- Type of Task | Normally Empty --> */
        
        from: {
          key: "COLUMN_NAME",
          value: "FROM",
          _meta: {
            title: "From",
            type: "date",
            index: true,
            hash: true,
          }
        }, /* <!-- Date of Starting Task --> */
        
        order: {
          key: "COLUMN_NAME",
          value: "ORDER",
          _meta: {
            title: "Order",
            width: 80,
            index: true,
            hash: true,
            type: "int",
          }
        }, /* <!-- Overriding Order of Task in Daily Docket --> */
        
        status: {
          key: "COLUMN_NAME",
          value: "STATUS",
          _meta: {
            title: "Status",
            width: 100,
            index: true,
            hash: true,
          }
        }, /* <!-- Current Status of Task --> */
        
        done: {
          key: "COLUMN_NAME",
          value: "DONE",
          _meta: {
            title: "Done",
            type: "date",
            index: true,
          }
        }, /* <!-- Date of Completing Task --> */
        
        tags: {
          key: "COLUMN_NAME",
          value: "TAGS",
          _meta: {
            group: "Data",
            title: "Tags",
            width: 200,
            type: "markdown",
            hash: true,
          }
        }, /* <!-- Tags Associated with Task --> */
        
        details: {
          key: "COLUMN_NAME",
          value: "DETAILS",
          _meta: {
            title: "Details",
            width: 500,
            type: "markdown",
            hash: true,
          }
        }, /* <!-- Task Details | Description --> */
        /* <!-- Database | Spreadsheet Columns --> */
        
        
        /* <!-- Database | Item Headers --> */
        badges: {
          value: "BADGES",
        }, /* <!-- Badge Array parsed from Tags --> */
        
        time: {
          value: "TIME",
          parsed: "TIME_PARSED", /* <!-- Parsed from Time string --> */
        }, /* <!-- Time string extracted from Details --> */

        duration: {
          value: "DURATION",
          parsed: "DURATION_PARSED", /* <!-- Parsed from Duration string --> */
        }, /* <!-- Duration string extracted from Details --> */
        
        due: {
          value: "DUE",
          parsed: "DUE_PARSED", /* <!-- Parsed from Due string --> */
        }, /* <!-- Due date extracted from Details --> */
        
        countdown: {
          value: "COUNTDOWN",
        }, /* <!-- Number of Days before Item is Due --> */
        
        dormancy: {
          value: "DORMANCY",
        }, /* <!-- Duration of Dormancy --> */
        /* <!-- Database | Item Headers --> */
        
        
        /* <!-- Boolean | Item IS / HAS / IN --> */
        is_complete: {
          value: "IS_COMPLETE"
        }, /* <!-- Whether Task is marked as Complete --> */
        
        is_timed: {
          value: "IS_TIMED"
        }, /* <!-- Whether Task has a valid time --> */
        
        has_duration: {
          value: "HAS_DURATION"
        }, /* <!-- Whether Task has a valid duration --> */
        
        has_tags: {
          value: "HAS_TAGS"
        }, /* <!-- Whether Task has any valid tags --> */
        
        has_projects: {
          value: "HAS_PROJECTS"
        }, /* <!-- Whether Task has any valid projects --> */
        
        has_assignations: {
          value: "HAS_ASSIGNATIONS"
        }, /* <!-- Whether Task has any valid assignations --> */
        
        has_labels: {
          value: "HAS_LABELS"
        }, /* <!-- Whether Task has any valid labels --> */
        
        in_future: {
          value: "IN_FUTURE"
        }, /* <!-- Whether Task starts in the future --> */
        
        scheduled_in: {
          value: "SCHEDULED_IN"
        }, /* <!-- When the Task starts in the future --> */
        
        is_zombie: {
          value: "IS_ZOMBIE"
        }, /* <!-- Whether Task is now a Zombie | Pre-Ghost --> */
        
        is_ghost: {
          value: "IS_GHOST"
        }, /* <!-- Whether Task is now a Ghost --> */
        
        /* <!-- Database | Item Headers --> */
        
      },
      
      enums: {
        
        status: {
          ready: "READY",
          underway: "IN PROGRESS",
          complete: "COMPLETE"
        }
        
      }
      
    }),
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    latest: FN.versions.v1_1,
    
    metadata: FN.versions.v1_1.metadata,
    
    version: id => FN.versions[id = `v${id.replace(/\./g, "_")}`] ? FN.versions[id]() : false,
    
  };
  /* <!-- External Visibility --> */

};