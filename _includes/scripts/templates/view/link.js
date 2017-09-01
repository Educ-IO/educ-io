!function(){var t=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).link=t({1:function(t,a,n,l,d){var e;return null!=(e=t.lambda(null!=a?a.instructions:a,a))?e:""},compiler:[7,">= 4.0.0"],main:function(t,a,n,l,d){var e,o=t.lambda,s=t.escapeExpression;return'<div id="'+s(o(null!=a?a.id:a,a))+'" class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_options_title">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_options_title">'+s(o(null!=a?a.title:a,a))+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(e=n.if.call(null!=a?a:t.nullContext||{},null!=a?a.instructions:a,{name:"if",hash:{},fn:t.program(1,d,0),inverse:t.noop,data:d}))?e:"")+'\n\t\t\t\t\t<div class="card">\n\t\t\t\t\t\t<div class="card-body">\n\t\t\t\t\t\t\t<p id="link_text" class="card-text text-muted"><small>'+s(o(null!=a?a.link:a,a))+'</small></p>\n\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t<div class="btn-group">\n\t\t\t\t\t\t\t\t\t\t<a role="button" href="'+s(o(null!=a?a.link:a,a))+'" target="_blank" class="btn btn-primary">Test Link</a>\n\t\t\t\t\t\t\t\t\t\t<button type="button" class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n\t\t\t\t\t\t\t\t\t\t\t<span class="sr-only">Toggle Dropdown</span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t<div class="dropdown-menu">\n\t\t\t\t\t\t\t\t\t\t\t<a id="link_copy" class="copy-trigger dropdown-item" href="#" data-clipboard-target="#link_text">Copy</a>\n\t\t\t\t\t\t\t\t\t\t\t<a class="dropdown-item" role="button" data-parent="#extras" data-toggle="collapse" data-target="#details" aria-expanded="false" aria-controls="details">Details</a>\n\t\t\t\t\t\t\t\t\t\t\t<div class="dropdown-divider"></div>\n\t\t\t\t\t\t\t\t\t\t\t<a id="link_shorten" class="dropdown-item" href="#">Shorten</a>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div class="btn-group float-right">\n\t\t\t\t\t\t\t\t\t\t<button class="btn btn-dark" type="button" data-parent="#extras" data-toggle="collapse" data-target="#qr" aria-expanded="false" aria-controls="qr">QR Code</button>\n\t\t\t\t\t\t\t\t\t\t<button type="button" class="btn btn-dark dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">\n\t\t\t\t\t\t\t\t\t\t\t<span class="sr-only">Toggle Dropdown</span>\n\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t<div class="dropdown-menu dropdown-menu-right">\n\t\t\t\t\t\t\t\t\t\t\t\t<a id="qr_copy" class="copy-trigger dropdown-item" href="#" data-clipboard-text="'+(null!=(e=o(null!=a?a.qr_link:a,a))?e:"")+'">Copy</a>\n\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div id="extras" data-children=".collapse">\n\t\t\t\t\t\t\t\t\t<div id="qr" class="collapse mt-2" data-parent="#extras">\n\t\t\t\t\t\t\t\t\t\t<div class="card-body text-center p-0">\n\t\t\t\t\t\t\t\t\t\t\t<img id="qr_code" class="img-fluid mx-auto d-block" src="'+(null!=(e=o(null!=a?a.qr_link:a,a))?e:"")+'" />\t\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t<div id="details" class="collapse mt-1" data-parent="#extras">\n\t\t\t\t\t\t\t\t\t\t<div class="card-header">\n\t\t\t\t\t\t\t\t\t\t\t<small class="text-muted">The details below are encoded into the link above.</small>\n\t\t\t\t\t\t\t\t\t\t\t<button type="button" class="close float-right" aria-label="Close" data-toggle="collapse" data-target="#details" aria-expanded="false" aria-controls="details"><span aria-hidden="true">&times;</span></button>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t<div class="card card-body">\n\t\t\t\t\t\t\t\t\t\t\t<pre><code>'+(null!=(e=o(null!=a?a.details:a,a))?e:"")+'</code></pre>\n\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n'},useData:!0})}();