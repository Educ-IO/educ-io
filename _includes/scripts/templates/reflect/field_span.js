!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).field_span=n({1:function(n,a,l,t,e){return"\x3c!-- "+n.escapeExpression(n.lambda(null!=a?a.description:a,a))+" --\x3e"},3:function(n,a,l,t,e){return" form-group-lg"},5:function(n,a,l,t,e){return n.escapeExpression(n.lambda(null!=a?a.title:a,a))},7:function(n,a,l,t,e){return n.escapeExpression(n.lambda(null!=a?a.field:a,a))},9:function(n,a,l,t,e,r,i){var o,s=n.lambda,u=n.escapeExpression,d=null!=a?a:n.nullContext||{};return'<button type="button" class="btn btn-primary alter-numerical d-flex h-100" data-target="'+u(s(null!=a?a.id:a,a))+'" data-modifier="'+u(s(null!=a?a.id:a,a))+'_PERIOD" data-value="-'+(null!=(o=l.if.call(d,null!=a?a.increment:a,{name:"if",hash:{},fn:n.program(10,e,0,r,i),inverse:n.program(12,e,0,r,i),data:e}))?o:"")+'"><i class="material-icons md-24 align-self-center">remove</i></button>\n\t\t\t<button type="button" class="btn btn-info alter-numerical d-flex h-100" data-target="'+u(s(null!=a?a.id:a,a))+'" data-modifier="'+u(s(null!=a?a.id:a,a))+'_PERIOD" data-value="'+(null!=(o=l.if.call(d,null!=a?a.increment:a,{name:"if",hash:{},fn:n.program(10,e,0,r,i),inverse:n.program(12,e,0,r,i),data:e}))?o:"")+'"><i class="material-icons md-24 align-self-center">add</i></button>\n\t\t\t<button id="'+u(s(null!=a?a.id:a,a))+'_PERIOD" type="button" class="btn btn-dark complex-list-type" data-default="'+u(s(null!=a?a.type:a,a))+'" data-target="'+u(s(null!=a?a.id:a,a))+'" data-span="">'+u(s(null!=a?a.type:a,a))+'</button>\n\t\t\t<button type="button" class="btn btn-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n\t\t\t\t<span class="sr-only">Toggle Dropdown</span>\n\t\t\t</button>\n\t\t\t<div class="dropdown-menu">\n'+(null!=(o=l.each.call(d,null!=a?a.options:a,{name:"each",hash:{},fn:n.program(14,e,0,r,i),inverse:n.noop,data:e}))?o:"")+"\t\t\t</div>"},10:function(n,a,l,t,e){return n.escapeExpression(n.lambda(null!=a?a.increment:a,a))},12:function(n,a,l,t,e){return"1"},14:function(n,a,l,t,e,r,i){var o,s=null!=a?a:n.nullContext||{};return'\t\t\t\t<a class="dropdown-item alter-span" href="#" data-target="'+n.escapeExpression(n.lambda(null!=i[1]?i[1].id:i[1],a))+'_PERIOD" data-value="'+(null!=(o=l.if.call(s,null!=a?a.value:a,{name:"if",hash:{},fn:n.program(15,e,0,r,i),inverse:n.program(17,e,0,r,i),data:e}))?o:"")+'"'+(null!=(o=l.exists.call(s,null!=a?a.span:a,{name:"exists",hash:{},fn:n.program(19,e,0,r,i),inverse:n.noop,data:e}))?o:"")+">"+(null!=(o=l.if.call(s,null!=a?a.name:a,{name:"if",hash:{},fn:n.program(22,e,0,r,i),inverse:n.program(17,e,0,r,i),data:e}))?o:"")+"</a>\t\t\t\t\n"},15:function(n,a,l,t,e){return n.escapeExpression(n.lambda(null!=a?a.value:a,a))},17:function(n,a,l,t,e){return n.escapeExpression(n.lambda(a,a))},19:function(n,a,l,t,e){var r;return null!=(r=l.if.call(null!=a?a:n.nullContext||{},null!=a?a.span:a,{name:"if",hash:{},fn:n.program(20,e,0),inverse:n.noop,data:e}))?r:""},20:function(n,a,l,t,e){return' data-span="'+n.escapeExpression(n.lambda(null!=a?a.span:a,a))+'"'},22:function(n,a,l,t,e){return n.escapeExpression(n.lambda(null!=a?a.name:a,a))},24:function(n,a,l,t,e){return" input-group-lg"},26:function(n,a,l,t,e){return' data-order="'+n.escapeExpression(n.lambda(null!=a?a.order:a,a))+'"'},28:function(n,a,l,t,e){var r;return'<div class="input-group-addon d-none d-lg-flex"><i class="material-icons '+(null!=(r=l.if.call(null!=a?a:n.nullContext||{},null!=a?a.large:a,{name:"if",hash:{},fn:n.program(29,e,0),inverse:n.program(31,e,0),data:e}))?r:"")+'">'+n.escapeExpression(n.lambda(null!=a?a.icon:a,a))+"</i></div>"},29:function(n,a,l,t,e){return"md-24"},31:function(n,a,l,t,e){return"md-18"},33:function(n,a,l,t,e){return' aria-describedby="'+n.escapeExpression(n.lambda(null!=a?a.id:a,a))+'_HELP"'},35:function(n,a,l,t,e){return" input-group-btn-lg"},37:function(n,a,l,t,e){return" btn-lg"},39:function(n,a,l,t,e){var r,i=n.lambda,o=n.escapeExpression;return'<textarea data-for="'+o(i(null!=a?a.id:a,a))+'" data-type="Details" id="'+o(i(null!=a?a.id:a,a))+'_DETAILS" name="'+o(i(null!=a?a.id:a,a))+'_DETAILS" class="form-control'+(null!=(r=l.if.call(null!=a?a:n.nullContext||{},null!=a?a.large:a,{name:"if",hash:{},fn:n.program(40,e,0),inverse:n.noop,data:e}))?r:"")+' resizable optional mt-2" rows="1" aria-label="'+o(i(null!=a?a.details:a,a))+'" placeholder="'+o(i(null!=a?a.details:a,a))+'"></textarea>'},40:function(n,a,l,t,e){return" form-control-lg"},42:function(n,a,l,t,e){var r,i=n.lambda;return'<div id="'+n.escapeExpression(i(null!=a?a.id:a,a))+'_HELP" class="form-text text-muted text-right">'+(null!=(r=i(null!=a?a.help:a,a))?r:"")+"</div>"},compiler:[7,">= 4.0.0"],main:function(n,a,l,t,e,r,i){var o,s=null!=a?a:n.nullContext||{},u=n.lambda,d=n.escapeExpression;return(null!=(o=l.if.call(s,null!=a?a.description:a,{name:"if",hash:{},fn:n.program(1,e,0,r,i),inverse:n.noop,data:e}))?o:"")+'\n<div class="form-group'+(null!=(o=l.if.call(s,null!=a?a.large:a,{name:"if",hash:{},fn:n.program(3,e,0,r,i),inverse:n.noop,data:e}))?o:"")+' row justify-content-between">\n\t<label class="col-md-3 col-form-label" for="'+d(u(null!=a?a.id:a,a))+'">'+(null!=(o=l.if.call(s,null!=a?a.title:a,{name:"if",hash:{},fn:n.program(5,e,0,r,i),inverse:n.program(7,e,0,r,i),data:e}))?o:"")+'</label>\n\t<div class="col-md-9 col-lg-8 col-xl-6">\n\t\t<div class="btn-group float-right mb-1" role="group" id="'+d(u(null!=a?a.id:a,a))+'_BUTTONS">\n\t\t\t'+(null!=(o=l.if.call(s,null!=a?a.options:a,{name:"if",hash:{},fn:n.program(9,e,0,r,i),inverse:n.noop,data:e}))?o:"")+'\n\t\t</div>\n\t\t<div id="'+d(u(null!=a?a.id:a,a))+'" class="input-group'+(null!=(o=l.if.call(s,null!=a?a.large:a,{name:"if",hash:{},fn:n.program(24,e,0,r,i),inverse:n.noop,data:e}))?o:"")+' input-daterange dt-picker" data-field="'+d(u(null!=a?a.field:a,a))+'"'+(null!=(o=l.if.call(s,null!=a?a.order:a,{name:"if",hash:{},fn:n.program(26,e,0,r,i),inverse:n.noop,data:e}))?o:"")+">\n\t\t\t"+(null!=(o=l.if.call(s,null!=a?a.icon:a,{name:"if",hash:{},fn:n.program(28,e,0,r,i),inverse:n.noop,data:e}))?o:"")+'\n\t\t\t<input id="'+d(u(null!=a?a.id:a,a))+'_START" type="text" class="form-control" name="start" aria-label="'+(null!=(o=l.if.call(s,null!=a?a.title:a,{name:"if",hash:{},fn:n.program(5,e,0,r,i),inverse:n.program(7,e,0,r,i),data:e}))?o:"")+'" '+(null!=(o=l.if.call(s,null!=a?a.help:a,{name:"if",hash:{},fn:n.program(33,e,0,r,i),inverse:n.noop,data:e}))?o:"")+'/>\n\t\t\t<div class="input-group-addon d-flex"><i class="material-icons '+(null!=(o=l.if.call(s,null!=a?a.large:a,{name:"if",hash:{},fn:n.program(29,e,0,r,i),inverse:n.program(31,e,0,r,i),data:e}))?o:"")+'">forward</i></div>\n    \t<input id="'+d(u(null!=a?a.id:a,a))+'_END" type="text" class="form-control" name="end" aria-label="'+(null!=(o=l.if.call(s,null!=a?a.title:a,{name:"if",hash:{},fn:n.program(5,e,0,r,i),inverse:n.program(7,e,0,r,i),data:e}))?o:"")+'" '+(null!=(o=l.if.call(s,null!=a?a.help:a,{name:"if",hash:{},fn:n.program(33,e,0,r,i),inverse:n.noop,data:e}))?o:"")+'/>\n\t\t\t<span class="input-group-btn'+(null!=(o=l.if.call(s,null!=a?a.large:a,{name:"if",hash:{},fn:n.program(35,e,0,r,i),inverse:n.noop,data:e}))?o:"")+'">\n\t\t\t\t<button type="button" class="btn'+(null!=(o=l.if.call(s,null!=a?a.large:a,{name:"if",hash:{},fn:n.program(37,e,0,r,i),inverse:n.noop,data:e}))?o:"")+' btn-secondary eraser d-flex h-100" data-target="'+d(u(null!=a?a.id:a,a))+'"><i class="pl-1 material-icons '+(null!=(o=l.if.call(s,null!=a?a.large:a,{name:"if",hash:{},fn:n.program(29,e,0,r,i),inverse:n.program(31,e,0,r,i),data:e}))?o:"")+' md-dark align-self-center">refresh</i></button>\n\t\t\t</span>\n\t\t</div>\n\t\t'+(null!=(o=l.if.call(s,null!=a?a.details:a,{name:"if",hash:{},fn:n.program(39,e,0,r,i),inverse:n.noop,data:e}))?o:"")+"\n\t\t"+(null!=(o=l.if.call(s,null!=a?a.help:a,{name:"if",hash:{},fn:n.program(42,e,0,r,i),inverse:n.noop,data:e}))?o:"")+"\n\t</div>\n</div>\n"},useData:!0,useDepths:!0})}();