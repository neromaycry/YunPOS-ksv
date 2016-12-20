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

        i:0,

        events: {
            'click #bank_balance': 'onBankBalanceClicked',
            'click #bank_reprint': 'onBankRePrintCliked',
            'click #bank_daily': 'onBankDailyClicked',
            'click #bank_query': 'onBankQueryCliked',
            'click #bankcheckin': 'checkIn',
            'click .cancel': 'onCancelClicked',
            'click .ok':'onOKClicked',
            'click [data-index]':'onTypeClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.model = new LayerBInstructionModel();
            setTimeout(function () {
                $('#bank' + _self.i).addClass('cus-selected');
            }, 100);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Enter, function () {
                _self.onOKClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Up, function () {
                _self.scrollUp();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Down, function () {
                _self.scrollDown();
            });
            //this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Q, function () {
            //    _self.onBankBalanceClicked();
            //});
            //this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.W, function () {
            //    _self.onBankRePrintCliked();
            //});
            //this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.E, function () {
            //    _self.onBankDailyClicked();
            //});
            //this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.R, function () {
            //    _self.onBankQueryCliked();
            //});
            //this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, window.KEYS.A, function () {
            //    _self.checkIn();
            //});
        },


        onOKClicked: function () {
            switch (this.i) {
                case 0 :
                    this.onBankBalanceClicked();
                    break;
                case 1 :
                    this.onBankRePrintCliked();
                    break;
                case 2 :
                    this.onBankDailyClicked();
                    break;
                case 3 :
                    this.onBankQueryCliked();
                    break;
                case 4 :
                    this.checkIn();
                    break;
            }
            this.confirmHideLayer(this.attrs.pageid);
        },

        onTypeClicked: function (e) {
            this.i = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        onCancelClicked: function () {
            this.confirmHideLayer(this.attrs.pageid);
        },

        /**
         * 方向下
         */
        scrollDown: function () {
            if (this.i < 4) {
                this.i++;
            }
            $('#bank' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 方向上
         */
        scrollUp: function () {
            if (this.i > 0) {
                this.i--;
            }
            $('#bank' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },



        //余额查询
        onBankBalanceClicked: function () {
            this.sendWebSocketDirective([DIRECTIVES.Bank_balance], [''], wsClient);
        },

        //重印最后一笔
        onBankRePrintCliked: function () {
            this.sendWebSocketDirective([DIRECTIVES.Bank_reprint], [''], wsClient);
        },

        //日结
        onBankDailyClicked: function () {
            loading.show();
            var data = {
                cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id')
            };
            console.log(JSON.stringify(data));
            this.sendWebSocketDirective([DIRECTIVES.Bank_daily], [JSON.stringify(data)], wsClient);
        },

        //签到
        checkIn: function () {
            layer.msg('签到', optLayerSuccess);
            this.sendWebSocketDirective([DIRECTIVES.Bank_signin], [''], wsClient);
        },

        //查询流水
        onBankQueryCliked: function () {
            var data = {
                cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id')
            };
            this.sendWebSocketDirective([DIRECTIVES.Bank_query], [JSON.stringify(data)], wsClient);
        }

    });

    return layerBInstructionView;
});