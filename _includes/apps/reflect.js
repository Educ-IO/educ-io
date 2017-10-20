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

					var _picker = function(form) {
						form.find("button.g-picker, a.g-picker").off("click.picker").on("click.picker", function(event) {
							event.preventDefault();
							if (typeof google === "undefined" || !google.picker) {
								/* <!-- NEEDS TO BE A BETTER, DECLARATIVE, way of doing this? --> */
								/* <!-- MAYBE THROUGH ROUTE CONTROL???? --> */
								ಠ_ಠ.Controller.load([ { id: "__google", url : "https://www.google.com/jsapi", mode : "no-cors" },]).then(() => {window.location.hash = "#evidence.pick." + $(this).parents(".evidence-holder").attr("id");}).catch(e => {console.error(e);});
							} else {
								window.location.hash = "#evidence.pick." + $(this).parents(".evidence-holder").attr("id");
							}
						});

					};
					
					_picker(_form);
					
				}
				
			} else if ((/OPEN/i).test(command)) {
				
			} else if ((/EVIDENCE/i).test(command)) {
				
				if ((/PICK/i).test(command[1])) {
				
					/* <!-- Pick, then Handle the Selected File --> */
					_pick().then((f) => {
						
						if (command[2]) {
							
							var _target = $("#" + command[2]);
							
							var checks = _target.find("input[type='checkbox']");
							if (checks && checks.length == 1 && !checks.prop("checked")) inputChange(checks.prop("checked", true));
							
							for (var i = 0; i < f.length; i++) {

								/* <!-- Add new Item to List --> */
								$(ಠ_ಠ.Display.template.get({
									template : "list_item",
									id : f[i][google.picker.Document.ID],
									url : f[i][google.picker.Document.URL],
									details : f[i][google.picker.Document.NAME],
									type : _target.find("button[data-default]").data("default"),
									icon : f[i][google.picker.Document.ICON_URL],
									delete : "Remove",
									for: "",
								})).appendTo(_target.find(".list-data")).find("a.delete").click(
									function(e) {
										e.preventDefault();
										var _this = $(this).parent();
										if (_this.siblings(".list-item").length === 0) {
											_this.closest(".input-group").children("input[type='checkbox']").prop("checked", false);
										}
										_this.remove();
									}
								);
	
							}
						}
						
					}).catch((e) => console.log(e));
					
				}
				
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