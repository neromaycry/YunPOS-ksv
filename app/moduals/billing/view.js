/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing/model',
    '../../../../moduals/billing/collection',
    '../../../../moduals/modal-billingtype/view',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection,BilltypeView, billinfotpl, tpl) {

    var billingView = BaseView.extend({

        id: "billingView",

        el: '.views',

        template: tpl,

        totalamount:0,

        unpaidamount:0,

        oddchange:0,

        receivedsum:0,

        visibleTypes:{},

        template_billinfo:billinfotpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING;
            this.model = new BillModel();
            this.totalamount = storage.get(system_config.SALE_PAGE_KEY,'shopinfo','totalamount');
            this.discountamount = storage.get(system_config.SALE_PAGE_KEY,'shopinfo','discountamount');
            this.itemamount = storage.get(system_config.SALE_PAGE_KEY,'shopinfo','itemamount');
            this.totalamount -= this.discountamount;//优惠金额
            this.unpaidamount = this.totalamount;//应收金额
            this.model.set({
                totalamount:this.totalamount,
                receivedsum:this.receivedsum,//实付金额
                unpaidamount:this.unpaidamount,//未付金额
                oddchange:this.oddchange,
            });
            this.typeList = new BillCollection();
            var tlist = storage.get(system_config.GATHER_KEY);
            this.visibleTypes = _.where(tlist,{visible_flag:'1'});
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
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Z, function () {
                if (_self.billtypeView) {
                    _self.billtypeView.remove();
                    _self.billtypeView = new BilltypeView('00');
                } else {
                    _self.billtypeView = new BilltypeView('00');
                }
                _self.showModal(window.PAGE_ID.BILLING_TYPE,_self.billtypeView);
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.O, function() {
                if (_self.billtypeView) {
                    _self.billtypeView.remove();
                    _self.billtypeView = new BilltypeView('01');
                } else {
                    _self.billtypeView = new BilltypeView('01');
                }
                _self.showModal(window.PAGE_ID.BILLING_TYPE,_self.billtypeView);
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.T, function() {
                if (_self.billtypeView) {
                    _self.billtypeView.remove();
                    _self.billtypeView = new BilltypeView('02');
                } else {
                    _self.billtypeView = new BilltypeView('02');
                }
                _self.showModal(window.PAGE_ID.BILLING_TYPE,_self.billtypeView);
            });

        },




    });

    return billingView;
});