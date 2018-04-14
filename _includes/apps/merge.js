App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

	/* <!-- Internal Constants --> */
	const TYPE = "application/x.educ-io.merge",
		STATE_OPENED = "opened",
		STATE_LOADED_DATA = "loaded-data",
		STATE_LOADED_TEMPLATE = "loaded-template",
		STATES = [STATE_OPENED, STATE_LOADED_DATA, STATE_LOADED_TEMPLATE];
	const ID = "merge_split",
		RECENT = {};
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _records, _master, _output;
	
	var _result, _template, _nodes, _template_Resize, _template_File;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _genericPick = (prompt, views, log, mimeType) => new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.Google.pick(
				prompt, false, true, views,
				file => file ? file.mimeType.toLowerCase() == mimeType.toLowerCase() ?
				ಠ_ಠ.Flags.log(log, file) && resolve(file) : reject("Wrong Type of File Picked") : reject("No File Picked")
			);

		}),
		_pick = {

			merge: () => _genericPick("Select a Merge to Open",
				() => [new google.picker.DocsView().setMimeTypes(TYPE).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				"Google Drive Merge Picked", TYPE),

			sheet: () => _genericPick("Select a Sheet to Open",
				() => [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				"Google Drive Sheet Picked", ಠ_ಠ.Google.files.natives()[1]),

			doc: () => _genericPick("Select a Document to Open",
				() => [new google.picker.DocsView(google.picker.ViewId.DOCUMENTS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				"Google Drive Doc Picked", ಠ_ಠ.Google.files.natives()[0]),

			form: () => _genericPick("Select a Form to Open",
				() => [new google.picker.DocsView().setMimeTypes(ಠ_ಠ.Google.files.natives()[4]).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				"Google Drive Doc Picked", ಠ_ಠ.Google.files.natives()[4]),

		};

	var _loadMerge = id => ಠ_ಠ.Google.download(id)
		.then(loaded => {
			ಠ_ಠ.Display.log("Loaded:", loaded);
			ಠ_ಠ.Display.state().enter(STATE_OPENED);
		});

	var _createMerge = () => new Promise(resolve => {

		/* <!-- Set Up Recent DBs if required --> */
		_.each(["data", "template"], name => RECENT[name] = (RECENT[name] ?
			RECENT[name] : {
				target: `recent_${name}`,
				db: ಠ_ಠ.Items(ಠ_ಠ, `${ಠ_ಠ.Flags.dir()}--${name.toUpperCase()}`)
			}));

		ಠ_ಠ.Display.template.show({
			template: "split",
			id: ID,
			data: {
				sheet: {
					name: "Sheet",
					click: "_cmd_Data_Sheet"
				},
				form: {
					name: "Form",
					click: "_cmd_Data_Form"
				}
			},
			data_details: ಠ_ಠ.Display.doc.get("DATA_DETAILS"),
			templates: {
				doc: {
					name: "Doc",
					click: "_cmd_Template_Doc"
				},
				sheet: {
					name: "Sheet",
					click: "_cmd_Template_Sheet"
				}
			},
			template_details: ಠ_ಠ.Display.doc.get("TEMPLATE_DETAILS"),
			target: ಠ_ಠ.container,
			clear: true,
		});

		_.each(_.keys(RECENT), key => {
			RECENT[key].db.last(5).then(recent => {
				recent && recent.length > 0 ? ಠ_ಠ.Display.template.show({
					template: "recent",
					recent: recent,
					target: $(`#${RECENT[key].target}`),
					clear: true
				}) : false;
			}).catch(e => ಠ_ಠ.Flags.error("Recent Items Failure", e ? e : "No Inner Error"));
		});

		resolve(ಠ_ಠ.Display.state().enter(STATE_OPENED));

	});

	var _loadTemplate = file => {

		if (file.mimeType.toLowerCase() == ಠ_ಠ.Google.files.natives()[0].toLowerCase()) {

			return ಠ_ಠ.Google.files.export(file.id, "text/html")
				.then(ಠ_ಠ.Google.reader().promiseAsText)
				.then(result => {
					_result = result;
					_template_Resize = ಠ_ಠ.Display.size.resizer.height("#site_nav", `#${ID}_template iframe`, "height", 25);
					_template = $(result);
					_nodes = $.parseHTML($.trim(result));
					_template_File = file;

					var _frame = $(`#${ID}_template iframe`),
						_doc = _frame[0].contentDocument || _frame[0].contentWindow.document;
					_doc.open();
					_doc.writeln(result);
					_doc.close();

					ಠ_ಠ.Display.state().enter(STATE_LOADED_TEMPLATE);
				});

		} else {

			return Promise.reject(`Can't load ${file.name}, as we can't process type: ${file.mimeType}`);

		}

	};

	var _uploadDoc = template => {

		var metadata = {
			name: "TEST UPLOAD",
			mimeType: ಠ_ಠ.Google.files.natives()[0]
		};

		return ಠ_ಠ.Google.upload(metadata, new Blob([template], {
			type: "text/html"
		}), "text/html");

	};

	var _generatePDF = template => {
		var pdf = new jsPDF();
		pdf.fromHTML(template);
		return pdf;
	};

	var _uploadPDF = template => {
		var metadata = {
			name: "TEST UPLOAD",
			mimeType: "application/pdf"
		};

		return ಠ_ಠ.Google.upload(metadata,
			new Blob(_generatePDF(template).output("blob"), {
				type: "application/pdf"
			}), "application/pdf");

	};

	var _savePDF = () => {
		var _frame = $(`#${ID}_template iframe`),
			_doc = _frame[0].contentDocument || _frame[0].contentWindow.document;
		ಠ_ಠ.Flags.log("DOC:", _doc);
		_generatePDF(_doc).save("Test.pdf");
		return Promise.resolve();

		/* <!-- 
	var blob = pdf.output("blob");
	window.open(URL.createObjectURL(blob));
	--> */

	};
	
	var _resize = () => ಠ_ಠ.Display.size.resizer.height("#site_nav, #data_tabs", "div.tab-pane");
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		initialise: function(container) {

			/* <!-- Get a reference to the Container --> */
			ಠ_ಠ = container;

			/* <!-- Set Container Reference to this --> */
			container.App = this;

			/* <!-- Set Up the Default Router --> */
			this.route = ಠ_ಠ.Router.create({
				name: "Merge",
				states: STATES,
				test: () => ಠ_ಠ.Display.state().in(STATE_OPENED),
				clear: () => {
					_records = null;
					_master = null;
					if (_template_Resize) _template_Resize() && (_template_Resize = null);
				},
				route: (handled, command) => {

					if (handled) return;

					var _busy;

					if ((/OPEN/i).test(command)) {

						if ((/OPEN/i).test(command[1]) && command[1]) {

							/* <!-- Load Existing Merge File --> */
							_loadMerge(command[1]);

						} else {

							/* <!-- Pick Existing Merge File --> */
							_pick.merge().then(merge => {
								ಠ_ಠ.Flags.log("MERGE:", merge);
								_loadMerge(merge.id);
							}).catch(e => ಠ_ಠ.Flags.error("Picker Failure: ", e ? e : "No Inner Error"));

						}

					} else if ((/CREATE/i).test(command)) {

						_createMerge();

					} else if ((/SAVE/i).test(command)) {

						_busy = ಠ_ಠ.Display.busy({
							target: ಠ_ಠ.container,
							status: "Processing Merge",
							fn: true
						});

						((/PDF/i).test(command[1]) ?
							_savePDF() : Promise.reject("Missing Uploader"))
						.catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
							.then(_busy);

					} else if ((/HEADERS/i).test(command)) {
			
						if (_records) _records.headers[
							(/INCREMENT/i).test(command[1]) ? "increment" :
							(/DECREMENT/i).test(command[1]) ? "decrement" :
							(/MANAGE/i).test(command[1]) ? "manage" : "restore"
						]().then(_resize);
						
					} else if ((/MERGE/i).test(command)) {

						_busy = ಠ_ಠ.Display.busy({
							target: ಠ_ಠ.container,
							status: "Processing Merge",
							fn: true
						});

						ಠ_ಠ.Flags.log("TEMPLATE FILE:", _template_File);
						((/DOC/i).test(command[1]) ?
							ಠ_ಠ.Google.files.copy(_template_File.id, false, {
								name: `${_template_File.name} [Merged]`,
								parents: _template_File.parents,
							}) :
							Promise.reject("No Merger"))
						.then(merge => {
								ಠ_ಠ.Flags.log("MERGED FILE:", merge);
								return ಠ_ಠ.Google.execute(ಠ_ಠ.SETUP.CONFIG.api, "test", [merge.id]);
							})
							.then(result => {
								ಠ_ಠ.Flags.log("RESULT FROM MERGE:", result);
								return true;
							})
							.catch(e => ಠ_ಠ.Flags.error("Merging Failure: ", e ? e : "No Inner Error"))
							.then(_busy);

					} else if ((/UPLOAD/i).test(command)) {

						_busy = ಠ_ಠ.Display.busy({
							target: ಠ_ಠ.container,
							status: "Processing Merge",
							fn: true
						});

						((/DOC/i).test(command[1]) ?
							_uploadDoc(_result) :
							(/PDF/i).test(command[1]) ?
							_uploadPDF(_result) :
							Promise.reject("Missing Uploader"))
						.then(uploaded => {
								ಠ_ಠ.Flags.log("PROCESSED UPLOAD:", uploaded);
							})
							.catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
							.then(_busy);

					} else if ((/LOAD/i).test(command)) {

						_busy = ಠ_ಠ.Display.busy({
							target: ಠ_ಠ.container,
							status: "Loading",
							fn: true
						});

						((/SHEET/i).test(command[2]) ?
							_pick.sheet() :
							(/DOC/i).test(command[2]) ?
							_pick.doc() :
							(/FORM/i).test(command[2]) ?
							_pick.form() :
							ಠ_ಠ.Google.files.get(command[2]))
						.then(file => ((/DATA/i).test(command[1]) ?
							ಠ_ಠ.Records(ಠ_ಠ, file, $("#merge_split_data"), command[3])
								.then(records => {
									_records = records;
									ಠ_ಠ.Display.state().enter(STATE_LOADED_DATA);
									_resize();
								}) :
									(/TEMPLATE/i).test(command[1]) ?
									_loadTemplate(file) :
									Promise.reject("Missing Process"))
								.then(result => {
									ಠ_ಠ.Flags.log("PROCESSED LOAD:", result);
							
									/* <!-- Store in Relevant Recent Items --> */
									var _type = command[1].toLowerCase(),
										_recent = RECENT[_type].db;
									_recent ? _recent.add(file.id, file.name, `#google,load.${_type}.${file.id}`) : false;

									return result;
								})

							)
							.catch(e => ಠ_ಠ.Flags.error("Loading Failure: ", e ? e : "No Inner Error"))
							.then(_busy);

					} else if ((/CLOSE/i).test(command)) {

						ಠ_ಠ.Router.clean(true);

					} else if ((/TEST/i).test(command)) {

						ಠ_ಠ.Flags.log("Records:", _records);
						ಠ_ಠ.Flags.log("Master:", _master);
						ಠ_ಠ.Flags.log("Output:", _output);
						ಠ_ಠ.Flags.log("Template:", _template);
						ಠ_ಠ.Flags.log("Nodes:", _nodes);
						
					}

				}
			});
			
			/* <!-- Return for Chaining --> */
			return this;

		},

		/* <!-- Clear the existing state --> */
		clean: () => ಠ_ಠ.Router.clear(false)

	};

};