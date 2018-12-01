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

  /* === Internal Visibility === */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    id: "generate_link",
    app: "app",
    route: "view",
    dialog: "link",
    instructions: "LINK_INSTRUCTIONS",
    title: "Your Link",
    data: {},
    target: factory.container,
  };
  /* <!-- Internal Consts --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  var _link = factory.Flags.full(`${options.app.toLowerCase()}/#google,${options.route.toLowerCase()}.${factory.Strings().base64.encode(JSON.stringify(options.data))}`);
  var _clipboard;
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _generate = () => factory.Display.modal(options.dialog, {
    id: options.id,
    target: options.target,
    title: options.title,
    instructions: factory.Display.doc.get(options.instructions),
    link: _link,
    qr_link: () => "https://chart.googleapis.com/chart?cht=qr&chs=540x540&choe=UTF-8&chl=" + encodeURIComponent(_link),
    details: _.escape(JSON.stringify(options.data, null, 4)),
  }, dialog => {

    dialog.find("#link_copy").attr("data-clipboard-text", _link);

    if (window.ClipboardJS) _clipboard = new window.ClipboardJS("#generate_link .copy-trigger", {
      container: dialog[0]
    });

    dialog.find("#link_shorten").one("click.shorten", () => {
      factory.Google.url.insert(_link).then(url => {
        _link = url.id;
        var _qr = "https://chart.googleapis.com/chart?cht=qr&chs=540x540&choe=UTF-8&chl=" + encodeURIComponent(_link);
        dialog.find("#link_text").text(_link);
        dialog.find("#qr_copy").attr("data-clipboard-text", _qr);
        dialog.find("#qr_code").attr("src", _qr);
      }).catch(e => factory.Flags.error("Link Shorten Failure", e ? e : "No Inner Error"));

    });

    $("#qr").on("show.bs.collapse", () => $("#details").collapse("hide"));
    $("#details").on("show.bs.collapse", () => $("#qr").collapse("hide"));

  }).then(() => {
    if (_clipboard) _clipboard.destroy();
  });
  /* <!-- Internal Functions --> */

  /* === Internal Visibility === */

  /* === External Visibility === */
  return {

    generate: _generate,

  };
  /* === External Visibility === */

};