Link = (options, factory) => {
  "use strict";

  /* <!-- HELPER: Provides methods to  --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @factory.container: Access the Container Element --> */
  /* <!-- @factory.Display: Function to access the Display Module --> */
  /* <!-- @factory.Flags: Function to access the Flags Module --> */
  /* <!-- @factory.Google: Function to access the Google helper object --> */
  /* <!-- @factory.Strings: Function to access the Strings helper object --> */
  /* <!-- REQUIRES: Global Scope: jQuery, Underscore --> */
  /* <!-- REQUIRES: Factory Scope: Flags, Google --> */

  /* <!-- Internal Visibility --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    id: "generate_link",
    app: "app",
    route: "view",
    persistent: false,
    offer_persistent: false,
    dialog: "link",
    large: false,
    hide_link: false,
    force_qr: false,
    qr_url: "https://chart.googleapis.com/chart",
    qr_encoding: "ISO-8859-1",
    qr_size: 540,
    qr_tolerance: "M",
    options_bottom: false,
    hide_shorten: true,
    instructions: "LINK_INSTRUCTIONS",
    title: "Your Link",
    data: {},
    target: factory.container,
  };
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Generate Functions --> */
  var _create = (name, persistent, route, data) => factory.Flags.full(`${name}/${persistent ? "?i=" : "#"}google,${route}.${factory.Strings().base64.encode(JSON.stringify(data))}`);
  /* <!-- Generate Functions --> */
  
  /* <!-- Stateful Variables --> */
  var _clipboard, _link = _create(options.app.toLowerCase(), options.persistent, options.route.toLowerCase(), options.data);
  /* <!-- Stateful Variables --> */
  
  /* <!-- Internal Functions --> */
  var _qr = link => `${options.qr_url}?cht=qr&chs=${options.qr_size}x${options.qr_size}&choe=${options.qr_encoding}&chld=${options.qr_tolerance}&chl=${encodeURIComponent(link)}`;
  
  var _generate = () => factory.Display.modal(options.dialog, {
    id: options.id,
    target: options.target,
    title: options.title,
    instructions: options.instructions ? factory.Display.doc.get(options.instructions) : "",
    large: options.large,
    hide_link: options.hide_link,
    force_qr: options.force_qr,
    options_bottom: options.options_bottom,
    hide_shorten: options.hide_shorten,
    offer_persistent: options.offer_persistent,
    currently_persistent: options.persistent,
    link: _link,
    qr_link: _qr(_link),
    details: _.escape(JSON.stringify(options.data, null, 4)),
  }, dialog => {

    dialog.find(`#${options.id}_QRCOPY`).attr("data-clipboard-text", _link);

    var _clip = () => {
      if (_clipboard) _clipboard.destroy();
      if (window.ClipboardJS) _clipboard = new window.ClipboardJS(`#${options.id} .copy-trigger`, {
        container: dialog[0]
      });
    },
    _update = link => {
      var img = _qr(link);
      dialog.find(`#${options.id}_LINK`).text(link);
      dialog.find(`#${options.id}_LINKTEST`).attr("href", link);
      dialog.find(`#${options.id}_LINKCOPY`).attr("data-clipboard-text", link);
      dialog.find(`#${options.id}_QRCOPY`).attr("data-clipboard-text", img);
      dialog.find(`#${options.id}_QRCODE`).attr("src", img);
      _clip();
    };
    
    _clip();
    
    if (!options.hide_shorten) dialog.find(`#${options.id}_LINKSHORTEN`).one("click.shorten", () => {
      factory.Display.tidy();
      factory.Google.url.insert(_link).then(url => _update(_link = url.id)).catch(e => factory.Flags.error("Link Shorten Failure", e ? e : "No Inner Error"));
    });
    
    if (options.offer_persistent) dialog.find("button[data-action='persistent']").on("click.persistent", e => {
      factory.Display.tidy();
      var _target = $(e.target || e.currentTarget),
          _change = (add, remove, link) => {
            _target.addClass(add).removeClass(remove);
            _update(_link = link);
          },
          _make = persistent => _create(options.app.toLowerCase(), persistent, options.route.toLowerCase(), options.data);
      _target.hasClass("btn-outline-success") ? 
        _change("btn-success", "btn-outline-success", _make(true)) : 
        _change("btn-outline-success", "btn-success", _make(false));
    });

    $(`#${options.id}_QR`).on("show.bs.collapse", () => $(`#${options.id}_DETAILS`).collapse("hide"));
    $(`#${options.id}_DETAILS`).on("show.bs.collapse", () => $(`#${options.id}_QR`).collapse("hide"));

    /* <!-- Process Dialog Template --> */
    factory.Display.template.process(dialog);
    
  }).then(() => {
    if (_clipboard) _clipboard.destroy();
  });
  /* <!-- Internal Functions --> */

  /* <!-- Internal Visibility --> */

  /* <!-- External Visibility --> */
  return {

    generate: _generate,

  };
  /* <!-- External Visibility --> */

};