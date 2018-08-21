App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

	/* <!-- Internal Constants --> */
    const STATE_READY = "ready",
    STATE_OPENED = "opened",
    STATES = [STATE_READY, STATE_OPENED];
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _credentials, _showdown;
  var _config, _tasks, _start;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		initialise: function(container) {

			/* <!-- Get a reference to the Container --> */
			ಠ_ಠ = container;

			/* <!-- Set Container Reference to this --> */
			container.App = this;
			
			/* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Accounts",
        states: STATES,
        recent: false,
        simple: true,
        start: () => {
          
          var _busy = ಠ_ಠ.Display.busy({
            target: ಠ_ಠ.container,
            status: "Loading DBs",
            fn: true
          });

          _config.get()
            .then(config => !config ? ಠ_ಠ.Router.run(STATE_READY) :
              _busy({
                message: "Loaded Config"
              }) && _start(config, _busy).then(result => result ? _busy() : ಠ_ಠ.Router.run("")));
        },
        test: () => ಠ_ಠ.Display.state().in(STATE_OPENED),
        clear: () => {
          if (_tasks) _tasks.close();
        },
        route: (handled, command) => {

          if (handled) return;
          var _finish;

          if ((/CREATE/i).test(command)) {

            _finish = ಠ_ಠ.Display.busy({
              target: ಠ_ಠ.container,
              status: "Creating DB",
              fn: true
            });

            _config.clear()
              .then(() => _tasks.create())
              .then(id => _config.create(id))
              .then(() => _start(_config.config, _finish))
              .then(_finish);

          }

        }
      });

			/* <!-- Return for Chaining --> */
			return this;

		},
    
    /* <!-- Start App after fully loaded --> */
    start: () => {

      /* <!-- Setup Moment --> */
      moment().format();
      var locale = window.navigator.userLanguage || window.navigator.language;
      if (locale) moment.locale(locale);

      /* <!-- Setup Showdown --> */
      _showdown = new showdown.Converter({
        strikethrough: true
      });
     
      /* <!-- Create Credentials Reference --> */
      _credentials = ಠ_ಠ.Credentials(ಠ_ಠ);
      
    },
    
		/* <!-- Clear the existing state --> */
		clean: () => ಠ_ಠ.Router.clean(false),
		
    credentials: _credentials,
    
    showdown: _showdown,
    
    
    
	};

};