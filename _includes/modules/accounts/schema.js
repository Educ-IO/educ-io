Schema = () => {
  "use strict";

  /* <!-- MODULE: Provides an interface to create / load / manipulate stored credentials --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore | App Scope: Google --> */

  /* <!-- Internal Constants --> */

  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    PROPERTIES: {
      property_data: {
        key: "ACCOUNTS",
        value: "DATA",
      },
    },
    NAMES: {
      spreadsheet: "Educ.IO | Accounts Data",
      sheet: "Accounts",
    },
    SCHEMA: {
      schema_version: {
        key: "SCHEMA_VERSION",
        value: "1.0",
      },
      schema_colour: {
        red: 0.545,
        green: 0.153,
        blue: 0.153
      }
    },
    SHEETS: {
      sheet_credentials: {
        key: "SHEET_NAME",
        value: "CREDENTIALS",
      },
    },
    ROWS: {
      row_headers: {
        key: "ROW_HEADERS",
        visibility: "DOCUMENT"
      },
    },
    COLUMNS: {
      column_name: {
        key: "COLUMN_NAME",
        value: "NAME",
        _meta: {
          group: "Meta",
          title: "Name",
          width: 100,
          index: true,
        }
      },
      column_url: {
        key: "COLUMN_NAME",
        value: "URL",
        _meta: {
          group: "Meta",
          title: "Url",
          width: 150,
          index: true,
        }
      },
      column_type: {
        key: "COLUMN_NAME",
        value: "TYPE",
        _meta: {
          group: "Meta",
          title: "Url",
          width: 150,
          index: true,
        }
      },
      column_tags: {
        key: "COLUMN_NAME",
        value: "TAGS",
        _meta: {
          group: "Meta",
          title: "Tags",
          width: 200,
          type: "markdown",
        }
      },
      column_description: {
        key: "COLUMN_NAME",
        value: "DESCRIPTION",
        _meta: {
          group: "Meta",
          title: "Description",
          width: 200,
        }
      },
      column_notes: {
        key: "COLUMN_NAME",
        value: "NOTES",
        group: "Data",
        _meta: {
          title: "Details",
          width: 500,
          type: "markdown",
        }
      },
      column_username: {
        key: "COLUMN_NAME",
        value: "USERNAME",
        _meta: {
          group: "Data",
          title: "Username",
          width: 100,
          index: true,
        }
      },
      column_password: {
        key: "COLUMN_NAME",
        value: "PASSWORD",
        _meta: {
          group: "Secure",
          title: "Description",
          width: 200,
          index: true,
        }
      },
      column_extras: {
        key: "COLUMN_NAME",
        value: "EXTRAS",
        _meta: {
          group: "Secure",
          title: "Description",
          width: 500,
          index: true,
        }
      },
    }
  };
  /* <!-- External Visibility --> */

};