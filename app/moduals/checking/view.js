define([
    '../../../../js/common/BaseView',
    '../../../../moduals/checking/model',
    '../../../../moduals/checking/collection',
    'text!../../../../moduals/checking/cashierreporttpl.html',
    'text!../../../../moduals/checking/cashierdetailtpl.html',
    'text!../../../../moduals/checking/cashierdailytpl.html',
    'text!../../../../moduals/checking/tpl.html',
], function (BaseView, CheckingModel,CheckingCollection,cashierreporttpl, cashierdetailtpl,cashierdailytpl, tpl) {

    var checkingView = BaseView.extend({

        id: "checkingView",

        el: '.views',

        template: tpl,

        template_cashierreport:cashierreporttpl,

        template_cashierdetail:cashierdetailtpl,

        template_cashierdailytpl:cashierdailytpl,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.CHECKING;
            this.model = new CheckingModel();
            this.collection = new CheckingCollection();
        },

        initPlugins: function () {
            $('input[name = checking_date]').focus();
            this.initTemplates();
            this.renderCashierreport();
            this.renderCashierdetail();
            this.renderCashierdaily();
        },

        initTemplates: function () {
            this.template_cashierreport = _.template(this.template_cashierreport);
            this.template_cashierdetail = _.template(this.template_cashierdetail);
            this.template_cashierdailytpl = _.template(this.template_cashierdailytpl);
        },

        initLayoutHeight:function(){
            var dh = $(document).height();
            var nav = $('.navbar').height();
            //var table = $('#for-cashier-daily').height();
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Right, function () {
                $('#myTabs a[href="#cashier_daily_report"]').tab('show')
            });
            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Left, function () {
                $('#myTabs a[href="#cashier_report"]').tab('show');
            });
            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Enter, function () {
                var date = $('input[name = checking_date]').val();
                console.log(date);
                if(date == ''){
                    toastr.warning('输入的收银对账日期不能为空');
                }else {
                    var data = {};
                    data['date'] = date;
                    data['type'] = '02';
                    this.request = new CheckingModel();
                    this.request.report(data,function(resp) {
                        if(resp.status == '00'){
                            _self.model.set({
                                pos: resp.pos,
                                name: resp.cashier,
                                date: resp.date,
                                money: resp.sum_money,
                                sale_num: resp.sale_num,//销售
                                sale_money: resp.sale_money,//销售金额
                                refund_num: resp.refund_num,//退货次数
                                refund_money: resp.refund_money,//退货金额
                                sub_num: resp.sub_num,//小计次数
                                sub_money: resp.sub_money//小计金额
                            });
                           _self.collection.set(resp.master_detail);
                            _self.renderCashierreport();
                            _self.renderCashierdetail();
                            _self.renderCashierdaily();
                        }else {
                            toastr.error(resp.msg);
                        }
                    });
                }
                $('input[name = checking_date]').val("");
            });
        },

        renderCashierreport: function () {
            this.$el.find('.for-cashier-report').html(this.template_cashierreport(this.model.toJSON()));
            return this;
        },

        renderCashierdetail: function () {
            this.$el.find('.for-cashier-detail').html(this.template_cashierdetail(this.collection.toJSON()));
            return this;
        },

        renderCashierdaily: function () {
            this.$el.find('.for-cashier-daily').html(this.template_cashierdailytpl(this.model.toJSON()));
            return this;
        }
    });

    return checkingView;
});