!function(){var t=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).new=t({1:function(t,a,l,n,e){return' id="'+t.escapeExpression(t.lambda(null!=a?a.id:a,a))+'"'},3:function(t,a,l,n,e){var o;return null!=(o=t.lambda(null!=a?a.instructions:a,a))?o:""},5:function(t,a,l,n,e){return t.escapeExpression(t.lambda(null!=a?a.id:a,a))+"_"},7:function(t,a,l,n,e){return' value="'+t.escapeExpression(t.lambda(null!=a?a.date:a,a))+'"'},9:function(t,a,l,n,e){var o;return null!=(o=l.each.call(null!=a?a:t.nullContext||{},null!=a?a.actions:a,{name:"each",hash:{},fn:t.program(10,e,0),inverse:t.noop,data:e}))?o:""},10:function(t,a,l,n,e){var o;return null!=(o=t.invokePartial(n.control_button,a,{name:"control_button",hash:{b_text:null!=a?a.text:a,b_title:null!=a?a.desc:a,b_action:l.concat.call(null!=a?a:t.nullContext||{},"actions_",e&&e.index,{name:"concat",hash:{},data:e}),b_id:null!=a?a.id:a,b_class:"btn-outline-info"},data:e,helpers:l,partials:n,decorators:t.decorators}))?o:""},compiler:[7,">= 4.0.0"],main:function(t,a,l,n,e){var o,i=null!=a?a:t.nullContext||{};return"<div"+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(1,e,0),inverse:t.noop,data:e}))?o:"")+' class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_options_title">\n  <div class="modal-dialog modal-dialog-scrollable modal-xl" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_options_title">'+(null!=(o=t.lambda(null!=a?a.title:a,a))?o:"")+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(o=l.if.call(i,null!=a?a.instructions:a,{name:"if",hash:{},fn:t.program(3,e,0),inverse:t.noop,data:e}))?o:"")+'\n\t\t\t\t<form class="needs-validation mt-3" novalidate>\n          \n          <div class="row">\n\t\t\t\t\t\t<div class="form-group col-12 px-4 px-md-3">\n\t\t\t\t\t\t\t<label for="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'details">Details</label>\n\t\t\t\t\t\t  <button type="button" class="close" data-action="clear" data-clear="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'details" aria-label="Clear"><span aria-hidden="true">&times;</span></button>\n\t\t\t\t\t\t\t<textarea id="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'details" data-output-field="Details" class="form-control resizable" tabindex="1" rows="1" data-action="extract" required></textarea>\n\t\t\t\t\t\t\t<div class="invalid-feedback">Details, name or a description is required for this item</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n          \n\t\t\t\t\t<div class="row">\n            <div class="form-group col-lg-8 px-4 px-md-3">\n\t\t\t\t\t\t\t<label for="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'tags">Tags</label>\n\t\t\t\t\t\t\t<button type="button" class="close" data-action="clear" data-clear="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'tags" aria-label="Clear"><span aria-hidden="true">&times;</span></button>\n\t\t\t\t\t\t\t<textarea id="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'tags" data-output-field="Tags" class="form-control resizable" tabindex="2" rows="1"></textarea>\n\t\t\t\t\t\t\t<small class="form-text text-muted">Related tag/s, delineated by <strong>any</strong> punctuation.</small>\n\t\t\t\t\t\t</div>\n            <div class="form-group col-lg-4 px-4 px-md-3">\n              <label for="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'date">Date</label>\n              <input id="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'date" data-output-field="From" type="text" data-output-type="date" class="dt-picker form-control" tabindex="5"'+(null!=(o=l.if.call(i,null!=a?a.date:a,{name:"if",hash:{},fn:t.program(7,e,0),inverse:t.noop,data:e}))?o:"")+'/>\n              <small class="form-text text-muted"></small>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n          \n\t\t\t\t\t<div class="row">\n            <div class="form-group col-lg-4 px-4 px-md-3 d-none d-lg-block">\n              <label for="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'time">Time</label>\n              <input type="text" id="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'time" data-source="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'details" data-extract="time|period" class="form-control" tabindex="-1" data-toggle="tooltip" readonly title="Automatically extracted from details" readonly/>\n\t\t\t\t\t\t</div>\n            \n            <div class="form-group col-lg-4 px-4 px-md-3 d-none d-lg-block">\n              <label for="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'time">Duration</label>\n              <input type="text" id="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'hours" data-source="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'details" data-extract="hours" class="form-control" tabindex="-1" data-toggle="tooltip" readonly title="Automatically extracted from details" readonly/>\n\t\t\t\t\t\t</div>\n            \n            <div class="form-group col-lg-4 px-4 px-md-3 d-none d-lg-block">\n              <label for="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'due">Due</label>\n              <input type="text" id="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'due" data-source="'+(null!=(o=l.if.call(i,null!=a?a.id:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+'details" data-extract="date" class="form-control" tabindex="-1" data-toggle="tooltip" readonly title="Automatically extracted from details" readonly/>\n              <small class="form-text text-muted"></small>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</form>\n      </div>\n      <div class="modal-footer">\n        '+(null!=(o=l.if.call(i,null!=a?a.actions:a,{name:"if",hash:{},fn:t.program(9,e,0),inverse:t.noop,data:e}))?o:"")+'\n\t\t\t\t<button type="button" class="btn btn-secondary btn-flat" data-dismiss="modal" tabindex="4">Close</button>\n        <button type="button" class="btn btn-primary" data-dismiss="modal" tabindex="3">Create</button>\n      </div>\n    </div>\n  </div>\n</div>\n'},usePartial:!0,useData:!0})}();