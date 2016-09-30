/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-qpalipay/model',
    '../../moduals/modal-qpalipay/collection',
    'text!../../moduals/modal-qpalipay/tpl.html',
], function (BaseModalView,QPAlipayModel,QPAlipayCollection, tpl) {

    var qpalipayView = BaseModalView.extend({

        id: "qpalipayView",

        template: tpl,

        input:'input[name = alipay-account]',

        events:{

        },

        modalInitPage: function () {
            this.model = new QPAlipayModel();
            this.model.set({
                receivedsum:this.attrs['receivedsum']
            });
            this.render();
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.QP_ALIPAY, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });

            this.bindModalKeyEvents(window.PAGE_ID.QP_ALIPAY, window.KEYS.Enter, function() {
                var gatherNo = $('input[name = alipay-account]').val();
                if(gatherNo == ''){
                    toastr.warning('支付宝账号不能为空');
                }else{
                    var data = {};
                    data['gather_no'] = gatherNo;
                    data['gather_id'] = _self.attrs['gather_id'];
                    data['gather_name'] = _self.attrs['gather_name'];
                    data['receivedsum'] = _self.attrs['receivedsum'];
                    console.log(data);
                    Backbone.trigger('onReceivedsum',data);
                    _self.hideModal(window.PAGE_ID.BILLING);
                }
            });
        },


    });

    return qpalipayView;
});