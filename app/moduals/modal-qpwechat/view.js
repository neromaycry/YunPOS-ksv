/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-qpwechat/model',
    '../../moduals/modal-qpwechat/collection',
    'text!../../moduals/layer-gatherui/numpadtpl.html',
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
                receivedsum:this.attrs['gather_money']
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
            var gatherNo = $(this.input).val();
            if(gatherNo == '') {
                toastr.warning('微信账号不能为空');
            } else if((gatherNo.split('.').length-1) > 0 || gatherNo == '0'){
                    toastr.warning('无效的微信账号');
            }else {
                var tempdata = {};
                tempdata['gather_no'] = gatherNo;
                tempdata['gather_id'] = _self.attrs['gather_id'];
                tempdata['gather_name'] = _self.attrs['gather_name'];
                tempdata['gather_money'] = _self.attrs['gather_money'];
                tempdata['payment_bill'] = _self.attrs.payment_bill;
                _self.micropay(tempdata);
            }
            $(this.input).val('');
        },

        micropay: function (tempdata) {
            var _self = this;
            var gatherNo = $(this.input).val();
            var data = {};
            data['orderid'] = this.attrs.payment_bill;
            data['merid'] = '000201504171126553';
            data['authno'] = gatherNo;
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