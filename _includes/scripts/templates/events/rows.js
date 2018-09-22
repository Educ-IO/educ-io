!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).rows=n({1:function(n,l,a,e,r){var t,s=null!=l?l:n.nullContext||{};return'<tr id="'+(null!=(t=a.if.call(s,null!=l?l.safe:l,{name:"if",hash:{},fn:n.program(2,r,0),inverse:n.program(4,r,0),data:r}))?t:"")+'">\n  '+(null!=(t=a.exists.call(s,null!=l?l.type:l,{name:"exists",hash:{},fn:n.program(7,r,0),inverse:n.noop,data:r}))?t:"")+"\n  "+(null!=(t=a.exists.call(s,null!=l?l.id:l,{name:"exists",hash:{},fn:n.program(15,r,0),inverse:n.noop,data:r}))?t:"")+"\n  "+(null!=(t=a.exists.call(s,null!=l?l.when:l,{name:"exists",hash:{},fn:n.program(17,r,0),inverse:n.noop,data:r}))?t:"")+"\n  "+(null!=(t=a.exists.call(s,null!=l?l.what:l,{name:"exists",hash:{},fn:n.program(20,r,0),inverse:n.noop,data:r}))?t:"")+"\n  "+(null!=(t=a.exists.call(s,null!=l?l.who:l,{name:"exists",hash:{},fn:n.program(32,r,0),inverse:n.noop,data:r}))?t:"")+"\n  <td"+(null!=(t=a.if.call(s,null!=l?l.needs_Review:l,{name:"if",hash:{},fn:n.program(40,r,0),inverse:n.noop,data:r}))?t:"")+'><a href="#tag'+(null!=(t=a.if.call(s,null!=l?l.id:l,{name:"if",hash:{},fn:n.program(42,r,0),inverse:n.noop,data:r}))?t:"")+'" class="badge badge-dark text-light mr-1">Tag<i class="material-icons h-100 d-inline-flex pl-1">create</i></a>'+(null!=(t=a.exists.call(s,null!=l?l.properties:l,{name:"exists",hash:{},fn:n.program(44,r,0),inverse:n.noop,data:r}))?t:"")+'<a role="button" class="close float-right" aria-label="Close" href="#remove.list.'+n.escapeExpression(n.lambda(null!=l?l.id:l,l))+'" title="Remove from List"><span aria-hidden="true">&times;</span></a></td>\n</tr>'},2:function(n,l,a,e,r){return n.escapeExpression(n.lambda(null!=l?l.safe:l,l))},4:function(n,l,a,e,r){var t;return null!=(t=a.if.call(null!=l?l:n.nullContext||{},null!=l?l.id:l,{name:"if",hash:{},fn:n.program(5,r,0),inverse:n.noop,data:r}))?t:""},5:function(n,l,a,e,r){return n.escapeExpression(n.lambda(null!=l?l.id:l,l))},7:function(n,l,a,e,r){var t;return'<td class="text-center pb-0" title="'+n.escapeExpression(n.lambda(null!=l?l.type:l,l))+'"><i class="material-icons mr-1 md-24">'+(null!=(t=a.is.call(null!=l?l:n.nullContext||{},null!=l?l.type:l,"Single",{name:"is",hash:{},fn:n.program(8,r,0),inverse:n.program(10,r,0),data:r}))?t:"")+"</i></td>"},8:function(n,l,a,e,r){return"event"},10:function(n,l,a,e,r){var t;return null!=(t=a.is.call(null!=l?l:n.nullContext||{},null!=l?l.type:l,"Series",{name:"is",hash:{},fn:n.program(11,r,0),inverse:n.program(13,r,0),data:r}))?t:""},11:function(n,l,a,e,r){return"date_range"},13:function(n,l,a,e,r){return"calendar_today"},15:function(n,l,a,e,r){var t=n.lambda,s=n.escapeExpression;return'<td><a class="text-left wrap-text small mw-25 link" href="'+s(t(null!=l?l.url:l,l))+'" target="_blank" title="Open in Google" data-type="out">'+s(t(null!=l?l.id:l,l))+"</a></td>"},17:function(n,l,a,e,r){var t;return"<td>"+n.escapeExpression(n.lambda(null!=l?l.when:l,l))+(null!=(t=a.if.call(null!=l?l:n.nullContext||{},null!=l?l.duration:l,{name:"if",hash:{},fn:n.program(18,r,0),inverse:n.noop,data:r}))?t:"")+"</td>"},18:function(n,l,a,e,r){return'<small class="form-text text-muted">'+n.escapeExpression(n.lambda(null!=l?l.duration:l,l))+"</small>"},20:function(n,l,a,e,r){var t,s=null!=l?l:n.nullContext||{};return'<td class="name-link">'+(null!=(t=a.if.call(s,null!=l?l.__failure:l,{name:"if",hash:{},fn:n.program(21,r,0),inverse:n.noop,data:r}))?t:"")+(null!=(t=a.if.call(s,null!=l?l.__success:l,{name:"if",hash:{},fn:n.program(23,r,0),inverse:n.noop,data:r}))?t:"")+'<span class="event-name wrap-text mw-60'+(null!=(t=a.if.call(s,null!=l?l.name_class:l,{name:"if",hash:{},fn:n.program(25,r,0),inverse:n.noop,data:r}))?t:"")+'">'+n.escapeExpression(n.lambda(null!=l?l.what:l,l))+"</span>"+(null!=(t=a.if.call(s,null!=l?l.where:l,{name:"if",hash:{},fn:n.program(27,r,0),inverse:n.noop,data:r}))?t:"")+"\n  "+(null!=(t=a.if.call(s,null!=l?l.files:l,{name:"if",hash:{},fn:n.program(29,r,0),inverse:n.noop,data:r}))?t:"")+"\n  </td>"},21:function(n,l,a,e,r){return'<i class="material-icons text-danger mr-2 md-18 font-weight-bold">error_outline</i>'},23:function(n,l,a,e,r){return'<i class="material-icons text-success mr-2 md-18 font-weight-light">done</i>'},25:function(n,l,a,e,r){return" "+n.escapeExpression(n.lambda(null!=l?l.name_class:l,l))},27:function(n,l,a,e,r){return'<small class="form-text text-muted">'+n.escapeExpression(n.lambda(null!=l?l.where:l,l))+"</small>"},29:function(n,l,a,e,r){var t;return null!=(t=a.each.call(null!=l?l:n.nullContext||{},null!=l?l.files:l,{name:"each",hash:{},fn:n.program(30,r,0),inverse:n.noop,data:r}))?t:""},30:function(n,l,a,e,r){var t=n.lambda,s=n.escapeExpression;return'<small class="form-text"><img class="pr-1" src="'+s(t(null!=l?l.iconLink:l,l))+'" title="'+s(t(null!=l?l.mimeType:l,l))+'"/><a href="'+s(t(null!=l?l.fileUrl:l,l))+'" target="_blank">'+s(t(null!=l?l.title:l,l))+"</a></small>"},32:function(n,l,a,e,r){var t;return"<td>"+n.escapeExpression(n.lambda(null!=l?l.who:l,l))+(null!=(t=a.if.call(null!=l?l:n.nullContext||{},null!=l?l.with:l,{name:"if",hash:{},fn:n.program(33,r,0),inverse:n.noop,data:r}))?t:"")+"</td>"},33:function(n,l,a,e,r){var t;return null!=(t=a.each.call(null!=l?l:n.nullContext||{},null!=l?l.with:l,{name:"each",hash:{},fn:n.program(34,r,0),inverse:n.noop,data:r}))?t:""},34:function(n,l,a,e,r){var t;return null!=(t=a.unless.call(null!=l?l:n.nullContext||{},null!=l?l.organizer:l,{name:"unless",hash:{},fn:n.program(35,r,0),inverse:n.noop,data:r}))?t:""},35:function(n,l,a,e,r){var t;return'<small class="form-text text-muted">'+(null!=(t=a.if.call(null!=l?l:n.nullContext||{},null!=l?l.displayName:l,{name:"if",hash:{},fn:n.program(36,r,0),inverse:n.program(38,r,0),data:r}))?t:"")+"</small>"},36:function(n,l,a,e,r){return n.escapeExpression(a.username.call(null!=l?l:n.nullContext||{},null!=l?l.displayName:l,{name:"username",hash:{},data:r}))},38:function(n,l,a,e,r){return n.escapeExpression(n.lambda(null!=l?l.email:l,l))},40:function(n,l,a,e,r){return' class="table-danger"'},42:function(n,l,a,e,r){return"."+n.escapeExpression(n.lambda(null!=l?l.id:l,l))},44:function(n,l,a,e,r){var t;return null!=(t=n.invokePartial(e.custom_properties,l,{name:"custom_properties",hash:{id:null!=l?l.id:l,properties:null!=l?l.properties:l},data:r,helpers:a,partials:e,decorators:n.decorators}))?t:""},compiler:[7,">= 4.0.0"],main:function(n,l,a,e,r){var t;return(null!=(t=a.each.call(null!=l?l:n.nullContext||{},null!=l?l.rows:l,{name:"each",hash:{},fn:n.program(1,r,0),inverse:n.noop,data:r}))?t:"")+"\n"},usePartial:!0,useData:!0})}();