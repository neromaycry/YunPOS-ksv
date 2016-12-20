/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtreturndate/model',
    '../../moduals/layer-rtgatherui/view',
    '../../moduals/layer-referencenum/view',
    'text!../../moduals/layer-rtreturndate/tpl.html',
], function (BaseLayerView, LayerReturnDateModel, RTLayerGatherUIView, LayerReferenceNumView, tpl) {

    var LayerReturnDateView = BaseLayerView.extend({

        id: "layerReturnDateView",

        template: tpl,

        i:0,

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click [data-index]': 'onReturnDateClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerReturnDateModel();
            setTimeout(function () {
                $('#rtdate' + _self.i).addClass('cus-selected');
            }, 300);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_RETURN_DATE, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_RETURN_DATE, KEYS.Esc, function () {
                _self.onCancelClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_RETURN_DATE, KEYS.Up, function () {
               _self.scrollUp();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_RETURN_DATE, KEYS.Down, function () {
               _self.scrollDown();
            });
        },

        /**
         * 方向下
         */
        scrollDown: function () {
            if (this.i < 1) {
                this.i++;
            }
            $('#rtdate' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 方向上
         */
        scrollUp: function () {
            if (this.i > 0) {
                this.i--;
            }
            $('#rtdate' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },


        onCancelClicked: function () {
            this.closeLayer();
            $('input[name = billingrt]').focus();
        },

        onOKClicked: function () {
            this.closeLayer();
            if(this.i == '0') {
                this.openLayer(PAGE_ID.LAYER_REFERENCE_NUM, PAGE_ID.BILLING_RETURN, '请输入凭证号', LayerReferenceNumView, this.attrs, {area: '300px'});
            } else {
                this.openLayer(PAGE_ID.LAYER_RT_BILLACCOUNT, PAGE_ID.BILLING_RETURN, '请输入凭证号', RTLayerGatherUIView, this.attrs, {area: '400px'});
            }
        },

        onReturnDateClicked: function (e) {
            this.i = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        }

    });

    return LayerReturnDateView;
});