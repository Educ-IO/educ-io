!function(){var e=Handlebars.template;(Handlebars.templates=Handlebars.templates||{})["feature-badge"]=e({compiler:[8,">= 4.3.0"],main:function(e,a,n,l,t){var o=e.lambda,r=e.escapeExpression,s=null!=a?a:e.nullContext||{},d=e.lookupProperty||function(e,a){if(Object.prototype.hasOwnProperty.call(e,a))return e[a]};return'<span class="badge badge-highlight badge-pill mr-1" data-id="'+r(o(null!=a?d(a,"id"):a,a))+'" data-feature="'+r(o(null!=a?d(a,"name"):a,a))+'">\n  <span class="d-inline-flex p-1 my-0" data-output-name="*">'+r(o(null!=a?d(a,"display"):a,a))+'</span>\n  <a role="button" class="close d-inline-flex pl-1" aria-label="Remove" href="#remove.feature.'+r(d(n,"encode").call(s,null!=a?d(a,"id"):a,{name:"encode",hash:{},data:t,loc:{start:{line:3,column:94},end:{line:3,column:107}}}))+"."+r(d(n,"encode").call(s,null!=a?d(a,"name"):a,{name:"encode",hash:{},data:t,loc:{start:{line:3,column:108},end:{line:3,column:123}}}))+'" title="Remove Feature"><span aria-hidden="true">&times;</span></a>\n</span>\n'},useData:!0})}();