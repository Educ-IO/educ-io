!function(){var l=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).group_members=l({1:function(l,n,a,e,s){var t,r=l.lambda,i=l.escapeExpression;return'<li class="list-group-item pt-0 pb-1 px-1">\n  \t<small class="d-flex flex-wrap align-items-center mt-1">\n          <div class="mr-1 px-0 d-inline-flex justify-content-center align-items-center border rounded alert-light small">\n            <i class="material-icons md-1">'+i(r(null!=(t=null!=n?n.type:n)?t.icon:t,n))+"</i>\n          </div>\n"+(null!=(t=a.is.call(null!=n?n:l.nullContext||{},null!=(t=null!=n?n.type:n)?t.name:t,"Group",{name:"is",hash:{},fn:l.program(2,s,0),inverse:l.program(4,s,0),data:s}))?t:"")+'      \t\t<div class="ml-1 pr-1 d-inline-flex justify-content-center align-items-center border rounded alert-dark small">\n            <i class="material-icons md-1">'+i(r(null!=(t=null!=n?n.role:n)?t.icon:t,n))+'</i>\n            <span class="pl-1">'+i(r(null!=(t=null!=n?n.role:n)?t.name:t,n))+"</span>\n          </div>\n        </small>\n  </li>"},2:function(l,n,a,e,s){var t=l.escapeExpression,r=l.lambda;return'          <a href="#google|https://www.googleapis.com/auth/admin.directory.group.readonly,show.group.'+t(a.replace.call(null!=n?n:l.nullContext||{},null!=n?n.email:n,"\\.","%2E",{name:"replace",hash:{},data:s}))+'" title="'+t(r(null!=n?n.email:n,n))+'" data-group="'+t(r(null!=n?n.email:n,n))+'" class="font-weight-bold small">'+t(r(null!=n?n.email:n,n))+"</a>\n"},4:function(l,n,a,e,s){var t;return'          <span class="font-weight-bold small" '+(null!=(t=a.if.call(null!=n?n:l.nullContext||{},null!=n?n.email:n,{name:"if",hash:{},fn:l.program(5,s,0),inverse:l.noop,data:s}))?t:"")+">"+l.escapeExpression(l.lambda(null!=n?n.email:n,n))+"</span>\n"},5:function(l,n,a,e,s){return' title="'+l.escapeExpression(l.lambda(null!=n?n.email:n,n))+'"'},compiler:[7,">= 4.0.0"],main:function(l,n,a,e,s){var t;return'<ul class="list-group" data-members="'+l.escapeExpression(l.lambda(null!=n?n.email:n,n))+'">\n  '+(null!=(t=a.each.call(null!=n?n:l.nullContext||{},null!=n?n.members:n,{name:"each",hash:{},fn:l.program(1,s,0),inverse:l.noop,data:s}))?t:"")+"\n</ul>\n"},useData:!0})}();