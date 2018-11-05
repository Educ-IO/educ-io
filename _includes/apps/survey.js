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
        routes: {
          load: {
            options: {
              download: true
            },
            success: value => {
              ಠ_ಠ.Display.log("Loaded:", value.result);
              ಠ_ಠ.Display.state().enter(STATE_OPENED);
            },
          },
          open: {
            options: {
              title: "Select a Survey to Open",
              view: "DOCS",
              mime: TYPE,
              folders: true,
              all: true,
              recent: true,
              download: true
            },
            success: value => {
              ಠ_ಠ.Display.log("Opened:", value.result);
              ಠ_ಠ.Display.state().enter(STATE_OPENED);
            },
          },
          create: _createSurvey,
        },
        route: () => false,
        /* <!-- PARAMETERS: handled, command --> */
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false)

  };

};