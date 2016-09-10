/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing/model',
    '../../../../moduals/billing/collection',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection, billinfotpl, tpl) {

    var billingView = BaseView.extend({

        id: "billingView",

        el: '.views',

        template: tpl,

        template_billinfo:billinfotpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING;
            this.model = new BillModel();
            this.initTemplates();
        },

        initPlugins: function () {
            this.renderBillInfo();
            $('input[name = billing]').focus();
        },

        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
        },

        renderBillInfo: function () {
            this.$el.find('.for-billinfo').html(this.template_billinfo(this.model.toJSON()));
            return this;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
        }

    });

    return billingView;
});