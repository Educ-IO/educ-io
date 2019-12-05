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
    
    v1 : () => ({
      
      db: {
        name: id => `Book_${id}`,
        file: "book.db",
      },
      
      names: {
        spreadsheet: "EDUC.IO | Bookings",
        sheet: "Bookings",
      },
      
      schema: {
        version: 1,
        colour: [0.89, 0, 0.847],
      },
      
      options: {
        ingest: true,
        always_hash: true,
        check: true
      },
      
      property: {
        name: "EDUC-IO-BOOK",
        value: "DATA",
      },

      sheets: {
        sheet_tasks: {
          key: "SHEET_NAME",
          value: "LOANS",
        },
      },
      
      columns: {
        
        /* <!-- Database | Spreadsheet Columns --> */
        calendar: {
          key: "COLUMN_NAME",
          value: "CALENDAR",
          _meta: {
            group: "Booking",
            title: "Calendar",
            width: 85,
            index: true,
            hash: true,
          }
        }, /* <!-- Calendar ID --> */
        
        event: {
          key: "COLUMN_NAME",
          value: "EVENT",
          _meta: {
            group: "Booking",
            title: "Event",
            width: 65,
            index: true,
            hash: true,
          }
        }, /* <!-- Event ID --> */
        
        resource: {
          key: "COLUMN_NAME",
          value: "RESOURCE",
          _meta: {
            group: "Equipment",
            title: "Resource",
            index: true,
            hash: true,
          }
        }, /* <!-- Equipment Resource --> */
        
        name: {
          key: "COLUMN_NAME",
          value: "NAME",
          _meta: {
            group: "Equipment",
            title: "Name",
            index: true,
            hash: true,
          }
        }, /* <!-- Equipment Name --> */
        
        identifier: {
          key: "COLUMN_NAME",
          value: "IDENTIFIER",
          _meta: {
            group: "Equipment",
            title: "Identifier",
            index: true,
            hash: true,
          }
        }, /* <!-- Equipment Identifier --> */
        
        /* <!-- Loan Details --> */
        loaned: {
          key: "COLUMN_NAME",
          value: "LOANED",
          _meta: {
            group: "Loan",
            title: "Loaned",
            type: "date",
            width: 160,
            index: true,
            hash: true,
          }
        }, /* <!-- Loaned Date --> */
        
        loaned_by: {
          key: "COLUMN_NAME",
          value: "LOANED_BY",
          _meta: {
            group: "Loan",
            title: "Loaned By",
            index: true,
            hash: true,
          }
        }, /* <!-- Loaned By --> */
        
        loaned_to: {
          key: "COLUMN_NAME",
          value: "LOANED_TO",
          _meta: {
            group: "Loan",
            title: "Loaned To",
            index: true,
            hash: true,
          }
        }, /* <!-- Loaned To --> */
        
        /* <!-- Return Details --> */
        returned: {
          key: "COLUMN_NAME",
          value: "RETURNED",
          _meta: {
            group: "Return",
            title: "Returned",
            type: "date",
            width: 160,
            index: true,
            hash: true,
          }
        }, /* <!-- Returned Date --> */
        
        returned_by: {
          key: "COLUMN_NAME",
          value: "RETURNED_BY",
          _meta: {
            group: "Return",
            title: "Returned By",
            index: true,
            hash: true,
          }
        }, /* <!-- Returned By --> */
        
        returned_to: {
          key: "COLUMN_NAME",
          value: "RETURNED_TO",
          _meta: {
            group: "Return",
            title: "Returned To",
            index: true,
            hash: true,
          }
        }, /* <!-- Returned To --> */
        /* <!-- Database | Spreadsheet Columns --> */
        
        
        /* <!-- Database | Item Headers --> */
        status: {
          value: "STATUS",
        }, /* <!-- Status of Booking --> */
        /* <!-- Database | Item Headers --> */
        
        
        /* <!-- Boolean | Item IS / HAS / IN --> */
        is_loaned: {
          value: "IS_LOANED"
        }, /* <!-- Whether Booking has been Loaned --> */
        
        is_returned: {
          value: "IS_RETURNED"
        }, /* <!-- Whether Task has been Returned --> */
        
        /* <!-- Database | Item Headers --> */
        
      },
      
      enums: {
        
        status: {
          ready: "READY",
          loaned: "LOANED",
          returned: "RETURNED"
        }
        
      }
      
    }),
    
  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    latest: FN.versions.v1,
    
    metadata: FN.versions.v1.metadata,
    
    version: id => FN.versions[id = `v${id.replace(/\./g, "_")}`] ? FN.versions[id]() : false,
    
  };
  /* <!-- External Visibility --> */

};