!function(){var l=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).group_members=l({1:function(l,n,e,a,t){var r,s=l.lambda,i=l.escapeExpression;return'<li class="list-group-item pt-1 pb-2 px-2">\n  \t<small class="d-flex flex-wrap align-items-center mt-1">\n          <div class="mr-2 px-1 d-inline-flex justify-content-center align-items-center border rounded alert-light">\n            <i class="material-icons md-1">'+i(s(null!=(r=null!=n?n.type:n)?r.icon:r,n))+"</i>\n          </div>\n"+(null!=(r=e.is.call(null!=n?n:l.nullContext||{},null!=(r=null!=n?n.type:n)?r.name:r,"Group",{name:"is",hash:{},fn:l.program(2,t,0),inverse:l.program(4,t,0),data:t}))?r:"")+'      \t\t<div class="ml-2 px-1 d-inline-flex justify-content-center align-items-center border rounded alert-dark">\n            <i class="material-icons md-1">'+i(s(null!=(r=null!=n?n.role:n)?r.icon:r,n))+'</i>\n            <span class="px-1">'+i(s(null!=(r=null!=n?n.role:n)?r.name:r,n))+"</span>\n          </div>\n        </small>\n  </li>"},2:function(l,n,e,a,t){var r=l.escapeExpression,s=l.lambda;return'          <a href="#google|https://www.googleapis.com/auth/admin.directory.group.readonly,show.group.'+r(e.replace.call(null!=n?n:l.nullContext||{},null!=n?n.email:n,"\\.","%2E",{name:"replace",hash:{},data:t}))+'" title="'+r(s(null!=n?n.email:n,n))+'" data-group="'+r(s(null!=n?n.email:n,n))+'" class="font-weight-bold">'+r(s(null!=n?n.email:n,n))+"</a>\n"},4:function(l,n,e,a,t){var r;return'          <span class="font-weight-bold" '+(null!=(r=e.if.call(null!=n?n:l.nullContext||{},null!=n?n.email:n,{name:"if",hash:{},fn:l.program(5,t,0),inverse:l.noop,data:t}))?r:"")+">"+l.escapeExpression(l.lambda(null!=n?n.email:n,n))+"</span>\n"},5:function(l,n,e,a,t){return' title="'+l.escapeExpression(l.lambda(null!=n?n.email:n,n))+'"'},compiler:[7,">= 4.0.0"],main:function(l,n,e,a,t){var r;return'<ul class="list-group" data-members="'+l.escapeExpression(l.lambda(null!=n?n.email:n,n))+'">\n  '+(null!=(r=e.each.call(null!=n?n:l.nullContext||{},null!=n?n.members:n,{name:"each",hash:{},fn:l.program(1,t,0),inverse:l.noop,data:t}))?r:"")+"\n</ul>\n"},useData:!0})}();