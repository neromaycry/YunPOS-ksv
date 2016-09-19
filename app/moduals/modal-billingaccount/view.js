/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billingaccount/model',
    '../../moduals/modal-billingaccount/collection',
    'text!../../moduals/modal-billingaccount/tpl.html',
], function (BaseModalView,BillaccountModel,BillaccountCollection, tpl) {

    var billaccountView = BaseModalView.extend({

        id: "billaccountView",

        template: tpl,

        modalInitPage: function () {

        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_ACCOUNT, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_ACCOUNT, window.KEYS.Enter , function () {
                var receivedaccount = $('#receive_account').val();
                if(receivedaccount == '') {
                    toastr.warning('�������֧���˺�Ϊ�գ�����������');
                } else if(receivedaccount == 0){
                    toastr.warning('֧���˺Ų���Ϊ�㣬����������');
                } else {
                    var attrData = {};
                    attrData['gather_id'] = _self.attrs['gather_id'];
                    attrData['receivedsum'] = _self.attrs['receivedsum'];
                    attrData['gather_name'] = _self.attrs['gather_name'];
                    attrData['gather_no'] = receivedaccount;
                    Backbone.trigger('onReceivedsum',attrData);
                    _self.hideModal(window.PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
                }
            });
        },

        bindModalKeyEvents: function (id,keyCode,callback) {
            $(document).keydown(function (e) {
                e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },




    });

    return billaccountView;
});