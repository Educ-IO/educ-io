!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).filters=a({1:function(a,n,t,e,l,i,d){var o,r=a.lambda,s=a.escapeExpression,u=null!=n?n:a.nullContext||{};return'  <div id="collapse_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'" class="form form-tabbed container-fluid pt-2 pb-1 px-2 column-settings data-identifier" aria-labelledby="heading_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'" style="display: none;" data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'">\n    <div class="input-group no-gutters d-flex d-md-none">\n      <span class="input-group-prepend"><button type="button" class="btn btn-secondary" data-command="clear" data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'" data-toggle="tooltip" title="Clear this filter">&times;</button></span>\n      <input data-field="'+s(r(l&&l.index,n))+'" data-action="filter" type="text" class="form-control table-search" placeholder="Filter '+(null!=(o=t.if.call(u,null!=n?n.name:n,{name:"if",hash:{},fn:a.program(6,l,0,i,d),inverse:a.program(8,l,0,i,d),data:l}))?o:"")+' ...">\n    </div>\n    <div class="pt-1 flex-row flex-wrap d-flex d-md-none">\n      <div class="mr-1 my-1"><button type="button" class="btn btn-secondary" data-heading="heading_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'" data-command="sort" data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'" data-toggle="tooltip" title="Click to sort by this column">Sort</button></div>\n      <div class="mr-1 my-1">\n        <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n            Visibility\n          </button>\n        <div class="dropdown-menu dropdown-menu-bottom" aria-label="Menu for controlling the visibility of this column" data-heading="heading_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'" data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'">\n          <a class="dropdown-item" href="#" data-command="hide" data-action="now" data-toggle="tooltip" title="Hide this column">Hide now</a>\n          <a class="dropdown-item" href="#" data-command="hide" data-action="always" data-toggle="tooltip" title="Just hide this column on the view that you create">Hide always</a>\n          <a class="dropdown-item" href="#" data-command="hide" data-action="initially" data-toggle="tooltip" title="Just hide this column on the view, but allow it to be un-hidden">Hide initially</a>\n        </div>\n      </div>\n        <button type="button" class="close ml-2" aria-label="Close" onclick="event.preventDefault(); $(\'#collapse_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'\').fadeOut();" data-toggle="tooltip" title="Close this panel but retain the filter"><span aria-hidden="true">&times;</span></button>\n    </div>\n    <div class="input-group col-md-12 col-lg-8 col-xl-6 p-0 no-gutters d-none d-md-flex">\n      <span class="input-group-prepend">\n        <a tabindex="0" class="btn btn-action" role="button" data-toggle="popover" data-offset="0 -50%" title="Instructions" data-html=true data-content="'+s(r(null!=d[1]?d[1].instructions:d[1],n))+'">'+(null!=(o=t.if.call(u,null!=n?n.name:n,{name:"if",hash:{},fn:a.program(6,l,0,i,d),inverse:a.program(8,l,0,i,d),data:l}))?o:"")+'</a>\n      </span>\n      <span class="input-group-prepend"><button type="button" class="btn btn-secondary" data-command="clear" data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'" data-toggle="tooltip" title="Clear this filter">&times;</button></span>\n      <input data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'" data-action="filter" type="text" class="form-control table-search" placeholder="Filter '+(null!=(o=t.if.call(u,null!=n?n.name:n,{name:"if",hash:{},fn:a.program(6,l,0,i,d),inverse:a.program(8,l,0,i,d),data:l}))?o:"")+' ...">\n      <span class="input-group-prepend"><button type="button" class="btn btn-secondary" data-heading="heading_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'" data-command="sort" data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'" data-toggle="tooltip" title="Click to sort by this column">Sort</button></span>\n      <div class="input-group-prepend">\n        <button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n            Visibility\n          </button>\n        <div class="dropdown-menu dropdown-menu-right" aria-label="Menu for controlling the visibility of this column" data-heading="heading_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'" data-index="'+s(r(l&&l.index,n))+'" data-field="'+(null!=(o=t.if.call(u,null!=n?n.field:n,{name:"if",hash:{},fn:a.program(2,l,0,i,d),inverse:a.program(4,l,0,i,d),data:l}))?o:"")+'">\n          '+(null!=(o=t.each.call(u,null!=d[1]?d[1].choices:d[1],{name:"each",hash:{},fn:a.program(10,l,0,i,d),inverse:a.noop,data:l}))?o:"")+'\n        </div>\n      </div>\n      <button type="button" class="close ml-2" aria-label="Close" onclick="event.preventDefault(); $(\'#collapse_'+s(r(null!=d[1]?d[1].id:d[1],n))+"_"+s(r(l&&l.index,n))+'\').fadeOut();" data-toggle="tooltip" title="Close this panel but retain the filter"><span aria-hidden="true">&times;</span></button>\n    </div>\n  </div>'},2:function(a,n,t,e,l){return a.escapeExpression(a.lambda(null!=n?n.field:n,n))},4:function(a,n,t,e,l){return a.escapeExpression(a.lambda(l&&l.index,n))},6:function(a,n,t,e,l){return a.escapeExpression(a.lambda(null!=n?n.name:n,n))},8:function(a,n,t,e,l){return a.escapeExpression(a.lambda(n,n))},10:function(a,n,t,e,l){var i;return null!=(i=t.if.call(null!=n?n:a.nullContext||{},n,{name:"if",hash:{},fn:a.program(11,l,0),inverse:a.noop,data:l}))?i:""},11:function(a,n,t,e,l){var i;return null!=(i=t.if.call(null!=n?n:a.nullContext||{},null!=n?n.menu:n,{name:"if",hash:{},fn:a.program(12,l,0),inverse:a.noop,data:l}))?i:""},12:function(a,n,t,e,l){var i=a.lambda,d=a.escapeExpression;return'<a class="dropdown-item" href="#" data-command="hide" data-action="'+d(i(l&&l.key,n))+'" data-toggle="tooltip" title="'+d(i(null!=n?n.desc:n,n))+'">'+d(i(null!=n?n.name:n,n))+"</a>"},compiler:[7,">= 4.0.0"],main:function(a,n,t,e,l,i,d){var o;return'<div class="filter-wrapper">\n'+(null!=(o=t.each.call(null!=n?n:a.nullContext||{},null!=n?n.headers:n,{name:"each",hash:{},fn:a.program(1,l,0,i,d),inverse:a.noop,data:l}))?o:"")+"\n</div>\n"},useData:!0,useDepths:!0})}();