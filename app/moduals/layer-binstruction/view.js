/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-binstruction/model',
    'text!../../moduals/layer-binstruction/tpl.html',
], function (BaseLayerView, LayerBInstructionModel, tpl) {

    var layerBInstructionView = BaseLayerView.extend({

        id: "layerBInstructionView",

        template: tpl,

        events: {
            'click #bank_balance': 'onBankBalanceClicked',
            'click #bank_reprint': 'onBankRePrintCliked',
            'click #bank_daily': 'onBankDailyClicked',
            'click #bank_query': 'onBankQueryCliked',
            'click .cancel': 'onCancelClicked',
            'click #bankcheckin': 'checkIn'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            this.model = new LayerBInstructionModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Enter, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Q, function () {
                _self.onBankBalanceClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.W, function () {
                _self.onBankRePrintCliked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.E, function () {
                _self.onBankDailyClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.R, function () {
                _self.onBankQueryCliked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, window.KEYS.A, function () {
                _self.checkIn();
            });
        },

        onCancelClicked: function () {
            this.confirmHideLayer(this.attrs.pageid);
        },

        onBankBalanceClicked: function () {
            this.sendWebSocketDirective([DIRECTIVES.Bank_balance], [''], wsClient);
        },

        onBankRePrintCliked: function () {
            this.sendWebSocketDirective([DIRECTIVES.Bank_reprint], [''], wsClient);
        },

        onBankDailyClicked: function () {
            loading.show();
            var data = {
                cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id')
            };
            console.log(JSON.stringify(data));
            this.sendWebSocketDirective([DIRECTIVES.Bank_daily], [JSON.stringify(data)], wsClient);
        },

        checkIn: function () {
            //toastr.info('签到');
            layer.msg('签到', optLayerSuccess);
            this.sendWebSocketDirective([DIRECTIVES.Bank_signin], [''], wsClient);
        },

        onBankQueryCliked: function () {
            var data = {
                cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id')
            };
            this.sendWebSocketDirective([DIRECTIVES.Bank_query], [JSON.stringify(data)], wsClient);
        }

    });

    return layerBInstructionView;
});