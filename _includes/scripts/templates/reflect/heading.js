!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).heading=a({1:function(a,l,e,n,s){return' style="display: none;"'},3:function(a,l,e,n,s){return" show"},compiler:[7,">= 4.0.0"],main:function(a,l,e,n,s){var t,r=a.lambda,i=a.escapeExpression,o=null!=l?l:a.nullContext||{};return'<div id="header_'+i(r(null!=l?l.target:l,l))+'" class="card-header border-bottom-0 d-flex align-items-center">\n  <a class="smooth-scroll d-inline-flex text-decoration-none mr-2" href="#header__headings">\n    <i class="material-icons md-1">home</i>\n  </a>\n  <h5 class="mb-0 d-inline">'+i(r(null!=l?l.name:l,l))+'</h5>\n  <a class="d-inline-flex text-decoration-none ml-auto" data-toggle="collapse"\n     href="#collapse_'+i(r(null!=l?l.target:l,l))+'" aria-expanded="false" aria-controls="collapse_'+i(r(null!=l?l.target:l,l))+'">\n    <i'+(null!=(t=e.unless.call(o,null!=l?l.hide:l,{name:"unless",hash:{},fn:a.program(1,s,0),inverse:a.noop,data:s}))?t:"")+' class="material-icons md-18"\n                data-listen="#collapse_'+i(r(null!=l?l.target:l,l))+'" data-event="hidden.bs.collapse">expand_more</i>\n    <i'+(null!=(t=e.if.call(o,null!=l?l.hide:l,{name:"if",hash:{},fn:a.program(1,s,0),inverse:a.noop,data:s}))?t:"")+' class="material-icons md-18"\n            data-listen="#collapse_'+i(r(null!=l?l.target:l,l))+'" data-event="shown.bs.collapse">expand_less</i>\n  </a>\n</div>\n\n<div id="collapse_'+i(r(null!=l?l.target:l,l))+'" class="collapse'+(null!=(t=e.unless.call(o,null!=l?l.hide:l,{name:"unless",hash:{},fn:a.program(3,s,0),inverse:a.noop,data:s}))?t:"")+'" role="tabpanel"\n     aria-labelledby="header_'+i(r(null!=l?l.target:l,l))+'">\n  <div class="card-body">\n'+(null!=(t=a.invokePartial(n["@partial-block"],l,{name:"@partial-block",data:s,indent:"\t\t",helpers:e,partials:n,decorators:a.decorators}))?t:"")+"  </div>\n</div>\n"},usePartial:!0,useData:!0})}();