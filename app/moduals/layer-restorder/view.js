/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-restorder/model',
    '../../moduals/layer-restorder/collection',
    'text!../../moduals/layer-restorder/tpl.html',
], function (BaseLayerView, LayerRestOrderModel, LayerRestOrderCollection, tpl) {

    var layerRestOrderView = BaseLayerView.extend({

        id: "layerRestOrderView",

        template: tpl,

        input: 'input[name = restorder]',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerRestOrderModel();
            this.collection = new LayerRestOrderCollection();
            if(storage.isSet(system_config.RESTORDER_KEY)) {
                this.obj = storage.get(window.system_config.RESTORDER_KEY);
            }
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_RESTORDER, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_RESTORDER, KEYS.Esc, function () {
                _self.onCancelClicked();
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
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function () {
            this.releaseOrder();
        },

        releaseOrder: function () {
            var value = $(this.input).val();
            if (value == '') {
                //toastr.warning('请输入挂单号');
                layer.msg('请输入挂单号', optLayerWarning);
                $(this.input).focus();
            } else {
                var orderSelected = _.pick(this.obj, value);
                if (_.isEmpty(orderSelected)) {
                    //toastr.warning('没有这个挂单号');
                    layer.msg('没有这个挂单号', optLayerWarning);
                    $(this.input).val('');
                    $(this.input).focus();
                } else {
                    var orderSelectedDetail = orderSelected[value];
                    console.log(orderSelectedDetail);
                    Backbone.trigger('onReleaseOrder',orderSelectedDetail);
                    storage.remove(system_config.RESTORDER_KEY,value);
                    this.closeLayer(layerindex);
                    //toastr.success('解挂成功');
                    layer.msg('解挂成功', optLayerSuccess);
                    $('input[name = main]').focus();
                }
            }
        }

    });

    return layerRestOrderView;
});