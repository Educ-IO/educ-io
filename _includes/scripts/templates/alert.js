!function(){var n=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).alert=n({1:function(n,a,l,t,e){return n.escapeExpression(n.lambda(null!=a?a.type:a,a))},3:function(n,a,l,t,e){return"info"},5:function(n,a,l,t,e){var s,r=n.lambda,i=n.escapeExpression;return'    <div class="container-fluid">\n      <div class="row align-items-center">\n       <div class="col-9">\n          <strong>'+i(r(null!=a?a.headline:a,a))+"</strong> - "+i(r(null!=a?a.message:a,a))+'\n        </div>\n        <div class="col-3">\n          <button type="button" class="float-right close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n          <button type="button" class="btn btn-outline-'+(null!=(s=l.if.call(null!=a?a:n.nullContext||{},null!=a?a.type:a,{name:"if",hash:{},fn:n.program(1,e,0),inverse:n.program(3,e,0),data:e}))?s:"")+' btn-sm float-right action">'+i(r(null!=a?a.action:a,a))+"</button>\n        </div>\n      </div>\n    </div>\n"},7:function(n,a,l,t,e){var s=n.lambda,r=n.escapeExpression;return'    <button type="button" class="close" data-dismiss="alert" aria-label="Close">\n      <span aria-hidden="true">&times;</span>\n    </button>\n    <strong>'+r(s(null!=a?a.headline:a,a))+"</strong> - "+r(s(null!=a?a.message:a,a))+"\n"},compiler:[7,">= 4.0.0"],main:function(n,a,l,t,e){var s,r=null!=a?a:n.nullContext||{};return'<div class="alert alert-'+(null!=(s=l.if.call(r,null!=a?a.type:a,{name:"if",hash:{},fn:n.program(1,e,0),inverse:n.program(3,e,0),data:e}))?s:"")+' alert-dismissible fade show" role="alert">\n'+(null!=(s=l.if.call(r,null!=a?a.action:a,{name:"if",hash:{},fn:n.program(5,e,0),inverse:n.program(7,e,0),data:e}))?s:"")+"</div>\n"},useData:!0})}();