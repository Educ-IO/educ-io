!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).items=n({1:function(n,e,l,t,a){var r,o=n.lookupProperty||function(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]};return null!=(r=o(l,"each").call(null!=e?e:n.nullContext||{},null!=e?o(e,"tasks"):e,{name:"each",hash:{},fn:n.program(2,a,0),inverse:n.noop,data:a,loc:{start:{line:2,column:15},end:{line:4,column:11}}}))?r:""},2:function(n,e,l,t,a){var r,o=n.lookupProperty||function(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]};return"\n"+(null!=(r=n.invokePartial(o(t,"item"),e,{name:"item",hash:{class:"unbounded col-lg-6 align-self-stretch",compact:!0,plain:!0,badges:!0,dates:!0},data:a,indent:"  ",helpers:l,partials:t,decorators:n.decorators}))?r:"")+"  "},compiler:[8,">= 4.3.0"],main:function(n,e,l,t,a){var r,o=n.lookupProperty||function(n,e){if(Object.prototype.hasOwnProperty.call(n,e))return n[e]};return'<div class="items-holder p-0 col-12 container-fluid d-flex flex-column flex-lg-row flex-lg-wrap align-items-center">\n  '+(null!=(r=o(l,"if").call(null!=e?e:n.nullContext||{},null!=e?o(e,"tasks"):e,{name:"if",hash:{},fn:n.program(1,a,0),inverse:n.noop,data:a,loc:{start:{line:2,column:2},end:{line:4,column:18}}}))?r:"")+"\n</div>\n"},usePartial:!0,useData:!0})}();