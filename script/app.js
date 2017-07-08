// -- Global Variables -- //
var global = {
	single_Page : window.navigator.standalone || navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)
};
// -- Global Variables -- //

$(function() {

	// -- Enable Tooltips -- //
	$('[data-toggle="tooltip"]').tooltip();
	
	// -- Enable Closing Bootstrap Menu after Action -- //
	var navMain = $(".navbar-collapse");
  navMain.on("click", "a:not([data-toggle])", null, function () {
		navMain.collapse('hide');
 	});
	
	// -- Auth Triggers & Functions -- //
	var google_SignIn = function() {
		hello.login("google", {
			force: false, display : (global.single_Page || global.flags.page()) ? "page" : "popup",
			scope : encodeURIComponent(GOOGLE_SCOPES.join(" ")),
		}).then(function(a) {
			global.flags.log("Signed into Google", a);
		}, function(e) {
			global.flags.error("Signed into Google", e);
		});
	};
	
	var google_SignOut = function() {
		
		hello.logout("google").then(function(a) {
			global.flags.log("Signed out of Google", a);
		}, function(e) {
			global.flags.error("Signing out of Google", e);
		});
		
	};
	
	var is_SignedIn = function(session) {
		return session && session.access_token && new Date(session.expires * 1000) >= new Date();
	};
	
	var google_LoggedIn = function(auth) {
		
		if (!global.google) {
			
			// -- Initialise Google Provider -- //
			global.google = Google_API().initialise(auth.access_token, auth.token_type, auth.expires, 
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
							}, function(err) {reject(err)});
						});
					}
				})(encodeURIComponent(GOOGLE_SCOPES.join(" ")))
			);
			
			// -- Get User Info for Display -- //
			global.google.me().then(function(user) {

				// Disable and Hide the Sign in
				$("#sign_in").hide().children("button").attr("title","").off("click");
				
				// Enable and Shopw the Sign Out
				$("#user_details").text(user.name).attr("title", "To remove from your account (" + user.email + "), click & follow instructions");
				$("#sign_out button").on("click", function(e) {e.preventDefault(); google_SignOut();})
				$("#sign_out").show();
				
				// -- Route Authenticated -- //
				global.app.route(true);
	
				window.onhashchange = function() {if (global.flags) global.flags.change(global.app.route)};

			});
			
		}
		
	};
	
	var google_LoggedOut = function() {
		
		// -- Delete Objects dependent on being Logged in -- //
		delete global.google;
		
		// Disable and Hide the Sign Out
		$("#sign_out").hide().children("button").off("click");
		$("#user_details").text("").attr("title", "");
		
		// Enable and Shopw the Sign In
		$("#sign_in").show().children("button").attr("title", "Click here to log into this app, you will be promped to authorise the app on your account if required").on("click", function(e) {e.preventDefault(); google_SignIn();});
				
		$(".auth-only").hide();

		// -- Route Un-Authenticated -- //
		global.app.route(false);
		
		window.onhashchange = null;
		
	};
	// -- Auth Triggers -- //
	
	// -- Auth Handlers -- //
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
	// -- Auth Handler -- //

	// -- Get Global Flags -- //
	Flags().initialise().then(function(flags) {
			
		global.flags = flags;
		
		// -- Append Content Holder -- //
		global.container = $(".content");
		
		var _start = function() {

			// -- Set Up Hello.js Auth-Flow -- //
			hello.init({
				google : GOOGLE_CLIENT_ID,
			}, {
				redirect_uri : "/redirect/",
				// redirect_uri : (global.single_Page || global.flags.page()) ? global.flags.full() : global.flags.full("redirect"),
			});
			// -- Set Up Hello.js Auth-Flow -- //

			// -- Initialise App -- //
			global.app = App().initialise();

			// -- Start Auth Flow -- //
			try {
				var g = hello("google").getAuthResponse();
				
				if (is_SignedIn(g)) { // Signed In
					google_LoggedIn(g);
				} else if (g && new Date(g.expires * 1000) < new Date()) { // Expired Token
					
					var refresh_race = Promise.race([
  					hello.login("google", { // Try silent token refresh
							force: false, display : "none", scope : encodeURIComponent(GOOGLE_SCOPES.join(" ")),
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
						global.flags.error("Signing into Google", e);
						google_LoggedOut();
					});

				} else { // Not Logged In
					google_LoggedOut();
				}
				
			} catch(e) {
				global.flags.error("Google Auth Flow", e);
			}
			// -- Start Auth Flow -- //
			
		}
			
		_start();
		
	});

});