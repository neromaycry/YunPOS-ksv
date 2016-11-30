/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-orderid/model',
    'text!../../moduals/layer-rtgatherui/numpadtpl.html',
    'text!../../moduals/layer-orderid/tpl.html',
], function (BaseLayerView, RTLayerTypeModel ,numpadtpl, tpl) {

    var billtypeView = BaseLayerView.extend({

        id: "billtypeView",

        template: tpl,

        template_numpad: numpadtpl,

        input:'input[name = order-id]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOkClicked',
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            $(this.input).focus();
            var _self = this;
            this.model = new RTLayerTypeModel();
            this.model.set({
                gather_money: this.attrs['gather_money'],
            });
            setTimeout(function () {
                _self.render();
                _self.$el.find('.for-numpad').html(_self.template_numpad);
            }, 100);

        },


        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ORDER_ID, KEYS.Esc, function () {
                _self.onCancelClicked();
            });

            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ORDER_ID, KEYS.Enter, function () {
                _self.onOkClicked();
            });
        },

        /**
         * Enter和确定
         */
        onOkClicked: function () {


        },


        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();
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
        }



    });

    return billtypeView;
});