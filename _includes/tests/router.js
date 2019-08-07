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
    STATE = FACTORY.Display.state(),
    GEN = FACTORY.App.generate,
    ARRAYS = FACTORY.App.arrays,
    SIMPLIFY = FACTORY.App.simplify;
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
  }, _lifecycles = {
    started: false,
    cleared: false,
    tested: false
  };
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _routed = () => true;

  var _initialise = () => {

    APP.hooks.start.push(() => {
      _lifecycles.started = !_lifecycles.started;
      FACTORY.Flags.log("Router Start Called");
    });
    
    APP.hooks.test.push(() => {
      _lifecycles.tested = !_lifecycles.tested;
      FACTORY.Flags.log("Router Test Called");
    });

    APP.hooks.clear.push(() => {
      _lifecycles.cleared = !_lifecycles.cleared;
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

    test_Router_Lifecycle : () =>  PAUSE()
      .then(() => _lifecycles.started === true && _lifecycles.cleared === false && 
            _lifecycles.tested === false),
    
    test_Router_Prepare: () => new Promise(resolve => {

      PAUSE().then(() => {

        try {

          /* <!-- Test Route Expansion --> */
          var _static = {
              test1: {
                matches: /TEST1/i,
                fn: () => true,
                length: 0,
                routes: {
                  test2: {
                    state: STATE_TEST_1,
                    fn: () => true,
                    routes: {
                      test3: {
                        matches: /TEST3/i,
                        fn: () => true,
                        routes: {
                          test6: {
                            matches: [/TEST6/i, /TEST7/i],
                            length: 0,
                            fn: () => true,
                          }
                        },
                      },
                      test4: {
                        matches: /TEST4/i,
                        length: 1,
                        fn: () => true,
                      },
                      test5: {
                        matches: /TEST5/i,
                        length: 2,
                        state: STATE_TEST_2,
                        fn: () => true
                      },
                    }
                  }
                }
              }
            },
            _create = (tests, parent, max, current) => {
              current !== undefined ? current += 1 : current = 0;
              return _.reduce(_.range(0, GEN.i(5, 10)), memo => {
                var _route = {};

                /* <!-- Local Route --> */
                if (GEN.b()) _route.length = GEN.i(0, 5);
                if (GEN.b()) _route.state = GEN.an(GEN.i(5, 20));
                if (GEN.b()) _route.matches = SIMPLIFY(_.map(_.range(0, GEN.i(1, 3)),
                  () => new RegExp(GEN.a(5, 10).toUpperCase())));

                var _key = GEN.a(GEN.i(10, 20));

                /* <!-- Parent Route Integration --> */
                var _parent = {
                  keys: `${parent.keys ? `${parent.keys}_` : ""}${_key}`,
                  length: _route.length === undefined ? parent.length : _route.length,
                  matches: SIMPLIFY(ARRAYS(parent.matches).concat(ARRAYS(_route.matches))),
                  state: _route.state === undefined ? parent.state : _route.state
                };

                if ((current < max && GEN.b(30))) _route.routes = _create(tests, _parent, max, current);
                if (!_route.routes || GEN.b(60)) {
                  _route.fn = () => true;
                  tests.push([_parent.keys, _parent.length, _parent.matches, _parent.state]);
                }

                memo[_key] = _route;

                return memo;
              }, {});
            },
            _tests = [],
            _dynamic = _create(_tests, {}, 5);

          var _expand = routes => _.each(routes, (route, name) =>
            route.routes && !FACTORY.Router.expand(routes, route, name).fn ?
            delete routes[name] : false);

          _expand(_static);

          expect(_static).to.be.an("object");

          expect(_.keys(_static)).to.be.an("array")
            .and.to.have.ordered.members([
              "test1",
              "test1_test2",
              "test1_test2_test3",
              "test1_test2_test3_test6",
              "test1_test2_test4",
              "test1_test2_test5",
            ]);

          var _test = (values, path, length, matches, state) => {
            expect(values).to.have.a.nested.property(`${path}.fn`).to.be.a("function");
            if (length !== null && length !== undefined)
              expect(values).to.have.a.nested.property(`${path}.length`, length);
            if (state !== null && state !== undefined)
              expect(values).to.have.a.nested.property(`${path}.state`, state);
            var _regex = (path, regex) => {
              expect(values).to.have.a.nested.property(path);
              expect(values).to.have.a.nested.property(`${path}.source`)
                .and.to.equal(regex.source);
              expect(values).to.have.a.nested.property(`${path}.flags`)
                .and.to.equal(regex.flags);
            };
            _.isArray(matches) ? _.each(matches, (match, index) => {
              _regex(`${path}.matches[${index}]`, match);
            }) : _regex(`${path}.matches`, matches);
          };

          _test(_static, "test1", 0, /TEST1/i);
          _test(_static, "test1_test2", 0, /TEST1/i, STATE_TEST_1);
          _test(_static, "test1_test2_test3_test6", 0, [/TEST1/i, /TEST3/i, /TEST6/i, /TEST7/i], STATE_TEST_1);
          _test(_static, "test1_test2_test3", 0, [/TEST1/i, /TEST3/i], STATE_TEST_1);
          _test(_static, "test1_test2_test4", 1, [/TEST1/i, /TEST4/i], STATE_TEST_1);
          _test(_static, "test1_test2_test5", 2, [/TEST1/i, /TEST5/i], STATE_TEST_2);

          _expand(_dynamic);

          expect(_dynamic).to.be.an("object");

          expect(_.keys(_dynamic)).to.be.an("array")
            .and.to.have.members(_.map(_tests, test => test[0]));

          _.each(_tests, test => _test.apply(this, [_dynamic].concat(test)));

          resolve(FACTORY.Flags.log("Route Prepare Test SUCCEEDED").reflect(true));

        } catch (err) {
          resolve(FACTORY.Flags.error("Route Prepare Test FAILED", err).reflect(false));
        }

      });

    }),

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