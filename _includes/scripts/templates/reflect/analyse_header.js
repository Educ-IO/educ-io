!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).analyse_header=n({1:function(n,l,a,e,t){return' id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'"'},3:function(n,l,a,e,t){return" col-md-6 col-xl-4"},5:function(n,l,a,e,t){var s;return null!=(s=a.each.call(null!=l?l:n.nullContext||{},null!=l?l.classes:l,{name:"each",hash:{},fn:n.program(6,t,0),inverse:n.noop,data:t}))?s:""},6:function(n,l,a,e,t){return" "+n.escapeExpression(n.lambda(l,l))},8:function(n,l,a,e,t){var s;return'<div class="d-inline-flex flex-column align-self-center col-12 col-md-6 col-xl-4 ml-3 ml-md-0">\n  \t'+(null!=(s=a.each.call(null!=l?l:n.nullContext||{},null!=l?l.subtitle:l,{name:"each",hash:{},fn:n.program(9,t,0),inverse:n.noop,data:t}))?s:"")+"\n  </div>"},9:function(n,l,a,e,t){return'<h5 class="d-flex m-0 p-1">\n  \t\t<span class="font-weight-light">'+n.escapeExpression(n.lambda(l,l))+"</span>\n  \t</h5>"},11:function(n,l,a,e,t){return' id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'_EXPORT"'},compiler:[7,">= 4.0.0"],main:function(n,l,a,e,t){var s,o=null!=l?l:n.nullContext||{};return'<div class="row justify-content-between w-100 mt-1 mt-lg-2">\n  <h4'+(null!=(s=a.if.call(o,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(1,t,0),inverse:n.noop,data:t}))?s:"")+' class="d-inline-flex align-self-start col-12'+(null!=(s=a.if.call(o,null!=l?l.subtitle:l,{name:"if",hash:{},fn:n.program(3,t,0),inverse:n.noop,data:t}))?s:"")+" display-4"+(null!=(s=a.if.call(o,null!=l?l.classes:l,{name:"if",hash:{},fn:n.program(5,t,0),inverse:n.noop,data:t}))?s:"")+'">\n  \t<span class="ml-2 text-muted font-weight-bold small">'+n.escapeExpression(n.lambda(null!=l?l.title:l,l))+"</span>\n  </h4>\n  "+(null!=(s=a.if.call(o,null!=l?l.subtitle:l,{name:"if",hash:{},fn:n.program(8,t,0),inverse:n.noop,data:t}))?s:"")+'\n  <div class="d-inline-flex flex-column align-self-center d-inline-flex flex-column align-self-center align-items-xl-end align-items-start col-12 col-md-12 col-xl-4 ml-3 ml-xl-0">\n      <div class="btn-group btn-group-lg mb-2 mb-md-0">\n        <a'+(null!=(s=a.if.call(o,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(11,t,0),inverse:n.noop,data:t}))?s:"")+' data-route="analyse.export.sheets" href="#"\n                role="button" class="btn btn-primary btn-lg d-flex"><i class="mr-2 material-icons md-light md-24 align-self-center">save_alt</i>Export</a>\n        <button type="button" class="btn btn-primary btn-lg dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n          <span class="sr-only">Toggle Dropdown</span>\n        </button>\n        <div class="dropdown-menu dropdown-menu-right">\n          <a class="dropdown-item" data-route="analyse.export.csv" href="#">CSV</a>\n          <a class="dropdown-item" data-route="analyse.export.excel" href="#">Excel</a>\n          <div class="dropdown-divider"></div>\n          <a class="dropdown-item" href="#instructions.export">About</a>\n        </div>\n    </div>\n  </div>\n\n</div>\n'},useData:!0})}();