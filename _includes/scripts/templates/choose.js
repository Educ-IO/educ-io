!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).choose=n({1:function(n,a,l,e,s){var o;return null!=(o=n.lambda(null!=a?a.instructions:a,a))?o:""},3:function(n,a,l,e,s){var o,t=null!=a?a:n.nullContext||{};return'          <div class="form-group">\n            '+(null!=(o=l.if.call(t,null!=a?a.desc:a,{name:"if",hash:{},fn:n.program(4,s,0),inverse:n.noop,data:s}))?o:"")+'\n            <select class="custom-select form-control" id="choices" name="choices">\n'+(null!=(o=l.each.call(t,null!=a?a.choices:a,{name:"each",hash:{},fn:n.program(6,s,0),inverse:n.noop,data:s}))?o:"")+"            </select>\n          </div>\n"},4:function(n,a,l,e,s){return'<label for="choices">'+n.escapeExpression(n.lambda(null!=a?a.desc:a,a))+"</label>"},6:function(n,a,l,e,s){var o;return'              <option value="'+n.escapeExpression(n.lambda(s&&s.key,a))+'">'+(null!=(o=l.exists.call(null!=a?a:n.nullContext||{},null!=a?a.name:a,{name:"exists",hash:{},fn:n.program(7,s,0),inverse:n.program(12,s,0),data:s}))?o:"")+"</option>\n"},7:function(n,a,l,e,s){var o;return null!=(o=l.if.call(null!=a?a:n.nullContext||{},null!=a?a.name:a,{name:"if",hash:{},fn:n.program(8,s,0),inverse:n.noop,data:s}))?o:""},8:function(n,a,l,e,s){var o;return n.escapeExpression(n.lambda(null!=a?a.name:a,a))+(null!=(o=l.exists.call(null!=a?a:n.nullContext||{},null!=a?a.desc:a,{name:"exists",hash:{},fn:n.program(9,s,0),inverse:n.noop,data:s}))?o:"")},9:function(n,a,l,e,s){var o;return null!=(o=l.if.call(null!=a?a:n.nullContext||{},null!=a?a.desc:a,{name:"if",hash:{},fn:n.program(10,s,0),inverse:n.noop,data:s}))?o:""},10:function(n,a,l,e,s){return" - "+n.escapeExpression(n.lambda(null!=a?a.desc:a,a))},12:function(n,a,l,e,s){return n.escapeExpression(n.lambda(a,a))},14:function(n,a,l,e,s){var o,t=null!=a?a:n.nullContext||{};return"          "+(null!=(o=l.if.call(t,null!=a?a.desc:a,{name:"if",hash:{},fn:n.program(4,s,0),inverse:n.noop,data:s}))?o:"")+'\n          <fieldset class="form-group" id="choices">\n'+(null!=(o=l.each.call(t,null!=a?a.choices:a,{name:"each",hash:{},fn:n.program(15,s,0),inverse:n.noop,data:s}))?o:"")+"          </fieldset>\n"},15:function(n,a,l,e,s){var o,t=n.lambda,i=n.escapeExpression,r=null!=a?a:n.nullContext||{};return'              <div class="form-check">\n                <label class="form-check-label">\n                  <input class="form-check-input" type="radio" name="choices" id="choice_'+i(t(s&&s.key,a))+'" value="'+i(t(s&&s.key,a))+'"'+(null!=(o=l.if.call(r,s&&s.first,{name:"if",hash:{},fn:n.program(16,s,0),inverse:n.noop,data:s}))?o:"")+">\n                  "+(null!=(o=l.exists.call(r,null!=a?a.name:a,{name:"exists",hash:{},fn:n.program(7,s,0),inverse:n.program(12,s,0),data:s}))?o:"")+"\n                </label>\n              </div>\n"},16:function(n,a,l,e,s){return" checked"},18:function(n,a,l,e,s){return'<button type="button" class="btn btn-primary waves-effect" data-dismiss="modal">'+n.escapeExpression(n.lambda(null!=a?a.action:a,a))+"</button>"},compiler:[7,">= 4.0.0"],main:function(n,a,l,e,s){var o,t=n.lambda,i=n.escapeExpression,r=null!=a?a:n.nullContext||{};return'<div id="'+i(t(null!=a?a.id:a,a))+'" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_choose_title">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_choose_title">'+i(t(null!=a?a.title:a,a))+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(o=l.if.call(r,null!=a?a.instructions:a,{name:"if",hash:{},fn:n.program(1,s,0),inverse:n.noop,data:s}))?o:"")+"\n        <form>\n"+(null!=(o=l.if.call(r,null!=a?a.__LONG:a,{name:"if",hash:{},fn:n.program(3,s,0),inverse:n.program(14,s,0),data:s}))?o:"")+'        </form>        \n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-secondary btn-outline-secondary btn-flat waves-effect" data-dismiss="modal">Close</button>\n        '+(null!=(o=l.if.call(r,null!=a?a.action:a,{name:"if",hash:{},fn:n.program(18,s,0),inverse:n.noop,data:s}))?o:"")+"\n      </div>\n    </div>\n  </div>\n</div>\n"},useData:!0})}();