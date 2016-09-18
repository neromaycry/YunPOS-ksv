/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing-return/model',
    '../../../../moduals/billing-return/collection',
    '../../../../moduals/modal-returnbillingtype/view',
    'text!../../../../moduals/billing-return/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/billing-return/tpl.html'
], function (BaseView, BillRtModel, BillRtCollection, BilltypeView, billinfotpl, billingdetailtpl, tpl) {

    var billingRtView = BaseView.extend({

        id: "billingRtView",

        el: '.views',

        template: tpl,

        template_billinfo:billinfotpl,

        template_billingdetailtpl:billingdetailtpl,

        typeList:null,

        totalamount:0,

        discoutamount:0,

        receivedsum:0,

        unpaidamount:0,

        i:0,

        events: {

        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING_RETURN;
            this.model = new BillRtModel();
            this.collection = new BillRtCollection();
            this.typeList = new BillRtCollection();
            if(isfromForce){
                //强制退货
                this.totalamount = storage.get(system_config.FORCE_RETURN_KEY,'panel','totalamount');
                this.discoutamount = storage.get(system_config.FORCE_RETURN_KEY,'panel','discountamount');
                this.totalamount = this.totalamount - this.discoutamount;
                this.unpaidamount = this.totalamount;
                this.model.set({
                    totalamount:this.totalamount,
                    unpaidamount:this.unpaidamount
                });
            }else{
                this.totalamount = storage.get(system_config.RETURN_KEY,'panel','totalamount');
                this.unpaidamount = this.totalamount;
                console.log(this.totalamount);
                this.model.set({
                    totalamount:this.totalamount,
                    unpaidamount:this.unpaidamount
                });
            }
            this.initTemplates();
        },

        initPlugins: function () {
            this.renderBillInfo();
            this.handleEvents();
            this.initLayoutHeight();
            $('input[name = billingrt]').focus();
        },

        handleEvents: function () {
            Backbone.off('onReceivedsum');
            Backbone.on('onReceivedsum',this.onReceivedsum,this);
        },

        onReceivedsum: function (data) {
            console.log(data);
            var receivedsum = data['receivedsum'];
            var gatherNo = data['gather_no'];
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            this.addToPaymentList(this.totalamount,gatherName,receivedsum,gatherNo,gatherId);
        },

        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
            this.template_billingdetailtpl = _.template(this.template_billingdetailtpl);
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


        renderBillInfo: function () {
            this.$el.find('.for-billinfo').html(this.template_billinfo(this.model.toJSON()));
            return this;
        },

        renderBillDetail: function () {
            this.$el.find('.for-billdetail').html(this.template_billingdetailtpl(this.collection.toJSON()));
            return this;
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
            var _self = this;
            var model = new BillRtModel();
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
            if(totalreceived >= totalamount){
                this.unpaidamount = 0;
            }else {
                this.unpaidamount = totalamount - totalreceived;
            }
            this.model.set({
                receivedsum: totalreceived,
                unpaidamount: _self.unpaidamount
            });
            this.renderBillInfo();
            this.renderBillDetail();
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

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Enter, function () {
                _self.receivedsum = $('#input_billingrt').val();
                if(_self.model.get('unpaidamount') == 0) {
                    toastr.warning('待支付金额为零，请进行结算');
                }else if($('#input_billingrt').val() == '') {
                    toastr.warning('支付金额不能为空，请重新输入');
                }else if($('#input_billingrt').val() == 0){
                    toastr.warning('支付金额不能为零，请重新输入');
                }else{
                    _self.addToPaymentList(_self.totalamount,"现金",_self.receivedsum,"*","00");
                }
                $('#input_billingrt').val("");
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.D, function () {
                var item = _self.collection.at(_self.i);
                console.log(item);
                console.log(_self.collection);
                _self.collection.remove(item);
                console.log(_self.collection);
                var totalreceived = 0;
                var trlist = _self.collection.pluck('gather_money');
                for(var i = 0;i<trlist.length;i++) {
                    totalreceived += trlist[i];
                }
                if(totalreceived >= _self.totalamount) {
                    _self.unpaidamount = 0;
                    _self.oddchange = totalreceived - _self.totalamount;
                }else{
                    _self.oddchange = 0;
                    _self.unpaidamount = _self.totalamount - totalreceived;
                }
                _self.model.set({
                    receivedsum: totalreceived,
                    unpaidamount: _self.unpaidamount,
                    oddchange:_self.oddchange
                });
                _self.renderBillInfo();
                _self.renderBillDetail();
                toastr.success('删除成功');
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.B, function() {
                var confirmBill = new BillRtModel();
                _self.unpaidamount = _self.unpaidamount.toFixed(2);
                if(_self.unpaidamount == 0){
                    if(isfromForce) {
                        var data = {};
                        data['mode'] = '02';
                        if (storage.isSet(system_config.VIP_KEY)) {
                            data['medium_id'] = storage.get(system_config.VIP_KEY,'medium_id');
                            data['medium_type'] = storage.get(system_config.VIP_KEY,'medium_type');
                            data['cust_id'] = storage.get(system_config.VIP_KEY,'cust_id');

                        } else {
                            data['medium_id'] = "*";
                            data['medium_type'] = "*";
                            data['cust_id'] = "*";
                        }
                        data['goods_detail'] = storage.get(system_config.FORCE_RETURN_KEY,'cartlist');
                        data['gather_detail'] = _self.collection.toJSON();
                        for(var i = 0;i<data['gather_detail'].length;i++) {
                            data['gather_detail'][i].gather_money = - data['gather_detail'][i].gather_money;
                            console.log(data['gather_detail'][i]);
                        }
                        confirmBill.trade_confirm(data, function (resp) {
                            console.log(resp);
                            if (resp.status == '00') {
                                console.log(resp.bill_no);
                                storage.remove(system_config.FORCE_RETURN_KEY);
                                if (storage.isSet(system_config.VIP_KEY)) {
                                    storage.remove(system_config.VIP_KEY);
                                }
                                router.navigate("main", {trigger: true,replace:true});
                                toastr.success("订单号：" + resp.bill_no);
                            } else {
                                toastr.error(resp.msg);
                            }
                        });

                    }else {
                        var data = {};
                        data['mode'] = '02';
                        if (storage.isSet(system_config.VIP_KEY)) {
                            data['medium_id'] = storage.get(system_config.VIP_KEY,'medium_id');
                            data['medium_type'] = storage.get(system_config.VIP_KEY,'medium_type');
                            data['cust_id'] = storage.get(system_config.VIP_KEY,'cust_id');
                        } else {
                            data['medium_id'] = "*";
                            data['medium_type'] = "*";
                            data['cust_id'] = "*";
                        }
                        data['goods_detail'] = storage.get(system_config.RETURN_KEY,'cartlist');
                        data['gather_detail'] = _self.collection.toJSON();
                        for(var i = 0;i<data['gather_detail'].length;i++) {
                            data['gather_detail'][i].gather_money = - data['gather_detail'][i].gather_money;
                            console.log(data['gather_detail'][i]);
                        }
                        confirmBill.trade_confirm(data, function (resp) {
                            console.log(resp);
                            if (resp.status == '00') {
                                console.log(resp.bill_no);
                                storage.remove(system_config.RETURN_KEY);
                                if (storage.isSet(system_config.VIP_KEY)) {
                                    storage.remove(system_config.VIP_KEY);
                                }
                                router.navigate("main", {trigger: true,replace:true});
                                //f7app.alert('订单号：' + resp.bill_no,'提示');
                                toastr.success('订单号：' + resp.bill_no)
                            } else {
                                toastr.error(resp.msg);
                            }
                        });
                    }
                }else{
                    toastr.warning('还有未支付的金额，请支付完成后再进行结算');
                }
            });


            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Down, function () {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                $('#billdetail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Up, function() {
                if (_self.i > 0) {
                    _self.i--;
                }
                $('#billdetail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.S, function () {
                var unpaidamount = _self.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.warning('待支付金额为零,请进行结算');
                }else {
                    this.billtype = new BilltypeView('00');
                    _self.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,_self.billtype);
                    var attrData = {};
                    attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                    Backbone.trigger('onunpaidamount',attrData);
                    $('.modal').on('shown.bs.modal',function(e) {
                        $('input[name = receivedsum]').focus();
                        //$('#li' + _self.i).addClass('cus-selected');
                    });
                }
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.T, function() {
                var unpaidamount = _self.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.warning('待支付金额为零,请进行结算');
                }else {
                    this.billtype = new BilltypeView('01');
                    _self.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,_self.billtype);
                    var attrData = {};
                    attrData['unpaidamount'] = _self.model.get('unpaidamount');//本次应收的金额
                    Backbone.trigger('onunpaidamount',attrData);
                    $('.modal').on('shown.bs.modal',function(e) {
                        $('input[name = receivedsum]').focus();
                        //$('#li' + _self.i).addClass('cus-selected');
                    });
                }
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.P, function() {
                var unpaidamount = _self.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.warning('待支付金额为零,请进行结算');
                }else {
                    this.billtype = new BilltypeView('02');
                    _self.showModal(window.PAGE_ID.RETURN_BILLING_TYPE,_self.billtype);
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

    return billingRtView;
});