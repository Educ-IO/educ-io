!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).tracker_header=a({1:function(a,e,t,r,n){var o;return(null!=(o=a.invokePartial(r.control_button,e,{name:"control_button",hash:{b_command:"evidence.add",b_icon_type:"light",b_icon:"add_circle_outline",b_tooltip:"Add Evidence",b_class:"btn-success mr-1 state-editable-tracker",b_icon_large:"true",b_large:"true"},data:n,helpers:t,partials:r,decorators:a.decorators}))?o:"")+'<div class="btn-group btn-group-lg mb-0">\n  <a'+(null!=(o=t.if.call(null!=e?e:a.nullContext||{},null!=e?e.id:e,{name:"if",hash:{},fn:a.program(2,n,0),inverse:a.noop,data:n}))?o:"")+' data-route="tracker.export.sheets" href="#"\n          role="button" class="btn btn-primary btn-lg d-flex"><i class="mr-2 material-icons md-light md-24 align-self-center">save_alt</i>Export</a>\n  <button type="button" class="btn btn-primary btn-lg dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n    <span class="sr-only">Toggle Dropdown</span>\n  </button>\n  <div class="dropdown-menu dropdown-menu-right">\n    <a class="dropdown-item" data-route="tracker.export.csv" href="#">CSV</a>\n    <a class="dropdown-item" data-route="tracker.export.excel" href="#">Excel</a>\n    <div class="dropdown-divider"></div>\n    <a class="dropdown-item" href="#instructions.export">About</a>\n  </div>\n</div>\n'},2:function(a,e,t,r,n){return' id="'+a.escapeExpression(a.lambda(null!=e?e.id:e,e))+'_EXPORT"'},compiler:[7,">= 4.0.0"],main:function(a,e,t,r,n){var o;return null!=(o=a.invokePartial(r.table_header,e,{name:"table_header",fn:a.program(1,n,0),inverse:a.noop,data:n,helpers:t,partials:r,decorators:a.decorators}))?o:""},usePartial:!0,useData:!0})}();