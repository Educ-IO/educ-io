!function(){var t=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).send=t({1:function(t,a,n,l,e){var i;return null!=(i=t.lambda(null!=a?a.title:a,a))?i:""},3:function(t,a,n,l,e){var i;return null!=(i=t.lambda(null!=a?a.instructions:a,a))?i:""},5:function(t,a,n,l,e){return t.escapeExpression(t.lambda(null!=a?a.action:a,a))},7:function(t,a,n,l,e){return"Send"},compiler:[7,">= 4.0.0"],main:function(t,a,n,l,e){var i,o=t.lambda,s=t.escapeExpression,d=null!=a?a:t.nullContext||{};return'<div id="'+s(o(null!=a?a.id:a,a))+'" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_options_title">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_options_title">'+(null!=(i=n.if.call(d,null!=a?a.title:a,{name:"if",hash:{},fn:t.program(1,e,0),inverse:t.noop,data:e}))?i:"")+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(i=n.if.call(d,null!=a?a.instructions:a,{name:"if",hash:{},fn:t.program(3,e,0),inverse:t.noop,data:e}))?i:"")+'\n\t\t\t\t<form>\n          <textarea data-output-field="Message" class="form-control form-control-lg w-100 resizable optional" rows="3"></textarea>\n'+(null!=(i=t.invokePartial(l.recipients,a,{name:"recipients",hash:{values:null!=a?a.emails:a,id:n.concat.call(d,null!=a?a.id:a,"_EMAILS",{name:"concat",hash:{},data:e})},data:e,indent:"          ",helpers:n,partials:l,decorators:t.decorators}))?i:"")+'\t\t\t\t</form>\n        <ul class="list-group list-group-flush">\n          <li class="list-group-item d-flex justify-content-between align-items-center">\n\t\t\t\t\t\t<input data-action="add" id="'+s(o(null!=a?a.id:a,a))+'_EMAIL" class="form-control mr-3" type="text"\n                   data-target="'+s(o(null!=a?a.id:a,a))+'_EMAILS" data-template="pill" />\n            <button data-action="add" type="button" class="btn btn-primary"\n                    data-target="'+s(o(null!=a?a.id:a,a))+'_EMAIL">Add</button>\n          </li>\n\t\t\t\t</ul>\n      </div>\n      <div class="modal-footer">\n\t\t\t\t<button type="button" class="btn btn-secondary btn-flat" data-dismiss="modal"\n                tabindex="2">Close</button>\n        <button type="button" class="btn btn-primary" data-dismiss="modal"\n                tabindex="1">'+(null!=(i=n.if.call(d,null!=a?a.action:a,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.program(7,e,0),data:e}))?i:"")+"</button>\n      </div>\n    </div>\n  </div>\n</div>\n"},usePartial:!0,useData:!0})}();