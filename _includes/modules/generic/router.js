Router = function() {

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Router)) {
    return new this.Router().initialise(this);
  }

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _options, _last, _debug, _setup;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Constants --> */
  const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms)),
        
    REPLACER = (key, value) => value && (typeof value === "object" &&
      value.constructor === RegExp) || typeof value === "function" ? value.toString() : value,

    STR = value => JSON.stringify(value, REPLACER, 2),

    STRIP = (command, number) => _.isArray(command) ? _.rest(command, number ? number : 1) : _.isString(command) ? [] : command,

    PREPARE = (options, command) => options ?
      _.isFunction(options) ? options(command) : options : false,

    REJECT = {
      MIME: (files, options) => options !== null && options.mime !== undefined && !_.every(_.isArray(files) ? files : [files], file => _.find(options.mime.split(","), mime => file.mimeType.localeCompare(mime.trim()) === 0)) && ಠ_ಠ.Flags.log(`Google Drive Files MIME types${_.isArray(files) ? "" : ` (${files.mimeType})`} not matched to ${options.mime}`, files),
      PROPERTIES: (files, options) => options !== null && options.properties !== undefined && !_.every(_.isArray(files) ? files : [files], file => _.isMatch(_.extend({}, file.properties, file.appProperties), options.properties)) && ಠ_ಠ.Flags.log(`Google Drive Files PROPERTIES${_.isArray(files) ? "" : ` (${STR(_.extend({}, files.properties, files.appProperties))})`} not matched to ${STR(options.properties)}`, files),
    },

    HANDLE = (options, resolve, reject) => files => {
      $(document.body).removeClass("overflow-hidden");
      return files && (!_.isArray(files) || files.length > 0) ?
      REJECT.MIME(files, options) || REJECT.PROPERTIES(files, options) ?
        reject() :
          ಠ_ಠ.Flags.log("Google Drive File/s Picked from Open", files) && 
            (options.full ? (_.isArray(files) ? 
                              Promise.all(_.map(files, file => ಠ_ಠ.Google.files.get(file.id, true, true))) : 
                              ಠ_ಠ.Google.files.get(files.id, true, true)).then(resolve) : resolve(files)) :
        ಠ_ಠ.Flags.log("Google Drive Picker Cancelled") && reject();
    },

    PICK = (picker => ({
      single: options => new Promise((resolve, reject) => ($(document.body).addClass("overflow-hidden"),
        ಠ_ಠ.Google.pick(
          options && options.title ? options.title : "Select a File to Open", false,
          options && options.team !== undefined ? options.team : true, picker(options),
          HANDLE(options, resolve, reject), null, true))),
      multiple: options => new Promise((resolve, reject) => ($(document.body).addClass("overflow-hidden"),
        ಠ_ಠ.Google.pick(
          options && options.title ? options.title : "Select a File/s to Open", true,
          options && options.team !== undefined ? options.team : true, picker(options),
          HANDLE(options, resolve, reject), null, true))),
    }))(options => () => [_.tap(new google.picker
        .DocsView(options ? google.picker.ViewId[options.view] : null)
        .setMimeTypes(options && options.mime ? options.mime : null)
        .setIncludeFolders(options && options.folders ?
          true : options && options.include_folders !== undefined && options.include_folders !== null ?
          options.include_folders : true)
        .setOwnedByMe(options && options.mine !== undefined ? options.mine : null)
        .setSelectFolderEnabled(options && options.folders ? true : false)
        .setParent(options && options.parent !== undefined ?
          options.parent : (options.parent = "root")),
        view => {
          if (options.query !== undefined && options.query !== null) view.setQuery(options.query);
          if (options.navigation !== undefined) view.navigation = options.navigation;
          if (options.parent) view.team = false;
          if (options.label) view.setLabel(options.label);
        })]
      .concat(options.shared_with_me ? [_.tap(new google.picker
        .DocsView(options ? google.picker.ViewId[options.view] : null)
        .setMimeTypes(options && options.mime ? options.mime : null)
        .setSelectFolderEnabled(options && options.folders ? true : false)
        .setOwnedByMe(false)
        .setEnableDrives(false),
        view => {
          view.team = false;
          view.setLabel("Shared with Me");
        })] : [])
      .concat(options.all ? [new google.picker
        .DocsView(options ? google.picker.ViewId[options.view] : null)
        .setMimeTypes(options && options.mime ? options.mime : null)
        .setSelectFolderEnabled(options && options.folders ? true : false)
      ] : [])
      .concat(options.recent ? [google.picker.ViewId.RECENTLY_PICKED] : []));
  /* <!-- Internal Constants --> */

  /* <!-- Internal Setup Constants --> */
  const STRIP_NULLS = data => _.chain(data).omit(_.isUndefined).omit(_.isNull).omit(value => _.isArray(value) && value.length === 0).value(),
    EXTEND = (parent, route, arrays) => {
      var _integrate = (parent, route, property) => parent[property] ?
        route[property] ? (_.isArray(parent[property]) ? parent[property] : [parent[property]])
          .concat(route[property] ? route[property] : []) : parent[property] : route[property],
          _extension = () => _.reduce(arrays, (memo, property) => _.tap(memo, memo => memo[property] = _integrate(parent, route, property)), {});
      return _.extend(parent, _.isFunction(route) ? {
          fn: route
        } : route, _extension());
    },
    EXPAND = (routes, route, name) => {
      var _name = value => `${name ? `${name}_`: ""}${value}`,
        _default = () => route.inherit === false ? {
          matches: route.matches,
        } : {
          matches: route.matches,
          state: route.state,
          length: route.length,
          clean: route.clean,
          reset: route.reset,
          requires: route.requires,
          scopes: route.scopes,
          trigger: route.trigger,
          preserve : route.preserve,
          tidy: route.tidy,
        };
      _.each(route.routes, (route, name) => {
        
        route = STRIP_NULLS(EXTEND(_default(), route, ["matches", "state", "requires", "scopes"]));
        
        if (!routes[name = _name(name)] && route.fn)
          routes[name] = route;
        
        if (route.routes) EXPAND(routes, route, name);
      });
      delete route.routes;
      return route;
    },
    INTEGRATE = (routes, route, name) => routes[name] = (routes[name] ?
      _.isFunction(_options.routes[name]) ?
      _.defaults({
        fn: routes[name]
      }, route) : _.defaults(routes[name], route) : route),
    REQUIRES = requires => ಠ_ಠ.Controller.load(_.map(_.isString(requires) ? 
                                                     [requires] : 
                                                     requires, required => ಠ_ಠ.IMPORTS.LOAD_LAZY[required])),
    SCOPES = scopes => ಠ_ಠ.Main.authorise(_.isArray(scopes) ? scopes : [scopes]);
  
  const STATE_EXPERIMENTS = "experiments",
        STATE_EXTERNAL_OAUTH = "external-oauth";
  /* <!-- Internal Setup Constants --> */

  /* <!-- Internal Functions --> */  
  var _start, _end, _shortcuts, _keyboard, _touch,
      _enter = (recent, fn, simple, state) => {
        
        /* <!-- Load the Initial Instructions --> */
        var _show = recent => ಠ_ಠ.Display.doc.show({
            name: _options.readme || "README",
            content: recent && recent.length > 0 ? ಠ_ಠ.Display.template.get({
              template: "recent",
              recent: recent
            }) : "",
            target: ಠ_ಠ.container,
            clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
          }),
          _fn = fn ? fn : () => {},
          _complete = state ? () => ಠ_ಠ.Display.state().enter(state) && _fn() : _fn;

        recent > 0 && ಠ_ಠ.Recent ?
          ಠ_ಠ.Recent.last(recent).then(_show).then(_complete)
          .catch(e => ಠ_ಠ.Flags.error("Recent Items Failure", e ? e : "No Inner Error")) :
          simple && fn ? _complete() : _show() && _complete();

      },
      _clean = restart => _end() && (!restart || _start()),
      _exit = (test, states, fn) => {
        if (test && test()) {
          ಠ_ಠ.container.empty() && ಠ_ಠ.Display.state().exit(states).protect("a.jump").off();
          if (fn) fn();
          return true;
        }
      },
      _execute = (route, command) => {
        
        /* <!-- Clean up the state (before command has run) if required! --> */
        if (route.reset) _clean(false);
        
        /* <!-- Tidy up visuals if required! --> */
        if (route.trigger) ಠ_ಠ.Display.state().enter(route.trigger);
        
        /* <!-- Tidy up visuals if required! / Delay by 500ms to allow delayed tooltips to appear --> */
        if (route.tidy) DELAY(500).then(ಠ_ಠ.Display.tidy);
        
        var l_command = route.preserve ? 
            route.strip && _.isNumber(route.strip) ? 
              STRIP(command, route.strip) : command : STRIP(command, route.__length),
          l_options = PREPARE(route.options, l_command),
          l_result = route.fn(_.isArray(l_command) ? 
                              l_command.length === 0 ? 
                                null : l_command.length === 1 ? l_command[0] : l_command : l_command, l_options),
          _complete = () => {
            /* <!-- Clean up the state (after command has run) if required! --> */
            if (route.clean) _clean(false);

            /* <!-- Clean up the state (after command has run) if required! --> */
            if (route.trigger) ಠ_ಠ.Display.state().exit(route.trigger);
          };
        
        return l_result && l_result.then ? l_result
          .then(result => {
          
            _complete();  
          
            /* <!-- Run the success function if available --> */
            return route.success ? route.success(
              _.isObject(result) && _.has(result, "command") && _.has(result, "result") ?
              result : {
                command: l_command,
                result: result
              }) : true;
          })
          .catch(route.failure ? route.failure :
            e => e ?
            ಠ_ಠ.Flags.error(`Route: ${STR(route)} FAILED`, e).negative() : false) : (_complete(), l_result);
      },
      _shortcut = (route, debug, name, key) => () => (!route.state || ಠ_ಠ.Display.state().in(route.state, route.all ? false : true)) ? 
                (!debug || ಠ_ಠ.Flags.log(`Keyboard Shortcut ${key} routed to : ${name}`)) && 
                  (Promise.all([
                    route.requires ? REQUIRES(route.requires) : Promise.resolve(true),
                    route.scopes ? SCOPES(route.scopes) : Promise.resolve(true)
                  ]))
                  .then(results => route.permissive || _.every(results) ? 
                        _execute(route, null) : (ಠ_ಠ.Flags.log(`Route ${name} is not permissive and preconditions failed:`, results), false)) : false;
  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get Reference to Container --> */
      ಠ_ಠ = container;

      /* <!-- Set Container Reference to this --> */
      ಠ_ಠ.Router = this;

      /* <!-- Return for Chaining --> */
      return this;

    },

    pick: PICK,

    strip: STRIP,

    expand: EXPAND,

    integrate: INTEGRATE,

    /* <!-- 
      Options are : {
        name : App Name (for Titles)
        start : Function to execute once entered (after login)
        simple : Bypass authenticated readme (if false passed to recent). Calling App should handle default authentication event via the start method above.
        state : State Object to be cleared on log out / router exit 
        states : Potential States that should be cleared on exit (e.g. opened),
        test : Tests whether app has been used (for cleaning purposes)
        clear : Function to execute once exited / cleared (after logout)
        center : Whether help / instruction dialogs should be centered
        route : App-Specific Router Command (if all other routes have not matched)
        routes : {
        	// Default routes (apart from AUTH/UNAUTH) can be switched off by setting active property to false (DEFAULT is ON).
        	// All default routes can be functions, or contain a function as the fn property (which is mandatory for non-default routes).
          // All routes are specified by the regexes in the ROUTES constant below, or can be overridden with a regex property.
          // All routes can have a state property, which is a string or array of strings indicating the states in which the route is valid
          // All routes can have a qualifier function (taking command as a parameter) to further refine matching
          // All routes can have a length (will check array length after initial regex match), which can be a number or a min|max object
          // All routes can have a next regex that is tested after initial regex match
          // All routes can be flagged to 'tidy' if they should clean up any popovers etc before running
          // All routes can have a trigger state, which is triggered while the route is running (promise or synchronous)
          // All routes can be flagged to 'preserve' if they should call their fn property with the full command. If a numerical value is also supplied via a strip property, then this number of commands will be removed from the command array.
          // All promise returning routes can have a success({command, result}) and failure(e) methods attached
          // All routes can have a clean property which, if truthy, will call a state clean upon success
          // All parent routes can have an inherit property (set to false, means that only matches is transferred to child routes)
          // Extra configuration options for default routes are shown in methods below.
        },
				instructions : App-Specific Instructions
      }
    --> */
    create: options => {

      /* <!-- Default Routes, can be overridden by the routes object in options --> */
      const ROUTES = {
        create: {
          matches: /^CREATE(\.\S+|$)/i,
          fn: () => false,
          /* <!-- Returning False will mean route fall-through to app route --> */
        },
        open: {
          matches: /^OPEN(\.\S+|$)/i,
          requires: "google",
          /* <!-- OPTIONS: Multiple | Single property dictates files returned, all others passed through to picker method -->  */
          fn: (command, options) => options && options.mutiple ?
            PICK.multiple(options) : PICK.single(options),
        },
        load: {
          matches: /^LOAD(\.\S+|$)/i,
          length: {
            min: 1
          },
          qualifier: command => /^[a-zA-Z0-9-_]+$/.test(_.isArray(command) ? command[0] : command),
          /* <!-- OPTIONS: download = boolean, default false (whether downloaded file is returned) -->  */
          /* <!-- OPTIONS: mime = comma separated mime list (as per Picker) -->  */
          fn: (command, options) => new Promise((resolve, reject) => {
            var _id = _.isArray(command) ? command[0] : command;
            (options && options.wrapper ? 
              options.wrapper(() => ಠ_ಠ.Google.files.get(_id, true, options.full ? true : false)) :
              ಠ_ಠ.Google.files.get(_id, true, options.full ? true : false))
              .then(options.busy ? ಠ_ಠ.Main.busy("Opening File") : value => value)
              .then(file => {
                ಠ_ಠ.Flags.log(`Opened Google Drive File: ${_id}`, file);
                REJECT.MIME(file, options) || REJECT.PROPERTIES(file, options) ?
                  reject() :
                  (options.download === true ? ಠ_ಠ.Google.files.download(file.id)
                    .then(download => ({
                      file: file,
                      download: download
                    })) : Promise.resolve(file))
                  .then(result => resolve({
                    command: command,
                    result: result
                  }));
              })
              .catch(e => {
                ಠ_ಠ.Flags.error(`Opening Google Drive File: ${_id}`, e);
                if (e && e.status == 404 && ಠ_ಠ.Recent) ಠ_ಠ.Recent.remove(_id).then(id => $("#" + id).remove());
                reject(e);
              });
          }),
        },
        save: {
          matches: /^SAVE(\.\S+|$)/i,
          fn: () => false,
          /* <!-- Returning False will mean route fall-through to app route --> */
        },
        import: {
          matches: /^IMPORT(\.\S+|$)/i,
          length: 0,
          fn: (command, options) => new Promise((resolve, reject) => {
            ಠ_ಠ.Display.files({
                id: options.id ? options.id : "prompt_file",
                title: options.title ? options.title : "Please import file ...",
                message: options.message ?
                  options.message : ಠ_ಠ.Display.doc.get(options.template ?
                    options.template : "IMPORT"),
                action: "Import",
                single: true
              }).then(file => resolve(file))
              .catch(e => (e ? ಠ_ಠ.Flags.error("Displaying File Upload Prompt", e) : ಠ_ಠ.Flags.log("File Upload Cancelled")) && reject());
          }),
        },
        export: {
          matches: /^EXPORT(\.\S+|$)/i,
          fn: () => false,
          /* <!-- Returning False will mean route fall-through to app route --> */
        },
        clone: {
          matches: /^CLONE(\.\S+|$)/i,
          fn: () => false,
          /* <!-- Returning False will mean route fall-through to app route --> */
        },
        close: {
          matches: /^CLOSE(\.\S+|$)/i,
          fn: () => _clean(true),
        },
        tutorials: { /* <!-- Show App Tutorials --> */
          matches: /^TUTORIALS$/i,
          fn: () => ಠ_ಠ.Display.doc.show({
            name: "TUTORIALS",
            title: `Tutorials for ${options.name ? options.name : "App"} ...`,
            class: _options.center ? "modal-dialog-centered" : "",
            target: $("body"),
            wrapper: "MODAL"
          }).modal("show"),
        },
        remove: {
          matches: /^REMOVE(\.\S+|$)/i,
          length: 1,
          fn: command => ಠ_ಠ.Recent.remove(command).then(id => $(`#${id}`).remove()),
        },
        routes: { /* <!-- Debug Show all Routes --> */
          matches: /^ROUTES$/i,
          fn: () => _.each(_options.routes, (route, key) => ಠ_ಠ.Flags.log(`Registered Route: ${key}`, route))
        },
        spin: {
          matches: /^SPIN$/i,
          fn: () => ಠ_ಠ.Display.busy({
            target: ಠ_ಠ.container
          }),
        },
        experiments: { /* <!-- Turn on Experimental Features --> */
          matches: /^EXPERIMENTS$/i,
          length: 0,
          fn: () => ಠ_ಠ.Display.state().toggle(STATE_EXPERIMENTS),
        },
        instructions: { /* <!-- Show App Instructions --> */
          matches: /^INSTRUCTIONS(\.\S+|$)/i,
          keys: ["i", "I"],
          fn: command => {

            /* <!-- Load the Instructions --> */
            var show = (name, title) => $(`div.modal[data-doc="${name}"]`).length === 0 ? ಠ_ಠ.Display.doc.show({
              name: name,
              title: title,
              class: _options.center ? "modal-dialog-centered" : "",
              target: $("body"),
              wrapper: "MODAL"
            }).modal("show") : false;

            /* <!-- Process Specific App Instructions --> */
            var _shown = false;
            if (options.instructions && command) {
              var _match = _.find(options.instructions, instruction => {
                command = _.isArray(command) ? command : [command];
                instruction.match = _.isArray(instruction.match) ? 
                                      instruction.match : [instruction.match];
                return command.length == instruction.match.length && 
                  _.every(command, (value, index) => instruction.match[index].test(value));
              });
              if (_match) _shown = true && show(_match.show, _match.title);
            }

            /* <!-- Fall-Through --> */
            if (!_shown) show("INSTRUCTIONS", `How to use ${options.name ? options.name : "App"} ...`);
          },
        },
        help: { /* <!-- Request Help --> */
          matches: /^HELP$/i,
          fn: () => ಠ_ಠ.Help.provide(ಠ_ಠ.Flags.dir()),
        }
      };

      /* <!-- Call delayed until routing is triggered (ensure underscore is loaded) --> */
      const SETUP = (options => () => {

        /* <!-- Ensure a routes object exists --> */
        _options = _.defaults(options, {
          routes: {},
          test: () => ಠ_ಠ.Display.state().in(_options.states, true),
          clear: () => _.each(_options.state, (value, key, list) => {
            if (list[key] && list[key].close && _.isFunction(list[key].close)) list[key].close();
            delete list[key];
          }),
        });

        /* <!-- Recursively Expand Child Routes --> */
        _.each(_options.routes, (route, name) =>
          route.routes && !EXPAND(_options.routes, route, name).fn ?
          delete _options.routes[name] : false);

        /* <!-- Integrate the default routes with the custom supplied ones --> */
        _.each(ROUTES, (route, name) => INTEGRATE(_options.routes, route, name));

        /* <!-- Setup the shortcuts, start and end methods --> */
        _keyboard = debug => window.Mousetrap ? _.each(_options.routes, (route, name) => {
          /* <!-- Bind Shortcut key/s if required --> */
          if (route.keys && (!route.length || route.length === 0)) {
            route.keys = _.isArray(route.keys) ? route.keys : [route.keys];
            _.each(route.keys, key => window.Mousetrap.bind(key, (_shortcut)(route, debug, name, key)));
          }
        }) : true;
        _touch = debug => window.Hammer ? _.each(_options.routes, (route, name) => {
          /* <!-- Bind Touch Actions if required --> */
          if (route.actions && (!route.length || route.length === 0)) {
            route.actions = _.isArray(route.actions) ? route.actions : [route.actions];
            var _target = route.target ? route.target : "__default";
            var _hammer = this[_target] ? this[_target] :
              (this[_target] = new window.Hammer((route.target ?
                $(route.target) : ಠ_ಠ.container)[0]));
            _hammer.on(route.actions.join(" "), ((state, fn, requires, options, debug, name) => e => e.pointerType == "touch" && (!state || ಠ_ಠ.Display.state().in(state, route.all ? false : true)) ? 
                (!debug || ಠ_ಠ.Flags.log(`Touch Action ${e.type} routed to : ${name}`)) && (requires ? 
                  ಠ_ಠ.Controller.load(_.map(_.isString(requires) ? [requires] : requires, required => ಠ_ಠ.IMPORTS.LOAD_LAZY[required])) : 
                  Promise.resolve()).then(() => fn(null,  PREPARE(options))) : false)(route.state, route.fn, route.requires, route.options, debug, name));
          }
        }, {}) : true;
        _shortcuts = debug => _keyboard(debug) && _touch(debug),
          _start = (deadend, state) => _enter(_options.recent === undefined ? 5 : _options.recent, deadend ? null : _options.start, _options.simple, state);
        _end = () => _exit(_options.test, _options.states ? _options.states : [], _options.clear);

        /* <!-- Self-Removing Setup Function --> */
        _setup = () => {

          /* <!-- Verbose Debug Flag: For future logging --> */
          _debug = ಠ_ಠ.Flags && ಠ_ಠ.Flags.verbose();
          
          /* <!-- Initial States --> */
          if (ಠ_ಠ.Display && ಠ_ಠ.Flags) {
            
            /* <!-- Enter Experiments Mode if specified by Flags --> */
            if (ಠ_ಠ.Flags.development() || ಠ_ಠ.Flags.experiments()) ಠ_ಠ.Display.state().enter(STATE_EXPERIMENTS); 
            
            /* <!-- Enter External OAuth Mode if specified by Flags --> */
            if (ಠ_ಠ.Flags.oauth()) ಠ_ಠ.Display.state().enter(STATE_EXTERNAL_OAUTH); 
            
          }
          
          /* <!-- Run App Setup --> */
          if (_options.setup) _options.setup();

          _shortcuts(_debug);

          return (_setup = null);

        };

      })(options);

      /* <!-- handled_Requires = requires already handled by main --> */
      /* <!-- handled_Scopes = scopes already handled by main --> */
      return (command, handled_Requires, handled_Scopes)  => {

        var _handled = true, _executions = {};

        if (!_options) SETUP();

        if (!command || command === false || command[0] === false || (/^PUBLIC$/i).test(command)) {

          /* <!-- Clear the existing state (in case of logouts) --> */
          /* <!-- command[1] = true when logging out --> */
          if (command && command[1]) _end();

          /* <!-- Load the Public Instructions --> */
          /* <!-- Don't use handlebar templates here as we may be routed from the controller, and it might not be loaded --> */
          if (!command || !_last || command[0] !== _last[0]) ಠ_ಠ.Display.doc.show({
            wrapper: _options.public ? null : "PUBLIC",
            name: _options.public || "FEATURES",
            target: ಠ_ಠ.container,
            clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
          });

        } else if (command === true || /^AUTH$/i.test(command) || (command && command[0] === true && command.length == 2)) {

          /* <!-- Check the setup --> */
          _setup = _setup ? _setup() : _setup;

          /* <!-- Kick off the App Start Process --> */
          (command[0] === true ? _start(false, command[1]) : _start());

        } else {

          /* <!-- Check the setup --> */
          _setup = _setup ? _setup() : _setup;

          /* <!-- Try to handle the command with a route we know about --> */
          var _match = (route, command) => route.matches ?
            _.every(route.matches = _.isRegExp(route.matches) ? [route.matches] : route.matches,
              (match, index) => _.isString(command) ?
              index === 0 ? match.test(command) : false : command.length > index && match.test(command[index])) : false,

            _check = (route, command) => (!route.qualifier || route.qualifier(command)) &&
            (route.length === undefined ||
              (
                (
                  _.isObject(route.length) &&
                  (route.length.min !== undefined || route.length.max !== undefined) &&
                  (route.length.min === undefined || command.length >= route.length.min) &&
                  (route.length.max === undefined || command.length <= route.length.max)
                ) || (_.isNumber(route.length) && command.length == route.length)
              )
            ) && (route.next === undefined || route.next.test(command)),

            _route = _.find(_options.routes, route => route.active !== false &&
              (!route.state || ಠ_ಠ.Display.state().in(route.state, route.all ? false : true)) &&
              _match(route, command) && _check(route, STRIP(command, (route.__length = route.matches.length))));

          /* <!-- Execute the route if available --> */
          _route && _route.fn ? (_executions.local = (_route.requires || _route.scopes ? Promise.all([
                    (handled_Requires === null || handled_Requires === undefined ? (handled_Requires = true) : false) && _route.requires ? 
                      REQUIRES(_route.requires) : Promise.resolve(handled_Requires),
                    (handled_Scopes === null || handled_Scopes === undefined ? (handled_Scopes = true) : false) && _route.scopes ?
                      SCOPES(_route.scopes) : Promise.resolve(handled_Scopes)
                  ]).then(results => _route.permissive || _.every(results) ? 
                        _execute(_route, command) : 
                        (ಠ_ಠ.Flags.log("Route is not permissive and preconditions failed:", results), false)) :
                      _execute(_route, command))) === false ? (_handled = false) : true : (_handled = false);

          /* <!-- Log is available, so debug log --> */
          if (_handled && _debug) ಠ_ಠ.Flags.log(`Routed to: ${STR(_route)} with: ${STR(command)}`);

        }

        /* <!-- Record the last command --> */
        _last = command;

        /* <!-- Route to App-Specific Command --> */
        if (_options.route) _executions.app = _options.route(_handled, command);

        return Promise.all([
          Promise.resolve(_executions.local),
          Promise.resolve(_executions.app)
        ]);
        
      };

    },
    
    clean: _clean,

    run: state => _start(true, state),
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};