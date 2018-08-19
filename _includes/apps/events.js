App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const _decodeValue = value => value.replace(/%2E/g, ".");
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, STATES = ["opened"];
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _loadEvent = (id, event) => ಠ_ಠ.Google.calendar.event(id, event);

  var _loadCalendar = id => ಠ_ಠ.Google.calendar.get(id);

  var _openCalendars = () => {

    var _busy = ಠ_ಠ.Display.busy({
      target: ಠ_ಠ.container,
      fn: true
    });

    return ಠ_ಠ.Google.calendars.list().then(calendars => {

      _busy();

      return ಠ_ಠ.Display.choose({
        id: "events_Calendars",
        title: "Please Choose a Calendar to Open ...",
        action: calendars && calendars.length > 0 ? "Open" : false,
        choices: _.map(calendars, calendar => ({
          id: calendar.id,
          name: calendar.summaryOverride ? calendar.summaryOverride : calendar.summary
        })),
        instructions: !calendars || calendars.length === 0 ? ಠ_ಠ.Display.doc.get("NO_CALENDARS") : ""
      }).then(option => {

        return option ? _loadCalendar(option.id) : Promise.resolve(false);

      }).catch(e => e ? ಠ_ಠ.Flags.error("Calendar Select:", e) : ಠ_ಠ.Flags.log("Team Drive Select Cancelled"));

    }).catch(e => ಠ_ಠ.Flags.error("Calendars Load Failure", e ? e : "No Inner Error"));

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

      /* <!-- Set Up the Default Router --> */
      this.route = ಠ_ಠ.Router.create({
        name: "Events",
        states: STATES,
        route: (handled, command) => {

          if (handled) return;
          var _finish;

          if ((/OPEN/i).test(command)) {

            ((/CALENDAR/i).test(command[1])) ?
            _openCalendars().then(calendar => ಠ_ಠ.Flags.log("Calendar:", calendar)): false;

          } else if ((/CALENDAR/i).test(command)) {

            var _calendar = command[2] ? _decodeValue(command[2]) : false,
              _event = command[3] ? _decodeValue(command[3]) : false;

            if ((/ITEM/i).test(command[1]) && _calendar && _event) {

              _finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                status: "Loading Event",
                fn: true
              });

              _loadEvent(_calendar, _event)
                .then(event => ಠ_ಠ.Flags.log("Event:", event))
                .then(_finish);

            } else if ((/CALENDAR/i).test(command[1]) && _calendar) {

              _finish = ಠ_ಠ.Display.busy({
                target: ಠ_ಠ.container,
                status: "Loading Calendar",
                fn: true
              });

              _loadCalendar(_calendar)
                .then(calendar => ಠ_ಠ.Flags.log("Calendar:", calendar))
                .then(_finish);

            }



          }
        },
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clear(false)

  };

};