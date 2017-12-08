App = function() {
	"use strict";

	/* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

	/* <!-- Returns an instance of this if required --> */
	if (this && this._isF && this._isF(this.App)) {
		return new this.App().initialise(this);
	}

	/* <!-- Internal Constants --> */
	/* <!-- Internal Constants --> */

	/* <!-- Internal Variables --> */
	var ಠ_ಠ, _last, _forms, _field;
	/* <!-- Internal Variables --> */

	/* <!-- Internal Functions --> */
	var _pick = function() {

		return new Promise((resolve, reject) => {

			/* <!-- Open Sheet from Google Drive Picker --> */
			ಠ_ಠ.google.pick(
				"Select a File / Folder to Use", true, true,
				() => [new google.picker.DocsView(google.picker.ViewId.DOCS).setIncludeFolders(true).setSelectFolderEnabled(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
				(files) => files && files.length > 0 ? ಠ_ಠ.Flags.log("Google Drive Files Picked", files) && resolve(files) : reject()
			);

		});

	};

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
	
	var _clear = function() {
		
		ಠ_ಠ.Display.state().exit([]).protect("a.jump").off();
		ಠ_ಠ.container.empty();
		
	};
	/* <!-- Internal Functions --> */
	
	/* <!-- Internal Handlers --> */
	var evidence = {
		default: (e) => {
			e.preventDefault();
			return $(e.currentTarget).parents(".evidence-holder");
		},
		add : (o, list, check) => {
			
			if (check !== false) {
				var checks = list.find("input[type='checkbox']");
				if (checks && checks.length == 1 && !checks.prop("checked")) inputChange(checks.prop("checked", true));
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
		picker : (e) => {
			var _pickEvidence = (list) => {
				_pick()
					.then(files => (files && files.length > 0) ? _.each(files, (file, i) => evidence.add({
							id : file[google.picker.Document.ID],
							url : file[google.picker.Document.URL],
							details : file[google.picker.Document.NAME],
							type : list.find("button[data-default]").data("default"),
							icon_url : file[google.picker.Document.ICON_URL]
						}, list, i === 0)) : ಠ_ಠ.Flags.log("No Google Drive Files Picked"))
					.catch(e => e ? ಠ_ಠ.Flags.error("Picking Google Drive File", e) : ಠ_ಠ.Flags.log("Google Drive Picker Cancelled"));
			}, _list = evidence.default(e);

			if (typeof google === "undefined" || !google.picker) {
				/* <!-- NEEDS TO BE A BETTER, DECLARATIVE, way of doing this? --> */
				/* <!-- MAYBE THROUGH ROUTE CONTROL???? --> */
				ಠ_ಠ.Controller.load([{id: "__google", url : "https://www.google.com/jsapi", mode : "no-cors" }])
					.then(() => _pickEvidence(_list))
					.catch(e => ಠ_ಠ.Flags.error("Loading Google API", e));
			} else {
				_pickEvidence(_list);
			}
		},
		file : (e) => {
			var _list = evidence.default(e);
			ಠ_ಠ.Display.files({
				id: "reflect_prompt_file",
				title: "Please upload file/s ...",
				message: ಠ_ಠ.Display.doc.get({
					name: "FILE",
					content: "evidence",
				}),
				action: "Upload"
			}).then(files => {
				var _total = files.length, _current = 0;
				ಠ_ಠ.Display.busy({
					target: _list.closest("li"),
					class: "loader-small"
				});
				var _complete = function() {
					if (++_current == _total) ಠ_ಠ.Display.busy({
						target: _list.closest("li"),
						clear: true
					});
				}
				_.each(files, source => {
					ಠ_ಠ.google.upload({name: source.name}, source, source.type)
						.then(uploaded => ಠ_ಠ.google.files.get(uploaded.id).then(file => {
							evidence.add({
								id : file.id,
								url : file.webViewLink,
								details : file.name,
								type : _list.find("button[data-default]").data("default"),
								icon_url : file.iconLink
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
		web : (e) => {
			var _list = evidence.default(e);
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
				var _url = url.value ? url.value : url, _name = url.name ? url.name : "Web Link";
				evidence.add({
					url : _url.indexOf("://") > 0 ? _url : "http://" + _url,
					details : _name,
					type : _list.find("button[data-default]").data("default"),
					icon : "public"
				}, _list, true);
			}).catch(e => e ? ಠ_ಠ.Flags.error("Displaying URL Prompt", e) : ಠ_ಠ.Flags.log("URL Prompt Cancelled"));
		},
		paper : (e) => {
			var _list = evidence.default(e);
			evidence.add({
				details : "Offline / Paper",
				type : _list.find("button[data-default]").data("default"),
				icon : "local_printshop"
			}, _list, true);
		},
	}
	/* <!-- Internal Handlers --> */

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

		route: function(command) {
			
			if (!command || command === false || command[0] === false || (/PUBLIC/i).test(command)) {

				/* <!-- Load the Public Instructions --> */
				/* <!-- Don't use handlebar templates here as we may be routed from the controller, and it might not be loaded --> */
				if (!command || !_last || command[0] !== _last[0]) ಠ_ಠ.Display.doc.show({
					wrapper: "PUBLIC",
					name: "FEATURES",
					target: ಠ_ಠ.container,
					clear: !ಠ_ಠ.container || ಠ_ಠ.container.children().length !== 0
				});

			} else if (command === true || (/AUTH/i).test(command)) {

				_default();

			} else if ((/CREATE/i).test(command)) {
				
				/* <!-- Create a new Form / Template --> */
				if (!_forms) _forms = ಠ_ಠ.Forms();
				if (command[1] && _forms.has(command[1].toLowerCase())) {
					
					var _form = _forms.get(command[1].toLowerCase());
					_form.target = ಠ_ಠ.container.empty();
					_form = ಠ_ಠ.Fields().on(ಠ_ಠ.Display.template.show(_form));

					/* <!-- Handle Evidence Selection Buttons --> */
					_form.find("button.g-picker, a.g-picker").off("click.picker").on("click.picker", evidence.picker);
					_form.find("button.g-file, a.g-file").off("click.file").on("click.file", evidence.file);
					_form.find("button.web, a.web").off("click.web").on("click.web", evidence.web);
					_form.find("button.paper, a.paper").off("click.paper").on("click.paper", evidence.paper);

				}
				
			} else if ((/OPEN/i).test(command)) {
				
			} else if ((/SAVE/i).test(command)) {

			} else if ((/CLOSE/i).test(command)) {
				
			} else if ((/INSTRUCTIONS/i).test(command)) {

				/* <!-- Load the Instructions --> */
				ಠ_ಠ.Display.doc.show({
					name: "INSTRUCTIONS",
					title: "How to use Reflect ...",
					target: ಠ_ಠ.container,
					wrapper: "MODAL"
				}).modal();

			} else if ((/TEST/i).test(command)) {

				var __form = ಠ_ಠ.Display.template.show({
					template: (/TEMPLATE/i).test(command[1]) ? "template" : "report",
					target: ಠ_ಠ.container.empty(),
				});
				
			}

			/* <!-- Record the last command --> */
			_last = command;

		},

		/* <!-- Clear the existing state --> */
		clean: () => _clear()
		
	};

};