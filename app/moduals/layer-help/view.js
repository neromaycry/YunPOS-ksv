/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-help/model',
    '../../moduals/layer-help/collection',
    'text!../../moduals/layer-help/tpl.html',
], function (BaseLayerView, LayerHelpModel, LayerHelpCollection, tpl) {

    var layerHelpView = BaseLayerView.extend({

        id: "layerHelpView",

        template: tpl,

        events: {
            'click .tipclose':'onCloseClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerHelpModel();
            this.collection = new LayerHelpCollection();
            this.collection.set(storage.get(system_config.SETTING_DATA_KEY, system_config.SHORTCUT_KEY, this.attrs.page));
            console.log(this.collection.toJSON());
            setTimeout(function () {
                _self.renderHotKeys();
            }, 300);
        },

        renderHotKeys: function () {
            this.$el.html(this.template(this.collection.toJSON()));
            return this;
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_HELP, KEYS.Enter, function () {
                _self.onCloseClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_HELP, KEYS.Esc, function () {
                _self.onCloseClicked();
            });
        },

        onCloseClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = main]').focus();
        },

    });

    return layerHelpView;
});