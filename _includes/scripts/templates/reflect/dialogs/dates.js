!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).dates=a({1:function(a,n,l,t,e,o,c){var s,i=null!=n?n:a.nullContext||{};return"<form>\n  "+(null!=(s=l.if.call(i,null!=n?n.periods:n,{name:"if",hash:{},fn:a.program(2,e,0,o,c),inverse:a.noop,data:e}))?s:"")+'\n  <fieldset id="'+a.escapeExpression(l.concat.call(i,null!=n?n.id:n,"_CUSTOM",{name:"concat",hash:{},data:e}))+'" name="custom">\n'+(null!=(s=a.invokePartial(t.field_span,n,{name:"field_span",hash:{historical:!0,id:l.concat.call(i,null!=n?n.id:n,"_RANGE",{name:"concat",hash:{},data:e})},data:e,indent:"    ",helpers:l,partials:t,decorators:a.decorators}))?s:"")+"  </fieldset>\n</form>\n"},2:function(a,n,l,t,e,o,c){var s,i=null!=n?n:a.nullContext||{},d=a.escapeExpression,r=a.lambda;return'<fieldset id="'+d(l.concat.call(i,null!=n?n.id:n,"_PERIOD",{name:"concat",hash:{},data:e}))+'" name="period">\n    <div class="form-group" data-output-field="Period">\n      <div class="custom-control custom-radio custom-control-inline">\n        <input type="radio" id="'+d(l.concat.call(i,null!=n?n.id:n,"_PERIOD__DEFAULT",{name:"concat",hash:{},data:e}))+'"\n               name="period_Select" class="custom-control-input"\n               data-targets="'+d(r(null!=n?n.id:n,n))+'_PERIOD__SPAN" data-value="" checked>\n        <label class="custom-control-label"\n               for="'+d(l.concat.call(i,null!=n?n.id:n,"_PERIOD__DEFAULT",{name:"concat",hash:{},data:e}))+'">Custom Range</label>\n      </div>\n'+(null!=(s=l.each.call(i,null!=n?n.periods:n,{name:"each",hash:{},fn:a.program(3,e,0,o,c),inverse:a.noop,data:e}))?s:"")+'      <input type="text" data-output-name="Span" id="'+d(r(null!=n?n.id:n,n))+'_PERIOD__SPAN"\n                   name="'+d(r(null!=n?n.id:n,n))+'_PERIOD__SPAN" class="d-none" />\n    </div>\n  </fieldset>'},3:function(a,n,l,t,e,o,c){var s=null!=n?n:a.nullContext||{},i=a.escapeExpression,d=a.lambda;return'      <div class="custom-control custom-radio custom-control-inline">\n        <input type="radio" id="'+i(l.concat.call(s,null!=c[1]?c[1].id:c[1],"_PERIOD_",null!=n?n.value:n,{name:"concat",hash:{},data:e}))+'"\n               name="period_Select" class="custom-control-input"\n               data-span="'+i(d(null!=n?n.span:n,n))+'" data-targets="'+i(d(null!=c[1]?c[1].id:c[1],n))+'_PERIOD__SPAN"\n               data-value="'+i(d(null!=n?n.span:n,n))+'">\n        <label class="custom-control-label"\n               for="'+i(l.concat.call(s,null!=c[1]?c[1].id:c[1],"_PERIOD_",null!=n?n.value:n,{name:"concat",hash:{},data:e}))+'">'+i(d(null!=n?n.name:n,n))+"</label>\n      </div>\n"},compiler:[7,">= 4.0.0"],main:function(a,n,l,t,e,o,c){var s;return null!=(s=a.invokePartial(t.dialog,n,{name:"dialog",hash:{tabindex:3,class:"modal-lg",action:l.either.call(null!=n?n:a.nullContext||{},null!=n?n.action:n,"Continue",{name:"either",hash:{},data:e})},fn:a.program(1,e,0,o,c),inverse:a.noop,data:e,helpers:l,partials:t,decorators:a.decorators}))?s:""},usePartial:!0,useData:!0,useDepths:!0})}();