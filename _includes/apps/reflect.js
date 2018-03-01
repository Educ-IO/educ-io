App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) {
		return new this.App().initialise(this);
	}

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _last, _forms, _template, _form, _folder, _file;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Constants --> */
	const _email = /\w+@[\w.-]+|\{(?:\w+, *)+\w+\}@[\w.-]+/gi;
	
	const TYPE_SCALE = "application/x.educ-io.reflect-scale",
				TYPE_FORM = "application/x.educ-io.reflect-form",
				TYPE_REPORT = "application/x.educ-io.reflect-report",
				TYPE_REVIEW = "application/x.educ-io.reflect-review",
				_types = [TYPE_SCALE, TYPE_FORM, TYPE_REPORT, TYPE_REVIEW];

	const _pick = function() {

		return new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.google.pick(
				"Select a File / Folder to Use", true, true,
				() => [new google.picker.DocsView(google.picker.ViewId.DOCS).setIncludeFolders(true).setSelectFolderEnabled(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				(files) => files && files.length > 0 ? ಠ_ಠ.Flags.log("Google Drive Files Picked", files) && resolve(files) : reject()
			);

		});

	};
	/* <!-- Internal Constants --> */

	/* <!-- Internal Handlers --> */
	var _evidence = {

		default: (e) => {
			e.preventDefault();
			return $(e.currentTarget).parents(".evidence-holder");
		},

		add: (o, list, check) => {

			if (check !== false) {
				var checks = list.find("input[type='checkbox']");
				if (checks && checks.length == 1 && !checks.prop("checked")) checks.prop("checked", true);
			}

			if (!o.template) o.template = "list_item";
			if (!o.delete) o.delete = "Remove";

			/* <!-- Add new Item to List --> */
			$(ಠ_ಠ.Display.template.get(o)).appendTo(list.find(".list-data")).find("a.delete").click(
				function(e) {
					e.preventDefault();
					var _this = $(e.currentTarget).parent();
					if (_this.siblings(".list-item").length === 0) {
						_this.closest(".input-group").children("input[type='checkbox']").prop("checked", false);
					}
					_this.remove();
				}
			);
		},

		picker: (e) => {
			var _pickEvidence = (list) => {
					_pick()
						.then(files => (files && files.length > 0) ? _.each(files, (file, i) => _evidence.add({
							id: file[google.picker.Document.ID],
							url: file[google.picker.Document.URL],
							details: file[google.picker.Document.NAME],
							type: list.find("button[data-default]").data("default"),
							icon_url: file[google.picker.Document.ICON_URL]
						}, list, i === 0)) : ಠ_ಠ.Flags.log("No Google Drive Files Picked"))
						.catch(e => e ? ಠ_ಠ.Flags.error("Picking Google Drive File", e) : ಠ_ಠ.Flags.log("Google Drive Picker Cancelled"));
				},
				_list = _evidence.default(e);
			_pickEvidence(_list);
		},

		file: (e) => {
			var _list = _evidence.default(e);
			ಠ_ಠ.Display.files({
				id: "reflect_prompt_file",
				title: "Please upload file/s ...",
				message: ಠ_ಠ.Display.doc.get({
					name: "FILE",
					content: "evidence",
				}),
				action: "Upload"
			}).then(files => {
				var _total = files.length,
					_current = 0;
				var finish = ಠ_ಠ.Display.busy({
					target: _list.closest("li"),
					class: "loader-small",
					fn: true
				});
				var _complete = function() {
					if (++_current == _total) finish();
				};
				_.each(files, source => {
					ಠ_ಠ.google.upload({
							name: source.name
						}, source, source.type)
						.then(uploaded => ಠ_ಠ.google.files.get(uploaded.id).then(file => {
							_evidence.add({
								id: file.id,
								url: file.webViewLink,
								details: file.name,
								type: _list.find("button[data-default]").data("default"),
								icon_url: file.iconLink
							}, _list, true);
							_complete();
						}))
						.catch(e => {
							ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error");
							_complete();
						});
				});

			}).catch(e => e ? ಠ_ಠ.Flags.error("Displaying File Upload Prompt", e) : ಠ_ಠ.Flags.log("File Upload Cancelled"));
		},

		web: (e) => {
			var _list = _evidence.default(e);
			ಠ_ಠ.Display.text({
				id: "reflect_prompt_url",
				title: "Please enter a URL ...",
				name: "Name",
				value: "URL",
				message: ಠ_ಠ.Display.doc.get({
					name: "URL",
					content: "evidence",
				}),
				validate: /^((?:(ftps?|https?):\/\/)?((?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9])\.)(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[0-9][0-9]|[0-9]))|(?:(?:(?:[a-zA-Z0-9._-]+){1,2}[\w]{2,4})))(?::(\d+))?((?:\/[\w]+)*)(?:\/|(\/[\w]+\.[\w]{3,4})|(\?(?:([\w]+=[\w]+)&)*([\w]+=[\w]+))?|\?(?:(wsdl|wadl))))$/i
			}).then(url => {
				var _url = url.value ? url.value : url,
					_name = url.name ? url.name : "Web Link";
				_evidence.add({
					url: _url.indexOf("://") > 0 ? _url : "http://" + _url,
					details: _name,
					type: _list.find("button[data-default]").data("default"),
					icon: "public"
				}, _list, true);
			}).catch(e => e ? ಠ_ಠ.Flags.error("Displaying URL Prompt", e) : ಠ_ಠ.Flags.log("URL Prompt Cancelled"));
		},

		paper: (e) => {
			var _list = _evidence.default(e);
			_evidence.add({
				details: "Offline / Paper",
				type: _list.find("button[data-default]").data("default"),
				icon: "local_printshop"
			}, _list, true);
		},

	};
	/* <!-- Internal Handlers --> */

	/* <!-- Data Functions --> */
	var _data = {

		dehydrate_NEW: form => {
			
			var value = el => {

				var simple = _el => {
					var _type = _el.data("output-type"),
						_val = (_el[0].type == "checkbox" || _el[0].type == "radio") ?
						_el.prop("checked") :
						(_el[0].nodeName == "P" || _el[0].nodeName == "DIV" || _el[0].nodeName == "SPAN") ?
						_el.text().trim() : (_el[0].nodeName == "A") ? {
							Id: _el.prop("id"),
							Url: _el.prop("href"),
							Text: _el.text()
						} : (_el[0].nodeName == "IMG") ? {
							Url: _el.prop("src")
						} : (_el[0].nodeName == "BUTTON") ? 
							(_el.data("default") && _el.data("default") == _el.text()) ? null : _el.text() : 
						_el.val();
					/* <!-- TODO: Handle Parsing of types here --> */
					return _val;
				};

				var complex = (descendants) => {
					var _val = {};
					descendants.each(function() {
						var _el = $(this);
						if (_el.parents("*[data-output-name]")[0] === el[0]) { /* <!-- Only Process Direct Descendents --> */
							var __val = value(_el);
							if (!_.isEmpty(__val)) _val[_el.data("output-name")] = __val;
						}
					});
					return _val;
				};

				var descendants = el.find("*[data-output-name]");
				return (descendants.length === 0) ? simple(el) : complex(descendants);
			};

			/* <!-- TODO: Evidence Only Outputs One List Item ** BUG ** --> */
			
			var _return = {};
			form.find("*[data-output-field]").each(function() { /* <!-- Iterate through all the fields in the form --> */
				var _$ = $(this),
					_field = {};
				_$.find("*[data-output-name]").each(function() {
					var _$ = $(this);
					if (_$.parents("*[data-output-name]").length === 0) { /* <!-- Only Process Top-Level Values --> */
						var _val = value(_$);
						if (!_.isEmpty(_val)) {
							if (_field[_$.data("output-name")] !== undefined) {
								if (_.isArray(_field[_$.data("output-name")])) {
									_field[_$.data("output-name")] = _field[_$.data("output-name")].concat(_val);
								} else {
									_field[_$.data("output-name")] = [_field[_$.data("output-name")], _val];
								}
							} else {
								_field[_$.data("output-name")] = _val;
							}
						}
					}
				});

				if (!_.isEmpty(_field)) {
					var _object = {
						Values: _field
					};
					if (_$.data("output-order")) _object.Order = _$.data("output-order");
					_return[_$.data("output-field")] = _object;
				}

			});

			ಠ_ಠ.Flags.log("Dehydrated Form Data:", _return);
			return _return;
			
		},
		
		dehydrate: form => {

			var value = el => {

				var simple = _el => {
					var _type = _el.data("output-type"),
						_val = (_el[0].type == "checkbox" || _el[0].type == "radio") ?
						_el.prop("checked") :
						(_el[0].nodeName == "P" || _el[0].nodeName == "DIV" || _el[0].nodeName == "SPAN") ?
						_el.text().trim() : (_el[0].nodeName == "A") ? {
							Id: _el.prop("id"),
							Url: _el.prop("href"),
							Text: _el.text()
						} : (_el[0].nodeName == "IMG") ? {
							Url: _el.prop("src")
						} : (_el[0].nodeName == "BUTTON") ? 
							(_el.data("default") && _el.data("default") == _el.text()) ? null : _el.text() : 
						_el.val();
					/* <!-- TODO: Handle Parsing of types here --> */
					return _val;
				};

				var complex = (descendants) => {
					var _val = {};
					descendants.each(function() {
						var _el = $(this);
						if (_el.parents("*[data-output-name]")[0] === el[0]) { /* <!-- Only Process Direct Descendents --> */
							var __val = value(_el);
							if (!_.isEmpty(__val)) _val[_el.data("output-name")] = __val;
						}
					});
					return _val;
				};

				var descendants = el.find("*[data-output-name]");
				return (descendants.length === 0) ? simple(el) : complex(descendants);
			};

			/* <!-- TODO: Evidence Only Outputs One List Item ** BUG ** --> */
			
			var _return = {};
			form.find("*[data-output-field]").each(function() { /* <!-- Iterate through all the fields in the form --> */
				var _$ = $(this),
					_field = {};
				_$.find("*[data-output-name]").each(function() {
					var _$ = $(this);
					if (_$.parents("*[data-output-name]").length === 0) { /* <!-- Only Process Top-Level Values --> */
						var _val = value(_$);
						if (!_.isEmpty(_val)) {
							if (_field[_$.data("output-name")] !== undefined) {
								if (_.isArray(_field[_$.data("output-name")])) {
									_field[_$.data("output-name")] = _field[_$.data("output-name")].concat(_val);
								} else {
									_field[_$.data("output-name")] = [_field[_$.data("output-name")], _val];
								}
							} else {
								_field[_$.data("output-name")] = _val;
							}
						}
					}
				});

				if (!_.isEmpty(_field)) {
					var _object = {
						Values: _field
					};
					if (_$.data("output-order")) _object.Order = _$.data("output-order");
					_return[_$.data("output-field")] = _object;
				}

			});

			ಠ_ಠ.Flags.log("Dehydrated Form Data:", _return);
			return _return;
		},

		rehydrate: (form, data) => {
			
			ಠ_ಠ.Flags.log("Rehydrating Form Data:", data);
			
			var value = (el, val) => {

				var simple = _el => {
					console.log(`Calling SIMPLE Set with on ${_el[0].nodeName} (Type=${_el[0].type}) with ${JSON.stringify(val)}`);
					var _type = _el.data("output-type");
					if (_el[0].type == "checkbox" || _el[0].type == "radio") {
						if (val) _el.prop("checked", !!(val)).triggerHandler("change");
					} else if (_el[0].nodeName == "BUTTON") { /* <!-- Handle Button Selectors --> */
						var _option = _el.closest("*[data-output-field]").find(`*[data-value='${val}']`);
						_option.length == 1 ? _option.click() : _el.text(val); /* <!-- Defer to click handler if available --> */
					} else {
						_el.val(val) && (_el.is("textarea.resizable")) ? 
							autosize.update(_el[0]) : true; /* <!-- Fire autosize if required --> */
					}
					if (val.Items) _.each(_.isArray(val.Items) ? val.Items : [val.Items], item => {
										
					});
				};

				var complex = (descendants) => {
					console.log(`Calling COMPLEX Set with on ${el[0].nodeName} (Type=${el[0].type}) with ${JSON.stringify(val)}`);
					descendants.each(function() {
						var _el = $(this);
						if (_el.parents("*[data-output-name]")[0] === el[0] && val[_el.data("output-name")]) value(_el, val[_el.data("output-name")]); /* <!-- Only Process Direct Descendents --> */
					});
				};

				var descendants = el.find("*[data-output-name]");
				return (descendants.length === 0) ? simple(el) : complex(descendants);
				
			};
			
			form.find("*[data-output-field]").each(function() { /* <!-- Iterate through all the fields in the form --> */
				var _$ = $(this), _name = _$.data("output-field");
				if (_name && data[_name]) {
					
					var _values = data[_name].Values, _targets = _$.find("*[data-output-name]"), 
							_text = _$.find("textarea, input[type='text']"), _button = _$.find("button.btn-primary");
					
					_targets.each(function() { /* <!-- Iterate through all the field parts --> */
						var __$ = $(this), __name = __$.data("output-name");
						if (__name && _values[__name]) {
							_$.find(`*[data-value='${_values[__name]}']`).closest(".btn").addClass("active").find(".md-inactive").removeClass("md-inactive");/* <!-- Highlight Active Button --> */
							value(__$, _values[__name]);
						}
					});
										
					if (_values.Items && _text.length == 1 && _button.length == 1) _.each(_.isArray(_values.Items) ? _values.Items : [_values.Items], item => {
						if (item.Value) _text.val(item.Value)	&& _button.click(); /* <!-- Iterate through all the Items --> */						
					});
					
				}

			});
			
			return form;
		}

	};
	/* <!-- Data Functions --> */

	/* <!-- Action Functions --> */
	var _actions = {

		scales: () => ({
			name: "Scale",
			desc: "Create Scale",
			command: "scale",
			options: [{
					name: "New ..."
				},
				{
					value: "uk_teachers",
					name: "UK Teachers' Standards"
				}
			]
		}),

		forms: () => ({
			name: "Form",
			desc: "Create Form",
			command: "form",
			options: [{
					name: "New ..."
				},
				{
					value: "report",
					name: "Reflective Report"
				}
			]
		}),

		reports: () => ({
			name: "Report",
			desc: "Create Report",
			command: "report",
			options: [{
				value: "report",
				name: "Reflective Report"
			}]
		}),

	};
	/* <!-- Action Functions --> */

	/* <!-- Create Functions --> */
	var _create = {

		display: (name, state, template) => {
			var _initial = template ? _forms.create(name, template) : _forms.get(name), _return = _initial.form;
			_template = _initial.template;
			if (_template) _template.__name = name;
			_return.target = ಠ_ಠ.container.empty();
			ಠ_ಠ.Display.state().enter(state).protect("a.jump").on("JUMP");
			return ಠ_ಠ.Fields().on(ಠ_ಠ.Display.template.show(_return));
		},

		parent: (id) => new Promise((resolve) => ಠ_ಠ.google.files.get(id, true).then(f => {
			ಠ_ಠ.google.folders.is(true)(f) ? resolve(f) : ಠ_ಠ.Flags.error(`Supplied ID is not a folder: ${id}`) && resolve();
		}).catch(e => {
			ಠ_ಠ.Flags.error(`Opening Google Drive Folder: ${id}`, e) && resolve();
		})),

		prompt: (actions, folder) => ಠ_ಠ.Display.action({
			id: "create_chooser",
			title: "Create with Reflect ...",
			instructions: ಠ_ಠ.Display.doc.get({
				name: "CREATE",
				content: folder ? folder : "Google Drive"
			}),
			actions: actions
		}).then(result => {
			ಠ_ಠ.Flags.log("Create Action Selected:", result);
			return result.action.command == "scale" ?
				_create.scale(result.option.value) :
				result.action.command == "form" ?
				Promise.resolve(_create.display("template", "opened-form")) :
				result.action.command == "report" ?
				_create.report(result.option.value) : null;
		}).catch(e => e ? ಠ_ಠ.Flags.error("Displaying Create Prompt", e) : ಠ_ಠ.Flags.log("Create Prompt Cancelled")),

		report: (name, loaded) => {

			/* <!-- Display Relevant Form --> */
			var form = _create.display(name.toLowerCase(), "opened-report", loaded);

			/* <!-- Handle Evidence Selection Buttons --> */
			form.find("button.g-picker, a.g-picker").off("click.picker").on("click.picker", _evidence.picker);
			form.find("button.g-file, a.g-file").off("click.file").on("click.file", _evidence.file);
			form.find("button.web, a.web").off("click.web").on("click.web", _evidence.web);
			form.find("button.paper, a.paper").off("click.paper").on("click.paper", _evidence.paper);

			/* <!-- Handle Populate Textual Fields from Google Doc --> */
			form.find("button[data-action='load-g-doc'], a[data-action='load-g-doc']").off("click.doc").on("click.doc", e => {
				new Promise((resolve, reject) => {
					ಠ_ಠ.google.pick( /* <!-- Open Google Document from Google Drive Picker --> */
						"Select a Reflect File to Open", false, true,
						() => new google.picker.DocsView(google.picker.ViewId.DOCUMENTS).setIncludeFolders(true).setParent("root"),
						file => file ? ಠ_ಠ.Flags.log("Google Drive Document Picked", file) && ಠ_ಠ.google.files.export(file.id, "text/plain")
						.then(download => new ಠ_ಠ.google.reader().promiseAsText(download).then(text => resolve(text))) : reject()
					);
				}).then(text => {
					var _$ = $("#" + $(e.target).data("target")).val(text);
					if (_$.is("textarea.resizable")) autosize.update(_$[0]);
				}).catch();
			});

			return form;

		},
		
		load: (form) => _create.report(form.__name, form)

	};
	/* <!-- Create Functions --> */

	/* <!-- Internal Functions --> */
	var _default = function() {

		/* <!-- Load the Initial Instructions --> */
		ಠ_ಠ.Recent.last(5).then((recent) => ಠ_ಠ.Display.doc.show({
			name: "README",
			content: recent && recent.length > 0 ? ಠ_ಠ.Display.template.get({
				template: "recent",
				recent: recent
			}) : "",
			target: ಠ_ಠ.container,
			clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
		})).catch((e) => ಠ_ಠ.Flags.error("Recent Items Failure", e ? e : "No Inner Error"));

	};

	var _clear = function(fn) {

    if (_form || _folder) {
		  _form = null;
		  _folder = null;
      ಠ_ಠ.Display.state().exit(["opened-form", "opened-report"]).protect("a.jump").off();
		  ಠ_ಠ.container.empty();
    }
		if (fn) fn();

	};

	var _prepare = function() {

		var _title = _template && _template.title ? _template.title : _template && _template.name ? _template.name : "Report",
			_date = new Date().toLocaleDateString();

		return {
			name: `${_title} [${_date}].reflect`,
			data: {
				form: _template,
				report: _data.dehydrate(_form)
			}
		};

	};

	var _process = function(loaded) {
		return ಠ_ಠ.google.reader().promiseAsText(loaded).then(report => {
			ಠ_ಠ.Flags.log(`Loaded Report File: ${report}`);
			report = JSON.parse(report);
			_form = _data.rehydrate(_create.load(report.form), report.report);
		});
	};
	
	/* <!-- TODO: Need to check type / format in process if route is from IMPORT - maybe need a further facading function? Maybe inference by properties? --> */
	
	var _load = function(file) {
		if (ಠ_ಠ.google.files.is(TYPE_REPORT)(file)) {
			_file = file;
			return ಠ_ಠ.google.download(file.id).then(_process);
		} else {
			ಠ_ಠ.Flags.error(`Supplied ID is not a recognised Reflect File Type: ${file.id}`);
			return Promise.reject();
		}
	};

	var _save = function(force) {

		var finish = ಠ_ಠ.Display.busy({
			target : $("body"),
			fn : true
		});

		var _toSave = _prepare(),
			saver = (thumbType, thumb) => {
				var _meta = {
						name: _toSave.name,
						parents: (_folder ? _folder.id : null),
						properties: {
							reflectForm: _toSave.data.form
						},
						contentHints: {
							thumbnail: {
								image: thumb,
								mimeType: thumbType
							}
						}
					},
					_data = JSON.stringify(_toSave.data),
					_mime = TYPE_REPORT;
				((!_file || force) ?
					ಠ_ಠ.google.upload(_meta, _data, _mime) :
					ಠ_ಠ.google.upload(_meta, _data, _mime, null, _file.id))
				.then(uploaded => {
						_file = uploaded;
						return ಠ_ಠ.Recent.add(uploaded.id, uploaded.name.replace(/.REFLECT$/i, ""), "#google,load." + uploaded.id).then(() => ಠ_ಠ.Flags.log("Saved:", uploaded));
					})
				.catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error"))
				.then(finish);
			};
	
		(html2canvas ?
			html2canvas($("form[role='form'][data-name]")[0], {logging : window.scrollTo(0, 0)}) :
			Promise.reject(new Error(`HTML2Canvas Object Evalulates to ${html2canvas}`)))
		.then(canvas => saver("image/png", canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/i, "").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")))
			.catch(e => {
				ಠ_ಠ.Flags.error("Screenshot Error", e ? e : "No Inner Error");
				saver();
			});

	};

	var _export = function() {
		var _toExport = _prepare();
		try {
			saveAs(new Blob([JSON.stringify(_toExport.data)], {
				type: "application/octet-stream"
			}), _toExport.name);
		} catch (e) {
			ಠ_ಠ.Flags.error("Report Export", e);
		}
	};
	/* <!-- Internal Functions --> */

	/* <!-- External Visibility --> */
	return {

		/* <!-- External Functions --> */
		initialise: function(container) {

			/* <!-- Get a reference to the Container --> */
			ಠ_ಠ = container;

			/* <!-- Set Container Reference to this --> */
			container.App = this;
			/* <!-- Set Container Reference to this --> */

			/* <!-- Return for Chaining --> */
			return this;

		},

		start: () => {
			if (!_forms) _forms = ಠ_ಠ.Forms();
		},

		route: command => {

			if (!command || command === false || command[0] === false || (/PUBLIC/i).test(command)) { /* <!-- Load the Public Instructions --> */

        /* <!-- Clear the existing state (in case of logouts) --> */
				if (command && command[1]) _clear();
        
				/* <!-- Don't use handlebar templates here as we may be routed from the controller, and it might not be loaded --> */
				if (!command || !_last || command[0] !== _last[0]) ಠ_ಠ.Display.doc.show({
					wrapper: "PUBLIC",
					name: "FEATURES",
					target: ಠ_ಠ.container,
					clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
				});

			} else if (command === true || (/AUTH/i).test(command)) { /* <!-- Load the Default Readme / Recent --> */

				_default();

			} else if ((/TUTORIALS/i).test(command)) {

				/* <!-- Load the Tutorials --> */
				ಠ_ಠ.Display.doc.show({
					name: "TUTORIALS",
					title: "Tutorials for Reflect ...",
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();
					
			} else if ((/INSTRUCTIONS/i).test(command)) {

				var show = (name, title) => ಠ_ಠ.Display.doc.show({
					name: name,
					title: title,
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();

				(/SAVE/i).test(command[1]) ?
					show("SAVE_INSTRUCTIONS", "How to save your Form ...") : /* <!-- Load the Save Form Instructions --> */
					(/SEND/i).test(command[1]) ?
					show("SEND_INSTRUCTIONS", "How to send your Form ...") : /* <!-- Load the Send Form Instructions --> */
					(/COMPLETE/i).test(command[1]) ?
					show("COMPLETE_INSTRUCTIONS", "How to complete your Form ...") : /* <!-- Load the Send Form Instructions --> */
					show("INSTRUCTIONS", "How to use Reflect ..."); /* <!-- Load the Generic Instructions --> */

			} else if ((/CREATE/i).test(command)) { /* <!-- Create a new Form / Template --> */

				if (!_.isArray(command) || command.length == 1) { /* <!-- We're creating a new Form or Report, but we don't know which yet - need to ask! --> */

					(_.isArray(command) && command.length > 1 && command[1].length > 0 ? /* <!-- We've likely arrived here from the Google Drive UI, so this is a folder ID --> */
						_create.parent(command[1]).then(folder => _create.prompt([_actions.scales(), _actions.forms(), _actions.reports()], folder)) :
						_create.prompt([_actions.scales(), _actions.forms(), _actions.reports()])).then(form => _form = form);

				} else if ((/REPORT/i).test(command[1])) { /* <!-- We're creating a new Report (e.g. Response to a Form) --> */

					((command.length > 2 && _forms.has(command[2].toLowerCase())) ?
						Promise.resolve(_create.report(command[2].toLowerCase())) :
						command.length > 2 ?
						_create.parent(command[2]).then(folder => _create.prompt([_actions.reports()], folder)) :
						_create.prompt([_actions.reports()])).then(form => _form = form);

				} else if ((/FORM/i).test(command[1])) { /* <!-- We're creating a new Form --> */

					((command.length > 2 && ((/FORM/i).test(command[2]) || (/TEMPLATE/i).test(command[2]))) ?
						Promise.resolve(_create.display("form", "opened-form")) :
						command.length > 2 ?
						_create.parent(command[2]).then(folder => _create.prompt([_actions.forms()], folder)) :
						_create.prompt([_actions.forms()])).then(form => _form = form);

				}

			} else if ((/LOAD/i).test(command) && command[1].length > 1) { /* <!-- We're loading an existing file, type is handled in load handler --> */

				ಠ_ಠ.google.files.get(command[1], true).then(_load).catch(e => {
					ಠ_ಠ.Flags.error(`Opening Google Drive File: ${command[1]}`, e);
					return ಠ_ಠ.Recent.remove(command[1]).then((id) => $("#" + id).remove());
				}).then(ಠ_ಠ.Display.busy(true));

			} else if ((/OPEN/i).test(command)) {/* <!-- We're loading an existing file, but from the Picker --> */

				new Promise((resolve, reject) => { /* <!-- Open Reflect File from Google Drive Picker --> */

					ಠ_ಠ.google.pick(
						"Select a Reflect File to Open", false, true,
						() => [new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes(_types.join(",")),
							new google.picker.DocsView(google.picker.ViewId.DOCS).setMimeTypes(_types.join(",")).setIncludeFolders(true).setParent("root")
						],
						file => file ? ಠ_ಠ.Flags.log("Google Drive Reflect File Picked", file) && resolve(file) : reject()
					);
				}).then(file => _load(file).then(ಠ_ಠ.Recent.add(file.id, file.name.replace(/.REFLECT$/i, ""), "#google,load." + file.id))
								.catch(e => ಠ_ಠ.Flags.error(`Loading File from Google Drive: ${file.id}`, e))
								.then(ಠ_ಠ.Display.busy(true)))
					.catch(e => ಠ_ಠ.Flags.error("Picking Google Drive File", e));

			} else if ((/IMPORT/i).test(command)) { /* <!-- We're importing from the FS, then passing to process --> */
								
				ಠ_ಠ.Display.files({
					id: "reflect_prompt_file",
					title: "Please import file ...",
					message: ಠ_ಠ.Display.doc.get("IMPORT"),
					action: "Import",
					single: true
				}).then(file => _file = _process(file))
					.catch(e => e ? ಠ_ಠ.Flags.error("Displaying File Upload Prompt", e) : ಠ_ಠ.Flags.log("File Upload Cancelled"));
				
			} else if ((/SAVE/i).test(command) && _form) {

				(/EXPORT/i).test(command[1]) ?
					$("#_cmd_Report_Export").click() :
					(/FORM/i).test(command[1]) ?
					$("#_cmd_Report_Save").click() :
					(/CLONE/i).test(command[1]) ?
					$("#_cmd_Report_Clone").click() : 
				_save();

			} else if ((/CLONE/i).test(command) && _form) { /* <!-- Force creation of a new file on save --> */

				_save(true);

			} else if ((/EXPORT/i).test(command) && _form) { /* <!-- Create and download a new saved file  --> */

				_export();

			} else if ((/SCALES/i).test(command)) { /* <!-- We're managing existing scales --> */

			} else if ((/CLOSE/i).test(command)) { /* <!-- Clear the existing state & Load Initial Instructions --> */

				_clear(_default);

			} else if ((/REMOVE/i).test(command)) {

				if (command[1].length > 1) ಠ_ಠ.Recent.remove(command[1]).then((id) => $("#" + id).remove());

			} else if ((/HELP/i).test(command)) { /* <!-- Request Help --> */

				ಠ_ಠ.Help.provide(ಠ_ಠ.Flags.dir());
				
			}

			/* <!-- Record the last command --> */
			_last = command;

		},

		/* <!-- Clear the existing state --> */
		clean: () => _clear()

	};

};