!function(){var t=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).convert=t({1:function(t,n,a,l,e){var o;return null!=(o=t.lambda(null!=n?n.instructions:n,n))?o:""},3:function(t,n,a,l,e){var o;return null!=(o=a.if.call(null!=n?n:t.nullContext||{},null!=(o=null!=n?n.state:n)?o.source:o,{name:"if",hash:{},fn:t.program(4,e,0),inverse:t.noop,data:e}))?o:""},4:function(t,n,a,l,e){var o;return' value="'+t.escapeExpression(t.lambda(null!=(o=null!=n?n.state:n)?o.source:o,n))+'"'},6:function(t,n,a,l,e){var o;return null!=(o=a.if.call(null!=n?n:t.nullContext||{},null!=(o=null!=n?n.state:n)?o.target:o,{name:"if",hash:{},fn:t.program(7,e,0),inverse:t.noop,data:e}))?o:""},7:function(t,n,a,l,e){var o;return' value="'+t.escapeExpression(t.lambda(null!=(o=null!=n?n.state:n)?o.target:o,n))+'"'},9:function(t,n,a,l,e){var o;return null!=(o=a.if.call(null!=n?n:t.nullContext||{},null!=(o=null!=n?n.state:n)?o.inplace:o,{name:"if",hash:{},fn:t.program(10,e,0),inverse:t.noop,data:e}))?o:""},10:function(t,n,a,l,e){return" checked"},12:function(t,n,a,l,e){var o;return null!=(o=a.if.call(null!=n?n:t.nullContext||{},null!=(o=null!=n?n.state:n)?o.prefix:o,{name:"if",hash:{},fn:t.program(13,e,0),inverse:t.noop,data:e}))?o:""},13:function(t,n,a,l,e){var o;return' value="'+t.escapeExpression(t.lambda(null!=(o=null!=n?n.state:n)?o.prefix:o,n))+'"'},15:function(t,n,a,l,e){var o;return null!=(o=a.if.call(null!=n?n:t.nullContext||{},null!=(o=null!=n?n.state:n)?o.batch:o,{name:"if",hash:{},fn:t.program(16,e,0),inverse:t.program(18,e,0),data:e}))?o:""},16:function(t,n,a,l,e){var o;return t.escapeExpression(t.lambda(null!=(o=null!=n?n.state:n)?o.batch:o,n))},18:function(t,n,a,l,e){return"0"},20:function(t,n,a,l,e){var o;return null!=(o=a.if.call(null!=n?n:t.nullContext||{},null!=(o=null!=n?n.state:n)?o.mirror:o,{name:"if",hash:{},fn:t.program(21,e,0),inverse:t.noop,data:e}))?o:""},21:function(t,n,a,l,e){var o;return' value="'+t.escapeExpression(t.lambda(null!=(o=null!=n?n.state:n)?o.mirror:o,n))+'"'},23:function(t,n,a,l,e){var o;return null!=(o=a.each.call(null!=n?n:t.nullContext||{},null!=n?n.actions:n,{name:"each",hash:{},fn:t.program(24,e,0),inverse:t.noop,data:e}))?o:""},24:function(t,n,a,l,e){var o;return null!=(o=t.invokePartial(l.control_button,n,{name:"control_button",hash:{b_text:null!=n?n.text:n,b_title:null!=n?n.desc:n,b_action:a.concat.call(null!=n?n:t.nullContext||{},"actions_",e&&e.index,{name:"concat",hash:{},data:e}),b_id:null!=n?n.id:n,b_class:"btn-light"},data:e,helpers:a,partials:l,decorators:t.decorators}))?o:""},compiler:[7,">= 4.0.0"],main:function(t,n,a,l,e){var o,r=t.lambda,s=t.escapeExpression,i=null!=n?n:t.nullContext||{};return'<div id="'+s(r(null!=n?n.id:n,n))+'" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_options_title">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_options_title">'+s(r(null!=n?n.title:n,n))+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(o=a.if.call(i,null!=n?n.instructions:n,{name:"if",hash:{},fn:t.program(1,e,0),inverse:t.noop,data:e}))?o:"")+'\n\t\t\t\t<div class="d-flex flex-column flex-wrap flex-md-row lead mb-3 mt-1">\n\t\t\t\t\t<button data-action="populate" data-populate="docs" type="button" class="btn btn-outline-dark mb-3 mb-md-0 mr-md-3 mt-2">Word -> Docs</button>\n\t\t\t\t\t<button data-action="populate" data-populate="sheets" type="button" class="btn btn-outline-dark mb-3 mb-md-0 mr-md-3 mt-2">Excel -> Sheets</button>\n\t\t\t\t\t<button data-action="populate" data-populate="slides" type="button" class="btn btn-outline-dark mb-3 mb-md-0 mr-md-3 mt-2">Powerpoint -> Slides</button>\n\t\t\t\t\t<button data-action="populate" data-populate="word" type="button" class="btn btn-outline-dark mb-3 mb-md-0 mr-md-3 mt-2">Zip -> Word</button>\n\t\t\t\t\t<button data-action="populate" data-populate="excel" type="button" class="btn btn-outline-dark mb-3 mb-md-0 mr-md-3 mt-2">Zip -> Excel</button>\n\t\t\t\t\t<button data-action="populate" data-populate="powerpoint" type="button" class="btn btn-outline-dark mb-3 mb-md-0 mr-md-3 mt-2">Zip -> Powerpoint</button>\n\t\t\t\t\t<button data-action="populate" data-populate="pdf" type="button" class="btn btn-outline-dark mb-3 mb-md-0 mr-md-3 mt-2">Google Formats -> PDF</button>\n\t\t\t\t</div>\n\t\t\t\t<form>\n\t\t\t\t\t<div class="form-group">\n    \t\t\t\t<label for="sourceMimeType">Source Mime Type</label>\n\t\t\t\t\t\t<input type="text" id="sourceMimeType" name="source" class="form-control"'+(null!=(o=a.if.call(i,null!=n?n.state:n,{name:"if",hash:{},fn:t.program(3,e,0),inverse:t.noop,data:e}))?o:"")+' />\n\t\t\t\t\t\t<small class="form-text text-muted">Mime Type to convert from.</small>\n  \t\t\t\t</div>\n\t\t\t\t\t<div class="row">\n\t\t\t\t\t\t<div class="form-group col-lg-8">\n\t\t\t\t\t\t\t<label for="targetMimeType">Target Mime Type</label>\n\t\t\t\t\t\t\t<input type="text" id="targetMimeType" name="target" class="form-control"'+(null!=(o=a.if.call(i,null!=n?n.state:n,{name:"if",hash:{},fn:t.program(6,e,0),inverse:t.noop,data:e}))?o:"")+' />\n\t\t\t\t\t\t\t<small class="form-text text-muted">Mime Type to convert to.</small>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="col-lg-4 d-flex align-items-end">\n\t\t\t\t\t\t\t<div class="custom-control custom-checkbox">\n\t\t\t\t\t\t\t\t<input type="checkbox" class="custom-control-input" id="convertInplace" name="inplace"'+(null!=(o=a.if.call(i,null!=n?n.state:n,{name:"if",hash:{},fn:t.program(9,e,0),inverse:t.noop,data:e}))?o:"")+'>\n\t\t\t\t\t\t\t\t<label class="custom-control-label" for="convertInplace">Convert In Place?</label>\n\t\t\t\t\t\t\t\t<small class="form-text text-muted">Don\'t create new files unless required.</small>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="row">\n\t\t\t\t\t\t<div class="form-group col-lg-6">\n\t\t\t\t\t\t\t<label for="prefixAfterConversion">Prefix</label>\n\t\t\t\t\t\t\t<input type="text" id="prefixAfterConversion" name="prefix" class="form-control"'+(null!=(o=a.if.call(i,null!=n?n.state:n,{name:"if",hash:{},fn:t.program(12,e,0),inverse:t.noop,data:e}))?o:"")+' />\n\t\t\t\t\t\t\t<small class="form-text text-muted">After successful conversion, prefix source with this.</small>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="form-group col-lg-6">\n\t\t\t\t\t\t\t<label for="batchSize">Batch Size</label>\n\t\t\t\t\t\t\t<input type="number" id="batchSize" name="batch" class="form-control" value="'+(null!=(o=a.if.call(i,null!=n?n.state:n,{name:"if",hash:{},fn:t.program(15,e,0),inverse:t.program(18,e,0),data:e}))?o:"")+'"/>\n\t\t\t\t\t\t\t<small class="form-text text-muted">Number of batches to break conversion task into (results written after each batch). A zero or negative number will <strong>disable logging</strong>.</small>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="form-group">\n\t\t\t\t\t\t<label for="mirrorOutputTo">Mirror To</label>\n\t\t\t\t\t\t<div class="input-group">\n\t\t\t\t\t\t\t<input type="text" id="mirrorOutputTo" name="mirror" class="form-control"'+(null!=(o=a.if.call(i,null!=n?n.state:n,{name:"if",hash:{},fn:t.program(20,e,0),inverse:t.noop,data:e}))?o:"")+' readonly />\n\t\t\t\t\t\t\t<div class="input-group-append">\n'+(null!=(o=t.invokePartial(l.control_button,n,{name:"control_button",hash:{b_text:"Browse",b_action:"load-g-folder",b_target:"mirrorOutputTo",b_title:"Select Folder from Google Drive",b_class:"btn-outline-primary"},data:e,indent:"\t\t\t\t\t\t\t\t",helpers:a,partials:l,decorators:t.decorators}))?o:"")+(null!=(o=t.invokePartial(l.control_button,n,{name:"control_button",hash:{b_icon:"refresh",b_target:"mirrorOutputTo",b_title:"Clear / Reset",b_class:"btn-secondary eraser"},data:e,indent:"\t\t\t\t\t\t\t\t",helpers:a,partials:l,decorators:t.decorators}))?o:"")+'\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<small class="form-text text-muted">After successful conversion and if a new file has been created, add the resulting file to this folder too.</small>\n\t\t\t\t\t</div>\n\t\t\t\t</form>\n      </div>\n      <div class="modal-footer">\n\t\t\t\t'+(null!=(o=a.if.call(i,null!=n?n.actions:n,{name:"if",hash:{},fn:t.program(23,e,0),inverse:t.noop,data:e}))?o:"")+'\n\t\t\t\t<button type="button" class="btn btn-primary" data-dismiss="modal">Convert</button>\n\t\t\t\t<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n'},usePartial:!0,useData:!0})}();