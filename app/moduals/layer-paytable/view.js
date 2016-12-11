/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-paytable/model',
    '../../moduals/layer-paytable/collection',
    'text!../../moduals/layer-paytable/tpl.html',
], function (BaseLayerView, LayerPaytableModel, LayerPaytableCollection, tpl) {

    var layerPaytableView = BaseLayerView.extend({

        id: "layerPaytableView",

        template: tpl,

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerPaytableModel();
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.Esc, function () {
                _self.onCancelClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_PAYTABLE, KEYS.P, function () {
                _self.onPrintClicked();
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
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function () {

        },

        onPrintClicked: function () {
            layer.msg('缴款单已打印', optLayerSuccess);
            this.closeLayer(layerindex)
        }

    });

    return layerPaytableView;
});