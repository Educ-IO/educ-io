!function(){var a=Handlebars.template;(Handlebars.templates=Handlebars.templates||{}).subscribe=a({1:function(a,n,e,l,t){return'id="'+a.escapeExpression(a.lambda(null!=n?n.id:n,n))+'" '},3:function(a,n,e,l,t){var s;return null!=(s=a.lambda(null!=n?n.message:n,n))?s:""},5:function(a,n,e,l,t){return'<small id="os0_help" class="form-text text-muted">'+a.escapeExpression(a.lambda(null!=n?n.details:n,n))+"</small>"},compiler:[7,">= 4.0.0"],main:function(a,n,e,l,t){var s,i=null!=n?n:a.nullContext||{},o=a.lambda,d=a.escapeExpression;return"<div "+(null!=(s=e.if.call(i,null!=n?n.id:n,{name:"if",hash:{},fn:a.program(1,t,0),inverse:a.noop,data:t}))?s:"")+'class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-hidden="true" aria-labelledby="modal_text_title">\n  <div class="modal-dialog modal-lg" role="document">\n    <div class="modal-content">\n      <div class="modal-header">\n        <h5 class="modal-title" id="modal_text_title">'+d(o(null!=n?n.title:n,n))+'</h5>\n        <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n          <span aria-hidden="true">&times;</span>\n        </button>\n      </div>\n      <div class="modal-body">\n        '+(null!=(s=e.if.call(i,null!=n?n.message:n,{name:"if",hash:{},fn:a.program(3,t,0),inverse:a.noop,data:t}))?s:"")+'\n        <form action="https://www.paypal.com/cgi-bin/webscr" class="subscribe" method="post" target="_top">\n          <input type="hidden" name="cmd" value="_s-xclick">\n          <input type="hidden" name="hosted_button_id" value="'+d(o(null!=n?n.button:n,n))+'">\n          <input id="on0" type="hidden" name="on0" value="'+d(o(null!=n?n.data:n,n))+'">\n          <div class="form-group">\n            <label class="font-weight-bold" for="os0">'+d(o(null!=n?n.data:n,n))+'</label>\n            <input id="os0" type="text" name="os0" class="form-control form-control-lg" maxlength="200" aria-describedby="os0_help" placeholder="Type here ...">\n            '+(null!=(s=e.if.call(i,null!=n?n.details:n,{name:"if",hash:{},fn:a.program(5,t,0),inverse:a.noop,data:t}))?s:"")+'\n          </div>\n          <p class="text-center">\n            <input type="image" src="https://www.paypalobjects.com/en_US/GB/i/btn/btn_subscribeCC_LG.gif" border="0" name="submit" alt="PayPal – The safer, easier way to pay online!">  \n          </p>\n          <img border="0" src="https://www.paypalobjects.com/en_GB/i/scr/pixel.gif" width="1" height="1" alt="">\n        </form>\n      </div>\n      <div class="modal-footer">\n        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n      </div>\n    </div>\n  </div>\n</div>\n'},useData:!0})}();