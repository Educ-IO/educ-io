Flags = function() {

  /* <!-- DEPENDS on WINDOW & URI.JS to work, and initialise --> */

  /* <!-- Returns an instance of Flags if required --> */
  if (this && this._isF && this._isF(this.Flags)) {
    /* <!-- Set Container Reference to this --> */
    this.Flags = new this.Flags();
    return this.Flags;
  }

  /* <!-- Internal Constants --> */
  const MATCH = {
    alert : /^alert$/i,
    debug : /^debug$/i,
    demo : /^demo$/i,
    development : /^dev$/i,
    experiments : /^experiments$/i,
    highlight : /^highlight$/i,
    key : /^key$/i,
    initial : /^i$/i,
    oauth : /^a$/i,
    option : /^option$/i,
    page : /^page$/i,
    performance : /^performance$/i,
    remote : /^remote$/i,
    verbose : /^verbose$/i,
  };
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  var _alert = false,
    _debug = false,
    _demo = false,
    _verbose = false,
    _experiments = false,
    _development = false,
    _page = false,
    _option = false,
    _highlight = false,
    _key = false,
    _oauth = false,
    _initial = false,
    _performance = false,
    _base, _dir,
    _default = v => v,
    _context = (window && window.console ? window.console : {}),
    _err = (window && window.console ? window.console.error : _default),
    _log = (window && window.console ? window.console.log : _default),
    _start = (window && window.console ? window.console.time : _default),
    _end = (window && window.console ? window.console.timeEnd : _default);
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  var _parse = function() {

    /* <!-- Parse Url --> */
    var _url = new URI(),
        _data = _url.search(true);
    
    var _value = match => {
      for (const property in _data) {
        if (match.test(property)) return _data[property];
      }
    };
    
    /* <!-- Set Variables --> */
    _alert = _url.hasQuery(MATCH.alert);
    if (_alert) window.onerror = function(m, u, l, c, o) {
      alert("Error: " + m + " Script: " + u + " Line: " + l + " Column: " + c + " Trace: " + o);
    };

    _debug = _alert ? _alert : _url.hasQuery(MATCH.debug);
    if (_debug) window.onerror = function(m, u, l, c, o) {
      _err(`Error: ${m} Script: ${u} Line: ${l} Column: ${c} Trace: ${o}`);
    };
    
    _demo = _url.hasQuery(MATCH.demo) ? _value(MATCH.demo) === null : false;
    
    _verbose = _debug ? _url.hasQuery(MATCH.verbose) && _value(MATCH.verbose) === null : false;

    _experiments = _debug ? _url.hasQuery(MATCH.experiments) && _value(MATCH.experiments) === null : false;
    
    _development = (
      MATCH.development.test(_url.subdomain()) || 
      (_url.hasQuery(MATCH.development) && _value(MATCH.development) === null)
    );

    _key = _url.hasQuery(MATCH.key) ? _value(MATCH.key) : null;

    _oauth = _url.hasQuery(MATCH.oauth) ? _value(MATCH.oauth) : null;
    
    _initial = _url.hasQuery(MATCH.initial) ? _value(MATCH.initial) : null;

    _option = _url.hasQuery(MATCH.option) && _value(MATCH.option) === null;

    _highlight = _url.hasQuery(MATCH.highlight) ? _value(MATCH.highlight) : null;

    _performance = _url.hasQuery(MATCH.performance) && _value(MATCH.performance) === null;

    _page = _url.hasQuery(MATCH.page) && _value(MATCH.page) === null;

    _base = _url.protocol() + "://" + _url.hostname() +
      (_url.port() && _url.port() != 80 && _url.port() != 443 ? ":" + _url.port() : "") + "/";

    _dir = _url.directory().split("/").pop();

    /* <!-- Load Remote Console Script Function --> */
    var _load = function(id) {
      return new Promise((resolve, reject) => {
        var script = document.createElement("script");
        script.onload = resolve;
        script.onerror = reject;
        script.src = "https://jsconsole.com/js/remote.js?" + id;
        document.getElementsByTagName("head")[0].appendChild(script);
      });
    };

    /* <!-- Return Promise --> */
    return _url.hasQuery(MATCH.remote) && _value(MATCH.remote) ?
       _load(_value(MATCH.remote)) : Promise.resolve();

  };

  var _route = function(command, router) {

    var directive;

    if (command.indexOf(",") >= 1) {
      command = command.split(",");
      directive = command[0];
      command = command[1];
    }

    return command.indexOf(".") >= 1 ?
      router(directive, command.split(".")) : router(directive, command);

  };

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function() {

      /* <!-- Call Parse Method internally --> */
      return _parse().then(function() {

        var _return = {

          reflect: value => value,

          negative: () => false,

          positive: () => true,
          
          nothing: () => null,

          alert: function() {
            return _alert;
          },

          full: function(path) {
            return _base + (path ? path : "");
          },

          verbose: function() {
            return _verbose;
          },
          
          debug: function() {
            return _debug;
          },
          
          demo: function() {
            return _demo;
          },

          development: function() {
            return _development;
          },
          
          experiments: function() {
            return _experiments;
          },

          dir: function() {
            return _dir;
          },

          error: function(message, exception) {
            _alert && window && window.alert ?
              window.alert(`ERROR - ${message} : ${JSON.stringify(exception)}`) :
              (exception ?
                _log(`ERROR - ${message}`, exception) :
                exception === null ?
                _log(`ERROR - ${message}`, "No Inner Exception") :
                _log(`ERROR - ${message}`));
            return this;
          },

          log: function() {
            if (_debug) _log.apply(_context, arguments);
            return this;
          },

          time: function(name, end) {
            if (_debug || _performance) end ? _end.apply(_context, [name]) : _start.apply(_context, [name]);
            return this;
          },

          oauth: function() {
            return _oauth;
          },

          key: function() {
            return _key;
          },
          
          initial: function() {
            return _initial;
          },

          highlight: function() {
            return _highlight;
          },

          option: function() {
            return _option;
          },

          page: function() {
            return _page;
          },

          route: function(command, router) {

            _route(command, router);

          },

          change: function(router) {

            var command = window.location.hash;
            
            if (command) {

              if (command.indexOf("#") === 0) command = command.substring(1);

              if (command !== "!") {

                var _ignore = false;
                if (command.indexOf("!") === 0) {
                  _ignore = true;
                  command = command.substring(1);
                }

                if (!_ignore && window.history) {
                  window.history.replaceState({
                    command: command
                  }, "", "#!");
                } else {
                  window.location.hash = "!";
                }

                return _route(command, router);

              }

            }

          },
          
          decorate: (url, hash) => {
            var _url = new URI(url);
            _url.search(data => {
              data.alert = _alert ? null : undefined;
              data.debug = _debug ? null : undefined;
              data.demo = _demo ? null : undefined;
              data.experiments = _experiments ? null : undefined;
              data.performance = _performance ? null : undefined;
              data.verbose = _verbose ? null : undefined;
            });
            if (hash) _url.hash(hash);
            return _url.toString();
          },
          
          cleared: () => !window.location.hash || 
                          window.location.hash == "!" || 
                          window.location.hash == "#" || 
                          window.location.hash == "#!",

        };

        return Promise.resolve(_return);

      });

    },

  };
  /* <!-- External Visibility --> */

};