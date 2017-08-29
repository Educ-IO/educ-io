Folder = function(ಠ_ಠ, folder, target) {

	/* <!-- Internal Constants --> */
	var SEARCH_NAME = "Google Drive Search";
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var _db = new loki("folders.db"),
		_tables = {},
		_search;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var mapItems = (v) => ({
		id: v.id,
		type: v.mimeType,
		name: v.name,
		parents: v.parents,
		icon: v.iconLink,
		thumbnail: v.thumbnailLink,
		url: v.webViewLink,
		star: v.starred,
		folder: ಠ_ಠ.google.folders.is(v.mimeType),
		download: !!v.webContentLink,
		paths: v.paths,
	});

	var _showData = function(id, name, values, target) {

		var headers = ["Star", "Name", "Type", "ID"].map((v) => ({
			name: v,
			hide: function(initial) {
				return !!(this.hide_now || (initial && this.hide_initially));
			},
			hide_now: false,
			hide_initially: false,
			field: v.toLowerCase(),
		}));

		var _data = _db.addCollection(id, {
			unique: ["id"],
			indices: ["type", "starred", "name"]
		});
		_data.insert(values);

		var _return = ಠ_ಠ.Datatable(ಠ_ಠ, {
			id: id,
			name: name,
			data: _data,
			headers: headers
		}, {
			advanced: false
		}, target);

		target.find("a.download").on("click.download", e => {
			ಠ_ಠ.google.download($(e.target).data("id")).then(binary => {
				try {
					saveAs(binary, $(e.target).data("name"));
				} catch (e) {
					ಠ_ಠ.Flags.error("Drive File Download", e);
				}
			});
		});

		return _return;

	};

	var _loadContents = function(id, name, target) {

		/* <!-- Start the Loader --> */
		ಠ_ಠ.Display.busy({
			target: target
		});

		/* <!-- Need to load the contents of the folder --> */
		ಠ_ಠ.google.folders.contents(id).then((contents) => {
			ಠ_ಠ.Flags.log("Google Drive Folder Opened", contents);
			_tables[name] = _showData(id, name, _.map(contents, mapItems), target);
			ಠ_ಠ.Display.busy({
				target: target,
				clear: true
			}).state().enter("opened").protect("a.jump").on("JUMP");
		}).catch((e) => {
			ಠ_ಠ.Flags.error("Requesting Selected Google Drive Folder", e ? e : "No Inner Error");
			ಠ_ಠ.Display.busy({
				target: target,
				clear: true
			}).state().exit("opened").protect("a.jump").off("JUMP");
		});

	};

	var _showTab = function(tab) {
		var target = $(tab.data("target"));
		if ((target.children().length === 0 || tab.data("refresh")) && tab.data("type") == "folder") _loadContents(tab.data("id"), tab.data("name"), target.empty());
		if (tab.data("type") == "folder") {
			ಠ_ಠ.Display.state().exit("searched");
			_search = null;
		} else if (tab.data("type") == "search") {
			ಠ_ಠ.Display.state().enter("searched");
			_search = tab.data("id");
		}
		tab.closest(".nav-item").addClass("order-1").siblings(".order-1").removeClass("order-1");
	};

	var _activateTab = function(tabs) {
		tabs.find("a.nav-link")
			.off("click.tabs").on("click.tabs", (e) => $(e.target).data("refresh", e.shiftKey))
			.off("show.bs.tab").on("show.bs.tab", (e) => _showTab($(e.target)))
			.last().tab("show");
	};

	var _showFolder = function(folder, target) {

		var _data = {
			tabs: [{
				id: folder.id,
				name: folder.name,
				type: "folder"
			}]
		};

		var _tabs = ಠ_ಠ.Display.template.show({
			template: "tab-list",
			id: folder.id,
			name: folder.name,
			nav: "folder_tabs",
			links: ಠ_ಠ.Display.template.get("tab-links")(_data),
			tabs: ಠ_ಠ.Display.template.get("tab-tabs")(_data),
			target: target,
			clear: true
		});

		/* <!-- Set Load Tab Handler & Load Initial Values --> */
		_activateTab(_tabs);

	};

	var _showResults = function(name, items) {

		var _id = name.replace(/[^A-Z0-9]+/gi, "").toLowerCase();

		var _data = {
			tabs: [{
				id: _id,
				name: name,
				type: "search"
			}]
		};
		var _items = _.each(_.map(items, mapItems), (v) => v.safe = (_id + "_" + v.id));

		_showData(_id, name, _items, $(ಠ_ಠ.Display.template.get("tab-tabs")(_data)).appendTo(".tab-content"));
		_activateTab($(ಠ_ಠ.Display.template.get("tab-links")(_data)).appendTo("#folder_tabs").parent());

		/* <!-- TEMPORARY STUFF TO SHIFT TO DEBUG LOGS --> */
		var _folder_Count = _.reduce(items, (count, item) => item.mimeType === "application/vnd.google-apps.folder" ? count + 1 : count, 0);
		var _file_Count = _.reduce(items, (count, item) => item.mimeType !== "application/vnd.google-apps.folder" ? count + 1 : count, 0);
		var _file_Size = _.reduce(items, (total, item) => total + (item.size ? parseInt(item.size) : 0), 0);

		console.timeEnd(name);
		console.log("FOUND FOLDERS: ", _folder_Count);
		console.log("FOUND FILES: ", _file_Count);
		console.log("TOTAL FILE SIZE (bytes): ", _file_Size);
		console.log("TOTAL FILE SIZE (Mb): ", Math.round(_file_Size / 1000 / 10) / 100);

	};

	var _searchFolder = function(id) {

		var _name = "Search @ " + new Date().toLocaleTimeString();
		console.time(_name);

		ಠ_ಠ.Display.modal("search", {
			id: "start_search",
			target: ಠ_ಠ.container,
			title: "Search Google Drive",
			instructions: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS")
		}).then((values) => {

			ಠ_ಠ.Display.busy({
				target: ಠ_ಠ.container
			});

			var _mime = _.map(_.find(values, v => v.name == "mime").value.split("\n"), m => m.trim());
			var _regex = (regex) => f => {
				if (regex.indexOf("||") > 0) {
					return f.mimeType === regex.split("||")[0] && new RegExp(regex.split("||")[1], "i").test(f.name);
				} else {
					return new RegExp(regex, "i").test(f.name);
				}
			};
			var _exclude = _.map(_.find(values, v => v.name == "exclude").value.split("\n"), r => _regex(r.trim()));
			var _include = _.map(_.find(values, v => v.name == "include").value.split("\n"), r => _regex(r.trim()));
			var _recurse = !!(_.find(values, v => v.name == "recurse"));

			ಠ_ಠ.google.folders.search(id, _recurse, _mime, _exclude, _include).then((results) => {
				_showResults(_name, results);
				ಠ_ಠ.Display.busy({
					clear: true
				});
			});

		}).catch(e => ಠ_ಠ.Flags.error("Search Error", e ? e : "No Inner Error"));

		ಠ_ಠ.container.find("#start_search button[data-action='populate']").on("click.populate", (e) => {

			var _excludes = ["^(\\~\\$)", "^(\\*\\*\\*\\sARCHIVE\\s\\*\\*\\*\\s)", "\\$RECYCLE\\.BIN"].join("\n");
			var _populate = $(e.target).data("populate");
			if (_populate == "word") {

				$("#mimeTypes").val([
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
					"application/zip", "application/msword"
				].join("\n"));
				$("#excludeRegexes").val(_excludes);
				$("#includeRegexes").val(["(\\.docx)$", "(\\.doc)$"].join("\n"));

			} else if (_populate == "excel") {

				$("#mimeTypes").val([
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
					"application/zip", "application/vnd.ms-excel"
				].join("\n"));
				$("#excludeRegexes").val(_excludes);
				$("#includeRegexes").val(["(\\.xlsx)$", "(\\.xls)$"].join("\n"));

			} else if (_populate == "powerpoint") {

				$("#mimeTypes").val([
					"application/vnd.openxmlformats-officedocument.presentationml.presentation",
					"application/zip", "application/vnd.ms-powerpoint"
				].join("\n"));
				$("#excludeRegexes").val(_excludes);
				$("#includeRegexes").val(["(\\.pptx)$", "(\\.ppt)$"].join("\n"));

			}
		});

	};

	var _convertFile = function(file, sourceMimeType, targetMimeType, prefixAfterConversion) {

		return new Promise((resolve, reject) => {

			var metadata = {
				mimeType: targetMimeType,
				name: file.name.substr(0, file.name.lastIndexOf(".")),
				parents: file.parents
			};

			ಠ_ಠ.google.download(file.id).then(binary => {

				ಠ_ಠ.google.upload(metadata, binary, sourceMimeType).then(uploadedFile => {

						prefixAfterConversion ?
							ಠ_ಠ.google.update(file.id, {
								name: prefixAfterConversion + file.name
							})
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
				_.each(successes, success => values.push(["Success", success.old.id, success.old.name, success.new.id, success.new.name, success.new.mimeType]));

				var _total = failures.length + successes.length + last;

				ಠ_ಠ.google.sheets.append(id, "A" + last + ":F" + _total, values)
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

				ಠ_ಠ.google.sheets.create("Folders - Conversion Results " + (folder && folder.name ? " for (" + folder.name + ") " : "") + "[" + new Date().toUTCString() + "]").then(sheet => {

					var id = sheet.spreadsheetId,
						values = [];
					values.push(["Result", "Source File Id", "Source File Name", "Destination File Id", "Destination File Name", "Destination File Type"]);

					ಠ_ಠ.google.sheets.update(id, "A1:F1", values)
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

	var _convertItems = function() {

		var _collection;
		if (!_search || !(_collection = _db.getCollection(_search))) return;

		ಠ_ಠ.Display.modal("convert", {
			id: "convert_results",
			target: ಠ_ಠ.container,
			title: "Convert Files",
			instructions: ಠ_ಠ.Display.doc.get("CONVERT_INSTRUCTIONS")
		}).then((values) => {

			var _results = _collection.chain().data();

			ಠ_ಠ.Flags.log("CONVERSION STARTED: " + _results.length + " items to convert");

			var _sourceMimeType = _.find(values, v => v.name == "source").value;
			var _targetMimeType = _.find(values, v => v.name == "target").value;
			var _prefixAfterConversion = _.find(values, v => v.name == "prefix").value;
			var _batchSize = _.find(values, v => v.name == "batch").value;

			if (_sourceMimeType && _targetMimeType) {

				var _process_Batch = function(batch, batches, batch_index, length, id, last) {

					/* <!-- Reset Variables  --> */
					var _successes = [],
						_failures = [];

					var _process_Result = function(file, files, file_index, id, last, complete) {

						if (file) {

							ಠ_ಠ.Flags.log("PROCESSING FILE " + file_index);

							var _container = $("#" + _search + "_" + file.id);
							var _result = _collection.by("id", file.id);

							ಠ_ಠ.Display.busy({
								target: _container.find(".file-name").parent(),
								class: "loader-small"
							});
							_convertFile(file, _sourceMimeType, _targetMimeType, _prefixAfterConversion).then(converted => {
								if (_container) _container.find(".file-name").addClass("action-succeeded text-success font-weight-bold");
								if (_result) _result.name_class = "action-succeeded text-success font-weight-bold";
								if (converted.old) {
									if (_container) _container.find(".file-name").text(converted.old.name);
									if (_result) _result.name = converted.old.name;
								}
								if (_result) _collection.update(_result);
								ಠ_ಠ.Flags.debug("CONVERTED ITEM " + file_index, converted);
								_successes.push(converted);
								ಠ_ಠ.Display.busy({
									clear: true
								});
								_process_Result(files.shift(), files, file_index + 1, id, last, complete);
							}).catch(e => {
								if (_container) _container.find(".file-name").addClass("action-failed text-danger font-weight-bold");
								if (_result) {
									_result.name_class = "action-failed text-danger font-weight-bold";
									_collection.update(_result);
								}
								ಠ_ಠ.Flags.error("File " + file_index + " Conversion Error", e ? e : "No Inner Error");
								_failures.push(file);
								ಠ_ಠ.Display.busy({
									clear: true
								});
								_process_Result(files.shift(), files, file_index + 1, id, last, complete);
							});

						} else {

							ಠ_ಠ.Flags.log("FILE CONVERSION COMPLETE: " + _successes.length + " successfully converted, " + _failures.length + " failed to convert.");

							_saveConversionResults(_successes, _failures, id, last).then((v) => {
								complete(v);
							}).catch(() => {
								complete();
							});

						}

					};

					if (batch) {

						ಠ_ಠ.Flags.log("PROCESSING BATCH " + batch_index + " of " + length);

						var _next = (value) => {
							if (value) {
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

				var batches = _.chain(_results).groupBy((v, i) => Math.floor(i / _batchSize)).toArray().value();
				_process_Batch(batches.shift(), batches, 1, batches.length + 1);

			}

		}).catch(e => ಠ_ಠ.Flags.error("Convert Cancelled", e ? e : "No Inner Error"));

		ಠ_ಠ.container.find("#convert_results button[data-action='populate']").on("click.populate", (e) => {

			var _populate = $(e.target).data("populate");
			if (_populate == "docs") {

				$("#sourceMimeType").val("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
				$("#targetMimeType").val("application/vnd.google-apps.document");

			} else if (_populate == "sheets") {

				$("#sourceMimeType").val("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
				$("#targetMimeType").val("application/vnd.google-apps.spreadsheet");

			} else if (_populate == "slides") {

				$("#sourceMimeType").val("application/vnd.openxmlformats-officedocument.presentationml.presentation");
				$("#targetMimeType").val("application/vnd.google-apps.presentation");

			}

			$("#prefixAfterConversion").val("*** ARCHIVE *** ");

		});

	};
	/* <!-- Internal Functions --> */

	/* <!-- Initial Calls --> */
	_showFolder(folder, target);

	/* <!-- External Visibility --> */
	return {
		id: () => folder.id,

		search: (id) => _searchFolder(id ? id : folder.id),

		convert: () => _convertItems(),
	};
	/* <!-- External Visibility --> */

};