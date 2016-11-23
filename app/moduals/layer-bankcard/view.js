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

        input:'input[name = bk-account]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            this.model = new LayerBankCardModel();
            var data = {
                transaction_amount: '0.01',
                cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                bill_no: this.attrs.bill_no
            };
            console.log(data);
            //data['transaction_amount'] = '0.01';
            //data['cashier_no'] = '2222';
            //data['pos_no'] = '002';
            //data['bill_no'] = this.attrs.bill_no;
            this.sendWebSocketDirective([DIRECTIVES.Bank_sale], [data] , wsClient);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BANK_CARD, KEYS.Esc , function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BANK_CARD, KEYS.Enter, function () {
                _self.confirm();
            });
        },

        confirm: function () {
            var data = {};
            data['gather_id'] = this.attrs.gather_id;
            data['gather_money'] = this.attrs.gather_money;
            data['gather_name'] = this.attrs.gather_name;
            data['gather_kind'] = this.attrs.gather_kind;
            data['payment_bill'] = '';
            Backbone.trigger('onReceivedsum',data);
            this.closeLayer(layerindex);
            $('input[name = billing]').focus();
        },

        onOKClicked: function () {
            this.confirm();
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
        }

    });

    return layerbankcardView;
});