!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).pill=a({compiler:[7,">= 4.0.0"],main:function(a,e,l,n,t){var i=null!=e?e:a.nullContext||{},s=a.escapeExpression;return'<span class="badge lead badge-pill badge-'+s(l.either.call(i,null!=e?e.type:e,"dark",{name:"either",hash:{},data:t}))+' mr-2 mt-2 d-inline-flex align-items-center">\n  \t<p class="lead d-inline-flex p-1 my-0" data-output-name="'+s(l.either.call(i,null!=e?e.name:e,"*",{name:"either",hash:{},data:t}))+'">'+s(a.lambda(null!=e?e.value:e,e))+'</p>\n  \t<a role="button" data-action="remove" class="close d-inline-flex" aria-label="Remove" href="#"><span aria-hidden="true">×</span></a></span>\n'},useData:!0})}();