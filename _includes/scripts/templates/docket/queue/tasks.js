!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).tasks=n({1:function(n,l,s,a,e){var t=n.lambda,i=n.escapeExpression;return'<div>\n          <span class="mr-1 font-weight-light">'+i(t(null!=l?l.name:l,l))+':</span><span class="font-weight-bold text-dark">'+i(t(null!=l?l.count:l,l))+"</span>\n        </div>"},3:function(n,l,s,a,e){var t=n.lambda,i=n.escapeExpression;return'<div>\n          <span class="mr-1 font-weight-light">'+i(t(null!=l?l.name:l,l))+':</span><span class="font-weight-bold text-secondary">'+i(t(null!=l?l.count:l,l))+"</span>\n        </div>"},compiler:[7,">= 4.0.0"],main:function(n,l,s,a,e){var t,i=null!=l?l:n.nullContext||{},c=n.lambda,o=n.escapeExpression;return'<div class="container-fluid mb-1 mb-xl-0">\n  \n  <div class="row">\n    \n    <div class="col-12 col-md-4 d-flex flex-column justify-content-center align-items-center mb-1 mb-md-0 px-1">\n      <div class="d-flex flex-column h-100 w-100 justify-content-center align-items-center bg-light">\n        '+(null!=(t=s.each.call(i,null!=l?l.assignments:l,{name:"each",hash:{},fn:n.program(1,e,0),inverse:n.noop,data:e}))?t:"")+'\n      </div>\n    </div>\n\n    <div class="col-12 col-md-4 d-flex flex-column justify-content-center align-items-center mb-1 mb-md-0 px-1">\n      <div class="d-flex flex-column h-100 w-100 justify-content-center align-items-center bg-light">\n        '+(null!=(t=s.each.call(i,null!=l?l.projects:l,{name:"each",hash:{},fn:n.program(3,e,0),inverse:n.noop,data:e}))?t:"")+'  \n      </div>\n    </div>\n\n    <div class="col-12 col-md-4 d-flex flex-column justify-content-center align-items-center border-md-right">\n\n      <div class="small">\n        <span class="mr-1 font-weight-light">Total:</span><span class="font-weight-bold text-secondary">'+o(c(null!=l?l.total:l,l))+'</span>\n      </div>\n      <div class="small">\n        <span class="mr-1 font-weight-light">Complete:</span><span class="font-weight-bold text-dark">'+o(c(null!=l?l.complete:l,l))+'</span>\n      </div>\n      <div class="small">\n        <span class="mr-1 font-weight-light">Timed:</span><span class="font-weight-bold">'+o(c(null!=l?l.timed:l,l))+'</span>\n      </div>\n      <div class="small">\n        <span class="mr-1 font-weight-light">Future:</span><span class="font-weight-bold">'+o(c(null!=l?l.future:l,l))+"</span>\n      </div>\n    </div>\n    \n  </div>\n  \n</div>\n"},useData:!0})}();