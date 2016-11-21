/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-authcommand/model',
    'text!../../moduals/layer-authcommand/tpl.html',
], function (BaseLayerView, LayerAuthCommandMode, tpl) {

    var layerAuthCommandView = BaseLayerView.extend({

        id: "layerAuthCommandView",

        template: tpl,

        input: 'input[name = authcommand]',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerAuthCommandMode();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCOMMAND, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCOMMAND, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            if (this.attrs.is_navigate) {
                this.confirmCloseLayer(this.attrs.navigate_page);
            } else {
                this.confirmCloseLayer(this.attrs.pageid);
            }
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
            var value = $(this.input).val();
            if (value == '') {
                layer.msg('请输入口令', optLayerWarning);
                return;
            }
            this.attrs.callback();
            if (this.attrs.is_navigate) {
                this.confirmCloseLayer(this.attrs.navigate_page);
            } else {
                this.confirmCloseLayer(this.attrs.pageid);
            }
        },

        closeLayer: function (id) {
            pageId = id;
            layer.close(layerindex);
        },

        confirmCloseLayer:function(pageid) {
            switch (pageid) {
                case window.PAGE_ID.LOGIN:
                    this.closeLayer(PAGE_ID.LOGIN);
                    $('input[name = username]').focus();
                    break;
                case window.PAGE_ID.SETDNS:
                    this.closeLayer(PAGE_ID.SETDNS);
                    break;
                case window.PAGE_ID.MAIN:
                    this.closeLayer(PAGE_ID.MAIN);
                    $('input[name = main]').focus();
                    break;
                case window.PAGE_ID.MEMBER:
                    this.closeLayer(PAGE_ID.MEMBER);
                    break;
                case window.PAGE_ID.RESTORDER:
                    this.closeLayer(PAGE_ID.RESTORDER);
                    break;
                case window.PAGE_ID.RETURN_WHOLE:
                    this.closeLayer(PAGE_ID.RETURN_WHOLE);
                    break;
                case window.PAGE_ID.BILLING:
                    this.closeLayer(PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
                    break;
                case window.PAGE_ID.BILLING_RETURN:
                    this.closeLayer(PAGE_ID.BILLING_RETURN);
                    break;
                case window.PAGE_ID.RETURN_FORCE:
                    this.closeLayer(PAGE_ID.RETURN_FORCE);
                    break;
                case window.PAGE_ID.CHECKING:
                    this.closeLayer(PAGE_ID.CHECKING);
                    break;
            }
        },

    });

    return layerAuthCommandView;
});