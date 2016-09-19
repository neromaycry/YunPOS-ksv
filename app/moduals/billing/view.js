/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing/model',
    '../../../../moduals/billing/collection',
    '../../../../moduals/modal-billingtype/view',
    '../../../../moduals/modal-billingaccount/view',
    '../../../../moduals/modal-billingdiscount/view',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection,BilltypeView, BillaccountView, BilldiscountView, billinfotpl, billingdetailtpl, tpl) {

    var billingView = BaseView.extend({

        id: "billingView",

        el: '.views',

        template: tpl,

        totalamount:0,

        unpaidamount:0,

        oddchange:0,

        receivedsum:0,

        i:0,

        percentage:0,

        totaldiscount:0,//整单优惠的总价格

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
            Backbone.off('onBillDiscount');
            Backbone.on('onBillDiscount',this.onBillDiscount,this);
            Backbone.on('onReceivedsum',this.onReceivedsum,this);
        },

        onReceivedsum: function (data) {
            var receivedsum = data['receivedsum'];
            var gatherNo = data['gather_no'];
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            this.addToPaymentList(this.totalamount,gatherName,receivedsum,gatherNo,gatherId);
        },

        onBillDiscount: function (data) {
            this.percentage = data['percentage'] / 100;
            this.totaldiscount = (this.totalamount * ( 1- this.percentage)).toFixed(2);//优惠金额
            this.totalamount = (this.totalamount - this.totaldiscount).toFixed(2);//折扣后的支付金额
            this.unpaidamount = this.totalamount;
            this.model.set({
                totaldiscount:this.totaldiscount,
                totalamount:parseFloat(this.totalamount),
                unpaidamount:parseFloat(this.unpaidamount),
                percentage:percentage
            });
            this.renderBillInfo();
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
                }else if($('#input_billing').val() == '') {
                    toastr.warning('支付金额不能为空，请重新输入');
                }else if($('#input_billing').val() == 0){
                    toastr.warning('支付金额不能为零，请重新输入');
                }else{
                    _self.addToPaymentList(_self.totalamount,"现金",_self.receivedsum,"*","00");
                }
                $('#input_billing').val("");
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.D, function () {
                var item = _self.collection.at(_self.i);
                _self.collection.remove(item);
                console.log(_self.collection);
                var totalreceived = 0;
                var trlist = _self.collection.pluck('gather_money');
                for(var i = 0;i < trlist.length; i++) {
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

            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.B, function() {
                var confirmBill = new BillModel();
                if(_self.unpaidamount == 0){
                    _self.unpaidamount = _self.unpaidamount.toFixed(2);
                    if(_self.model.get('percentage') != 0){
                        _self.totalDiscount(_self.percentage);
                    }
                    var data = {};
                    data['mode'] = '00';
                    if (storage.isSet(system_config.VIP_KEY)) {
                        data['medium_id'] = storage.get(system_config.VIP_KEY,'medium_id');
                        data['medium_type'] = storage.get(system_config.VIP_KEY,'medium_type');
                        data['cust_id'] = storage.get(system_config.VIP_KEY,'cust_id');

                    } else {
                        data['medium_id'] = "*";
                        data['medium_type'] = "*";
                        data['cust_id'] = "*";
                    }
                    data['goods_detail'] = storage.get(system_config.SALE_PAGE_KEY,'shopcart');
                    data['gather_detail'] = _self.collection.toJSON();
                    console.log(data);
                    confirmBill.trade_confirm(data, function (resp) {
                        console.log(resp);
                        if (resp.status == '00') {
                            storage.remove(system_config.SALE_PAGE_KEY);
                            storage.remove(system_config.ONE_CARD_KEY);
                            if (storage.isSet(system_config.VIP_KEY)) {
                                storage.remove(system_config.VIP_KEY);
                            }
                            router.navigate("main", {trigger: true,replace:true});
                            //f7app.alert("订单号：" + resp.bill_no,'提示');
                            toastr.success("订单号：" + resp.bill_no);
                            var send_data = {};
                            send_data['directive'] = window.DIRECTIVES.PRINTTEXT;
                            send_data['content'] = resp.printf;
                            console.log(resp.printf);
                            //wsClient.send(JSON.stringify(send_data));
                        } else {
                           toastr.error(resp.msg);
                        }
                    });
                }else{
                    toastr.warning('还有未支付的金额，请支付完成后再进行结算');
                }
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Down, function () {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                $('#billdetail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Up, function() {
                if (_self.i > 0) {
                    _self.i--;
                }
                $('#billdetail' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
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
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.P, function() {
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
            //整单优惠
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Y, function () {
                if(_self.model.get('receivedsum') != 0){
                    toastr.warning('您已选择支付方式，不能再进行整单优惠');
                }else {
                    var billdiscountview = new BilldiscountView();
                    _self.showModal(window.PAGE_ID.BILL_DISCOUNT,billdiscountview);
                    $('.modal').on('shown.bs.modal', function (){
                        $('input[name = percentage]').focus();
                    });
                }
            });
            //取消整单优惠
            this.bindKeyEvents(window.PAGE_ID.BILLING,window.KEYS.Q, function () {
                if(_self.model.get('totaldiscount') == 0){
                    toastr.info('您未进行任何优惠');
                }else if(_self.model.get('receivedsum') != 0){
                    toastr.warning('您已选择支付方式，不能取消整单优惠');
                }else{
                    _self.totalamount = parseFloat(_self.model.get("totalamount")) + parseFloat(_self.model.get("totaldiscount"));
                    _self.unpaidamount = _self.totalamount;
                    _self.model.set({
                        totalamount:_self.totalamount,
                        unpaidamount:_self.unpaidamount,
                        totaldiscount:0
                    });
                    _self.renderBillInfo();
                    toastr.success('取消整单优惠成功');
                }
            });

            //一卡通支付快捷键
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.O, function () {

            });
        },

        /**
         * 计算整单优惠
         */
        totalDiscount:function(percentage){
            var _self = this;
            var finaldiscount = 0;
            _self.discountcollection = new BillCollection();
            this.localObj = storage.get(system_config.SALE_PAGE_KEY,'shopcart');
            storage.set(system_config.SALE_PAGE_KEY,'totaldiscountamount',_self.totaldiscount);
            //在SALE_PAGE_KEY里面新加入一个属性，值为总的整单优惠的价格
            console.log('整单优惠的总价格:' + _self.totaldiscount);
            for(var i = 0;i < this.localObj.length - 1;i++){
                var item = new BillModel();
                item.set(this.localObj[i]);
                var num = item.get('num');
                var money = item.get('money');
                var discount = parseFloat(item.get('discount'));
                var totaldiscount = (1 - percentage) * (money * num - discount);//前n-1项每个单品的单品折扣
                finaldiscount = finaldiscount + totaldiscount;
                discount = discount + totaldiscount;//前n-1项每个单品的单品优惠和整单优惠平平均之后的总和
                discount = discount.toFixed(2);
                console.log('第' + i + '的整单折扣' + discount);
                item.set({
                    discount:discount
                });
                console.log(item);
                _self.discountcollection.push(item);
            }
            console.log(_self.discountcollection);
            console.log('>>>>>>>>>>>>>>>>>>>>');
            //最后一项的折扣为
            finaldiscount = this.totaldiscount - finaldiscount;
            finaldiscount = finaldiscount.toFixed(2);
            console.log(finaldiscount + '最后一项的优惠');
            var tmp = new BillModel();
            tmp.set(this.localObj[this.localObj.length - 1]);
            tmp.set('discount',finaldiscount);
            _self.discountcollection.push(tmp);
            storage.set(system_config.SALE_PAGE_KEY,'shopcart',_self.discountcollection);
            //console.log(_self.discountcollection);
            //console.log('final');
        }

    });


    return billingView;
});