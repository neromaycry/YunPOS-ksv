/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billingaccount/model',
    '../../moduals/modal-billingaccount/collection',
    //'../../moduals/modal-billtype/view',
    'text!../../moduals/modal-billingaccount/tpl.html',
], function (BaseModalView,BillaccountModel,BillaccountCollection, tpl) {

    var billaccountView = BaseModalView.extend({

        id: "billaccountView",

        template: tpl,

        input: 'input[name = receive_account]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        modalInitPage: function () {
            console.log(this.attrs);
        },
        onCancelClicked: function () {
            var data = {};
            data['gather_kind'] = this.attrs['gather_kind'];
            data['receivedsum'] = this.attrs['receivedsum'];
            this.hideModal(window.PAGE_ID.BILLING);
            this.billtypeview = new BillTypeView(data);
            this.showModal(window.PAGE_ID.BILLING_TYPE,this.billtypeview);
        },
        onOKClicked: function () {
            var _self = this;
            var receivedaccount = $('#receive_account').val();
            if(receivedaccount == '') {
                toastr.warning('您输入的支付账号为空，请重新输入');
            } else if(receivedaccount == 0){
                toastr.warning('支付账号不能为零，请重新输入');
            } else {
                var attrData = {};
                attrData['gather_id'] = _self.attrs['gather_id'];
                attrData['receivedsum'] = _self.attrs['receivedsum'];
                attrData['gather_name'] = _self.attrs['gather_name'];
                attrData['gather_type'] = _self.attrs['gather_type'];
                attrData['gather_no'] = receivedaccount;
                Backbone.trigger('onReceivedsum',attrData);
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            }
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

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_ACCOUNT, window.KEYS.Esc , function () {
                console.log(_self.attrs['gather_kind']);
                var data = {};
                data['gather_kind'] = _self.attrs['gather_kind'];
                data['receivedsum'] = _self.attrs['receivedsum'];
                _self.hideModal(window.PAGE_ID.BILLING);
                this.billtypeview = new BillTypeView(data);
                this.showModal(window.PAGE_ID.BILLING_TYPE,this.billtypeview);
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_ACCOUNT, window.KEYS.Enter , function () {
                var receivedaccount = $('#receive_account').val();
                if(receivedaccount == '') {
                    toastr.warning('您输入的支付账号为空，请重新输入');
                } else if(receivedaccount == 0){
                    toastr.warning('支付账号不能为零，请重新输入');
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

        //bindModalKeyEvents: function (id,keyCode,callback) {
        //    $(document).keydown(function (e) {
        //        e = e || window.event;
        //        console.log(e.which);
        //        if(e.which == keyCode && pageId == id) {
        //            callback();
        //        }
        //    });
        //},

    });

    return billaccountView;
});