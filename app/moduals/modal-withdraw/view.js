/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-withdraw/model',
    'text!../../moduals/modal-withdraw/tpl.html',
], function (BaseModalView, withDrawModel, tpl) {

    var withDrawView = BaseModalView.extend({

        id: "withDrawView",

        template: tpl,

        input: 'input[name = withdraw]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },


        modalInitPage: function () {
            var _self = this;
            $('.modal').on('shown.bs.modal', function () {
                $(_self.input).focus();
            });
            wsClient.send(DIRECTIVES.OpenCashDrawer);
        },

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.MAIN);
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
                toastr.waring('请输入提款金额');
                return;
            }
            var pos = '收款机(2341)';
            var userName = storage.get(system_config.LOGIN_USER_KEY, 'user_name');
            var printText = '\n\n\n\n';
            printText += '        收款机：' + pos + '\n\n';
            printText += '        收款员：' + userName + '\n\n';
            printText += '        提取金额：' + toDecimal2(money) + ' 元\n\n\n\n\n\n\n\n';
            wsClient.send(DIRECTIVES.PRINTTEXT + printText);
            this.hideModal(window.PAGE_ID.MAIN);
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_WITHDRAW, window.KEYS.Enter, function () {
                _self.onOKClicked();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_WITHDRAW, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
                $('input[name = main]').focus();
            });
        }

    });

    return withDrawView;
});