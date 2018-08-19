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

  var _run = (module, test, id) => {

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
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get a reference to the Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      container.App = this;

      this.route = command => {

        (command && command.length === 3) ?
        _run.apply(this, command):
          (command === true || (/AUTH/i).test(command)) ?
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
          }) : ಠ_ಠ.Display.doc.show({
            wrapper: "PUBLIC",
            name: "README",
            target: ಠ_ಠ.container,
            clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
          });

      };

      /* <!-- Return for Chaining --> */
      return this;

    },

  };

};