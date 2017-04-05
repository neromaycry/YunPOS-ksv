
/**
 * Created by xuying on 2017/3/30.
 *  退货结算 选择gather_ui == '01' 的支付方式时跳出此确认对话框
 */

define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtconfirm/model',
    'text!../../moduals/layer-rtconfirm/tpl.html',
], function (BaseLayerView, RTConfirmModel, tpl) {

    var rtconfirmView = BaseLayerView.extend({

        id: "rtconfirmView",

        template: tpl,
        
        events: {
           'click .cancel': 'onCancelClicked',
            'click .ok': 'onOkClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            this.model = new RTConfirmModel();
            this.model.set({
                gather_no: this.attrs.gather_no
            });
            this.render();
        },



        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_CONFIRM, KEYS.Esc, function () {
                _self.onCancelClicked();
            });

            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_RT_CONFIRM, KEYS.Enter, function () {
                _self.onOkClicked();
            });
        },


        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();
        },

        onOkClicked: function () {
            this.closeLayer(layerindex);
            console.log('------------------');
            console.log(this.attrs);
            Backbone.trigger('onRTReceivedsum', this.attrs);
            $('input[name = billingrt]').focus();
        }
    });


    return rtconfirmView;
});