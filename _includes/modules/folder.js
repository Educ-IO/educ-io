Folder = function(ಠ_ಠ, folder, target, team, state, tally) {

	/* <!-- Internal Constants --> */
	const BATCH_SIZE = 50;
	const DELAY = ms => new Promise(resolve => setTimeout(resolve, ms));
	const SEARCH_TRIGGER = 20;

	const TYPE_CONVERT = "application/x.educ-io.folders-convert",
		TYPE_SEARCH = "application/x.educ-io.folders-search",
		TYPE_TAG = "application/x.educ-io.folders-tag",
		_types = [TYPE_CONVERT, TYPE_SEARCH, TYPE_TAG];
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var _db = new loki("folders.db"),
		_tables = {},
		_search,
		_last,
		_tallyCache = tally ? tally : {},
		_team = team,
		_searches = {};
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var locate = (row) => {
			var _position = row.position().top - row.height();
			ಠ_ಠ.Flags.log(`Setting scroll position for id=${row.attr("id")} to ${_position}`);
			row.parents("div.tab-pane").animate({
				scrollTop: _position
			}, 300);
			return row;
		},
		busy = (cell, row, css_class) => (on) => {
			on ? ಠ_ಠ.Display.busy({
					target: cell,
					class: "loader-small"
				}) && locate(row) && row.addClass(css_class ? css_class : "bg-active") :
				ಠ_ಠ.Display.busy({
					target: cell,
					clear: true
				}) && row.removeClass(css_class ? css_class : "bg-active");
		};

	var parseProperties = f => _.union(f.appProperties ? _.pairs(f.appProperties) : [], f.properties ? _.pairs(f.properties) : []),
		parseReview = (review, when) => {
			var _m = when ? moment(when) : moment();
			switch (review) {
				case "Weekly":
					return _m.subtract(1, "weeks");
				case "Monthly":
					return _m.subtract(1, "months");
				case "Annually":
					return _m.subtract(1, "years");
				case "Biennially":
					return _m.subtract(1, "years");
			}
		};

	var needsReview = f => {
		var _props = parseProperties(f),
			_test = (review, reviewed) => review && review[1] && (!reviewed || !reviewed[1] || moment(reviewed[1]).isBefore(parseReview(review[1])));
		return _test(_.find(_props, property => property[0] == "Review"), _.find(_props, property => property[0] == "Reviewed"));
	};

	var mapItems = v => ({
		id: v.id,
		type: v.mimeType,
		mimeType: v.mimeType,
		name: v.name,
		parents: v.parents,
		icon: v.iconLink,
		thumbnail: v.thumbnailLink,
		url: v.webViewLink,
		star: v.starred,
		folder: ಠ_ಠ.Google.folders.is(v.mimeType),
		download: !!v.webContentLink,
		paths: v.paths,
		properties: v.properties,
		appProperties: v.appProperties,
		needs_Review: needsReview(v),
		team: _team,
		size: v.size,
		out: v.mimeType === "application/vnd.google-apps.spreadsheet" || ಠ_ಠ.Google.files.in("application/x.educ-io.view")(v) ? {
			name: "View",
			desc: "Open in View",
			url: "/view/#google,load." + v.id + ".lazy"
		} : ಠ_ಠ.Google.files.in("application/x.educ-io.folders")(v) ? {
			name: "Folders",
			desc: "Open in Folders",
			url: "/folders/#google,load." + v.id + ".lazy"
		} : ಠ_ಠ.Google.files.in("application/x.educ-io.reflect")(v) ? {
			name: "Reflect",
			desc: "Open in Reflect",
			url: "/reflect/#google,load." + v.id + ".lazy"
		} : null
	});

	var _enableDownloads = target => {
		target.find("a.download").on("click.download", e => {
			ಠ_ಠ.Google.download($(e.target).data("id"), _team).then(binary => {
				try {
					saveAs(binary, $(e.target).data("name"));
				} catch (e) {
					ಠ_ಠ.Flags.error("Drive File Download", e);
				}
			});
		});
	};

	var _showData = (id, name, values, target) => {

		var headers = _.map(["Type", "Name", "Actions", "ID", "Star"], v => ({
			name: v,
			hide: function(initial) {
				return !!(initial && this.hide_initially);
			},
			set_hide: function(now, always, initially) {
				this.hide_initially = initially;
			},
			hide_always: false,
			hide_now: false,
			hide_initially: v === "ID" ? true : false,
			field: v.toLowerCase(),
		}));

		var _data = _db.addCollection(id, {
			unique: ["id"],
			indices: ["type", "starred", "name"]
		});
		if (_tallyCache && values && values.length > 0) _.each(values, value => {
			if (_tallyCache[value.id]) value.results = _tallyCache[value.id];
		});
		_data.insert(values);

		var _return = ಠ_ಠ.Datatable(ಠ_ಠ, {
			id: id,
			name: name,
			data: _data,
			headers: headers
		}, {
			advanced: false,
			collapsed: true
		}, target, (target) => _enableDownloads(target));

		/* <!-- Wire Up Downloads --> */
		_enableDownloads(target);

		return _return;

	};

	var _loadContents = (id, name, target) => {

		/* <!-- Start the Loader --> */
		ಠ_ಠ.Display.busy({
			target: target
		});

		var _loader = _team ? ಠ_ಠ.Google.folders.contents(id, [], _team) : ಠ_ಠ.Google.folders.contents(id);

		/* <!-- Need to load the contents of the folder --> */
		_loader.then(contents => {
			ಠ_ಠ.Flags.log("Google Drive Folder Opened", contents);
			_tables[id] = _showData(id, name, _.map(contents, mapItems), target);
			ಠ_ಠ.Display.busy({
				target: target,
				clear: true
			}).state().enter("opened").protect("a.jump").on("JUMP");
		}).catch(e => {
			ಠ_ಠ.Flags.error("Requesting Selected Google Drive Folder", e ? e : "No Inner Error");
			ಠ_ಠ.Display.busy({
				target: target,
				clear: true
			}).state().exit("opened").protect("a.jump").off("JUMP");
		});

	};

	var _showTab = function(tab) {

		var target = $(tab.data("target"));

		tab.closest(".nav-item").addClass("order-1").siblings(".order-1").removeClass("order-1");

		if (tab.data("type") == "team") _team = tab.data("id");
		if (target.children().length === 0 || tab.data("refresh")) {
			if (tab.data("type") == "folder" || tab.data("type") == "team") {
				_loadContents(tab.data("id"), tab.data("name"), target.empty());
			} else if (tab.data("type") == "search") {
				var _busy = ಠ_ಠ.Display.busy({
					target: target,
					fn: true
				});
				_tables[tab.data("id")] = _showData(tab.data("id"), tab.data("name"), _last, target.empty());
				_busy();
			}
		}

		if (tab.data("type") == "folder" || tab.data("type") == "team") {
			ಠ_ಠ.Display.state().exit("searched");
			_search = null;
			_last = null;
		} else if (tab.data("type") == "search") {
			ಠ_ಠ.Display.state().enter("searched");
			_search = tab.data("id");
		}

	};

	var _activateTab = function(tabs) {
		tabs.find("a.nav-link")
			.off("click.tabs").on("click.tabs", e => $(e.target).data("refresh", e.shiftKey))
			.off("shown.bs.tab").on("shown.bs.tab", e => _showTab($(e.target)))
			.last().tab("show");
	};

	var _showFolder = function(folder, target) {

		var _data = {
			tabs: [{
				id: folder.id,
				name: folder.name,
				type: folder.team ? "team" : "folder"
			}]
		};

		var _tabs = ಠ_ಠ.Display.template.show({
			template: "tab-list",
			id: folder.id,
			name: folder.name,
			nav: "folder_tabs",
			links: ಠ_ಠ.Display.template.get("tab-links")(_data),
			tabs: ಠ_ಠ.Display.template.get("tab-tabs")(_data),
			target: target
		});

		/* <!-- Set Load Tab Handler & Load Initial Values --> */
		_activateTab(_tabs);

	};

	var _showResults = function(name, items) {

		var _id = name.replace(/[^A-Z0-9]+/gi, "").toLowerCase(),
			_data = {
				tabs: [{
					id: _id,
					name: name,
					type: "search",
					actions: {
						close: {
							url: `#remove.tab.${_id}`,
							name: "Close",
							desc: "Close these search results"
						}
					}
				}]
			};

		var _items = _.each(_.map(items, mapItems), (v) => v.safe = (_id + "_" + v.id)),
			_folder_Count = _.reduce(items, (count, item) => item.mimeType === "application/vnd.google-apps.folder" ? count + 1 : count, 0),
			_file_Count = _.reduce(items, (count, item) => item.mimeType !== "application/vnd.google-apps.folder" ? count + 1 : count, 0),
			_file_Size = _.reduce(items, (total, item) => total + (item.size ? parseInt(item.size) : 0), 0);
		_last = _items;

		$(ಠ_ಠ.Display.template.get("tab-tabs")(_data)).appendTo(".tab-content");
		_activateTab($(ಠ_ಠ.Display.template.get("tab-links")(_data)).appendTo("#folder_tabs").parent());

		/* <!-- Measure the Performance (end) --> */
		ಠ_ಠ.Flags.time(name, true);

		/* <!-- Display the Results (if the total results exceeds the trigger) --> */
		if (items.length >= SEARCH_TRIGGER) ಠ_ಠ.Display.modal("results", {
			id: "search_results",
			target: ಠ_ಠ.container,
			title: "Search Results",
			folders: _folder_Count,
			files: _file_Count,
			size: _file_Size,
		});

	};

	var _searchTag = function(name, value) {

		if (name && value) {

			var _name = "Search @ " + new Date().toLocaleTimeString();

			var _finish = ಠ_ಠ.Display.busy({
				target: ಠ_ಠ.container,
				fn: true
			});

			/* <!-- Measure the Performance (start) --> */
			ಠ_ಠ.Flags.time(_name);

			ಠ_ಠ.Flags.log(`Searching Drive for Files/Folders with Property: ${name} and Value: ${value}`);

			ಠ_ಠ.Google.folders.search("root", true, [], [], [], [], {
				simple: [`${name}=${value}`],
				complex: []
			}, [], null, _team, true).then(results => {
				_showResults(_name, results);
			}).catch((e) => {
				if (e) ಠ_ಠ.Flags.error("Search Error", e);
			}).then(_finish);
		}

	};

	var _searchFolder = function(id) {

		var _name = "Search @ " + new Date().toLocaleTimeString();

		var _decode = (values) => {

			var _regex = (regex, fallback) => f => {
				if (regex.indexOf("||") > 0) {
					return f.mimeType === regex.split("||")[0] && new RegExp(regex.split("||")[1], "i").test(f.name);
				} else if (regex) {
					return new RegExp(regex, "i").test(f.name);
				} else {
					return fallback;
				}
			};

			var _properties = _.find(values, v => v.name == "properties").value.trim();
			_properties = _properties ? _properties.split("\n") : null;
			var _simple = p => p.indexOf("=") > 0 && p.indexOf("<=") < 0 && p.indexOf(">=") < 0 && p.indexOf("!=") < 0 && p.indexOf("<>") < 0 && p.indexOf("@@") !== 0;
			var _complex = test => {

				if (test.toUpperCase().indexOf("@@[REVIEW]=") === 0) {

					var value = test.split("=")[1], _predicate = value.toUpperCase() == "[NEEDED]" ?
						(review, reviewed) => review && review[1] && (!reviewed || !reviewed[1] || moment(reviewed[1]).isBefore(parseReview(review[1]))) : value.toUpperCase() == "[DONE]" ?
						(review, reviewed) => review && (reviewed && moment(reviewed[1]).isAfter(parseReview(review[1]))) :
						(review, reviewed) => review && (!reviewed || moment(reviewed[1]).isBefore(parseReview(review[1], value)));

					return f => {
						var _props = parseProperties(f);
						return _predicate(_.find(_props, property => property[0] == "Review"), _.find(_props, property => property[0] == "Reviewed"));
					};

				} else {

					var _operators = {
							">=": (name, value) => (n, v) => n == name && v >= value,
							"!=": (name, value) => (n, v) => n == name && v != value,
							"<=": (name, value) => (n, v) => n == name && v <= value,
							"<>": (name, value) => (n, v) => n == name && v != value
						}, _operator = _.find(_.keys(_operators), operator => test.indexOf(operator) > 0);

					return f => _.some(parseProperties(f), property => property && (_operator ?
						_operators[_operator](test.split(_operator)[0], test.split(_operator)[1]) :
						n => n.toLowerCase() == test.toLowerCase())(property[0], property[1]));

				}

			};

			var _return = {
				names: _.find(values, v => v.name == "names").value.trim() ?
					_.map(_.find(values, v => v.name == "names").value.split("\n"), m => m.trim()) : [],
				mime: _.find(values, v => v.name == "mime").value.trim() ?
					_.map(_.find(values, v => v.name == "mime").value.split("\n"), m => m.trim()) : [],
				properties: {
					simple: _properties ? _.map(_.filter(_properties, p => p && _simple(p)), m => m.trim()) : null,
					complex: _properties ? _.map(_.reject(_properties, p => !p || _simple(p)), t => _complex(t.trim())) : null,
				},
				exclude: _.map(_.find(values, v => v.name == "exclude").value.split("\n"), r => _regex(r.trim(), false)),
				include: _.map(_.find(values, v => v.name == "include").value.split("\n"), r => _regex(r.trim(), true)),
				limited: !!(_.find(values, v => v.name == "limited")),
				domain: !!(_.find(values, v => v.name == "domain")),
				public: !!(_.find(values, v => v.name == "public")),
				recurse: !!(_.find(values, v => v.name == "recurse")),
				shared: !!(_.find(values, v => v.name == "shared")),
				entire: !!(_.find(values, v => v.name == "entire"))
			};
			_return.visibilities = []
				.concat(_return.limited ? ["limited"] : [])
				.concat(_return.domain ? ["domainWithLink", "domainCanFind"] : [])
				.concat(_return.public ? ["anyoneWithLink", "anyoneCanFind"] : []);
			_return.basic = _return.entire &&
				!(_.find(values, v => v.name == "exclude").value.trim()) &&
				!(_.find(values, v => v.name == "include").value.trim()) && (!_return.properties.complex || _return.properties.complex.length === 0);
			return _return;
		};
		var _encode = values => _.each(_.clone(values), (value, key, list) => _.isArray(value) ? list[key] = value.join("\n") : false);

		var _id = "start_search",
			_defaults = () => ["^(\\~\\$)", "^(\\*\\*\\*\\sARCHIVE\\s\\*\\*\\*\\s)", "\\$RECYCLE\\.BIN"],
			_search = ಠ_ಠ.Display.modal("search", {
				id: "start_search",
				target: ಠ_ಠ.container,
				title: "Search Google Drive",
				instructions: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
				state: state && state.search ? state.search : null,
				shortcuts: {
					"Google Apps": {
						docs: {
							class: "btn-outline-primary",
							name: "Docs",
							include: [],
							exclude: [],
							mime: [ಠ_ಠ.Google.files.natives()[0]],
							properties: []
						},
						sheets: {
							class: "btn-outline-primary",
							name: "Sheets",
							include: [],
							exclude: [],
							mime: [ಠ_ಠ.Google.files.natives()[1]],
							properties: []
						},
						slides: {
							class: "btn-outline-primary",
							name: "Slides",
							include: [],
							exclude: [],
							mime: [ಠ_ಠ.Google.files.natives()[2]],
							properties: []
						},
						drawings: {
							class: "btn-outline-primary",
							name: "Drawings",
							include: [],
							exclude: [],
							mime: [ಠ_ಠ.Google.files.natives()[3]],
							properties: []
						},
						all: {
							class: "btn-outline-success",
							name: "All",
							include: [],
							exclude: [],
							mime: ಠ_ಠ.Google.files.natives(),
							properties: []
						},
					},
					"Office Files": {
						word: {
							class: "btn-outline-secondary",
							name: "Word",
							include: ["(\\.docx)$", "(\\.doc)$"],
							exclude: _defaults(),
							mime: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/zip", "application/msword"],
							properties: []
						},
						excel: {
							class: "btn-outline-secondary",
							name: "Excel",
							include: ["(\\.xlsx)$", "(\\.xls)$"],
							exclude: _defaults(),
							mime: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/zip", "application/vnd.ms-excel"],
							properties: []
						},
						powerpoint: {
							class: "btn-outline-secondary",
							name: "Powerpoint",
							include: ["(\\.pptx)$", "(\\.ppt)$"],
							exclude: _defaults(),
							mime: ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip", "application/vnd.ms-powerpoint"],
							properties: []
						},
						pdf: {
							class: "info",
							name: "PDF",
							include: [],
							exclude: _defaults(),
							mime: ["application/pdf"],
							properties: []
						},
						temp: {
							class: "info",
							name: "Temp & Thumbs",
							exclude: [],
							include: ["^(\\s*\\~\\$).*(\\.docx)$", "^(\\s*\\~\\$).*(\\.doc)$",
								"^(\\s*\\~\\$).*(\\.pptx)$", "^(\\s*\\~\\$).*(\\.ppt)$", "^(\\s*\\~\\$).*(\\.xlsx)$", "^(\\s*\\~\\$).*(\\.xls)$", "thumbs\\.db"
							],
							mime: [
								"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
								"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
								"application/vnd.openxmlformats-officedocument.presentationml.presentation",
								"application/vnd.ms-excel", "application/msword", "application/vnd.ms-powerpoint",
								"application/zip", "application/octet-stream"
							],
							properties: []
						},
					},
					"Tag": {
						reviewed: {
							class: "btn-outline-success",
							name: "Reviewed",
							mime: [],
							include: [],
							exclude: [],
							properties: ["@@[REVIEW]=[DONE]"]
						},
						review: {
							class: "btn-outline-danger",
							name: "Needs Review",
							mime: [],
							include: [],
							exclude: [],
							properties: ["@@[REVIEW]=[NEEDED]"]
						},
						important: {
							class: "btn-warning",
							name: "Important",
							mime: [],
							include: [],
							exclude: [],
							properties: ["Importance!=None", "Importance!=Low"]
						},
						confidential: {
							class: "btn-warning",
							name: "Confidential",
							mime: [],
							include: [],
							exclude: [],
							properties: ["Confidentiality!=None", "Confidentiality!=Low"]
						},
						highlight: {
							class: "btn-bright",
							name: "Highlight",
							mime: [],
							include: [],
							exclude: [],
							properties: ["Highlight=TRUE"]
						},
					},
				},
				actions: [{
					text: "Save",
					handler: (values) => {
						var finish = ಠ_ಠ.Display.busy({
							target: $(`#${_id}`),
							fn: true
						});

						var _meta = {
								name: `Search: ${folder.name} [${new Date().toLocaleDateString()}].folders`,
								parents: (folder ? [folder.id] : null)
							},
							_data = JSON.stringify({
								folder: folder,
								state: {
									search: _encode(_decode(values)) /* <!-- Need to join the arrays back together here --> */
								}
							}),
							_mime = TYPE_SEARCH;
						ಠ_ಠ.Google.upload(_meta, _data, _mime).then(uploaded => ಠ_ಠ.Flags.log("Folders Search File Saved", uploaded))
							.catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))
							.then(finish);
					}
				}],
				handlers: {
					clear: (target, dialog) => dialog.find("#" + target.data("clear")).val("").filter("textarea.resizable").map((i, el) => autosize.update(el)),
					populate: (target, dialog, options) => {
						var _populate = target.data("populate"),
							_shortcuts = _.reduce(options.shortcuts, (all, shortcut) => _.extendOwn(all, shortcut), {}),
							_shortcut = _shortcuts[_populate];
						if (_shortcut) _.each([
							["mime", "#mimeTypes"],
							["include", "#includeRegexes"],
							["exclude", "#excludeRegexes"],
							["properties", "#includeProperties"]
						], pair => {
							if (_shortcut[pair[0]]) dialog.find(pair[1]).val(_shortcut[pair[0]].join("\n"));
						});
						dialog.find("textarea.resizable").each((i, el) => autosize.update(el));

						/* <!-- Tick Search All Drive if Possible --> */
						var _root = folder.name == "root" || !folder.parents || folder.parents.length === 0;
						var _basic = false;
						if (_shortcut && _root) {
							if (!dialog.find("#includeRegexes, #excludeRegexes").val().trim()) {
								var _props = dialog.find("#includeProperties").val().trim();
								_basic = (!_props || !_.some(["!=", "<>", ">=", "<=", "@@"], test => _props.indexOf(test) >= 0));
							}
						}
						$("#entireDrive").prop("checked", _basic);
					}
				}
			}, dialog => {
				autosize(dialog.find("textarea.resizable"));
				dialog.find("#entireDrive").on("change", e => (e.currentTarget.checked) ? 
						$("#recurseFolders").prop("checked", true) && $("#shared_WithMe").removeAttr("disabled") :
						$("#shared_WithMe").attr("disabled", true) && $("#shared_WithMe").prop("checked", false));
				dialog.find("#recurseFolders").on("change", e => {
					if (!e.currentTarget.checked) $("#entireDrive").prop("checked", false);
				});
			});

		_search.then(values => {

			if (values) {

				var _finish = ಠ_ಠ.Display.busy({
					target: ಠ_ಠ.container,
					fn: true,
					status: { /* <!-- Hook up to Progress Event --> */
						source: window,
						event: ಠ_ಠ.Google.events().SEARCH.PROGRESS,
						value: detail => `${ಠ_ಠ.Display.commarise(detail.folders)} ${detail.folders > 1 ? "folders" : "folder"} processed`
					}
				});

				/* <!-- Measure the Performance (start) --> */
				ಠ_ಠ.Flags.time(_name);

				values = _decode(values);
				ಠ_ಠ.Flags.log(`Searching folder ${id} with terms: ${JSON.stringify(values)}`);
				_searches[id] = _encode(values);

				ಠ_ಠ.Google.folders.search(id, values.recurse, values.names, values.mime, values.exclude, values.include, 
																	values.properties, values.visibilities, values.shared, _team, values.basic).then(results => {
					_showResults(_name, results);
				}).catch((e) => {
					if (e) ಠ_ಠ.Flags.error("Search Error", e);
				}).then(_finish);

			}

		}).catch((e) => {
			if (e) ಠ_ಠ.Flags.error("Search Error", e);
		});

	};

	var _exportFile = function(file, targetMimeType, inPlace, mirror) {

		return new Promise((resolve, reject) => {

			ಠ_ಠ.Google.files.export(file.id, targetMimeType).then(binary => {

				var _name = file.name.lastIndexOf(".") > 0 ? file.name.substr(0, file.name.lastIndexOf(".")) : file.name;

				var _upload = (metadata, id) => {

					ಠ_ಠ.Google.upload(metadata ? metadata : {
							name: _name,
							parents: mirror ? (file.parents ? file.parents : []).concat(mirror) : file.parents,
							teamDriveId: _team,
						}, binary, targetMimeType, _team, id)
						.then(uploadedFile => resolve({
							new: uploadedFile
						}))
						.catch(e => {
							ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error");
							reject();
						});

				};

				if (inPlace) {

					ಠ_ಠ.Google.folders.search(file.parents, false, [], targetMimeType, [], ((n, t) => f => (f.name == n) && f.mimeType == t)(_name, targetMimeType), 
																		[], [], null, _team, false).then(results => {
						if (results && results.length == 1) {
							_upload({}, results[0].id);
						} else {
							_upload();
						}
					});

				} else {

					_upload();

				}

			}).catch(e => {
				ಠ_ಠ.Flags.error("Export Error", e ? e : "No Inner Error");
				reject();
			});

		});

	};

	var _convertFile = function(file, sourceMimeType, targetMimeType, prefixAfterConversion, inPlace, mirror) {

		return new Promise((resolve, reject) => {

			var metadata = inPlace ? {} : {
				name: file.name.substr(0, file.name.lastIndexOf(".")),
				parents: mirror ? (file.parents ? file.parents : []).concat(mirror) : file.parents,
				teamDriveId: _team,
			};
			metadata.mimeType = targetMimeType;

			ಠ_ಠ.Google.download(file.id, _team).then(binary => {

				(inPlace ?
					ಠ_ಠ.Google.upload(metadata, binary, sourceMimeType, _team, file.id) :
					ಠ_ಠ.Google.upload(metadata, binary, sourceMimeType, _team))
				.then(uploadedFile => {

						prefixAfterConversion ?
							ಠ_ಠ.Google.update(file.id, {
								name: prefixAfterConversion + file.name
							}, _team)
							.then(updated => resolve({
								new: uploadedFile,
								old: updated
							}))
							.catch(e => {
								ಠ_ಠ.Flags.error("Renaming Source File Error", e ? e : "No Inner Error");
								reject();
							}) :
							resolve({
								new: uploadedFile
							});

					}

				).catch(e => {
					ಠ_ಠ.Flags.error("Conversion Error", e ? e : "No Inner Error");
					reject();
				});

			}).catch(e => {
				ಠ_ಠ.Flags.error("Download Error", e ? e : "No Inner Error");
				reject();
			});

		});

	};

	var _saveConversionResults = function(successes, failures, id, last) {

		return new Promise((resolve, reject) => {

			var _updateSheet = function(id, last) {

				var values = [];

				_.each(failures, failure => values.push(["FAILURE", failure.id, failure.name, "", "", ""]));
				_.each(successes, success => values.push(["Success", success.old ? success.old.id : "", success.old ? success.old.name : "", success.new.id, success.new.name, success.new.mimeType]));

				var _total = failures.length + successes.length + last;

				ಠ_ಠ.Google.sheets.append(id, "A" + last + ":F" + _total, values)
					.then(() => {
						resolve({
							id: id,
							last: _total
						});
					})
					.catch(e => {
						reject(e);
					});

			};

			if (id) {

				_updateSheet(id, last);

			} else {

				ಠ_ಠ.Google.sheets.create("Folders - Conversion Results " + (folder && folder.name ? " for (" + folder.name + ") " : "") + "[" + new Date().toUTCString() + "]").then(sheet => {

					var id = sheet.spreadsheetId,
						values = [];
					values.push(["Result", "Source File Id", "Source File Name", "Destination File Id", "Destination File Name", "Destination File Type"]);

					ಠ_ಠ.Google.sheets.update(id, "A1:F1", values)
						.then(() => _updateSheet(id, 2))
						.catch(e => {
							reject(e);
						});

				}).catch(e => {
					reject(e);
				});

			}

		});

	};

	var _convertItems = function(id) {

		var _collection;
		if (!(_collection = _db.getCollection(id))) return;

		var _decode = (values) => {
			var _return = {
				source: _.find(values, v => v.name == "source") ? _.find(values, v => v.name == "source").value : null,
				target: _.find(values, v => v.name == "target").value,
				prefix: _.find(values, v => v.name == "prefix") ? _.find(values, v => v.name == "prefix").value : null,
				batch: _.find(values, v => v.name == "batch").value,
				inplace: !!(_.find(values, v => v.name == "inplace")),
				mirror: _.find(values, v => v.name == "mirror") ? _.find(values, v => v.name == "mirror").value : null
			};
			(!_return.batch || _return.batch <= 0) ? _return.batch = 50: _return.log = true;
			return _return;
		};

		var _id = "convert_results",
			_convert = ಠ_ಠ.Display.modal("convert", {
				id: _id,
				target: ಠ_ಠ.container,
				title: "Convert Files",
				instructions: ಠ_ಠ.Display.doc.get("CONVERT_INSTRUCTIONS"),
				state: state && state.convert ? state.convert : null,
				shortcuts: {
					"To Google": {
						docs: {
							class: "btn-outline-primary",
							name: "Word -> Docs",
							source: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
							target: ಠ_ಠ.Google.files.natives()[0],
							prefix: "*** ARCHIVE *** "
						},
						sheets: {
							class: "btn-outline-primary",
							name: "Excel -> Sheets",
							source: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
							target: ಠ_ಠ.Google.files.natives()[1],
							prefix: "*** ARCHIVE *** "
						},
						slides: {
							class: "btn-outline-primary",
							name: "Powerpoint -> Slides",
							source: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
							target: ಠ_ಠ.Google.files.natives()[2],
							prefix: "*** ARCHIVE *** "
						},
					},
					"To Office": {
						word: {
							class: "btn-outline-secondary",
							name: "Zip -> Word",
							source: "application/zip",
							target: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
						},
						excel: {
							class: "btn-outline-secondary",
							name: "Zip -> Excel",
							source: "application/zip",
							target: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						},
						powerpoint: {
							class: "btn-outline-secondary",
							name: "Zip -> Powerpoint",
							source: "application/zip",
							target: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
						},
					},
					"Others": {
						pdf: {
							class: "btn-outline-dark",
							name: "Google Formats -> PDF",
							source: "",
							target: "application/pdf"
						},
					}
				},
				handlers: {
					populate: (target, dialog, options) => {
						var _populate = target.data("populate"),
							_shortcuts = _.reduce(options.shortcuts, (all, shortcut) => _.extendOwn(all, shortcut), {}),
							_shortcut = _shortcuts[_populate];
						if (_shortcut) _.each([
							["source", "#sourceMimeType"],
							["target", "#targetMimeType"],
							["prefix", "#prefixAfterConversion"]
						], pair => {
							if (_shortcut[pair[0]]) {
								dialog.find(pair[1]).val(_shortcut[pair[0]]).prop("disabled", false);
							} else {
								dialog.find(pair[1]).val("").prop("disabled", (_shortcut[pair[0]] === ""));
							}
						});
						dialog.find("#convertInplace").prop("disabled", !!(dialog.find("#prefixAfterConversion").val()))
							.prop("checked", !(dialog.find("#prefixAfterConversion").val())); /* <!-- Reconcile Interface --> */
					}
				},
				actions: [{
					text: "Save",
					handler: (values) => {

						var finish = ಠ_ಠ.Display.busy({
							target: $(`#${_id}`),
							fn: true
						});

						var _meta = {
								name: `Convert: ${folder.name} [${new Date().toLocaleDateString()}].folders`,
								parents: (folder ? [folder.id] : null)
							},
							_data = JSON.stringify({
								folder: folder,
								state: {
									convert: _decode(values),
									search: _search ? _searches[id] : null
								}
							}),
							_mime = TYPE_CONVERT;
						ಠ_ಠ.Google.upload(_meta, _data, _mime).then(uploaded => ಠ_ಠ.Flags.log("Folders Convert File Saved", uploaded))
							.catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))
							.then(finish);
					}
				}]
			}, dialog => {

				/* <!-- Wire Up Fields and Handle Populate URL Fields from Google Drive --> */
				ಠ_ಠ.Fields().on(dialog).find("button[data-action='load-g-folder'], a[data-action='load-g-folder']").off("click.folder").on("click.folder", e => {
					new Promise((resolve, reject) => {
						ಠ_ಠ.Google.pick( /* <!-- Open Google Document from Google Drive Picker --> */
							"Select a Folder", false, true,
							() => new google.picker.DocsView(google.picker.ViewId.FOLDERS).setIncludeFolders(true).setSelectFolderEnabled(true).setParent("root"),
							folder => folder && ಠ_ಠ.Google.folders.is(folder.mimeType) ? ಠ_ಠ.Flags.log("Google Drive Folder Picked", folder) && resolve(folder) : reject()
						);
					}).then(folder => $("#" + $(e.target).data("target")).val(folder.id).attr("title", folder.name)).catch();
				});

				/* <!-- Update whether we can do an inplace conversion, depending on the Target MIME Type --> */
				dialog.find("#targetMimeType").on("change", (e) => {
					var _native = ಠ_ಠ.Google.files.native($(e.target).val());
					$("#convertInplace").prop("disabled", _native).prop("checked", !_native);
				});

				/* <!-- If we are working inplace, we're not renaming --> */
				dialog.find("#convertInplace").on("change", (e) => {
					if (e.currentTarget.checked) $("#prefixAfterConversion").val("");
				});

			});

		_convert.then((values) => {

			if (values) {

				$(".tab-pane.active .file-name.action-succeeded, .tab-pane.active .file-name.action-failed")
					.removeClass("action-succeeded text-success action-failed text-danger font-weight-bold");

				var _results = _collection.chain().data();

				ಠ_ಠ.Flags.log(`CONVERSION STARTED: ${_results.length} items to convert`);

				values = _decode(values);
				var _batch = values.batch ? values.batch : 50;

				if (values.target) {

					var _process_Batch = function(batch, batches, batch_index, length, id, last) {

						/* <!-- Reset Variables  --> */
						var _successes = [],
							_failures = [];

						var _process_Result = function(file, files, file_index, id, last, complete) {

							if (file) {

								if ((values.source || ಠ_ಠ.Google.files.native(file.type))) {

									ಠ_ಠ.Flags.log("PROCESSING FILE " + file_index);

									var _container = $("#" + id + "_" + file.id),
										_result = _collection.by("id", file.id);
									if (!_container || _container.length === 0) _container = $("#" + file.id);
									var _cell = _container.find(".file-name").parent(),
										_row = _cell.parent(),
										_busy = busy(_cell, _row);
									_busy(true);

									(values.source ?
										_convertFile(file, values.source, values.target, values.prefix, values.inplace, values.mirror) :
										_exportFile(file, values.target, values.inplace, values.mirror))
									.then(converted => {
										if (_container) _container.find(".file-name").addClass("action-succeeded text-success font-weight-bold");
										if (_result) _result.name_class = "action-succeeded text-success font-weight-bold";
										if (converted && converted.old) {
											if (_container) _container.find(".file-name").text(converted.old.name);
											if (_result) _result.name = converted.old.name;
										}
										if (_result) _collection.update(_result);
										ಠ_ಠ.Flags.debug("CONVERTED ITEM " + file_index, converted);
										if (converted) _successes.push(converted);
										_busy(false);
										_process_Result(files.shift(), files, file_index + 1, id, last, complete);
									}).catch(e => {
										if (_container) _container.find(".file-name").addClass("action-failed text-danger font-weight-bold");
										if (_result) {
											_result.name_class = "action-failed text-danger font-weight-bold";
											_collection.update(_result);
										}
										ಠ_ಠ.Flags.error("File " + file_index + " Conversion Error", e ? e : "No Inner Error");
										_failures.push(file);
										_busy(false);
										_process_Result(files.shift(), files, file_index + 1, id, last, complete);
									});

								} else {

									ಠ_ಠ.Flags.log("FILE WILL NOT BE PROCESSED:", file);
									_process_Result(files.shift(), files, file_index + 1, id, last, complete);

								}

							} else {

								ಠ_ಠ.Flags.log("FILE CONVERSION COMPLETE: " + _successes.length + " successfully converted, " + _failures.length + " failed to convert.");

								if (values.batch) {
									var _saveRetries = 3;
									var _save = function() {
										_saveConversionResults(_successes, _failures, id, last).then((v) => {
											complete(v);
										}).catch(() => _saveRetries-- ? DELAY(2000).then(_save()) : complete({
											id: id,
											last: last
										}));
									};
									_save();

								} else {

									complete({
										id: id,
										last: last
									});

								}

							}

						};

						if (batch) {

							ಠ_ಠ.Flags.log("PROCESSING BATCH " + batch_index + " of " + length);

							var _next = (value) => {
								if (value && (!_batch || value.id)) {
									_process_Batch(batches.shift(), batches, batch_index + 1, length, value.id, value.last);
								} else {
									ಠ_ಠ.Flags.error("Failed to Complete Batch Conversion");
								}
							};

							_process_Result(batch.shift(), batch, 1, id, last, _next);

						} else {

							ಠ_ಠ.Flags.log("BATCH PROCESSING COMPLETE");

						}

					};

					var batches = _.chain(_results).groupBy((v, i) => Math.floor(i / _batch)).toArray().value();
					_process_Batch(batches.shift(), batches, 1, batches.length + 1);

				}

			}

		}).catch(e => {
			if (e) ಠ_ಠ.Flags.error("Converstion Error", e);
		});

	};

	var _tagItems = function(id, file_id) {

		var _collection;
		if (!(_collection = _db.getCollection(id))) return;

		var _decode = (values) => {
			var _return = {
				name: _.find(values, v => v.name == "name") ? _.find(values, v => v.name == "name").value : null,
				value: _.find(values, v => v.name == "value") ? _.find(values, v => v.name == "value").value : null,
				private: !!(_.find(values, v => v.name == "private"))
			};
			return _return;
		};

		var _id = "tag_results",
			_tag = ಠ_ಠ.Display.modal("tag", {
				id: _id,
				target: ಠ_ಠ.container,
				title: "Tag Files",
				instructions: ಠ_ಠ.Display.doc.get("TAG_INSTRUCTIONS"),
				state: state && state.tag ? state.tag : null,
				shortcuts: {
					"Confidentiality": {
						high: {
							populate: "Confidentiality|High",
							class: "btn-outline-danger",
							name: "High"
						},
						medium: {
							populate: "Confidentiality|Medium",
							class: "btn-outline-warning",
							name: "Medium"
						},
						low: {
							populate: "Confidentiality|Low",
							class: "btn-outline-success",
							name: "Low"
						},
						none: {
							populate: "Confidentiality|None",
							class: "btn-outline-info",
							name: "None"
						},
					},
					"Importance": {
						high: {
							populate: "Importance|High",
							class: "btn-outline-danger",
							name: "High"
						},
						medium: {
							populate: "Importance|Medium",
							class: "btn-outline-warning",
							name: "Medium"
						},
						low: {
							populate: "Importance|Low",
							class: "btn-outline-success",
							name: "Low"
						},
						none: {
							populate: "Importance|None",
							class: "btn-outline-info",
							name: "None"
						},
					},
					"Review": {
						weekly: {
							populate: "Review|Weekly",
							class: "btn-outline-secondary",
							name: "Weekly"
						},
						monthly: {
							populate: "Review|Monthly",
							class: "btn-outline-secondary",
							name: "Monthly"
						},
						annually: {
							populate: "Review|Annually",
							class: "btn-outline-secondary",
							name: "Annually"
						},
						biennially: {
							populate: "Review|Biennially",
							class: "btn-outline-secondary",
							name: "Biennially"
						},
						reviewed: {
							populate: "Reviewed|@@NOW",
							class: "btn-success",
							name: "Reviewed"
						},
					},
					"Other": {
						highlight: {
							populate: "Highlight|TRUE",
							class: "btn-bright",
							name: "Highlight"
						},
					}
				},
				validate: values => {
					values = _decode(values);
					return values.name && values.value && (values.name.length + values.value.length) <= 124;
				},
				actions: [{
					text: "Save",
					handler: (values) => {

						var finish = ಠ_ಠ.Display.busy({
							target: $(`#${_id}`),
							fn: true
						});

						var _meta = {
								name: `Tag: ${folder.name} [${new Date().toLocaleDateString()}].folders`,
								parents: (folder ? [folder.id] : null)
							},
							_data = JSON.stringify({
								folder: folder,
								state: {
									tag: _decode(values),
									search: _search ? _searches[id] : null
								}
							}),
							_mime = TYPE_TAG;
						ಠ_ಠ.Google.upload(_meta, _data, _mime).then(uploaded => ಠ_ಠ.Flags.log("Folders Tag File Saved", uploaded))
							.catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))
							.then(finish);
					}
				}],
				handlers: {
					populate: (target, dialog) => {
						var _populate = target.data("populate");
						if (_populate) {
							var _name = _populate.split("|")[0],
								_value = _populate.split("|")[1];
							if (_value === "@@NOW") _value = new Date().toISOString().split("T")[0];
							dialog.find("#tagName").val(_name) && dialog.find("#tagValue").val(_value);
						}
					}
				}
			}, dialog => {
				autosize(dialog.find("textarea.resizable"));
			});

		_tag.then((values) => {

			if (!values) return;

			var _results = file_id ? [_collection.by("id", file_id)] : _collection.chain().data();

			ಠ_ಠ.Flags.log(`TAG STARTED: ${_results.length} items to tag`);

			values = _decode(values);

			var _properties = {};
			_properties[values.name] = values.value;
			var _data = values.private ? {
				appProperties: _properties
			} : {
				properties: _properties
			};

			_.each(_results, file => {

				if (!file) return;
				ಠ_ಠ.Flags.log(`TAGGING FILE: ${file.name} (${file.id}) with ${JSON.stringify(_data)}`);

				var _container = $("#" + id + "_" + file.id),
					_result = _collection.by("id", file.id);
				if (!_container || _container.length === 0) _container = $("#" + file.id);
				var _cell = _container.find(".file-name").parent(),
					_row = _cell.parent(),
					_busy = busy(_cell, _row);
				_busy(true);

				ಠ_ಠ.Google.update(file.id, _data, _team).then(updated => {
					if (!_result[values.private ? "appProperties" : "properties"]) _result[values.private ? "appProperties" : "properties"] = {};
					_result[values.private ? "appProperties" : "properties"][values.name] = values.value;
					_result.needs_Review = needsReview(_result);
					_collection.update(_result);
					ಠ_ಠ.Flags.log(`FILE UPDATED: ${JSON.stringify(updated)}`);
				}).catch(e => {
					ಠ_ಠ.Flags.error("File " + file.id + " Updating Error", e ? e : "No Inner Error");
				}).then(() => _tables[id].update() && _busy(false));

			});

		}).catch(e => {
			if (e) ಠ_ಠ.Flags.error("Tagging Error", e);
		});

	};

	var _deleteItems = function() {

		var _collection;
		if (!_search || !(_collection = _db.getCollection(_search))) return;

		ಠ_ಠ.Display.confirm({
			id: "delete_results",
			target: ಠ_ಠ.container,
			message: "Please confirm that you want to delete " + _collection.count() + " items.",
			action: "Delete"
		}).then((confirm) => {

			if (confirm) {

				var _delete_Item = function(item, items, totals) {

					if (item) {

						var _cell = $("#" + _search + "_" + item.id).find(".file-name").parent(),
							_busy = busy(_cell, _cell.parent());
						_busy(true);

						var _result = _collection.by("id", item.id);

						ಠ_ಠ.Google.files.delete(item.id, _team, true).then((value) => {

							if (value) {

								/* <!-- Aggregate Results --> */
								ಠ_ಠ.Google.folders.is(item.mimeType) ? totals.folders += 1 : totals.files += 1;
								totals.size += item.size ? Number(item.size) : 0;

								/* <!-- Save Results (for filtering etc) --> */
								_result.deleted = true;
								_collection.update(_result);

								/* <!-- Show Results --> */
								_cell.append(ಠ_ಠ.Display.template.get("status")(_result));

								/* <!-- Debug Log Results --> */
								ಠ_ಠ.Flags.log("DELETED ITEM:", item.id);

							}

							_busy(false);

							_delete_Item(items.shift(), items, totals);

						}).catch((e) => _busy(false) && ಠ_ಠ.Flags.error("Deletion Error", e ? e : "No Inner Error"));

					} else {

						/* <!-- Display the Results --> */
						ಠ_ಠ.Display.modal("results", {
							id: "delete_results",
							target: ಠ_ಠ.container,
							title: "Deletion Results",
							folders: totals.folders,
							files: totals.files,
							size: totals.size,
						});

					}

				};

				var _items = _collection.chain().data();

				/* <!-- Start Recursively Deleting Items --> */
				_delete_Item(_items.shift(), _items, {
					files: 0,
					folders: 0,
					size: 0
				});

			}

		}).catch(e => {
			if (e) ಠ_ಠ.Flags.error("Deletion Error", e);
		});

	};

	var _closeSearch = function(search) {

		if (_search && !search) return _closeSearch(_search);

		if (search) {
			_db.removeCollection(search);
			$("#nav_" + search).remove();
			$("#tab_" + search).remove();
			$("#folder_tabs a.nav-link:last").tab("show");
		}

	};

	var _tally = function(id) {

		var _name = "Tally @ " + new Date().toLocaleTimeString();

		/* <!-- Measure the Performance (start) --> */
		ಠ_ಠ.Flags.time(_name);

		/* <!-- Clear the Tally Cache --> */
		_tallyCache = {};

		var _collection = _db.getCollection(id),
			_isFile = ಠ_ಠ.Google.folders.check(false),
			_isFolder = ಠ_ಠ.Google.folders.check(true),
			_count = (items, results) => {

				/* <!-- Update File Count & Sizes --> */
				results.files += _.reduce(items, (count, item) => _isFile(item) ? count + 1 : count, 0);
				results.size += _.reduce(items, (total, item) => total + (item.size ? parseInt(item.size) : 0), 0);
				results.folders += _.reduce(items, (count, item) => _isFolder(item) ? count + 1 : count, 0);

				return results;

			},
			_aggregate = (values, results) => {

				if (results.folders || values.folders) results.folders += values.folders;
				results.files += values.files;
				results.size += values.size;
				if (results.mime && values.mime) _.each(values.mime, (mimes, mime) => {
					if (results.mime[mime]) {
						_aggregate(mimes, results.mime[mime]);
					} else {
						results.mime[mime] = mimes;
					}
				});

				return results;
			},
			_update = (items, results) => {

				/* <!-- Update Map of Size/Totals by Mime --> */
				_.each(_.groupBy(items, "mimeType"), (mimeItems, mime) => {
					if (!results.mime[mime]) {
						results.mime[mime] = _count(mimeItems, {
							files: 0,
							size: 0
						});
					} else {
						_count(mimeItems, results.mime[mime]);
					}
				});

				/* <!-- Update Map of Folder Parent IDs and Size/Totals --> */
				_.each(items, item => _.each(item.parents, parent => {
					if (!_tallyCache[parent]) _tallyCache[parent] = {
						files: 0,
						folders: 0,
						size: 0
					};
					_tallyCache[parent][_isFolder(item) ? "folders" : "files"] += 1;
					_tallyCache[parent].size += (item.size ? parseInt(item.size) : 0);
					if (_isFolder(item) && _tallyCache[item.id]) _aggregate(_tallyCache[item.id], _tallyCache[parent]);
				}));

				return _count(items, results);

			};

		var _tally_folders = function(folder_ids, results) {

			return new Promise((resolve) => {

				var _complete = (items) => {

					var _folders = _.filter(items, _isFolder);

					/* <!-- Recursive Iteration Function --> */
					var _iterate_batch = function(batch, batches, complete) {

						if (batch) {
							_tally_folders(batch, {
								files: 0,
								folders: 0,
								size: 0,
								mime: {}
							}).then((values) => {
								_aggregate(values, results);
								_iterate_batch(batches.shift(), batches, complete);
							});
						} else {
							complete();
						}

					};

					/* <!-- Update File & Folder Counts/Sizes before Resolving --> */
					var _finish = () => _update(items, results) && resolve(results);

					if (_folders && _folders.length > 0) {

						/* <!-- Batch these Child IDs into Arrays with length not longer than BATCH_SIZE --> */
						var _batches = _.chain(_folders).map(folder => folder.id).groupBy((v, i) => Math.floor(i / BATCH_SIZE)).toArray().value();
						_iterate_batch(_batches.shift(), _batches, () => _finish());

					} else {

						_finish();

					}

				};

				/* <!-- Run the promise to fetch the data, with a delayed single retry (if required) --> */
				/* <!-- Should be moved (DELAY / RETRY) to the Google Module, which will pass call retry details to network --> */
				ಠ_ಠ.Google.folders.children(folder_ids, true, _team).then(_complete).catch(() => {
					DELAY(2000).then(() => {
						ಠ_ಠ.Google.folders.children(folder_ids, true, _team).then(_complete).catch((e) => ಠ_ಠ.Flags.error("Processing Tally for Google Drive Folders: " + JSON.stringify(folder_ids), e ? e : "No Inner Error"));
					});
				});

			});

		};

		var _process_Folder = function(folder, folders, totals) {

			if (folder) {

				var _cell = $("#" + folder.id).find(".file-name").closest("td"),
					_busy = busy(_cell, _cell.parent());
				_busy(true);

				var _result = _collection.by("id", folder.id);

				_tally_folders(folder.id, {
					files: 0,
					folders: 0,
					size: 0,
					mime: {}
				}).then((results) => {

					/* <!-- Aggregate Results --> */
					_aggregate(results, totals);

					/* <!-- Format Results --> */
					results.empty = !!(!results.files && !results.folders && !results.size);

					/* <!-- Save Results (for filtering etc) --> */
					_result.results = results;
					_collection.update(_result);

					/* <!-- Show Results --> */
					_cell.append(ಠ_ಠ.Display.template.get("tally")(results));

					/* <!-- Debug Log Results --> */
					ಠ_ಠ.Flags.log("TALLIED FOLDER " + folder.id + ":", results);

					_busy(false);

					_process_Folder(folders.shift(), folders, totals);

				});

			} else {

				/* <!-- Measure the Performance (end) --> */
				ಠ_ಠ.Flags.time(_name, true);

				/* <!-- Debug Log Results --> */
				ಠ_ಠ.Flags.log("TALLY TOTAL RESULTS:", totals);

				/* <!-- Filter and sort Mime Types --> */
				var _mimes = _.sortBy(_.reject(_.map(totals.mime, (value, mime) => {
					value.mime = mime;
					return value;
				}), item => !item.files && !item.size), "size").reverse();

				/* <!-- Display the Results --> */
				ಠ_ಠ.Display.modal("results", {
					id: "tally_results",
					target: ಠ_ಠ.container,
					title: "Tally Results",
					folders: totals.folders,
					files: totals.files,
					size: totals.size,
					mime: _mimes
				});

			}

		};

		/* <!-- Check initial folder first --> */
		var _results = _update(_collection.chain().find({
			"folder": false
		}).data(), {
			files: 0,
			folders: 0,
			size: 0,
			mime: {}
		});

		/* <!-- Get the Folders to Process --> */
		var _folders = _collection.chain().find({
			"folder": true
		}).data();

		/* <!-- Start Recursively Tallying Folders --> */
		_process_Folder(_folders.shift(), _folders, _results);

	};

	var _removeItem = function(id) {

		var _id = _search ? _search : folder.id;
		var _collection = _db.getCollection(_id);
		var _candidate = _collection.by("id", id);

		if (_candidate) _collection.remove(_candidate);
		_tables[_id].update();

	};

	var _detag = function(id, tag) {

		var _id = _search ? _search : folder.id;
		var _collection = _db.getCollection(_id);
		var _candidate = _collection.by("id", id);

		if (_candidate && (_candidate.properties[tag] || _candidate.appProperties[tag])) {

			ಠ_ಠ.Display.confirm({
				id: "remove_Tag",
				target: ಠ_ಠ.container,
				message: `Please confirm that you want to remove the <strong>${tag}</strong> tag from <strong>${_candidate.name}</strong>`,
				action: "Remove"
			}).then((confirm) => {

				if (confirm) {

					var _container = $("#" + _id + "_" + _candidate.id);
					if (!_container || _container.length === 0) _container = $("#" + _candidate.id);
					var _cell = _container.find(".file-name").parent(),
						_row = _cell.parent(),
						_busy = busy(_cell, _row);
					_busy(true);

					var _private = _candidate.appProperties && _candidate.appProperties[tag];
					var _properties = _private ? _candidate.appProperties : _candidate.properties;
					_properties[tag] = null;
					var _data = _private ? {
						appProperties: _properties
					} : {
						properties: _properties
					};

					ಠ_ಠ.Flags.log(`DE-TAGGING FILE: ${_candidate.name} (${_candidate.id}) with ${JSON.stringify(_data)}`);

					ಠ_ಠ.Google.update(_candidate.id, _data, _team).then(updated => {
						_candidate.needs_Review = needsReview(_candidate);
						_collection.update(_candidate);
						ಠ_ಠ.Flags.log(`FILE UPDATED: ${JSON.stringify(updated)}`);
					}).catch(e => {
						ಠ_ಠ.Flags.error("File " + _candidate.name + " De-Tagging Error", e ? e : "No Inner Error");
					}).then(() => _tables[_id].update() && _busy(false));

				}

			}).catch(e => {
				if (e) ಠ_ಠ.Flags.error("Tag Removal Error", e);
			});

		}

	};

	var _starItem = function(id) {

		var _id = _search ? _search : folder.id;
		var _collection = _db.getCollection(_id);
		var _candidate = _collection.by("id", id);

		if (_candidate) {

			var _container = $("#" + _id + "_" + _candidate.id);
			if (!_container || _container.length === 0) _container = $("#" + _candidate.id);
			var _cell = _container.find(".file-name").parent(),
				_row = _cell.parent(),
				_busy = busy(_cell, _row);
			_busy(true);

			ಠ_ಠ.Flags.log(`${_candidate.star ? "UN-" : ""}STARRING FILE: ${_candidate.name} (${_candidate.id})`);

			ಠ_ಠ.Google.update(_candidate.id, {
				starred: !_candidate.star
			}, _team).then(updated => {
				_candidate.star = !_candidate.star;
				_collection.update(_candidate);
				ಠ_ಠ.Flags.log(`FILE UPDATED: ${JSON.stringify(updated)}`);
			}).catch(e => {
				ಠ_ಠ.Flags.error(`File ${_candidate.name} ${_candidate.star ? "Un-" : ""}Starring Error`, e ? e : "No Inner Error");
			}).then(() => _tables[_id].update() && _busy(false));

		}

	};
	/* <!-- Internal Functions --> */

	/* <!-- Initial Calls --> */
	_showFolder(folder, target);

	/* <!-- External Visibility --> */
	return {

		id: () => folder.id,

		name: () => folder.name,

		search: (id) => _searchFolder(id ? id : folder.id),

		searchTag: (name, value) => _searchTag(name, value),

		convert: () => _convertItems(_search ? _search : folder.id),

		tag: (id) => _tagItems(_search ? _search : folder.id, id),

		close: (id) => _closeSearch(id),

		delete: () => _deleteItems(),

		tally: {
			get: () => _tallyCache,

			run: (id) => _tally(id ? id : folder.id)
		},

		remove: (id) => _removeItem(id),

		detag: (id, tag) => _detag(id, tag),

		table: () => _search ? _tables[_search] : _tables[folder.id],

		star: (id) => _starItem(id)

	};
	/* <!-- External Visibility --> */

};