!function(){var e=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).custom_properties=e({1:function(e,a,n,l,r,i,s){var t;return null!=(t=n.if.call(null!=a?a:e.nullContext||{},a,{name:"if",hash:{},fn:e.program(2,r,0,i,s),inverse:e.noop,data:r}))?t:""},2:function(e,a,n,l,r,i,s){var t,o=null!=a?a:e.nullContext||{},u=e.lambda,p=e.escapeExpression;return'<span class="custom-property badge badge-secondary'+(null!=(t=n.si.call(o,a,"High",{name:"si",hash:{},fn:e.program(3,r,0,i,s),inverse:e.noop,data:r}))?t:"")+(null!=(t=n.si.call(o,a,"Medium",{name:"si",hash:{},fn:e.program(5,r,0,i,s),inverse:e.noop,data:r}))?t:"")+(null!=(t=n.si.call(o,a,"Low",{name:"si",hash:{},fn:e.program(7,r,0,i,s),inverse:e.noop,data:r}))?t:"")+(null!=(t=n.si.call(o,a,"None",{name:"si",hash:{},fn:e.program(9,r,0,i,s),inverse:e.noop,data:r}))?t:"")+(null!=(t=n.si.call(o,r&&r.key,"Review",{name:"si",hash:{},fn:e.program(11,r,0,i,s),inverse:e.noop,data:r}))?t:"")+(null!=(t=n.si.call(o,r&&r.key,"Reviewed",{name:"si",hash:{},fn:e.program(13,r,0,i,s),inverse:e.noop,data:r}))?t:"")+' ml-lg-1  mr-1" title="">\n  '+(null!=(t=n.exists.call(o,null!=s[1]?s[1].private:s[1],{name:"exists",hash:{},fn:e.program(15,r,0,i,s),inverse:e.noop,data:r}))?t:"")+'\n  <a role="button" aria-label="Search" href="#search.properties.'+p(u(r&&r.key,a))+"."+p(u(a,a))+'" title="Find all files with the same Tag/Value"><i class="material-icons h-100 d-inline-flex" >search</i></a>\n  '+p(u(r&&r.key,a))+" - "+p(u(a,a))+'\n  <a role="button" class="close" aria-label="Close" href="#remove.tag.'+p(u(null!=s[1]?s[1].id:s[1],a))+"."+p(u(r&&r.key,a))+'" title="Remove Tag"><span aria-hidden="true">&times;</span></a></span>'},3:function(e,a,n,l,r){return" badge-danger"},5:function(e,a,n,l,r){return" badge-warning"},7:function(e,a,n,l,r){return" badge-success"},9:function(e,a,n,l,r){return" badge-info"},11:function(e,a,n,l,r){return" badge-dark"},13:function(e,a,n,l,r){return" badge-light"},15:function(e,a,n,l,r){return'<i class="material-icons h-100 d-inline-flex pr-1" title="Visible only with this App">lock</i>'},compiler:[7,">= 4.0.0"],main:function(e,a,n,l,r,i,s){var t;return(null!=(t=n.each.call(null!=a?a:e.nullContext||{},null!=a?a.properties:a,{name:"each",hash:{},fn:e.program(1,r,0,i,s),inverse:e.noop,data:r}))?t:"")+"\n"},useData:!0,useDepths:!0})}();