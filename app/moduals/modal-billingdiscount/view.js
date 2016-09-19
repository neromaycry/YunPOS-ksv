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

        modalInitPage: function () {

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