!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).analyse_body=a({1:function(a,n,l,e,s){return" "+a.escapeExpression(a.lambda(null!=n?n.class:n,n))},3:function(a,n,l,e,s){var r;return null!=(r=l.each.call(null!=n?n:a.nullContext||{},null!=n?n.classes:n,{name:"each",hash:{},fn:a.program(4,s,0),inverse:a.noop,data:s}))?r:""},4:function(a,n,l,e,s){return" "+a.escapeExpression(a.lambda(n,n))},compiler:[7,">= 4.0.0"],main:function(a,n,l,e,s){var r,t=null!=n?n:a.nullContext||{};return'<div class="container-fluid'+(null!=(r=l.if.call(t,null!=n?n.class:n,{name:"if",hash:{},fn:a.program(1,s,0),inverse:a.noop,data:s}))?r:"")+(null!=(r=l.if.call(t,null!=n?n.classes:n,{name:"if",hash:{},fn:a.program(3,s,0),inverse:a.noop,data:s}))?r:"")+'"></div>\n'},useData:!0})}();