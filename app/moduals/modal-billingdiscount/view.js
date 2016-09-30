/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billingdiscount/model',
    '../../moduals/modal-billingdiscount/collection',
    'text!../../moduals/modal-billingdiscount/tpl.html',
], function (BaseModalView,BilldiscountModel,BilldiscountCollection, tpl) {

    var billdiscountView = BaseModalView.extend({

        id: "billdiscountView",

        template: tpl,


        input: 'input[name = percentage]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        modalInitPage: function () {

        },
        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.BILLING);
        },

        onOKClicked: function () {
            var attrData = {};
            attrData['percentage'] = $('input[name = percentage]').val();
            Backbone.trigger('onBillDiscount',attrData);
            this.hideModal(window.PAGE_ID.BILLING);
            $('input[name = billing]').focus();
            $('button[name = totaldiscount]').css('display','none');
            $('button[name = cancel-totaldiscount]').css('display','block');
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
            this.bindModalKeyEvents(window.PAGE_ID.BILL_DISCOUNT, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILL_DISCOUNT, window.KEYS.Enter , function () {
                var attrData = {};
                attrData['percentage'] = $('input[name = percentage]').val();
                Backbone.trigger('onBillDiscount',attrData);
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
                $('button[name = totaldiscount]').css('display','none');
                $('button[name = cancel-totaldiscount]').css('display','block');
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

    return billdiscountView;
});