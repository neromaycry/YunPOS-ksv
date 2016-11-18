define([
    '../../../../js/common/BaseView',
    '../../../../moduals/checking/model',
    '../../../../moduals/checking/collection',
    '../../../../moduals/keytips-member/view',
    'text!../../../../moduals/checking/cashierreporttpl.html',
    'text!../../../../moduals/checking/reportdetailtpl.html',
    'text!../../../../moduals/checking/cashierdailytpl.html',
    'text!../../../../moduals/checking/dailydetailtpl.html',
    'text!../../../../moduals/checking/tpl.html',
], function (BaseView, CheckingModel,CheckingCollection, KeyTipsView, cashierreporttpl, cashierdetailtpl,cashierdailytpl,dailydetailtpl, tpl) {

    var checkingView = BaseView.extend({

        id: "checkingView",

        el: '.views',

        template: tpl,

        template_cashierreport:cashierreporttpl,

        template_cashierdetail:cashierdetailtpl,

        template_cashierdailytpl:cashierdailytpl,

        template_dailydetailtpl:dailydetailtpl,

        i:0,

        isCashierReport:true,

        input: 'input[name = checking_date]',

        events: {
            'click .ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .back-to-main':'onBackClicked',
            'click .help':'onHelpClicked',
            'click .keyup':'onKeyUpClicked',
            'click .keydown':'onKeyDownClicked',
            'click #report':'onReportClicked',
            'click #daily-report':'onDailyReportClicked',
            'click .print':'onPrintClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.CHECKING;
            this.model = new CheckingModel();
            this.collection = new CheckingCollection();
            this.printText = '';
        },

        initPlugins: function () {
            $('input[name = checking_date]').focus();
            this.initTemplates();
            this.renderCashierreport();
            this.renderCashierdetail();
            this.renderCashierdaily();
            this.renderCashierdailyDetail();
        },

        initTemplates: function () {
            this.template_cashierreport = _.template(this.template_cashierreport);
            this.template_cashierdetail = _.template(this.template_cashierdetail);
            this.template_cashierdailytpl = _.template(this.template_cashierdailytpl);
            this.template_dailydetailtpl = _.template(this.template_dailydetailtpl);
        },

        initLayoutHeight:function(){
            var dh = $(window).height();
            var nav = $('.navbar').height();
            var td = $('td').height();
            var cashierdetail = dh - 3 * nav - td * 8 - 110;
            $('.for-cashier-detail').height(cashierdetail);
            $('.for-daily-detail').height(cashierdetail);
            this.listheight = cashierdetail;
            this.listnum = 6;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Right, function () {
                _self.isCashierReport = false;
                _self.i = 0;
                _self.n = 0;
                $('#myTabs a[href="#cashier_daily_report"]').tab('show')
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Left, function () {
                _self.isCashierReport = true;
                _self.i = 0;
                _self.n = 0;
                $('#myTabs a[href="#cashier_report"]').tab('show');
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Enter, function () {
                if (_self.printText == '') {
                    _self.checkingDate();
                } else {
                    _self.onPrintClicked();
                }
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Down, function () {
                _self.scrollDown();
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Up, function() {
               _self.scrollUp();
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.T, function () {
                var tipsView = new KeyTipsView('CHECKING_PAGE');
                _self.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
            });
        },

        renderCashierreport: function () {
            this.$el.find('.for-cashier-report').html(this.template_cashierreport(this.model.toJSON()));
            return this;
        },

        renderCashierdetail: function () {
            this.$el.find('.for-cashier-detail').html(this.template_cashierdetail(this.collection.toJSON()));
            $('.li-detail').height(this.listheight / this.listnum - 21);
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },

        renderCashierdaily: function () {
            this.$el.find('.for-cashier-daily').html(this.template_cashierdailytpl(this.model.toJSON()));
            return this;
        },

        renderCashierdailyDetail: function () {
            this.$el.find('.for-daily-detail').html(this.template_dailydetailtpl(this.collection.toJSON()));
            $('#detail' + this.i).addClass('cus-selected');
            $('.li-detail').height(this.listheight / this.listnum - 21);
            return this;
        },

        scrollDown:function (){
            var _self = this;
            if(_self.isCashierReport){
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                if (_self.i % _self.listnum == 0) {
                    _self.n++;
                    $('.for-cashier-detail').scrollTop(_self.listheight * _self.n);
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }else{
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                if (_self.i % _self.listnum == 0) {
                    _self.n++;
                    $('.for-daily-detail').scrollTop(_self.listheight * _self.n);
                }
                $('#detail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        scrollUp:function() {
            var _self = this;
            if(_self.isCashierReport) {
                if (_self.i > 0) {
                    _self.i--;
                }
                if ((_self.i+1) % _self.listnum == 0 && _self.i > 0) {
                    _self.n--;

                    $('.for-cashier-detail').scrollTop(_self.listheight * _self.n );
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }else {
                if (_self.i > 0) {
                    _self.i--;
                }
                if ((_self.i+1) % _self.listnum == 0 && _self.i > 0) {
                    _self.n--;

                    $('.for-daily-detail').scrollTop(_self.listheight * _self.n );
                }
                $('#detail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        checkingDate:function() {
            var _self = this;
            var date = $('input[name = checking_date]').val();
            //console.log(date);
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
                        _self.printText = resp.printf;
                        _self.renderCashierreport();
                        _self.renderCashierdetail();
                        _self.renderCashierdaily();
                        _self.renderCashierdailyDetail();
                    }else {
                        toastr.error(resp.msg);
                    }
                });
            }
            $('input[name = checking_date]').val("");
        },

        onOKClicked: function () {
           this.checkingDate();
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

        onKeyUpClicked:function () {
            this.scrollUp();
        },
        onKeyDownClicked: function () {
            this.scrollDown();
        },
        onHelpClicked:function () {
            var tipsView = new KeyTipsView('CHECKING_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
        },
        onBackClicked:function () {
            router.navigate('main',{trigger:true});
        },
        onReportClicked:function () {
            this.isCashierReport = true;
            this.i = 0;
        },

        onDailyReportClicked:function () {
            this.isCashierReport = false;
            this.i = 0;
        },

        onPrintClicked: function () {
            if (this.printText == '') {
                toastr.warning('请先查询收银报表数据')
            } else {
                this.sendWebSocketDirective([DIRECTIVES.PRINTTEXT], [this.printText], wsClient);
            }
        }

    });

    return checkingView;
});