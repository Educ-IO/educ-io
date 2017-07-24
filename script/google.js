// Version 0.0.1 //
Google_API = function() {
	
	// -- Returns an instance of App if required -- //
  if (!(this instanceof Google_API)) {return new Google_API();}
	
	// === Internal Visibility === //
	
	// -- Internal Constants -- //
	const GENERAL_URL = "https://www.googleapis.com";
	const SHEETS_URL = "https://sheets.googleapis.com";
	// -- Internal Constants -- //
	
	// -- Internal Variables -- //
	var _check, _before, _after;
  // -- Internal Variables -- //
	
	// -- Internal Functions -- //
	var _init = function(token, type, expires, update) {
		
		_check = (function(e, u) {

			return function() {
				
				return new Promise(function(resolve, reject) {
				
					if (e <= new Date()) { // Token Expired

						u().then(function(r) { // Update token

							if (r) _init(r.token, r.type, r.expires, u); // Non-Null Response, so changes required
							resolve();

						}, function(err) {reject(err);});

					} else { // Token Fine

						resolve();

					}

				});
				
			}
			
		})(new Date((expires - 10) * 1000), update) // 10 second shift in case of network delays!
		
		// -- Before Ajax Call : Request Authorisation Closure -- //
		_before = (function(t, w, e, u) {
			
			//"Authorization: token OAUTH-TOKEN"
			return function(a, s) {
				
				a.setRequestHeader("Authorization", w + " " + t);
				
			};
		
		})(token, type)

		// -- After Ajax Call : Do Nothing -- //
		_after = function(request, status) {}
		
		_token = (function(t) {
			
			return function() {
				
				return t;
				
			};
		
		})(token)
			
	}
	
	var _get = function(url, data) {
		
		return new Promise(function(resolve, reject) {
			
			_check().then(function() {
				
				var s = {method : "GET", url : url, beforeSend: _before, complete: _after};
				if (data) s.data = data;
			
				$.ajax(s).done(function(value, status, request) {
			
					resolve(value);

				}).fail(function(request) {

					reject(Error(request.status + ": " + request.statusText));

				});
				
			});
			
		});
		
	}
	
	var _list = function(url, property, list, data, next) {
		
		return new Promise(function(resolve, reject) {
			
			_check().then(function() {
				
				var s = {method : "GET", url : url, beforeSend: _before, complete: _after};
			
				if (data) {
					s.data = data;
					if (next) s.data.pageToken = next;
				} else if (next) {
					s.data = {pageToken: next};
				}
				
				$.ajax(s).done(function(value, status, request) {
				
					list = list.concat(value[property]);
					if (value.nextPageToken) {
						_list(url, property, list, data, value.nextPageToken).then(function(list) {resolve(list)});
					} else {
						resolve(list);
					}

				}).fail(function(status, request) {

					reject(Error(request.status + ": " + request.statusText));

				})
				
			});
			
		});
		
	}
		
	var _patch = function(url, data, type, meta) {
		
		return new Promise(function(resolve, reject) {
			
			_check().then(function() {
				
				var s = {method : "PATCH", url : url, beforeSend : _before, complete : _after,
							 data : JSON.stringify(data), contentType: type};
				
				$.ajax(s).done(function(value, status, request) {
				
					resolve(value);

				}).fail(function(status, request) {

					reject(Error(request.status + ": " + request.statusText));

				})

			});
			
		});
		
	}
	
	var _pick = function(title, multiple, views, callback, context) {
		
		if (google.picker) {

			var picker = new google.picker.PickerBuilder()
				.setTitle(title)
				.setAppId(GOOGLE_CLIENT_ID)
				.setDeveloperKey(GOOGLE_KEY)
				.setOAuthToken(_token())
				.setCallback((function(callback, context) {
					return function(data) {
						if (data[google.picker.Response.ACTION] == google.picker.Action.PICKED) {
							if (!multiple) {
								callback(data[google.picker.Response.DOCUMENTS][0], context);	
							} else {
								callback(data[google.picker.Response.DOCUMENTS], context);
							}
						} 
					}
				})(callback, context))
			
				if (multiple) picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
				
				if (views && typeof views === "function") views = views();
				if (!views || (Array.isArray(views) && views.length === 0)) {
					picker.addView(
						new google.picker.DocsView()
							.setIncludeFolders(true)
							.setSelectFolderEnabled(true)
							.setParent("root")
					)		
				} else if (Array.isArray(views)) {
					views.forEach(function(view) { 
						picker.addView(view);
					});
				} else {
					picker.addView(views);
				}
				
				picker.build().setVisible(true);	

		} else {

			 google.load("picker", "1", {
				 "callback" : (function(title, multiple, views, callback, context) {
						return function() {
							_pick(title, multiple, views, callback, context);
						}
					})(title, multiple, views, callback, context)
			 });

		}

	}
	// -- Internal Functions -- //
	
	// === Internal Visibility === //

	
	// === External Visibility === //
  return {

    // -- External Functions -- //
    initialise : function(token, type, expires, update) {
			
			_init(token, type, expires, update);

			// -- Return for Chaining -- //
			return this;
			
    },
		
		// -- Get Repos for the current user (don't pass parameter) or a named user -- //
		me : function() {
			return _get(GENERAL_URL + "/oauth2/v1/userinfo?alt=json&key=" + GOOGLE_KEY);
		},
		
		scripts : function() {
			return _list(
			 GENERAL_URL + "/drive/v3/files", "files", [],
			 {
					q: "mimeType = 'application/vnd.google-apps.script' and trashed = false",
					orderBy: "modifiedByMeTime desc,name",
					fields: "files(description,id,modifiedByMeTime,name,version)",
				}
			);
		},
		
		export : function(id) {
		 return _get(
			 GENERAL_URL + "/drive/v3/files/" + id + "/export", 
			 {mimeType : "application/vnd.google-apps.script+json"}
			);
		},
		
		save : function(id, files) {
			return _patch(
				GENERAL_URL + "/upload/drive/v3/files/" + id + "?uploadType=media",
				{files : files}, "application/json"
			);
		},
		
		pick : function(title, multiple, views, callback, context) {
			
			return _pick(title, multiple, views, callback, context);
			
		},
		
		sheets : {
			
			get : function(id, all) {
				return _get(
					SHEETS_URL + "/v4/spreadsheets/" + id + (all ? "?includeGridData=true" : "")
				);
			},
			
			values : function(id, range) {
				return _get(
					SHEETS_URL + "/v4/spreadsheets/" + id + "/values/" + range
				);
			},
			
		},
		
	}
	// === External Visibility === //
	
}