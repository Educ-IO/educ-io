!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).analyse_header=n({1:function(n,l,a,e,t){return' id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'"'},3:function(n,l,a,e,t){return" col-md-6 col-xl-4"},5:function(n,l,a,e,t){var s;return null!=(s=a.each.call(null!=l?l:n.nullContext||{},null!=l?l.classes:l,{name:"each",hash:{},fn:n.program(6,t,0),inverse:n.noop,data:t}))?s:""},6:function(n,l,a,e,t){return" "+n.escapeExpression(n.lambda(l,l))},8:function(n,l,a,e,t){var s;return'<div class="d-inline-flex flex-column align-self-centercol-12 col-md-6 col-xl-8 ml-3 ml-md-0">\n  \t'+(null!=(s=a.each.call(null!=l?l:n.nullContext||{},null!=l?l.subtitle:l,{name:"each",hash:{},fn:n.program(9,t,0),inverse:n.noop,data:t}))?s:"")+"\n  </div>"},9:function(n,l,a,e,t){return'<h5 class="d-flex m-0 p-1">\n  \t\t<span class="font-weight-light">'+n.escapeExpression(n.lambda(l,l))+"</span>\n  \t</h5>"},compiler:[7,">= 4.0.0"],main:function(n,l,a,e,t){var s,i=null!=l?l:n.nullContext||{};return'<div class="row justify-content-between w-100 mt-1 mt-lg-2">\n  <h4'+(null!=(s=a.if.call(i,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(1,t,0),inverse:n.noop,data:t}))?s:"")+' class="d-inline-flex align-self-start col-12'+(null!=(s=a.if.call(i,null!=l?l.subtitle:l,{name:"if",hash:{},fn:n.program(3,t,0),inverse:n.noop,data:t}))?s:"")+" display-4"+(null!=(s=a.if.call(i,null!=l?l.classes:l,{name:"if",hash:{},fn:n.program(5,t,0),inverse:n.noop,data:t}))?s:"")+'">\n  \t<span class="ml-2 text-muted font-weight-bold small">'+n.escapeExpression(n.lambda(null!=l?l.title:l,l))+"</span>\n  </h4>\n  "+(null!=(s=a.if.call(i,null!=l?l.subtitle:l,{name:"if",hash:{},fn:n.program(8,t,0),inverse:n.noop,data:t}))?s:"")+"\n</div>\n"},useData:!0})}();