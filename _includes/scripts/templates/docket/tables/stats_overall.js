!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).stats_overall=n({1:function(n,s,a,e,l){return'<div>\n    <span class="display-3 d-flex align-items-center">\n      <span class="font-weight-bold text-dark mr-2 mr-xl-4">'+n.escapeExpression(n.lambda(null!=s?s.average:s,s))+'</span>\n      <span class="small text-success font-weight-light">avg</span>\n    </span>\n  </div>'},3:function(n,s,a,e,l){return'<div class="small">\n    <span class="display-5 d-flex align-items-center">\n      <span class="font-weight-bold text-secondary mr-2 mr-xl-4">'+n.escapeExpression(n.lambda(null!=s?s.sd:s,s))+'</span>\n      <span class="small text-info font-weight-lighter">std dev</span>\n    </span>\n  </div>'},compiler:[7,">= 4.0.0"],main:function(n,s,a,e,l){var t,i=null!=s?s:n.nullContext||{};return'<div class="d-flex justify-content-center nvh-25 flex-column py-2 px-3 bg-light border">\n  '+(null!=(t=a.exists.call(i,null!=s?s.average:s,{name:"exists",hash:{},fn:n.program(1,l,0),inverse:n.noop,data:l}))?t:"")+"\n  "+(null!=(t=a.exists.call(i,null!=s?s.sd:s,{name:"exists",hash:{},fn:n.program(3,l,0),inverse:n.noop,data:l}))?t:"")+'\n  <h4 class="font-weight-light text-lg-right mr-lg-2"><strong>days</strong> / item</h4>\n</div>\n'},useData:!0})}();