Google_API = function(ಠ_ಠ, timeout) {

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.Google_API_NEW)) return new this.Google_API_NEW();

	/* === Internal Visibility === */

	/* <!-- Internal Constants --> */
	const PAGE_SIZE = 500;
	const BATCH_SIZE = 50;
	const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));
	const RANDOM = (lower, higher) => Math.random() * (higher - lower) + lower;

	const READER = function() {

		var reader = new FileReader(),
			promisify = (fn) =>
			function() {
				var _arguments = arguments;
				return new Promise((resolve, reject) => {
					var clean = (events) => _.each(events, (handler, event) => reader.removeEventListener(event, handler)),
						events = {
							load: () => clean(events) && resolve(reader.result),
							abort: () => clean(events) && reject(),
							error: () => clean(events) && reject(reader.error),
						};
					_.each(events, (handler, event) => reader.addEventListener(event, handler));
					fn.apply(reader, _arguments);
				});
			};

		_.each(_.filter(_.allKeys(reader), name => (/^READAS/i).test(name) && _.isFunction(reader[name])),
			fn => reader[fn.replace(/^READAS/i, "promiseAs")] = promisify(reader[fn]));

		return reader;
	};
	/* <!-- Internal Constants --> */

	/* <!-- Network Constants --> */
	const GENERAL_URL = {
		name: "general",
		url: "https://www.googleapis.com/",
		rate: 3
	}; /* <!-- 3 seems fine, 4 will tend to bust over the rate-limit --> */
	const SHEETS_URL = {
		name: "sheets",
		url: "https://sheets.googleapis.com/",
		rate: 1
	};
	const SCRIPTS_URL = {
		name: "scripts",
		url: "https://script.googleapis.com/",
		rate: 1
	};
	const URLS = [GENERAL_URL, SHEETS_URL, SCRIPTS_URL];
	/* <!-- Network Constants --> */

	/* <!-- Internal Constants --> */
	const FOLDER = "application/vnd.google-apps.folder";
	const DOC = "application/vnd.google-apps.document";
	const SHEET = "application/vnd.google-apps.spreadsheet";
	const SLIDE = "application/vnd.google-apps.presentation";
	const DRAWING = "application/vnd.google-apps.drawing";
	const NATIVES = [DOC, SHEET, SLIDE, DRAWING];
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var KEY, CLIENT_ID, _check, _before, _token;
	/* <!-- Internal Variables --> */

	/* <!-- Network Variables --> */
	const NETWORKS = _.reduce(URLS, (networks, url) => {
		networks[url.name] = ಠ_ಠ.Network(url.url, timeout ? timeout : 60000, url.rate ? url.rate : 0, r =>
			new Promise(function(resolve) {
				r.status == 403 || r.status == 429 ?
					r.json().then(result => result.error.message && result.error.message.indexOf("Rate Limit Exceeded") >= 0 ? resolve(true) : resolve(false)) : resolve(false);
			}));
		return networks;
	}, {});
	/* <!-- Network Variables --> */

	/* <!-- Internal Functions --> */
	var _init = (token, type, expires, update) => {

		/* <!-- Check Function to ensure token validity --> */
		_check = (function(e, u) {

			return function(force) {

				return new Promise(function(resolve, reject) {

					if (force || e <= new Date()) { /* Token Expired */

						u(force).then(r => { /* Update token */

							if (r) _init(r.token, r.type, r.expires, u); /* Non-Null Response, so changes required */
							resolve(true);

						}).catch(err =>	reject(err));

					} else { /* Token Fine */

						resolve(false);

					}

				});

			};

		})(new Date((expires - 1) * 1000), update); /* 1 second shift in case of network delays! */

		/* <!-- Pass Token to Network --> */
		_before = (function(t, w) {
			/* "Authorization: token OAUTH-TOKEN" */
			return function(r) {
				if (r.headers) r.headers.Authorization = (w + " " + t);
				return true;
			};

		})(token, type);

		_token = (function(t) {

			return function() {

				return t;

			};

		})(token);

		/* <!-- Before Network Call : Request Authorisation Closure --> */
		_.each(NETWORKS, network => {
			network.before(_before);
			network.check(_check);
		});

	};

	var _arrayize = (value, test) => value && test(value) ? [value] : value;

	var _list = (url, property, list, data, next) => {

		return new Promise((resolve, reject) => {

			_check().then(() => {

				if (data) {
					if (next) data.pageToken = next;
				} else if (next) {
					data = {
						pageToken: next
					};
				}

				NETWORKS.general.get(url, data).then((value) => {

					list = list.concat(value[property]);

					if (value.nextPageToken) {

						_list(url, property, list, data, value.nextPageToken).then(function(list) {
							resolve(list);
						});

					} else {
						resolve(list);
					}

				}).catch(e => reject(e));

			});

		});

	};

  var _call = function(method) {
		return new Promise((resolve, reject) => {
			_check().then(() => method.apply(this, _.rest(arguments)).then((value) => resolve(value)).catch((e) => reject(e)));
		});
	};

	var _get = (id, team) => {
		var _data = team ?
			team === true ? {
				fields: "kind,id,name,mimeType,version,parents,webViewLink,webContentLink,iconLink,size",
				includeTeamDriveItems: true,
				supportsTeamDrives: true,
				corpora: "user,allTeamDrives"
			} : {
				fields: "kind,id,name,mimeType,version,parents,webViewLink,webContentLink,iconLink,size",
				teamDriveId: team,
				includeTeamDriveItems: true,
				supportsTeamDrives: true,
				corpora: "teamDrive"
			} : {
				fields: "kind,id,name,mimeType,version,parents,webViewLink,webContentLink,iconLink,size",
			};
		return _call(NETWORKS.general.get, "drive/v3/files/" + id, _data);
	};
	
	var _pick = (title, multiple, team, views, callback, context) => {

		if (google.picker) {

			var picker = new google.picker.PickerBuilder()
				.setTitle(title)
				.setAppId(CLIENT_ID)
				.setDeveloperKey(KEY)
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
					};
				})(callback, context));

			if (multiple) picker.enableFeature(google.picker.Feature.MULTISELECT_ENABLED);
			/* <!-- This doesn't currently work, although it is in the Google Drive Picker API Documentation --> */
			if (team) picker.enableFeature(google.picker.Feature.SUPPORT_TEAM_DRIVES);

			if (views && typeof views === "function") views = views();
			if (!views || (Array.isArray(views) && views.length === 0)) {
				var view = new google.picker.DocsView()
					.setIncludeFolders(true)
					.setSelectFolderEnabled(true)
					.setParent("root");
				picker.addView(view.setEnableTeamDrives ? view.setEnableTeamDrives(team) : view);
			} else if (Array.isArray(views)) {
				views.forEach(function(view) {
					picker.addView(view.setEnableTeamDrives ? view.setEnableTeamDrives(team) : view);
				});
				if (views.length == 1) picker.enableFeature(google.picker.Feature.NAV_HIDDEN);
			} else {
				picker.addView(views.setEnableTeamDrives ? views.setEnableTeamDrives(team) : views);
				picker.enableFeature(google.picker.Feature.NAV_HIDDEN);
			}

			picker.build().setVisible(true);

		} else {

			google.load("picker", "1", {
				"callback": (function(title, multiple, team, views, callback, context) {
					return function() {
						_pick(title, multiple, team, views, callback, context);
					};
				})(title, multiple, team, views, callback, context)
			});

		}

	};

	var _contents = (ids, mimeTypes, excludeMimeTypes, properties, skeleton, team, overrideType) => {

		/* <!-- Build the ID portion of the query --> */
		var _i = ids && ids.length > 0 ?
			_.reduce(ids, (q, id, i) => q + (i > 0 ? " or '" + id + "' in parents" : "'" + id + "' in parents"), " and (") + ")" : "";

		/* <!-- Build the MIME portion of the query --> */
		var _m = mimeTypes && mimeTypes.length > 0 ?
			_.reduce(mimeTypes, (q, m, i) => q + (i > 0 ? " or mimeType = '" : "mimeType = '") + m + "'", " and (") + ")" : "";

		/* <!-- Build exclude MIME portion of the query --> */
		var _e = excludeMimeTypes && excludeMimeTypes.length > 0 ?
			_.reduce(excludeMimeTypes, (q, m, i) => q + (i > 0 ? " and mimeType != '" : "mimeType != '") + m + "'", " and (") + ")" : "";

		/* <!-- Build PROPERTIES portion of the query --> */
		var _kv = (p) => "key='" + (p.indexOf("=") > 0 ? (p.split("=")[0] + "' and value='" + p.split("=")[1] + "'") : (p + "' and value=''"));
		var _p = properties && properties.length > 0 ?
			_.reduce(properties, (q, p, i) => q + (i > 0 ? " and (properties has { " + _kv(p) + " } or appProperties has { " + _kv(p) + " })" : "(properties has { " + _kv(p) + "} or appProperties has { " + _kv(p) + "})"), " and (" + (overrideType ? "mimeType = '" + overrideType + "' or (" : "")) + (overrideType ? "))" : ")") : "";

		var _data = {
			pageSize: PAGE_SIZE,
			q: "trashed = false" + _i + _m + _e + _p,
			orderBy: "starred, modifiedByMeTime desc, viewedByMeTime desc, name",
			fields: skeleton ? "kind,nextPageToken,incompleteSearch,files(id,size,parents,mimeType" + (team ? ",teamDriveId" : "") + ")" : "kind,nextPageToken,incompleteSearch,files(description,id,modifiedByMeTime,name,version,mimeType,webViewLink,webContentLink,iconLink,hasThumbnail,thumbnailLink,size,parents,starred,properties,appProperties" + (team ? ",teamDriveId" : "") + ")",
		};

		if (team) {
			_data.teamDriveId = team;
			_data.includeTeamDriveItems = true;
			_data.supportsTeamDrives = true;
			_data.corpora = "teamDrive";
		}

		return _list("drive/v3/files", "files", [], _data);

	};

	var _search = (ids, recurse, folders, mimeTypes, excludes, includes, properties, team, cache) => {

		var _paths = (parents, chain, all) => {

			var _path = (parent, chain) => {
				
				return new Promise((resolve) => {
					
					var _complete = () => {
						var _parent = cache[parent];
						if (_parent) chain.push(_parent.name);
						resolve(_paths(_parent ? _parent.parents : [], chain, all));
					};
					
					cache[parent] ? _complete() : _get(parent, team).then(item => {
							cache[item.id] = {
								name: item.name,
								parents: item.parents
							};
							_complete();
						});
					
				});

			};
			
			return new Promise((resolve) => {
				if (parents && parents.length > 0) {
					if (parents.length == 1) {
						_path(parents[0], chain).then(value => resolve(value));
					} else {
						var promises = [];
						_.each(parents, parent => promises.push(_path(parent, _.clone(chain))));
						Promise.all(promises).then(() => resolve(all));
					}
				} else {
					all.push(chain.reverse().join(" \\ "));
					resolve(all);
				}
			});
			
		};

		return new Promise((resolve, reject) => {

			_contents(ids, mimeTypes, [], properties && properties.simple ? properties.simple : null, false, team, recurse && mimeTypes.length === 0 ? FOLDER : null).then((c) => {

				/* <!-- Filter the results using the Exclude then Include methods --> */
				if (excludes) c = _.reject(c, (item) => _.some(excludes, (e) => e(item)));
				if (includes) c = _.filter(c, (item) => _.some(includes, (i) => i(item)));

				/* <!-- Get the ids of all the folders included in the raw set --> */
				var next = recurse ? _.filter(c, item => item.mimeType === FOLDER) : [];
				_.each(next, item => cache[item.id] = {
					name: item.name,
					parents: item.parents
				});
				next = _.map(next, f => f.id);

				/* <!-- Batch these IDs into Arrays with length not longer than BATCH_SIZE --> */
				var batches = _.chain(next).groupBy((v, i) => Math.floor(i / BATCH_SIZE)).toArray().value();

				/* <!-- Make an array of promises to resolve with the results of these searches --> */
				var promises = recurse ? _.map(batches, (batch, i) => new Promise((resolve) => {
					DELAY(RANDOM(100, 800) * i).then(_search(batch, recurse, folders, mimeTypes, excludes, includes, properties, team, cache).then((v) => resolve(v)));
				})) : [];

				/* <!-- Filter to remove the folders if we are not returning them --> */
				if (!folders) c = _.reject(c, item => item.mimeType === FOLDER);

				/* <!-- Filter the results using Advanced Properties --> */
				if (properties && properties.complex) c = _.filter(c, item => _.every(properties.complex, (i) => i(item)));

				/* <!-- Add in the current path value to each item --> */
				c = _.map(c, item => new Promise((resolve) => _paths(item.parents, [], []).then(paths => {
					item.paths = paths;
					resolve(item);
				})));

				/* <!-- Resolve the paths promises before moving on --> */
				Promise.all(c).then(items => {
					/* <!-- Resolve this promise whilst resolving the recursive promises too if available --> */
					promises && promises.length > 0 ?
						Promise.all(promises).then((recursed) => {
							resolve(_.reduce(recursed, (current, value) => value && value.length > 0 ? current.concat(value) : current, items));
						}).catch((e) => reject(e)) : resolve(items);	
				});

			}).catch((e) => reject(e));

		});

	};
	/* <!-- Internal Functions --> */

	/* === Internal Visibility === */

	/* === External Visibility === */
	return {

		/* <!-- External Functions --> */
		initialise: function(token, type, expires, update, key, client_id) {

			/* <!-- Set the Important Constants --> */
			KEY = key, CLIENT_ID = client_id;

			/* <!-- Run the Initialisation --> */
			_init(token, type, expires, update);

			/* <!-- Return for Chaining --> */
			return this;

		},

		/* <!-- Get Repos for the current user (don't pass parameter) or a named user --> */
		me: () => _call(NETWORKS.general.get, "oauth2/v1/userinfo?alt=json&key=" + KEY),

		execute: (id, method, data) => _call(NETWORKS.scripts.post, `/v1/scripts/${id}:run`, {
			function: method,
			parameters: data,
		}),

		scripts: () => _list("drive/v3/files", "files", [], {
      q: "mimeType = 'application/vnd.google-apps.script' and trashed = false",
      orderBy: "modifiedByMeTime desc,name",
      fields: "files(description,id,modifiedByMeTime,name,version)",
    }),

		download: (id, team) => team ? _call(NETWORKS.general.download, "drive/v3/files/" + id, {
				alt: "media",
				supportsTeamDrives: true
			}) : _call(NETWORKS.general.download, "drive/v3/files/" + id, {
				alt: "media",
			}),

		upload: (metadata, binary, mimeType, team, id) => {

			var _boundary = "**********%%**********";

			var _payload = new Blob([
				"--" + _boundary + "\r\n" + "Content-Type: application/json; charset=UTF-8" + "\r\n\r\n" + JSON.stringify(metadata) + "\r\n\r\n" + "--" + _boundary + "\r\n" + "Content-Type: " + mimeType + "\r\n\r\n",
				binary, "\r\n" + "--" + _boundary + "--" + "\r\n"
			], {
				type: "multipart/related; boundary=" + _boundary,
				endings: "native"
			});

			return _call(
				id ? NETWORKS.general.patch : NETWORKS.general.post,
				"upload/drive/v3/files/" + (id ? id + "?newRevision=true&" : "?") + "uploadType=multipart" + (team ? "&supportsTeamDrives=true" : ""), _payload, "multipart/related; boundary=" + _boundary, null, "application/binary");

		},

		export: (id) => _call(NETWORKS.general.get, "drive/v3/files/" + id + "/export", {
			mimeType: "application/vnd.google-apps.script+json"
		}),

		save: (id, files, team) => _call(NETWORKS.general.patch, "upload/drive/v3/files/" + id + "?uploadType=media" + (team ? "&supportsTeamDrives=true" : ""), {
			files: files
		}, "application/json"),

		update: (id, file, team) => _call(NETWORKS.general.patch, "drive/v3/files/" + id + (team ? "?supportsTeamDrives=true" : ""), file, "application/json"),

		pick: (title, multiple, team, views, callback, context) => _pick(title, multiple, team, views, callback, context),

		files: {

			natives: () => NATIVES,

			is: (type) => (item) => item.mimeType === type,

			in: (type) => (item) => item.mimeType && item.mimeType.startsWith(type),

			native: (type) => type && NATIVES.indexOf(type.toLowerCase()) >= 0,

			delete: (id, team, trash) => {
				var _url = team ? "drive/v3/files/" + id + "?teamDriveId=" + team + "&supportsTeamDrives=true" : "drive/v3/files/" + id;
				var _data = trash ? {
					trashed: true
				} : null;
				var _function = trash ? NETWORKS.general.patch : NETWORKS.general.delete;
				return _call(_function, _url, _data);
			},

			get: (id, team) => _get(id, team),

			export: (id, format) => _call(NETWORKS.general.get, "drive/v3/files/" + id + "/export", {
				mimeType: format
			}, null, "application/binary"),

		},

		teamDrives: {

			get: (id) => _call(NETWORKS.general.get, "drive/v3/teamdrives/" + id, {
				fields: "kind,id,name,colorRgb,capabilities",
			}),

			list: () => _list(
				"drive/v3/teamdrives", "teamDrives", [], {
					orderBy: "name",
					fields: "kind,nextPageToken,teamDrives(id,name,colorRgb)",
				}),

		},

		folders: {

			check: (is) => (item) => is ? item.mimeType === FOLDER : item.mimeType !== FOLDER,

			is: (type) => type === FOLDER,

			search: (ids, recurse, mimeTypes, excludes, includes, properties, team, basic) => {
				var folders = (mimeTypes = _arrayize(mimeTypes, _.isString)).indexOf(FOLDER) >= 0;
				return basic ? 
					_search(null, false, false, mimeTypes, null, null, properties, team, {}) : 
					_search(
						_arrayize(ids, _.isString), recurse, folders,
						recurse && mimeTypes && mimeTypes.length > 0 && !folders ? [FOLDER].concat(mimeTypes) : mimeTypes,
						_arrayize(excludes, _.isFunction),
						recurse && !folders ? [f => f.mimeType === FOLDER].concat(_arrayize(includes, _.isFunction)) : _arrayize(includes, _.isFunction), properties, team, {});
			},

			contents: (ids, mimeTypes, team) => _contents(_arrayize(ids, _.isString), _arrayize(mimeTypes, _.isString), [], [], false, team),

			children: (ids, skeleton, team) => _contents(_arrayize(ids, _.isString), [], [], [], skeleton, team),

			folders: (ids, skeleton, team) => _contents(_arrayize(ids, _.isString), [FOLDER], [], [], skeleton, team),

			files: (ids, skeleton, team) => _contents(_arrayize(ids, _.isString), [], [FOLDER], [], skeleton, team),

		},

		sheets: {

			create: (name) => _call(NETWORKS.sheets.post, "v4/spreadsheets", {
				"properties": {
					"title": name
				}
			}, "application/json"),

			get: (id, all) => _call(NETWORKS.sheets.get, "v4/spreadsheets/" + id + (all ? "?includeGridData=true" : "")),

			values: (id, range) => _call(NETWORKS.sheets.get, "v4/spreadsheets/" + id + "/values/" + encodeURIComponent(range)),

			append: (id, range, values, input) => _call(NETWORKS.sheets.post, "v4/spreadsheets/" + id + "/values/" + encodeURIComponent(range) + ":append?valueInputOption=" + (input ? input : "RAW"), {
				"range": range,
				"majorDimension": "ROWS",
				"values": values
			}, "application/json"),

			update: (id, range, values, input) => _call(NETWORKS.sheets.put, "v4/spreadsheets/" + id + "/values/" + encodeURIComponent(range) + "?valueInputOption=" + (input ? input : "RAW"), {
				"range": range,
				"majorDimension": "ROWS",
				"values": values
			}, "application/json"),

		},

		url: {

			insert: (url) => _call(NETWORKS.general.post, "urlshortener/v1/url?key=" + KEY, {
				longUrl: url
			}, "application/json"),

		},

		reader: READER

	};
	/* === External Visibility === */
};