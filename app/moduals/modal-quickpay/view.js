/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-quickpay/model',
    '../../moduals/modal-quickpay/collection',
    'text!../../moduals/modal-gatherui/numpadtpl.html',
    'text!../../moduals/modal-quickpay/tpl.html',
], function (BaseModalView,QuickpayModel,QuickpayCollection,numpadtpl, tpl) {

    var quickView = BaseModalView.extend({

        id: "quickView",

        template: tpl,

        template_numpad:numpadtpl,

        input:'input[name = quickpay-account]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
        },

        modalInitPage: function () {
            console.log(this.attrs);
            this.model = new QuickpayModel();
            this.model.set({
                gather_name:this.attrs['gather_name'],
                unpaidamount:this.attrs['unpaidamount'],
            });
            this.render();
            this.$el.find('.for-numpad').html(this.template_numpad);
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.QUICK_PAY, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.QUICK_PAY, window.KEYS.Enter, function () {
                _self.confirm();
            });
        },

        confirm: function () {
            var gather_no = $('input[name = quickpay-account]').val();
            if(gather_no == ''){
                toastr.warning('付款账号不能为空');
            }else{
                var data = {};
                data['receivedsum'] = this.attrs['unpaidamount'];
                data['gather_id'] = this.attrs['gather_id'];
                data['gather_name'] = this.attrs['gather_name'];
                data['gather_no'] = gather_no;
                Backbone.trigger('onReceivedsum',data);
                this.hideModal(window.PAGE_ID.BILLING);
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

    return quickView;
});