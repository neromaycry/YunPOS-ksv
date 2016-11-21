/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-confirm/model',
    'text!../../moduals/layer-confirm/contenttpl.html',
    'text!../../moduals/layer-confirm/tpl.html',
], function (BaseLayerView, LayerConfirmModel, contenttpl, tpl) {

    var layerConfirmView = BaseLayerView.extend({

        id: "layerConfirmView",

        template: tpl,

        template_content:contenttpl,

        input: 'input[name = salesman_id]',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.template_content = _.template(this.template_content);
            console.log(this.attrs.content);
            this.model = new LayerConfirmModel();
            this.model.set({
                content:this.attrs.content
            });
            Backbone.off('onNavigateStateChanged');
            Backbone.on('onNavigateStateChanged', this.onNavigateStateChanged, this);
            setTimeout(function () {
                _self.renderContent();
            }, 100);
        },

        renderContent: function () {
            this.$el.find('.confirm-content').html(this.template_content(this.model.toJSON()));
            return this;
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_CONFIRM, KEYS.Enter, function () {
                _self.onOKClicked();
            });
            setTimeout(function () {
                _self.bindLayerKeyEvents(PAGE_ID.LAYER_CONFIRM, KEYS.Esc, function () {
                    _self.onCancelClicked();
                });
            }, 500);
        },

        onNavigateStateChanged: function (isNavigate) {
            this.attrs.is_navigate = isNavigate;
        },

        onCancelClicked: function () {
            if (this.attrs.is_navigate) {
                this.confirmCloseLayer(this.attrs.navigate_page);
            } else {
                this.confirmCloseLayer(this.attrs.pageid);
            }
        },

        onOKClicked: function () {
            var _self = this;
            if (this.attrs.is_navigate) {
                this.confirmCloseLayer(this.attrs.navigate_page);
            } else {
                this.confirmCloseLayer(this.attrs.pageid);
            }
            setTimeout(function () {
                _self.attrs.callback();
            }, 50);
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

    return layerConfirmView;
});