/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-tip/view',
    '../../moduals/layer-bankcard/model',
    'text!../../moduals/layer-bankcard/contenttpl.html',
    'text!../../moduals/layer-bankcard/tpl.html'
], function (BaseLayerView, LayerTipView, LayerBankCardModel, contenttpl, tpl) {

    var layerbankcardView = BaseLayerView.extend({

        id: "layerbankcardView",

        template: tpl,

        template_content: contenttpl,

        input: 'input[name = bk-account]',

        events: {
            'click .cancel': 'onCancelClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            this.model = new LayerBankCardModel();
            this.handleEvents();
            var swipe_type = this.attrs.swipe_type;
            console.log(swipe_type);
            switch (swipe_type) {
                case 'sale':
                    var data = {
                        transaction_amount: '0.01',
                        //transaction_amount: this.attrs.gather_money,
                        cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                        pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                        bill_no: this.attrs.bill_no
                    };
                    console.log(JSON.stringify(data));
                    this.sendWebSocketDirective([DIRECTIVES.Bank_sale], [JSON.stringify(data)], wsClient);
                    break;
                case 'refund':
                    var data = {
                        transaction_amount: '0.01',
                        //transaction_amount: this.attrs.gather_money,
                        cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                        pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                        bill_no: this.attrs.bill_no,
                        reference_number: this.attrs.reference_number
                    };
                    this.sendWebSocketDirective([DIRECTIVES.Bank_refund], [JSON.stringify(data)], wsClient);
                    break;
            }
        },

        handleEvents: function () {
            Backbone.off('onBankSaleSuccess');
            Backbone.off('onBankRefundSuccess');
            Backbone.on('onBankSaleSuccess', this.onBankSaleSuccess, this);
            Backbone.on('onBankRefundSuccess', this.onBankRefundSuccess, this);
        },


        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BANK_CARD, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BANK_CARD, KEYS.Enter, function () {
                _self.onCancelClicked();
            });
        },

        onBankSaleSuccess: function (resp) {
            console.log(resp);
            var data = {
                gather_id: this.attrs.gather_id,
                gather_money: this.attrs.gather_money,
                gather_name: this.attrs.gather_name,
                gather_kind: this.attrs.gather_kind,
                gather_no: resp.card_no,
                payment_bill: '',
                hasExtra: true,
                extras: {
                    extra_id: 0,
                    reference_number: resp.reference_number
                }
            };
            Backbone.trigger('onReceivedsum', data);
            this.closeLayer(layerindex);
            $('input[name = billing]').focus();
        },

        onBankRefundSuccess: function (resp) {
            if (resp.transaction_amount == this.attrs.gather_money) {
                    // TODO 将相应支付方式添加至支付列表

            } else {
                this.closeLayer(layerindex);
                var attrs = {
                    content: '付款金额与退款金额不符，请联系管理员'
                };
                this.openLayer(PAGE_ID.LAYER_TIP, PAGE_ID.BILLING_RETURN, '提示', LayerTipView, attrs, {area: '500px'});
                layer.msg('付款金额与退款金额不符，请联系管理员', optLayerWarning);
            }
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
        }

    });

    return layerbankcardView;
});