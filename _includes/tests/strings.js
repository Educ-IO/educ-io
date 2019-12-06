Strings = function() {
  "use strict";

  /* <!-- HELPER: Form data to/from JSON Object --> */
  /* <!-- PARAMETERS: Options (see below) and a factory context (to generate modules, helpers etc) --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const DELAY = FACTORY.App.delay,
    RANDOM = FACTORY.App.random,
    PAUSE = () => DELAY(RANDOM(500, 1000));
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var expect, strings;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => (expect = chai.expect, strings = FACTORY.Strings(), FACTORY.Flags.log("START Called").reflect(true)),

    test_Sort: () => DELAY(RANDOM(200, 2000)).then(() =>
      FACTORY.Flags.log("TEST SORT Complete").reflect(true)),
    
    sort: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          /* <!-- Test Conditions --> */
          expect(["B", "A", "C"].sort())
            .to.have.lengthOf(3)
            .to.have.ordered.members(["A", "B", "C"]);
          
          expect(["B", "C", "A"].sort(strings.sort()))
            .to.have.lengthOf(3)
            .to.have.ordered.members(["A", "B", "C"]);
          
          expect(["B B", "B A", "B", "B C"].sort(strings.sort()))
            .to.have.lengthOf(4)
            .to.have.ordered.members(["B", "B A", "B B", "B C"]);

          expect(["Example 2", "Example 1", "Example 5.1", "Example 5"].sort(strings.sort()))
            .to.have.lengthOf(4)
            .to.have.ordered.members(["Example 1", "Example 2", "Example 5", "Example 5.1"]);
          
          expect(_.pluck([{name:"Example 2"}, {name:"Example 1"}, {name:"Example 5.1"}, {name:"Example 5"}]
                         .sort(strings.sort("name")), "name"))
            .to.have.lengthOf(4)
            .to.have.ordered.members(["Example 1", "Example 2", "Example 5", "Example 5.1"]);
          
          expect(["Device 20", "Device 10", "Device 5", "Device 1", "Device 14"].sort(strings.sort()))
            .to.have.lengthOf(5)
            .to.have.ordered.members(["Device 1", "Device 5", "Device 10", "Device 14", "Device 20"]);
          
          if (window.Intl && Intl.Collator) {
            var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: "base"});
            expect(["Device 20", "Device 10", "Device 5", "Device 1", "Device 14"].sort(collator.compare))
              .to.have.lengthOf(5)
              .to.have.ordered.members(["Device 1", "Device 5", "Device 10", "Device 14", "Device 20"]);
          }
          
          resolve(FACTORY.Flags.log("Sort Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Sort Test FAILED", err).reflect(false));
        }

      });

    }),
    
    stringify: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          /* <!-- Test Conditions --> */
          expect(strings.stringify({a: 1, b: 2, c: 3}))
            .to.be.a("string")
            .that.equals(JSON.stringify({a: 1, b: 2, c: 3}));
          
          expect(strings.stringify({c: 3, a: 1, b: 2}))
            .to.be.a("string")
            .that.equals(JSON.stringify({a: 1, b: 2, c: 3}));
          
          resolve(FACTORY.Flags.log("Stringify Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Stringify Test FAILED", err).reflect(false));
        }

      });

    }),

    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};