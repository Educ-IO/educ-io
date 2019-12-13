Tasks = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to interact with Tasks --> */
  
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.date_format --> */
  /* <!-- @options.functions --> */
  /* <!-- @options.functions.errors --> */
  /* <!-- @options.functions.display --> */
  /* <!-- @options.state.session: --> */
  /* <!-- @options.state.session.database: --> */
  /* <!-- @options.state.session.db: --> */
  /* <!-- @options.state.application: --> */
  /* <!-- @options.state.application.errors: --> */
  /* <!-- @options.state.application.showdown: --> */
  /* <!-- @options.state.application.task: --> */
  
  /* <!-- REQUIRES: Global Scope: Loki, JQuery, Underscore, Hammer, Autosize | Factory Scope: Display, Google --> */

  /* <!-- Internal Constants --> */
  const FN = {}, 
        MIME_TYPE = "application/x-educ-docket-item", 
        DROP_SELECTORS = {
          item: "div.item[data-droppable=true]",
          group: "div.group[data-droppable=true], div.card-body[data-droppable=true]",
        };
  /* <!-- Internal Constants --> */
  
  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.input = {
    
    new : (id, title, instructions) => {
    
      var _dialog = factory.Dialog({}, factory);
      
      return factory.Display.modal("new", {
          target: factory.container,
          id: id || "new",
          title: title || "Create New Item",
          instructions: instructions || factory.Display.doc.get("NEW_INSTRUCTIONS"),
          date: factory.Dates.parse(options.functions.focus.date()).format(options.date_format),
          handlers: {
            clear: _dialog.handlers.clear,
          },
          updates: {
            extract: _dialog.handlers.extract(options.state.application.task.regexes)
          }
        }, dialog => {
          factory.Fields().on(dialog);
          factory.Display.tooltips(dialog.find("[data-toggle='tooltip']"), {trigger: "hover"});
          _dialog.handlers.keyboard.enter(dialog);
          dialog.find(id ? `#${id}_details` : "#new_details").focus();
        });
    },
    
    date : (target, change) => {

      var _input = target.find("input.dt-picker");
      _input.off("change.date").on("change.date", e => {
        var value = $(e.target).val();
        if (value) change(factory.Dates.parse(value));
      });
      
      _input.bootstrapMaterialDatePicker({
        format: options.date_format,
        cancelText: "Cancel",
        clearButton: false,
        nowButton: true,
        time: false,
        switchOnClick: true,
        triggerEvent: "dblclick"
      });

      _input.dblclick();

    },
    
  };
  
  
  FN.items = {
    
    clone : items => {
      
      var _clone = item => _.mapObject(_.clone(item), val => val && val.clone ? val.clone() : val);
      return _.isArray(items) ? _.map(items, _clone) : _clone(items);

    },
    
    get : target => (target.data("id") !== null && target.data("id") !== undefined) ?
      options.state.session.db.get(target.data("id")) : false,
    
    /* <!-- Inserts a new Item into the DB / Database, and then onto the UI if a holder is visible (e.g. date or state box shown) --> */
    insert: item => Promise.resolve(FN.items.reconcile(item))
      .then(item => {

        var _element = FN.items.place(item);
        
        return options.state.session.database.items.insert(item)
          .then(_element ? FN.status.busy(_element, item) : Promise.resolve(true))
          .then(() => FN.elements.replace(_element, item)) /* <!-- Updates with row / ID --> */
          .catch(e => {
            if (_element) _element.remove();
            return options.state.application.errors.insert(e);
          });
        
      }),
    
    /* <!-- Places an Item into the UI if a holder is visible (e.g. date or state box shown) --> */
    /* <!-- If an element is not passed, it will be created (using data-display parameters from the holder) --> */
    place: (item, element) => {
      
      /* <!-- Get the relevant date/status for item --> */
      var _date = (item.IS_TIMED || item.IN_FUTURE ? item.FROM : factory.Dates.now()).toISOString(true).split("T")[0],
          _status = item.STATUS, _holder = $(`div[data-date='${_date}'], div[data-status='${_status ? _status : item.IS_TIMED ? "NONE" : ""}']`);
      
      var _place = holder => {
        
        if (!element) {
          
          /* <!-- Updates various fields, including ACTION for date dialog (force to ensure everything is refreshed) --> */
          element = FN.elements.create(FN.items.reconcile(item, true), true, 
                                        holder.data("display-wide"), holder.data("display-simple"), holder.data("display-forward"), holder.data("display-backward"));
          
          FN.hookup(element, true);
          
        }
        
        var _last = holder.find("div[data-zombie='true'], div[data-ghost='true']");
        _last.length > 0 ? element.insertBefore(_last.first()) : element.insertAfter(holder.find("[data-divider='true']").first());
        
        return element;
      };
      
      return _holder.length == 1 ? _place(_holder) : false;
      
    },
    
    reconcile: (items, force) => options.state.application.task.prepare(options.state.application.schema.process(items), force),
    
    status: (status, target, item, original) => {
      
      item.STATUS = status;
      if (!options.state.application.schema.enums.status.complete.equals(item.STATUS, true)) {
        item.IS_COMPLETE = false;
        item.DONE = "";
      }
      
      return FN.actions.edit(target, item, original, true)
        .then(result => result ? FN.items.place(item) && target.remove() : result);
      
    },
    
    update : (target, item, original, keep) => Promise.resolve(FN.items.reconcile(item))
      .then(item => keep ? target : FN.elements.replace(target, item))
      .then(target => options.state.session.database.items.update(item)
          .then(FN.status.busy(target, item))
          .then(() => item)
          .catch(e => {
            FN.elements.replace(target, original);
            options.state.application.errors.update(e);
          })),
    
  };
  
  
  FN.elements = {
    
    clear : () => {

      var s = window.getSelection ? window.getSelection() : document.selection;
      s ? s.removeAllRanges ? s.removeAllRanges() : s.empty ? s.empty() : false : false;

    },

    create : (item, editable, wide, simple, forward, backward) => $(factory.Display.template.get(_.extend({
      template: "item",
      editable: editable ? true : false,
      wide: wide ? true : false,
      simple: simple ? true : false,
      forward: forward ? forward : false,
      backward: forward ? backward : false,
    }, item))),
  
    replace : (target, item, group) => (group || target) ? FN.hookup(FN.elements.create(item, (group || target).data("display-editable"), (group || target).data("display-wide"),
                                                                    (group || target).data("display-simple"), (group || target).data("display-forward"),
                                                                    (group || target).data("display-backward")).replaceAll(target), true) : true,
    
  };
  
  
  FN.actions = {
    
    cancel : (target, item) => {

      /* <!-- Reconcile UI --> */
      target.find("div.edit textarea").val((item || FN.items.get(target)).DETAILS);
      return Promise.resolve();

    },
    
    forward : (target, item, original) => {

      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);
      original = original || FN.items.clone(item);
      
      /* <!-- Set the appropriate status --> */
      return options.state.application.schema.enums.status.underway.equals(item.STATUS, true) ?
        FN.actions.complete(target, item, original) : !item.STATUS ?
          FN.items.status(options.state.application.schema.enums.status.ready, target, item, original) : 
          options.state.application.schema.enums.status.ready.equals(item.STATUS, true) ? 
            FN.items.status(options.state.application.schema.enums.status.underway, target, item, original) : Promise.resolve(false);
        
    },
    
    backward : (target, item, original) => {

      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);
      original = original || FN.items.clone(item);

      /* <!-- Set the appropriate status --> */
      return options.state.application.schema.enums.status.complete.equals(item.STATUS, true) ?
        FN.items.status(options.state.application.schema.enums.status.underway, target, item, original) : 
        options.state.application.schema.enums.status.underway.equals(item.STATUS, true) ?
          FN.items.status(options.state.application.schema.enums.status.ready, target, item, original) : 
          options.state.application.schema.enums.status.ready.equals(item.STATUS, true) ?
            FN.items.status("", target, item, original) : Promise.resolve(false);
      
    },
    
    complete : (target, item, original) => {

      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);
      original = original || FN.items.clone(item);

      /* <!-- Update Item --> */
      item.IS_COMPLETE = !(item.IS_COMPLETE);
      item.STATUS = item.IS_COMPLETE ? "COMPLETE" : "";
      item.DONE = item.IS_COMPLETE ? factory.Dates.now() : "";

      return FN.actions.edit(target, item, original);

    },

    delete : (target, item) => factory.Display.confirm({
          id: "delete_Item",
          target: factory.container,
          message: `Please confirm that you wish to delete this item: ${(item = item || FN.items.get(target)).DISPLAY}`,
          enter: true,
          action: "Delete"
        })
        .then(confirm => confirm ? options.state.session.database.items.delete(item)
                  .then(() => target.remove())
                  .catch(options.state.application.errors.delete)
                  .then(FN.status.busy(target, item)) : false),

    duplicate : (target, item) => {

      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);

      FN.input.date(target, date => {

        factory.Flags.log(`Cloning Item to: ${date.format(options.date_format)}`, item);
        return FN.items.insert({
          FROM: date,
          TAGS: item.TAGS,
          DETAILS: item.DETAILS,
          TYPE: item.TYPE
        });

      });

    },

    edit : (target, item, original, keep) => {

      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);
      original = original || FN.items.clone(item);

      /* <!-- Update Item --> */
      item.DETAILS = target.find("div.edit textarea").val();
      item.DISPLAY =options.state.application.showdown.makeHtml(item.DETAILS);

      return FN.items.update(target, item, original, keep);
    },
    
    move : (target, item) => {

      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);

      FN.input.date(target, date => {

        item.FROM = date;

        /* <!-- Process Item, Reconcile UI then Update Database --> */
        Promise.resolve(FN.items.reconcile(item))
          .then(item => options.state.session.database.items.update(item))
          .then(FN.status.busy(target, item))
          .then(() => target.remove())
          .then(() => FN.items.place(item))
          .catch(options.state.application.errors.update);
        
      });

    },

  };
  
  
  FN.status = {
    
    busy : (target, item) => (clear => () => {
      
      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);
      
      /* <!-- Run the clear if supplied --> */
      if (clear && _.isFunction(clear)) clear();

    })(factory.Display.busy({
      append: true,
      target: target.is(".status-holder") ? target : target.find(".status-holder"),
      class: "loader-small float-right ml-1 pr-1",
      fn: true
    })),
      
  };
  
  
  FN.new = {
    
    item: type => FN.input.new("new", `Create New ${type}`).then(values => {
          if (!values) return false;
          factory.Flags.log("Values for Creation", values);
          return FN.items.insert({
            FROM: values.From ? values.From.Value : null,
            TAGS: values.Tags ? values.Tags.Value : null,
            DETAILS: values.Details ? values.Details.Value : null,
          });
        })
        .catch(e => e ? factory.Flags.error("Create New Error", e) : factory.Flags.log("Create New Cancelled")),

    task: () => FN.new.item("Task"),

  };
  
  
  FN.tags = {

    edit: (target, item, original) => {

      if (!target) return;
      
      /* <!-- Either use supplied Item or grab it from the target --> */
      item = item || FN.items.get(target);
      original = original || FN.items.clone(item);
      
      var _cancel = () => FN.items.reconcile(_.tap(item, item => item.tags = original.tags)),
          _reconcile = target => target.empty().append($(factory.Display.template.get({
            template: "tags",
            tags: item.TAGS,
            badges: item.BADGES
          }))),
          _dialog = factory.Dialog({}, factory),
          _template = "tag",
          _id = "tag";

      /* <!-- Remove Tags from within Dialog --> */
      var _handleRemove = target => target.find("span.badge a").on("click.remove", e => {
        e.preventDefault();
        var _target = $(e.currentTarget),
          _tag = _target.parents("span.badge").data("tag");
        if (_tag) {
          item.TAGS = (item.BADGES = _.filter(
            item.BADGES, badge => badge != _tag
          )).sort().join(";");
          _handleRemove(_reconcile(_target.parents("form")));
        }
      });
      
      return factory.Display.modal(_template, {
          target: factory.container,
          id: _id,
          title: "Edit Tags",
          instructions: factory.Display.doc.get("TAG_INSTRUCTIONS"),
          handlers: {
            clear: _dialog.handlers.clear,
          },
          tags: item.TAGS,
          badges: item.BADGES,
          all: options.state.session.database.badges()
        }, dialog => {

          /* <!-- General Handlers --> */
          factory.Fields().on(dialog);

          /* <!-- Handle CTRL Enter to Save --> */
          _dialog.handlers.keyboard.enter(dialog);

          /* <!-- Handle Click to Remove --> */
          _handleRemove(dialog);

          /* <!-- Handle Click to Add --> */
          var _add = elements => elements.on("click.add", e => {
            e.preventDefault();
            var _input = $(e.currentTarget).parents("li").find("span[data-type='tag'], input[data-type='tag']"),
                _val = _input.val() || _input.text();
            (_input.is("input") ? _input : dialog.find("input[data-type='tag']")).val("").change().focus();
            
            if (_val && (item.BADGES ? item.BADGES : item.BADGES = []).indexOf(_val) < 0) {
              item.BADGES.push(_val);
              item.TAGS = item.BADGES.sort().join(";");
              _handleRemove(_reconcile(dialog.find("form")));
            }
            
          });
          _add(dialog.find("li button"));

          /* <!-- Handle Refresh Suggestions --> */
          var _last, _handle = e =>  {
            var _suggestion = () => {
              var _val = $(e.currentTarget).val();
              if (_val != _last) {
                _last = _val;
                var _suggestions = options.state.session.database.badges(_val),
                    _list = dialog.find("ul.list-group");
                _list.children("li[data-suggestion]").remove();
                if (_suggestions.length > 0) {
                  var _new = $(factory.Display.template.get("suggestions")(_suggestions));
                  _list.append(_new);
                  _add(_new.find("button"));
                }
              }
            };
            _.debounce(_suggestion, 250)();
          };
      
          /* <!-- Handle Enter on textbox to Add --> */
          dialog.find("li input[data-type='tag']")
            .keydown(e => ((e.keyCode ? e.keyCode : e.which) == 13) ? 
                      e.preventDefault() || (e.shiftKey ? dialog.find(".modal-footer button.btn-primary") : $(e.currentTarget).siblings("button[data-action='add']")).click() :
                      _handle(e))
            .change(_handle)
            .focus();

        })
        .then(values => values ? FN.items.update(target, item, original) : _cancel())
        .catch(e => _cancel() && (e ? factory.Flags.error("Edit Tags Error", e) : factory.Flags.log("Edit Tags Cancelled")));

    },

    remove: (target, tag) => factory.Display.confirm({
        id: "remove_Tag",
        target: factory.container,
        message: factory.Display.doc.get({
          name: "CONFIRM_DETAG",
          content: tag
        }),
        action: "Remove"
      })
      .then(confirm => {
        
        if (!confirm) return Promise.resolve(false); /* <!-- No confirmation, so don't proceed --> */
        var _item = FN.items.get(target),
            _original = FN.items.clone(_item);

        /* <!-- Update Item --> */
        _item.TAGS = (_item.BADGES = _.filter(_item.BADGES, badge => badge != tag)).join(";");

        return FN.items.update(target, _item, _original);
        
      }).catch(e => e ? factory.Flags.error("Remove Tag Error", e) : factory.Flags.log("Remove Tag Cancelled"))
    
  };
  
  
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
          var __hash = options.state.session.database.hash(item);
          factory.Flags.log(`Checking E:${item.__HASH} and N:${__hash}`, item);
          if (item.__HASH != __hash) _list.push(item);
        };

      /* <!-- A timed item won't be droppable, so check on it's own --> */
      if (decoded.item.IS_TIMED) _check(decoded.item);

      /* <!-- Check droppable elements for ordering --> */
      _.each(decoded.source.parent().children(selectors.item), (el, i) => {
        var _el = $(el),
          _item = options.state.session.db.get(_el.data("id"));
        _el.data("order", _item.ORDER = i + 1);
        _check(_item);
      });

      /* <!-- Save List --> */
      return _list.length > 0 ? 
        options.state.session.database.items.update(_list)
          .then(result => result === false ? factory.Flags.error("Save / Update Items Failed", _list).negative() : true) : 
        false;

    },

    hookup: (items, selectors) => {

      FN.drag.clear = FN.drag.clear || _.debounce(items => items.removeClass("drop-target"), 100);

      if (items.draggable) items.draggable

        .on("dragstart.draggable", e => {
          $(e.currentTarget).addClass("not-drop-target")
            .parents([selectors.item, selectors.group].join(",")).addClass("not-drop-target");
          e.originalEvent.dataTransfer.setData(MIME_TYPE, e.currentTarget.id);
          e.originalEvent.dataTransfer.dropEffect = "move";
        });

      if (items.droppable) items.droppable

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

            decode.item = options.state.session.db.get(decode.source.data("id"));

            if (decode.group.source[0] != decode.group.destination[0]) {
              
              if (decode.group.destination.data("date")) {
                
                /* <!-- Different Group / Day --> */
                decode.date = {
                  source: factory.Dates.parse(decode.group.source.data("date")),
                  destination: factory.Dates.parse(decode.group.destination.data("date"))
                };
                factory.Flags.log("DRAG DESTINATION DATE:", decode.date);

                if (decode.item.IS_TIMED) {

                  /* <!-- Moving a timed item forwards/backwards --> */
                  decode.item.FROM = decode.date.destination;
                  if (decode.item.IS_COMPLETE && decode.item.DONE.clone().startOf("day").isAfter(decode.date.destination))
                    decode.item.DONE = decode.date.destination;

                  factory.Flags.log("TIMED ITEM DRAGGED:", decode.item);
                  FN.drag.insert(e, decode, selectors);

                } else if (!decode.item.IS_COMPLETE && decode.date.destination.isSameOrAfter(factory.Dates.now().startOf("day"))) {

                  /* <!-- Moving an incomplete item to today or future --> */
                  decode.item.FROM = decode.date.destination;

                  factory.Flags.log("INCOMPLETE ITEM DRAGGED TO PRESENT/FUTURE:", decode.item);
                  FN.drag.insert(e, decode, selectors);

                }
                
              } else if (decode.group.destination.data("status") !== undefined) {
                
                decode.item.STATUS = decode.group.destination.data("status");
                
                factory.Flags.log("DRAG DESTINATION STATUS:", decode.item.STATUS);
                
                FN.drag.insert(e, decode, selectors)
                  .then(value => value ? Promise.resolve(FN.items.reconcile(decode.item))
                        .then(item => FN.elements.replace(decode.source, item, decode.group.destination)) : value);
                
              }

            } else if (decode.source[0] != decode.destination[0]) {

              /* <!-- Not Dropped on itself --> */
              factory.Flags.log("RE-ORDERING ITEM", decode.item);
              FN.drag.insert(e, decode, selectors);

            }


          }
        });

    },

  }; /* <!-- Functions to handle Drag / Drop functionality --> */
  
  
  FN.event = {
    
    hookup : container => {

      var _return = promise => promise;

      /* <!-- Ensure Links open new tabs --> */
      container.find("a:not([href^='#'])").attr("target", "_blank").attr("rel", "noopener");

      /* <!-- Enable Button Links --> */
      container.find(".input-group button").off("click.action").on("click.action", e => {
        var target = $(e.currentTarget);
        if (target.data("action")) {
          var parent = target.parents("div.item");
          _return(target.data("action") == "cancel" ? FN.actions.cancel(parent) :
                  target.data("action") == "delete" ? FN.actions.delete(parent) :
                  target.data("action") == "update" ? FN.actions.edit(parent) : 
                  target.data("action") == "move" ? FN.actions.move(parent) : 
                  target.data("action") == "complete" ? FN.actions.complete(parent) : 
                  target.data("action") == "copy" ? FN.actions.duplicate(parent) :
                  target.data("action") == "tags" ? FN.tags.edit(parent) :
                  target.data("action") == "forward" ? FN.actions.forward(parent) :
                  target.data("action") == "backward" ? FN.actions.backward(parent) :
                  Promise.reject());
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
              FN.actions.complete(_handle(e.currentTarget)) : 
                      FN.actions.edit(_handle(e.currentTarget)));
          } else if (code == 27) {
            /* <!-- Escape Pressed / Cancel Update --> */
            e.preventDefault();
            _return(FN.actions.cancel(_handle(e.currentTarget)));
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
          e.shiftKey ? e.preventDefault() || FN.elements.clear() || FN.actions.complete(_target) : 
            e.ctrlKey ? FN.tags.edit(_target) :
              _target.find("div.edit, div.display").toggleClass("d-none") &&
              _target.toggleClass("editable").toggleClass("editing")
              .attr("draggable", (i, attr) =>
                attr === undefined || attr === null || attr === false || attr === "false" ?
                "true" : "false") : false;
        
        if (_target.find("div.edit").is(":visible")) {

          /* <!-- Remove any tooltips etc --> */
          $("div.tooltip.show").remove();
          
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
                  _item = options.state.session.db.get(_el.data("id")),
                  _order = i + 1;
                _el.data("order", _order);
                if (_item && _item.ORDER != _order)(_item.ORDER = _order) && _list.push(_item);
              });
              
              /* <!-- Save List --> */
              _list.length > 0 ? 
                options.state.session.database.items.update(_list).then(r => (r === false) ? factory.Flags.error("Save / Update Items Failed", _list).negative() : true) : false;
            });

          }
        }
      });

      /* <!-- Enable Tooltips --> */
      factory.Display.tooltips(container.find("[data-toggle='tooltip']"), {
        container: "body",
        trigger: "hover",
      });
      
      return container;

    },
    
  }; /* <!-- Functions to handle Event Clicks and Editing functionality --> */
  
  
  FN.hookup = (element, draggable, droppable, selectors) => {
    
    /* <!-- Hookup all relevant events --> */
    FN.event.hookup(element);
    
    /* <!-- Item Drag / Drop --> */
    FN.drag.hookup({draggable: draggable === true ? element : draggable, droppable: droppable === true ? element : droppable}, selectors || DROP_SELECTORS);
    
    return element;
    
  }; /* <!-- Function to hookup all interactivity to rendered elements --> */
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    
    /* <!-- Called from the Docket App Router --> */
    new : FN.new.task, /* <!-- Creates a new task, via a new task dialog --> */
    
    tag : FN.tags.edit, /* <!-- Edits tags for an existing Task, via an edit dialog --> */
    
    detag : FN.tags.remove, /* <!-- Removes a tag from a Task, via a confirmation dialog --> */
    /* <!-- Called from the Docket App Router --> */
    
    
    /* <!-- Called from the Views module to hookup events for templated Items being rendered --> */
    hookup : container => FN.hookup(container, 
                container.find("div.item[draggable=true]"), 
                container.find("div.item[data-droppable=true], div.group[data-droppable=true], div.card-body[data-droppable=true]")),
    
  };
  /* <!-- External Visibility --> */

};