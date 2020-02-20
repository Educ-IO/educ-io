Query = (options, factory) => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {},
        MARKERS = {
          QUESTION : "=== QUESTION ===",
          REFERENCE : "=== APROPOS ===",
        },
        FN = {};
  /* <!-- Internal Constants --> */

  /* <!-- Internal Options --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Options --> */

  /* <!-- Internal Variables --> */
  var ರ‿ರ = {
    dialog: factory.Dialog({}, factory),
  }; /* <!-- State --> */
  /* <!-- Internal Variables --> */
  
  /* <!-- Internal Functions --> */
  var _check = comment => {
    if (!comment.content || comment.resolved === true) return;
    var lines = comment.content.split("\n"), question, reference;
    return _.find(lines, (line, index) => line == MARKERS.QUESTION ? 
      (question = index, true) : false) && _.find(lines, (line, index) => line == MARKERS.REFERENCE ? (reference = index, true) : false) ?
        (comment._parse = {
          lines: lines,
          question: question,
          reference: reference,
        }, true) : false;
  };
  
  var _parse = {
    
    reply: (reply, last) => ({
      id: reply.id,
      reply: reply.content,
      who: reply.author.me ? true : reply.author.displayName,
      when: factory.Dates.parse(reply.createdTime).fromNow(),
      created: factory.Dates.parse(reply.createdTime),
      faded: last ? false : true,
    }),
    
    comment: comment => ({
      id: comment.id,
      question: comment._parse.lines.slice(comment._parse.question + 1, comment._parse.reference).join("\n").trim(),
      about: _.object(["group", "field"], comment._parse.lines[comment._parse.lines.length - 1].toLowerCase().split("|")),
      who: comment.author.me ? true : comment.author.displayName,
      when: factory.Dates.parse(comment.resolved || (comment.replies && comment.replies.length > 0) ? comment.createdTime : comment.modifiedTime).fromNow(),
      created: factory.Dates.parse(comment.createdTime),
      replies: comment.replies && comment.replies.length > 0 ?
        _.chain(comment.replies)
          .filter(reply => !reply.deleted)
          .map((reply, index, all) => _parse.reply(reply, index == all.length - 1))
          .value() : null,
    }),
    
  };
  
  var _resolve = (reply, field) => reply && reply.action == "resolve" ? field.on("hidden.bs.collapse", () => {
            var _parent = field.closest(".questions");
            _parent.find(".question").length == 1 ? (_parent.closest(".questioned").removeClass("questioned border border-warning"), _parent.remove()) : field.remove();
          }).collapse("hide") : options.functions.process.display.replies(field.data("id"), [_parse.reply(reply, true)]);
  /* <!-- Internal Functions --> */
  
  /* <!-- Internal Functions --> */
  FN.report = (group, field, elevate) => {
    var _field = options.state.session.form.find(`[data-group='${group}'][data-field='${field}']`),
        _helper = options.functions.helper.file(options.state.session.file),
        _id = "send_question";
    if (!_field) return;
    _field.addClass("bg-highlight-light o-75");
    return factory.Display.modal("question", {
        id: _id,
        icon: "send",
        title: "Question / Query",
        placeholder: "Query / Question ...",
        instructions: factory.Display.doc.get("SEND_QUESTION"),
        email: factory.Display.doc.get("SEND_QUESTION_EMAIL"),
        emails: _helper.owner.email(true),
        validate: values => values && values.Message && values.Message.Value && values.Email && values.Email.Values,
      }, dialog => {
        var _clone = (_field.is(".form-group") ? _field : _field.find(".form-group")).clone();
        _clone.find("[id]").each((i, el) => el.id = `${_id}__${el.id}`);
        _clone.find("a[role='button']").addClass("disabled");
        _clone.appendTo(dialog.find("[data-output='field']"));
        factory.Display.template.process(dialog);
        ರ‿ರ.dialog.handlers.keyboard.enter(dialog);
        ರ‿ರ.dialog.handlers.list(dialog, options.functions.decode.email);
        dialog.find("textarea").focus();
      }).then(data => {
        if (!data) return false;
      
        var _group = options.state.session.template.groups[group],
            _field = _group.fields[field],
            _about = `${_group.name.trim()} | ${(_field.title || _field.field).trim()}`,
            _code = `${group.replace(/\s/g,"")}|${field.replace(/\s/g,"")}`.toUpperCase(),
            _url =  `${_helper.url()}.${group.replace(/\s/g,"").toLowerCase()}.${field.replace(/\s/g,"").toLowerCase()}`,
            _emails = _.map(_.isArray(data.Email.Values) ? data.Email.Values : [data.Email.Values], email => `\n+${email}`);
      
        var _comment = `${_about}\n\n${MARKERS.QUESTION}\n${data.Message.Value}\n\n${MARKERS.REFERENCE}\n${_url}${_emails}\n${_code}`;
        return elevate(() => factory.Google.files.comments(options.state.session.file.id).create(_comment, {
            r: "head",
            a: [{
              rect: {
                mw: 1,
                mh: 1,
              }
            }],
          }))
          .catch(e => factory.Flags.error("Comment Error", e).negative())
          .then(factory.Main.busy("Adding Question"))
          .then(comment => comment && _check(comment) ? options.functions.process.display.questions(options.state.session.actions, [_parse.comment(comment)]) : comment);
      })
      .catch(e => (e ? factory.Flags.error("Query Error", e) : factory.Flags.log("Query Cancelled")).negative())
      .then(() => _field.removeClass("bg-highlight-light o-75"));
  };
  
  FN.reply = (group, field, id, elevate) => {
    var _field = options.state.session.form.find(`[data-id='${group}'] [data-id='${field}']`),
        _question = options.state.session.form.find(`[data-id='${group}'] [data-id='${field}']~.questions .question[data-id='${id}'], [data-id='${group}'] [data-id='${field}'] .questions .question[data-id='${id}']`),
        _id = "send_reply";
    return factory.Display.modal("question", {
        id: _id,
        icon: "send",
        title: "Reply",
        placeholder: "Reply ...",
        instructions: factory.Display.doc.get("SEND_REPLY"),
        email: factory.Display.doc.get("SEND_REPLY_EMAIL"),
        action: "Resolve",
        resolve: true,
        validate: values => values && ((values.Message && values.Message.Value) || (values.Resolved && values.Resolved.Value == true)),
      }, dialog => {
      
        var _clone = (_field.is(".form-group") ? _field : _field.find(".form-group")).clone();
        _clone.find("[id]").each((i, el) => el.id = `${_id}__${el.id}`);
        _clone.find("a[role='button']").addClass("disabled");
        _clone.appendTo(dialog.find("[data-output='field']"));
        
        factory.Display.template.process(dialog);
        ರ‿ರ.dialog.handlers.keyboard.enter(dialog);
        ರ‿ರ.dialog.handlers.list(dialog, options.functions.decode.email);
        dialog.find("textarea").focus();
        
      }).then(data => !data ? false : elevate(() => factory.Google.files.comments(options.state.session.file.id).replies(id)
          .create(data.Message ? data.Message.Value : null, data.Resolved ? data.Resolved.Value : null, null))
        .catch(e => factory.Flags.error("Comment Reply Error", e).negative())
        .then(factory.Main.busy("Adding Reply"))
        .then(reply => _resolve(reply, _question)))
      .catch(e => (e ? factory.Flags.error("Reply Error", e) : factory.Flags.log("Reply Cancelled")).negative()); 
    
  };
  
  FN.resolve = (group, field, id, elevate) => {
    factory.Display.tidy();
    var _question = options.state.session.form.find(`[data-id='${group}'] [data-id='${field}']~.questions .question[data-id='${id}'], [data-id='${group}'] [data-id='${field}'] .questions .question[data-id='${id}']`);
    return (_question.length === 1) ? 
      elevate(() => factory.Google.files.comments(options.state.session.file.id).replies(id).resolve())
        .catch(e => factory.Flags.error("Comment Resolution Error", e).negative())
        .then(factory.Main.busy("Resolving Question"))      
        .then(reply => _resolve(reply, _question)) : false;
  };
  
  FN.list = (file, comments) => (comments ? Promise.resolve(comments) : factory.Google.files.comments(file).list())
      .then(comments => _.filter(comments, _check))
      .then(comments => _.sortBy(comments, "createdTime"))
      .then(comments => _.map(comments, _parse.comment))
      .catch(e => factory.Flags.error("Loading Comments", e).negative());
  /* <!-- Internal Functions --> */
  
  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return FN;
  /* <!-- External Visibility --> */
  
};