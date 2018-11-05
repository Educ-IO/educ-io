 App = function() {
   "use strict";

   /* <!-- DEPENDS on JQUERY to work, but not to initialise --> */

   /* <!-- Returns an instance of this if required --> */
   if (this && this._isF && this._isF(this.App)) return new this.App().initialise(this);

   /* <!-- Internal Constants --> */
   const TYPE = "application/x.educ-io.merge",
     STATE_OPENED = "opened",
     STATE_LOADED_DATA = "loaded-data",
     STATE_LOADED_TEMPLATE = "loaded-template",
     STATES = [STATE_OPENED, STATE_LOADED_DATA, STATE_LOADED_TEMPLATE];
   const ID = "merge_split",
     RECENT = {};
   /* <!-- Internal Constants --> */

   /* <!-- Internal Variables --> */
   var ಠ_ಠ, _records, _master, _output;

   var _result, _template, _nodes, _template_Resize, _template_File;
   /* <!-- Internal Variables --> */

   /* <!-- Internal Functions --> */
   var _createMerge = () => new Promise(resolve => {

     /* <!-- Set Up Recent DBs if required --> */
     _.each(["data", "template"], name => RECENT[name] = (RECENT[name] ?
       RECENT[name] : {
         target: `${ID}_${name}_recent`,
         db: ಠ_ಠ.Items(ಠ_ಠ, `${ಠ_ಠ.Flags.dir()}--${name.toUpperCase()}`)
       }));

     ಠ_ಠ.Display.template.show({
       template: "split",
       id: ID,
       columns: {
         data: {
           sizes: {
             md: 6,
             lg: 8
           },
           text: "Merge Data",
           class: "hide-loaded-data",
           menu: $(".dropdown-menu[data-menu='Data']").html(),
           details: ಠ_ಠ.Display.doc.get("DATA_DETAILS"),
           recent: {
             sizes: {
               xs: 12,
               lg: 8,
               xl: 9
             }
           },
           panel: {
             class: "show-loaded-data"
           }
         },
         template: {
           sizes: {
             md: 6,
             lg: 4
           },
           text: "Output Template",
           class: "hide-loaded-template",
           menu: $(".dropdown-menu[data-menu='Template']").html(),
           details: ಠ_ಠ.Display.doc.get("TEMPLATE_DETAILS"),
           recent: {
             sizes: {
               xs: 12
             }
           },
           panel: {
             class: "show-loaded-template",
             frame: true
           }
         },
       },
       target: ಠ_ಠ.container,
       clear: true,
     });

     _.each(_.keys(RECENT), key => {
       RECENT[key].db.last(5).then(recent => {
         recent && recent.length > 0 ? ಠ_ಠ.Display.template.show({
           template: "recent",
           recent: recent,
           target: $(`#${RECENT[key].target}`),
           clear: true
         }) : false;
       }).catch(e => ಠ_ಠ.Flags.error("Recent Items Failure", e ? e : "No Inner Error"));
     });

     resolve(ಠ_ಠ.Display.state().enter(STATE_OPENED));

   });

   var _loadTemplate = file => {

     if (file.mimeType.toLowerCase() == ಠ_ಠ.Google.files.natives()[0].toLowerCase()) {

       return ಠ_ಠ.Google.files.export(file.id, "text/html")
         .then(ಠ_ಠ.Google.reader().promiseAsText)
         .then(result => {
           _result = result;
           _template_Resize = ಠ_ಠ.Display.size.resizer.height("#site_nav", `#${ID}_template_frame`, "height", 25);
           _template = $(result);
           _nodes = $.parseHTML($.trim(result));
           _template_File = file;

           var _frame = $(`#${ID}_template_frame`),
             _doc = _frame[0].contentDocument || _frame[0].contentWindow.document;
           _doc.open();
           _doc.writeln(result);
           _doc.close();

           ಠ_ಠ.Display.state().enter(STATE_LOADED_TEMPLATE);
         });

     } else {

       return Promise.reject(`Can't load ${file.name}, as we can't process type: ${file.mimeType}`);

     }

   };

   var _uploadDoc = template => {

     var metadata = {
       name: "TEST UPLOAD",
       mimeType: ಠ_ಠ.Google.files.natives()[0]
     };

     return ಠ_ಠ.Google.files.upload(metadata, new Blob([template], {
       type: "text/html"
     }), "text/html");

   };

   var _generatePDF = template => {
     var pdf = new jsPDF();
     pdf.fromHTML(template);
     return pdf;
   };

   var _uploadPDF = template => {
     var metadata = {
       name: "TEST UPLOAD",
       mimeType: "application/pdf"
     };

     return ಠ_ಠ.Google.files.upload(metadata,
       new Blob(_generatePDF(template).output("blob"), {
         type: "application/pdf"
       }), "application/pdf");

   };

   var _savePDF = () => {
     var _frame = $(`#${ID}_template_frame`),
       _doc = _frame[0].contentDocument || _frame[0].contentWindow.document;
     ಠ_ಠ.Flags.log("DOC:", _doc);
     _generatePDF(_doc).save("Test.pdf");
     return Promise.resolve();

     /* <!-- 
	var blob = pdf.output("blob");
	window.open(URL.createObjectURL(blob));
	--> */

   };

   var _resize = () => ಠ_ಠ.Display.size.resizer.height("#site_nav, #data_tabs", "div.tab-pane");
   /* <!-- Internal Functions --> */

   /* <!-- External Visibility --> */
   return {

     /* <!-- External Functions --> */
     initialise: function(container) {

       /* <!-- Get a reference to the Container --> */
       ಠ_ಠ = container;

       /* <!-- Set Container Reference to this --> */
       container.App = this;

       /* <!-- Set Up the Default Router --> */
       this.route = ಠ_ಠ.Router.create({
         name: "Merge",
         states: STATES,
         test: () => ಠ_ಠ.Display.state().in(STATE_OPENED),
         clear: () => {
           _records = null;
           _master = null;
           if (_template_Resize) _template_Resize() && (_template_Resize = null);
         },
         routes: {
           create: _createMerge,
           save_pdf: {
             matches: [/SAVE/i, /PDF/i],
             fn: () => _savePDF()
               .catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
               .then(ಠ_ಠ.Display.busy({
                 target: ಠ_ಠ.container,
                 status: "Processing Merge",
                 fn: true
               }))
           },
           headers_increment: {
             matches: [/HEADERS/i, /INCREMENT/i],
             fn: () => _records.headers.increment().then(_resize)
           },
           headers_decrement: {
             matches: [/HEADERS/i,/DECREMENT/i],
             fn: () => _records.headers.decrement().then(_resize)
           },
           headers_manage: {
             matches: [/HEADERS/i, /MANAGE/i],
             fn: () => _records.headers.manage().then(_resize)
           },
           headers: {
             matches: /HEADERS/i,
             fn: () => _records.headers.restore().then(_resize)
           },
           open: {
             options: command => /SHEET/i.test(command) ? {
               title: "Select a Sheet to Open",
               view: "SPREADSHEETS",
               mime: ಠ_ಠ.Google.files.natives()[1],
               all: true,
               recent: true,
             } : /DOC/i.test(command) ? {
               title: "Select a Document to Open",
               view: "DOCUMENTS",
               mime: ಠ_ಠ.Google.files.natives()[0],
               all: true,
               recent: true,
             } : /FORM/i.test(command) ? {
               title: "Select a Form to Open",
               view: "DOCS",
               mime: ಠ_ಠ.Google.files.natives()[4],
               all: true,
               recent: true,
             } : {
               title: "Select a Merge to Open",
               view: "DOCS",
               mime: TYPE,
               all: true,
               recent: true,
               download: true,
             },
             success: value => {
               /DATA/i.test(value.command) ?
                 ಠ_ಠ.Records(ಠ_ಠ, value.result, $(`#${ID}_data_panel`), value.command[2])
                 .then(records => {
                   _records = records;
                   ಠ_ಠ.Display.state().enter(STATE_LOADED_DATA);
                   _resize();
                 })
                 .then(result => {
                   ಠ_ಠ.Flags.log("PROCESSED LOAD:", result);

                   /* <!-- Store in Relevant Recent Items --> */
                   var _type = value.command.toLowerCase(),
                     _recent = RECENT[_type].db;
                   _recent ? _recent.add(value.result.id, value.result.name, `#google,load.${_type}.${value.result.id}`) : false;

                   return result;
                 })
                 .catch(e => ಠ_ಠ.Flags.error("Loading Failure: ", e ? e : "No Inner Error"))
                 .then(ಠ_ಠ.Display.busy({
                   target: ಠ_ಠ.container,
                   status: "Loading",
                   fn: true
                 })) :
                 /TEMPLATE/i.test(value.command) ?
                 _loadTemplate(value.result) :
                 ಠ_ಠ.Display.log("Loaded:", value.result) && ಠ_ಠ.Display.state().enter(STATE_OPENED);
             }
           },
           load: { /* <!-- TODO: Doesn't currently work with Column Swap on Data Source (LHS Panel) --> */
             options: {
               mime: TYPE,
               download: true,
             },
             success: value => ಠ_ಠ.Display.log("Loaded:", value.result) && ಠ_ಠ.Display.state().enter(STATE_OPENED)
           },
           merge_doc: {
             matches: [/MERGE/i, /DOC/i],
             fn: () => {
               ಠ_ಠ.Flags.log("TEMPLATE FILE:", _template_File);
               ಠ_ಠ.Google.files.copy(_template_File.id, false, {
                   name: `${_template_File.name} [Merged]`,
                   parents: _template_File.parents,
                 })
                 .then(merge => {
                   ಠ_ಠ.Flags.log("MERGED FILE:", merge);
                   return ಠ_ಠ.Google.execute(ಠ_ಠ.SETUP.CONFIG.api, "test", [merge.id]);
                 })
                 .then(result => ಠ_ಠ.Flags.log("RESULT FROM MERGE:", result))
                 .catch(e => ಠ_ಠ.Flags.error("Merging Failure: ", e ? e : "No Inner Error"))
                 .then(ಠ_ಠ.Display.busy({
                   target: ಠ_ಠ.container,
                   status: "Processing Merge",
                   fn: true
                 }));
             }
           },
           upload_doc: {
             matches: [/UPLOAD/i, /DOC/i],
             fn: () => {
               _uploadDoc(_result).then(uploaded => {
                   ಠ_ಠ.Flags.log("PROCESSED UPLOAD:", uploaded);
                 })
                 .catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
                 .then(ಠ_ಠ.Display.busy({
                   target: ಠ_ಠ.container,
                   status: "Processing Merge",
                   fn: true
                 }));
             }
           },
           upload_pdf: {
             matches: [/UPLOAD/i, /PDF/i],
             fn: () => {
               _uploadPDF(_result).then(uploaded => {
                   ಠ_ಠ.Flags.log("PROCESSED UPLOAD:", uploaded);
                 })
                 .catch(e => ಠ_ಠ.Flags.error("Uploading Failure: ", e ? e : "No Inner Error"))
                 .then(ಠ_ಠ.Display.busy({
                   target: ಠ_ಠ.container,
                   status: "Processing Merge",
                   fn: true
                 }));
             }
           },
           test: {
             matches: /DUMP/i,
             fn: () => {
               ಠ_ಠ.Flags.log("Records:", _records);
               ಠ_ಠ.Flags.log("Master:", _master);
               ಠ_ಠ.Flags.log("Output:", _output);
               ಠ_ಠ.Flags.log("Template:", _template);
               ಠ_ಠ.Flags.log("Nodes:", _nodes);
             }
           },
         },
         route: () => false,
         /* <!-- PARAMETERS: handled, command --> */
       });

       /* <!-- Return for Chaining --> */
       return this;

     },

     /* <!-- Clear the existing state --> */
     clean: () => ಠ_ಠ.Router.clear(false)

   };

 };