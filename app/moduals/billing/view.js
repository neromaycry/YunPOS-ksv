/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing/model',
    '../../../../moduals/billing/collection',
    '../../../../moduals/modal-billtype/view',
    '../../../../moduals/modal-billingdiscount/view',
    '../../../../moduals/keytips-member/view',
    '../../../../moduals/modal-confirm/view',
    '../../../../moduals/modal-ecardlogin/view',
    '../../../../moduals/modal-changing/view',
    '../../../../moduals/modal-quickpay/view',
    '../../../../moduals/modal-qpalipay/view',
    '../../../../moduals/modal-qpwechat/view',
    '../../../../moduals/modal-gatherui/view',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/billing/clientbillingtpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection,BilltypeView, BilldiscountView, KeyTipsView,ConfirmView, OneCardView,ChangingView, QuickPayView,QPAliPayView,QPWeChatView,GatherUIView,billinfotpl, billingdetailtpl, numpadtpl, clientbillingtpl, tpl) {
    var billingView = BaseView.extend({

        id: "billingView",

        el: '.views',

        template: tpl,

        totalamount:0,

        unpaidamount:0,

        oddchange:0,//保存此订单的找零钱数

        receivedsum:0,

        i:0,

        percentage:0,

        totalreceived:0,//实收金额

        totaldiscount:0,//整单优惠的总价格

        visibleTypes:{},

        card_id:'',//一卡通界面传过来的card_id

        length:0,//判断第三方支付退款是否成功

        template_billinfo:billinfotpl,

        template_billingdetailtpl:billingdetailtpl,

        template_numpad:numpadtpl,

        template_clientbillingtpl: clientbillingtpl,

        input:'input[name = billing]',

        billNumber: '',

        events: {
            'click .numpad-ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .billing-help':'onBillHelpClicked',
            'click .billing-return':'onReturnMainClicked',
            'click .billing-delete':'onBillDelete',
            'click .totaldiscount':'onTotalDiscountClicked',
            'click .cancel-totaldiscount':'onCancelTotalDiscount',
            'click .billing-keyup':'onKeyUp',
            'click .billing-keydown':'onKeyDown',
            'click .billing':'onBillingClicked',
            'click .billing-clean':'onBillingCleanClicked',
            'click [data-index]': 'onPayClick',
            'click .quick-pay':'onQuickPayClicked',//快捷支付
            'click .check':'onCheckClicked',//支票类付款
            'click .gift-certificate':'onGiftClicked',//礼券类
            'click .pos':'onPosClicked',//银行pos
            'click .ecard':'onEcardClicked',
            'click .third-pay':'onThirdPayClicked'
            //'click .btn-floatpad':'onFloatPadClicked',
        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING;
            this.model = new BillModel();
            this.collection = new BillCollection();
            this.totalamount = storage.get(system_config.SALE_PAGE_KEY,'shopinfo','totalamount');
            this.discountamount = storage.get(system_config.SALE_PAGE_KEY,'shopinfo','discountamount');
            this.itemamount = storage.get(system_config.SALE_PAGE_KEY,'shopinfo','itemamount');
            //this.orderNo = storage.get(system_config.ORDER_NO_KEY);  //获取后台生成的订单号
            this.totalamount -= this.discountamount;//优惠金额
            this.unpaidamount = this.totalamount;//应收金额
            this.model.set({
                totalamount:this.totalamount,
                receivedsum:this.receivedsum,//实付金额
                unpaidamount:this.unpaidamount,//未付金额
                oddchange:this.oddchange,
                discountamount:this.discountamount//单品优惠的总金额
            });
            this.getRetailNo();
            this.initTemplates();
            this.handleEvents();
        },

        initPlugins: function () {
            this.renderBillInfo();
            this.renderClientDisplay(this.model, isPacked);
            $('input[name = billing]').focus();
            $('button[name = cancel-totaldiscount]').css('display','none');
            $('.for-billdetail').perfectScrollbar();
            this.$el.find('.for-numpad').html(this.template_numpad);
            this.initLayoutHeight();
        },

        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(window).height();
            var dw = $(window).width();
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var panelfooter = $('.panel-footer').height();
            //var recvbl = $('.recvbl-panel').height() + 21;  //左侧应收金额单独显示区域的高度
            var recvbl = 0;
            var billdetail = dh - nav * 2 - panelheading * 2 - panelfooter - recvbl;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            //$('.recvbl-panel').width(cartWidth);  // 设置左侧应收金额单独显示区域的宽度
            $('.for-billdetail').height(billdetail);
            this.listheight = $('.for-billdetail').height();
            this.listnum = 10; //设置商品列表中的条目数
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
            //this.itemheight = $('li').height() + 20;
            //this.listnum = parseInt(this.listheight / this.itemheight);//商品列表中的条目数
        },
        handleEvents: function () {
            Backbone.off('onReceivedsum');
            Backbone.off('onBillDiscount');
            Backbone.on('onBillDiscount', this.onBillDiscount,this);
            Backbone.on('onReceivedsum', this.onReceivedsum,this);
        },
        onReceivedsum: function (data) {
            var receivedsum = data['receivedsum'];
            var gatherNo = data['gather_no'];//付款账号
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            var gatherKind = data['gather_kind'];
            this.card_id = data['card_id'];
            var orderNo = data['orderNo'];
            this.addToPaymentList(this.totalamount, gatherName, receivedsum, gatherNo, gatherId, gatherKind, this.card_id,orderNo);
        },
        onBillDiscount: function (data) {
            this.percentage = data['percentage'] / 100;
            this.totaldiscount = (this.totalamount * ( 1- this.percentage)).toFixed(2);//优惠金额
            this.totalamount = (this.totalamount - this.totaldiscount).toFixed(2);//折扣后的支付金额
            this.unpaidamount = this.totalamount;
            this.model.set({
                totaldiscount:parseFloat(this.totaldiscount) ,//整单优惠的金额
                totalamount:parseFloat(this.totalamount),
                unpaidamount:parseFloat(this.unpaidamount),
                percentage:percentage
            });
            this.renderBillInfo();
        },

        /**
         *向已付款列表中插入新的行
         * @param totalamount 总金额
         * @param gatherName 付款方式名称
         * @param receivedsum 付款金额
         * @param gatherAccount 付款账号
         * @param gatherId 付款方式Id
         * @param gatherKind 付款方式类别
         * @param cardId 一卡通付款卡号
         * @param orderNo 订单编号
         */
        addToPaymentList: function (totalamount, gatherName, receivedsum, gatherAccount, gatherId, gatherKind, cardId,orderNo) {
            var temp = this.collection.findWhere({gather_id: gatherId , gather_no:gatherAccount});
            console.log(temp);
            if(temp != undefined){
                for(var i = 0;i < this.collection.length;i++){
                    var model = this.collection.at(i);
                    if(model.get('gather_id') == gatherId && model.get('gather_no') == gatherAccount){
                        var gather_money = model.get('gather_money');
                        gather_money = parseFloat(gather_money) + parseFloat(receivedsum);
                        model.set({
                            fact_money:0,
                            gather_id:gatherId,
                            gather_name:gatherName,
                            gather_money:parseFloat(gather_money),
                            gather_no:gatherAccount,
                            gather_kind:gatherKind,
                            card_id:cardId,
                            payment_bill: orderNo,//第三方支付方式订单号
                            havepay_money: parseFloat(receivedsum),//实收金额
                            change_money: parseFloat(receivedsum) - unpaidamount
                        });
                    }
                    this.collection.add(model);
                }
            }else {
                var unpaidamount = this.model.get('unpaidamount');
                var model = new BillModel();
                var oddchange = 0;
                if (parseFloat(receivedsum) > unpaidamount) {
                    //如果支付金额大于未支付金额，则支付列表中显示的支付金额为  receivedsum = unpaidamount
                    model.set({
                        fact_money: 0,
                        gather_id: gatherId,
                        gather_name: gatherName,
                        gather_money: unpaidamount,
                        gather_no: gatherAccount,
                        gather_kind: gatherKind,
                        card_id: cardId,
                        payment_bill: orderNo,//第三方支付方式订单号
                        havepay_money: parseFloat(receivedsum),//实收金额
                        change_money: parseFloat(receivedsum) - unpaidamount
                    });
                } else {
                    model.set({
                        fact_money: 0,
                        gather_id: gatherId,
                        gather_name: gatherName,
                        gather_money: parseFloat(receivedsum),
                        gather_no: gatherAccount,
                        gather_kind: gatherKind,
                        card_id: cardId,
                        payment_bill: orderNo,
                        havepay_money: parseFloat(receivedsum),
                        change_money: 0
                    });
                }
            }

            this.collection.add(model);
            //}
            this.totalreceived = this.totalreceived + parseFloat(receivedsum);
            //var trList = this.collection.pluck('gather_money');
            //for(var i = 0;i<trList.length;i++){
            //    totalreceived += trList[i];
            //}
            if(this.totalreceived >= totalamount){
                this.unpaidamount = 0;
                oddchange = this.totalreceived - parseFloat(totalamount);
                this.oddchange = oddchange;
            }else{
                oddchange = 0;
                this.unpaidamount = parseFloat((parseFloat(totalamount) - this.totalreceived).toFixed(2));
            }
            this.model.set({
                receivedsum: this.totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange:oddchange
            });
            this.renderBillInfo();
            this.renderBillDetail();
        },
        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
            this.template_billingdetailtpl = _.template(this.template_billingdetailtpl);
            this.template_clientbillingtpl = _.template(this.template_clientbillingtpl);
        },
        renderBillInfo: function () {
            this.$el.find('.for-billinfo').html(this.template_billinfo(this.model.toJSON()));
            return this;
        },
        renderBillDetail: function () {
            this.$el.find('.for-billdetail').html(this.template_billingdetailtpl(this.collection.toJSON()));
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
            $('#billdetail' + this.i).addClass('cus-selected');
            return this;
        },
        renderClientDisplay: function (model, isPacked) {
            if (isPacked) {
                console.log(model);
                $(clientDom).find('.client-display').html(this.template_clientbillingtpl(model.toJSON()));
                return this;
            }
        },
        bindKeys: function () {
            var _self = this;
            //返回上一层
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Esc, function () {
                if(_self.collection.length != 0) {
                    toastr.warning('请先清空支付列表');
                }else {
                    router.navigate('main',{trigger:true});
                }
            });
            //确定
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Enter, function () {
                _self.confirm();
            });
            //删除
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.D, function () {
                _self.judgeEcardExistance(_self.i);
            });
            //结算
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.B, function() {
                _self.billing();
            });
            //方向下
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Down, function () {
               _self.scrollDown();
            });
            //方向上
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Up, function() {
               _self.scrollUp();
            });
            //支票类
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.S, function() {
               _self.payment('01');
            });
            //礼券类
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.A, function() {
                _self.payment('02');
            });
            //银行POS
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.P, function() {
                _self.payment('03');
            });
            //第三方支付
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Q, function () {
               _self.payment('05');
            });
            //整单优惠
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Y, function () {
                _self.billTotalDiscount();
            });
            //取消整单优惠
            this.bindKeyEvents(window.PAGE_ID.BILLING,window.KEYS.E, function () {
               _self.cancelTotalDiscount();
            });
            //帮助
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.T, function () {
               _self.openHelp();
            });
            //一卡通支付快捷键
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.O, function () {
                _self.payByECard();
            });
            //清空支付方式列表
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.C, function () {
                _self.cleanPaylist();
            });
            //快捷支付
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.F, function () {
                _self.QuickPay();
            });

        },

        /**
         * 确认事件
         */
        confirm:function() {
            var receivedsum = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0) {
                toastr.info('待支付金额为零，请进行结算');
            }else if(receivedsum == '') {
                toastr.info('支付金额不能为空');
            }else if(receivedsum == '.'){
                toastr.info('请输入有效金额');
            } else if(receivedsum == 0){
                toastr.info('支付金额不能为零');
            }else if(receivedsum > (unpaidamount + 100)) {
                toastr.info('找零金额超限');
            }else if((receivedsum.split('.').length-1) > 1) {
                toastr.info('请输入有效金额');
            }else if(receivedsum){
                this.i = 0;
                this.addToPaymentList(this.totalamount,"现金",receivedsum,"*","00","00",this.card_id,"");
                this.renderClientDisplay(this.model, isPacked);
            }
            $('#input_billing').val("");
        },

        /**
         * 帮助
         */
        openHelp:function () {
            var tipsView = new KeyTipsView('BILLING_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
        },
        /**
         * 判断删除的已支付方式里面是否含有一卡通支付。判断删除的支付方式里面是否含有微信支付宝支付
         */
        judgeEcardExistance: function (index) {
            var receivedSum = this.model.get('receivedsum');
            if(receivedSum == 0){
                toastr.info('您尚未付款');
            }else{
                var item = this.collection.at(index);
                var gatherKind = item.get('gather_kind');
                var gatherId = item.get('gather_id');
                if(gatherKind == '06'){
                    var gatherid = item.get('gather_id');
                    var cardId = item.get('card_id');
                    //取出对应的ONE_CARD_KEY的值
                    var ecardcollection = storage.get(system_config.ONE_CARD_KEY, cardId, 'detail');
                    console.log(ecardcollection);
                    this.tempcollection = new BillCollection();
                    for(var i in ecardcollection) {
                        if(ecardcollection[i].gather_id == gatherid){
                            var temp = ecardcollection[i];
                            var gather_money = parseFloat(temp.gather_money);
                            gather_money = gather_money + item.get('gather_money');
                            gather_money = gather_money.toFixed(2);
                            temp['gather_money'] = gather_money;
                            this.tempcollection.push(temp);
                        } else {
                            this.tempcollection.push(ecardcollection[i]);
                        }
                    }
                    storage.remove(system_config.ONE_CARD_KEY);
                    storage.set(system_config.ONE_CARD_KEY, cardId, 'detail', this.tempcollection);
                    this.deleteItem(this.i);
                    toastr.success('删除成功');
                }else if(gatherId == '12' || gatherId == '13'){
                    this.refund(gatherId , item.get('orderNo'));
                    //this.deleteItem();
                }else {
                    this.deleteItem(this.i);
                    toastr.success('删除成功');
                }
                var isExist = this.collection.findWhere({gather_kind: "06"});
                if(isExist == undefined){
                    if(storage.isSet(system_config.ONE_CARD_KEY)){
                        storage.remove(system_config.ONE_CARD_KEY);
                    }
                }
            }

        },

        deleteItem:function(index){
            var item = this.collection.at(index);
            var oddchange = 0;
            var gatherMoney = item.get('gather_money');
            this.totalreceived = this.totalreceived - gatherMoney;
            if(this.totalreceived == this.oddchange) {
                this.totalreceived = 0;
            }
            this.collection.remove(item);
            if(this.totalreceived >= this.totalamount) {
                this.unpaidamount = 0;
                oddchange = this.totalreceived - this.totalamount;
            }else{
                oddchange = 0;
                this.unpaidamount = this.totalamount - this.totalreceived;
            }
            this.model.set({
                receivedsum: this.totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange:oddchange
            });
            this.i = 0;
            this.renderBillInfo();
            this.renderBillDetail();
        },

        /**
         * 整单优惠
         */
        billTotalDiscount:function (){
            var receivedsum = this.model.get('receivedsum');
            if(this.totaldiscount != 0) {//先判断整单优惠金额
                toastr.info('不能重复整单优惠');
            }else if(receivedsum != 0) {//判断是否已经付款
                toastr.info('您已选择支付方式，不能再进行整单优惠');
            } else {
                var billdiscountview = new BilldiscountView();
                this.showModal(window.PAGE_ID.BILL_DISCOUNT,billdiscountview);
                $('.modal').on('shown.bs.modal', function (){
                    $('input[name = percentage]').focus();
                });
            }
        },
        /**
         * 取消整单优惠
         */
        cancelTotalDiscount: function () {
            var receivedsum = this.model.get('receivedsum');
            if(this.totaldiscount == 0){
                toastr.info('您未进行任何优惠')
            }else if(receivedsum != 0){
                toastr.info('您已选择支付方式，不能取消整单优惠');
            }else{
                this.totalamount = parseFloat(this.model.get("totalamount")) + parseFloat(this.totaldiscount);
                this.unpaidamount = this.totalamount;
                this.totaldiscount = 0;
                this.model.set({
                    totalamount:this.totalamount,
                    unpaidamount:this.unpaidamount,
                    totaldiscount:this.totaldiscount
                });
                this.renderBillInfo();
                $('button[name = totaldiscount]').css('display','block');
                $('button[name = cancel-totaldiscount]').css('display','none');
                toastr.success('取消整单优惠成功');
            }
        },
        /**
         * 光标向下
         */
        scrollDown: function () {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.collection.length / this.listnum)) {
                this.n++;
                $('.for-billdetail').scrollTop(this.listheight * this.n);
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        /**
         * 光标向上
         */
        scrollUp: function () {
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i+1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                $('.for-billdetail').scrollTop(this.listheight * this.n);
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 结算
         */
        billing: function () {
            var _self = this;
            var confirmBill = new BillModel();
            this.unpaidamount = parseFloat(this.unpaidamount.toFixed(2));
            if(this.unpaidamount != 0){
                toastr.info('还有未支付的金额，请支付完成后再进行结算');
            } else {
                //var changingView = new ChangingView({
                //    pageid:window.PAGE_ID.BILLING, //当前打开confirm模态框的页面id
                //    is_navigate:true,
                //    navigate_page: window.PAGE_ID.MAIN,
                //    callback: function () { //
                var confirmView = new ConfirmView({
                    pageid: window.PAGE_ID.BILLING, //当前打开confirm模态框的页面id
                    callback: function () { //点击确认键的回调
                        //console.log(typeof (_self.unpaidamount));
                        if(_self.percentage != 0){
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
                        data['bill_no'] = _self.billNumber;
                        data['goods_detail'] = storage.get(system_config.SALE_PAGE_KEY,'shopcart');
                        data['gather_detail'] = _self.collection.toJSON();
                        console.log(data['gather_detail']);
                        confirmBill.trade_confirm(data, function (resp) {
                            if (resp.status == '00') {
                                storage.remove(system_config.SALE_PAGE_KEY);
                                storage.remove(system_config.ONE_CARD_KEY);
                                if (storage.isSet(system_config.VIP_KEY)) {
                                    storage.remove(system_config.VIP_KEY);
                                }
                                router.navigate("main", {trigger: true,replace:true});
                                toastr.success("订单号：" +  resp.bill_no);
                                storage.set(system_config.ODD_CHANGE,'oddchange',_self.model.get('oddchange'));
                                console.log(resp.prnt);
                                wsClient.send(DIRECTIVES.PRINTTEXT + resp.printf);
                                wsClient.send(DIRECTIVES.OpenCashDrawer);
                                _self.renderClientDisplay(_self.model);
                                router.navigate("main", {trigger: true,replace:true});
                            } else {
                                toastr.error(resp.msg);
                            }
                        });
                    },
                    content:'确定结算此单？' //confirm模态框的提示内容
                });
                _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
                    //},
                    //content: _self.model.get('oddchange')
                //});
                //_self.showModal(window.PAGE_ID.CONFIRM, changingView);
            }
        },
        /**
         * 清空已支付方式列表
         */
        cleanPaylist: function () {
            var _self = this;
            var confirmView = new ConfirmView({
                pageid: window.PAGE_ID.BILLING, //当前打开confirm模态框的页面id
                callback: function () { //点击确认键的回调
                    var data = {};
                    for(var j = _self.collection.length - 1; j >= 0 ; j--) {
                        var model = _self.collection.at(j);
                        var gatherId = model.get('gather_id');
                        if(gatherId == '12') {
                            data['orderid'] = model.get('orderNo');
                            data['merid'] = '000201504171126553';
                            data['paymethod'] = 'wx';
                            data['refundamount'] = '0.01';
                            resource.post('http://114.55.62.102:9090/api/pay/xfb/refund',data, function (resp) {
                                if(resp.data['flag'] == '00') {
                                    _self.deleteItem(j);
                                }else if(resp.data['flag'] == undefined){
                                    toastr.error('微信退款失败,清空支付列表失败');
                                }else{
                                    toastr.error(resp.data['msg']);
                                }
                            });
                        }else if(gatherId == '13') {
                            data['orderid'] = model.get('orderNo');
                            data['merid'] = '000201504171126553';
                            data['paymethod'] = 'zfb';
                            data['refundamount'] = '0.01';
                            data['zfbtwo'] = 'zfbtwo';
                            resource.post('http://114.55.62.102:9090/api/pay/xfb/refund',data, function (resp) {
                                if(resp.data['flag'] == '00') {
                                    _self.deleteItem(j);
                                }else if(resp.data['flag'] == undefined){
                                    toastr.error('支付宝退款失败,清空支付列表失败');
                                }else{
                                    toastr.error(resp.data['msg']);
                                }
                            });
                        }else {
                            _self.deleteItem(j);
                        }
                    }
                },
                content:'确认清空支付列表？' //confirm模态框的提示内容
            });
            _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
            //this.receivedsum = 0;
            //this.oddchange = 0;
            //this.model.set({
            //    receivedsum:this.receivedsum,
            //    oddchange:this.oddchange,
            //    unpaidamount:this.totalamount
            //});
            //this.collection.reset();
            //storage.remove(system_config.ONE_CARD_KEY);
            //this.renderBillDetail();
            //this.renderBillInfo();
            //toastr.success('清空支付方式列表成功');
        },

        /**
         * 删除时调用第三方支付退款接口
         */
        refund: function (gatherId, orderNo) {
            var _self = this;
            var data = {};
            if(gatherId == '12') {
                data['orderid'] = orderNo;
                data['merid'] = '000201504171126553';
                data['paymethod'] = 'wx';
                data['refundamount'] = '0.01';
            }else if(gatherId == '13'){
                data['orderid'] = orderNo;
                data['merid'] = '000201504171126553';
                data['paymethod'] = 'zfb';
                data['refundamount'] = '0.01';
                data['zfbtwo'] = 'zfbtwo';
            }
            resource.post('http://114.55.62.102:9090/api/pay/xfb/refund',data, function (resp) {
                console.log(resp.data['flag']);
                if(resp.data['flag'] == '00') {
                    _self.deleteItem(_self.i);
                    toastr.success('删除成功');
                }else if(resp.data['flag'] == undefined){
                    toastr.error('删除失败');
                }else{
                    toastr.error(resp.data['msg']);
                }
            });
        },


        /**
         * 整单优惠平均到每个商品
         */
        totalDiscount:function(percentage){
            var _self = this;
            var finaldiscount = 0;//最后一项的优惠
            _self.discountcollection = new BillCollection();
            this.localObj = storage.get(system_config.SALE_PAGE_KEY,'shopcart');
            storage.set(system_config.SALE_PAGE_KEY,'totaldiscountamount', _self.totaldiscount);
            //在SALE_PAGE_KEY里面新加入一个属性，值为总的整单优惠的价格
            console.log('整单优惠的总价格:' + _self.totaldiscount);
            for(var i = 0;i < this.localObj.length - 1;i++){
                var item = new BillModel();
                item.set(this.localObj[i]);
                var num = item.get('num');
                var money = item.get('money');
                var discount = parseFloat(item.get('discount'));
                var tdiscount = (1 - percentage) * (money * num - discount);//前n-1项每个单品的单品折扣
                discount = discount + tdiscount;//前n-1项每个单品的单品优惠和整单优惠平平均之后的总和
                finaldiscount = finaldiscount + discount;//前n-1项总的折扣
                discount = discount.toFixed(2);
                console.log('第' + i + '的整单折扣' + discount);
                item.set({
                    discount:discount
                });
                console.log(item);
                _self.discountcollection.push(item);
            }
            //console.log(_self.discountcollection);
            //console.log('>>>>>>>>>>>>>>>>>>>>');
            //console.log(_self.totaldiscount + '整单折扣');
            //console.log(_self.discountamount + '单品优惠之和');
            //console.log(typeof (_self.totaldiscount));
            //console.log(typeof (_self.discountamount));
            //最后一项的折扣为
            finaldiscount = parseFloat(_self.totaldiscount) + _self.discountamount - finaldiscount;
            finaldiscount = finaldiscount.toFixed(2);
            //console.log(finaldiscount + '最后一项的优惠');
            var tmp = new BillModel();
            tmp.set(this.localObj[this.localObj.length - 1]);
            tmp.set('discount',finaldiscount);
            _self.discountcollection.push(tmp);
            storage.set(system_config.SALE_PAGE_KEY, 'shopcart', _self.discountcollection);
            //console.log(_self.discountcollection);
            //console.log('final');
        },

        /**
         * 一卡通支付
         */
        payByECard: function () {
            var unpaidamount = this.model.get('unpaidamount');
            var receivedSum = $(this.input).val();
            if(unpaidamount == 0){
                toastr.info('待支付金额为零，请进行结算');
            }else if(receivedSum == ''){
                toastr.info('支付金额不能为空');
            }else if(receivedSum == 0){
                toastr.info('支付金额不能为零');
            }else if(receivedSum == '.'){
                toastr.info('无效的支付金额');
            }else if(receivedSum > unpaidamount){
                toastr.info('支付金额不能大于待支付金额');
            }else{
                var data = {};
                data['unpaidamount'] = unpaidamount;
                data['receivedsum'] = receivedSum;
                this.onecard = new OneCardView(data);
                this.showModal(window.PAGE_ID.ONECARD_LOGIN,this.onecard);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = medium_id]').focus();
                });
            }
            $('input[name = billing]').val('');
        },
        /**
         * 帮助按钮点击事件
         */
        onBillHelpClicked: function () {
            this.openHelp();
        },
        /**
         * 返回销售首页
         */
        onReturnMainClicked: function () {
            if(this.collection.length != 0) {
                toastr.warning('请先清空支付列表');
            }else {
                router.navigate('main',{trigger:true});
            }
        },
        /**
         * 删除按钮点击事件
         */
        onBillDelete: function () {
            this.judgeEcardExistance(this.i);
        },
        /**
         * 整单优惠点击事件
         */
        onTotalDiscountClicked:function() {
            this.billTotalDiscount();
        },
        /**
         *取消整单优惠点击事件
         */
        onCancelTotalDiscount: function () {
            this.cancelTotalDiscount();
        },
        /**
         * 向上按钮点击事件
         */
        onKeyUp: function () {
            this.scrollUp();
        },
        /**
         * 向下按钮点击事件
         */
        onKeyDown: function () {
            this.scrollDown();
        },
        /**
         * 结算按钮点击事件
         */
        onBillingClicked: function () {
            this.billing();
        },
        /**
         * 清空支付方式列表
         */
        onBillingCleanClicked: function () {
            this.cleanPaylist();
        },

        onOKClicked: function () {
           this.confirm();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function () {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },
        /**
         * 快捷支付按钮的点击事件
         */
        onQuickPayClicked: function () {
            this.QuickPay();
        },
        /**
         * 快捷支付
         */
        QuickPay: function () {
            var gatherId = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.info('待支付金额为零,请进行结算');
            }else{
                if(gatherId == ''){
                    toastr.info('付款方式编码不能为空');
                }else{
                    if(storage.isSet(system_config.GATHER_KEY)){
                        //从gather_key里面把visible_flag = ‘0’ 的付款方式的id都取出来
                        var tlist = storage.get(system_config.GATHER_KEY);
                        var visibleTypes = _.where(tlist,{visible_flag:'1'});
                        var gatheridlist = _.pluck(visibleTypes, 'gather_id');
                        var result = $.inArray(gatherId,gatheridlist);//判断付款编码里面是否存在
                        if(result == - 1){
                            toastr.info('付款方式编码无效');
                        }else{
                            var data = {};
                            var gathermodel = _.where(visibleTypes,{gather_id:gatherId});
                            var gatherUI = gathermodel[0].gather_ui;
                            var gatherName = gathermodel[0].gather_name;
                            if(gatherUI == '01'){
                                data['unpaidamount'] = this.model.get('unpaidamount');
                                data['gather_id'] = gatherId;
                                data['gather_name'] = gathermodel[0].gather_name;
                                this.quickpayview = new QuickPayView(data);
                                this.showModal(window.PAGE_ID.QUICK_PAY,this.quickpayview);
                                $('.modal').on('shown.bs.modal',function(e){
                                    $('input[name = quickpay-account]').focus();
                                });
                            }else if(gatherUI == '04'){
                                var time = new Date();
                                var orderNo = time.getTime();
                                var data = {};
                                data['receivedsum'] = this.model.get('unpaidamount');
                                data['gather_id'] = gatherId;
                                data['gather_name'] = gathermodel[0].gather_name;
                                data['orderNo'] = orderNo;
                                this.alipayview = new QPAliPayView(data);
                                this.showModal(window.PAGE_ID.QP_ALIPAY,this.alipayview);
                                $('.modal').on('shown.bs.modal',function(e){
                                    $('input[name = alipay-account]').focus();
                                });
                            }else if(gatherUI == '05') {
                                var time = new Date();
                                var orderNo = time.getTime();
                                var data = {};
                                data['orderNo'] = orderNo;
                                data['receivedsum'] = this.model.get('unpaidamount');
                                data['gather_id'] = gatherId;
                                data['gather_name'] = gathermodel[0].gather_name;
                                this.wechatview = new QPWeChatView(data);
                                this.showModal(window.PAGE_ID.QP_WECHAT,this.wechatview);
                                $('.modal').on('shown.bs.modal',function(e) {
                                    $('input[name = wechat-account]').focus();
                                });
                            }
                        }
                    }
                }
            }
            $(this.input).val('');
        },
        /**
         *支票类付款
         */
        onCheckClicked:function () {
            this.payment('01');
            $('button[name = check]').blur();
        },
        /**
         * 礼券
         */
        onGiftClicked: function () {
            this.payment('02');
            $('button[name = gift-certificate]').blur();
        },
        onPosClicked:function () {
            this.payment('03');
            $('button[name = pos]').blur();
        },
        /**
         * 一卡通支付按钮点击事件
         */
        onEcardClicked: function () {
           this.payByECard();
        },

        onThirdPayClicked: function () {
            this.payment('05');
            $('button[name = third-pay]').blur();
        },
        /**
         *点击支付大类按钮的点击事件
         */
        payment:function (gatherkind){
            var receivedsum = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if(unpaidamount == 0){
                toastr.info('待支付金额为零，请进行结算');
            }else{
                if(receivedsum == ''){
                    toastr.info('支付金额不能为空');
                }else if(receivedsum == 0){
                    toastr.info('支付金额不能为零');
                }else if(receivedsum == '.'){
                    toastr.info('无效的支付金额');
                }else if(receivedsum > (unpaidamount)){
                    toastr.info('不设找零');
                }else{
                    var data = {};
                    data['gather_kind'] = gatherkind;
                    data['receivedsum'] = receivedsum;
                    this.billtypeview = new BilltypeView(data);
                    this.showModal(window.PAGE_ID.BILLING_TYPE,this.billtypeview);
                }
            }
            $('input[name = billing]').val('');
        },

        /**
         * 从接口获取小票号
         */
        getRetailNo: function () {
            var _self = this;
            var data = {};
            data['pos_id'] = '002';
            this.model.requestRetaliNo(data, function (resp) {
                if (resp.status == '00') {
                    _self.billNumber = resp.bill_no;
                    console.log(_self.billNumber);
                } else {
                    toastr.error(resp.msg);
                }
            });
        },

    });
    return billingView;
});