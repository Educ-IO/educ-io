App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const ID = "Debug_Tests";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ,
    _total = 0,
    _succeeded = 0,
    _running = 0,
    _left = 0;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  const RANDOM = (lower, higher) => Math.random() * (higher - lower) + lower,
    GENERATE = {
      d: () => chance.date(),
      b: p => chance.bool({
        likelihood: p ? p : 50
      }),
      s: l => l === undefined ? chance.string() : chance.string({
        length: l
      }),
      p: (l, p) => chance.string(
        _.extend(l === undefined ? {} : {
          length: l
        }, p === undefined ? {} : {
          pool: p
        })),
      a: l => GENERATE.p(l, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
      n: l => GENERATE.p(l, "0123456789"),
      an: l => GENERATE.p(l, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"),
      t: l => GENERATE.p(l, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 _-.,:;()!?'"),
      i: (min, max) => min === undefined || max === undefined ?
        chance.integer : chance.integer({
          min: min,
          max: max
        }),
      c: () => GENERATE.p(6, "0123456789abcdef"),
      o: array => array[GENERATE.i(0, array.length - 1)],
    },
    SERIAL = promises => _.reduce(promises, (all, promise) => all.then(
      result => promise().then(Array.prototype.concat.bind(result))
    ), Promise.resolve([])),
    ARRAYS = value => value === undefined || value === null ? [] : _.isArray(value) ? value : [value],
    SIMPLIFY = value => value && _.isArray(value) && value.length == 1 ? value[0] : value,
    NUMBER = /^\+?[1-9][\d]*$/;

  var _promisify = (fn, value) => new Promise(resolve => resolve(fn ? ಠ_ಠ._isF(fn) ?
    fn(value) : fn : true));

  var _update = (result, expected) => {
    _running -= 1;
    _left -= 1;
    _succeeded += (result === (expected ?
      /^\s*(false|0)\s*$/i.test(expected) ?
      false : _.isString(expected) ?
      expected.toLowerCase() : true : true)) ? 1 : 0;
    $(`#${ID}_counter`)
      .html(`${_succeeded}/${_total}  <strong>${Math.round(_succeeded/_total*100)}%</strong>`)
      .toggleClass("text-success", _succeeded == _total);
  };

  var _all = (module, id, times) => {
    var _check = (fn, left) => (left ? _left : _running) === 0 ?
      fn() : _.delay(_check, RANDOM(100, 400), fn, left),
      _go = tests => new Promise(resolve => {
        _.each(tests,
          (el, i, all) => _.delay(el => {
            if (i === 0) _left = all.length;
            _check(() => {
              var _click = function(el) {
                var _el = $(el);
                if (!_el.hasClass("loader")) el.click();
              	if (!_el.hasClass("loader")) _.delay(_click, RANDOM(10, 100), el);
              };
              _click(el);
              if (i === (all.length - 1)) _check(() => resolve(true), true);
            });
          }, i ? i * 1000 : 50, el));

      }),
      _tests = $(`#${id}`).parent().siblings("a.btn").toArray();
    times && times > 1 ?
      SERIAL(_.map(_.range(0, times), () => () => _go(_tests))) : _go(_tests);

  };

  var _one = (module, test, id, expected) => {

    /* <!-- Check we have a module and a button --> */
    var _module = ಠ_ಠ._tests[module],
      _id = $(`#${id}`);
    if (!_module || _id.length === 0) return;

    /* <!-- Clear the status and indicate busy status --> */
    _id.addClass("loader disabled").find("i.result").addClass("d-none");

    /* <!-- Instatiate the Module if required, and call all relevant methods --> */
    _module = ಠ_ಠ._isF(_module) ? _module.call(ಠ_ಠ) : _module;
    var _start = _module.start,
      _finish = _module.finish,
      _command = _module[test],
      _result;

    /* <!-- Increment the total tests run counter --> */
    _total += 1;

    _promisify(_start)
      .then(value => _promisify(_command, value))
      .then(result => {
        _update((_result = result), expected);
        return _promisify(_finish, {
          test: test,
          result: _result
        });
      })
      .catch(e => {
        _update("error", expected);
        ಠ_ಠ.Flags.error(`Module: ${module} | Test: ${test}`, e);
      })
      .then(() => _id.removeClass("loader disabled")
        .find(`i.result-${_result ? "success" : "failure"}`)
        .removeClass("d-none"));
  };

  var _run = (module, test, id, expected) => test == "__all" ?
    _all(module, id, expected && NUMBER.test(expected) ? parseInt(expected, 10) : null) :
    (_running += 1) && _one(module, test, id, expected);

  var _everything = () => _.each($(".btn.test-all").toArray(),
    (el, i) => _.delay(el => {
      var _check = () => _left === 0 ? el.click() : _.delay(_check, RANDOM(500, 1000), el);
      _check();
    }, i ? i * 5000 : 100, el));
  /* <!-- Internal Functions --> */

  /* <!-- Overridable Configuration --> */
  var _hooks = {
    start: [],
    test: [],
    clear: [],
    route: [],
    routes: {
      __loud: {
        matches: /LOUD/i,
        length: 0,
        fn: () => ಠ_ಠ.Display.state().toggle("traces")
      },
      __run_all: {
        matches: [/RUN/i, /ALL/i],
        length: 0,
        fn: _everything,
      },
      __run_test: {
        matches: /RUN/i,
        length: {
          min: 3,
          max: 4
        },
        fn: command => _run.apply(this, command),
      },
    }
  };
  /* <!-- Overridable Configuration --> */


  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;

      /* <!-- Initialise all the test modules --> */
      for (var test in ಠ_ಠ._tests) ಠ_ಠ._tests[test] = ಠ_ಠ._tests[test].call(ಠ_ಠ);

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Debug",
        recent: false,
        simple: true,
        start: () => {
          ಠ_ಠ.Display.template.show({
            template: "host",
            id: ID,
            target: ಠ_ಠ.container,
            instructions: ಠ_ಠ.Display.doc.get({
              name: "INSTRUCTIONS"
            }),
            run_all: ಠ_ಠ.Display.doc.get({
              name: "RUN_ALL"
            }),
            tests: ಠ_ಠ.Display.doc.get({
              name: "TESTS"
            }),
            clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
          });
          _.each(_hooks.start, fn => fn());

          /* <!-- Handle Highlights --> */
          ಠ_ಠ.Display.highlight();

          return true;
        },
        test: () => {
          _.each(_hooks.test, fn => fn());
          return false;
        },
        clear: () => {
          _.each(_hooks.clear, fn => fn());
          return true;
        },
        routes: _hooks.routes,
        route: (handled, command) => {
          _.each(_hooks.route, fn => fn(handled, command));
          return true;
        },
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    hooks: _hooks,

    delay: ms => new Promise(resolve => setTimeout(resolve, ms)),

    race: time => promise => {
      var _timeout, _time = time ? time : 1000;
      var _success = val => {
          clearTimeout(_timeout);
          return val;
        },
        _failure = err => {
          clearTimeout(_timeout);
          return Promise.reject(err);
        };
      return Promise.race([
        promise.then(_success).catch(_failure),
        new Promise((resolve, reject) => _timeout = setTimeout(() =>
          reject(new Error(`Debug Test Timed Out after running for ${_time} ms`)), _time))
      ]);
    },

    running: _running,

    /* <!-- Helper Functions --> */
    arrays: ARRAYS,

    generate: GENERATE,

    random: RANDOM,

    serial: SERIAL,

    simplify: SIMPLIFY,
    /* <!-- Helper Functions --> */

  };

};