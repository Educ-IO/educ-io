!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).host=n({1:function(n,l,a,s,e){return'id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'" '},3:function(n,l,a,s,e){var i;return null!=(i=n.lambda(null!=l?l.instructions:l,l))?i:""},5:function(n,l,a,s,e){var i;return null!=(i=n.lambda(null!=l?l.run_all:l,l))?i:""},7:function(n,l,a,s,e){var i;return null!=(i=n.lambda(null!=l?l.tests:l,l))?i:""},compiler:[7,">= 4.0.0"],main:function(n,l,a,s,e){var i,t=null!=l?l:n.nullContext||{};return"<div "+(null!=(i=a.if.call(t,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(1,e,0),inverse:n.noop,data:e}))?i:"")+'class="container-fluid p-3">\n  <div class="row jumbotron pt-4 pb-3 mb-2">\n    <div class="col">\n      '+(null!=(i=a.if.call(t,null!=l?l.instructions:l,{name:"if",hash:{},fn:n.program(3,e,0),inverse:n.noop,data:e}))?i:"")+'\n      <div class="d-flex justify-content-start align-items-center">\n        '+(null!=(i=a.if.call(t,null!=l?l.run_all:l,{name:"if",hash:{},fn:n.program(5,e,0),inverse:n.noop,data:e}))?i:"")+'\n        <span id="'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'_counter" class="text-muted">\n          <span class="d-inline d-lg-none display-4 content ml-1"></span>\n          <span class="d-none d-lg-inline display-3 content"></span>\n        </span>\n      </div>\n    </div>\n  </div>\n  <div class="row">\n    <div class="d-flex flex-column">\n      '+(null!=(i=a.if.call(t,null!=l?l.tests:l,{name:"if",hash:{},fn:n.program(7,e,0),inverse:n.noop,data:e}))?i:"")+"\n    </div>\n  </div>\n</div>\n"},useData:!0})}();