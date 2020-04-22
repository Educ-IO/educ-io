Notify = (options, factory) => {
  "use strict";

  /* <!-- HELPER:  --> */
  /* <!-- PARAMETERS: Options (see below) and factory (to generate other helper objects) --> */
  /* <!-- @options.id: Target Holder Element ID [Optional]  --> */
  /* <!-- @options.delay: Default delay for alerts (overridden by method delay) [Optional]  --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore, DayJS/Moment, autosize | App Scope: Flags, Display, Google, Router, Dates; --> */

  /* <!-- Internal Constants --> */
  const DEFAULTS = {
    id: "app_Notify",
    delay: 10000,
    autohide : true,
    class: {
      success: {
        header : "bg-success-light",
        main : "text-success", 
      },
      failure: {
        header : "bg-danger-light",
        text: "text-dark",
        main : "text-danger", 
      },
    },
    documents: {
      save: {
        failed: "NOTIFY_SAVE_FAILED"
      },
      send: {
        success: "NOTIFY_SEND_SUCCESS"
      }
    }
  };
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  options = _.defaults(options ? _.clone(options) : {}, DEFAULTS);
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  var _target = () => $(`#${options.id} .holder`);

  var _empty = () => _target().empty();
  
  var _success = (title, message, delay) => () => {
    factory.Display.notify({
      title: _.isFunction(title) ? title() : title,
      content: _.isFunction(message) ? message() : message,
      class: options.class.success.main,
      header_class: options.class.success.header,
      delay: delay || options.delay,
      autohide: options.autohide,
      target: _target()
    });
  };

  var _failure = (title, message, delay) => () => {
    factory.Display.notify({
      title: _.isFunction(title) ? title() : title,
      content: _.isFunction(message) ? message() : message,
      class: options.class.failure.main,
      header_class: options.class.failure.header,
      text_class: options.class.failure.text,
      delay: delay || options.delay,
      autohide: options.autohide,
      target: _target()
    });
  };
  /* <!-- Internal Functions --> */


  /* <!-- External Visibility --> */
  return {

    /* <!-- External Functions --> */
    actions: {
      
      error : (e, title, message, log) => {
        factory.Flags.error(log || title, e);
        _failure(title, _.isString(message) ? factory.Display.doc.get(message) : message)();
        return false;
      },
      
      save : (message, delay) => result => {
        result !== null ? result === false ? 
          _failure("Save FAILED", factory.Display.doc.get(options.documents.save.failed), delay)() :
          _success("Successful Save", factory.Display.doc.get({
              name: _.isFunction(message) ? message() : message,
              content: result.webViewLink ?
                result.webViewLink : result.spreadsheetId ?
                  `https://docs.google.com/spreadsheets/d/${result.spreadsheetId}/edit` : result.id ?
                    `https://drive.google.com/file/d/${result.id}/view` : "https://drive.google.com",
            }), delay)() : false;
        return result;

      },
      
    },
    
    fn : {
      
      success : _success,
    
      failure : _failure,  
    
    },
    
    success : (title, message, delay) => _success(title, message, delay)(),
    
    failure : (title, message, delay) => _failure(title, message, delay)(),
    
    empty : _empty,
    
    /* <!-- External Functions --> */

  };
  /* <!-- External Visibility --> */

};