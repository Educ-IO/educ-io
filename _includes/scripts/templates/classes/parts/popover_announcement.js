!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).popover_announcement=a({compiler:[7,">= 4.0.0"],main:function(a,e,n,l,t){var s=a.lambda,r=a.escapeExpression;return"<span><strong>"+r(s(null!=e?e.name:e,e))+"</strong></span>\n<br />\n<span class='d-flex align-items-center'><em class='text-muted pr-1'>"+r(n.either.call(null!=e?e:a.nullContext||{},null!=e?e.creator:e,"Updated",{name:"either",hash:{},data:t}))+"</em><span class='badge badge-"+r(s(null!=e?e.badge:e,e))+" ml-1'>"+r(s(null!=e?e.date:e,e))+"</span></span>\n"},useData:!0})}();