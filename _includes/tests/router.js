Router = function() {
  "use strict";

  /* <!-- HELPER: Form data to/from JSON Object --> */
  /* <!-- PARAMETERS: Options (see below) and a factory context (to generate modules, helpers etc) --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags --> */

  /* <!-- Internal Constants --> */
  const FACTORY = this;
  const APP = FACTORY.App,
    RACE = APP.race(3000),
    DELAY = APP.delay,
    RANDOM = APP.random,
    PAUSE = () => DELAY(RANDOM(300, 500)),
    STATE = FACTORY.Display.state();
  const STATE_TEST_1 = "test-1",
    STATE_TEST_2 = "test-2",
    STATE_TEST_3 = "test-3",
    STATE_TEST_4 = "test-4";
  const SUCCESS = "SUCCEEDED",
    FAILURE = "FAILED";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Setup --> */

  /* <!-- Internal Setup --> */

  /* <!-- Internal Variables --> */
  var expect, _route, _tests = {
    simple: false,
    state: false,
    complex: false,
    range: false,
    length: false,
    partial: false,
  };
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _routed = () => true;

  var _initialise = () => {

    APP.hooks.start.push(() => {
      FACTORY.Flags.log("Router Start Called");
    });

    APP.hooks.test.push(() => {
      FACTORY.Flags.log("Router Test Called");
    });

    APP.hooks.clear.push(() => {
      FACTORY.Flags.log("Router Clear Called");
    });

    APP.hooks.routes.test_override_4 = {
      matches: [/^TEST$/i, /^OVERRIDE$/i],
      length: 2,
      state: STATE_TEST_1,
      fn: command => (_tests.length = (STATE.enter(STATE_TEST_3) && command.length == 2 && command[0] === "abcd12345" && command[1] === "efgh67890")) && _routed(command),
    };

    APP.hooks.routes.test_override_3 = {
      matches: [/^TEST$/i, /^RANGE$/i],
      length: {
        min: 3,
        max: 5
      },
      fn: command => (_tests.range = (command.length >= 3 && command.length <= 5)) && _routed(command),
    };

    APP.hooks.routes.test_override_2 = {
      matches: [/^TEST$/i, /^OVERRIDE$/i],
      length: 1,
      state: STATE_TEST_1,
      fn: command => (_tests.complex = (STATE.enter(STATE_TEST_2) && command === "abcd12345")) && _routed(command),
    };

    APP.hooks.routes.test_override_1 = {
      matches: [/^TEST$/i, /^OVERRIDE$/i],
      length: 0,
      keys: "p",
      fn: command => (_tests.state = (STATE.enter(STATE_TEST_1) && command === null)) && _routed(command),
    };

    APP.hooks.routes.load_override = {
      matches: [/^LOAD$/i, /^ITEM$/i],
      fn: () => false,
    };

    APP.hooks.routes.test_override_5 = {
      matches: [/^TEST$/i, /^OVERRIDE$/i],
      length: 3,
      state: STATE_TEST_1,
      fn: command => (_tests.length = (STATE.enter(STATE_TEST_4) && command.length == 3 && command[0] === "abcd12345" && command[1] === "efgh67890" && command[2] === "TRUE")) && _routed(command),
    };

    APP.hooks.routes.test_override_6 = {
      matches: [/^TEST$/i, /^OVERRIDE$/i, /^OVERRIDE$/i],
      length: 0,
      keys: "r",
      fn: command => (_tests.state = (STATE.enter(STATE_TEST_4) && command === null)) && _routed(command),
    };

    APP.hooks.routes.test = {
      matches: /^TEST$/i,
      fn: command => _tests.simple = (command === null),
    };

    APP.hooks.routes.test_override_7 = {
      matches: /TEST$/i,
      fn: command => _tests.partial = (command === null),
    };

    APP.hooks.route.push((handled, command) => {
      if (_route) _route(handled, command);
    });

  };

  var _simple = (name, hash, tests) => PAUSE().then(
    () => RACE(new Promise(resolve => {
      (_routed = () => true) && (_route = (handled, command) => tests(handled, command, hash)
        .then(value => resolve(FACTORY.Flags.log(`${name} Test ${SUCCESS}`).reflect(value)))
        .catch(err => resolve(FACTORY.Flags.error(`${name} Test ${FAILURE}`, err).reflect(false))));
      window.location.hash = hash;
    }))
  );
  /* <!-- Internal Functions --> */

  /* <!-- Initial Configuration --> */
  _initialise();
  /* <!-- Initial Configuration --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => {

      /* <!-- Set Up Testing Framework --> */
      expect = chai.expect;

      /* <!-- Custom Settings --> */
      _route = null;

      for (var test in _tests) _tests[test] = false;
      
      STATE.clear();

      return FACTORY.Flags.log("Test START Called").reflect(true);

    },

    test_Router_Simple: () =>
      _simple("Simple Router", "test", (handled, command, hash) => new Promise(resolve => {
        expect(_tests.simple).to.be.true;
        expect(handled).to.be.true;
        expect(command).to.be.ok.and.to.equal(hash);
        resolve(true);
      })),

    test_Router_Missed: () =>
      _simple("Missed Router", "testier", (handled, command, hash) => new Promise(resolve => {
        expect(_tests.simple).to.be.false;
        expect(handled).to.be.false;
        expect(command).to.be.ok.and.to.equal(hash);
        resolve(true);
      })),

    test_Router_Partial: () =>
      _simple("Partial Router", "a_test", (handled, command, hash) => new Promise(resolve => {
        expect(_tests.partial).to.be.true;
        expect(handled).to.be.true;
        expect(command).to.be.ok.and.to.equal(hash);
        resolve(true);
      })),

    test_Router_State: () =>
      _simple("State Router", "test.override", (handled, command) => new Promise(resolve => {
        expect(_tests.state).to.be.true;
        expect(handled).to.be.true;
        expect(STATE.in(STATE_TEST_1)).to.be.true;
        expect(command).to.have.lengthOf(2);
        resolve(true);
      })),

    test_Router_Complex: () => {
      STATE.enter(STATE_TEST_1);
      return _simple("Complex Router", "test.override.abcd12345", (handled, command) => new Promise(resolve => {
        expect(_tests.complex).to.be.true;
        expect(handled).to.be.true;
        expect(STATE.in([STATE_TEST_1, STATE_TEST_2])).to.be.true;
        expect(command).to.have.lengthOf(3);
        resolve(true);
      }));
    },

    test_Router_Range: () =>
      _simple("Range Router [1]", "test.range.first.second.third.fourth", (handled, command) => new Promise(resolve => {
        expect(_tests.range).to.be.true;
        expect(handled).to.be.true;
        expect(command).to.have.lengthOf(6);
        _simple("Range Router [2]", "test.range.first.second.third.fourth.fifth.sixth", (handled, command) => new Promise(resolve => {
          expect(handled).to.be.false;
          expect(command).to.have.lengthOf(8);
          resolve(true);
        })).then(value => resolve(value));
      })),

    test_Router_Length: () => {
      STATE.enter(STATE_TEST_1);
      return _simple("Length Router [1]", "test.override.abcd12345.efgh67890", (handled, command) => new Promise(resolve => {
        expect(_tests.length).to.be.true;
        expect(handled).to.be.true;
        expect(command).to.have.lengthOf(4);
        expect(STATE.in([STATE_TEST_1, STATE_TEST_3])).to.be.true;
        _tests.length = false;
        _simple("Length Router [2]", "test.override.abcd12345.efgh67890.TRUE", (handled, command) => new Promise(resolve => {
          expect(_tests.length).to.be.true;
          expect(handled).to.be.true;
          expect(command).to.have.lengthOf(5);
          expect(STATE.in([STATE_TEST_1, STATE_TEST_3, STATE_TEST_4])).to.be.true;
          resolve(true);
        })).then(value => resolve(value));
      }));
    },

    test_Router_KeyPress: () => PAUSE().then(
      () => RACE(new Promise(resolve => {
        _routed = () => {
          if (_tests.state === true && STATE.in(STATE_TEST_1)) {
            _routed = () => {
              resolve(_tests.state === true && STATE.in(STATE_TEST_4));
              return true;
            };
            window.document.dispatchEvent(new KeyboardEvent("keypress", {
              "keyCode": 82,
              "which": 82
            }));
          } else {
            resolve(false);
          }
          return true;
        };
        window.document.dispatchEvent(new KeyboardEvent("keypress", {
          "keyCode": 80,
          "which": 80
        }));
      }))
    ),

    finish: () => FACTORY.Flags.log("FINISH Called").reflect(true),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};