Menu = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to handle recent menu --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const ITEM_CLASS = "loaded_recent",
    DIVIDER_CLASS = "divider_recent",
    MENU_SELECTOR = "div[data-menu='Database']",
    BEFORE_SELECTOR = `${MENU_SELECTOR} .dropdown-divider.recent_list`,
    ITEMS_SELECTOR = `${MENU_SELECTOR} .${ITEM_CLASS}`;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _matches = state => state && state.indexOf(`${options.state}_shared_`) >= 0;

  var _add = file => {

    var _id = `navMenu_Database_${file.id}`,
      _empty = $(`#${_id}`).length === 0;

    if (_empty) {

      var _desc = factory.Display.template.get("recent")(file).trim(),
        _item = factory.Display.template.get({
          name: "menu_item",
          id: _id,
          class: ITEM_CLASS,
          title: file.name,
          desc: _desc,
          desc_html: true,
          desc_text: `Switch to Database File titled: ${file.name}${file.description ? ` [${file.description}]` : ""}`,
          auth: "google",
          command: `load.${file.id}`,
          icon: options.icon,
          toggler: `${options.state}_shared_${file.id}`,
          divider: $(ITEMS_SELECTOR).length === 0,
          divider_class: DIVIDER_CLASS
        });

      $(BEFORE_SELECTOR).after(_item = $(_item));
      factory.Display.tooltips(_item.filter("[data-toggle='tooltip']"));

    }

    var _state = factory.Display.state(),
        _current = _state.all(),
        _remove = _.filter(_current, _matches);
    factory.Display.state().swap(_remove, `${options.state}_shared_${file.id}`);

    return Promise.resolve(file);

  };

  var _remove = id => {

    factory.Display.state().exit(`${options.state}_shared_${id}`);
    return Promise.resolve(id);

  };

  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    add: _add,
    
    remove: _remove

  };
  /* <!-- External Visibility --> */

};