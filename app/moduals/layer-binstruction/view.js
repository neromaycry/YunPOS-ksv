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

        events:{
        },


        LayerInitPage: function () {
            this.model = new LayerBInstructionModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Enter, function () {
               _self.confirm();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_BANK_INSTRUCTION, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            switch (this.attrs.pageid) {
                case 2:
                    $('input[name = main]').focus();
                    break;
                default:
                    $('input[name = billing]').focus();
            }
        },


    });

    return layerBInstructionView;
});