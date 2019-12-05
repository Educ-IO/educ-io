Show = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  
  /* <!-- Display Functions --> */
  FN.report = (name, state, form, process, actions, owner) => {
    
    var _initial = form ?
      options.state.application.forms.create(name, form, actions.editable, actions.signable, actions.completed, null, owner) :
      options.state.application.forms.get(name, true, false),
      _return = _initial.form;
    options.state.session.template = _initial.template;
    if (options.state.session.template) options.state.session.template.$name = name;
    _return.target = factory.container.empty();
    factory.Display.state().change(options.functions.states.all, state).protect("a.jump").on("JUMP");

    var _shown = factory.Display.template.show(_return),
      _form = _shown.find("form"),
      _fields = factory.Fields({
        me: factory.me ? factory.me.full_name : undefined,
        templater: options => factory.Display.template.process($(factory.Display.template.get(options))),
        list_upload_content: "Evidence",
        list_web_content: "Evidence",
        forms: options.state.application.forms
      }, factory);

    /* <!-- Process 'first' field hookups --> */
    _fields.first(_shown);

    /* <!-- Handle Default Form Submission (Keyboard) etc. | Maybe doesn't get triggered? --> */
    _form.submit(actions && actions.editable ? e => {
      e.preventDefault();
      options.functions.action.save.report().then(result => result ? options.functions.process.signatures() : false);
    } : e => e.preventDefault());

    /* <!-- Process Scale Hookups --> */
    options.functions.scales.hookup(_form);

    /* <!-- Handle Process argument, if supplied --> */
    if (process) process(_shown);

    /* <!-- Smooth Scroll Anchors --> */
    if (factory.Scroll) factory.Scroll({
      class: "smooth-scroll"
    }).start();

    /* <!-- Process 'last' field hookups --> */
    return _fields.last(_shown);

  };
  
  FN.form = value => {
    if (value) {
      factory.preview = value;
      var _form = options.state.application.forms.create("preview_Form", JSON.parse(value), false, false, false, true);
      _form.target = factory.container.empty();
      factory.Display
        .state().enter(options.functions.states.form.opened)
        .protect("a.jump").on("JUMP")
        .template.show(_form.form);
    }
  };
  /* <!-- Display Functions --> */
  
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};