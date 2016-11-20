/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-salesman/model',
    '../../moduals/layer-salesman/collection',
    'text!../../moduals/layer-salesman/tpl.html',
], function (BaseLayerView, LayerSalesmanModel, LayerSalesmanCollection, tpl) {

    var layerSalesmanView = BaseLayerView.extend({

        id: "layerSalesmanView",

        template: tpl,

        input: 'input[name = salesman_id]',

        events: {
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },

        LayerInitPage: function () {
            var _self = this;
            this.model = new LayerSalesmanModel();
            this.collection = new LayerSalesmanCollection();
            this.collection.fetch({
                success: function (collection,resp) {
                    console.log(collection);
                    _self.collection.set(collection.toJSON());
                }
            });
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_SALESMAN, KEYS.Enter, function () {
                _self.onOKClicked();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_SALESMAN, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
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
            this.onSalesmanLogin();
        },

        /**
         * 销售人员登录事件
         */
        onSalesmanLogin: function () {
            var n = 0;
            var search = $(this.input).val();
            console.log(search);
            if (search == '') {
                toastr.warning('您输入的营业员编号为空');
                return;
            }
            console.log(this.collection.toJSON());
            var result = _.findWhere(this.collection.toJSON(), {number: search});
            console.log(result);
            if (result) {
                Backbone.trigger('SalesmanAdd',result['name']);
                this.closeLayer(layerindex);
            } else {
                toastr.warning('您输入的营业员不存在,请重新输入');
            }


            //for(var i=0;i<this.collection.length;i++){
            //    n++;
            //    if(search == this.collection.at(i).get("number")) {
            //        this.closeLayer();
            //        toastr.success('营业员' + search + '登录成功');
            //        var attrData = {};
            //        attrData['name'] = this.collection.at(i).get("name");
            //        Backbone.trigger('SalesmanAdd',attrData);
            //        $('input[name = main]').focus();
            //        break;
            //    }
            //}
            //if(n == this.collection.length){
            //
            //    n = 0;
            //}
            $(this.input).val('');
        }




    });

    return layerSalesmanView;
});