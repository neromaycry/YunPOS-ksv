/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-authcard/model',
    'text!../../moduals/layer-authcard/tpl.html',
], function (BaseLayerView, LayerAuthCardModel, tpl) {

    var layerAuthCardView = BaseLayerView.extend({

        id: "layerAuthCardView",

        template: tpl,

        input: 'input[name = authcard]',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerAuthCardModel();
            setTimeout(function () {
                $('input[name = authcard]').koala({
                    delay: 1000,
                    keyup: function () {
                        _self.swipeCard();
                    }
                });
            }, 200);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCARD, KEYS.Enter, function () {
                _self.onCancelClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_AUTHCARD, KEYS.Esc, function () {
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

        swipeCard: function () {
            //var _self = this;
            //var value = $(this.input).val();
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

    return layerAuthCardView;
});