Save = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    autosave: 5000
  }, FN = {};
  const INDEX = "index",
        PATH = "path",
        TRANSFORM = "transform",
        EXTRACT = "extract";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal State Variable --> */
  var ರ‿ರ = {
    observer : null
  };
  /* <!-- Internal Functions --> */
  FN.background = _.debounce(() => {
    var _busy = factory.Display.status.working("Saving");
    return FN.report(false, null, true).then(result => {
      _busy(!!result, result === true ? "Up to Date" : result ? "Saved" : "Save Failed", null, null, true);
      if (result && result !== true) options.functions.process.signatures();
    });
  }, options.autosave);
  
  FN.changed = e => {
    
    if (_.isArray(e) && e.length > 0) {
      /* <!-- Mutation Event Triggered --> */
      e = _.reject(e, mutation => (mutation.addedNodes.length == 1 && mutation.addedNodes[0].nodeName == "DIV" && mutation.addedNodes[0].classList.value.indexOf("waves-ripple") === 0) ||
               (mutation.removedNodes.length == 1 && mutation.removedNodes[0].nodeName == "DIV" && mutation.removedNodes[0].classList.value.indexOf("waves-ripple") === 0));
      if (e.length > 0 && options.state.session.file) FN.background();
      
    } else {
      /* <!-- Change Event Triggered --> */
      FN.background();
    }
    
  };
  
  FN.autosave = enabled => {
    
    enabled = !enabled;
    
    enabled ? 
      options.state.session.form.find("[data-holder-field], [data-output-name]").on("change.autosave", FN.changed) : 
      options.state.session.form.find("[data-holder-field], [data-output-name]").off("change.autosave");

    if (window && window.MutationObserver) {
      if (!ರ‿ರ.observer) ರ‿ರ.observer = new MutationObserver(FN.changed);
      enabled ? 
        ರ‿ರ.observer.observe(options.state.session.form.find("form")[0], {
                childList : true,
                subtree : true,
                attributes : false,
                characterData : false
              }) : ರ‿ರ.observer.disconnect();
    }

    return Promise.resolve(enabled);
    
  };
  
  FN.analysis = () => Promise.resolve(JSON.stringify(_.extend(options.state.session.definition, {
      expected: options.state.session.analysis.expected(),
    }), options.functions.replacers.saving))
    .then(value => factory.Google.files.upload(options.state.session.file ? null : {
        name: `${options.functions.files.title(options.state.session.analysis.names(), options.functions.files.type.analysis)} | ${factory.Dates.now().format("YYYY-MM-DD")}${options.functions.files.extension}`
      }, value, options.functions.files.type.analysis, null,
         options.state.session.file && options.state.session.file.mimeType == options.functions.files.type.analysis ? options.state.session.file.id : null, true)
      .then(options.functions.action.recent)
      .then(factory.Main.busy("Saving"))
      .then(uploaded => options.state.session.file = uploaded)
      .then(options.state.application.notify.actions.save("NOTIFY_SAVE_ANALYSIS_SUCCESS")));

  FN.form = value => options.functions.action.screenshot($("form[role='form'][data-name]")[0])
    .then(result => factory.Google.files.upload(result ? {
          contentHints: result
        } : null,
        value, options.functions.files.type.form, null, 
        options.state.session.file && options.state.session.file.mimeType == options.functions.files.type.form ? 
          options.state.session.file.id : null, true)
      .then(factory.Main.busy("Updating"))
      .then(uploaded => {
        options.state.application.forms = factory.Forms(options.functions.loaded);
        return (options.state.session.file = uploaded);
      })
      .then(options.state.application.notify.actions.save("NOTIFY_SAVE_FORM_SUCCESS")));
  
  FN.tracker = (value, name, quiet) => (quiet ? Promise.resolve(false) : options.functions.action.screenshot($("form[role='form'][data-name]")[0]))
    .then(result => {
    
      var _existing = options.state.session.file && options.state.session.file.mimeType == options.functions.files.type.tracker ?
          options.state.session.file.id : null,
          _upload = {};
    
      if (result) _upload.contentHints = result;
      if (name && !_existing) _upload.name = name;
    
      return factory.Google.files.upload(_upload, JSON.stringify(value, options.functions.replacers.saving), 
                                          options.functions.files.type.tracker, null, _existing, true)
        .then(factory.Main.busy(_existing ? "Updating" : "Creating"))
        .then(uploaded => {
          factory.Flags.log("Uploaded File", uploaded);
          return quiet ? uploaded : (options.state.session.file = uploaded);
        })
        .then(options.state.application.notify.actions.save("NOTIFY_SAVE_TRACKER_SUCCESS"));
    });

  FN.report = (force, dehydrated, quiet) => options.functions.action.get(dehydrated, true)
    .then(saving => (!options.state.session.signatures || !options.functions.update.dirty.report(saving.data.report) || quiet ?
        Promise.resolve(true) : factory.Display.confirm({
          id: "confirm_Save",
          target: factory.container,
          message: factory.Display.doc.get("SIGNED_REPORT_SAVE_WARNING"),
          action: "Save",
          close: "Cancel"
        }))
      .then(result => {
        return result !== true ? false :
          !options.functions.update.dirty.report(saving.data.report) && quiet ? true : 
          options.functions.action.screenshot($("form[role='form'][data-name]")[0])
          .then(result => {
            return (force ? factory.Display.text({
              id: "file_name",
              title: "File Name",
              message: factory.Display.doc.get("CLONE_NAME"),
              state: {
                value: saving.name.replace(options.functions.files.regex, "")
              },
              simple: true
            }) : Promise.resolve(saving.name)).then(name => {
              var _meta = {
                  name: !name.endsWith(options.functions.files.extension) ? `${name}${options.functions.files.extension}` : name,
                  parents: (options.state.session.folder ? options.state.session.folder.id : null),
                  appProperties: options.functions.decode.values(saving.data.form, saving.data.report,
                    meta => meta[INDEX],
                    (value, field, meta, memo) => {
                      var _val = meta[TRANSFORM] ?
                        factory.Display.template.compile(`REFLECT.FIELD.${memo.FORM}.${field}`,
                          meta[TRANSFORM])(value) :
                        meta[PATH] ?
                        value[meta[PATH]] :
                        meta[EXTRACT] ?
                        (_.isRegExp(meta[EXTRACT]) ?
                          meta[EXTRACT] : new RegExp(meta[EXTRACT], "i")).exec(value) : value;

                      memo[`FIELD.${field}`] = JSON.stringify(_.isArray(_val) && _val.length == 1 ?
                        _val[0] : _val);
                    }, {
                      FORM: saving.data.form.$name ? saving.data.form.$name : saving.data.form.name
                    }),
                },
                _data = JSON.stringify(saving.data, options.functions.replacers.saving),
                _mime = options.functions.files.type.report;
              if (result) _meta.contentHints = result;

              var _new = !options.state.session.file || options.state.session.file.mimeType != options.functions.files.type.report;
              return factory.Google.files.upload.apply(this, [_meta, _data, _mime].concat(_new || force ? [] : [null, options.state.session.file.id, true]))
                .then(uploaded => {
                  if (uploaded) {
                    options.functions.update.hash(saving.data);
                    factory.Display.state().enter(options.functions.states.file.loaded);
                    options.functions.action.recent(uploaded);
                  }
                  return uploaded && _new ? options.functions.action.overview().then(() => uploaded) : uploaded;
                });
            });
          })
          .then(uploaded => uploaded && uploaded !== true ? 
                (options.state.session.form.find(".last-updated").removeClass("d-none").find(".text").text(factory.Dates.parse(uploaded.modifiedByMeTime).fromNow()), 
                  factory.Flags.log("Saved:", uploaded).reflect(uploaded)) : 
                uploaded)
          .catch(e => quiet ? false : factory.Flags.error("Save Error", e).negative())
          .then(quiet ? value => value : factory.Main.busy("Saving Report"))
          .then(quiet ? value => value : options.state.application.notify.actions.save("NOTIFY_SAVE_REPORT_SUCCESS"));
      }).catch(() => factory.Flags.log("Save Cancelled").negative()));
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};