/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-rtqpalipay/model',
    '../../moduals/modal-rtqpalipay/collection',
    'text!../../moduals/layer-gatherui/numpadtpl.html',
    'text!../../moduals/modal-rtqpalipay/tpl.html',
], function (BaseModalView,RTQPAlipayModel,RTQPAlipayCollection,numpadtpl, tpl) {

    var rtqpalipayView = BaseModalView.extend({

        id: "rtqpalipayView",

        template: tpl,

        template_numpad:numpadtpl,

        input:'input[name = rtalipay-account]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
        },

        modalInitPage: function () {
            this.model = new RTQPAlipayModel();
            this.model.set({
                receivedsum:this.attrs['receivedsum']
            });
            this.render();
            this.$el.find('.for-numpad').html(this.template_numpad);
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.RT_QP_ALIPAY, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billingrt]').focus();
            });

            this.bindModalKeyEvents(window.PAGE_ID.RT_QP_ALIPAY, window.KEYS.Enter, function() {
               _self.confirm();
            });
        },

        confirm:function () {
            var _self = this;
            var gatherNo = $(this.input).val();
            if(gatherNo == ''){
                toastr.warning('支付宝账号不能为空');
            } else if((gatherNo.split('.').length-1) > 0){
                toastr.warning('请输入有效的支付宝账号');
            }else{
                var data = {};
                data['gather_no'] = gatherNo;
                data['gather_id'] = _self.attrs['gather_id'];
                data['gather_name'] = _self.attrs['gather_name'];
                data['receivedsum'] = _self.attrs['receivedsum'];
                Backbone.trigger('onReceivedsum',data);
                _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                $('input[name = billingrt]').focus();
            }
            $(this.input).val('');
        },
        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.BILLING_RETURN);
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

    return rtqpalipayView;
});