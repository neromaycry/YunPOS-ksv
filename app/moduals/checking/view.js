define([
    '../../../../js/common/BaseView',
    '../../../../moduals/checking/model',
    '../../../../moduals/checking/collection',
    '../../../../moduals/layer-help/view',
    'text!../../../../moduals/checking/cashierinfotpl.html',
    'text!../../../../moduals/checking/posdetailtpl.html',
    'text!../../../../moduals/checking/posinfotpl.html',
    'text!../../../../moduals/checking/cashierdetailtpl.html',
    'text!../../../../moduals/checking/tpl.html',
], function (BaseView, CheckingModel, CheckingCollection, LayerHelpView, cashierinfotpl, posdetailtpl, posinfotpl, casherdetailtpl, tpl) {

    var checkingView = BaseView.extend({

        id: "checkingView",

        el: '.views',

        template: tpl,

        template_cashierinfo: cashierinfotpl,

        template_cashierdetail: casherdetailtpl,

        template_posinfo: posinfotpl,

        template_posdetail: posdetailtpl,

        i: 0,

        isCashier: true,

        date: '',

        input: 'input[name = checking_date]',

        events: {
            'click .ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .back-to-main': 'onBackClicked',
            'click .help': 'onHelpClicked',
            'click .keyup': 'onKeyUpClicked',
            'click .keydown': 'onKeyDownClicked',
            'click #report': 'onReportClicked',
            'click #daily-report': 'onDailyReportClicked',
            'click .print': 'onPrintClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.CHECKING;
            this.model = new CheckingModel();
            this.collection = new CheckingCollection();
            this.printText = '';
        },

        initPlugins: function () {
            $('input[name = checking_date]').focus();
            var date = new Date().getTime();
            date = fecha.format(date, 'YYYYMMDD');
            $('input[name = checking_date]').val(date);
            console.log(date);
            this.initTemplates();
            this.renderCashierInfo();
            this.renderCashierdetail();
            this.renderPosInfo();
            this.renderPosDetail();
        },

        initTemplates: function () {
            this.template_cashierinfo = _.template(this.template_cashierinfo);
            this.template_posinfo = _.template(this.template_posinfo);
            this.template_cashierdetail = _.template(this.template_cashierdetail);
            this.template_posdetail = _.template(this.template_posdetail);
        },

        initLayoutHeight: function () {
            var dh = $(window).height();
            var nav = $('.navbar').height();
            var td = $('td').height();
            var cashierdetail = dh - 3 * nav - td * 8 - 100;
            $('.for-cashier-detail').height(cashierdetail);
            $('.for-pos-detail').height(cashierdetail);
            this.listheight = cashierdetail;
            this.listnum = 6;
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Esc, function () {
                router.navigate('main', {trigger: true});
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Right, function () {
                _self.isCashier = false;
                _self.i = 0;
                _self.n = 0;
                $('#myTabs a[href="#for-pos"]').tab('show')
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Left, function () {
                _self.isCashier = true;
                _self.i = 0;
                _self.n = 0;
                $('#myTabs a[href="#for-cashier"]').tab('show');
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

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.Up, function () {
                _self.scrollUp();
            });

            this.bindKeyEvents(window.PAGE_ID.CHECKING, window.KEYS.T, function () {
                _self.onHelpClicked();
            });
        },

        renderCashierInfo: function () {
            this.$el.find('.for-cashier-info').html(this.template_cashierinfo(this.model.toJSON()));
            return this;
        },

        renderCashierdetail: function () {
            this.$el.find('.for-cashier-detail').html(this.template_cashierdetail(this.collection.toJSON()));
            $('.li-detail').height(this.listheight / this.listnum - 21);
            $('#detail' + this.i).addClass('cus-selected');
            return this;
        },

        renderPosInfo: function () {
            this.$el.find('.for-pos-info').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        renderPosDetail: function () {
            this.$el.find('.for-pos-detail').html(this.template_posdetail(this.collection.toJSON()));
            $('#li' + this.i).addClass('cus-selected');
            $('.li-detail').height(this.listheight / this.listnum - 21);
            return this;
        },

        scrollDown: function () {
            var _self = this;
            if (_self.isCashier) {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                if (_self.i % _self.listnum == 0) {
                    _self.n++;
                    $('.for-cashier-detail').scrollTop(_self.listheight * _self.n);
                }
                $('#detail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            } else {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                if (_self.i % _self.listnum == 0) {
                    _self.n++;
                    $('.for-pos-detail').scrollTop(_self.listheight * _self.n);
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        scrollUp: function () {
            var _self = this;
            if (_self.isCashier) {
                if (_self.i > 0) {
                    _self.i--;
                }
                if ((_self.i + 1) % _self.listnum == 0 && _self.i > 0) {
                    _self.n--;

                    $('.for-cashier-detail').scrollTop(_self.listheight * _self.n);
                }
                $('#detail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');

            } else {
                if (_self.i > 0) {
                    _self.i--;
                }
                if ((_self.i + 1) % _self.listnum == 0 && _self.i > 0) {
                    _self.n--;
                    $('.for-pos-detail').scrollTop(_self.listheight * _self.n);
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        checkingDate: function () {
            date = $('input[name = checking_date]').val();
            var _self = this;
            //console.log(date);
            if (date == '') {
                toastr.warning('输入的收银对账日期不能为空');
            } else {
                var cashierdata = {};
                cashierdata['date'] = date;
                cashierdata['type'] = '01';
                this.cashierrequest = new CheckingModel();
                this.cashierrequest.report(cashierdata, function (resp) {
                    if (resp.status == '00') {
                        _self.model.set({
                            pos: resp.pos,
                            name: resp.cashier,
                            date: resp.date,
                            money: resp.sum_money,
                        });
                        _self.collection.set(resp.master_detail);
                        _self.printText = resp.printf;
                        _self.renderCashierInfo();
                        _self.renderCashierdetail();
                    } else {
                        toastr.error(resp.msg);
                    }
                });

                var posdata = {};
                posdata['date'] = date;
                posdata['type'] = '02';
                this.posrequest = new CheckingModel();
                this.posrequest.report(posdata, function (resp) {
                    if (resp.status == '00') {
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
                        _self.renderPosInfo();
                        _self.renderPosDetail();
                    } else {
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
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onKeyUpClicked: function () {
            this.scrollUp();
        },
        onKeyDownClicked: function () {
            this.scrollDown();
        },
        onHelpClicked: function () {
            var attrs = {
                page: 'CHECKING_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },
        onBackClicked: function () {
            router.navigate('main', {trigger: true});
        },
        onReportClicked: function () {
            this.isCashier = true;
            this.i = 0;
        },

        onDailyReportClicked: function () {
            this.isCashier = false;
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