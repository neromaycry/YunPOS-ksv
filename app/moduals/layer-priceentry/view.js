/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-priceentry/model',
    '../../moduals/layer-priceentry/collection',
    'text!../../moduals/layer-priceentry/originalpricetpl.html',
    'text!../../moduals/layer-priceentry/tpl.html',
], function (BaseLayerView, PriceEntryModel, PriceEntryCollection, originalpricetpl, tpl) {

    var layerPriceEntryView = BaseLayerView.extend({

        id: "layerPriceEntryView",

        template: tpl,

        template_originalprice:originalpricetpl,

        input: 'input[name = price]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked'
        },


        LayerInitPage: function () {
            var _self = this;
            console.log(this.attrs);
            this.model = new PriceEntryModel();
            this.model.set({
                originalprice:this.attrs['originalprice']
            });
            this.template_originalprice = _.template(this.template_originalprice);
            setTimeout(function () {
                _self.renderOriginalPrice();
            }, 100);
        },

        renderOriginalPrice: function () {
            this.$el.find('.for-originalprice').html(this.template_originalprice(this.model.toJSON()));
            return this;
        },


        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_PRICE_ENTRY, KEYS.Enter, function () {
               _self.confirm();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_PRICE_ENTRY, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        confirm: function () {
            var price = $(this.input).val();
            if(price == '') {
                toastr.warning('单价不能为空');
            }else if(price == 0) {
                toastr.warning('单价不能为零');
            }else if((price.split('.').length-1) > 1 || price == '.') {
                toastr.warning('无效的单价');
            } else {
                this.attrs.callback();
                this.closeLayer(layerindex);
            }
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            switch (this.attrs.pageid) {
                case 2:
                    $('input[name = main]').focus();
                    break;
                default:
                    $('input[name = sku_id]').focus();
            }
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
            this.confirm();
        },

    });

    return layerPriceEntryView;
});