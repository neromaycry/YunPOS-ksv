/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-gateway/model',
    'text!../../moduals/layer-gateway/tpl.html',
], function (BaseLayerView, LayerGatewayModel, tpl) {

    var layerGatewayView = BaseLayerView.extend({

        id: "layerGatewayView",

        template: tpl,

        input: 'input[name = server_ip]',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerGatewayModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_GATEWAY, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_GATEWAY, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = main]').focus();
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
            var ip = 'http://' + $(this.input).val() + ':3000/v1';
            storage.set(system_config.SETTING_DATA_KEY,system_config.INIT_DATA_KEY,system_config.GATEWAY_KEY, ip);
            this.closeLayer(layerindex);
            Backbone.trigger('getGatherDetail');
        },

    });

    return layerGatewayView;
});