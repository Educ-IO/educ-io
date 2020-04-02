Main = function() {

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Main)) return new this.Main().initialise(this);

  /* <!-- Internal Constants --> */
  const LOGIN_RACE = 5000,
    REFRESH_RACE = 60000,
    STATE_AUTH = "authenticated";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, _default, _modules = ["Display", "Help", "Recent", "Router", "Dates", "App"], _helpers = ["Url", "Handlebars"], _last;
  /* <!-- Internal Variables --> */

  /* <!-- Plumbing Functions --> */

  /* <!-- TODO: Overlapping busy calls can cause issues, so we check that it is function --> */
  const BUSY = (status, full, event, initial) => _.wrap(ಠ_ಠ.Display.busy({
    target: full ? ಠ_ಠ.container.parent() : ಠ_ಠ.container,
    status: event ? {
        source: window,
        event: event,
        value: status,
        initial: initial || null,
      } : status,
    fn: true
  }), (busy, value) => _.tap(value, () => _.isFunction(busy) ? busy() : false));
  
  const EVENT = (event, message) => window.dispatchEvent(new CustomEvent(event, _.isObject(message) ? message : {detail : message}));
  
  const MESSAGE = (count, singular, plural, action) => `${ಠ_ಠ.Display.commarise(count)} ${count > 1 ? plural : singular} ${action || "loaded"}`;
  
  const PROMPT = (name, map, list) => (_.isFunction(list) ? list() : Promise.resolve(list))
        .catch(e => ಠ_ಠ.Flags.error(`${name} List`, e).negative())
        .then(BUSY(`Loading ${name}s`))
        .then(options => options === false || options.length === 0 ||
          (options.length == 1 && (options[0] === undefined || options[0] === null)) ? false : ಠ_ಠ.Display.choose({
            id: `choose_${name}`,
            title: `Please Choose a ${name} to Open ...`,
            action: options && options.length > 0 ? "Open" : false,
            choices: map ? _.map(options, map) : options,
            multiple: true
          })
          .catch(e => (e ? ಠ_ಠ.Flags.error(`${name} Select:`, e) : ಠ_ಠ.Flags.log(`${name} Select Cancelled`)).negative())
          .then(results => results ? _.isArray(results) ? results.length === 0 ? false : results : [results] : false));
  
  /* <!-- Plumbing Functions --> */

  /* <!-- Internal Functions --> */

  /* <!-- Lightweight Hello Modules --> */
  var _setup = hello => {
    "use strict";

    var config = {};
    if (ಠ_ಠ.SETUP.GOOGLE_AUTH) config[ಠ_ಠ.SETUP.GOOGLE_AUTH] = {
      name: ಠ_ಠ.SETUP.GOOGLE_AUTH,
      oauth: {
        version: 2,
        auth: "https://accounts.google.com/o/oauth2/auth",
        grant: "https://accounts.google.com/o/oauth2/token"
      },
      base: "https://www.googleapis.com/",
    };

    if (ಠ_ಠ.SETUP.GITHUB_AUTH) config[ಠ_ಠ.SETUP.GITHUB_AUTH] = {
      name: ಠ_ಠ.SETUP.GITHUB_AUTH,
      oauth: {
        version: 2,
        auth: "https://github.com/login/oauth/authorize",
        grant: "https://github.com/login/oauth/access_token",
        response_type: "code"
      },
      base: "https://api.github.com/",
    };

    hello.init(config);

  };
  /* <!-- Lightweight Hello Modules --> */

  var google_Success = message => a => ಠ_ಠ.Flags.log(message, a);

  var google_Failure = message => e => ಠ_ಠ.Flags.error(message, e);

  var hello_Login = (force, display, scopes) => {
    ಠ_ಠ.Flags.log(`Calling Hello Login with force=${force} and display=${display} -- [SCOPES = ${scopes}]`);
    return hello.login(ಠ_ಠ.SETUP.GOOGLE_AUTH, {
      force: force,
      display: display,
      scope: scopes,
    });
  };

  var google_Login = scopes => (display, force, timeout) => {

    var _id, _timeout = new Promise((resolve, reject) => {
      _id = setTimeout(() => {
        var __id;
        Promise.race([
          hello_Login(force, display, scopes), /* <!-- Try normal login --> */
          new Promise((resolve, reject) => __id = setTimeout(() => reject("Login Promise Timed Out"), timeout ? timeout : LOGIN_RACE))
        ]).then(r => {
          clearTimeout(__id);
          resolve(r);
        }).catch(e => reject(e));
      }, LOGIN_RACE / 5);
    });

    return Promise.race([
      hello_Login(false, "none", scopes).then(r => {
        clearTimeout(!force ? _id : false);
        return r;
      }), /* <!-- Try silent token refresh --> */
      _timeout /* <!-- Then try pop-up/page token refresh --> */
    ]);

  };

  var google_Retry = (login, success, failure) => e => {
    if (e.error && e.error.code && e.error.code == "blocked") {
      login("page", true).then(success, failure); /* <!-- TODO: Handle State for Full Page redirects.... --> */
    } else if (e.error && e.error.code && e.error.code == "cancelled") {
      ಠ_ಠ.Flags.log("Cancelled Signing into Google");
    } else {
      failure(e);
    }
  };

  var google_Initialise = auth => {
    return ಠ_ಠ.Google_API({}, {
      Network: ಠ_ಠ.Network,
      Strings: ಠ_ಠ.Strings
    }).initialise(auth.access_token, auth.token_type, auth.expires, auth.authuser,
      (refresher => {
        return force => new Promise((resolve, reject) => {
          refresher(_default, force).then(r => r.authResponse ? resolve({
            token: r.authResponse.access_token,
            type: r.authResponse.token_type,
            expires: r.authResponse.expires,
            user: r.authResponse.authuser
          }) : resolve()).catch(err => reject(err));
        });
      })(google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")))), ಠ_ಠ.Flags.key() || ಠ_ಠ.SETUP.GOOGLE_KEY, ಠ_ಠ.Flags.oauth() || ಠ_ಠ.SETUP.GOOGLE_CLIENT_ID);
  };

  var google_SignIn = () => {
    var _login = google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" "))),
      _action = "Signed into Google",
      _success = google_Success(_action),
      _failure = google_Failure(_action),
      _retry = google_Retry(_login, _success, _failure);
    _login(_default, false).then(_success).catch(_retry);
  };

  var google_SignOut = () => {
    hello.logout(ಠ_ಠ.SETUP.GOOGLE_AUTH).then(function(a) {
      /* <!-- Module Cleans --> */
      _modules.forEach(m => ಠ_ಠ[m] && ಠ_ಠ._isF(ಠ_ಠ[m].clean) ? ಠ_ಠ[m].clean.call(ಠ_ಠ) : false);
      google_Success("Signed out of Google")(a);
    }, google_Failure("Signed out of Google"));
  };

  var google_Authorise = scopes => {

    /* <!-- Extra Scope Authorisation --> */
    var _login = google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.concat(scopes).join(" "))),
      _action = "Signed into additional Google Scopes",
      _success = a => {
        google_Success(_action)(a);
        if (!a.unchanged) ಠ_ಠ.Google = google_Initialise(a.authResponse);
        return true;
      },
      _failure = google_Failure(_action),
      _retry = google_Retry(_login, _success, _failure);
    return _login(_default, false, REFRESH_RACE).then(_success, _retry);

  };

  var _routeIn = () => {
      if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(true);
    },
    _routeOut = () => {
      if (ಠ_ಠ.App.route) ಠ_ಠ.App.route([false, true]);
    };

  var _route = (directive, command) => {

    ಠ_ಠ.Flags.log("ROUTING", [directive, command]);

    if ((/GOOGLE/i).test(directive)) {

      if (!ಠ_ಠ.Google) {

        /* <!-- No existing sign-in, so full sign-in --> */
        google_SignIn();
        _routeIn = function() {
          _routeIn = function() {
            if (ಠ_ಠ.App.route) return ಠ_ಠ.App.route(true);
          };
          if (ಠ_ಠ.App.route) return ಠ_ಠ.App.route(command);
        };

      } else if ((/\|/i).test(directive)) {

        /* <!-- Extra Scope Authorisation --> */
        google_Authorise(directive.split("|")[1].split(";")).then(result => {
          if (result === true && ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);
        });

      } else {

        if (ಠ_ಠ.App.route) return ಠ_ಠ.App.route(command);

      }

    } else {

      if (ಠ_ಠ.App.route) return ಠ_ಠ.App.route(command);

    }
    
  };

  var router = () => ಠ_ಠ.Flags ? ಠ_ಠ.Flags.change(_route) : false;

  var setupRouter = (start, quiet) => {
    
    /* <!-- Route Start --> */
    if (start) start();

    /* <!-- Call Router Initially (if required) | Default Hash = #! --> */
    var _initial = ಠ_ಠ.Flags ? ಠ_ಠ.Flags.initial() : null;
    
    Promise.resolve(ಠ_ಠ.Flags && _last != _initial && (_last = _initial) ? ಠ_ಠ.Flags.route(_initial, _route) : window.location.hash ? router() : null)
      /* <!-- Module Finally | After all initial routes --> */
      .then(() => quiet === true ? false : _modules.forEach(m => ಠ_ಠ[m] && ಠ_ಠ._isF(ಠ_ಠ[m].finally) ? 
                                   ಠ_ಠ[m].finally.call(ಠ_ಠ) : false));

    /* <!-- Add Router Method --> */
    window.onhashchange = router;
    window.onpopstate = e => {
      if (ಠ_ಠ.Flags && e && e.state && e.state.command) ಠ_ಠ.Flags.route(e.state.command, _route);
    };

  };

  /* <!-- Auth Triggers --> */
  var is_SignedIn = session => {
    return session && session.access_token && new Date(session.expires * 1000) >= new Date();
  };

  var route_LoggedIn = user => {

    /* <!-- Clean and Hide the Auth Processing --> */
    $("#auth_processing").hide();
    $("#get_Started").removeClass("loader");

    /* <!-- Disable and Hide the Sign in --> */
    $("#sign_in").hide().children(".btn").attr("title", "").off("click.login");

    /* <!-- Enable and Show the Sign Out --> */
    user.available ?
      $("#user_details").text(user.display_name())
      .attr("title", "To remove from your account (" + user.email + "), click & follow instructions").parent().show() :
      $("#user_details").parent().hide();
    $("#sign_out .btn").on("click.logout", e => {
      e.preventDefault();
      google_SignOut();
    });
    $("#sign_out").show(200);

    /* <!-- Register authenticated state --> */
    ಠ_ಠ.Display.state().enter(STATE_AUTH);

    /* <!-- Call Ready: Google is loaded and we are authenticated --> */
    if (ಠ_ಠ.App.ready) ಠ_ಠ.App.ready();

    /* <!-- Route Authenticated --> */
    setupRouter(_routeIn);

  };

  var google_LoggedIn = auth => {

    if (!ಠ_ಠ.Google) {

      /* <!-- Initialise Google Provider --> */
      ಠ_ಠ.Google = google_Initialise(auth);

      /* <!-- Get User Info for Display --> */
      ಠ_ಠ.Google.me().then(user => {

        user.available = true;
        user.display_name = (u => () => ಠ_ಠ.handlebars.username(u.name))(user);
        user.full_name = (u => () => `${u.display_name()} (${u.email})`)(user);

        route_LoggedIn(ಠ_ಠ.me = user);

      }).catch(e => {

        /* <!-- Maybe user has revoked scopes, so default back to unauthenticated --> */
        if (e.status == 401) {
          google_SignOut();
        } else if (e.status == 400 || e.status == 403) {
          route_LoggedIn(ಠ_ಠ.me = {
            available: false
          });
        } else {
          ಠ_ಠ.Flags.error("Google Me", e);
        }
      });

    }

  };

  var google_LoggedOut = () => {

    /* <!-- Delete Objects dependent on being Logged in --> */
    delete ಠ_ಠ.Google;

    /* <!-- Clean and Hide the Auth Processing --> */
    $("#auth_processing").hide();
    $("#get_Started").removeClass("loader");

    /* <!-- Disable and Hide the Sign Out --> */
    $("#sign_out").hide().children(".btn").off("click.logout");
    $("#user_details").text("").attr("title", "");

    /* <!-- Enable and Shopw the Sign In --> */
    $("#sign_in").show(200).children(".btn").attr("title", "Click here to log into this app, you will be promped to authorise the app on your account if required")
      .on("click.login", e => {
        e.preventDefault();
        google_SignIn();
      });
    $(".auth-only").hide();

    /* <!-- De-Register authenticated state --> */
    ಠ_ಠ.Display.state().exit(STATE_AUTH);

    /* <!-- Route Un-Authenticated --> */
    setupRouter(_routeOut, true);

  };
  /* <!-- Auth Triggers --> */

  /* <!-- Internal Functions --> */

  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise: function(container) {

      /* <!-- Get Reference to Container --> */
      ಠ_ಠ = container;

      /* <!-- Initialise Objects --> */
      _modules.forEach(m => ಠ_ಠ[m] && ಠ_ಠ._isF(ಠ_ಠ[m]) ? ಠ_ಠ[m].call(ಠ_ಠ) : false);

      /* <!-- Set Container Reference to this --> */
      ಠ_ಠ.Main = this;

      /* <!-- Return for Chaining --> */
      return this;

    },

    start: () => {

      /* <!-- Material Button Waves --> */
      if (window.Waves) {
        Waves.attach(".btn");
        Waves.init();
      }

      /* <!-- Initialise Hello Auth --> */
      _setup(hello);

      /* <!-- Auth Handlers --> */
      hello.on("auth.login", auth => {

        if (auth.network == ಠ_ಠ.SETUP.GOOGLE_AUTH) google_LoggedIn(auth.authResponse);

      });

      hello.on("auth.logout", auth => {

        if (auth.network == ಠ_ಠ.SETUP.GOOGLE_AUTH) {

          if (auth.authResponse && auth.authResponse.error && auth.authResponse.error.code == "access_denied") {

            ಠ_ಠ.Flags.error("Google Authorisation / Sign-In Error", auth.authResponse);

          } else {

            google_LoggedOut();

          }

        }

      });
      /* <!-- Auth Handler --> */

      /* <!-- Get Global Flags --> */
      ಠ_ಠ.Flags.initialise().then(flags => {

        ಠ_ಠ.Flags = flags;
        _default = (ಠ_ಠ.SETUP.SINGLE_PAGE || ಠ_ಠ.Flags.page()) ? "page" : "popup";

        /* <!-- Helper Creations --> */
        _helpers.forEach(h => ಠ_ಠ[h] && ಠ_ಠ._isF(ಠ_ಠ[h]) ? ಠ_ಠ[h.toLowerCase()] = ಠ_ಠ[h]({}, ಠ_ಠ) : false);
        
        /* <!-- Module Starts --> */
        _modules.forEach(m => ಠ_ಠ[m] && ಠ_ಠ._isF(ಠ_ಠ[m].start) ? ಠ_ಠ[m].start.call(ಠ_ಠ) : false);

        /* <!-- Append Content Holder --> */
        if (!ಠ_ಠ.container) ಠ_ಠ.container = $("#content");

        var _start = function() {

          /* <!-- Visually Indicate that Auth-Flow is starting --> */
          $("#auth_processing").show();
          $("#get_Started").addClass("loader");

          /* <!-- Set Up Hello.js Auth-Flow --> */
          var _init = {};
          _init[ಠ_ಠ.SETUP.GOOGLE_AUTH] = ಠ_ಠ.Flags.oauth() || ಠ_ಠ.SETUP.GOOGLE_CLIENT_ID;
          hello.init(_init, {
            redirect_uri: "/redirect/"
          });
          /* <!-- Set Up Hello.js Auth-Flow --> */

          /* <!-- Start Auth Flow --> */
          try {
            var g = hello(ಠ_ಠ.SETUP.GOOGLE_AUTH).getAuthResponse(),
              exp = g ? new Date(g.expires * 1000) : null;

            if (is_SignedIn(g)) { /* <!-- Signed In --> */
              google_LoggedIn(g);
            } else if (g && exp < new Date()) { /* <!-- Expired Token --> */

              ಠ_ಠ.Flags.log(`Google Auth Token Expired: ${exp}`);
              google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")))(_default, false).then(function(a) {
                if (is_SignedIn(a.authResponse)) {
                  google_LoggedIn(a.authResponse);
                } else {
                  google_LoggedOut();
                }
              }, e => {
                ಠ_ಠ.Flags.error("Signing into Google", e);
                google_LoggedOut();
              });

            } else { /* <!-- Not Logged In --> */
              google_LoggedOut();
            }

          } catch (e) {
            ಠ_ಠ.Flags.error("Google Auth Flow", e);
          }
          /* <!-- Start Auth Flow --> */

        };

        _start();

      });

    },

    refresh: force => google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")))(_default, force === true ? true : false),

    pick: (prompt, views, log, mimeType) => new Promise((resolve, reject) => {

      /* <!-- Open from Google Drive Picker --> */
      if (ಠ_ಠ.Google) ಠ_ಠ.Google.pick(
        prompt, false, true, views,
        file => file ? file.mimeType.toLowerCase() == mimeType.toLowerCase() ?
        ಠ_ಠ.Flags.log(log, file) && resolve(file) : reject("Wrong Type of File Picked") : reject("No File Picked")
      );

    }),

    busy: BUSY,
    
    event: EVENT,
    
    message: MESSAGE,
    
    prompt: PROMPT,

    /* <!-- Extra Scope Authorisation (IF REQUIRED) --> */
    elevator: SCOPE => fn => {
      var _retry = retry => fn()
        .catch(e => {
          if (e.status == 403 || e.status == 404) { /* <!-- e.status: 403 or 404 | Seems to return both? --> */
            ಠ_ಠ.Flags.log("ELEVATE: May need to grant permission");
            return {
              retry: retry
            };
          }
        })
        .then(result => result && result.retry === true ?
          google_Authorise(SCOPE)
          .then(result => result === true ? _retry(false) : result) : result);
      return _retry(true);
    },

    /* <!-- Add Extra Scope --> */
    authorise: google_Authorise,
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */
};