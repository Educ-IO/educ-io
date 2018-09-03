!function(){var t=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).rename=t({1:function(t,a,l,e,n){var s;return null!=(s=t.lambda(null!=a?a.instructions:a,a))?s:""},3:function(t,a,l,e,n){var s;return null!=(s=t.invokePartial(e.populate_buttons,null!=a?a.shortcuts:a,{name:"populate_buttons",data:n,helpers:l,partials:e,decorators:t.decorators}))?s:""},5:function(t,a,l,e,n){var s;return t.escapeExpression(t.lambda(null!=(s=null!=a?a.state:a)?s.names:s,a))},7:function(t,a,l,e,n){var s;return null!=(s=l.each.call(null!=a?a:t.nullContext||{},null!=a?a.actions:a,{name:"each",hash:{},fn:t.program(8,n,0),inverse:t.noop,data:n}))?s:""},8:function(t,a,l,e,n){var s;return null!=(s=t.invokePartial(e.control_button,a,{name:"control_button",hash:{b_text:null!=a?a.text:a,b_title:null!=a?a.desc:a,b_action:l.concat.call(null!=a?a:t.nullContext||{},"actions_",n&&n.index,{name:"concat",hash:{},data:n}),b_id:null!=a?a.id:a,b_class:"btn-outline-info"},data:n,helpers:l,partials:e,decorators:t.decorators}))?s:""},compiler:[7,">= 4.0.0"],main:function(t,a,l,e,n){var s,o=t.lambda,r=null!=a?a:t.nullContext||{};return'<div id="'+t.escapeExpression(o(null!=a?a.id:a,a))+'" class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_options_title">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_options_title">'+(null!=(s=o(null!=a?a.title:a,a))?s:"")+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(s=l.if.call(r,null!=a?a.instructions:a,{name:"if",hash:{},fn:t.program(1,n,0),inverse:t.noop,data:n}))?s:"")+"\n\t\t\t\t"+(null!=(s=l.if.call(r,null!=a?a.shortcuts:a,{name:"if",hash:{},fn:t.program(3,n,0),inverse:t.noop,data:n}))?s:"")+'\n\t\t\t\t<form class="needs-validation mt-3" novalidate>\n          <div class="row mb-2">\n\t\t\t\t\t\t<div class="col-lg-5">\n\t\t\t\t\t\t\t<label for="searchRegex">Search</label>\n              <button type="button" class="close" data-action="clear" data-clear="searchRegex" aria-label="Clear"><span aria-hidden="true">&times;</span></button>\n\t\t\t\t\t\t  <input type="text" id="searchRegex" class="form-control" />\n\t\t\t\t\t\t  <small class="form-text text-muted">The regex to search for.</small>\n\t\t\t\t\t\t</div>\n            <div class="col-lg-5">\n\t\t\t\t\t\t\t<label for="replaceValue">Replace</label>\n              <button type="button" class="close" data-action="clear" data-clear="replaceValue" aria-label="Clear"><span aria-hidden="true">&times;</span></button>\n\t\t\t\t\t\t  <input type="text" id="replaceValue" class="form-control" />\n\t\t\t\t\t\t  <small class="form-text text-muted">The value to replace with.</small>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div class="col-lg-2 d-flex align-items-center">\n\t\t\t\t\t\t\t<button type="button" data-action="replace" data-regex="searchRegex" data-replace="replaceValue" data-target="renameNames" class="btn btn-dark mt-2">Replace</button>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t\t<div class="row">\n\t\t\t\t\t\t<div class="form-group col-lg-12">\n\t\t\t\t\t\t\t<label for="renameNames">Names</label>\n              <textarea id="renameNames" name="names" style="max-height: 50vh;" class="form-control resizable" rows="6">'+(null!=(s=l.if.call(r,null!=a?a.state:a,{name:"if",hash:{},fn:t.program(5,n,0),inverse:t.noop,data:n}))?s:"")+'</textarea>\n\t\t\t\t\t\t  <small class="form-text text-muted">The names of the files/folders.</small>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</form>\n      </div>\n      <div class="modal-footer">\n        '+(null!=(s=l.if.call(r,null!=a?a.actions:a,{name:"if",hash:{},fn:t.program(7,n,0),inverse:t.noop,data:n}))?s:"")+'\n\t\t\t\t<button type="button" class="btn btn-primary" data-dismiss="modal">Rename</button>\n\t\t\t\t<button type="button" class="btn btn-secondary btn-flat" data-dismiss="modal">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n'},usePartial:!0,useData:!0})}();