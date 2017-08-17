Main = function() {
	
	/* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.Main)) {return new this.Main().initialise(this);}
	
	/* <!-- Internal Variables --> */
	var _;
  /* <!-- Internal Variables --> */
	
	/* <!-- Internal Functions --> */
	
	/* <!-- Lightweight Hello Modules --> */
	var _setup = function(hello) {
		"use strict";

		hello.init({

			google: {

				name: "Google",

				oauth: {
					version: 2,
					auth: "https://accounts.google.com/o/oauth2/auth",
					grant: "https://accounts.google.com/o/oauth2/token"
				},

				base: "https://www.googleapis.com/",

			},

			github: {

				name: "GitHub",

				oauth: {
					version: 2,
					auth: "https://github.com/login/oauth/authorize",
					grant: "https://github.com/login/oauth/access_token",
					response_type: "code"
				},

				base: "https://api.github.com/",

			},

		});

	};
	/* <!-- Lightweight Hello Modules --> */
	
	/* <!-- Internal Functions --> */
	
	/* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    initialise : function(container) {
			
			/* <!-- Get Reference to Container --> */
			_ = container;
			
			/* <!-- Initialise Objects --> */
			_.App();
			
			/* <!-- Set Container Reference to this --> */
			container.Main = this;
			
			/* <!-- Return for Chaining --> */
			return this;
			
    },
		
		start : function() {

			var google_SignIn = function() {
				hello.login("google", {
					force: false, display : (_.SETUP.SINGLE_PAGE || _.Flags.page()) ? "page" : "popup",
					scope : encodeURIComponent(_.SETUP.GOOGLE_SCOPES.join(" ")),
				}).then(function(a) {
					_.Flags.log("Signed into Google", a);
				}, function(e) {
					_.Flags.error("Signed into Google", e);
				});
			};

			var google_SignOut = function() {
				hello.logout("google").then(function(a) {
					_.Flags.log("Signed out of Google", a);
				}, function(e) {
					_.Flags.error("Signing out of Google", e);
				});
			};
			
			var _routeIn = function() {_.App.route(true);}, _routeOut = function() {_.App.route(false);};
			
			var router = function() {
				if (_.Flags) _.Flags.change(function(directive, command) {
					if ((/GOOGLE/i).test(directive) && !_.google) {
						google_SignIn();
						_routeIn = function() {
							_routeIn = function() {_.App.route(true);};
							_.App.route(command);
						};
					} else {
						_.App.route(command);
					}
				});
			};
			
			/* <!-- Module Starts --> */
			if (_.Display.start) _.Display.start();
			
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
				
				if (!_.google) {

					/* <!-- Initialise Google Provider --> */
					_.google = _.Google_API().initialise(auth.access_token, auth.token_type, auth.expires, 
						(function(s) {
							return function() {
								return new Promise(function(resolve, reject) {
									hello.login("google", {force: false, display : "none", scope : s}).then(function(r) {
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
						})(encodeURIComponent(_.SETUP.GOOGLE_SCOPES.join(" "))), _.SETUP.GOOGLE_KEY, _.SETUP.GOOGLE_CLIENT_ID);

					/* <!-- Get User Info for Display --> */
					_.google.me().then(function(user) {

						/* Disable and Hide the Sign in */
						$("#sign_in").hide().children("button").attr("title","").off("click");

						/* Enable and Shopw the Sign Out */
						$("#user_details").text(user.name.length == 3 ? user.name.split(" ").join("") : user.name).attr("title", "To remove from your account (" + user.email + "), click & follow instructions");
						$("#sign_out button").on("click", function(e) {e.preventDefault(); google_SignOut();});
						$("#sign_out").show();

						/* <!-- Route Authenticated --> */
						_routeIn();

						/* <!-- Add Router Method --> */
						window.onhashchange = router;

					}).catch(function(e) {_.Flags.error("Google Me", e);});

				}

			};

			var google_LoggedOut = function() {

				/* <!-- Delete Objects dependent on being Logged in --> */
				delete _.google;

				/* Disable and Hide the Sign Out */
				$("#sign_out").hide().children("button").off("click");
				$("#user_details").text("").attr("title", "");

				/* Enable and Shopw the Sign In */
				$("#sign_in").show().children("button").attr("title", "Click here to log into this app, you will be promped to authorise the app on your account if required").on("click", function(e) {e.preventDefault(); google_SignIn();});

				$(".auth-only").hide();

				/* <!-- Route Un-Authenticated --> */
				_routeOut();

				/* <!-- Add Router Method --> */
				window.onhashchange = router;

			};
			/* <!-- Auth Triggers --> */

			/* <!-- Auth Handlers --> */
			hello.on("auth.login", function (auth) {

				if (auth.network == "google") {

					google_LoggedIn(auth.authResponse);

				}

			});

			hello.on("auth.logout", function (auth) {

				if (auth.network == "google") {

					google_LoggedOut();

				}

			});
			/* <!-- Auth Handler --> */

			/* <!-- Get Global Flags --> */
			_.Flags.initialise().then(function(flags) {

				_.Flags = flags;

				/* <!-- Append Content Holder --> */
				if (!_.container) _.container = $("#content");

				var _start = function() {

					/* <!-- Set Up Hello.js Auth-Flow --> */
					hello.init({
						google : _.SETUP.GOOGLE_CLIENT_ID,
					}, {
						redirect_uri : "/redirect/",
					});
					/* <!-- Set Up Hello.js Auth-Flow --> */

					/* <!-- Start Auth Flow --> */
					try {
						var g = hello("google").getAuthResponse();

						if (is_SignedIn(g)) { /* Signed In */
							google_LoggedIn(g);
						} else if (g && new Date(g.expires * 1000) < new Date()) { /* Expired Token */

							var refresh_race = Promise.race([
								hello.login("google", { /* Try silent token refresh */
									force: false, display : "none", scope : encodeURIComponent(_.SETUP.GOOGLE_SCOPES.join(" ")),
								}),
								new Promise(function(resolve, reject){
									setTimeout(function() { reject("Login Promise Timed Out"); }, 1000);
								})
							]);

							refresh_race.then(function(a) {
								if (is_SignedIn(a.authResponse)) {
									google_LoggedIn(a.authResponse);
								} else {
									google_LoggedOut();
								}
							}, function(e) {
								_.Flags.error("Signing into Google", e);
								google_LoggedOut();
							});

						} else { /* Not Logged In */
							google_LoggedOut();
						}

					} catch(e) {
						_.Flags.error("Google Auth Flow", e);
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