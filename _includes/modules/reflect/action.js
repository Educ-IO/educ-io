Action = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        FN = {};
  const OVERVIEW = "overview",
        SIGNATORY = "signatory",
        DESTINATION = "destination";
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  FN.recent = (file, silent) => _.tap(file,
    file => factory.Recent.add((silent ? file : options.state.session.file = file).id,
      file.name.replace(options.functions.files.regex, ""),
      "#google,load." + file.id, null, null,
      factory.Google.files.is(options.functions.files.type.report)(file) ? "assignment" :
      factory.Google.files.is(options.functions.files.type.form)(file) ? "dashboard" :
      factory.Google.files.is(options.functions.files.type.analysis)(file) ? "assessment" :
      factory.Google.files.is(options.functions.files.type.review)(file) ? "search" :
      factory.Google.files.is(options.functions.files.type.tracker)(file) ? "timeline" :
      factory.Google.files.is(options.functions.files.type.scale)(file) ? "toc" : null));

  FN.revoke = () => factory.Display.confirm({
      id: "confirm_Revoke",
      target: factory.container,
      message: factory.Display.doc.get("REVOKE_COMPLETION"),
      action: "Revoke",
      close: "Cancel"
    })
    .then(result => result !== true ?
      false : factory.Google.files.update(options.state.session.file.id, {
        appProperties: {
          COMPLETE: null
        }
      }, null, true)
      .then(factory.Main.busy("Revoking"))
      .then(uploaded => uploaded ? options.functions.load.filed(uploaded) : false));

  FN.screenshot = element => (window.html2canvas ?
      html2canvas(_.tap(element, () => window.scrollTo(0, 0)), {
        logging: factory.Flags.debug(),
        ignoreElements: element => element.nodeName === "IFRAME"
      }) :
      Promise.reject(new Error(`HTML2Canvas Object Evalulates to ${window.html2canvas}`)))
    .then(canvas => ({
      thumbnail: {
        mimeType: "image/png",
        image: canvas.toDataURL("image/png")
          .replace(/^data:image\/png;base64,/i, "")
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "")
      }
    }))
    .catch(e => factory.Flags.error("Screenshot Error", e).negative())
    .then(result => result && result.thumbnail ? result : false);

  FN.dehydrate = () => {

    var _title = options.state.session.template && options.state.session.template.title ?
      options.state.session.template.title : options.state.session.template && options.state.session.template.name ?
      options.state.session.template.name : "Report",
      _date = factory.Dates.now().format("YYYY-MM-DD");

    return {
      name: options.state.session.file ?
        options.state.session.file.name : options.functions.files.title(`${factory.me ? `${factory.me.display_name()} | ` : ""}${_title} | ${_date}`,
                                        options.functions.files.type.report, true),
      data: {
        form: options.functions.decode.clean(options.state.session.template),
        report: factory.Data({}, factory).dehydrate(options.state.session.form)
      }
    };

  };

  FN.get = (value, force) => Promise.resolve(value ? value : FN.dehydrate())
    .then(factory.Main.busy("Getting Report"))
    .then(dehydrated => !force && options.functions.dirty(dehydrated.data.report) ?
      options.functions.save.report(false, dehydrated).then(() => dehydrated) : dehydrated);

  FN.edit = () => Promise.resolve(FN.dehydrate())
    .then(factory.Main.busy("Getting Report"))
    .then(options.functions.edit.report)
    .then(value => value && options.state.session.file ? options.functions.load.file(options.state.session.file).then(factory.Main.busy("Refreshing Report")) : false);

  FN.convey = (id, title, instructions_doc, type, message, action, suppress) => FN.get()
    .then(dehydrated => {
    var addresses = options.functions.decode.addresses(type, dehydrated.data.form, dehydrated.data.report);
    return suppress && suppress.optional && addresses.length === 0 ? 
      false : options.functions.elicit.send({
        id: id,
        title: title,
        instructions: factory.Display.doc.get(instructions_doc),
        emails: addresses,
        action: action,
        message: suppress && suppress.message ? false : true,
        readonly: suppress && suppress.remove ? true : false,
      }).then(values => values ? Promise.resolve(values).then(values => ({
          dehydrated: dehydrated,
          files: suppress && suppress.files ? [] : options.functions.decode.files(dehydrated.data.report),
          emails: values.Email && values.Email.Values ?
            _.isArray(values.Email.Values) ? values.Email.Values : [values.Email.Values] : [],
          message: values.Message ? values.Message.Value : true
        }))
        .then(value => !value.files || value.files.length === 0 ?
          Promise.resolve(value) :
          Promise.all(_.map(value.files,
            file => factory.Google.permissions.get(file.id)
            .then(permissions => Promise.all(_.map(value.emails, email => {
              _.find(permissions, permission =>
                  permission.type == "anyone" ||
                  (permission.type == "domain" &&
                    email.split("@")[1].localeCompare(permission.domain,
                      undefined, {
                        sensitivity: "accent"
                      }) === 0) ||
                  email.localeCompare(permission.emailAddress,
                    undefined, {
                      sensitivity: "accent"
                    }) === 0) ?
                Promise.resolve(true) :
                factory.Google.permissions.share(file.id).user(email, "reader")
                .catch(options.state.application.notify.fn.failure("Share FAILED", () => factory.Display.doc.get({
                  name: "NOTIFY_SHARE_FILE_FAILED",
                  content: email
                })));
            }))))).then(() => value))
        .then(value => _.tap(value, value => factory.Flags.log("TO CONVEY:", value)))
        .then(factory.Main.busy(message)) : false);
  });

  FN.send = () => FN.convey("send_Report", "Send Report for Approval / Signature",
      "SEND_INSTRUCTIONS", SIGNATORY, "Sending Report", "Send")
    .then(value => value ? Promise.all(_.map(value.emails,
      email => factory.Google.permissions.share(options.state.session.file).user(email, "commenter")
      .catch(options.state.application.notify.fn.failure("Share FAILED", () => factory.Display.doc.get({
        name: "NOTIFY_SHARE_REPORT_FAILED",
        content: email
      })))
      .then(result => {
        var _subject = "Reflect Report - For Review",
          _url = `${factory.Flags.full()}${factory.Flags.dir()}/#google,load.${options.state.session.file.id}`,
          _email = factory.Display.template.get({
            name: "email_standard",
            subject: _subject,
            openings: [factory.Display.doc.get("EMAIL_REPORT_SEND")],
            endings: value.message && _.isString(value.message) ? [{
              colour: "#dce8df",
              details: unescape(encodeURIComponent(value.message))
            }] : "",
            action: {
              display: "View Report",
              target: _url,
              description: factory.Display.doc.get({
                name: "EMAIL_ACTION_OPEN_REPORT",
                content: "",
                plain: true
              }).trim()
            },
          }),
          _plain = factory.Display.doc.get({
            name: "EMAIL_STANDARD",
            content: $([factory.Display.doc.get("EMAIL_REPORT_SEND")]
              .concat(value.message && _.isString(value.message) ? [encodeURIComponent(value.message)] : [])
              .concat(factory.Display.doc.get({
                name: "EMAIL_ACTION_OPEN_REPORT",
                content: _url
              }))
              .join("\n")).text(),
            plain: true
          });
        if (result)
          return factory.Google.mail.send(email, _subject, _email, _plain,
              `${factory.me.display_name()} | via Reflect <${factory.me.email}>`)
            .then(result => result ? _.tap(result, result => result.to = email) : result);
      }))).then(emails => {
      if (emails && _.filter(emails, email => email).length > 0 && value)
        options.state.application.notify.success("Successful Send",
          factory.Display.doc.get({
            name: "NOTIFY_SEND_SUCCESS",
            delay: 20000,
            content: _.map(emails, email => email ? factory.Display.doc.get({
              name: "NOTIFY_SENT_EMAIL",
              content: `<a href="https://mail.google.com/mail/u/0/#${email.labelIds[0].toLowerCase()}/${email.id}" target="_blank">${email.to || "Email"}</a>`
            }) : email).join()
          }));
      return value;
    }) : value);

  FN.overview = () => FN.convey("overview_Report", "Grant Report Overview",
      "OVERVIEW_INSTRUCTIONS", OVERVIEW, "Report Overview", "Grant", {message : true, remove: true, files: true, optional: true})
    .then(value => value ? Promise.all(_.map(value.emails,
      email => factory.Google.permissions.share(options.state.session.file).user(email, "reader")
      .catch(options.state.application.notify.fn.failure("Share FAILED", () => factory.Display.doc.get({
        name: "NOTIFY_SHARE_REPORT_FAILED",
        content: email
      }))))) : value);
  
  FN.share = () => FN.convey("share_Report", "Share Report for Approval / Signature",
      "SHARE_INSTRUCTIONS", SIGNATORY, "Sharing Report", "Share")
    .then(value => value ? Promise.all(_.map(value.emails,
      email => factory.Google.permissions.share(options.state.session.file, null, value.message).user(email, "commenter")
      .catch(options.state.application.notify.fn.failure("Share FAILED", () => factory.Display.doc.get({
        name: "NOTIFY_SHARE_REPORT_FAILED",
        content: email
      }))))) : value);

  FN.validate = () => {
    var _form = options.state.session.form.find("form.needs-validation"),
      _result = (options.state.session.form.find("form.needs-validation")[0].checkValidity() !== false);
    _result = _.reduce(_form.find("[data-validate='true']"),
      (result, el) => {
        var _result = options.state.application.fields.validate(el),
          _el = $(el);
        _el.siblings(`.${_result === false ? "invalid" : "valid"}-feedback`).addClass("d-flex");
        _el.siblings(`.${_result === false ? "valid" : "invalid"}-feedback`).removeClass("d-flex");
        return result === false ? result : _result;
      }, _result);
    _form.toggleClass("was-validated", !_result);
    return _result;
  };

  FN.complete = () => {
    var _complete = () => {

      var _share = (message, doc) => email => {
        var _error = options.state.application.notify.fn.failure("Share FAILED", () => factory.Display.doc.get({
          name: doc,
          content: email
        }));
        return factory.Google.permissions.share(options.state.session.file, null, message)
          .user(email, "reader")
          .catch(_error);
      };

      return FN.convey("complete_Report", "Complete Report",
          "COMPLETE_INSTRUCTIONS", DESTINATION, "Submitting Report", "Submit")
        .then(value => value ? Promise.all(_.map(value.emails, _share(value.message, "NOTIFY_SHARE_REPORT_FAILED")))
          .then(value => value ? Promise.all(_.map(value.emails, _share(value.message, "NOTIFY_SHARE_FILE_FAILED"))) : value)
          .then(() => factory.Google.files.update(options.state.session.file.id, {
            appProperties: {
              COMPLETE: true
            }
          }, null, true))
          .then(factory.Main.busy("Completing"))
          .then(uploaded => uploaded ? options.functions.load.file(uploaded) : false) : false);
    };
    return FN.validate() ? _complete() : false;
  };
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};