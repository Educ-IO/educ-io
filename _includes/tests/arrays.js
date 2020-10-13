Arrays = function() {
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
  var expect;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => (expect = chai.expect, FACTORY.Flags.log("START Called").reflect(true)),

    sortColumns: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          /* <!-- Test Conditions --> */
          expect(Array.columnSort(["B", "A", "C"], [[2, 1, 3]]))
            .to.be.an("array")
            .and.to.have.lengthOf(2);
          
          expect(Array.columnSort(["B", "A", "C"], [[2, 1, 3]])[0])
            .to.be.an("array")
            .and.to.have.lengthOf(3)
            .to.have.ordered.members(["A", "B", "C"]);
          
          expect(Array.columnSort(["Z", "Y", "B", "A", "C"], [[99, 98, 2, 1, 3]], null, 2)[0])
            .to.be.an("array")
            .and.to.have.lengthOf(5)
            .to.have.ordered.members(["Z", "Y", "A", "B", "C"]);

          expect(Array.columnSort(["B", "A", "C"], [[2, 1, 3]])[1])
            .to.be.an("array")
            .and.to.have.lengthOf(1);
          
          expect(Array.columnSort(["B", "A", "C"], [[2, 1, 3], [5, 4, 6]])[1][0])
            .to.be.an("array")
            .and.to.have.lengthOf(3)
            .to.have.ordered.members([1, 2, 3]);
          
          expect(Array.columnSort(["B", "A", "C"], [[2, 1, 3], [5, 4, 6]])[1][1])
            .to.be.an("array")
            .and.to.have.lengthOf(3)
            .to.have.ordered.members([4, 5, 6]);
          
          expect(Array.columnSort(["Z", "Y", "B", "A", "C"], [[99, 98, 2, 1, 3], [100, 99, 5, 4, 6]], null, 2)[1][1])
            .to.be.an("array")
            .and.to.have.lengthOf(5)
            .to.have.ordered.members([100, 99, 4, 5, 6]);
          
          resolve(FACTORY.Flags.log("Column Sort Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Column Sort Test FAILED", err).reflect(false));
        }

      });

    }),
    
    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};