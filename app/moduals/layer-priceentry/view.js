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

        template_originalprice: originalpricetpl,

        input: 'input[name = price]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked'
        },


        LayerInitPage: function () {
            var _self = this;
            console.log(this.attrs);
            this.model = new PriceEntryModel();
            this.model.set({
                originalprice: this.attrs['originalprice']
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
            setTimeout(function () {
                _self.bindLayerKeyEvents(PAGE_ID.LAYER_PRICE_ENTRY, KEYS.Enter, function () {
                    console.log('price entry ok entered');
                    _self.onOKClicked();
                });
            }, 500);
            this.bindLayerKeyEvents(PAGE_ID.LAYER_PRICE_ENTRY, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
        },

        onOKClicked: function () {
            var price = $(this.input).val();
            if (price == '' || parseFloat(price) == 0 || (price.split('.').length - 1) > 1 || price == '.') {
                layer.msg('无效的单价', optLayerWarning);
                $(this.input).val('');
                return;
            }
            this.attrs.callback();
            this.closeLayer(layerindex);
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
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

    });

    return layerPriceEntryView;
});