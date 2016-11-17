/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/rtbilling/model',
    '../../../../moduals/rtbilling/collection',
    '../../../../moduals/keytips-member/view',
    '../../../../moduals/modal-confirm/view',
    '../../../../moduals/modal-rtquickpay/view',
    '../../../../moduals/modal-rtqpalipay/view',
    '../../../../moduals/modal-rtqpwechat/view',
    '../../../../moduals/modal-rtgatherui/view',
    '../../../../moduals/modal-rtbilltype/view',
    '../../../../moduals/modal-rtecardlogin/view',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/rtbilling/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/rtbilling/tpl.html'
], function (BaseView, RTBillModel, RTBillCollection,KeyTipsView,ConfirmView,RTQuickPayView,RTQPAliPayView,RTQPWeChatView,GatherUIView,BilltypeView,OneCardView, numpadtpl,billinfotpl,billingdetailtpl, tpl) {
    var rtbillingView = BaseView.extend({

        id: "rtbillingView",

        el: '.views',

        template: tpl,

        template_billinfo:billinfotpl,

        template_billingdetailtpl:billingdetailtpl,

        template_numpad:numpadtpl,

        typeList:null,

        totalamount:0,

        discoutamount:0,

        receivedsum:0,

        unpaidamount:0,

        card_id:'',//一卡通界面传过来的card_id

        i:0,

        input:'input[name = billingrt]',

        events: {
            'click .numpad-ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .rtbilling-help':'onHelpClicked',
            'click .rtbilling-return':'onReturnClicked',
            'click .billing-delete':'onDeleteClicked',
            'click .rtbilling-keyup':'onKeyUpClicked',
            'click .rtbilling-keydown':'onKeyDownClicked',
            'click .billing-clean':'onBillCleanClicked',
            'click .billing':'onBillingClicked',
            'click .quick-pay':'onQuickPayClicked',//快捷支付
            'click .check':'onCheckClicked',//支票类付款
            'click .gift-certificate':'onGiftClicked',//礼券类
            'click .pos':'onPosClicked',//银行pos
            'click .ecard':'onEcardClicked',
            'click .third-pay':'onThirdPayClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING_RETURN;
            this.model = new RTBillModel();
            this.collection = new RTBillCollection();
            this.typeList = new RTBillCollection();
            this.handleEvents();
            this.initTemplates();
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
                this.unpaidamount = 0;
                this.receivedsum = this.totalamount;
                var tempcollection = storage.get(system_config.RETURN_KEY,'paymentlist');
                for(var i in tempcollection) {
                    this.collection.push(tempcollection[i]);
                }
                this.model.set({
                    receivedsum:this.receivedsum,
                    totalamount:this.totalamount,
                    unpaidamount:this.unpaidamount
                });
            }
        },
        initPlugins: function () {
            var _self = this;
            this.renderBillInfo();
            this.renderBillDetail();
            $('input[name = billingrt]').focus();
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
            var billdetail = dh - nav * 2 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            $('.for-billdetail').height(billdetail);
            this.listheight = $('.for-billdetail').height();
            this.listnum = 10;//设置商品列表中的条目数
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
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
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
            $('#billdetail' + this.i).addClass('cus-selected');
            return this;
        },

        handleEvents: function () {
            Backbone.off('onReceivedsum');
            Backbone.on('onReceivedsum',this.onReceivedsum,this);
        },
        onReceivedsum: function (data) {
            var receivedsum = data['receivedsum'];
            var gatherNo = data['gather_no'];//付款账号
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            var gatherKind = data['gather_kind'];
            this.card_id = data['card_id'];
            this.addToPaymentList(this.totalamount,gatherName,receivedsum,gatherNo,gatherId,gatherKind,this.card_id);
        },

        bindKeys: function () {
            var _self = this;
            //返回上一层
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Esc, function () {
                if (isfromForce) {
                    router.navigate('returnforce',{trigger:true});
                } else {
                    router.navigate('returnwhole',{trigger:true});
                }
            });
            //确定
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Enter, function () {
                _self.confirm();
            });
            //删除
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.D, function () {
                _self.judgeEcardExistance();
            });
            //结算
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.B, function() {
                _self.doBilling();
            });
            //方向下
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Down, function () {
                _self.scrollDown();
            });
            //方向上
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Up, function() {
                _self.scrollUp();
            });
            //支票类
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.S, function() {
                _self.payment('01');
            });
            //礼券类
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.A, function() {
                _self.payment('02');
            });
            //银行POS
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.P, function() {
                _self.payment('03');
            });
            //第三方支付
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.Q, function () {
                _self.payment('05');
            });
            //帮助
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.T, function () {
                _self.openHelp();
            });
            //一卡通支付快捷键
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.O, function () {
                _self.payByECard();
            });
            //清空支付方式列表
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.C, function () {
                _self.cleanPaylist();
            });
            //快捷支付
            this.bindKeyEvents(window.PAGE_ID.BILLING_RETURN, window.KEYS.F, function () {
                _self.QuickPay();
            });

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
         */
        addToPaymentList: function (totalamount,gatherName,receivedsum,gatherAccount,gatherId,gatherKind,cardId) {
            //console.log(this.collection);
            var temp = this.collection.findWhere({gather_id: gatherId});
            //if(temp != undefined){
            //    for(var i = 0;i < this.collection.length;i++){
            //        var model = this.collection.at(i);
            //        if(model.get('gather_id') == gatherId){
            //            var gather_money = model.get('gather_money');
            //            gather_money = parseFloat(gather_money) + parseFloat(receivedsum);
            //            model.set({
            //                fact_money:0,
            //                gather_id:gatherId,
            //                gather_name:gatherName,
            //                gather_money:parseFloat(gather_money),
            //                gather_no:gatherAccount,
            //                gather_kind:gatherKind,
            //                card_id:cardId
            //            });
            //        }
            //        this.collection.add(model);
            //    }
            //}else{
            var model = new RTBillModel();
            model.set({
                fact_money:0,
                gather_id:gatherId,
                gather_name:gatherName,
                gather_money:parseFloat(receivedsum),
                gather_no:gatherAccount,
                gather_kind:gatherKind,
                card_id:cardId
            });
            this.collection.add(model);
            //}
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

        openHelp: function () {
            var tipsView = new KeyTipsView('BILLING_RETURN_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER,tipsView);
        },

        /**
         * 确认事件
         */
        confirm:function(){
            if(isfromForce) {
                var receivedsum = $(this.input).val();
                var unpaidamount = this.model.get('unpaidamount');
                if(unpaidamount == 0) {
                    toastr.warning('退货金额为零，请进行结算');
                }else if(receivedsum == '') {
                    toastr.warning('退货金额不能为空');
                }else if(receivedsum == 0){
                    toastr.warning('退货金额不能为零');
                }else if(receivedsum == '.'){
                    toastr.warning('请输入有效退货金额');
                } else if((receivedsum.split('.').length-1) > 1) {
                    toastr.info('请输入有效金额');
                }else if(receivedsum > unpaidamount){
                    toastr.warning('不设找零');
                }else{
                    this.i = 0;
                    this.addToPaymentList(this.totalamount,"现金",receivedsum,"*","00","00",this.card_id);
                }
            }else {
                toastr.warning('原单退货不能更改退款方式');
            }

            $(this.input).val("");
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
                $('.for-billdetail').scrollTop(this.listheight * this.n );
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        /**
         * 判断删除的已支付方式里面是否含有一卡通支付。
         */
        judgeEcardExistance: function () {
            if(isfromForce) {
                var receivedSum = this.model.get('receivedsum');
                if(receivedSum == 0){
                    toastr.info('您尚未退款');
                }else{
                    var item = this.collection.at(this.i);
                    var gatherKind = item.get('gather_kind');
                    if(gatherKind == '06'){
                        var gatherid = item.get('gather_id');
                        var cardId = item.get('card_id');
                        //取出对应的ONE_CARD_KEY的值
                        var ecardcollection = storage.get(system_config.ONE_CARD_KEY,cardId,'detail');
                        console.log(ecardcollection);
                        this.tempcollection = new RTBillCollection();
                        for(var i in ecardcollection) {
                            if(ecardcollection[i].gather_id == gatherid){
                                var temp = ecardcollection[i];
                                var gather_money = parseFloat(temp.gather_money);
                                gather_money = gather_money - item.get('gather_money');
                                gather_money = gather_money.toFixed(2);
                                temp['gather_money'] = gather_money
                                this.tempcollection.push(temp);
                            } else {
                                this.tempcollection.push(ecardcollection[i]);
                            }
                        }
                        storage.remove(system_config.ONE_CARD_KEY);
                        storage.set(system_config.ONE_CARD_KEY,cardId,'detail',this.tempcollection);
                        this.deleteItem();
                    }else{
                        this.deleteItem();
                    }
                    var isExist = this.collection.findWhere({gather_kind: "06"});
                    if(isExist == undefined){
                        if(storage.isSet(system_config.ONE_CARD_KEY)){
                            storage.remove(system_config.ONE_CARD_KEY);
                        }
                    }
                }
            }else {
                toastr.warning('原单退货不能更改退款方式');
            }
        },


        deleteItem:function(){
            var item = this.collection.at(this.i);
            this.collection.remove(item);
            var totalreceived = 0;
            var trlist = this.collection.pluck('gather_money');
            for(var i = 0;i < trlist.length; i++) {
                totalreceived += trlist[i];
            }
            if(totalreceived >= this.totalamount) {
                this.unpaidamount = 0;
                this.oddchange = totalreceived - this.totalamount;
            }else{
                this.oddchange = 0;
                this.unpaidamount = this.totalamount - totalreceived;
            }
            this.model.set({
                receivedsum: totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange:this.oddchange
            });
            this.i = 0;
            this.renderBillInfo();
            this.renderBillDetail();
            toastr.success('删除成功');
        },

        /**
         * 清空已支付列表
         */
        cleanPaylist: function () {
            if(isfromForce) {
                this.receivedsum = 0;
                this.oddchange = 0;
                this.collection.reset();
                this.model.set({
                    receivedsum:this.receivedsum,
                    oddchange:this.oddchange,
                    unpaidamount:this.totalamount
                });
                storage.remove(system_config.ONE_CARD_KEY);
                this.renderBillDetail();
                this.renderBillInfo();
                toastr.success('清空退款方式列表成功');
            }else {
                toastr.warning('原单退货不能更改退款方式');
            }
        },
        /**
         * 结算
         */
        doBilling: function () {
            var _self = this;
            var unpaidamount = this.model.get('unpaidamount');
            var confirmBill = new RTBillModel();
            this.unpaidamount = parseFloat(this.unpaidamount.toFixed(2));
            if(unpaidamount != 0){
                toastr.warning('还有未退款的金额');
            }else{
                var confirmView = new ConfirmView({
                    pageid:window.PAGE_ID.BILLING_RETURN, //当前打开confirm模态框的页面id
                    callback: function () { //
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
                    },
                    content:'确定结算？'
                });
                _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
            }
        },
        /**
         * 快捷支付
         */
        QuickPay: function () {
            if(isfromForce) {
                var gatherId = $(this.input).val();
                var unpaidamount = this.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.info('待退款金额为零');
                }else{
                    if(gatherId == ''){
                        toastr.info('退款方式编码不能为空');
                    }else{
                        if(storage.isSet(system_config.GATHER_KEY)){
                            //从gather_key里面把visible_flag = ‘0’ 的付款方式的id都取出来
                            var tlist = storage.get(system_config.GATHER_KEY);
                            var visibleTypes = _.where(tlist,{visible_flag:'1'});
                            var gatheridlist = _.pluck(visibleTypes, 'gather_id');
                            var result = $.inArray(gatherId,gatheridlist);//判断付款编码里面是否存在
                            if(result == - 1){
                                toastr.info('退款方式编码无效');
                            }else{
                                var gathermodel = _.where(visibleTypes,{gather_id:gatherId});
                                var gatherUI = gathermodel[0].gather_ui;
                                var gatherName = gathermodel[0].gather_name;
                                if(gatherUI == '01'){
                                    var data = {};
                                    data['unpaidamount'] = this.model.get('unpaidamount');
                                    data['gather_id'] = gatherId;
                                    data['gather_name'] = gatherName;
                                    this.rtquickpayview = new RTQuickPayView(data);
                                    this.showModal(window.PAGE_ID.RT_QUICK_PAY,this.rtquickpayview);
                                    $('.modal').on('shown.bs.modal',function(e){
                                        $('input[name = rtquickpay-account]').focus();
                                    });
                                }else if(gatherUI == '04'){
                                    var data = {};
                                    data['receivedsum'] = this.model.get('unpaidamount');
                                    data['gather_id'] = gatherId;
                                    data['gather_name'] = gathermodel[0].gather_name;
                                    this.rtalipayview = new RTQPAliPayView(data);
                                    this.showModal(window.PAGE_ID.RT_QP_ALIPAY,this.rtalipayview);
                                    $('.modal').on('shown.bs.modal',function(e){
                                        $('input[name = rtalipay-account]').focus();
                                    });
                                }else if(gatherUI == '05') {
                                    var data = {};
                                    data['receivedsum'] = this.model.get('unpaidamount');
                                    data['gather_id'] = gatherId;
                                    data['gather_name'] = gathermodel[0].gather_name;
                                    this.rtwechatview = new RTQPWeChatView(data);
                                    this.showModal(window.PAGE_ID.RT_QP_WECHAT,this.rtwechatview);
                                    $('.modal').on('shown.bs.modal',function(e) {
                                        $('input[name = rtwechat-account]').focus();
                                    });
                                }
                            }
                        }
                    }
                }
            }else {
                toastr.warning('原单退货不能更改退款方式');
            }
            $(this.input).val('');
        },

        /**
         *点击支付大类按钮的点击事件
         */
        payment:function (gatherkind){
            if(isfromForce) {
                var receivedsum = $(this.input).val();
                var unpaidamount = this.model.get('unpaidamount');
                if(unpaidamount == 0){
                    toastr.info('待退款金额为零');
                }else{
                    if(receivedsum == ''){
                        toastr.info('退款金额不能为空');
                    }else if(receivedsum == 0){
                        toastr.info('退款金额不能为零');
                    }else if(receivedsum == '.'){
                        toastr.info('无效的退款金额');
                    }else if(receivedsum > unpaidamount){
                        toastr.info('不设找零');
                    }else{
                        var data = {};
                        data['gather_kind'] = gatherkind;
                        data['receivedsum'] = receivedsum;
                        this.billtypeview = new BilltypeView(data);
                        this.showModal(window.PAGE_ID.RT_BILLING_TYPE,this.billtypeview);
                    }
                }
            }else {
                toastr.warning('原单退货不能更改退款方式');
            }
            $(this.input).val('');
        },

        /**
         * 一卡通支付
         */
        payByECard: function () {
            if(isfromForce) {
                var unpaidamount = this.model.get('unpaidamount');
                var receivedSum = $(this.input).val();
                if(unpaidamount == 0){
                    toastr.info('待退款金额为零，请进行结算');
                }else if(receivedSum == ''){
                    toastr.info('退款金额不能为空');
                }else if(receivedSum == 0){
                    toastr.info('退款金额不能为零');
                }else if(receivedSum == '.'){
                    toastr.info('无效的退款金额');
                }else if(receivedSum > unpaidamount){
                    toastr.info('不设找零');
                }else{
                    var data = {};
                    data['unpaidamount'] = unpaidamount;
                    data['receivedsum'] = receivedSum;
                    data['isfromForce'] = isfromForce;
                    this.onecard = new OneCardView(data);
                    this.showModal(window.PAGE_ID.RT_ONECARD_LOGIN,this.onecard);
                    $('.modal').on('shown.bs.modal',function(e) {
                        $('input[name = medium_id]').focus();
                    });
                }
            }else {
                toastr.warning('原单退货不能更改退款方式');
            }
            $(this.input).val('');
        },

        /**
         * 帮助按钮点击事件
         */
        onHelpClicked: function () {
            this.openHelp();
        },

        onReturnClicked: function () {
            if (isfromForce) {
                router.navigate('returnforce',{trigger:true});
            } else {
                router.navigate('returnwhole',{trigger:true});
            }
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
         * 删除按钮点击事件
         */
        onDeleteClicked: function () {
            this.judgeEcardExistance();
        },

        /**
         * 向上按钮点击事件
         */
        onKeyUpClicked: function () {
            this.scrollUp();
        },
        /**
         * 向下按钮点击事件
         */
        onKeyDownClicked: function () {
            this.scrollDown();
        },

        /**
         * 清空支付方式列表
         */
        onBillCleanClicked: function () {
            this.cleanPaylist();
        },


        /**
         * 结算按钮点击事件
         */
        onBillingClicked: function () {
            this.doBilling();
        },

        /**
         * 快捷支付按钮的点击事件
         */
        onQuickPayClicked: function () {
            this.QuickPay();
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



    });
    return rtbillingView;
});