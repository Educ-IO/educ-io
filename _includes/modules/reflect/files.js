Files = factory => {
  "use strict";

  /* <!-- MODULE: Provides an interface to provide common functionality --> */
  /* <!-- PARAMETERS: Receives the global app context --> */
  /* <!-- REQUIRES: Global Scope: JQuery, Underscore | App Scope: Display --> */

  /* <!-- Internal Constants --> */
  const FN = {};
  const TYPE_SCALE = "application/x.educ-io.reflect-scale",
    TYPE_FORM = "application/x.educ-io.reflect-form",
    TYPE_REPORT = "application/x.educ-io.reflect-report",
    TYPE_REVIEW = "application/x.educ-io.reflect-review",
    TYPE_TRACKER = "application/x.educ-io.reflect-tracker",
    TYPE_ANALYSIS = "application/x.educ-io.reflect-analysis",
    TYPES = [TYPE_SCALE, TYPE_FORM, TYPE_REPORT, TYPE_REVIEW, TYPE_TRACKER, TYPE_ANALYSIS];
  const EXTENSION = ".reflect",
    REGEX = /.REFLECT$/i;
  /* <!-- Internal Constants --> */

  /* <!-- Internal Variables --> */
  /* <!-- Internal Variables --> */

  /* <!-- Internal Functions --> */
  FN.prefix = mime => mime == TYPE_FORM ?
    "FORM" : mime == TYPE_SCALE ?
    "SCALE" : mime == TYPE_REVIEW ?
    "REVIEW" : mime == TYPE_TRACKER ?
    "TRACKER" : mime == TYPE_ANALYSIS ?
    "ANALYSIS" : "";
  
  FN.title = (title, mime, extension) => {
    var _prefix = FN.prefix(mime);
    return `${_prefix ? `${_prefix} | ` : ""}${title}${extension === true ? EXTENSION : extension || ""}`;
  };
  
  /* <!-- Find Functions --> */
  FN.find = {

    reports : form => factory.Google.files.type(TYPE_REPORT, "domain,user,allTeamDrives", null, `(${form ? `appProperties has {key='FORM' and value='${form.$name ? form.$name : form.name ? form.name : form}'} and ` : ""}'me' in owners and not appProperties has {key='COMPLETE' and value='true'})`)
      .catch(e => factory.Flags.error("Reports Finding Error", e).negative())
      .then(factory.Main.busy("Looking for Existing Reports")),

  };
  /* <!-- Internal Functions --> */

  /* <!-- Initial Calls --> */

  /* <!-- External Visibility --> */
  return {

    extension : EXTENSION,
    
    find : FN.find,
    
    regex : REGEX,
    
    title: FN.title,
    
    type: {
        
      all : TYPES,
      
      analysis : TYPE_ANALYSIS,
      
      form : TYPE_FORM,
      
      report : TYPE_REPORT,
      
      review : TYPE_REVIEW,
      
      scale : TYPE_SCALE,
      
      tracker : TYPE_TRACKER,
      
    }
    
  };
  /* <!-- External Visibility --> */

};