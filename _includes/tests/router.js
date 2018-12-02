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
  /* <!-- Internal Constants --> */

  /* <!-- Internal Setup --> */

  /* <!-- Internal Setup --> */

  /* <!-- Internal Variables --> */
  var _route, _tests = {
    simple: false,
    state: false,
    complex: false,
    range: false,
    length: false,
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
      matches: [/TEST/i, /OVERRIDE/i],
      length: 2,
      state: STATE_TEST_1,
      fn: command => (_tests.length = (STATE.enter(STATE_TEST_3) && command.length == 2 && command[0] === "abcd12345" && command[1] === "efgh67890")) && _routed(command),
    };
    
    APP.hooks.routes.test_override_3 = {
      matches: [/TEST/i, /RANGE/i],
      length: {
        min: 3,
        max: 5
      },
      fn: command => (_tests.range = (command.length >= 3 && command.length <= 5)) && _routed(command),
    };

    APP.hooks.routes.test_override_2 = {
      matches: [/TEST/i, /OVERRIDE/i],
      length: 1,
      state: STATE_TEST_1,
      fn: command => (_tests.complex = (STATE.enter(STATE_TEST_2) && command === "abcd12345")) && _routed(command),
    };

    APP.hooks.routes.test_override_1 = {
      matches: [/TEST/i, /OVERRIDE/i],
      length: 0,
      keys: "p",
      fn: command => (_tests.state = (STATE.enter(STATE_TEST_1) && command === null)) && _routed(command),
    };

    APP.hooks.routes.load_override = {
      matches: [/LOAD/i, /ITEM/i],
      fn: () => false,
    };
    
    APP.hooks.routes.test_override_5 = {
      matches: [/TEST/i, /OVERRIDE/i],
      length: 3,
      state: STATE_TEST_1,
      fn: command => (_tests.length = (STATE.enter(STATE_TEST_4) && command.length == 3 && command[0] === "abcd12345" && command[1] === "efgh67890" && command[2] === "TRUE")) && _routed(command),
    };
    
    APP.hooks.routes.test_override_6 = {
      matches: [/TEST/i, /OVERRIDE/i, /OVERRIDE/i],
      length: 0,
      keys: "r",
      fn: command => (_tests.state = (STATE.enter(STATE_TEST_4) && command === null)) && _routed(command),
    };
    
    APP.hooks.routes.test = {
      matches: /TEST/i,
      fn: command => _tests.simple = (command === null),
    };

    APP.hooks.route.push((handled, command) => {
      if (_route) _route(handled, command);
    });

  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Configuration --> */
  _initialise();
  /* <!-- Initial Configuration --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    start: () => {

      FACTORY.Flags.log("Test START Called");

      /* <!-- Custom Settings --> */
      _route = null;
      for (var test in _tests) _tests[test] = false;

    },

    test_Router_Simple: () => PAUSE().then(
      () => RACE(new Promise(resolve => {
        (_routed = () => true) && (_route = (handled, command) => resolve(_tests.simple === true && handled === true && command));
        window.location.hash = "test";
      }))
    ),

    test_Router_State: () => PAUSE().then(
      () => RACE(new Promise(resolve => {
        (_routed = () => true) && (_route = (handled, command) => resolve(_tests.state === true && handled === true && STATE.in(STATE_TEST_1) && command.length == 2));
        window.location.hash = "test.override";
      }))
    ),

    test_Router_Complex: () => PAUSE().then(
      () => RACE(new Promise(resolve => {
        (_routed = () => true) && (_route = (handled, command) => resolve(_tests.complex === true && handled && STATE.in([STATE_TEST_1, STATE_TEST_2]) &&  command.length == 3));
        STATE.enter(STATE_TEST_1);
        window.location.hash = "test.override.abcd12345";
      }))
    ),

    test_Router_Range: () => PAUSE().then(
      () => RACE(new Promise(resolve => {
        (_routed = () => true) && (_route = (handled, command) => {
          var _result = (_tests.range === true && handled && command.length == 6);
          _tests.range = false;
          _route = (handled, command) => {
            resolve(_result && _tests.range === false && !handled && command.length == 8);
          };
          window.location.hash = "test.range.first.second.third.fourth.fifth.sixth";
        });
        window.location.hash = "test.range.first.second.third.fourth";
      }))
    ),
    
    test_Router_Length: () => PAUSE().then(
      () => RACE(new Promise(resolve => {
        (_routed = () => true) && (_route = (handled, command) => {
          var _result = (_tests.length === true && STATE.in([STATE_TEST_1, STATE_TEST_3]) && handled && command.length == 4);
          _tests.length = false;
          _route = (handled, command) => {
            resolve(_result && _tests.length === true && STATE.in([STATE_TEST_1, STATE_TEST_3, STATE_TEST_4]) && handled && command.length == 5);
          };
          window.location.hash = "test.override.abcd12345.efgh67890.TRUE";
        });
        window.location.hash = "test.override.abcd12345.efgh67890";
      }))
    ),
    
    test_Router_KeyPress: () => PAUSE().then(
      () => RACE(new Promise(resolve => {
        _routed = () => {
          if (_tests.state === true && STATE.in(STATE_TEST_1)) {
            _routed = () => {
              resolve(_tests.state === true && STATE.in(STATE_TEST_4));
              return true;
            };
            window.document.dispatchEvent(new KeyboardEvent("keypress", {"keyCode": 82, "which": 82}));
          } else {
            resolve(false);
          }
          return true;
        };
				window.document.dispatchEvent(new KeyboardEvent("keypress", {"keyCode": 80, "which": 80}));
      }))
    ),

    finish: () => {

      FACTORY.Flags.log("Test END Called");

      /* <!-- Custom Settings --> */
      _route = null;

    },
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};