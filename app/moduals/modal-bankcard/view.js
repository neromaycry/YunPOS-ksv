/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-bankcard/model',
    'text!../../moduals/modal-bankcard/contenttpl.html',
    'text!../../moduals/modal-bankcard/tpl.html'
], function (BaseModalView, BankCardModel, contenttpl, tpl) {

    var bankcardView = BaseModalView.extend({

        id: "bankcardView",

        template: tpl,

        template_content: contenttpl,

        input:'input[name = bk-account]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked'
        },

        modalInitPage: function () {
            var data = {};
            data['transaction_amount'] = '20.22';
            data['cashier_no'] = '2222';
            data['pos_no'] = '002';
            data['bill_no'] = this.attrs.bill_no;
            this.sendWebSocketDirective([DIRECTIVES.Bank_sale],[data] , wsClient);
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_BANK_CARD, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_BANK_CARD, window.KEYS.Enter, function () {
                _self.confirm();
            });
        },

        confirm: function () {
            var data = {};
            data['gather_id'] = this.attrs.gather_id;
            data['gather_money'] = this.attrs.gather_money;
            data['gather_name'] = this.attrs.gather_name;
            //data['gather_no'] = bankCardAccount;
            data['gather_kind'] = this.attrs.gather_kind;
            data['payment_bill'] = '';
            Backbone.trigger('onReceivedsum',data);
            this.hideModal(window.PAGE_ID.BILLING);
            $('input[name = billing]').focus();
        },

        onOKClicked: function () {
            this.confirm();
        },

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.BILLING);
            $('input[name = billing]').focus();
        }

    });

    return bankcardView;
});