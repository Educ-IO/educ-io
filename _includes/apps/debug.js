App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const ID = "Debug_Tests";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _promisify = fn => new Promise(resolve => resolve(fn ? ಠ_ಠ._isF(fn) ? fn() : fn : true));

  var _all = (module, id) => _.each($(`#${id}`).siblings("a.btn").toArray(), (el, i) => _.delay(el => el.click(), i ? i * 1000 : 100, el));

  var _one = (module, test, id) => {

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
    _promisify(_start)
      .then(() => _promisify(_command))
      .then(result => {
        _result = result;
        return _promisify(_finish);
      })
      .catch(e => {
        ಠ_ಠ.Flags.error(`Module: ${module} | Test: ${test}`, e);
      })
      .then(() => _id.removeClass("loader disabled").find(`i.result-${_result ? "success" : "failure"}`).removeClass("d-none"));
  };

  var _run = (module, test, id) => test == "__all" ? _all(module, id) : _one(module, test, id);
  /* <!-- Internal Functions --> */

  /* <!-- Overridable Configuration --> */
  var _hooks = {
    start: [],
    test: [],
    clear: [],
    route: [],
    routes: {
      __run_test: {
        matches: /RUN/i,
        length: 3,
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
            tests: ಠ_ಠ.Display.doc.get({
              name: "TESTS"
            }),
            clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
          });
          _.each(_hooks.start, fn => fn());
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
        new Promise((resolve, reject) => _timeout = setTimeout(() => reject(new Error(`Debug Test Timed Out after running for ${_time} ms`)), _time))
      ]);
    },

    random: (lower, higher) => Math.random() * (higher - lower) + lower,

  };

};