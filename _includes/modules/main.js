Main = function() {
	
	/* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Main)) {return new this.Main().initialise(this);}
	
	/* <!-- Internal Variables --> */
	var ಠ_ಠ;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	
	/* <!-- Lightweight Hello Modules --> */
	var _setup = function(hello) {
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
	
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container) {
			
			/* <!-- Get Reference to Container --> */
			ಠ_ಠ = container;
			
			/* <!-- Initialise Objects --> */
			ಠ_ಠ.Recent();
			ಠ_ಠ.App();
			
			/* <!-- Set Container Reference to this --> */
			ಠ_ಠ.Main = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
		
		start : function() {

			var google_Initialise = function(auth) {

				return ಠ_ಠ.Google_API(ಠ_ಠ).initialise(auth.access_token, auth.token_type, auth.expires, 
					(function(s) {
						return function() {
							return new Promise(function(resolve, reject) {
								hello.login(ಠ_ಠ.SETUP.GOOGLE_AUTH, {force: false, display : "none", scope : s}).then(function(r) {
									if (r.authResponse) {
										resolve({
											token : r.authResponse.access_token,
											type : r.authResponse.token_type,
											expires : r.authResponse.expires,
										});
									} else {
										resolve();
									}
								}, function(err) {reject(err);});
							});
						};
					})(encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" "))), ಠ_ಠ.Flags.key() || ಠ_ಠ.SETUP.GOOGLE_KEY, ಠ_ಠ.Flags.oauth() || ಠ_ಠ.SETUP.GOOGLE_CLIENT_ID);
				
			};
			
			var google_SignIn = function() {
        var _login = (display, force) => hello.login(ಠ_ಠ.SETUP.GOOGLE_AUTH, {
					force: force, display : display,
					scope : encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")),
				});
				var _success = (a) => ಠ_ಠ.Flags.log("Signed into Google", a);
				var _failure = (e) => ಠ_ಠ.Flags.error("Signed into Google", e);
				var _retry = (e) => {
					if (e.error && e.error.code && e.error.code == "blocked") {
						_login("page", true).then(_success, _failure);
					} else if (e.error && e.error.code && e.error.code == "cancelled") {
						ಠ_ಠ.Flags.log("Cancelled Signing into Google");
					} else {
						ಠ_ಠ.Flags.error("Signed into Google", e);
					}
				};
				_login((ಠ_ಠ.SETUP.SINGLE_PAGE || ಠ_ಠ.Flags.page()) ? "page" : "popup", false).then(_success, _retry);
			};

			var google_SignOut = function() {
				hello.logout(ಠ_ಠ.SETUP.GOOGLE_AUTH).then(function(a) {
					/* <!-- Module Cleans --> */
					[ಠ_ಠ.Recent, ಠ_ಠ.App].forEach((m) => {if (m.clean) m.clean();});
					ಠ_ಠ.Flags.log("Signed out of Google", a);
				}, function(e) {
					ಠ_ಠ.Flags.error("Signing out of Google", e);
				});
			};
			
			var _routeIn = function() {if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(true);}, _routeOut = function() {if (ಠ_ಠ.App.route) ಠ_ಠ.App.route([false, true]);};
			
			var _route = function(directive, command) {
				
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
					
						/* <!-- Scope Authorisation --> */
						/* <!-- TODO: Handle State for Full Page redirects.... --> */
						var scopes= directive.split("|")[1].split(";");
						hello.login(ಠ_ಠ.SETUP.GOOGLE_AUTH, {
							force: false, display : (ಠ_ಠ.SETUP.SINGLE_PAGE || ಠ_ಠ.Flags.page()) ? "page" : "popup",
							scope : encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.concat(scopes).join(" "))
						}).then(
							(a) => {
								ಠ_ಠ.Flags.log("Signed into Google", a);
								if (!a.unchanged) ಠ_ಠ.google = google_Initialise(a.authResponse);
								if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);
							}, 
							(e) => ಠ_ಠ.Flags.error("Signed into Google", e)
						);
						
					} else {
					
						if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);
						
					}
					
				} else {
					
					if (ಠ_ಠ.App.route) ಠ_ಠ.App.route(command);
					
				}
			};
			
			var router = function() {
				if (ಠ_ಠ.Flags) ಠ_ಠ.Flags.change(_route);
			};
			
			var setupRouter = function(start) {
				
				/* <!-- Route Start --> */
				if (start) start();
				
				/* <!-- Call Router Initially --> */
				if (window.location.hash) router();
				
				/* <!-- Add Router Method --> */
				window.onhashchange = router;
				window.onpopstate = (e) => {if (ಠ_ಠ.Flags && e && e.state && e.state.command) ಠ_ಠ.Flags.route(event.state.command, _route);};
				
			};
			
			_setup(hello);

			/* <!-- Enable Tooltips --> */
			$("[data-toggle='tooltip']").tooltip();

			/* <!-- Enable Closing Bootstrap Menu after Action --> */
			var navMain = $(".navbar-collapse");
			navMain.on("click.collapse", "a:not([data-toggle='dropdown'])", () => navMain.collapse("hide"));
			navMain.on("click.tooltip-remove", "a[data-toggle='tooltip']", (e) => $(e.target).tooltip("dispose"));
			
			/* <!-- Auth Triggers & Functions --> */
			var is_SignedIn = function(session) {
				return session && session.access_token && new Date(session.expires * 1000) >= new Date();
			};

			var google_LoggedIn = function(auth) {

				if (!ಠ_ಠ.google) {

					/* <!-- Initialise Google Provider --> */
					ಠ_ಠ.google = google_Initialise(auth);
					
					/* <!-- Get User Info for Display --> */
					ಠ_ಠ.google.me().then(function(user) {

						user.display_name = function() {return this.name.length == 3 ? this.name.split(" ").join("") : this.name;};
						user.full_name = function() {return this.display_name()  + " (" + this.email + ")";};
						ಠ_ಠ.me = user;
						
						/* Disable and Hide the Sign in */
						$("#sign_in").hide().children(".btn").attr("title","").off("click.login");
						
						/* Enable and Shopw the Sign Out */
						$("#user_details").text(ಠ_ಠ.me.display_name()).attr("title", "To remove from your account (" + ಠ_ಠ.me.email + "), click & follow instructions");
						$("#sign_out .btn").on("click.logout", function(e) {e.preventDefault(); google_SignOut();});
						$("#sign_out").show();

						/* <!-- Route Authenticated --> */
						setupRouter(_routeIn);

					}).catch(function(e) {
						ಠ_ಠ.Flags.error("Google Me", e);
						/* <!-- Maybe user has revoked scopes, so default back to unauthenticated --> */
						if (e.status == 401) google_SignOut();
					});

				}

			};

			var google_LoggedOut = function() {

				/* <!-- Delete Objects dependent on being Logged in --> */
				delete ಠ_ಠ.google;

				/* Disable and Hide the Sign Out */
				$("#sign_out").hide().children(".btn").off("click.logout");
				$("#user_details").text("").attr("title", "");

				/* Enable and Shopw the Sign In */
				$("#sign_in").show().children(".btn").attr("title", "Click here to log into this app, you will be promped to authorise the app on your account if required").on("click.login", function(e) {e.preventDefault(); google_SignIn();});
				$(".auth-only").hide();

				/* <!-- Route Un-Authenticated --> */
				setupRouter(_routeOut());

			};
			/* <!-- Auth Triggers --> */

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

				/* <!-- Module Starts --> */
				[ಠ_ಠ.Display, ಠ_ಠ.Recent].forEach((m) => {if (m.start) m.start();});
				
				/* <!-- Append Content Holder --> */
				if (!ಠ_ಠ.container) ಠ_ಠ.container = $("#content");

				var _start = function() {

					/* <!-- Set Up Hello.js Auth-Flow --> */
					var _init = {};
					_init[ಠ_ಠ.SETUP.GOOGLE_AUTH] = ಠ_ಠ.Flags.oauth() || ಠ_ಠ.SETUP.GOOGLE_CLIENT_ID;
					hello.init(_init, {redirect_uri : "/redirect/"});
					/* <!-- Set Up Hello.js Auth-Flow --> */

					/* <!-- Start Auth Flow --> */
					try {
						var g = hello(ಠ_ಠ.SETUP.GOOGLE_AUTH).getAuthResponse();

						if (is_SignedIn(g)) { /* Signed In */
							google_LoggedIn(g);
						} else if (g && new Date(g.expires * 1000) < new Date()) { /* Expired Token */

							var refresh_race = Promise.race([
								hello.login(ಠ_ಠ.SETUP.GOOGLE_AUTH, { /* Try silent token refresh */
									force: false, display : "none", scope : encodeURIComponent(ಠ_ಠ.SETUP.GOOGLE_SCOPES.join(" ")),
								}),
								new Promise(function(resolve, reject){
									setTimeout(function() { reject("Login Promise Timed Out"); }, 2000);
								})
							]);

							refresh_race.then(function(a) {
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
   /* <!-- External Functions --> */
    
	};
  /* <!-- External Visibility --> */
};