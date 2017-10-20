!function(){var t=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).form=t({1:function(t,n,l,a,e){var o;return null!=(o=t.lambda(null!=n?n.header:n,n))?o:""},3:function(t,n,l,a,e){return"\x3c!-- "+t.escapeExpression(t.lambda(null!=n?n.description:n,n))+" --\x3e"},5:function(t,n,l,a,e){return"<h4>"+t.escapeExpression(t.lambda(null!=n?n.title:n,n))+"</h4>"},7:function(t,n,l,a,e){var o;return null!=(o=t.lambda(null!=n?n.fields:n,n))?o:""},9:function(t,n,l,a,e){var o;return'<div class="form-text text-muted">'+(null!=(o=t.lambda(null!=n?n.help:n,n))?o:"")+"</div>"},11:function(t,n,l,a,e){var o;return null!=(o=t.lambda(null!=n?n.footer:n,n))?o:""},compiler:[7,">= 4.0.0"],main:function(t,n,l,a,e){var o,d=null!=n?n:t.nullContext||{},s=t.lambda,i=t.escapeExpression;return'<div class="row justify-content-md-center">\n\n\t<div class="mt-sm-1 mt-md-2 mt-lg-4 pb-4 col-12 col-md-10 col-lg-9 col-xl-8">\n\t\t\n\t\t'+(null!=(o=l.if.call(d,null!=n?n.header:n,{name:"if",hash:{},fn:t.program(1,e,0),inverse:t.noop,data:e}))?o:"")+"\n\t\t\n\t\t"+(null!=(o=l.if.call(d,null!=n?n.description:n,{name:"if",hash:{},fn:t.program(3,e,0),inverse:t.noop,data:e}))?o:"")+'\n\t\t<form id="'+i(s(null!=n?n.id:n,n))+'" class="form-horizontal" role="form">\n\t\t\t\n\t\t\t'+(null!=(o=l.if.call(d,null!=n?n.title:n,{name:"if",hash:{},fn:t.program(5,e,0),inverse:t.noop,data:e}))?o:"")+"\n\t\t\t\n\t\t\t<fieldset>\n\t\t\t\n\t\t\t\t"+(null!=(o=l.if.call(d,null!=n?n.fields:n,{name:"if",hash:{},fn:t.program(7,e,0),inverse:t.noop,data:e}))?o:"")+'\n\t\t\t\n\t\t\t</fieldset>\n\t\t\t\n\t\t\t\x3c!-- Submission / Save / Progress Area --\x3e\n\t\t\t<div class="card mx-1 my-1 mx-md-0">\n\n\t\t\t\t<div id="heading_'+i(s(null!=n?n.id:n,n))+'_Submission" class="card-header">\n\t\t\t\t\t<h5 class="mb-0 d-inline">Submission</h5>\n\t\t\t\t\t<a class="float-right" data-toggle="collapse" href="#collapse_'+i(s(null!=n?n.id:n,n))+'_Submission" aria-expanded="false" aria-controls="collapse_'+i(s(null!=n?n.id:n,n))+'_Submission">\n\t\t\t\t\t\t<i style="display: none;" class="material-icons md-18" data-listen="#collapse_'+i(s(null!=n?n.id:n,n))+'_Submission" data-event="hidden.bs.collapse">expand_more</i>\n\t\t\t\t\t\t<i class="material-icons md-18" data-listen="#collapse_'+i(s(null!=n?n.id:n,n))+'_Submission" data-event="shown.bs.collapse">expand_less</i>\n\t\t\t\t\t</a>\n\t\t\t\t</div>\n\n\t\t\t\t<div id="collapse_'+i(s(null!=n?n.id:n,n))+'_Submission" class="collapse show" role="tabpanel" aria-labelledby="heading_'+i(s(null!=n?n.id:n,n))+'_Submission">\n\t\t\t\t\t<div class="card-body">\n\t\t\t\t\t\t<div class="form-group">\n\t\t\t\t\t\t\t\t<div class="col-md-9 d-flex flex-column flex-md-row">\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\x3c!-- Save Button Group --\x3e\n\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-lg mb-2 mb-md-0 mr-md-2">\n\t\t\t\t\t\t\t\t\t\t<button id="'+i(s(null!=n?n.id:n,n))+'_SAVE" type="button" class="btn btn-info btn-lg d-flex"><i class="mr-2 material-icons md-light md-24 align-self-center">save</i>Save</button>\n\t\t\t\t\t\t\t\t\t\t<button type="button" class="btn btn-info btn-lg dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n\t\t\t\t\t\t\t\t\t\t\t<span class="sr-only">Toggle Dropdown</span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t<div class="dropdown-menu dropdown-menu-right">\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Action</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Another action</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Something else here</a>\n\t\t\t\t\t\t\t\t\t\t\t<div class="dropdown-divider"></div>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Separated link</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\x3c!-- Send Button Group --\x3e\n\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-lg mb-2 mb-md-0 mr-md-2">\n\t\t\t\t\t\t\t\t\t\t<button id="'+i(s(null!=n?n.id:n,n))+'_SEND" type="button" class="btn btn-primary btn-lg d-flex"><i class="mr-2 material-icons md-light md-24 align-self-center">send</i>Send</button>\n\t\t\t\t\t\t\t\t\t\t<button type="button" class="btn btn-primary btn-lg dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n\t\t\t\t\t\t\t\t\t\t\t<span class="sr-only">Toggle Dropdown</span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t<div class="dropdown-menu dropdown-menu-right">\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Action</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Another action</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Something else here</a>\n\t\t\t\t\t\t\t\t\t\t\t<div class="dropdown-divider"></div>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Separated link</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\x3c!-- Complete Button Group --\x3e\n\t\t\t\t\t\t\t\t\t<div class="btn-group btn-group-lg mb-2 mb-md-0 mr-md-2">\n\t\t\t\t\t\t\t\t\t\t<button id="'+i(s(null!=n?n.id:n,n))+'_COMPLETE" type="button" class="btn btn-success btn-lg d-flex"><i class="mr-4 material-icons md-light md-24 align-self-center">cloud_done</i>Complete</button>\n\t\t\t\t\t\t\t\t\t\t<button type="button" class="btn btn-success btn-lg dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n\t\t\t\t\t\t\t\t\t\t\t<span class="sr-only">Toggle Dropdown</span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t<div class="dropdown-menu dropdown-menu-right">\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Action</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Another action</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Something else here</a>\n\t\t\t\t\t\t\t\t\t\t\t<div class="dropdown-divider"></div>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" href="#">Separated link</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t'+(null!=(o=l.if.call(d,null!=n?n.help:n,{name:"if",hash:{},fn:t.program(9,e,0),inverse:t.noop,data:e}))?o:"")+"\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t\n\t\t</form>\n\t\t\n\t\t"+(null!=(o=l.if.call(d,null!=n?n.footer:n,{name:"if",hash:{},fn:t.program(11,e,0),inverse:t.noop,data:e}))?o:"")+"\n\t\t\n\t</div>\n\t\n</div>\n"},useData:!0})}();