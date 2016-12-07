/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-worker/model',
    'text!../../moduals/layer-worker/tpl.html',
], function (BaseLayerView, LayerWorkerModel, tpl) {

    var layerWorkerView = BaseLayerView.extend({

        id: "layerWorkerView",

        template: tpl,

        input: 'input[name = worker]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerWorkerModel();

        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_WORKER, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_WORKER, KEYS.Esc, function () {
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
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onOKClicked: function () {
            var _self = this;
            var worker = $(this.input).val();
            if (worker == '') {
                layer.msg('请输入营业员编号', optLayerWarning);
                return;
            }
            var data = {
                user_id: worker,
                skucode: this.attrs.skucode,
                goods_detail: this.attrs.goods_detail
            };
            this.model.relateWorker(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    _self.closeLayer(layerindex);
                    if (resp.status == '00') {
                        Backbone.trigger('getGoods', _.extend(resp, {skucode: _self.attrs.skucode}));
                    } else if (resp.status == '99') {
                        Backbone.trigger('openLayerWorker', _.extend(resp, {skucode: _self.attrs.skucode}));
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
                $('input[name = main]').focus();
            });
        },


    });

    return layerWorkerView;
});