App = function() {
  "use strict";

  /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

  /* <!-- Returns an instance of this if required --> */
  if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

  /* <!-- Internal Constants --> */
  const STATE_READY = "ready",
    STATE_CONFIG = "config",
    STATE_OPENED = "opened",
    STATE_DEFAULT = "default",
    STATE_LOADED = "loaded",
    STATE_MONTHLY = "monthly",
    STATE_WEEKLY = "weekly",
    STATE_DAILY = "daily",
    STATE_KANBAN = "kanban",
    STATE_ANALYSIS = "analysis",
    STATE_CALENDARS = "calendars",
    STATE_CLASSES = "classes",
    STATE_PREFERENCES = "preferences",
    STATES = [STATE_READY, STATE_CONFIG, STATE_OPENED, STATE_DEFAULT, STATE_LOADED,
      STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY,
      STATE_KANBAN, STATE_ANALYSIS, STATE_CALENDARS, STATE_CLASSES,
      STATE_PREFERENCES
    ],
    SOURCE = [STATE_DEFAULT, STATE_LOADED],
    DIARIES = [STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY],
    DISPLAY = [STATE_MONTHLY, STATE_WEEKLY, STATE_DAILY, STATE_KANBAN, STATE_ANALYSIS];
  const SCOPE_CALENDARS = "https://www.googleapis.com/auth/calendar.readonly",
    SCOPE_CLASSWORK = "https://www.googleapis.com/auth/classroom.coursework.students.readonly",
    SCOPE_COURSEWORK = "https://www.googleapis.com/auth/classroom.coursework.me.readonly";
  const ID = "diary",
        PREFERENCES = "edit_Preferences",
        MIME_TYPE = "application/x-educ-docket-item",
        FN = {},
        PROPERTIES = {
          DOCKET: "DATA"
        };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  var ಠ_ಠ, /* <!-- Context --> */
    ರ‿ರ = {},
    /* <!-- State --> */
    ಱ = {}; /* <!-- Persistant State --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */


  /* <-- Helper Functions --> */
  FN.helper = {

    picker: () => ({
              title: "Select a Docket Sheet to Open",
              view: "SPREADSHEETS",
              mime: ಠ_ಠ.Google.files.natives()[1],
              properties: PROPERTIES,
              all: true,
              recent: true,
              team: true,
            }),
              
    choose: {

      prompt: (name, map, list) => list()
        .catch(e => ಠ_ಠ.Flags.error(`${name} List`, e).negative())
        .then(ಠ_ಠ.Main.busy(`Loading ${name}s`))
        .then(options => options === false || options.length === 0 ||
          (options.length == 1 && options[0] === undefined) ? false : ಠ_ಠ.Display.choose({
            id: `choose_${name}`,
            title: `Please Choose a ${name} to Open ...`,
            action: options && options.length > 0 ? "Open" : false,
            choices: _.map(options, map),
            multiple: true
          })
          .catch(FN.helper.choose.error(name))
          .then(FN.helper.choose.result)),

      error: name => e => (e ?
        ಠ_ಠ.Flags.error(`${name} Select:`, e) :
        ಠ_ಠ.Flags.log(`${name} Select Cancelled`)).negative(),

      result: results => results ?
        _.isArray(results) ?
        results.length === 0 ?
        false : results : [results] : false,

    },

  };
  /* <-- Helper Functions --> */


  /* <-- Config Functions --> */
  FN.config = {

    name: "config.json",

    mime: "application/json",

    clear: () => ಠ_ಠ.Google.appData.search(FN.config.name, FN.config.mime)
      .then(results => Promise.all(_.map(results, result => ಠ_ಠ.Google.files.delete(result.id))))
      .then(result => result ? ರ‿ರ.config = false || ಠ_ಠ.Flags.log("Docket Config Deleted") : result),

    create: data => ಠ_ಠ.Google.appData.upload({
        name: FN.config.name
      }, JSON.stringify(ರ‿ರ.config = {
        data: data,
        calendar: false,
        classes: false
      }), FN.config.mime)
      .then(uploaded => {
        ಠ_ಠ.Flags.log(`Docket Config (${FN.config.name}) Saved`, uploaded);
        ರ‿ರ.id = uploaded.id;
        ಠ_ಠ.Display.state().enter(STATE_CONFIG);
        return uploaded;
      })
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error")),

    find: () => ಠ_ಠ.Google.appData.search(FN.config.name, FN.config.mime).then(results => {
      if (results && results.length == 1) {
        ಠ_ಠ.Flags.log(`Found Docket Config [${results[0].name} / ${results[0].id}]`);
        return results[0];
      } else {
        ಠ_ಠ.Flags.log("No Existing Docket Config");
        return false;
      }
    }).catch(e => ಠ_ಠ.Flags.error("Config Error", e ? e : "No Inner Error")),

    get: () => FN.config.find().then(result => result ? FN.config.load(result) : result),

    load: file => ಠ_ಠ.Google.files.download(file.id).then(loaded => {
      return ಠ_ಠ.Google.reader().promiseAsText(loaded).then(parsed => {
        ಠ_ಠ.Flags.log(`Loaded Docket Config [${file.name} / ${file.id}]: ${parsed}`);
        ರ‿ರ.id = file.id;
        ಠ_ಠ.Display.state().enter(STATE_CONFIG);
        return parsed;
      }).then(parsed => ರ‿ರ.config = JSON.parse(parsed));
    }),

    update: (id, config) => ಠ_ಠ.Google.appData.upload({
        name: FN.config.name
      }, JSON.stringify(ರ‿ರ.config = _.defaults(config, ರ‿ರ.config)), FN.config.mime, id)
      .then(uploaded => {
        ಠ_ಠ.Flags.log(`Docket Config (${FN.config.name}) Updated`, uploaded);
        return uploaded;
      })
      .catch(e => ಠ_ಠ.Flags.error("Upload Error", e ? e : "No Inner Error")),

    edit: () => ಠ_ಠ.Display.modal("config", {
        id: PREFERENCES,
        title: "Preferences",
        enter: true,
        state: {
          data: ರ‿ರ.config.data,
          view: ರ‿ರ.config.view,
          ghost: ರ‿ರ.config.ghost === false ? 0 : ರ‿ರ.config.ghost,
          zombie: ರ‿ರ.config.zombie === false ? 0 : ರ‿ರ.config.zombie,
          calendars: ರ‿ರ.config.calendars,
          classes: ರ‿ರ.config.classes,
        }
      }),
    
    field: field =>  $(`#${PREFERENCES} div[data-output-field='${field}']`),
    
    label: field => field.find("small.form-text").toggleClass("d-none", field.find("li").length === 0),
    
    remove: (field, id) => FN.config.label(FN.config.field(field).find(`li[data-id='${id}']`).remove()),
    
    add: (field, template, items) => {
      var _field = FN.config.field(field), _list = _field.children("ul");
      _.each(items, item => {
        if (_list.find(`li[data-id='${item.id}']`).length === 0)
          $(ಠ_ಠ.Display.template.get((_.extend({
            template: template
          }, item)))).appendTo(_list);
      });
      FN.config.label(_field);
    },
    
  };
  /* <-- Config Functions --> */


  /* <-- Option Functions --> */
  FN.options = {

    action: (force, state) => new Promise(resolve => {
      var _state = force || (force === undefined && !ಠ_ಠ.Display.state().in(state)) ?
        ಠ_ಠ.Display.state().enter(state) : ಠ_ಠ.Display.state().exit(state);
      resolve(_state.state().in(state));
    }),

    calendars: force => FN.options.action(force, STATE_CALENDARS),

    classes: force => FN.options.action(force, STATE_CLASSES),

    process: type => () => FN.options[type]()
      .then(result => (result ? FN[type].choose() : Promise.resolve(false))
        .then(results => _.tap(results, results => {
          var _config = {};
          results ? _config[type] = results : delete ರ‿ರ.config[type];
          FN.config.update(ರ‿ರ.id, _config);
        }))
        .then(results => FN.options[type](!!results).then(FN.action.refresh))),

  };
  /* <-- Option Functions --> */


  /* <-- Focus Functions --> */
  FN.focus = {

    date: () => ರ‿ರ.show || ರ‿ರ.today,

    from: () => ಠ_ಠ.Dates.parse(FN.focus.date()),

  };
  /* <-- Focus Functions --> */


  /* <-- Items Functions --> */
  FN.items = {

    get: target => (target.data("id") !== null && target.data("id") !== undefined) ?
      ರ‿ರ.db.get(target.data("id")) : false,

    hookup: container => {

      var _return = promise => promise;

      /* <!-- Ensure Links open new tabs --> */
      container.find("a:not([href^='#'])").attr("target", "_blank").attr("rel", "noopener");

      /* <!-- Enable Button Links --> */
      container.find(".input-group button").on("click.action", e => {
        var target = $(e.currentTarget);
        if (target.data("action")) {
          var parent = target.parents("div.item");
          _return(target.data("action") == "cancel" ?
            FN.items.cancel(parent) : target.data("action") == "delete" ?
            FN.items.delete(parent) : target.data("action") == "update" ?
            FN.items.update(parent) : target.data("action") == "move" ?
            FN.items.move(parent) : target.data("action") == "complete" ?
            FN.items.complete(parent) : target.data("action") == "edit" ?
            FN.interact.edit(parent) : Promise.reject());
        }
      });

      /* <!-- Enable Keyboard Shortcuts --> */
      container.find("div.edit textarea")
        .keydown(e => {
          var code = e.keyCode ? e.keyCode : e.which;
          if (code == 13 || code == 27) e.preventDefault(); /* <!-- Enter or Escape Pressed --> */
        })
        .keyup(e => {
          var code = e.keyCode ? e.keyCode : e.which;
          var _handle = target => {
            var parent = $(target).parents("div.item");
            parent.find("div.edit, div.display").toggleClass("d-none");
            parent.toggleClass("editable").toggleClass("editing")
              .attr("draggable", (i, attr) =>
                attr === undefined || attr === null || attr === false || attr === "false" ?
                "true" : "false");
            return parent;
          };
          if (code == 13) {
            /* <!-- Enter Pressed --> */
            e.preventDefault();
            _return(e.shiftKey ?
              FN.items.complete(_handle(e.currentTarget)) : FN.items.update(_handle(e.currentTarget)));
          } else if (code == 27) {
            /* <!-- Escape Pressed / Cancel Update --> */
            e.preventDefault();
            _return(FN.items.cancel(_handle(e.currentTarget)));
          }
        });

      /* <!-- Enable Item Editing --> */
      (container.is("div.item") ?
        container : container.find("div.item.editable, div.item.editing"))
      .off("click.item").on("click.item", e => {
        var _target = $(e.currentTarget),
          _clicked = $(e.target);
        _target.find("textarea.resizable").on("focus.autosize", e => autosize(e.currentTarget));
        !_clicked.is("input, textarea, a, span, a > i") ?
          e.shiftKey ? e.preventDefault() || FN.items.clear() || FN.items.complete(_target) :
          _target.find("div.edit, div.display").toggleClass("d-none") &&
          _target.toggleClass("editable").toggleClass("editing")
          .attr("draggable", (i, attr) =>
            attr === undefined || attr === null || attr === false || attr === "false" ?
            "true" : "false") : false;
        if (_target.find("div.edit").is(":visible")) {

          /* <!-- Focus Cursor on Text Area --> */
          _target.find("div.edit textarea").focus();

          /* <!-- Scroll to target if possible --> */
          if (Element.prototype.scrollIntoView && _target[0].scrollIntoView) {
            _target[0].scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });
          }

          if (_target.attr("draggable")) {

            var _movable = new Hammer(_target.find("div.edit")[0]);
            _movable.get("pan").set({
              direction: Hammer.DIRECTION_VERTICAL,
              threshold: _target.height() / 2
            });

            _movable.on("pan", e => {
              if (e.pointerType == "touch") {
                var _destination = $(document.elementFromPoint(e.center.x, e.center.y));
                _destination = _destination.is("div.item[draggable=true]") ? _destination : _destination.parents("div.item[draggable=true]");
                if (_destination && _destination.length == 1) {
                  var _source = $(e.target);
                  _source = _source.is("div.item") ? _source : _source.parents("div.item");
                  if (_source.parents(".group")[0] == _destination.parents(".group")[0]) _source.insertBefore(_destination);
                }
              }
            });

            _movable.on("panend", e => {
              var _source = $(e.target);
              _source = _source.is("div.item") ? _source : _source.parents("div.item");
              var _list = [];
              _source.parent().children("div.item[draggable=true]").each((i, el) => {
                var _el = $(el),
                  _item = ರ‿ರ.db.get(_el.data("id")),
                  _order = i + 1;
                _el.data("order", _order);
                if (_item && _item.ORDER != _order)(_item.ORDER = _order) && _list.push(_item);
              });
              /* <!-- Save List --> */
              if (_list.length > 0) ಠ_ಠ.Flags.log("LIST TO SAVE:", _list);
            });

          }
        }
      });

      /* <!-- Enable Tooltips --> */
      ಠ_ಠ.Display.tooltips(container.find("[data-toggle='tooltip']"), {
        container: "body"
      });

    },

    busy: (target, item) => (clear => () => {
      if (clear && _.isFunction(clear)) clear();
      if (target && item) {
        var _new = $(ಠ_ಠ.Display.template.get(_.extend({
          template: "item",
          editable: true
        }, item)));
        target.replaceWith(_new);
        FN.items.hookup(_new);
      }
    })(ಠ_ಠ.Display.busy({
      target: target,
      class: "loader-small float-right",
      fn: true
    })),

    move: target => {
      var _item = FN.items.get(target),
        _input = target.find("input.dt-picker");
      _input.on("change", e => {
        var _finish = FN.items.busy(target, _item);

        /* <!-- Update Date --> */
        _item.FROM = new ಠ_ಠ.Dates.parse($(e.target).val());

        /* <!-- Process Item, Reconcile UI then Update Database --> */
        ರ‿ರ.tasks.items.process(_item).then(item => {
            ರ‿ರ.db.update(item);
            return item;
          })
          .then(item => ರ‿ರ.tasks.items.update(item))
          .then(_finish)
          .then(() => FN.show.current(ಠ_ಠ.Dates.parse(ರ‿ರ.show || ರ‿ರ.today)))
          .catch(FN.items.errors.update);
      });
      _input.bootstrapMaterialDatePicker({
        format: "YYYY-MM-DD",
        cancelText: "Cancel",
        clearButton: false,
        nowButton: true,
        time: false,
        switchOnClick: true,
        triggerEvent: "dblclick"
      });

      _input.dblclick();

    },

    complete: target => {
      var _item = FN.items.get(target),
        _finish = FN.items.busy(target, _item);

      /* <!-- Update Item --> */
      _item._complete = !(_item._complete);
      _item.STATUS = _item._complete ? "COMPLETE" : "";
      _item.DONE = _item._complete ? ಠ_ಠ.Dates.now() : "";

      /* <!-- Process Item, Reconcile UI then Update Database --> */
      return ರ‿ರ.tasks.items.process(_item).then(item => {
          ರ‿ರ.db.update(item);
          var _content = target.find("div.display p");
          item._complete ? _content.wrap($("<del />", {
            class: "text-muted"
          })) : _content.unwrap("del");
          return item;
        })
        .then(item => ರ‿ರ.tasks.items.update(item))
        .catch(FN.items.errors.update)
        .then(_finish);

    },

    update: target => {
      var _item = FN.items.get(target);

      /* <!-- Update Item --> */
      _item.DETAILS = target.find("div.edit textarea").val();
      _item.DISPLAY = ಱ.showdown.makeHtml(_item.DETAILS);

      /* <!-- Process Item, Reconcile UI then Update Database --> */
      return ರ‿ರ.tasks.items.process(_item)
        .then(item => {
          ರ‿ರ.db.update(item);
          target.find("div.display p").html(item.DISPLAY);
          return item;
        })
        .then(item => ರ‿ರ.tasks.items.update(item))
        .then(FN.items.busy(target, _item))
        .catch(FN.items.errors.update);
    },

    delete: target => {

      var _item = FN.items.get(target),
        _finish;

      return ಠ_ಠ.Display.confirm({
          id: "delete_Item",
          target: ಠ_ಠ.container,
          message: `Please confirm that you wish to delete this item: ${_item.DISPLAY}`,
          action: "Delete"
        })
        .then(confirm => {
          if (!confirm) return Promise.resolve(false); /* <!-- No confirmation, so don't proceed --> */

          _finish = FN.items.busy(target, _item);

          /* <!-- Update Database --> */
          return ರ‿ರ.tasks.items.delete(_item).then(() => {
            /* <!-- Reconcile UI --> */
            target.remove();
            ರ‿ರ.db.remove(_item);
            return true;
          });
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Delete Error", e) : ಠ_ಠ.Flags.log("Delete Cancelled"))
        .then(() => _finish ? _finish() : false);
    },

    cancel: target => {

      /* <!-- Reconcile UI --> */
      target.find("div.edit textarea").val(FN.items.get(target).DETAILS);
      return Promise.resolve();
    },

    clear: () => {

      var s = window.getSelection ? window.getSelection() : document.selection;
      s ? s.removeAllRanges ? s.removeAllRanges() : s.empty ? s.empty() : false : false;

    },

    errors: {

      update: e => ಠ_ಠ.Flags.error("Update Error", e) && ಠ_ಠ.Display.alert({
        type: "danger",
        headline: "Update Failed",
        details: ಠ_ಠ.Display.doc.get("FAILED_UPDATE"),
        scroll: true
      }),

    },

  };
  /* <-- Items Functions --> */


  /* <-- Interact Functions --> */
  FN.interact = {

    edit: target => {

      if (!target) return;

      var _item = FN.items.get(target),
        _tags = _item.TAGS,
        _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
        _template = "tag",
        _id = "tag";

      var _reconcile = target => {
        var _new = $(ಠ_ಠ.Display.template.get({
          template: "tags",
          tags: _item.TAGS,
          badges: _item.BADGES
        }));
        target.empty().append(_new);
        return target;
      };

      var _handleRemove = target => target.find("span.badge a").on("click.remove", e => {
        e.preventDefault();
        var _target = $(e.currentTarget),
          _tag = _target.parents("span.badge").data("tag");
        if (_tag) {
          _item.TAGS = (_item.BADGES = _.filter(
            _item.BADGES, badge => badge != _tag
          )).sort().join(";");
          _handleRemove(_reconcile(_target.parents("form")));
        }
      });

      return ಠ_ಠ.Display.modal(_template, {
          target: ಠ_ಠ.container,
          id: _id,
          title: "Edit Tags",
          instructions: ಠ_ಠ.Display.doc.get("TAG_INSTRUCTIONS"),
          validate: values => values ? ಠ_ಠ.Flags.log("Values for Validation", values) && true : false,
          /* <!-- Do we need to validate? --> */
          handlers: {
            clear: _dialog.handlers.clear,
          },
          tags: _item.TAGS,
          badges: _item.BADGES,
          all: ರ‿ರ.tasks.badges(ರ‿ರ.db)
        }, dialog => {

          /* <!-- General Handlers --> */
          ಠ_ಠ.Fields().on(dialog);

          /* <!-- Handle CTRL Enter to Save --> */
          _dialog.handlers.keyboard.enter(dialog);

          /* <!-- Handle Click to Remove --> */
          _handleRemove(dialog);

          /* <!-- Handle Click to Add --> */
          dialog.find("li button").on("click.add", e => {
            e.preventDefault();
            var _input = $(e.currentTarget).parents("li").find("span[data-type='tag'], input[data-type='tag']");
            var _val = _input.val() || _input.text();
            if (_input.is("input")) _input.val("") && _input.focus();
            if (_val && (_item.BADGES ? _item.BADGES : _item.BADGES = []).indexOf(_val) < 0) {
              _item.BADGES.push(_val);
              _item.TAGS = _item.BADGES.sort().join(";");
              _handleRemove(_reconcile(dialog.find("form")));
            }
          });

          /* <!-- Handle Enter on textbox to Add --> */
          dialog.find("li input[data-type='tag']")
            .keypress(e => ((e.keyCode ? e.keyCode : e.which) == 13) ? e.preventDefault() || $(e.currentTarget).siblings("button[data-action='add']").click() : null).focus();

        })
        .then(values => {
          if (values) {
            /* <!-- Apply the Update --> */
            var _finish = FN.items.busy(target, _item);
            /* <!-- Process Item, Reconcile UI then Update Database --> */
            return ರ‿ರ.tasks.items.process(_item).then(item => {
                ರ‿ರ.db.update(item);
                return item;
              })
              .then(item => ರ‿ರ.tasks.items.update(item))
              .catch(FN.items.errors.update)
              .then(_finish);
          } else {
            /* <!-- Cancel the Update --> */
            _item.TAGS = _tags;
            return ರ‿ರ.tasks.items.process(_item);
          }
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Edit Tags Error", e) : ಠ_ಠ.Flags.log("Edit Tags Cancelled"));

    },

    detag: (target, tag) => ಠ_ಠ.Display.confirm({
        id: "remove_Tag",
        target: ಠ_ಠ.container,
        message: ಠ_ಠ.Display.doc.get({
          name: "CONFIRM_DETAG",
          content: tag
        }),
        action: "Remove"
      })
      .then(confirm => {
        if (!confirm) return Promise.resolve(false); /* <!-- No confirmation, so don't proceed --> */
        var _item = FN.items.get(target),
          _finish = FN.items.busy(target, _item);

        /* <!-- Update Item --> */
        _item.TAGS = (_item.BADGES = _.filter(_item.BADGES, badge => badge != tag)).join(";");

        /* <!-- Process Item, Reconcile UI then Update Database --> */
        return ರ‿ರ.tasks.items.process(_item).then(item => {
            ರ‿ರ.db.update(item);
            target.find(`span.badge a:contains('${tag}')`).filter(function() {
              return $(this).text() == tag;
            }).parents("span.badge").remove();
            return item;
          })
          .then(item => ರ‿ರ.tasks.items.update(item))
          .catch(FN.items.errors.update)
          .then(_finish);
      })
      .catch(e => e)


  };
  /* <-- Interact Functions --> */


  /* <-- Drag Functions --> */
  FN.drag = {

    decode: (e, destination) => {

      e.preventDefault();

      var _id = e.originalEvent.dataTransfer.getData(MIME_TYPE),
        _source = FN.drag.get(_id),
        _destination = $(e.currentTarget);

      return {
        id: _id,
        source: _source,
        destination: _destination.is(destination) ? _destination : _destination.parents(destination)
      };

    },

    get: data => !data || data.indexOf("item_") !== 0 ? false : $(`#${data}`),

    insert: (e, decoded, selectors) => {

      /* <!-- Stop any further event triggering, as we are handling! --> */
      e.stopPropagation();

      (decoded.destination.is(selectors.item) ?
        decoded.source.insertBefore(decoded.destination) :
        decoded.destination.find(selectors.item).length > 0 ?
        decoded.source.insertBefore(decoded.destination.find(selectors.item).first()) :
        decoded.source.insertAfter(decoded.destination.find(".divider")))
      .addClass("bg-bright").delay(1000).queue(function() {
        $(this).removeClass("bg-bright").dequeue();
      });

      var _list = [],
        _check = item => {
          var __hash = ರ‿ರ.tasks.hash(item);
          ಠ_ಠ.Flags.log(`Checking E:${item.__hash} and N:${__hash}`, item);
          if (item.__hash != __hash) _list.push(item);
        };

      /* <!-- A timed item won't be droppable, so check on it's own --> */
      if (decoded.item._timed) _check(decoded.item);

      /* <!-- Check droppable elements for ordering --> */
      _.each(decoded.source.parent().children(selectors.item), (el, i) => {
        var _el = $(el),
          _item = ರ‿ರ.db.get(_el.data("id"));
        _el.data("order", _item.ORDER = i + 1);
        _check(_item);
      });

      /* <!-- Save List --> */
      if (_list.length > 0) {
        ಠ_ಠ.Flags.log("LIST TO UPDATE:", _list);
        _.each(_list, item => ರ‿ರ.tasks.items.update(item).then(r => (r === false) ? ಠ_ಠ.Flags.error("Update Item Failed", item) : true));
      }

    },

    items: (items, selectors) => {

      FN.drag.clear = FN.drag.clear || _.debounce(items => items.removeClass("drop-target"), 100);

      items.draggable

        .on("dragstart.draggable", e => {
          $(e.currentTarget).addClass("not-drop-target")
            .parents([selectors.item, selectors.group].join(",")).addClass("not-drop-target");
          e.originalEvent.dataTransfer.setData(MIME_TYPE, e.currentTarget.id);
          e.originalEvent.dataTransfer.dropEffect = "move";
        });


      items.droppable

        .on("dragend.droppable", () => {
          $(".drop-target, .not-drop-target").removeClass("drop-target not-drop-target");
        })

        .on("dragenter.droppable", e => {

          var decode = FN.drag.decode(e, [selectors.item, selectors.group].join(","));

          if (!decode.destination.hasClass("drop-target")) {
            FN.drag.clear($(".drop-target").not(decode.destination));
            decode.destination.addClass("drop-target");
          }

        })
        .on("dragover.droppable", e => {

          if (e.currentTarget.dataset.droppable) {
            e.preventDefault();
            e.originalEvent.dataTransfer.dropEffect = "move";
          }

        })
        .on("drop.droppable", e => {

          var decode = FN.drag.decode(e, [selectors.item, selectors.group].join(","));

          if (decode.source && decode.id != decode.destination.id) {

            decode.group = {
              source: decode.source.parents(selectors.group),
              destination: decode.destination.is(selectors.group) ?
                decode.destination : decode.destination.parents(selectors.group)
            };

            decode.item = ರ‿ರ.db.get(decode.source.data("id"));

            if (decode.group.source[0] != decode.group.destination[0]) {

              /* <!-- Different Group / Day --> */
              decode.date = {
                source: ಠ_ಠ.Dates.parse(decode.group.source.data("date")),
                destination: ಠ_ಠ.Dates.parse(decode.group.destination.data("date"))
              };
              ಠ_ಠ.Flags.log("DRAG DESTINATION DATE:", decode.date);

              if (decode.item._timed) {

                /* <!-- Moving a timed item forwards/backwards --> */
                decode.item.FROM = decode.date.destination;
                if (decode.item._complete && decode.item.DONE.clone().startOf("day").isAfter(decode.date.destination))
                  decode.item.DONE = decode.date.destination;

                ಠ_ಠ.Flags.log("TIMED ITEM DRAGGED:", decode.item);
                FN.drag.insert(e, decode, selectors);

              } else if (!decode.item._complete && decode.date.destination.isSameOrAfter(ಠ_ಠ.Dates.now().startOf("day"))) {

                /* <!-- Moving an incomplete item to today or future --> */
                decode.item.FROM = decode.date.destination;

                ಠ_ಠ.Flags.log("INCOMPLETE ITEM DRAGGED TO PRESENT/FUTURE:", decode.item);
                FN.drag.insert(e, decode, selectors);

              }

            } else if (decode.source[0] != decode.destination[0]) {

              /* <!-- Not Dropped on itself --> */
              ಠ_ಠ.Flags.log("RE-ORDERING ITEM", decode.item);
              FN.drag.insert(e, decode, selectors);

            }


          }
        });

    },

  };
  /* <-- Drag Functions --> */


  /* <-- Display Functions --> */
  FN.display = {

    /* <!-- Internal Methods --> */
    prepare: list => _.each(list, item => {
      !item.DISPLAY && item.DETAILS ? item.DISPLAY = ಱ.showdown.makeHtml(item.DETAILS) : false;
      item._action = ((item._complete && item.DONE) ?
        item.DONE : (item._timed || item.FROM.isAfter(ರ‿ರ.today)) ?
        item.FROM : ಠ_ಠ.Dates.parse(ರ‿ರ.today)).format("YYYY-MM-DD");
      item.__hash = ರ‿ರ.tasks.hash(item);
    }),
    /* <!-- Internal Methods --> */

    actions: () => ({
      list: [{
        action: "new.task",
        icon: "add"
      }, {
        action: "search",
        icon: "search"
      }, {
        action: "jump",
        icon: "fast_forward"
      }, {
        action: "jump.today",
        icon: "today"
      }],
      icon: "edit"
    }),

    list: (list, subtitle, analysis) => ಠ_ಠ.Display.modal("list", {
      target: ಠ_ಠ.container,
      id: `${ID}_list`,
      title: `${list.length} Docket Item${list.length > 1 ? "s" : ""}`,
      subtitle: subtitle,
      items: _.sortBy(FN.display.prepare(list), "FROM"),
      statistics: analysis ? ಠ_ಠ.Display.template.get(_.extend({
        template: "statistics"
      }, analysis)) : null
    }, dialog => {
      /* <!-- Ensure Links open new tabs --> */
      dialog.find("a:not([href^='#'])").attr("target", "_blank").attr("rel", "noopener");
    }).then(() => list),

    cleanup: () => {
      $("body").removeClass("modal-open");
      $("div.modal-backdrop.show").remove();
    },

    tagged: tag => tag.indexOf("#") === 0 ?
      FN.display.list(ರ‿ರ.tasks.tagged(tag, ರ‿ರ.db), `Tasks for Project: ${tag.replace("#","")}`,
        ರ‿ರ.tasks.analysis(tag, ರ‿ರ.db)) : FN.display.list(ರ‿ರ.tasks.tagged(tag, ರ‿ರ.db), `Tasks tagged with: ${tag}`),

    scroll: (target, container) => {

      /* <!-- Scroll to today if visible --> */
      if (Element.prototype.scrollIntoView && !ಠ_ಠ.Flags.debug()) {
        target = _.isString(target) ? container.find(target) : target;
        target = target.length > 0 ? target : container;
        if (target[0].scrollIntoView) {
          target[0].scrollIntoView({
            block: "start",
            inline: "nearest"
          });
          if (window.scrollBy && container.outerHeight(true) > $(window).height()) window.scrollBy(0, -10);
        }
      }
    },

    hookup: container => {

      /* <!-- Hookup all relevant events --> */
      FN.items.hookup(container);

      /* <!-- Item Drag / Drop --> */
      FN.drag.items({
        draggable: container.find("div.item[draggable=true]"),
        droppable: container.find("div.item[data-droppable=true], div.group[data-droppable=true]")
      }, {
        item: "div.item[data-droppable=true]",
        group: "div.group[data-droppable=true]",
      });

      return container;

    },

    day: (focus, overlay) => {

      var _return = {};
      _return.diff = focus.diff(ರ‿ರ.show, "days");
      _return.display = focus.format("YYYY-MM-DD");
      _return.start = focus.clone().startOf("day");
      _return.end = focus.clone().endOf("day");
      _return.all = FN.display.prepare(ರ‿ರ.db ?
        ರ‿ರ.tasks.query(focus, ರ‿ರ.db, focus.isSame(ರ‿ರ.today)) : []);
      _return.tasks = _.chain(_return.all).filter(item => !item._timed)
        .sortBy("DETAILS").sortBy("GHOST").sortBy("ORDER").sortBy("_countdown").value();
      _return.events = _.chain(_return.all).filter(item => item._timed)
        .sortBy(item => ಠ_ಠ.Dates.parse(item.TIME, ["h:m a", "H:m", "h:hh A"]).toDate()).value();
      _return.extras = _.chain(overlay)
        .filter(item => (item.due || item.end).isSameOrAfter(_return.start) &&
          (item.due || item.start).isSameOrBefore(_return.end))
        .sortBy(item => (item.due || item.start).toDate())
        .value();

      _return.length = _.reduce([_return.tasks, _return.events, _return.extras], (total, items) => total + (items ? items.length : 0), 0);

      return _return;

    }

  };
  /* <-- Display Functions --> */


  /* <-- Show Functions --> */
  FN.show = {

    current: focus => FN.show.dated(focus, ಠ_ಠ.Display.state().in(STATE_MONTHLY) ?
      FN.show.monthly : ಠ_ಠ.Display.state().in(STATE_WEEKLY) ?
      FN.show.weekly : ಠ_ಠ.Display.state().in(STATE_DAILY) ?
      FN.show.daily : FN.show.weekly),

    dated: (focus, fn) => new Promise(resolve => {

      ರ‿ರ.show = focus.startOf("day").toDate();

      /* <!-- Just in case of open modals etc --> */
      FN.display.cleanup();

      var _start = focus.clone().subtract(1, "month").toDate(),
        _end = focus.clone().add(1, "month").toDate();

      (ಠ_ಠ.Display.state().in([STATE_CALENDARS, STATE_CLASSES], true) &&
        (ರ‿ರ.config.calendars || ರ‿ರ.config.classes) ?
        ಠ_ಠ.Main.authorise(SCOPE_CALENDARS)
        .then(result => result === true ? Promise.all(
            _.map([].concat(ರ‿ರ.config.calendars || [],
                _.filter(ರ‿ರ.config.classes || [], item => item.calendar)), item =>
              ಠ_ಠ.Google.calendar.list(item.calendar || item.id, _start, _end)
              .then(events => _.tap(events,
                events => _.each(events, event => event._title = `CALENDAR: ${item.name}`, events)))))
          .catch(e => ಠ_ಠ.Flags.error("Events Loading:", e).reflect([])) :
          false).then(ಠ_ಠ.Main.busy("Loading Events")) : Promise.resolve(false)).then(overlay => {

        /* <!-- Prepare Overlays --> */
        overlay = overlay && overlay.length > 0 ?
          _.each((overlay = _.flatten(overlay)), item => {
            if (item.start.dateTime) item._timed = true;
            item.start = ಠ_ಠ.Dates.parse(item.start.dateTime || item.start.date);
            item.end = ಠ_ಠ.Dates.parse(item.end.dateTime || item.end.date);
            if (item._timed) {
              item.TIME = `${item.start.format("HH:mm")} - ${item.end.format("HH:mm")}`;
            } else if (item.start.clone().add(1, "day").isSame(item.end)) {
              /* <!-- End Dates for non-timed Events are Exclusive --> */
              item.end = item.end.subtract(1, "day");
            }
            item.DISPLAY = ಱ.showdown.makeHtml(item.summary);
            item._link = item.htmlLink;
            item._icon = "calendar_today";
          }) : [];

        /* <!-- Filter Deadlines --> */
        if (ಠ_ಠ.Display.state().in(STATE_CLASSES) && ರ‿ರ.deadlines && ರ‿ರ.deadlines.length > 0)
          overlay = overlay.concat(_.filter(ರ‿ರ.deadlines,
            deadline => deadline.due.isSameOrAfter(_start) &&
            deadline.due.isSameOrBefore(_end)));

        resolve(fn(focus, overlay));

      });

    }),

    daily: (focus, overlay) => {

      var _data = FN.display.day(focus, overlay),
        _diary = FN.display.hookup(ಠ_ಠ.Display.template.show({
          template: "daily",
          id: ID,
          name: ರ‿ರ.name,
          title: _data.start.format("ddd"),
          day: _data.start.format("Do"),
          date: _data.start.toDate(),
          tasks: _data.tasks,
          events: _data.events,
          extras: _data.extras,
          action: FN.display.actions(),
          target: ಠ_ಠ.container,
          clear: true,
        }));

      FN.display.scroll(_diary.find("h4.name, div.day"), _diary);

    },

    weekly: (focus, overlay) => {

      focus = ಠ_ಠ.Dates.isoWeekday(focus) == 7 ? focus.subtract(1, "days") : focus;
      var _today = focus.isSame(ರ‿ರ.today);

      var _days = [],
        _add = (date, css, action, tasks, events, extras, type) => {
          _days.push({
            sizes: ಠ_ಠ.Dates.isoWeekday(date) >= 6 ? {
              xs: 12
            } : {
              lg: type.large ? 9 : type.small.before ? 3 : 6,
              xl: type.large ? 6 : type.small.before || type.small.after ? 3 : 4
            },
            row_sizes: ಠ_ಠ.Dates.isoWeekday(date) == 6 ? {
              lg: type.large ? 9 : type.small.before ? 3 : 6,
              xl: type.large ? 6 : type.small.before || type.small.after ? 3 : 4
            } : false,
            title: date.format("ddd"),
            date: date.toDate(),
            instruction: ಠ_ಠ.Dates.isoWeekday(date) == 6 ? "row-start" : ಠ_ಠ.Dates.isoWeekday(date) == 7 ? "row-end" : false,
            class: ಠ_ಠ.Dates.isoWeekday(date) >= 6 ? `p-0 ${css.block}` : css.block,
            action: action,
            title_class: css.title,
            wide: css.wide,
            tasks: tasks,
            events: events,
            extras: extras
          });
        };

      focus = focus.add(ಠ_ಠ.Dates.isoWeekday(focus) == 1 ? -3 : -2, "days");

      _.times(7, () => {

        focus = focus.add(1, "days");

        var _data = FN.display.day(focus, overlay),
          _day = ಠ_ಠ.Dates.isoWeekday(focus),
          _lg = _data.diff === 0 || (_day == 6 && _data.diff == -1) || (_day == 7 && _data.diff == 1),
          _sm_Before = !_lg && (_data.diff == -1 || (_day == 5 && _data.diff == -2) || (_day == 6 && _data.diff == -2)),
          _sm_After = !_lg && (_data.diff == 1 || (_day == 1 && _data.diff == 2)),
          _sizes = {
            large: _lg,
            small: {
              before: _sm_Before,
              after: _sm_After,
            }
          };

        _add(focus, {
          block: focus.isSame(ರ‿ರ.today) || (ಠ_ಠ.Dates.isoWeekday(focus) == 6 && focus.clone().add(1, "days").isSame(ರ‿ರ.today)) ?
            "present bg-highlight-gradient top-to-bottom" : _data.diff === 0 ?
            "focussed bg-light" : focus.isBefore(ರ‿ರ.today) ? "past text-muted" : "future",
          title: focus.isSame(ರ‿ರ.today) ?
            "present" : _data.diff === 0 ? "bg-bright-gradient left-to-right" : "",
          wide: _data.diff === 0
        }, _data.display, _data.tasks, _data.events, _data.extras, _sizes);

      });

      var _diary = FN.display.hookup(ಠ_ಠ.Display.template.show({
        template: "weekly",
        id: ID,
        name: ರ‿ರ.name,
        days: _days,
        action: FN.display.actions(),
        target: ಠ_ಠ.container,
        clear: true,
      }));

      /* <!-- Scroll to today if visible --> */
      FN.display.scroll(_diary.find(`h4.name, ${_today ? "div.present" : "div.focussed"}`), _diary);

    },

    monthly: (focus, overlay) => {

      var _today = focus.isSame(ರ‿ರ.today),
        _end = focus.clone().endOf("month");
      focus = focus.clone().startOf("month").subtract(1, "days");

      var _days = [],
        _add = (date, css, action, tasks, events, extras, large) => {
          _days.push({
            title: date.format("ddd"),
            subtitle: date.format("Do"),
            date: date.toDate(),
            class: css.block,
            action: action,
            title_class: css.title,
            tasks: tasks,
            events: events,
            extras: extras,
            large: large,
          });
        };

      _.times(_end.date(), index => {

        focus = focus.add(1, "days");

        var _data = FN.display.day(focus, overlay),
          _type = focus.isSame(ರ‿ರ.today) ? "present" : _data.diff === 0 ? "focussed" :
          focus.isBefore(ರ‿ರ.today) ? "past text-muted" : "future",
          _border = focus.isSame(ರ‿ರ.today) ?
          "border border-white rounded bg-highlight-gradient top-to-bottom" :
          index % 2 ? "bg-light" : "",
          _title = focus.isSame(ರ‿ರ.today) ?
          "present" : _data.diff === 0 ? "bg-bright-gradient left-to-right" :
          index % 2 ? "border-left border-bottom border-secondary" : "";

        _add(focus, {
            block: `${_type} ${_border}`.trim(),
            title: `${_title} pl-2`,
          }, _data.display, _data.tasks, _data.events, _data.extras,
          focus.isSame(ರ‿ರ.today) && _data.length > 5);

      });

      var _diary = FN.display.hookup(ಠ_ಠ.Display.template.show({
        template: "monthly",
        id: ID,
        name: ರ‿ರ.name,
        title: _end.format("MMM"),
        year: _end.format("YYYY"),
        days: _days,
        action: FN.display.actions(),
        target: ಠ_ಠ.container,
        clear: true,
      }));

      FN.display.scroll(_diary.find(`h4.name, ${_today ? "div.present" : "div.focussed"}`), _diary);

    },

    analysis: () => new Promise(resolve => {

      /* <!-- Just in case of open modals etc --> */
      FN.display.cleanup();

      ಠ_ಠ.Display.template.show({
        template: "analysis",
        id: "analysis",
        target: ಠ_ಠ.container,
        clear: true,
      });

      resolve(true);

    }),

    kanban: () => new Promise(resolve => {

      /* <!-- Just in case of open modals etc --> */
      FN.display.cleanup();

      var _status = ["Pending", "In Progress", "Done"];

      ಠ_ಠ.Display.template.show({
        template: "kanban",
        id: "kanban",
        sizes: {
          lg: 12 / _status.length,
        },
        status: _status,
        action: FN.display.actions(),
        target: ಠ_ಠ.container,
        clear: true,
      });

      resolve(true);

    }),

  };
  /* <-- Show Functions --> */


  /* <-- New Functions --> */
  FN.new = {

    item: type => {

      var _item, _error, _save, _retried = false;
      _error = () => ಠ_ಠ.Display.alert({
        type: "danger",
        headline: "Save Failed",
        details: _retried ? false : ಠ_ಠ.Display.doc.get("FAILED_SAVE"),
        action: _retried ? false : "Retry",
        scroll: true
      }).then(result => result === true ? (_retried = true) && _save(_item) : Promise.resolve(true));

      _save = item => ರ‿ರ.tasks.items.create(item).then(r => {
          if (r === false) return r;
          ರ‿ರ.db.update(r);
          return FN.show.current(ಠ_ಠ.Dates.parse(FN.focus.date()));
        })
        .catch(e => ಠ_ಠ.Flags.error("Create New Error", e) && !_retried && _error())
        .then(r => r === false ? _error() : Promise.resolve(true));

      var _dialog = ಠ_ಠ.Dialog({}, ಠ_ಠ),
        _template = "new",
        _id = "new";
      return ಠ_ಠ.Display.modal(_template, {
          target: ಠ_ಠ.container,
          id: _id,
          title: `Create New ${type}`,
          instructions: ಠ_ಠ.Display.doc.get("NEW_INSTRUCTIONS"),
          validate: values => values ? ಠ_ಠ.Flags.log("Values for Validation", values) && true : false,
          /* <!-- Do we need to validate? --> */
          date: ಠ_ಠ.Dates.parse(FN.focus.date()).format("YYYY-MM-DD"),
          handlers: {
            clear: _dialog.handlers.clear,
          },
          updates: {
            extract: _dialog.handlers.extract({
              time: ರ‿ರ.tasks.regexes.EXTRACT_TIME,
              date: ರ‿ರ.tasks.regexes.EXTRACT_DATE,
            })
          }
        }, dialog => {
          ಠ_ಠ.Fields().on(dialog);
          _dialog.handlers.keyboard.enter(dialog);
          dialog.find(`#${_id}_details`).focus();
        }).then(values => {
          if (!values) return false;
          ಠ_ಠ.Flags.log("Values for Creation", values);
          _item = {
            FROM: values.From ? values.From.Value : null,
            TAGS: values.Tags ? values.Tags.Value : null,
            DETAILS: values.Details ? values.Details.Value : null,
          };
          return ರ‿ರ.tasks.items.process(_item).then(item => _save(ರ‿ರ.db.insert(item)));
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Create New Error", e) : ಠ_ಠ.Flags.log("Create New Cancelled"));
    },

    task: () => FN.new.item("Task"),

  };
  /* <-- New Functions --> */


  /* <-- Find Functions --> */
  FN.find = {

    search: () => ಠ_ಠ.Display.text({
        message: ಠ_ಠ.Display.doc.get("SEARCH_INSTRUCTIONS"),
        action: "Search",
        simple: true,
      }).then(query => query ? FN.display.list(ರ‿ರ.tasks.search(query, ರ‿ರ.db, !ರ‿ರ.show ?
        ರ‿ರ.today : ರ‿ರ.show >= ರ‿ರ.today ?
        ರ‿ರ.show : false)) : false)
      .catch(e => e ? ಠ_ಠ.Flags.error("Search Error", e) : ಠ_ಠ.Flags.log("Search Cancelled"))

  };
  /* <-- Find Functions --> */


  /* <-- Action Functions --> */
  FN.action = {

    load: config => Promise.all([].concat(
        ರ‿ರ.tasks.open((config || ರ‿ರ.config).data, {
          zombie: ರ‿ರ.config.zombie,
          ghost: ರ‿ರ.config.ghost
        }),
        ರ‿ರ.config.classes ? FN.classes.load(ರ‿ರ.config.classes) : []))
      .then(results => {
        ಠ_ಠ.Display.state().change(SOURCE, [STATE_OPENED]
          .concat([!config || config.data == ರ‿ರ.config.data ? STATE_DEFAULT : STATE_LOADED]));
        ರ‿ರ.db = results[0];
        if (results[1]) ರ‿ರ.deadlines = results[1];
      })
      .then(ಠ_ಠ.Main.busy("Loading Data"))
      .then(() => ಠ_ಠ.Display.state().change(DISPLAY, DIARIES.indexOf(ರ‿ರ.config.view) >= 0 ?
                                             ರ‿ರ.config.view : STATE_WEEKLY))
      .then(() => FN.show.current(ಠ_ಠ.Dates.parse(FN.focus.date())))
      .catch(e => ಠ_ಠ.Flags.error("Data Error", e ? e : "No Inner Error").negative()),

    archive: () => {

      var _template = "archive",
        _id = "archive";
      return ಠ_ಠ.Display.modal(_template, {
          target: ಠ_ಠ.container,
          id: _id,
          title: "Archive Docket Items",
          instructions: ಠ_ಠ.Display.doc.get("ARCHIVE_INSTRUCTIONS"),
          years: ರ‿ರ.tasks.years(ರ‿ರ.db),
        })
        .then(values => {
          if (_.isEmpty(values)) return false;
          var _years = _.reduce(values.Archive.Values, (list, value, year) => (value === true) ?
                                list.concat([year]) : list, []);
          return Promise.all(_.map(_years, year => ರ‿ರ.tasks.archive(year, ರ‿ರ.db)))
            .then(items => {
              var _items = _.sortBy(_.compact(_.flatten(items, true)), "__ROW").reverse();
              if (!_items || _items.length === 0) return false;
              var _batches = _.reduce(_items, (groups, item, index, all) => {
                  (index === 0 || all[index - 1].__ROW == (item.__ROW + 1)) ?
                  groups[groups.length - 1].push(item):
                    groups.push([item]);
                  return groups;
                }, [
                  []
                ]),
                _results = [];

              var _complete = () => _.reduce(_batches, (promise, items) => {
                return promise
                  .then(() => ರ‿ರ.tasks.items.remove(items).then(result => _results.push(result)));
              }, Promise.resolve());

              return _complete().then(() => _results);

            })
            .then(ಠ_ಠ.Main.busy("Archiving Data"))
            .then(() => FN.action.load());
        })
        .catch(e => e ? ಠ_ಠ.Flags.error("Archive Error", e) : ಠ_ಠ.Flags.log("Archive Cancelled"));

    },

    jump: () => {

      var _id = "ctrl_Jump";
      ಠ_ಠ.container.find(`#${_id}`).remove();
      var _input = $("<input />", {
        id: _id,
        type: "hidden",
        class: "d-none dt-picker",
        value: ಠ_ಠ.Dates.parse(FN.focus.date()).format("YYYY-MM-DD")
      }).appendTo(ಠ_ಠ.container);

      _input.on("change", e => {
        var _date = new ಠ_ಠ.Dates.parse($(e.target).val());
        if (_date.isValid()) FN.show.current(_date);
      });

      _input.bootstrapMaterialDatePicker({
        format: "YYYY-MM-DD",
        cancelText: "Cancel",
        clearButton: false,
        cancelButton: true,
        nowButton: true,
        time: false,
        switchOnClick: true,
        triggerEvent: "dblclick"
      });

      _input.dblclick();
    },

    refresh: () => {

      /* <!-- Reset State to Today --> */
      ರ‿ರ.today = ಠ_ಠ.Dates.now().startOf("day").toDate();

      /* <-- Open and render data --> */
      return FN.action.load();

    },

    start: config => {

      /* <-- Remove old and unused config settings --> */
      delete config.calendar;
      _.each(config, (value, key) => value === false && (key !== "zombie" && key !== "ghost") ?
             delete config[key] : null);

      /* <-- Set States from Config --> */
      FN.options.calendars(!!config.calendars);
      FN.options.classes(!!config.classes);

      /* <-- Set Name from Config (if available) --> */
      config.name ? ರ‿ರ.name = config.name : delete ರ‿ರ.name;

      /* <-- Open and render data --> */
      return FN.action.load(config);

    }

  };
  /* <-- Action Functions --> */


  /* <-- Calendars Functions --> */
  FN.calendars = {

    choose: () => FN.helper.choose.prompt("Calendar", calendar => ({
      id: calendar.id,
      name: calendar.summaryOverride ? calendar.summaryOverride : calendar.summary
    }), ಠ_ಠ.Google.calendars.list),

  };
  /* <-- Calendars Functions --> */


  /* <-- Classes Functions --> */
  FN.classes = {

    load: classes => ಠ_ಠ.Main.authorise([].concat(
        _.filter(classes, course => course.teacher).length > 0 ? SCOPE_CLASSWORK : [],
        _.filter(classes, course => !course.teacher).length > 0 ? SCOPE_COURSEWORK : []))
      .then(result => result === true ?
        Promise.all(_.map(classes, course => ಠ_ಠ.Google.classrooms.work(course).list()
          .then(results => _.each(results, result => result ?
            result._title = `COURSE: ${course.name}` : null))))
        .then(_.flatten)
        .then(_.compact)
        .then(results => _.tap(results, results => _.each(results, result => {
          result.due = result.dueDate ? ಠ_ಠ.Dates.parse(new Date(
            result.dueDate.year,
            result.dueDate.month - 1,
            result.dueDate.day,
            result.dueTime ? result.dueTime.hours : 0,
            result.dueTime ? result.dueTime.minutes : 0,
            result.dueTime && result.dueTime.seconds ? result.dueTime.seconds : 0
          )) : ಠ_ಠ.Dates.now();
          if (result.dueTime) {
            result._timed = true;
            result.TIME = result.due.format("HH:mm");
          }
          result.DISPLAY = ಱ.showdown.makeHtml(result.title);
          result._link = result.alternateLink;
          result._icon = result.workType == "ASSIGNMENT" ?
            "assignment" : result.workType == "SHORT_ANSWER_QUESTION" ?
            "question_answer" : result.workType == "MULTIPLE_CHOICE_QUESTION" ?
            "assessment" : "class";

        })))
        .catch(e => ಠ_ಠ.Flags.error("Classroom Course Work List:", e).negative()) :
        Promise.resolve(false)),

    choose: () => FN.helper.choose.prompt("Course", course => ({
      id: course.id,
      name: course.section ? `${course.section} | ${course.name}` : course.name,
      calendar: course.calendarId,
      teacher: !!course.teacherFolder
    }), ಠ_ಠ.Google.classrooms.list),

  };
  /* <-- Classes Functions --> */


  /* <-- Create Functions --> */
  FN.create = {

    /* <-- Create new Config, and open/create DB --> */
    default: () =>

      /* <-- Clear any existing config --> */
      FN.config.clear()

      /* <-- Search for existing docket files owned by user --> */
      .then(() => ಠ_ಠ.Google.files.search(ಠ_ಠ.Google.files.natives()[1],
        `${_.keys(PROPERTIES)[0]}=${_.values(PROPERTIES)[0]}`, true))

      /* <-- Prompt User to use an existing file as their default docket database --> */
      .then(results => results && results.length > 0 ? ಠ_ಠ.Display.choose({
          id: "select_Database",
          title: "Use Existing Data Sheet?",
          instructions: ಠ_ಠ.Display.doc.get("EXISTING"),
          choices: _.map(results, r => ({
            value: r.id,
            name: `${r.name} | Last Modified: ${ಠ_ಠ.Dates.parse(r.modifiedByMeTime).fromNow()}`
          })),
          cancel: "Create New",
          action: "Select Existing",
        })
        .catch(e => (e ? ಠ_ಠ.Flags.error("Displaying Select Prompt", e) :
          ಠ_ಠ.Flags.log("Select Prompt Cancelled")).negative()) : false)

      /* <-- Return the File ID if selected, otherwise create new DB --> */
      .then(result => result ? result.value : ರ‿ರ.tasks.create())

      /* <-- Create/save new Config with the file ID --> */
      .then(FN.config.create)

      /* <-- Show / Then Close Busy Indication  --> */
      .then(ಠ_ಠ.Main.busy("Creating Config"))

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(() => FN.action.start(ರ‿ರ.config)),


    /* <-- Create new Config with existing file --> */
    existing: value => FN.config.create(value.id)

      /* <-- Show / Then Close Busy Indication --> */
      .then(ಠ_ಠ.Main.busy("Creating Config"))

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(() => FN.action.start(ರ‿ರ.config)),


    /* <-- Create new Shared Database --> */
    new: () => 
    
      /* <-- Prompt User for new file name --> */
      ಠ_ಠ.Display.text({
        id: "file_name",
        title: "File Name",
        message: ಠ_ಠ.Display.doc.get("FILE_NAME"),
        simple: true,
        state: {
          value: "Shared Docket Data"
        }
      })
    
      /* <-- Create new DB --> */
      .then(name => name ? ರ‿ರ.tasks.create(name)
            .then(ಠ_ಠ.Main.busy("Creating Database")) : false)

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(id => id ? FN.action.start(_.defaults({
        data: id
      }, ರ‿ರ.config)) : false)
    
      .catch(e => (e ? ಠ_ಠ.Flags.error("Displaying Text Prompt", e) :
          ಠ_ಠ.Flags.log("Text Prompt Cancelled")).negative())

  };
  /* <-- Create Functions --> */


  /* <-- Open Functions --> */
  FN.open = {

    /* <-- Open Default Configuration Database --> */
    default: value =>

      /* <-- Find existing config --> */
      FN.config.find()

      /* <-- Update Existing or Create New config --> */
      .then(config => config ?
        FN.config.update(config.id, {
          data: value.id
        }) : FN.config.create(value.id))

      /* <-- Show / Then Close Busy Indication  --> */
      .then(ಠ_ಠ.Main.busy("Loading Config"))

      /* <-- Start the main process of loading and displaying the data! --> */
      .then(() => FN.action.start(ರ‿ರ.config)),

    /* <-- Open Shared Database --> */
    shared: value => FN.action.start(_.defaults({
      data: value.id,
      name: value.name
    }, ರ‿ರ.config)),

  };
  /* <-- Open Functions --> */


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
        name: "Docket",
        state: ರ‿ರ,
        states: STATES,
        recent: false,
        simple: true,
        start: () => FN.config.get()
          .then(ಠ_ಠ.Main.busy("Loading Config"))
          .then(config => !config ?
            ಠ_ಠ.Router.run(STATE_READY) :
            FN.action.start(config)
            .then(result => result === false ?
              ಠ_ಠ.Router.run(STATE_CONFIG) : true)),
        routes: {

          /* <!-- Default Overrides --> */
          create: () => ಠ_ಠ.Display.state().in(STATE_CONFIG) ?
            FN.create.new() : FN.create.default(),

          open: {
            options: FN.helper.picker,
            success: value => ಠ_ಠ.Display.state().in(STATE_OPENED) ?
              FN.open.shared(value.result) : FN.create.existing(value.result),
          },

          close: {
            keys: ["c", "C"],
          },
          /* <!-- Default Overrides --> */


          /* <!-- Custom Routes --> */
          default: {
            matches: /DEFAULT/i,
            length: 0,
            state: STATE_CONFIG,
            fn: () => FN.action.start(ರ‿ರ.config),
          },

          jump: {
            matches: /JUMP/i,
            length: 0,
            keys: ["j", "J", "g", "G"],
            state: STATE_OPENED,
            fn: FN.action.jump,
            routes: {
              today: {
                matches: /TODAY/i,
                length: 0,
                keys: ["t", "T"],
                fn: () => FN.show.current(ಠ_ಠ.Dates.parse(ರ‿ರ.today)),
              },
              forward: {
                matches: /FORWARD/i,
                length: 0,
                keys: ">",
                actions: "swipeleft",
                fn: () => FN.show.current(FN.focus.from().add(1, ಠ_ಠ.Display.state().in(STATE_MONTHLY) ?
                  "months" : "weeks")),
                routes: {
                  day: {
                    matches: /DAY/i,
                    length: 0,
                    keys: ".",
                    fn: () => {
                      var _start = FN.focus.from();
                      FN.show.current(
                        _start.add(ಠ_ಠ.Display.state().in([STATE_MONTHLY, STATE_WEEKLY], true) &&
                          ಠ_ಠ.Dates.isoWeekday(_start) == 6 ? 2 : 1, "days"));
                    },
                  }
                }
              },
              backward: {
                matches: /BACKWARD/i,
                length: 0,
                keys: "<",
                actions: "swiperight",
                fn: () => FN.show.current(FN.focus.from().subtract(1, ಠ_ಠ.Display.state().in(STATE_MONTHLY) ?
                  "months" : "weeks")),
                routes: {
                  day: {
                    matches: /DAY/i,
                    length: 0,
                    keys: ",",
                    fn: () => {
                      var _start = FN.focus.from();
                      FN.show.current(
                        _start.subtract(ಠ_ಠ.Display.state().in([STATE_MONTHLY, STATE_WEEKLY], true) &&
                          ಠ_ಠ.Dates.isoWeekday(_start) == 7 ?
                          2 : 1, "days"));
                    },
                  }
                }
              },

            },
          },

          display: {
            matches: /DISPLAY/i,
            state: STATE_OPENED,
            routes: {
              daily: {
                matches: /DAILY/i,
                keys: ["d", "D"],
                fn: () => FN.show.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.show.daily)
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_DAILY))
              },
              weekly: {
                matches: /WEEKLY/i,
                keys: ["w", "W"],
                fn: () => FN.show.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.show.weekly)
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_WEEKLY))
              },
              monthly: {
                matches: /MONTHLY/i,
                keys: ["m", "M"],

                fn: () => FN.show.dated(ಠ_ಠ.Dates.parse(FN.focus.date()), FN.show.monthly)
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_MONTHLY))
              },
              analysis: {
                matches: /ANALYSIS/i,
                keys: ["a", "A"],
                fn: () => FN.show.analysis()
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_ANALYSIS))
              },
              kanban: {
                matches: /KANBAN/i,
                keys: ["k", "K"],
                fn: () => FN.show.kanban()
                  .then(() => ಠ_ಠ.Display.state().change(DISPLAY, STATE_KANBAN))
              },
            }
          },

          show: {
            matches: /SHOW/i,
            state: STATE_OPENED,
            routes: {
              classes: {
                matches: /CLASSES/i,
                fn: FN.options.process("classes")
              },
              calendars: {
                matches: /CALENDARS/i,
                fn: FN.options.process("calendars")
              },
            }
          },

          config: {
            matches: /CONFIG/i,
            routes: {
              
              clear: {
                matches: /CLEAR/i,
                fn: () => ಠ_ಠ.Display.confirm({
                    id: "clear_Config",
                    target: ಠ_ಠ.container,
                    message: ಠ_ಠ.Display.doc.get("CLEAR_CONFIGURATION"),
                    action: "Clear"
                  })
                  .then(confirm => confirm ?
                    ಠ_ಠ.Display.busy() && FN.config.clear() : false)
                  .then(cleared => cleared ?
                    ಠ_ಠ.Display.state().exit([STATE_CONFIG, STATE_OPENED]) && ಠ_ಠ.Router.run(STATE_READY) :
                        false)
                  .catch(e => e ?
                    ಠ_ಠ.Flags.error("Clear Config Error", e) : ಠ_ಠ.Flags.log("Clear Config Cancelled"))
              },
              
              show: {
                matches: /SHOW/i,
                fn: () => {
                  var _details = {};
                  FN.config.find()
                    .then(result => result ? FN.config.load(_details.file = result) : result)
                    .then(config => config ? _details.config = config : config)
                    .then(ಠ_ಠ.Main.busy("Loading Config"))
                    .then(config => config ? ಠ_ಠ.Display.inform({
                      id: "show_Config",
                      target: ಠ_ಠ.container,
                      code: _.escape(JSON.stringify(_details, null, 4))
                    }) : config);
                }
              },
              
              download: {
                matches: /DOWNLOAD/i,
                fn: () => {
                  FN.config.find()
                    .then(FN.config.load)
                    .then(ಠ_ಠ.Main.busy("Loading Config"))
                    .then(config => ಠ_ಠ.Saver({}, ಠ_ಠ)
                          .save(JSON.stringify(config, null, 2), "docket-config.json", "application/json"));
                }
              },
              
              edit: {
                matches: /EDIT/i,
                keys: ["p", "P"],
                fn: () => {
                  ಠ_ಠ.Display.state().enter(STATE_PREFERENCES);
                  return FN.config.edit().then(values => {
                    ಠ_ಠ.Display.state().exit(STATE_PREFERENCES);
                    if (values !== undefined) {
                      var _config = {};
                        
                      /* <!-- Comparison Sets --> */
                      _.each(["data", "view"], prop => {
                        if (values[prop] && ರ‿ರ.config[prop] != values[prop].Value)
                        _config[prop] = values[prop].Value;
                      });
                      
                      /* <!-- Array Sets (override) --> */
                      _.each(["calendars", "classes"], prop => {
                        values[prop] && (
                          (_.isArray(values[prop].Values) && values[prop].Values.length > 0) ||
                          (_.isObject(values[prop].Values) && values[prop].Values.id)) ?
                          _config[prop] = _.isArray(values[prop].Values) ? 
                            values[prop].Values : [values[prop].Values] :
                          delete ರ‿ರ.config[prop];
                      });
                      
                      /* <!-- Complex Sets --> */
                      _.each(["zombie", "ghost"], prop => {
                        values[prop] === undefined ?
                          delete ರ‿ರ.config[prop] :
                          values[prop].Value <= 0 ? 
                            _config[prop] = false :
                            values[prop] ? 
                              _config[prop] = values[prop].Value :
                              delete ರ‿ರ.config[prop];
                      });
                      
                      return FN.config.update(ರ‿ರ.id, _config)
                        .then(ಠ_ಠ.Main.busy("Saving Config"))
                        .then(() => FN.config.get()
                          .then(ಠ_ಠ.Main.busy("Loading Config"))
                          .then(config => FN.action.start(config)));
                      
                    }
                  });
                }
              },
              
              set: {
                matches: /SET/i,
                state: STATE_PREFERENCES,
                routes: {
                  data: {
                    matches: /DATA/i,
                    fn: () => ಠ_ಠ.Router.pick.single(FN.helper.picker())
                      .then(file => $(`#${PREFERENCES}_data`).val(file.id)),
                  }
                }
              },
              
              add: {
                matches: /ADD/i,
                state: STATE_PREFERENCES,
                routes: {
                  calendar: {
                    matches: /CALENDAR/i,
                    fn: () => FN.calendars.choose($(`#${PREFERENCES}_add_calendar`).addClass("loader"))
                      .then(results => _.tap(results,
                                             () => $(`#${PREFERENCES}_add_calendar`).removeClass("loader")))
                      .then(results => results !== false ? 
                            FN.config.add("calendars", "calendar", results) : results)
                  },
                  class: {
                    matches: /CLASS/i,
                    fn: () => FN.classes.choose($(`#${PREFERENCES}_add_class`).addClass("loader"))
                      .then(results => _.tap(results,
                                             () => $(`#${PREFERENCES}_add_class`).removeClass("loader")))
                      .then(results => results !== false ?
                            FN.config.add("classes", "class", results) : results)
                  }
                }
              },
              
              remove: {
                matches: /REMOVE/i,
                state: STATE_PREFERENCES,
                routes: {
                  calendar: {
                    matches: /CALENDAR/i,
                    length: 1,
                    fn: id => FN.config.remove("calendars", decodeURIComponent(id).replace(/\|/gi, "."))
                  },
                  class: {
                    matches: /CLASS/i,
                    length: 1,
                    fn: id => FN.config.remove("classes", decodeURIComponent(id).replace(/\|/gi, "."))
                  }
                }
              },
              
            }
          },

          search: {
            matches: /SEARCH/i,
            state: STATE_OPENED,
            routes: {
              default: {
                length: 0,
                keys: ["s", "S", "f", "F"],
                fn: FN.find.search,
              },
              tags: {
                matches: /TAGS/i,
                length: 1,
                fn: command => FN.display.tagged(decodeURIComponent(command))
                  .then(results => ಠ_ಠ.Flags.log(`Found Docket ${results.length} Item${results.length > 1 ? "s" : ""}`, results))
              }
            }
          },

          edit: {
            matches: /EDIT/i,
            state: STATE_OPENED,
            routes: {
              tags: {
                matches: /TAGS/i,
                length: 1,
                fn: command => FN.interact.edit($(`#item_${command}`))
              },
            }
          },

          new: {
            matches: /NEW/i,
            state: STATE_OPENED,
            routes: {
              task: {
                matches: /TASK/i,
                length: 0,
                keys: ["n", "N"],
                fn: FN.new.task
              },
            }
          },

          remove: {
            matches: /REMOVE/i,
            state: STATE_OPENED,
            routes: {
              tag: {
                matches: /TAG/i,
                length: 2,
                fn: command => FN.interact.detag($(`#item_${command[0]}`),
                  decodeURIComponent(command[1]))
              },
            }
          },

          archive: {
            matches: /ARCHIVE/i,
            state: STATE_OPENED,
            length: 0,
            fn: FN.action.archive
          },

          refresh: {
            matches: /REFRESH/i,
            state: STATE_OPENED,
            length: 0,
            keys: ["r", "R"],
            fn: FN.action.refresh
          },
          /* <!-- Custom Routes --> */

        },
        route: (handled, command) => {
          if (handled) return;
          var _parsed = ಠ_ಠ.Dates.parse(command);
          if (_parsed.isValid()) FN.show.current(_parsed);
        }
      });

      /* <!-- Return for Chaining --> */
      return this;

    },

    /* <!-- Start App after fully loaded --> */
    start: () => {

      /* <!-- Setup Today | Override every 15mins --> */
      var _today = () => {
        ರ‿ರ.today = ಠ_ಠ.Dates.now().startOf("day").toDate();
        _.delay(_today, 900000);
      };
      _today();

      /* <!-- Setup Showdown --> */
      ಱ.showdown = new showdown.Converter({
        strikethrough: true
      });

      /* <!-- Create Tasks Reference --> */
      ರ‿ರ.tasks = ಠ_ಠ.Tasks({
        properties: PROPERTIES,
      }, ಠ_ಠ);

    },

    /* <!-- Clear the existing state --> */
    clean: () => ಠ_ಠ.Router.clean(false),

    /* <!-- Present Internal State (for debugging etc) --> */
    state: ರ‿ರ,

  };

};