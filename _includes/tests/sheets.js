Sheets = function() {
  "use strict";

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    PAUSE = () => DELAY(RANDOM(500, 1000));
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var expect;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => {

      /* <!-- Set Up Testing Framework --> */
      expect = chai.expect;

      return FACTORY.Flags.log("START Called").reflect(true);

    },

    colours: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          var _colours = FACTORY.Colours({}).parse,
            _convert = FACTORY.Colours({}).convert;

          /* <!-- Test Conditions --> */
          expect(_colours("#ccc"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([204, 204, 204]);

          expect(_colours("#123"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([17, 34, 51]);

          expect(_colours("#aaaaaa"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([170, 170, 170]);

          expect(_colours("rgb(204, 51, 153)"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([204, 51, 153]);

          expect(_colours("rgb(204, 51, 153)"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([204, 51, 153]);

          expect(_colours("rgb(204, 51, 153)"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([204, 51, 153]);

          expect(_colours("deeppink"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([255, 20, 147]);

          expect(_colours("deeperpink"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([0, 0, 0]);

          expect(_colours("#FF1493"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([255, 20, 147]);

          expect(_colours("hsl(328, 100%, 54%)"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([255, 20, 146]);

          expect(_colours("rgba(204, 51, 153, 1)"))
            .to.have.lengthOf(3)
            .to.have.ordered.members([204, 51, 153]);

          expect(_colours("rgba(204, 51, 153, 0.5)"))
            .to.have.lengthOf(4)
            .to.have.ordered.members([204, 51, 153, 0.5]);


          expect(_convert(_colours("rgba(204, 51, 153, 0.5)")))
            .to.have.lengthOf(4)
            .to.have.ordered.members([0.8, 0.2, 0.6, 0.5]);

          resolve(FACTORY.Flags.log("Colours Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Colours Test FAILED", err).reflect(false));
        }

      });

    }),

    formats: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          var _format = FACTORY.Google_Sheets_Format({}, FACTORY),
            _grid = FACTORY.Google_Sheets_Grid({});

          /* <!-- Test Conditions --> */
          expect(_format.wrap("wrap"))
            .to.be.an("object")
            .and.to.have.property("wrapStrategy", "WRAP");

          expect(_format.foreground("#111213"))
            .to.be.an("object")
            .and.to.have.property("foregroundColor")
            .to.deep.include({
              red: 0.067,
              green: 0.071,
              blue: 0.075
            });

          expect(_format.background("#131211"))
            .to.be.an("object")
            .and.to.have.property("backgroundColor")
            .to.deep.include({
              red: 0.075,
              green: 0.071,
              blue: 0.067
            });

          var _text = _format.text("#aaa", 10, true);
          expect(_text)
            .to.be.an("object")
            .and.to.have.property("textFormat")
            .to.have.property("foregroundColor")
            .to.deep.include({
              red: 0.667,
              green: 0.667,
              blue: 0.667
            });
          expect(_text)
            .to.have.nested.property("textFormat.bold", true);
          expect(_text)
            .to.have.nested.property("textFormat.fontSize", 10);

          var _cells = _format.cells(_grid.rows(1, 10).range(), [
            _format.background("DarkGoldenRod"),
            _format.align.horizontal("CENTER"),
            _format.align.vertical("MIDDLE"),
            _format.text("#ccc", 12, false, true),
            _format.wrap("wrap")
          ]);

          expect(_cells)
            .to.be.an("object")
            .to.have.property("repeatCell")
            .to.deep.include({
              "range": {
                "sheetId": 0,
                "startRowIndex": 1,
                "endRowIndex": 10
              }
            });
          expect(_cells)
            .to.have.nested.property("repeatCell.cell.userEnteredFormat.backgroundColor.green", 0.525);
          expect(_cells)
            .to.have.nested.property("repeatCell.cell.userEnteredFormat.textFormat.italic", true);
          expect(_cells)
            .to.not.have.nested.property("repeatCell.cell.userEnteredFormat.textFormat.bold", true);
          expect(_cells)
            .to.have.nested.property("repeatCell.cell.userEnteredFormat.horizontalAlignment", "CENTER");
          expect(_cells)
            .to.have.nested.property("repeatCell.cell.userEnteredFormat.verticalAlignment", "MIDDLE");
          expect(_cells)
            .to.have.nested.property("repeatCell.cell.userEnteredFormat.wrapStrategy", "WRAP");
          expect(_cells)
            .to.have.nested.property("repeatCell.fields", "userEnteredFormat(backgroundColor,horizontalAlignment,verticalAlignment,textFormat,wrapStrategy)");

          resolve(FACTORY.Flags.log("Formats Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Formats Test FAILED", err).reflect(false));
        }

      });

    }),

    grid: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          var _grid = FACTORY.Google_Sheets_Grid({
            sheet: 99
          });

          /* <!-- Test Conditions --> */
          expect(_grid.columns(1, 10).dimension(100))
            .to.be.an("object")
            .and.to.eql({
              "range": {
                "sheetId": 99,
                "dimension": "COLUMNS",
                "startIndex": 1,
                "endIndex": 10
              },
              "properties": {
                "pixelSize": 100
              },
              "fields": "pixelSize"
            });

          expect(_grid.columns(20, 29).range())
            .to.be.an("object")
            .and.to.eql({
              "sheetId": 99,
              "startColumnIndex": 20,
              "endColumnIndex": 29
            });

          expect(_grid.rows(11, 12).dimension(50))
            .to.be.an("object")
            .and.to.eql({
              "range": {
                "sheetId": 99,
                "dimension": "ROWS",
                "startIndex": 11,
                "endIndex": 12
              },
              "properties": {
                "pixelSize": 50
              },
              "fields": "pixelSize"
            });

          expect(_grid.rows(13, 100).range())
            .to.be.an("object")
            .and.to.eql({
              "sheetId": 99,
              "startRowIndex": 13,
              "endRowIndex": 100
            });

          expect(_grid.range(1, 2, 3, 4))
            .to.be.an("object")
            .and.to.eql({
              "sheetId": 99,
              "startRowIndex": 1,
              "endRowIndex": 2,
              "startColumnIndex": 3,
              "endColumnIndex": 4
            });

          expect(_grid.dimension("COLUMNS", 1, 2))
            .to.be.an("object")
            .and.to.eql({
              "sheetId": 99,
              "dimension": "COLUMNS",
              "startIndex": 1,
              "endIndex": 2
            });

          resolve(FACTORY.Flags.log("Grid Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Grid Test FAILED", err).reflect(false));
        }

      });

    }),

    metadata: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          var _meta = FACTORY.Google_Sheets_Metadata({
            sheet: 99
          }, FACTORY);

          /* <!-- Test Conditions --> */

          var location_1 = _meta.location.spreadsheet();
          expect(location_1)
            .to.be.an("object")
            .and.to.eql({
              "spreadsheet": true
            });

          var location_2 = _meta.location.sheet();
          expect(location_2)
            .to.be.an("object")
            .and.to.eql({
              "sheetId": 99
            });

          var location_3 = _meta.location.columns(1, 10);
          expect(location_3)
            .to.be.an("object")
            .and.to.eql({
              "dimensionRange": {
                "sheetId": 99,
                "dimension": "COLUMNS",
                "startIndex": 1,
                "endIndex": 10
              }
            });

          var location_4 = _meta.location.rows(2, 200);
          expect(location_4)
            .to.be.an("object")
            .and.to.eql({
              "dimensionRange": {
                "sheetId": 99,
                "dimension": "ROWS",
                "startIndex": 2,
                "endIndex": 200
              }
            });


          var filters = [
            _meta.filter().location(location_1).key("TEST_1").make(),
            _meta.filter().location(location_2).key("TEST_2").make()
          ];
          expect(filters)
            .to.be.an("array")
            .to.have.lengthOf(2);

          expect(_.find(filters,
              m => m.developerMetadataLookup.metadataKey == "TEST_1"))
            .to.eql({
              "developerMetadataLookup": {
                "metadataKey": "TEST_1",
                "visibility": "DOCUMENT",
                "metadataLocation": {
                  "spreadsheet": true
                }
              }
            });

          expect(_.find(filters,
              m => m.developerMetadataLookup.metadataKey == "TEST_2"))
            .to.eql({
              "developerMetadataLookup": {
                "metadataKey": "TEST_2",
                "visibility": "DOCUMENT",
                "metadataLocation": {
                  "sheetId": 99
                }
              }
            });

          resolve(FACTORY.Flags.log("Metadata Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Metadata Test FAILED", err).reflect(false));
        }

      });

    }),

    notation: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          var _notation = FACTORY.Google_Sheets_Notation();

          /* <!-- Test Conditions --> */
          expect(_notation.convert("D99"))
            .to.be.a("string")
            .and.to.equal("R99C4");

          expect(_notation.convert("A1"))
            .to.be.a("string")
            .and.to.equal("R1C1");

          expect(_notation.convert("R1C2"))
            .to.be.a("string")
            .and.to.equal("B1");

          expect(_notation.convertA1("B2"))
            .to.be.a("string")
            .and.to.equal("R2C2");

          expect(_notation.convertR1C1("R10C26"))
            .to.be.a("string")
            .and.to.equal("Z10");

          expect(_notation.convertR1C1("R10"))
            .to.be.a("string")
            .and.to.equal("10");

          expect(_notation.convertR1C1("C20"))
            .to.be.a("string")
            .and.to.equal("T");

          expect(_notation.range("R1C20:R10C20"))
            .to.be.a("string")
            .and.to.equal("T1:T10");

          expect(_notation.rangeR1C1("R1C20:C23"))
            .to.be.a("string")
            .and.to.equal("T1:W");

          expect(_notation.range("T1:T10"))
            .to.be.a("string")
            .and.to.equal("R1C20:R10C20");

          expect(_notation.range("A1:Z101"))
            .to.be.a("string")
            .and.to.equal("R1C1:R101C26");

          expect(_notation.grid(0, 9, 0, 9, true))
            .to.be.a("string")
            .and.to.equal("A1:J10");

          expect(_notation.grid(1, 10, 1, 10))
            .to.be.a("string")
            .and.to.equal("A1:J10");

          expect(_notation.grid(1, 10, 1, 27))
            .to.be.a("string")
            .and.to.equal("A1:AA10");

          expect(_notation.rowA1("A6"))
            .to.be.a("number")
            .and.to.equal(6);

          expect(_notation.columnA1("D6"))
            .to.be.a("number")
            .and.to.equal(4);

          expect(_notation.gridA1("A1:D6"))
            .to.be.an("array")
            .and.to.eql([1, 7, 1, 5]);

          expect(_notation.gridA1("A1:B5", true))
            .to.be.an("array")
            .and.to.eql([0, 5, 0, 2]);

          expect(_notation.clean("Sheet 1!A1:B5"))
            .to.be.an("string")
            .and.to.equal("A1:B5");

          resolve(FACTORY.Flags.log("Notation Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Notation Test FAILED", err).reflect(false));
        }

      });

    }),

    properties: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          var _properties = FACTORY.Google_Sheets_Properties({
            sheet: 99
          });

          /* <!-- Test Conditions --> */
          expect(_properties.grid.frozen.rows(2))
            .to.be.an("object")
            .and.to.have.property("frozenRowCount", 2);

          var _update = _properties.update([
            _properties.grid.frozen.rows(2),
            _properties.grid.frozen.columns(4)
          ]);

          expect(_update)
            .to.be.an("object")
            .to.have.property("updateSheetProperties")
            .to.deep.include({
              "properties": {
                "sheetId": 99,
                "gridProperties": {
                  "frozenRowCount": 2,
                  "frozenColumnCount": 4
                },
              }
            });
          expect(_update)
            .to.have.nested.property("updateSheetProperties.fields", "gridProperties.frozenRowCount,gridProperties.frozenColumnCount");

          resolve(FACTORY.Flags.log("Properties Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Properties Test FAILED", err).reflect(false));
        }

      });

    }),


    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};