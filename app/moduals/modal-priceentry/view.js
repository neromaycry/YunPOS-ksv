/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-priceentry/model',
    '../../moduals/modal-priceentry/collection',
    'text!../../moduals/modal-priceentry/originalpricetpl.html',
    'text!../../moduals/modal-priceentry/tpl.html',
], function (BaseModalView,PriceEntryModel,PriceEntryCollection,originalpricetpl, tpl) {

    var priceentryView = BaseModalView.extend({

        id: "priceentryView",

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


        modalInitPage: function () {
            console.log(this.attrs);
            this.model = new PriceEntryModel();
            this.model.set({
                originalprice:this.attrs['originalprice']
            });
            this.template_originalprice = _.template(this.template_originalprice);

            this.renderOriginalPrice();

        },

        renderOriginalPrice: function () {
            this.$el.find('.for-originalprice').html(this.template_originalprice(this.model.toJSON()));
            return this;
        },
        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.MAIN);
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

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_PRICE_ENTRY, window.KEYS.Enter, function () {
               _self.confirm();
            });
            this.bindModalKeyEvents(window.PAGE_ID.MODAL_PRICE_ENTRY, window.KEYS.Esc, function () {
                _self.hideModal(window.PAGE_ID.MAIN);
                $('input[name = main]').focus();
            });
        },

        bindModalKeyEvents: function (id,keyCode,callback) {
            $(document).keydown(function (e) {
                var e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },
        confirm: function () {
            var price = $(this.input).val();
            if(price == '') {
                toastr.warning('单价不能为空');
            }else if(price == '.') {
                toastr.warning('请输入有效的单价');
            }else if(price == 0) {
                toastr.warning('单价不能为零');
            }else if((price.split('.').length-1) > 1) {
                toastr.warning('请输入有效金额');
            } else {
                this.attrs.callback(this.attrs);
                this.confirmHideModal(this.attrs.pageid);
            }
        }

    });

    return priceentryView;
});