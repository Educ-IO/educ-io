!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).text=n({1:function(n,l,a,e,r){return'id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'" '},3:function(n,l,a,e,r){return n.escapeExpression(n.lambda(null!=l?l.title:l,l))},5:function(n,l,a,e,r){return"Please enter value"},7:function(n,l,a,e,r){var o;return null!=(o=n.lambda(null!=l?l.message:l,l))?o:""},9:function(n,l,a,e,r){var o,t=null!=l?l:n.nullContext||{};return'          <div class="form-group d-flex flex-wrap">\n            <label class="col-12 col-lg-3 col-form-label"'+(null!=(o=a.if.call(t,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(10,r,0),inverse:n.noop,data:r}))?o:"")+">"+n.escapeExpression(n.lambda(null!=l?l.name:l,l))+"</label>\n            <input "+(null!=(o=a.if.call(t,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(12,r,0),inverse:n.noop,data:r}))?o:"")+' type="text" name="name" class="col-12 col-lg-9 form-control optional" />\n          </div>\n          <div class="form-group d-flex flex-wrap">\n            <label class="col-12 col-lg-3 col-form-label"'+(null!=(o=a.if.call(t,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(14,r,0),inverse:n.noop,data:r}))?o:"")+">"+(null!=(o=a.if.call(t,null!=l?l.value:l,{name:"if",hash:{},fn:n.program(16,r,0),inverse:n.program(18,r,0),data:r}))?o:"")+"</label>\n            <textarea "+(null!=(o=a.if.call(t,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(20,r,0),inverse:n.noop,data:r}))?o:"")+'name="value" class="col-12 col-lg-9 form-control-lg" rows="'+(null!=(o=a.if.call(t,null!=l?l.rows:l,{name:"if",hash:{},fn:n.program(22,r,0),inverse:n.program(24,r,0),data:r}))?o:"")+'"></textarea>\n          </div>\n'},10:function(n,l,a,e,r){return' for="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'_NAME" '},12:function(n,l,a,e,r){return'id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'_NAME" '},14:function(n,l,a,e,r){return' for="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'_VALUE" '},16:function(n,l,a,e,r){return n.escapeExpression(n.lambda(null!=l?l.value:l,l))},18:function(n,l,a,e,r){return"Value"},20:function(n,l,a,e,r){return'id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'_VALUE" '},22:function(n,l,a,e,r){return n.escapeExpression(n.lambda(null!=l?l.rows:l,l))},24:function(n,l,a,e,r){return"2"},26:function(n,l,a,e,r){var o,t=null!=l?l:n.nullContext||{};return"          <textarea "+(null!=(o=a.if.call(t,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(20,r,0),inverse:n.noop,data:r}))?o:"")+'name="value" class="form-control-lg w-100" rows="'+(null!=(o=a.if.call(t,null!=l?l.rows:l,{name:"if",hash:{},fn:n.program(22,r,0),inverse:n.program(24,r,0),data:r}))?o:"")+'"></textarea>\n'},28:function(n,l,a,e,r){return n.escapeExpression(n.lambda(null!=l?l.action:l,l))},30:function(n,l,a,e,r){return"Confirm"},compiler:[7,">= 4.0.0"],main:function(n,l,a,e,r){var o,t=null!=l?l:n.nullContext||{};return"<div "+(null!=(o=a.if.call(t,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(1,r,0),inverse:n.noop,data:r}))?o:"")+'class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_text_title">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_text_title">'+(null!=(o=a.if.call(t,null!=l?l.title:l,{name:"if",hash:{},fn:n.program(3,r,0),inverse:n.program(5,r,0),data:r}))?o:"")+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(o=a.if.call(t,null!=l?l.message:l,{name:"if",hash:{},fn:n.program(7,r,0),inverse:n.noop,data:r}))?o:"")+"\n        <form>\n"+(null!=(o=a.present.call(t,null!=l?l.name:l,{name:"present",hash:{},fn:n.program(9,r,0),inverse:n.program(26,r,0),data:r}))?o:"")+'        </form>\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-primary" data-dismiss="modal">'+(null!=(o=a.if.call(t,null!=l?l.action:l,{name:"if",hash:{},fn:n.program(28,r,0),inverse:n.program(30,r,0),data:r}))?o:"")+'</button>\n        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n'},useData:!0})}();