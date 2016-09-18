/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing/model',
    '../../../../moduals/billing/collection',
    '../../../../moduals/modal-billingtype/view',
    '../../../../moduals/modal-billingaccount/view',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection,BilltypeView, BillaccountView, billinfotpl, billingdetailtpl, tpl) {

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

        template_billingdetailtpl:billingdetailtpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING;
            this.model = new BillModel();
            this.collection = new BillCollection();
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
            this.initTemplates();
            this.handleEvents();

        },

        initPlugins: function () {
            var _self = this;
            this.renderBillInfo();
            $('input[name = billing]').focus();
            this.initLayoutHeight();
        },

        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(document).height();
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var billdetail = dh - nav * 2 - panelheading * 2;
            $('.for-billdetail').height(billdetail);
        },

        handleEvents: function () {
            Backbone.off('onReceivedsum');
            Backbone.on('onReceivedsum',this.onReceivedsum,this);
        },

        onReceivedsum: function (data) {
            var receivedsum = data['receivedsum'];
            var gatherNo = data['gather_no'];
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            console.log(data);
            this.addToPaymentList(this.totalamount,gatherName,receivedsum,gatherNo,gatherId);
        },

        /**
         * 向已付款列表中插入新的行
         * @param totalamount 总金额
         * @param gatherName 付款方式名称
         * @param receivedsum 付款金额
         * @param gatherAccount 付款账号
         * @param gatherId 付款方式Id
         */
        addToPaymentList: function (totalamount,gatherName,receivedsum,gatherAccount,gatherId) {
            var model = new BillModel();
            model.set({
                fact_money:0,
                gather_id:gatherId,
                gather_name:gatherName,
                gather_money:parseFloat(receivedsum),
                gather_no:gatherAccount
            });
            this.collection.add(model);
            var totalreceived = 0;
            var trList = this.collection.pluck('gather_money');
            console.log(trList);
            for(var i = 0;i<trList.length;i++){
                totalreceived += trList[i];
            }
            console.log('totalreceived:'+totalreceived);
            console.log(totalamount + 'this is totalamount');
            if(totalreceived >= totalamount){
                this.unpaidamount = 0;
                this.oddchange = totalreceived - totalamount;
            }else{
                this.oddchange = 0;
                this.unpaidamount = totalamount - totalreceived;
            }
            this.model.set({
                receivedsum: totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange:this.oddchange
            });
            this.renderBillInfo();
            this.renderBillDetail();
        },

        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
            this.template_billingdetailtpl = _.template(this.template_billingdetailtpl);
        },

        renderBillInfo: function () {
            this.$el.find('.for-billinfo').html(this.template_billinfo(this.model.toJSON()));
            return this;
        },

        renderBillDetail: function () {
            this.$el.find('.for-billdetail').html(this.template_billingdetailtpl(this.collection.toJSON()));
            return this;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Enter, function () {
                _self.receivedsum = $('#input_billing').val();
                if(_self.model.get('unpaidamount') == 0) {
                    toastr.warning('待支付金额为零，请进行结算');
                }else{
                    _self.addToPaymentList(_self.totalamount,"现金",_self.receivedsum,"*","00");
                }
                $('#input_billing').val("");
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.S, function() {
                var unpaidamount = _self.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.warning('待支付金额为零,请进行结算');
                }else {
                    this.billtype = new BilltypeView('00');
                    _self.showModal(window.PAGE_ID.BILLING_TYPE,_self.billtype);
                    var attrData = {};
                    attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                    Backbone.trigger('onunpaidamount',attrData);
                    $('.modal').on('shown.bs.modal',function(e) {
                        $('input[name = receivedsum]').focus();
                        //$('#li' + _self.i).addClass('cus-selected');
                    });
                }
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.T, function() {
                var unpaidamount = _self.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.warning('待支付金额为零,请进行结算');
                }else {
                    this.billtype = new BilltypeView('01');
                    _self.showModal(window.PAGE_ID.BILLING_TYPE,_self.billtype);
                    var attrData = {};
                    attrData['unpaidamount'] = _self.model.get('unpaidamount');//本次应收的金额
                    Backbone.trigger('onunpaidamount',attrData);
                    $('.modal').on('shown.bs.modal',function(e) {
                        $('input[name = receivedsum]').focus();
                        //$('#li' + _self.i).addClass('cus-selected');
                    });
                }
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.O, function() {
                var unpaidamount = _self.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.warning('待支付金额为零,请进行结算');
                }else {
                    this.billtype = new BilltypeView('02');
                    _self.showModal(window.PAGE_ID.BILLING_TYPE,_self.billtype);
                    var attrData = {};
                    attrData['unpaidamount'] = _self.model.get('unpaidamount');//本次应收的金额
                    Backbone.trigger('onunpaidamount',attrData);
                    $('.modal').on('shown.bs.modal',function(e) {
                        $('input[name = receivedsum]').focus();
                        //$('#li' + _self.i).addClass('cus-selected');
                    });
                }
            });
        }

    });

    return billingView;
});