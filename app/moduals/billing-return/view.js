/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing-return/model',
    '../../../../moduals/billing-return/collection',
    'text!../../../../moduals/billing-return/billinfotpl.html',
    'text!../../../../moduals/billing-return/tpl.html'
], function (BaseView, BillRtModel, BillRtCollection, billinfotpl, tpl) {

    var billingRtView = BaseView.extend({

        id: "billingRtView",

        el: '.views',

        template: tpl,

        template_billinfo:billinfotpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING_RETURN;
            this.model = new BillRtModel();
            this.initTemplates();
        },

        initPlugins: function () {
            this.renderBillInfo();
            $('input[name = billingrt]').focus();
        },

        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
        },

        renderBillInfo: function () {
            this.$el.find('.for-billinfort').html(this.template_billinfo(this.model.toJSON()));
            return this;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Esc, function () {
                if (isfromForce) {
                    router.navigate('returnforce',{trigger:true});
                } else {
                    router.navigate('returnwhole',{trigger:true});
                }

            });
        }

    });

    return billingRtView;
});