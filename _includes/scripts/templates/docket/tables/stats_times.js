!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).stats_times=n({1:function(n,l,a,e,t){var s,r=n.lookupProperty||function(n,l){if(Object.prototype.hasOwnProperty.call(n,l))return n[l]};return'<div class="small pb-2 border-bottom">\n    <span class="display-5 d-flex align-items-center">\n      <i class="material-icons md-36 mr-2">schedule</i>\n      <span class="font-weight-bold text-secondary mr-2">'+n.escapeExpression(n.lambda(null!=l?r(l,"timed"):l,l))+'</span>\n      <span class="small text-danger font-weight-lighter">timed items</span>\n    </span>\n    '+(null!=(s=r(a,"if").call(null!=l?l:n.nullContext||{},null!=l?r(l,"future"):l,{name:"if",hash:{},fn:n.program(2,t,0),inverse:n.noop,data:t,loc:{start:{line:8,column:4},end:{line:11,column:18}}}))?s:"")+"\n  </div>"},2:function(n,l,a,e,t){var s=n.lookupProperty||function(n,l){if(Object.prototype.hasOwnProperty.call(n,l))return n[l]};return'<span class="display-5 d-flex align-items-center">\n      <span class="font-weight-bold text-primary mr-2">'+n.escapeExpression(n.lambda(null!=l?s(l,"future"):l,l))+'</span>\n      <span class="small text-dark font-weight-lighter">scheduled in the <b>future</b></span>\n    </span>'},4:function(n,l,a,e,t){var s=n.lambda,r=n.escapeExpression,i=n.lookupProperty||function(n,l){if(Object.prototype.hasOwnProperty.call(n,l))return n[l]};return'<div class="small mt-2 pb-2 border-bottom">\n    <span class="display-5 d-flex flex-row align-items-center">\n      <i class="material-icons md-36 mr-2">av_timer</i>\n      <span class="text-secondary mr-2">'+r(s(null!=l?i(l,"durations"):l,l))+'</span>\n      <span class="small text-info font-weight-lighter mr-2">items totalling</span>\n      <span class="small font-weight-normal text-dark" data-toggle="tooltip" title="'+r(s(null!=l?i(l,"hours"):l,l))+' hrs">'+r(s(null!=l?i(l,"duration"):l,l))+"</span>\n    </span>\n  </div>"},compiler:[8,">= 4.3.0"],main:function(n,l,a,e,t){var s,r=null!=l?l:n.nullContext||{},i=n.lookupProperty||function(n,l){if(Object.prototype.hasOwnProperty.call(n,l))return n[l]};return'<div class="d-flex nvh-25 h-100 flex-column py-2 px-3 bg-light border">\n  '+(null!=(s=i(a,"exists").call(r,null!=l?i(l,"timed"):l,{name:"exists",hash:{},fn:n.program(1,t,0),inverse:n.noop,data:t,loc:{start:{line:2,column:2},end:{line:12,column:19}}}))?s:"")+"\n  "+(null!=(s=i(a,"if").call(r,null!=l?i(l,"durations"):l,{name:"if",hash:{},fn:n.program(4,t,0),inverse:n.noop,data:t,loc:{start:{line:13,column:2},end:{line:20,column:15}}}))?s:"")+'\n  <div class="small mt-2">\n    <span class="display-5 d-flex flex-row align-items-center">\n      <i class="material-icons md-36 mr-2">linear_scale</i>\n      <span class="display-6 text-black graph-tooltip d-inline-flex align-items-center"></span>\n    </span>\n  </div>\n</div>\n'},useData:!0})}();