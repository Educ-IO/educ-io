!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{})["tab-tabs"]=a({1:function(a,n,e,l,t){var r,d=a.lambda,i=a.escapeExpression;return'<div id="tab_'+i(d(null!=n?n.id:n,n))+'" class="tab-pane fade" data-id="'+i(d(null!=n?n.id:n,n))+'" data-name="'+i(d(null!=n?n.name:n,n))+'" data-index="'+i(d(t&&t.index,n))+'"'+(null!=(r=e.if.call(null!=n?n:a.nullContext||{},null!=n?n.type:n,{name:"if",hash:{},fn:a.program(2,t,0),inverse:a.noop,data:t}))?r:"")+' role="tabpanel"></div>\n'},2:function(a,n,e,l,t){return' data-type="'+a.escapeExpression(a.lambda(null!=n?n.type:n,n))+'"'},compiler:[7,">= 4.0.0"],main:function(a,n,e,l,t){var r;return null!=(r=e.each.call(null!=n?n:a.nullContext||{},null!=n?n.tabs:n,{name:"each",hash:{},fn:a.program(1,t,0),inverse:a.noop,data:t}))?r:""},useData:!0})}();