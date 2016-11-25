/**
 * Created by xuying on 2016/11/25.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-referencenum/model',
    'text!../../moduals/layer-referencenum/tpl.html',
], function (BaseLayerView, LayerSalesmanModel, tpl) {

    var referencenumView = BaseLayerView.extend({

        id: "referencenumView",

        template: tpl,

        input: 'input[name = reference-num]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerSalesmanModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_REFERENCE_NUM, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_REFERENCE_NUM, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billing]').focus();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function () {
            this.onSalesmanLogin();
        },
        
        refund: function () {
            
        }
    });

    return referencenumView;
});