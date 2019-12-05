Bookings = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
      id: "BOOKINGS",
      format: "Do MMM",
      delay: 100,
      background: {
        accept: "bg-success-light",
        reject: "bg-danger-light"
      }
    },
    EXTRACT = {
      time: /(?:^|\s)((0?[1-9]|1[012])([:.]?[0-5][0-9])?(\s?[ap]m)|([01]?[0-9]|2[0-3])([:.]?[0-5][0-9]))(?:[.!?]?)(?:\s|$)/i,
    },
    FN = {};
  /* <!-- Internal Constants --> */
  
  /* <!-- Scope Constants --> */
  const SCOPE_EVENTS = "https://www.googleapis.com/auth/calendar.events";
  /* <!-- Scope Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {}; /* <!-- State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.process = {

    mine: event => event.organizer && event.organizer.email == factory.me.email,

    me: (events, calendar) => _.chain(events)
                    .filter(FN.process.mine)
                    .each(options.functions.calendar.time)
                    .each(event => {
                      event.calendar = calendar;
                      event.properties = options.functions.calendar.properties(event);
                    })
                    .value(),

    period: date => date.hour() + (date.minute() / 60),

    periods: events => _.reduce(events, (memo, event) => {

      var _convert = value => value / 24 * 100,
        _from = factory.Dates.parse(event.start.dateTime),
        _until = factory.Dates.parse(event.end.dateTime),
        _start = FN.process.period(_from),
        _end = _until.date() > _from.date() ? 24 : FN.process.period(_until),
        _width = _convert(_end - _start);

      if (_width > 0) {

        /* <!-- Resize / Remove Previous Spacer --> */
        var _last = _convert(_start - memo[memo.length - 1].start);
        _last <= 0 ? memo.pop : memo[memo.length - 1].width = _last,
          memo[memo.length - 1].time = options.functions.calendar.times(memo[memo.length - 1].from, _from),
          memo[memo.length - 1].until = _from;

        /* <!-- Add Current Event --> */
        memo.push({
          title: event.summary || "",
          time: options.functions.calendar.times(_from, _until),
          organiser: event.organizer.displayName || event.organizer.email,
          width: _width
        });

        /* <!-- Add Spacer --> */
        if (_end < 100) memo.push({
          from: _until,
          start: _end,
          width: _convert(24 - _end),
        });

      }

      return memo;

    }, [{
      from: options.state.session.current,
      until: factory.Dates.parse(options.state.session.current).add(1, "day"),
      start: 0,
      width: 100,
    }]),

    available: periods => _.filter(periods, period => period.title === undefined),

  };

  FN.data = {

    resources: search => options.state.application.resources.safe()
      .then(resources => resources.find(search)),

    events: calendar => factory.Google.calendar.list(calendar, options.state.session.current.toDate(),
      factory.Dates.parse(options.state.session.current).add(1, "day").toDate()),

    book: (calendar, id) => data => {
      factory.Flags.log("Booking Data:", data);
      var _start = _.find(data, data => data.name == "from"),
          _end = _.find(data, data => data.name == "until"),
          _details = _.find(data, data => data.name == "details"),
          _event = {
            start: {
              dateTime: FN.check.date(_start.value).format(),
            },
            end: {
              dateTime: FN.check.date(_end.value).format(),
            },
            attendees: [
              {
               email: id,
               self: false,
               resource: true,
              },
            ],
          };
      if (_details && _details.value) _event.summary = _details.value;
      return factory.Google.calendar.events.create(calendar, _event);
    },
    
  };

  FN.render = {

    new: data => factory.Display.template.show({
      template: "book",
      id: options.id,
      title: "Resources",
      subtitle: options.state.session.current.format(options.format),
      resources: data,
      instructions: "book.create",
      clear: true,
      target: factory.container
    }),

    search: value => FN.data.resources(value)
      .then(data => factory.Display.template.show({
        template: "resources",
        resources: data,
        clear: true,
        target: factory.container.find("#resources")
      }))
      .then(FN.hookup.resources),

    events: name => (events, periods) => factory.Display.template.show({
      template: "events",
      name: name,
      events: events,
      periods: periods,
      clear: true,
      target: factory.container.find("#details")
    }),

    refresh: () => {

      /* <!-- Update Date --> */
      factory.container.find(`#${options.id} .subtitle`)
        .text(options.state.session.current.format(options.format));

      /* <!-- Call Last Updater Function --> */
      ರ‿ರ.last ? ರ‿ರ.last() : false;
    },
  };

  FN.action = {

    target: e => $(e.currentTarget || e.target),

    validate: form => {
      var _result = form[0].checkValidity() !== false;
      if (options.state.application.fields) _result = _.reduce(form.find("[data-validate='true']"),
        (result, el) => {
          var _result = options.state.application.fields.validate(el),
            _el = $(el);
          _el.siblings(`.${_result === false ? "invalid" : "valid"}-feedback`).addClass("d-flex");
          _el.siblings(`.${_result === false ? "valid" : "invalid"}-feedback`).removeClass("d-flex");
          return result === false ? result : _result;
        }, _result);
      form.toggleClass("was-validated", !_result);
      return _result;
    },
    
    create: form => Promise.resolve(FN.action.validate(form))
        .then(result => {
          factory.Flags.log("Booking Form Result:", result);
          if (!result) return;
          return ರ‿ರ.book(form.serializeArray())
            .then(result => result && result.htmlLink && 
                    options.functions.calendar.confirmed(result) !== null ?
                      options.state.application.notify.success("Resource Booked", factory.Display.doc.get({
                        name: "SUCCESSFUL_BOOK",
                        content: result.htmlLink
                      })) : result)
            .catch(e => options.state.application.notify.actions.error(e, 
                                                           "Booking Failed", "FAILED_BOOK"))
            .then(() => factory.App.delay(1000).then(() => ರ‿ರ.last(true)));
        })
        .then(factory.Main.busy("Booking")),
    
    book: e => {
      e.preventDefault();
      return factory.Main.authorise(SCOPE_EVENTS)
          .then(result => result === true ? 
                  FN.action.create($(e.currentTarget).parents("form")) : result);
    },

    resource: e => {
      e.preventDefault();
      var target = FN.action.target(e);
      target.parents(".list-group").find("a.resource-item.active").removeClass("active");
      target.addClass("active");
      var id = target.data("id"),
        name = target.data("name");
      factory.Flags.log("Selected Resource with ID:", id);

      /* <!-- Create Last Updater Function --> */
      ರ‿ರ.last = ((id, name) => silent => {
        var _renderer = FN.render.events(name);
        return FN.data.events(id)
          .then(data => {
            var _events = FN.process.me(data, id),
              _periods = FN.process.periods(data),
              _book = FN.hookup.book(FN.process.available(_periods));
            factory.Flags.log("Periods for the Day / Resource:", _periods);
            if (_events && _events.length > 0) factory.Flags.log("Loaded Events:", _events);
            return Promise.resolve(_renderer(_events, _periods))
              .then(FN.hookup.events)
              .then(_book);
          })
          .catch(e => factory.Flags.error("Events Retrieval Error", e))
          .then(silent ? true : factory.Main.busy("Checking Availability"));

      })(id, name);
      
      /* <!-- Create Booker Function --> */
      ರ‿ರ.book = FN.data.book(factory.me.email, id);

      ರ‿ರ.last();
    },

    search: searcher => e => searcher(FN.action.target(e).val()),

    check: checker => e => checker(FN.action.target(e)),

    valid: element => element
      .removeClass(options.background.reject)
      .addClass(options.background.accept)
      .data("valid", true),

    invalid: element => element
      .removeClass(options.background.accept)
      .addClass(options.background.reject)
      .data("valid", false),

    indeterminate: element => element
      .removeClass(`${options.background.accept} ${options.background.reject}`)
      .data("valid", null),
  };

  FN.check = {

    date: time => factory.Dates.parse(time, ["ha", "hh:mma", "HH:mm", "HH:mm:ss"]).set({
        "year": options.state.session.current.year(),
        "month": options.state.session.current.month(),
        "date": options.state.session.current.date(),
      }),
    
    extract: element => {

      var _val = element.val();
      if (!_val) return FN.action.indeterminate(element), false;

      var _time = _val.match(EXTRACT.time);
      if (!_time || _time.length === 0) return FN.action.indeterminate(element), false;

      return FN.check.date(_time[1]);

    },

    time: periods => input => {

      var _action = input.data("action"),
        _time = FN.check.extract(input);

      /* <!-- Verify this time is valid --> */
      if (!_time || !_time.isValid()) return;
      var _period = _.find(periods, period => _time.isBefore(period.until) &&
        _time.isSameOrAfter(period.from));

      /* <!-- Mark Input as Valid / Invalid --> */
      if (!_period) return FN.action.invalid(input),
        factory.Flags.log("No Available Period for:", _time), null;
      FN.action.valid(input);
      factory.Flags.log("Valid & Available Period:", _period);

      /* <!-- Get partner time (e.g. start or end) --> */
      var _partner = input.siblings(`input[data-action='${_action == "start" ? "end" : "start"}']`),
        _other = FN.check.extract(_partner);

      /* <!-- Verify partner time is valid (in the same period of availability) --> */
      if (!_other || !_other.isValid()) return;
      var _valid = _action == "start" ?
        _other.isAfter(_time) && _time.isSameOrBefore(_period.until) :
        _other.isBefore(_time) && _time.isSameOrAfter(_period.from);

      /* <!-- Mark Partner as Valid / Invalid --> */
      _valid ? FN.action.valid(_partner) : FN.action.invalid(_partner);

    },

  };

  FN.hookup = {

    book: periods => parent => _.tap(parent, parent => {
      parent.find("input.times")
        .off("input.times")
        .on("input.times",
          FN.action.check(_.debounce(FN.check.time(periods), options.delay)));
      parent.find("button.btn-primary").off("click.book").on("click.book", FN.action.book);
    }),

    resource: items => items.off("click.resource").on("click.resource", FN.action.resource),

    resources: parent => _.tap(parent, parent => FN.hookup.resource(parent.find("a.resource-item"))),

    search: parent => _.tap(parent, parent => parent.find("input.search")
      .off("input.search")
      .on("input.search", FN.action.search(_.debounce(FN.render.search, options.delay)))),

    /* <!-- Internal Functions --> */
    event: items => factory.Flags.log("Existing Booking Items:", items),

    events: parent => _.tap(parent, parent => FN.hookup.event(parent.find("div.existing-booking"))),

  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {
    
    new: () => FN.data.resources()
      .then(FN.render.new)
      .then(FN.hookup.resources)
      .then(FN.hookup.search),

    refresh: FN.render.refresh,

  };
  /* <!-- External Visibility --> */

};