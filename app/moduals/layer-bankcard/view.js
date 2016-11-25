/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-bankcard/model',
    'text!../../moduals/layer-bankcard/contenttpl.html',
    'text!../../moduals/layer-bankcard/tpl.html'
], function (BaseLayerView, LayerBankCardModel, contenttpl, tpl) {

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
            var data = {
                transaction_amount: '0.01',
                cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                bill_no: this.attrs.bill_no
            };
            //var data = {};
            //data['transaction_amount'] = '0.01';
            //data['cashier_no'] = '2222';
            //data['pos_no'] = '002';
            //data['bill_no'] = this.attrs.bill_no;
            console.log(JSON.stringify(data));
            this.sendWebSocketDirective([DIRECTIVES.Bank_sale], [JSON.stringify(data)], wsClient);
        },

        handleEvents: function () {
            Backbone.off('onBankSaleSuccess');
            Backbone.on('onBankSaleSuccess', this.onBankSaleSuccess, this);
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

        onCancelClicked: function () {
            this.closeLayer(layerindex);
        }

    });

    return layerbankcardView;
});