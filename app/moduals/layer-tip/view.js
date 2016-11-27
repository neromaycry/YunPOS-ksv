/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-tip/model',
    'text!../../moduals/layer-confirm/contenttpl.html',
    'text!../../moduals/layer-tip/tpl.html',
], function (BaseLayerView, LayerTipModel, contenttpl, tpl) {

    var layerTipView = BaseLayerView.extend({

        id: "layerTipView",

        template: tpl,

        template_content: contenttpl,

        events: {
            'click .ok': 'onOKClicked',
        },

        LayerInitPage: function () {
            var _self = this;
            this.template_content = _.template(this.template_content);
            console.log(this.attrs.content);
            this.model = new LayerTipModel();
            this.model.set({
                content: this.attrs.content
            });
            setTimeout(function () {
                _self.renderContent();
            }, 100);
        },

        renderContent: function () {
            this.$el.find('.tip-content').html(this.template_content(this.model.toJSON()));
            return this;
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_TIP, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_TIP, KEYS.Esc, function () {
                _self.onOKClicked();
            });
        },

        onOKClicked: function () {
            //this.confirmHideLayer(this.attrs.pageid);
            this.closeLayer(layerindex)
        },

    });

    return layerTipView;
});