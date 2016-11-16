/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-gateway/model',
    'text!../../moduals/modal-gateway/tpl.html',
], function (BaseModalView, GatewayModel, tpl) {

    var gatewayModalView = BaseModalView.extend({

        id: "gatewayModalView",

        template: tpl,

        input: 'input[name = server_ip]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        modalInitPage: function () {
            var _self = this;
            this.model = new GatewayModel();
            $('.modal').on('shown.bs.modal', function () {
                $(_self.input).focus();
            });
        },

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.LOGIN);
        },

        onOKClicked: function () {
            var ip = 'http://' + $(this.input).val() + ':3000/v1';
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY, ip);
            this.hideModal(window.PAGE_ID.LOGIN);
            Backbone.trigger('getGatherDetail');
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

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_GATEWAY, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.LOGIN);
                $('input[name = username]').focus();
            });

            this.bindModalKeyEvents(window.PAGE_ID.MODAL_GATEWAY, window.KEYS.Enter, function() {
                _self.onOKClicked();
                $('input[name = username]').focus();
            });
        },

    });

    return gatewayModalView;
});