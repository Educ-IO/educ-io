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
    _running = 0;
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
      f: (min, max, fixed) => min === undefined || max === undefined ?
        chance.floating : chance.floating({
          min: min,
          max: max,
          fixed: fixed !== undefined ? fixed : 2,
        }),
      i: (min, max) => min === undefined || max === undefined ?
        chance.integer : chance.integer({
          min: min,
          max: max
        }),
      c: () => GENERATE.p(6, "0123456789abcdef"),
      cn: (min, max) => `rgb(${GENERATE.i(min, max ? max : 255)},${GENERATE.i(min, max ? max : 255)},${GENERATE.i(min, max ? max : 255)})`,
      ca: alpha => `rgba(${GENERATE.i(0, 255)},${GENERATE.i(0, 255)},${GENERATE.i(0, 255)},${alpha === undefined ? GENERATE.f(0, 1, 2) : alpha})`,
      o: array => array[GENERATE.i(0, array.length - 1)],
    },
    ARRAYS = value => value === undefined || value === null ? [] : _.isArray(value) ? value : [value],
    SIMPLIFY = value => value && _.isArray(value) && value.length === 1 ? value[0] : value,
    NUMBER = /^\+?[1-9][\d]*$/;

  var _promisify = (fn, value) => new Promise(resolve => resolve(fn ? ಠ_ಠ._isF(fn) ?
    fn(value) : fn : true));

  var _update = (result, expected) => {
    _running -= 1;
    var _success = (result === (expected ?
      /^\s*(false|0)\s*$/i.test(expected) ?
      false : _.isString(expected) ?
      expected.toLowerCase() : true : true));
    _succeeded += _success ? 1 : 0;
    $(`#${ID}_counter .content`)
      .html(`${_succeeded}/${_total}  <strong>${Math.round(_succeeded/_total*100)}%</strong>`)
      .toggleClass("text-success", _succeeded == _total);
    return _success;
  };

  var _click = buttons => Promise.each(_.map(buttons, button => () => new Promise((resolve, reject) => {

    var running, observer = new MutationObserver((mutationsList, observer) => {
      for (var mutation of mutationsList) {
        if (mutation.type == "attributes" && mutation.attributeName == "class") {
          if (button.classList.contains("loader")) {
            running = true;
          } else if (running) {
            if (button.classList.contains("success")) {
              observer.disconnect();
              resolve();
            } else if (button.classList.contains("failure")) {
              observer.disconnect();
              reject();
            }
          }
        }
      }
    });

    observer.observe(button, {
      attributes: true
    });
    button.click();

  })));

  var _all = (module, id, times) => {

    var _this = $(`#${id}`),
      _buttons = _this.parent().siblings("a.btn").toArray();
    ಠ_ಠ.Flags.log("TEST BUTTONS:", _buttons);

    /* <!-- Clear the status and indicate busy status --> */
    _this.removeClass("success failure").addClass("loader disabled").find("i.result").addClass("d-none");

    /* <!-- Not returning as we are using a Singleton Router (for testing), which doesn't allow us to run parallel routes! --> */
    new Promise((resolve, reject) => {
      (times && times > 1 ?
        Promise.each(_.map(_.range(0, times), () => () => _click(_buttons))) : _click(_buttons))
      .then(() => {
          _this.removeClass("loader disabled").addClass("success")
            .find("i.result-success").removeClass("d-none");
          resolve();
        })
        .catch(() => {
          _this.removeClass("loader disabled").addClass("failure")
            .find("i.result-failure").removeClass("d-none");
          reject();
        });
    });

  };

  var _one = (module, test, id, expected) => {

    /* <!-- Check we have a module and a button --> */
    var _module = ಠ_ಠ._tests[module],
      _id = $(`#${id}`);
    if (!_module || _id.length === 0) return;

    /* <!-- Clear the status and indicate busy status --> */
    _id.removeClass("success failure").addClass("loader disabled").find("i.result").addClass("d-none");

    /* <!-- Instatiate the Module if required, and call all relevant methods --> */
    _module = ಠ_ಠ._isF(_module) ? _module.call(ಠ_ಠ) : _module;
    var _start = _module.start,
      _finish = _module.finish,
      _command = _module[test],
      _result;

    /* <!-- Increment the total tests run counter --> */
    _total += 1;

    /* <!-- Used to set overall success --> */
    var _outcome;

    _promisify(_start)
      .then(value => _promisify(_command, value))
      .then(result => {
        result = _.isArray(result) ? _.reduce(result, 
          (outcome, result) => outcome === false || result === false ? false : result, null) : result;
        _outcome = _update((_result = result), expected);
        return _promisify(_finish, {
          test: test,
          result: _result
        });
      })
      .catch(e => {
        _outcome = _update("error", expected);
        ಠ_ಠ.Flags.error(`Module: ${module} | Test: ${test}`, e);
      })
      .then(() => _id.removeClass("loader disabled")
        .addClass(_outcome ? "success" : "failure")
        .find(`i.result-${_result ? "success" : "failure"}`)
        .removeClass("d-none"));
  };

  var _run = (module, test, id, expected) => test == "__all" ?
    _all(module, id, expected && NUMBER.test(expected) ? parseInt(expected, 10) : null) :
    (_running += 1) && _one(module, test, id, expected);

  var _everything = () => {

    var _this = $("#____run_everything"),
      _buttons = $(".btn.test-all").toArray();
    ಠ_ಠ.Flags.log("ALL TEST BUTTONS:", _buttons);

    /* <!-- Clear the status and indicate busy status --> */
    _this.removeClass("success failure").addClass("loader disabled").find("i.result").addClass("d-none");

    /* <!-- Not returning as we are using a Singleton Router (for testing), which doesn't allow us to run parallel routes! --> */
    _click(_buttons)
      .then(() => _this.removeClass("loader disabled").addClass("success")
        .find("i.result-success").removeClass("d-none"))
      .catch(() => _this.removeClass("loader disabled").addClass("failure")
        .find("i.result-failure").removeClass("d-none"));

  };
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
    },
    singleton: null
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
        singular: true,
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
          return Promise.resolve(val);
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

    simplify: SIMPLIFY,
    /* <!-- Helper Functions --> */

  };

};