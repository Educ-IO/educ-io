App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const TYPE = "application/x.educ-io.survey",
    STATE_OPENED = "opened",
    STATE_CREATED_RECIPIENTS = "created-recipients",
    STATE_LOADED_TEMPLATE = "loaded-template",
    STATES = [STATE_OPENED, STATE_CREATED_RECIPIENTS, STATE_LOADED_TEMPLATE];
  const ID = "survey_split";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _pick = {

    survey: () => ಠ_ಠ.Main.pick("Select a Survey to Open",
      () => [new google.picker.DocsView().setMimeTypes(TYPE).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
      "Google Drive Merge Picked", TYPE),

    sheet: () => ಠ_ಠ.Main.pick("Select a Sheet to Open",
      () => [new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS).setIncludeFolders(true).setParent("root"), google.picker.ViewId.RECENTLY_PICKED],
      "Google Drive Sheet Picked", ಠ_ಠ.Google.files.natives()[1]),

  };

  var _loadSurvey = id => ಠ_ಠ.Google.files.download(id)
    .then(loaded => {
      ಠ_ಠ.Display.log("Loaded:", loaded);
      ಠ_ಠ.Display.state().enter(STATE_OPENED);
    });

  var _createSurvey = () => new Promise(resolve => {

    ಠ_ಠ.Display.template.show({
      template: "split",
      id: ID,
      columns: {
        recipients: {
          sizes: {
            md: 6,
            lg: 8
          },
          text: "Recipients",
          class: "hide-loaded-recipients",
          menu: $(".dropdown-menu[data-menu='Recipients']").html(),
          details: ಠ_ಠ.Display.doc.get("RECIPIENT_DETAILS"),
          panel: {
            class: "show-loaded-recipients"
          }
        },
        templates: {
          sizes: {
            md: 6,
            lg: 4
          },
          text: "Email Template",
          class: "hide-loaded-template",
          menu: $(".dropdown-menu[data-menu='Template']").html(),
          details: ಠ_ಠ.Display.doc.get("TEMPLATE_DETAILS"),
          panel: {
            class: "show-loaded-template",
            frame: true
          }
        },
      },
      target: ಠ_ಠ.container,
      clear: true,
    });

    resolve(ಠ_ಠ.Display.state().enter(STATE_OPENED));

  });
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
        name: "Survey",
        states: STATES,
        test: () => ಠ_ಠ.Display.state().in(STATE_OPENED),
        clear: () => {},
        route: (handled, command) => {

          if (handled) return;
          
          if ((/OPEN/i).test(command)) {

            if ((/OPEN/i).test(command[1]) && command[1]) {

              /* <!-- Load Existing Survey File --> */
              _loadSurvey(command[1]);

            } else {

              /* <!-- Pick Existing Survey File --> */
              _pick.survey().then(survey => {
                ಠ_ಠ.Flags.log("SURVEY:", survey);
                _loadSurvey(survey.id);
              }).catch(e => ಠ_ಠ.Flags.error("Picker Failure: ", e ? e : "No Inner Error"));

            }

          } else if ((/CREATE/i).test(command)) {

            _createSurvey();

          } else if ((/CLOSE/i).test(command)) {

            ಠ_ಠ.Router.clean(true);

          }

        }

      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false)

  };

};