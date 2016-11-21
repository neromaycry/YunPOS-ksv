/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-withdraw/model',
    'text!../../moduals/layer-withdraw/tpl.html',
], function (BaseLayerView, LayerWithdrawModel, tpl) {

    var layerWithdrawView = BaseLayerView.extend({

        id: "layerWithdrawView",

        template: tpl,

        input: 'input[name = withdraw]',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerWithdrawModel();
            setTimeout(function () {
                $(_self.input).focus();
            });
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_WITHDRAW, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_WITHDRAW, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
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

        onOKClicked: function () {
            var money = $(this.input).val();
            if (money == '') {
                toastr.warning('请输入提款金额');
                return;
            }
            var pos = '收款机(2341)';
            var userName = storage.get(system_config.LOGIN_USER_KEY, 'user_name');
            var currentTime = this.getCurrentFormatDate();
            console.log(currentTime);
            var printText = '\n\n\n\n';
            printText += '            长宇测试\n\n';
            printText += '    提款时间' + currentTime;
            printText += '        收款机：' + pos + '\n\n';
            printText += '        收款员：' + userName + '\n\n';
            printText += '        提取金额：' + toDecimal2(money) + ' 元\n\n\n\n';
            printText += '    提款人签字：\n\n\n\n\n\n\n\n';
            this.sendWebSocketDirective([DIRECTIVES.PRINTTEXT, DIRECTIVES.OpenCashDrawer], [printText, ''], wsClient);
            this.closeLayer(layerindex);
        },

        getCurrentFormatDate: function () {
            var date = new Date();
            var seperator1 = "-";
            var seperator2 = ":";
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var strDate = date.getDate();
            if (month >= 1 && month <= 9) {
                month = "0" + month;
            }
            if (strDate >= 0 && strDate <= 9) {
                strDate = "0" + strDate;
            }
            var currentdate = year + seperator1 + month + seperator1 + strDate
                + " " + date.getHours() + seperator2 + date.getMinutes()
                + seperator2 + date.getSeconds();
            return currentdate;
        }

    });

    return layerWithdrawView;
});