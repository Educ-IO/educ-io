!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).toggle_button=n({1:function(n,l,a,e,t){var i;return null!=(i=a.if.call(null!=l?l:n.nullContext||{},null!=l?l.large:l,{name:"if",hash:{},fn:n.program(2,t,0),inverse:n.noop,data:t}))?i:""},2:function(n,l,a,e,t){return" btn-lg"},4:function(n,l,a,e,t){return" waves-effect"},6:function(n,l,a,e,t){return" disabled"},8:function(n,l,a,e,t){return"id="+n.escapeExpression(n.lambda(null!=l?l.b_id:l,l))},10:function(n,l,a,e,t){return' title="'+n.escapeExpression(n.lambda(null!=l?l.b_title:l,l))+'"'},12:function(n,l,a,e,t){return' data-toggle="tooltip" title="'+n.escapeExpression(n.lambda(null!=l?l.b_tooltip:l,l))+'"'},14:function(n,l,a,e,t){return' aria-label="'+n.escapeExpression(n.lambda(null!=l?l.b_aria_title:l,l))+'"'},compiler:[7,">= 4.0.0"],main:function(n,l,a,e,t){var i,s=null!=l?l:n.nullContext||{},o=n.escapeExpression;return'<button\n  type="button"\n  class="btn'+(null!=(i=a.unless.call(s,null!=l?l.b_small:l,{name:"unless",hash:{},fn:n.program(1,t,0),inverse:n.noop,data:t}))?i:"")+" btn-toggle d-flex "+o(a.which.call(s,null!=l?l.b_class:l,null!=l?l.b_class:l,"btn-dark",{name:"which",hash:{},data:t}))+(null!=(i=a.unless.call(s,null!=l?l.no_waves:l,{name:"unless",hash:{},fn:n.program(4,t,0),inverse:n.noop,data:t}))?i:"")+(null!=(i=a.if.call(s,null!=l?l.disabled:l,{name:"if",hash:{},fn:n.program(6,t,0),inverse:n.noop,data:t}))?i:"")+'"\n  data-targets="'+o(n.lambda(null!=l?l.b_targets:l,l))+'"\n  data-initial="'+o(a.which.call(s,null!=l?l.b_class:l,null!=l?l.b_class:l,"btn-dark",{name:"which",hash:{},data:t}))+'"\n\t'+(null!=(i=a.if.call(s,null!=l?l.b_id:l,{name:"if",hash:{},fn:n.program(8,t,0),inverse:n.noop,data:t}))?i:"")+"\n  "+(null!=(i=a.if.call(s,null!=l?l.b_title:l,{name:"if",hash:{},fn:n.program(10,t,0),inverse:n.noop,data:t}))?i:"")+"\n  "+(null!=(i=a.if.call(s,null!=l?l.b_tooltip:l,{name:"if",hash:{},fn:n.program(12,t,0),inverse:n.noop,data:t}))?i:"")+"\n  "+(null!=(i=a.if.call(s,null!=l?l.b_aria_title:l,{name:"if",hash:{},fn:n.program(14,t,0),inverse:n.noop,data:t}))?i:"")+"\n  "+(null!=(i=a.if.call(s,null!=l?l.disabled:l,{name:"if",hash:{},fn:n.program(6,t,0),inverse:n.noop,data:t}))?i:"")+'>\n\t\t<i class="toggle-true d-none material-icons md-24 h-100 mb-0">thumb_up</i>\n\t\t<i class="toggle-indeterminate material-icons md-24 h-100 mb-0">check_box_outline_blank</i>\n\t\t<i class="toggle-false d-none material-icons md-24 h-100 mb-0">thumb_down</i>\n</button>\n'},useData:!0})}();