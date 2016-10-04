/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-qpwechat/model',
    '../../moduals/modal-qpwechat/collection',
    'text!../../moduals/modal-qpwechat/tpl.html',
], function (BaseModalView,QPWechatModel,QPWechatCollection, tpl) {

    var qpwechatView = BaseModalView.extend({

        id: "qpwechatView",

        template: tpl,

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
                var data = {};
                data['gather_no'] = gatherNo;
                data['gather_id'] = _self.attrs['gather_id'];
                data['gather_name'] = _self.attrs['gather_name'];
                data['receivedsum'] = _self.attrs['receivedsum'];
                Backbone.trigger('onReceivedsum',data);
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            }
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