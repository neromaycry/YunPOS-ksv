/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-qpwechat/model',
    '../../moduals/modal-qpwechat/collection',
    'text!../../moduals/modal-gatherui/numpadtpl.html',
    'text!../../moduals/modal-qpwechat/tpl.html',
], function (BaseModalView,QPWechatModel,QPWechatCollection,numpadtpl, tpl) {

    var qpwechatView = BaseModalView.extend({

        id: "qpwechatView",

        template: tpl,

        template_numpad:numpadtpl,

        input:'input[name = wechat-account]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
        },

        modalInitPage: function () {
            this.model = new QPWechatModel();
            this.model.set({
                receivedsum:this.attrs['receivedsum']
            });
            this.render();
            this.$el.find('.for-numpad').html(this.template_numpad);
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.QP_WECHAT, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });

            this.bindModalKeyEvents(window.PAGE_ID.QP_WECHAT, window.KEYS.Enter, function() {
                _self.confirm();
            });
        },

        confirm: function () {
            var _self = this;
            var gatherNo = $('input[name = wechat-account]').val();
            if(gatherNo == ''){
                toastr.warning('微信账号不能为空');
            }else{
                var tempdata = {};
                tempdata['gather_no'] = gatherNo;
                tempdata['gather_id'] = _self.attrs['gather_id'];
                tempdata['gather_name'] = _self.attrs['gather_name'];
                tempdata['receivedsum'] = _self.attrs['receivedsum'];
                tempdata['orderNo'] = _self.attrs.orderNo;
                _self.prepay(tempdata);
            }
        },

        prepay: function (tempdata) {
            var _self = this;
            var receivedaccount = $('input[name = wechat-account]').val();
            var data = {};
            data['orderid'] = this.attrs.orderNo;
            data['merid'] = '000201504171126553';
            data['authno'] = receivedaccount;
            data['totalfee'] = '0.01';
            data['body'] = 'test';
            data['subject'] = 'test';
            data['paymethod'] = 'wx';
            data['payway'] = 'barcode';
            resource.post('http://114.55.62.102:9090/api/pay/xfb/micropay', data, function (resp) {
                if(resp.data['flag'] == '00') {
                    Backbone.trigger('onReceivedsum',tempdata);
                    _self.hideModal(window.PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
                }else {
                    toastr.error('支付失败');
                }
            });
        },
        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.BILLING);
        },

        onOKClicked: function () {
            this.confirm();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },


    });

    return qpwechatView;
});