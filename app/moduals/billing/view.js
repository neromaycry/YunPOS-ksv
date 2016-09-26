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
    '../../../../moduals/keytips-member/view',
    '../../../../moduals/modal-confirm/view',
    '../../../../moduals/modal-ecardlogin/view',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection,BilltypeView, BillaccountView, BilldiscountView, KeyTipsView,ConfirmView, OneCardView, billinfotpl, billingdetailtpl, numpadtpl, tpl) {
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

        card_id:'',//一卡通界面传过来的card_id

        template_billinfo:billinfotpl,

        template_billingdetailtpl:billingdetailtpl,

        template_numpad:numpadtpl,

        input:'input[name = billing]',

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
            //'click .btn-floatpad':'onFloatPadClicked',
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
                discountamount:this.discountamount//单品优惠的总金额
            });
            this.initTemplates();
            this.handleEvents();

        },
        initPlugins: function () {
            var _self = this;
            this.renderBillInfo();
            $('input[name = billing]').focus();
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
            //this.itemheight = $('li').height() + 20;
            //this.listnum = parseInt(this.listheight / this.itemheight);//商品列表中的条目数
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
            var gatherType = data['gather_type'];
            this.card_id = data['card_id'];
            this.addToPaymentList(this.totalamount,gatherName,receivedsum,gatherNo,gatherId,gatherType);
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
         * 向已付款列表中插入新的行
         * @param totalamount 总金额
         * @param gatherName 付款方式名称
         * @param receivedsum 付款金额
         * @param gatherAccount 付款账号
         * @param gatherId 付款方式Id
         */
        addToPaymentList: function (totalamount,gatherName,receivedsum,gatherAccount,gatherId,gatherType) {
            var model = new BillModel();
            model.set({
                fact_money:0,
                gather_id:gatherId,
                gather_name:gatherName,
                gather_money:parseFloat(receivedsum),
                gather_no:gatherAccount,
                gather_type:gatherType
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
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
            return this;
        },
        bindKeys: function () {
            var _self = this;
            //返回上一层
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Esc, function () {
                router.navigate('main',{trigger:true});
            });
            //确定
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Enter, function () {
                _self.confirm();
            });
            //删除
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.D, function () {
                _self.deleteItem();
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
            //现金支付
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.S, function() {
               _self.payByCash();
            });
            //礼券类
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.A, function() {
               _self.payByGiftCard();
            });
            //银行POS
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.P, function() {
                _self.payByPos();
            });
            //第三方支付
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Q, function () {
               _self.payByThird();
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
                _self.payByOneCard();
            });
            //清空支付方式列表
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.C, function () {
                _self.cleanPaylist();
            });

        },

        /**
         * 确认事件
         */
        confirm:function() {
            var receivedsum = $('#input_billing').val();
            if(this.unpaidamount == 0) {
                toastr.warning('待支付金额为零，请进行结算');
            }else if(receivedsum == '') {
                toastr.warning('支付金额不能为空，请重新输入');
            }else if(receivedsum == '.'){
                toastr.warning('请输入有效金额');
            } else if(receivedsum == 0){
                toastr.warning('支付金额不能为零，请重新输入');
            }else if(receivedsum > (this.unpaidamount + 100)){
                toastr.warning('找零金额超限');
            }else{
                this.addToPaymentList(this.totalamount,"现金",receivedsum,"*","00");
            }
            $('#input_billing').val("");
        },

        /**
         * 帮助
         */
        openHelp:function () {
            var tipsView = new KeyTipsView('BILLING_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER,tipsView);
        },
        /**
         * 删除单独的支付方式
         */
        deleteItem: function () {
            var item = this.collection.at(this.i);
            var gather_type = item.get('gather_type');
            if(gather_type == '04'){
                //当删除的那条数据里面gather_type = 04
                var gatherid = item.get('gather_id');
                //取出对应的ONE_CARD_KEY的值
                var ecardcollection = storage.get(system_config.ONE_CARD_KEY,this.card_id,'detail');
                this.tempcollection = new BillCollection();
                for(var i in ecardcollection) {
                    if(ecardcollection[i].gather_id == gatherid){
                        var temp = ecardcollection[i];
                        var gather_money = parseFloat(temp.gather_money);
                        gather_money = gather_money + item.get('gather_money');
                        temp['gather_money'] = gather_money
                        this.tempcollection.push(temp);
                    } else {
                        this.tempcollection.push(ecardcollection[i]);
                    }
                }
                storage.remove(system_config.ONE_CARD_KEY);
                storage.set(system_config.ONE_CARD_KEY,this.card_id,'detail',this.tempcollection);
                this.delete();
            }else{
                this.delete();
            }
            var isExist = this.collection.findWhere({gather_type: "04"});
            if(isExist == undefined){
                if(storage.isSet(system_config.ONE_CARD_KEY)){
                    storage.remove(system_config.ONE_CARD_KEY);
                }
            }
        },


        delete:function(){
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
            this.renderBillInfo();
            this.renderBillDetail();
            toastr.success('删除成功');
        },
        /**
         * 整单优惠
         */
        billTotalDiscount:function (){
            if(this.totaldiscount != 0) {//先判断整单优惠金额
                toastr.warning('不能重复整单优惠');
            }else if(this.receivedsum != 0) {//判断是否已经付款
                toastr.warning('您已选择支付方式，不能再进行整单优惠');
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
            if(this.totaldiscount == 0){
                toastr.info('您未进行任何优惠');
            }else if(this.receivedsum != 0){
                toastr.warning('您已选择支付方式，不能取消整单优惠');
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
            if (this.i % this.listnum == 0) {
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
         * 结算
         */
        billing: function () {
            var _self = this;
            var confirmBill = new BillModel();
            if(_self.unpaidamount != 0){
                toastr.warning('还有未支付的金额，请支付完成后再进行结算');
            } else {
                var confirmView = new ConfirmView({
                    pageid:window.PAGE_ID.BILLING, //当前打开confirm模态框的页面id
                    is_navigate:true,
                    navigate_page: window.PAGE_ID.MAIN,
                    callback: function () { //
                        _self.unpaidamount = _self.unpaidamount.toFixed(2);
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
                        data['goods_detail'] = storage.get(system_config.SALE_PAGE_KEY,'shopcart');
                        data['gather_detail'] = _self.collection.toJSON();
                        console.log(data);
                        confirmBill.trade_confirm(data, function (resp) {
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
                                send_data = JSON.stringify(send_data) + '<EOF>';
                                _self.sendLargeData2Socket(send_data);
                            } else {
                                toastr.error(resp.msg);
                            }
                        });
                    },
                    content:'确定结算此单？'
                });
                _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
            }
        },
        /**
         * 清空已支付列表
         */
        cleanPaylist: function () {
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
            toastr.success('清空支付方式列表成功');
        },
        /**
         * 现金类支付
         */
        payByCash: function () {
            var unpaidamount = this.unpaidamount;
            if(unpaidamount == 0){
                toastr.warning('待支付金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('00');
                this.showModal(window.PAGE_ID.BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
            }
        },
        /**
         * 礼券类支付
         */
        payByGiftCard: function () {
            var unpaidamount = this.unpaidamount;
            if(unpaidamount == 0){
                toastr.warning('待支付金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('01');
                this.showModal(window.PAGE_ID.BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
            }
        },
        /**
         * 银行pos支付
         */
        payByPos: function () {
            var unpaidamount = this.unpaidamount;
            if(unpaidamount == 0){
                toastr.warning('待支付金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('02');
                this.showModal(window.PAGE_ID.BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);

            }
        },
        /**
         * 第三方支付
         */
        payByThird:function () {
            var unpaidamount = this.unpaidamount;
            if(unpaidamount == 0){
                toastr.warning('待支付金额为零,请进行结算');
            }else {
                this.billtype = new BilltypeView('03');
                this.showModal(window.PAGE_ID.BILLING_TYPE,this.billtype);
                var attrData = {};
                attrData['unpaidamount'] = unpaidamount;//本次应收的金额
                Backbone.trigger('onunpaidamount',attrData);
                //$('.modal').on('shown.bs.modal',function(e) {
                //    $('input[name = receivedsum]').focus();
                //    //$('#li' + _self.i).addClass('cus-selected');
                //});
            }
        },

        /**
         * 一卡通支付
         */
        payByOneCard: function () {
            var unpaidamount = this.unpaidamount;
            if(unpaidamount == 0){
                toastr.warning('待支付金额为零，请进行结算');
            }else{
                this.onecardview = new OneCardView(unpaidamount);
                this.showModal(window.PAGE_ID.ONECARD_LOGIN,this.onecardview);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = medium_id]').focus();
                });
            }
        },

        /**
         * 整单优惠平均到每个商品
         */
        totalDiscount:function(percentage){
            var _self = this;
            var finaldiscount = 0;//最后一项的优惠
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
            console.log(finaldiscount + '最后一项的优惠');
            var tmp = new BillModel();
            tmp.set(this.localObj[this.localObj.length - 1]);
            tmp.set('discount',finaldiscount);
            _self.discountcollection.push(tmp);
            storage.set(system_config.SALE_PAGE_KEY,'shopcart',_self.discountcollection);
            //console.log(_self.discountcollection);
            //console.log('final');
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
            router.navigate('main',{trigger:true});
        },
        /**
         * 删除按钮点击事件
         */
        onBillDelete: function () {
            this.deleteItem();
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
        /**
         *
         */
        onPayClick:function(e) {
            var index = $(e.currentTarget).data('index');
            //$(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
            switch (index) {
                case '00':
                    this.payByCash();
                    break;
                case '01':
                    this.payByGiftCard();
                    break;
                case '02':
                    this.payByPos();
                    break;
                case '03':
                    this.payByThird();
                    break;
                case '04':
                    this.payByOneCard();
                    break;
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



    });
    return billingView;
});