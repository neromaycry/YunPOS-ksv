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

        //events: {
        //    'click .cancel': 'onCancelClicked'
        //},

        LayerInitPage: function () {
            console.log(this.attrs);
            this.model = new LayerBankCardModel();
            this.handleEvents();
            var swipe_type = this.attrs.swipe_type;
            console.log(swipe_type);
            switch (swipe_type) {
                case 'sale':
                    var data = {
                        //transaction_amount: '0.01',
                        transaction_amount: this.attrs.gather_money,
                        cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                        pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                        bill_no: this.attrs.bill_no
                    };
                    console.log(JSON.stringify(data));
                    this.sendWebSocketDirective([DIRECTIVES.Bank_sale], [JSON.stringify(data)], wsClient);
                    break;
                case 'refund':
                    var itfcType = storage.get(system_config.POS_CONFIG, 'bank_interface');
                    if (itfcType == Interface_type.ABC_BJCS) {
                        var data = {
                            //transaction_amount: '0.01',
                            transaction_amount: this.attrs.gather_money,
                            cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                            pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                            bill_no: this.attrs.bill_no,
                            reference_number: this.attrs.reference_number
                        };
                    } else if (itfcType == Interface_type.CCB_LANDI) {
                        var data = {
                            //transaction_amount: '0.01',
                            transaction_amount: this.attrs.gather_money,
                            cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                            pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                            bill_no: this.attrs.bill_no,
                            reference_number: this.attrs.reference_number,
                            sale_dt: this.attrs.sale_dt
                        };
                    }
                    this.sendWebSocketDirective([DIRECTIVES.Bank_refund], [JSON.stringify(data)], wsClient);
                    break;
                case 'back_out':
                    var itfcType = storage.get(system_config.POS_CONFIG, 'bank_interface');
                    switch (itfcType) {
                        case Interface_type.ABC_BJCS:
                            var data = {
                                transaction_amount: this.attrs.gather_money,
                                cashier_no: this.attrs.cashier_no,
                                pos_no: this.attrs.pos_no,
                                bill_no: this.attrs.bill_no,
                                reference_number: this.attrs.reference_number,
                            };
                            break;
                        case Interface_type.CCB_LANDI:
                            var data = {
                                transaction_amount: this.attrs.gather_money,
                                cashier_no: this.attrs.cashier_no,
                                pos_no: this.attrs.pos_no,
                                bill_no: this.attrs.bill_no,
                                serial_no: this.attrs.reference_number,
                                swipe_type: 'back_out',
                                billing_mode: this.attrs.billing_mode3
                            };
                            break;
                    }
                    this.sendWebSocketDirective([DIRECTIVES.Bank_backout], [JSON.stringify(data)], wsClient);
                    break;
            }
        },

        handleEvents: function () {
            Backbone.off('onBankSaleSuccess');
            Backbone.off('onBankRefundSuccess');
            Backbone.off('onRTBankBackoutSuccess');
            Backbone.off('onBankBackoutSuccess');
            Backbone.on('onBankSaleSuccess', this.onBankSaleSuccess, this);
            Backbone.on('onBankRefundSuccess', this.onBankRefundSuccess, this);
            Backbone.on('onRTBankBackoutSuccess', this.onRTBankBackoutSuccess, this);
            Backbone.on('onBankBackoutSuccess', this.onBankBackoutSuccess, this);
        },

        //bindLayerKeys: function () {
        //    var _self = this;
        //    this.bindLayerKeyEvents(PAGE_ID.LAYER_BANK_CARD, KEYS.Esc, function () {
        //        _self.onCancelClicked();
        //    });
        //    this.bindLayerKeyEvents(PAGE_ID.LAYER_BANK_CARD, KEYS.Enter, function () {
        //        _self.onCancelClicked();
        //    });
        //},

        onBankSaleSuccess: function (resp) {
            console.log(resp);
            var len = resp.card_no.length;
            console.log(len);
            if (len > 30) {
                layer.msg('card_no超过30位，请检查websocket程序', optLayerError);
                return;
            }
            var data = {
                gather_id: this.attrs.gather_id,
                gather_money: this.attrs.gather_money,
                gather_name: this.attrs.gather_name,
                gather_kind: this.attrs.gather_kind,
                gather_no: resp.card_no,
                hasExtra: true,
                extras: {
                    extra_id: 0,
                    gather_ui: this.attrs.gather_ui,
                    reference_number: resp.reference_number
                }
            };
            Backbone.trigger('onReceivedsum', data);
            this.closeLayer(layerindex);
            $('input[name = billing]').focus();
        },

        onBankRefundSuccess: function (resp) {
            var len = resp.card_no.length;
            console.log(len);
            if (len > 30) {
                layer.msg('card_no超过30位，请检查websocket程序', optLayerError);
                return;
            }
            if (resp.transaction_amount == this.attrs.gather_money) {
                var data = {
                    gather_id: this.attrs.gather_id,
                    gather_money: this.attrs.gather_money,
                    gather_name: this.attrs.gather_name,
                    gather_kind: this.attrs.gather_kind,
                    gather_no: resp.card_no,
                    hasExtra: true,
                    extras: {
                        extra_id: 0,
                        gather_ui: this.attrs.gather_ui,
                        reference_number: resp.reference_number
                    }
                };
                // TODO 将相应支付方式添加至支付列表
                Backbone.trigger('onRTReceivedsum', data);
                this.closeLayer(layerindex);
                $('input[name = billingrt]').focus();
            } else {
                this.closeLayer(layerindex);
                var attrs = {
                    content: '付款金额与退款金额不符，请联系管理员'
                };
                this.openLayer(PAGE_ID.LAYER_TIP, PAGE_ID.BILLING_RETURN, '提示', LayerTipView, attrs, {area: '500px'});
            }
        },

        onBankBackoutSuccess: function () {
            this.closeLayer(layerindex);
            Backbone.trigger('onBankBackoutDelete');
        },

        onRTBankBackoutSuccess: function (resp) {
            console.log('onRTbankbackoutsuccess===============');
            console.log(resp);
            var len = resp.card_no.length;
            console.log(len);
            if (len > 30) {
                layer.msg('card_no超过30位，请检查websocket程序', optLayerError);
                return;
            }
            if (resp.transaction_amount == this.attrs.gather_money) {
                var data = {
                    gather_id: this.attrs.gather_id,
                    gather_money: this.attrs.gather_money,
                    gather_name: this.attrs.gather_name,
                    gather_kind: this.attrs.gather_kind,
                    gather_no: resp.card_no,
                    hasExtra: true,
                    extras: {
                        extra_id: 0,
                        gather_ui: this.attrs.gather_ui,
                        reference_number: resp.reference_number
                    }
                };
                // TODO 将相应支付方式添加至支付列表
                Backbone.trigger('onRTReceivedsum', data);
                this.closeLayer(layerindex);
                $('input[name = billingrt]').focus();
            } else {
                this.closeLayer(layerindex);
                var attrs = {
                    content: '付款金额与退款金额不符，请联系管理员'
                };
                this.openLayer(PAGE_ID.LAYER_TIP, PAGE_ID.BILLING_RETURN, '提示', LayerTipView, attrs, {area: '500px'});
            }
        },

        onCancelClicked: function () {
            if (this.attrs.pageid == PAGE_ID.BILLING) {
                $('input[name = billing]').focus();
            } else {
                $('input[name = billingrt]').focus();
            }
            this.closeLayer(layerindex);
        }

    });

    return layerbankcardView;
});