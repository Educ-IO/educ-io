Main = function() {
	
	/* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Main)) {return new this.Main().initialise(this);}
	
	/* <!-- Internal Constants --> */
	const LOGIN_RACE = 2000;
	/* <!-- Internal Constants --> */
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _default;
  /* <!-- Internal Variables --> */
	
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
      force: force, display : display, scope : scopes,
    });
  };
    
  var google_Login = scopes => (display, force) => {
    var _id, _timeout = new Promise(() => _id = setTimeout(() => Promise.race([
        hello_Login(force, display, scopes),
        new Promise((resolve, reject) => setTimeout(() => reject("Login Promise Timed Out"), LOGIN_RACE))
      ]), LOGIN_RACE / 2));
    return Promise.race([
      hello_Login(false, "none", scopes).then(r => {
        clearTimeout(!force ? _id : false);
        return r;
      }), /* <!-- Try silent token refresh --> */
      _timeout /* <!-- Then try pop-up/page token refresh --> */
    ]);
   };
  
  var google_Retry = (login, success, failure) => (e) => {
      if (e.error && e.error.code && e.error.code == "blocked") {
        login("page", true).then(success, failure);  /* <!-- TODO: Handle State for Full Page redirects.... --> */
      } else if (e.error && e.error.code && e.error.code == "cancelled") {
        ಠ_ಠ.Flags.log("Cancelled Signing into Google");
      } else {
        failure(e);
      }
    };

  var google_Initialise = auth => {
    return ಠ_ಠ.Google_API(ಠ_ಠ).initialise(auth.access_token, auth.token_type, auth.expires, 
      (refresher => {
        return force => new Promise((resolve, reject) => {
            refresher(_default, force).then(r => r.authResponse ? resolve({
              token : r.authResponse.access_token,
              type : r.authResponse.token_type,
              expires : r.authResponse.expires,
            }) : resolve()).catch(err => reject(err));
          });})(google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")))), ಠ_ಠ.Flags.key() || ಠ_ಠ.SETUP.GOOGLE_KEY, ಠ_ಠ.Flags.oauth() || ಠ_ಠ.SETUP.GOOGLE_CLIENT_ID);
  };

  var google_SignIn = () => {
    var _login = google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" "))),
        _action = "Signed into Google",
        _success = google_Success(_action), 
        _failure = google_Failure(_action),
        _retry = google_Retry(_login, _success, _failure);
    _login(_default, false).then(_success, _retry);
  };

  var google_SignOut = () => {
    hello.logout(ಠ_ಠ.SETUP.GOOGLE_AUTH).then(function(a) {
      /* <!-- Module Cleans --> */
      [ಠ_ಠ.Recent, ಠ_ಠ.App].forEach((m) => {if (m.clean) m.clean();});
      google_Success("Signed out of Google")(a);
    }, google_Failure("Signed out of Google"));
  };

  var _routeIn = () => {if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(true);}, _routeOut = () => {if (ಠ_ಠ.App.route) ಠ_ಠ.App.route([false, true]);};

  var _route = (directive, command) => {

    ಠ_ಠ.Flags.log("ROUTING", [directive, command]);

    if ((/GOOGLE/i).test(directive)) {

      if (!ಠ_ಠ.google) {

        /* <!-- No existing sign-in, so full sign-in --> */
        google_SignIn();
        _routeIn = function() {
          _routeIn = function() {if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(true);};
          if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);
        };

      } else if ((/\|/i).test(directive)) {

        /* <!-- Extra Scope Authorisation --> */
        var scopes = directive.split("|")[1].split(";"),
          _login = google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.concat(scopes).join(" "))),
          _action = "Signed into additional Google Scopes",
          _success = (a) => {
            google_Success(_action)(a);
            if (!a.unchanged) ಠ_ಠ.google = google_Initialise(a.authResponse);
            if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);
          }, 
          _failure = google_Failure(_action),
          _retry = google_Retry(_login, _success, _failure);
        _login(_default, false).then(_success, _retry);

      } else {

        if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);

      }

    } else {

      if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);

    }
  };

  var router = () => {
    if (ಠ_ಠ.Flags) ಠ_ಠ.Flags.change(_route);
  };

  var setupRouter = start => {

    /* <!-- Route Start --> */
    if (start) start();

    /* <!-- Call Router Initially --> */
    if (window.location.hash) router();

    /* <!-- Add Router Method --> */
    window.onhashchange = router;
    window.onpopstate = (e) => {if (ಠ_ಠ.Flags && e && e.state && e.state.command) ಠ_ಠ.Flags.route(event.state.command, _route);};

  };
  
   /* <!-- Auth Triggers --> */
  var is_SignedIn = session => {
    return session && session.access_token && new Date(session.expires * 1000) >= new Date();
  };

  var google_LoggedIn = auth => {

    if (!ಠ_ಠ.google) {

      /* <!-- Initialise Google Provider --> */
      ಠ_ಠ.google = google_Initialise(auth);

      /* <!-- Get User Info for Display --> */
      ಠ_ಠ.google.me().then(function(user) {

        user.display_name = function() {return this.name.length == 3 ? this.name.split(" ").join("") : this.name;};
        user.full_name = function() {return this.display_name()  + " (" + this.email + ")";};
        ಠ_ಠ.me = user;

        /* <!-- Clean and Hide the Auth Processing --> */
        $("#auth_processing").hide();

        /* <!-- Disable and Hide the Sign in --> */
        $("#sign_in").hide().children(".btn").attr("title","").off("click.login");

        /* Enable and Show the Sign Out */
        $("#user_details").text(ಠ_ಠ.me.display_name()).attr("title", "To remove from your account (" + ಠ_ಠ.me.email + "), click & follow instructions");
        $("#sign_out .btn").on("click.logout", function(e) {e.preventDefault(); google_SignOut();});
        $("#sign_out").show(200);

        /* <!-- Route Authenticated --> */
        setupRouter(_routeIn);

      }).catch(function(e) {
        ಠ_ಠ.Flags.error("Google Me", e);
        /* <!-- Maybe user has revoked scopes, so default back to unauthenticated --> */
        if (e.status == 401) google_SignOut();
      });

    }

  };

  var google_LoggedOut = () => {

    /* <!-- Delete Objects dependent on being Logged in --> */
    delete ಠ_ಠ.google;

    /* <!-- Clean and Hide the Auth Processing --> */
    $("#auth_processing").hide();

    /* Disable and Hide the Sign Out */
    $("#sign_out").hide().children(".btn").off("click.logout");
    $("#user_details").text("").attr("title", "");

    /* Enable and Shopw the Sign In */
    $("#sign_in").show(200).children(".btn").attr("title", "Click here to log into this app, you will be promped to authorise the app on your account if required").on("click.login", function(e) {e.preventDefault(); google_SignIn();});
    $(".auth-only").hide();

    /* <!-- Route Un-Authenticated --> */
    setupRouter(_routeOut());

  };
  /* <!-- Auth Triggers --> */
  
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container) {
			
			/* <!-- Get Reference to Container --> */
			ಠ_ಠ = container;
			
			/* <!-- Initialise Objects --> */
			if (ಠ_ಠ.Help) ಠ_ಠ.Help();
			ಠ_ಠ.Recent();
			ಠ_ಠ.App();
			
			/* <!-- Set Container Reference to this --> */
			ಠ_ಠ.Main = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
		
		start : () => {

      /* <!-- Initialise Hello Auth --> */
			_setup(hello);

			/* <!-- Auth Handlers --> */
			hello.on("auth.login", function (auth) {

				if (auth.network == ಠ_ಠ.SETUP.GOOGLE_AUTH) {

					google_LoggedIn(auth.authResponse);

				}

			});

			hello.on("auth.logout", function (auth) {
				
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
			ಠ_ಠ.Flags.initialise().then(function(flags) {

				ಠ_ಠ.Flags = flags;
        _default = (ಠ_ಠ.SETUP.SINGLE_PAGE || ಠ_ಠ.Flags.page()) ? "page" : "popup";

				/* <!-- Module Starts --> */
				[ಠ_ಠ.Display, ಠ_ಠ.Recent, ಠ_ಠ.App].forEach((m) => {if (m.start) m.start();});
				
				/* <!-- Append Content Holder --> */
				if (!ಠ_ಠ.container) ಠ_ಠ.container = $("#content");

				var _start = function() {

          /* <!-- Visually Indicate that Auth-Flow is starting --> */
          $("#auth_processing").show();
          
					/* <!-- Set Up Hello.js Auth-Flow --> */
					var _init = {};
					_init[ಠ_ಠ.SETUP.GOOGLE_AUTH] = ಠ_ಠ.Flags.oauth() || ಠ_ಠ.SETUP.GOOGLE_CLIENT_ID;
					hello.init(_init, {redirect_uri : "/redirect/"});
					/* <!-- Set Up Hello.js Auth-Flow --> */

					/* <!-- Start Auth Flow --> */
					try {
						var g = hello(ಠ_ಠ.SETUP.GOOGLE_AUTH).getAuthResponse(), exp = g ? new Date(g.expires * 1000) : null;

						if (is_SignedIn(g)) { /* Signed In */
							google_LoggedIn(g);
						} else if (g && exp < new Date()) { /* Expired Token */

							ಠ_ಠ.Flags.log(`Google Auth Token Expired: ${exp}`);
							google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")))(_default, false).then(function(a) {
								if (is_SignedIn(a.authResponse)) {
									google_LoggedIn(a.authResponse);
								} else {
									google_LoggedOut();
								}
							}, function(e) {
								ಠ_ಠ.Flags.error("Signing into Google", e);
								google_LoggedOut();
							});

						} else { /* Not Logged In */
							google_LoggedOut();
						}

					} catch(e) {
						ಠ_ಠ.Flags.error("Google Auth Flow", e);
					}
					/* <!-- Start Auth Flow --> */

				};

				_start();

			});

		},
    
    refresh : (force) => google_Login(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")))(_default, force === true ? true : false),
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};