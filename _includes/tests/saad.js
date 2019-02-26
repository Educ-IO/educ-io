SaaD = function() {
  "use strict";

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    RACE = FACTORY.App.race(20000),
    PAUSE = () => DELAY(RANDOM(1000, 2000));
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var expect, schema = {
    db: {
      name: "SaaD Test",
      file: "saad_test.db",
    },
    names: {
      spreadsheet: "Educ.IO | Debug SaaD Test",
      sheet: "Test",
    },
    schema: {
      version: 1,
      colour: [0.6, 0.6, 0.6],
    },
    metadata: {
      DEBUG: "TEST",
    },
    sheets: {
      sheet_credentials: {
        key: "SHEET_NAME",
        value: "EXAMPLE",
      },
    },
    columns: {
      column_name: {
        key: "COLUMN_NAME",
        value: "NAME",
        _meta: {
          group: "Meta",
          colour: "ead1dc",
          title: "Name",
          width: 100,
          index: true,
          hash: true
        }
      },
      column_url: {
        key: "COLUMN_NAME",
        value: "URL",
        _meta: {
          group: "Meta",
          colour: "ead1dc",
          title: "Url",
          width: 150,
          index: true,
          hash: true
        }
      },
      column_type: {
        key: "COLUMN_NAME",
        value: "TYPE",
        _meta: {
          group: "Meta",
          colour: "ead1dc",
          title: "Type",
          width: 150,
          index: true,
        }
      },
      column_username: {
        key: "COLUMN_NAME",
        value: "USERNAME",
        _meta: {
          group: "Data",
          colour: "ededed",
          title: "Username",
          width: 100,
          index: true,
          hash: true
        }
      },
      column_password: {
        key: "COLUMN_NAME",
        value: "PASSWORD",
        _meta: {
          group: "Secure",
          colour: "f1c9c9",
          title: "Password",
          width: 200,
          index: true,
        }
      },
      column_extras: {
        key: "COLUMN_NAME",
        value: "EXTRAS",
        _meta: {
          group: "Secure",
          colour: "f1c9c9",
          title: "Extras",
          width: 500,
          index: true,
        }
      },
      column_description: {
        key: "COLUMN_NAME",
        value: "DESCRIPTION",
        _meta: {
          group: "Context",
          title: "Description",
          width: 200,
        }
      },
      column_tags: {
        key: "COLUMN_NAME",
        value: "TAGS",
        _meta: {
          group: "Context",
          colour: "d9d7cd",
          title: "Tags",
          width: 200,
          type: "markdown",
        }
      },
      column_notes: {
        key: "COLUMN_NAME",
        value: "NOTES",
        _meta: {
          group: "Context",
          title: "Notes",
          width: 500,
          type: "markdown",
        }
      },
    }
  };
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => {

      /* <!-- Set Up Testing Framework --> */
      expect = chai.expect;

      FACTORY.Flags.log("START Called");

      /* <!-- Create DB Interface --> */
      return FACTORY.SaaD(schema, FACTORY);

    },

    create: db => RACE(new Promise(resolve => db.create()
      .then(sheet => {

        /* <!-- Test Conditions --> */
        expect(db.state)
          .to.be.an("object")
          .and.to.have.property("id");

        expect(sheet)
          .to.be.an("object")
          .and.to.have.property("properties");

        expect(sheet.properties.title)
          .to.equal(schema.names.spreadsheet);

        expect(sheet.sheets)
          .to.have.lengthOf(1);

        expect(sheet.sheets[0].developerMetadata)
          .to.have.lengthOf(2);

        expect(_.find(sheet.sheets[0].developerMetadata,
            m => m.metadataKey == "SCHEMA_VERSION"))
          .to.deep.include({
            metadataValue: String(schema.schema.version)
          });

        expect(_.find(sheet.sheets[0].developerMetadata,
            m => m.metadataKey == schema.sheets.sheet_credentials.key))
          .to.deep.include({
            metadataValue: schema.sheets.sheet_credentials.value
          })
          .and.deep.include({
            location: {
              "locationType": "SHEET",
              "sheetId": 0
            }
          });

        expect(sheet)
          .to.have.nested.property("sheets[0].properties.sheetId", 0);
        expect(sheet)
          .to.have.nested.property("sheets[0].properties.gridProperties.frozenRowCount", 2);

        expect(sheet.sheets[0].merges)
          .to.have.lengthOf(3)
          .and.to.deep.include({
            "startRowIndex": 0,
            "endRowIndex": 1,
            "startColumnIndex": 0,
            "endColumnIndex": 3
          })
          .and.to.deep.include({
            "startRowIndex": 0,
            "endRowIndex": 1,
            "startColumnIndex": 4,
            "endColumnIndex": 6
          })
          .and.to.deep.include({
            "startRowIndex": 0,
            "endRowIndex": 1,
            "startColumnIndex": 6,
            "endColumnIndex": 9
          });

        db.close();

      })
      .then(() => resolve(FACTORY.Flags.log("Create Test SUCCEEDED").reflect(true)))
      .catch(err => resolve(FACTORY.Flags.error("Create Test FAILED", err).reflect(false)))
      .then(() => db.state.id && !FACTORY.Display.state().in("traces") ? PAUSE().then(() => FACTORY.Google.files.delete(db.state.id)) : false)
    )),

    open: db => RACE(new Promise(resolve => db.create()
      .then(sheet => db.open(sheet.spreadsheetId, schema.sheets.sheet_credentials))
      .then(db => {

        expect(db)
          .to.be.an("object")
          .and.to.have.property("name")
          .and.to.eql(schema.db);

        expect(db.data)
          .to.have.lengthOf(0);

        expect(db.idIndex)
          .to.have.lengthOf(0);

        expect(db.binaryIndices)
          .and.deep.include({
            "__ROW": {
              "name": "__ROW",
              "dirty": false,
              "values": []
            }
          });

      })
      .then(() => resolve(FACTORY.Flags.log("Open Test SUCCEEDED").reflect(true)))
      .catch(err => resolve(FACTORY.Flags.error("Open Test FAILED", err).reflect(false)))
      .then(() => db.state.id ? PAUSE().then(() => FACTORY.Google.files.delete(db.state.id)) : false)
    )),

    query: () => DELAY(RANDOM(300, 3000)).then(() =>
      FACTORY.Flags.log("QUERY Complete").reflect(true)),

    finish: value =>
      FACTORY.Flags.log(`FINISH [Test = ${value.test} | Result = ${value.result}] Called`),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};