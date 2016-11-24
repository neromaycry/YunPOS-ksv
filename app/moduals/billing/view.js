/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing/model',
    '../../../../moduals/billing/collection',
    '../../../../moduals/layer-billtype/view',
    '../../../../moduals/modal-billingdiscount/view',
    '../../../../moduals/layer-help/view',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-ecardlogin/view',
    '../../../../moduals/layer-quickpay/view',
    '../../../../moduals/layer-binstruction/view',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/billing/clientbillingtpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection, LayerBillTypeView, BilldiscountView, LayerHelpView, LayerConfirm, layerECardView, LayerQuickPayView, LayerBInstructionView, billinfotpl, billingdetailtpl, numpadtpl, clientbillingtpl, tpl) {

    var billingView = BaseView.extend({

        id: "billingView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        unpaidamount: 0,

        oddchange: 0,//保存此订单的找零钱数

        receivedsum: 0,

        i: 0,

        percentage: 0,

        totalreceived: 0,//实收金额

        totaldiscount: 0,//整单优惠的总价格

        isTotalDiscount: true,//判断是整单优惠还是整单折扣

        visibleTypes: {},

        card_id: '',//一卡通界面传过来的card_id

        length: 0,//判断第三方支付退款是否成功

        template_billinfo: billinfotpl,

        template_billingdetailtpl: billingdetailtpl,

        template_numpad: numpadtpl,

        template_clientbillingtpl: clientbillingtpl,

        input: 'input[name = billing]',

        billNumber: '',

        events: {
            'click .numpad-ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .billing-help': 'onBillHelpClicked',
            'click .billing-return': 'onReturnMainClicked',
            'click .billing-delete': 'onDeleteClicked',
            'click .totaldiscount': 'onTotalDiscountClicked',
            'click .discountpercent': 'onDiscountPercentClicked',
            'click .billing-keyup': 'onKeyUp',
            'click .billing-keydown': 'onKeyDown',
            'click .billing': 'onBillingClicked',
            'click .billing-clean': 'onCleanClicked',
            'click .quick-pay': 'onQuickPayClicked',//快捷支付
            'click .check': 'onCheckClicked',//支票类付款
            'click .gift-certificate': 'onGiftClicked',//礼券类
            'click .pos': 'onPosClicked',//银行pos
            'click .ecard': 'onEcardClicked',
            'click .third-pay': 'onThirdPayClicked',
            'click .bank-business': 'onBusinessClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.BILLING;
            this.model = new BillModel();
            this.requestmodel = new BillModel();
            this.collection = new BillCollection();
            this.totalamount = storage.get(system_config.SALE_PAGE_KEY, 'shopinfo', 'totalamount');
            this.discountamount = storage.get(system_config.SALE_PAGE_KEY, 'shopinfo', 'discountamount');
            this.itemamount = storage.get(system_config.SALE_PAGE_KEY, 'shopinfo', 'itemamount');
            this.totalamount -= this.discountamount;//优惠金额
            this.unpaidamount = this.totalamount;//未付金额
            this.model.set({
                totalamount: this.totalamount,
                receivedsum: this.receivedsum,//实付金额
                unpaidamount: this.unpaidamount,//未付金额
                oddchange: this.oddchange,
                discountamount: this.discountamount//单品优惠的总金额
            });
            this.getRetailNo();
            this.initTemplates();
            this.handleEvents();
        },

        initPlugins: function () {
            this.renderBillInfo();
            this.renderClientDisplay(this.model, isPacked);
            $('input[name = billing]').focus();
            //$('button[name = cancel-totaldiscount]').css('display','none');
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
            this.listnum = 9; //设置商品列表中的条目数
            $('.li-billdetail').height(this.listheight / this.listnum - 21);
        },

        initTemplates: function () {
            this.template_billinfo = _.template(this.template_billinfo);
            this.template_billingdetailtpl = _.template(this.template_billingdetailtpl);
            this.template_clientbillingtpl = _.template(this.template_clientbillingtpl);
        },

        handleEvents: function () {
            Backbone.off('onReceivedsum');
            //Backbone.off('onBillDiscount');
            //Backbone.on('onBillDiscount', this.onBillDiscount,this);
            Backbone.on('onReceivedsum', this.onReceivedsum, this);
        },

        onReceivedsum: function (data) {
            var gatherMoney = parseFloat(data['gather_money']);//number类型
            var gatherNo = data['gather_no'];//付款账号
            var gatherName = data['gather_name'];
            var gatherId = data['gather_id'];
            var gatherKind = data['gather_kind'];
            this.card_id = data['card_id'];
            var paymentBill = data['payment_bill'];
            var extraArgs = undefined;
            if (data.hasExtra) {
                extraArgs = data.extras;
            }
            this.addToPaymentList(this.totalamount, gatherName, gatherMoney, gatherNo, gatherId, gatherKind, this.card_id, paymentBill, extraArgs);
        },


        /**
         *向已付款列表中插入新的行
         * @param totalamount 总金额
         * @param gatherName 付款方式名称
         * @param gatherMoney 付款金额
         * @param gatherNo 付款账号
         * @param gatherId 付款方式Id
         * @param gatherKind 付款方式类别
         * @param cardId 一卡通付款卡号
         * @param paymentBill 订单编号
         * @param extraArgs 附加参数
         */
        addToPaymentList: function (totalamount, gatherName, gatherMoney, gatherNo, gatherId, gatherKind, cardId, paymentBill, extraArgs) {
            if (!extraArgs) {
                extraArgs = {};
            }
            var gather_money = 0;
            var change_money = 0;
            var havepay_money = 0;
            var fact_money = 0;//礼券类支付的盈余字段
            var model = this.collection.findWhere({gather_id: gatherId, gather_no: gatherNo});
            var unpaidamount = this.model.get('unpaidamount');
            if (model != undefined) {
                if (gatherMoney > unpaidamount) {
                    havepay_money = model.get('gather_money') + gatherMoney;
                    gather_money = model.get('gather_money') + unpaidamount;
                    change_money = gatherMoney - unpaidamount;
                } else {
                    havepay_money = model.get('gather_money') + gatherMoney;
                    gather_money = model.get('gather_money') + gatherMoney;
                }
            } else {
                var model = new BillModel();
                if (gatherMoney > unpaidamount) {
                    gather_money = unpaidamount;
                    havepay_money = gatherMoney;
                    change_money = gatherMoney - unpaidamount;
                    //如果支付金额大于未支付金额，则支付列表中显示的支付金额为  receivedsum = unpaidamount
                } else {
                    gather_money = gatherMoney;
                    havepay_money = gatherMoney;
                }
            }
            if (gatherKind == '02' && gatherMoney > unpaidamount) {
                fact_money = gatherMoney - unpaidamount;
                change_money = 0;
                havepay_money = gatherMoney;
            }

            model.set({
                fact_money: fact_money,
                gather_id: gatherId,
                gather_name: gatherName,
                gather_money: gather_money,
                gather_no: gatherNo,
                gather_kind: gatherKind,
                card_id: cardId,
                payment_bill: paymentBill,
                havepay_money: havepay_money,
                change_money: change_money,
                reference_number: extraArgs.reference_number
            });
            this.collection.add(model);
            console.log(this.collection);
            this.totalreceived = this.totalreceived + gatherMoney;
            var changeList = this.collection.pluck('change_money');//因为当存在礼券类支付的时候无法判断找零，所以用change_money判断
            for (var i in changeList) {
                this.oddchange = this.oddchange + changeList[i];
            }
            if (this.totalreceived >= totalamount) {
                this.unpaidamount = 0;
            } else {
                this.unpaidamount = parseFloat((totalamount - this.totalreceived).toFixed(2));
            }

            //if(this.totalreceived >= totalamount){
            //    this.unpaidamount = 0;
            //    this.oddchange = this.totalreceived - totalamount;
            //}else{
            //    this.oddchange = 0;
            //    this.unpaidamount = parseFloat((totalamount - this.totalreceived).toFixed(2));
            //}
            this.model.set({
                receivedsum: this.totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange: this.oddchange
            });
            this.renderBillInfo();
            this.renderBillDetail();
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
                _self.onReturnMainClicked();
            });
            //确定
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Enter, function () {
                _self.confirm();
            });
            //删除
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.D, function () {
                _self.onDeleteClicked(_self.i);
            });
            //结算
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Space, function () {
                _self.onBillingClicked();
            });
            //方向下
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Down, function () {
                _self.scrollDown();
            });
            //方向上
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Up, function () {
                _self.scrollUp();
            });
            //支票类
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.S, function () {
                _self.payment('01', _self.billNumber, '支票类');
            });
            //礼券类
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.B, function () {
                _self.payment('02', _self.billNumber, '礼券类');
            });
            //银行POS
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.P, function () {
                _self.payment('03', _self.billNumber, '银行POS');
            });
            //第三方支付
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Q, function () {
                //$('input[name = billing]').val('');
                layer.msg('该功能正在调试中', optLayerWarning);
                //_self.payment('05', _self.billNumber, '第三方支付');
            });
            //整单优惠输入实际优惠金额
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.F1, function () {
                _self.onTotalDiscountClicked();
            });
            //整单优惠输入折扣
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.F2, function () {
                _self.onDiscountPercentClicked();
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
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.E, function () {
                _self.QuickPay();
            });
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.V, function () {
                _self.openLayer(PAGE_ID.LAYER_BANK_INSTRUCTION, pageId, '银行业务', LayerBInstructionView, undefined, {area: '600px'});
            });

        },

        /**
         * 确认事件
         */
        confirm: function () {
            var receivedsum = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if (unpaidamount == 0) {
                layer.msg('待支付金额为零，请进行结算', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedsum > (unpaidamount + 100)) {
                layer.msg('找零金额超限', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if ((receivedsum.split('.').length - 1) > 1 || receivedsum == '.' || parseFloat(receivedsum) == 0) {
                layer.msg('无效的支付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedsum == '') {
                receivedsum = unpaidamount;
            }
            this.addToPaymentList(this.totalamount, "现金", parseFloat(receivedsum), "*", "00", "00", this.card_id, "");
            this.renderClientDisplay(this.model, isPacked);
            $(this.input).val('');
        },

        /**
         * 帮助
         */
        openHelp: function () {
            var attrs = {
                page: 'BILLING_PAGE'
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },

        /**
         * 删除,如果存在第三方支付，则调用refund函数;如果存在一卡通支付，调用一卡通删除函数;如果存在银行卡支付，则调用银行卡删除函数。
         * 否则，调用deleteItem
         */
        onDeleteClicked: function (index) {
            var _self = this;
            var len = this.collection.length;
            if (len == 0) {
                layer.msg('尚未付款', optLayerWarning);
                return;
            }
            var attrs = {
                pageid: pageId,
                content: '确定删除此条支付记录？',
                callback: function () {
                    var item = _self.collection.at(index);
                    var gatherId = item.get('gather_id');
                    if (gatherId == '12' || gatherId == '13') {
                        _self.refund(gatherId, item.get('payment_bill'));
                    } else {
                        _self.deleteItem(index);
                        layer.msg('删除成功', optLayerSuccess);
                    }
                }
            };
            _self.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirm, attrs, {area: '300px'});
        },

        deleteItem: function (index) {
            var item = this.collection.at(index);
            var gatherMoney = item.get('gather_money');
            this.collection.remove(item);
            for (var i = 0; i < this.collection.length; i++) {
                var temp = this.collection.at(i);
                var fact_money = temp.get('fact_money');//当前这条数据的fact_money
                var change_money = temp.get('change_money');//当前这条数据的change_money
                var gather_money = temp.get('gather_money');//当前这条数据的gather_money
                if (fact_money != 0 && gatherMoney > fact_money) {
                    temp.set({
                        gather_money: gather_money + fact_money,
                        fact_money: 0
                    });
                }

                if (fact_money != 0 && gatherMoney < fact_money) {
                    temp.set({
                        gather_money: gather_money + gatherMoney,
                        fact_money: fact_money - gatherMoney
                    });
                }

                if (change_money != 0 && gatherMoney > change_money) {
                    temp.set({
                        gather_money: gather_money + change_money,
                        change_money: 0
                    });
                }

                if (change_money != 0 && gatherMoney < change_money) {
                    temp.set({
                        gather_money: gather_money + gatherMoney,
                        change_money: change_money - gatherMoney
                    });
                }
                this.collection.push(temp);
            }
            this.totalreceived = this.totalreceived - item.get('havepay_money');
            if (this.totalreceived > this.totalamount) {
                this.unpaidamount = 0;
                this.oddchange = this.totalreceived - this.totalamount;
            } else {
                this.oddchange = 0;
                this.unpaidamount = this.totalamount - this.totalreceived;
            }
            this.model.set({
                receivedsum: this.totalreceived,
                unpaidamount: this.unpaidamount,
                oddchange: this.oddchange
            });
            console.log(this.collection);
            this.i = 0;
            this.renderBillInfo();
            this.renderBillDetail();
        },


        /**
         * 整单优惠点击事件
         */
        onTotalDiscountClicked: function () {
            var discount = $(this.input).val();
            var receivedsum = this.model.get('receivedsum');
            if (receivedsum != 0) {
                layer.msg('您已选择支付方式，不能再进行整单优惠', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (discount == '.' || (discount.split('.').length - 1) > 0 || discount == '') {
                layer.msg('无效的优惠金额', optLayerWarning);
                $(this.input).val('');
                return;
            }

            if (parseFloat(discount) > this.totalamount + this.totaldiscount) {
                layer.msg('整单优惠金额不能大于应付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var rate = (1 - parseFloat(discount) / (this.totalamount + this.totaldiscount)).toFixed(2);
            this.isDiscountGranted('01', rate);
        },


        /**
         *整单折扣点击事件
         */
        onDiscountPercentClicked: function () {
            console.log('折扣前的总金额为：' + this.totalamount + typeof (this.totalamount));
            var percentage = $(this.input).val();
            var receivedsum = this.model.get('receivedsum');
            if (receivedsum != 0) {
                layer.msg('您已选择支付方式，不能再进行整单优惠', optLayerWarning);
                $(this.input).val('');
                return;
            }

            if (percentage == '.' || (percentage.split('.').length - 1) > 0 || percentage == '' || percentage == 0) {
                layer.msg('无效的整单优惠折扣', optLayerWarning);
                $(this.input).val('');
                return;
            }

            if (percentage > 100) {
                layer.msg('整单优惠折扣不能大于100', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var rate = parseFloat((percentage / 100).toFixed(2));
            this.isDiscountGranted('02', rate);
        },

        /**
         * 优惠权限
         * @param authCode
         * @param rate
         */
        isDiscountGranted: function (authCode,  rate) {
            var _self = this;
            console.log(rate);
            switch (authCode) {
                case '01':
                    this.evalAuth(auth_discount, '01', {discount_rate: rate}, function () {
                        _self.billTotalDiscount();
                    });
                    break;
                case '02':
                    this.evalAuth(auth_discount, '02', {discount_rate: rate}, function () {
                        _self.billPercentDiscount();
                    });
            }
        },


        /**
         * 整单优惠-输入实际优惠
         */
        billTotalDiscount: function () {
            var discount = $(this.input).val();
            if (this.totaldiscount != 0) {
                //如果进行过优惠  则原支付金额为 this.totalamount + this.totaldiscout
                this.totalamount = this.totalamount + this.totaldiscount;
            }
            this.totaldiscount = parseFloat(discount); //将本次优惠金额赋值给this.totaldiscount
            this.totalamount = this.totalamount - this.totaldiscount;
            this.unpaidamount = this.totalamount;
            this.model.set({
                totalamount: this.totalamount,
                unpaidamount: this.unpaidamount,
                totaldiscount: this.totaldiscount
            });
            layer.msg('整单优惠成功,优惠金额为：' + this.totaldiscount, optLayerSuccess);
            $(this.input).val('');
            this.renderBillInfo();
        },

        /**
         * 整单折扣
         */

        billPercentDiscount: function () {
            var percentage = $(this.input).val();
            var rate = parseFloat((percentage / 100).toFixed(2));
            if (this.totaldiscount != 0) {
                this.totalamount = this.totalamount + this.totaldiscount;
            }
            this.isTotalDiscount = false;
            this.percentage = percentage;
            this.totaldiscount = this.totalamount * (1 - rate)
            this.totalamount = this.totalamount * rate;
            this.unpaidamount = parseFloat(this.totalamount.toFixed(2));
            this.model.set({
                totalamount: this.totalamount,
                unpaidamount: this.unpaidamount,
                totaldiscount: this.totaldiscount
            });
            layer.msg('整单优惠成功,折扣比率为：' + percentage + '折', optLayerSuccess);
            console.log('折扣后金额' + this.totalamount + typeof (this.totalamount));
            console.log('折扣金额' + this.totaldiscount + typeof (this.discountamount));
            $(this.input).val('');
            this.renderBillInfo();
        },


        /**
         * 结算按钮点击事件
         */
        onBillingClicked: function () {
            var _self = this;
            var unpaidamount = this.model.get('unpaidamount');
            if (unpaidamount != 0) {
                layer.msg('还有未支付的金额，请支付完成后再进行结算', optLayerWarning);
                return;
            }
            console.log(window.auth_quling);
            var attrs = {
                pageid: pageId,
                content: '确认结算此单？',
                is_navigate: true,
                navigate_page: window.PAGE_ID.MAIN,
                callback: function () {
                    _self.billing();
                }
            };
            _self.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirm, attrs, {area: '300px'});
        },
        /**
         * 结算
         */
        billing: function () {
            var confirmBill = new BillModel();
            var _self = this;
            if (this.totaldiscount != 0) {
                this.calculateDiscount();
            }
            var data = {};
            data['mode'] = '00';
            if (storage.isSet(system_config.VIP_KEY)) {
                data['medium_id'] = storage.get(system_config.VIP_KEY, 'medium_id');
                data['medium_type'] = storage.get(system_config.VIP_KEY, 'medium_type');
                data['cust_id'] = storage.get(system_config.VIP_KEY, 'cust_id');
            } else {
                data['medium_id'] = "*";
                data['medium_type'] = "*";
                data['cust_id'] = "*";
            }
            data['bill_no'] = _self.billNumber;
            data['goods_detail'] = storage.get(system_config.SALE_PAGE_KEY, 'shopcart');
            data['gather_detail'] = _self.collection.toJSON();
            console.log(data['gather_detail']);
            confirmBill.trade_confirm(data, function (resp) {
                if (resp.status == '00') {
                    storage.remove(system_config.SALE_PAGE_KEY);
                    storage.remove(system_config.ONE_CARD_KEY);
                    if (storage.isSet(system_config.VIP_KEY)) {
                        storage.remove(system_config.VIP_KEY);
                    }
                    //router.navigate("main", {trigger: true, replace:true});
                    var lastbill_no = resp.bill_no;
                    lastbill_no = lastbill_no.substr(8);
                    storage.set(system_config.ODD_CHANGE, 'oddchange', _self.model.get('oddchange'));
                    storage.set(system_config.ODD_CHANGE, 'lastbill_no', lastbill_no);
                    _self.sendWebSocketDirective([DIRECTIVES.OpenCashDrawer, DIRECTIVES.PRINTTEXT], ['', resp.printf], wsClient);
                    _self.renderClientDisplay(_self.model);
                    router.navigate("main", {trigger: true, replace: true});
                } else {
                    layer.msg(resp.msg, optLayerError);
                    Backbone.trigger('onNavigateStateChanged', false);
                }
            });
        },
        /**
         * 清空已支付方式列表
         */
        cleanPaylist: function () {
            var _self = this;
            var data = {};
            var receivedSum = this.model.get('receivedsum');
            if (receivedSum == 0) {
                layer.msg('尚未付款', optLayerWarning);
                return;
            }
            var attrs = {
                pageid: pageId,
                content: '确定清空支付列表？',
                callback: function () {
                    for (var j = _self.collection.length - 1; j >= 0; j--) {
                        var model = _self.collection.at(j);
                        var gatherId = model.get('gather_id');
                        switch (gatherId) {
                            case '12':
                                data['orderid'] = model.get('payment_bill');
                                data['merid'] = '000201504171126553';
                                data['paymethod'] = 'wx';
                                data['refundamount'] = '0.01';
                                resource.post('http://114.55.62.102:9090/api/pay/xfb/refund', data, function (resp) {
                                    if (resp.data['flag'] == '00') {
                                        _self.deleteItem(j);
                                    } else if (resp.data['flag'] == undefined) {
                                        layer.msg('微信退款失败,清空支付列表失败', optLayerError);
                                    } else {
                                        layer.msg(resp.data['msg'], optLayerError);
                                    }
                                });
                                break;
                            case '13':
                                data['orderid'] = model.get('payment_bill');
                                data['merid'] = '000201504171126553';
                                data['paymethod'] = 'zfb';
                                data['refundamount'] = '0.01';
                                data['zfbtwo'] = 'zfbtwo';
                                resource.post('http://114.55.62.102:9090/api/pay/xfb/refund', data, function (resp) {
                                    if (resp.data['flag'] == '00') {
                                        _self.deleteItem(j);
                                    } else if (resp.data['flag'] == undefined) {
                                        layer.msg('支付宝退款失败,清空支付列表失败', optLayerError);
                                    } else {
                                        layer.msg(resp.data['msg'], optLayerError);
                                    }
                                });
                                break;
                            default :
                                _self.deleteItem(j);
                        }
                    }
                    ;
                }
            };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirm, attrs, {area: '300px'});
        },

        /**
         * 删除时调用第三方支付退款接口
         */
        refund: function (gatherId, paymentBill) {
            var _self = this;
            var data = {};
            if (gatherId == '12') {
                data['orderid'] = paymentBill;
                data['merid'] = '000201504171126553';
                data['paymethod'] = 'wx';
                data['refundamount'] = '0.01';
            } else if (gatherId == '13') {
                data['orderid'] = paymentBill;
                data['merid'] = '000201504171126553';
                data['paymethod'] = 'zfb';
                data['refundamount'] = '0.01';
                data['zfbtwo'] = 'zfbtwo';
            }
            resource.post('http://114.55.62.102:9090/api/pay/xfb/refund', data, function (resp) {
                console.log(resp.data['flag']);
                if (resp.data['flag'] == '00') {
                    _self.deleteItem(_self.i);
                    layer.msg('删除成功', optLayerSuccess);
                } else if (resp.data['flag'] == undefined) {
                    layer.msg('删除失败', optLayerError);
                } else {
                    layer.msg(resp.data['msg'], optLayerError);
                }
            });
        },


        /**
         * 整单优惠平均到每个商品
         */
        calculateDiscount: function () {
            var _self = this;
            var finaldiscount = 0;//最后一项的优惠
            var percentage = 0;//折扣百分比
            var discount = 0;//每件商品整单优惠之后平摊到的折扣金额(不包含单品优惠)
            var price = 0;//价格
            var num = 0;//数量
            this.discountcollection = new BillCollection();
            this.localObj = storage.get(system_config.SALE_PAGE_KEY, 'shopcart');
            if (this.isTotalDiscount) {
                percentage = 1 - this.totaldiscount / (this.totalamount + this.totaldiscount);
            } else {
                percentage = this.percentage / 100;
            }
            console.log(percentage + '折扣比率');
            for (var i = 0; i < this.localObj.length - 1; i++) {
                var item = new BillModel();
                item.set(this.localObj[i]);
                var money = item.get('money');
                discount = parseFloat(item.get('discount'));
                price = item.get('price');
                num = item.get('num');
                var tdiscount = (1 - percentage) * money;//第i单商品的优惠
                discount = discount + tdiscount;//第i单商品的单品优惠和整单优惠之和
                finaldiscount = finaldiscount + tdiscount;//前n-1项总的折扣
                console.log('第' + i + '的整单折扣' + tdiscount);
                item.set({
                    discount: discount,
                    money: price * num - discount
                });
                _self.discountcollection.push(item);
            }
            //最后一项的折扣为
            finaldiscount = parseFloat(this.totaldiscount) - finaldiscount;
            console.log('最后一单的折扣为：' + finaldiscount);
            var tmp = new BillModel();
            tmp.set(this.localObj[this.localObj.length - 1]);
            num = tmp.get('num');
            price = tmp.get('price');
            discount = parseFloat(tmp.get('discount'));
            discount = finaldiscount + discount;
            console.log('最后一件商品的折扣为' + discount);
            tmp.set({
                discount: discount,
                money: num * price - discount
            });
            _self.discountcollection.push(tmp);
            storage.set(system_config.SALE_PAGE_KEY, 'shopcart', _self.discountcollection);
        },

        /**
         * 一卡通支付
         */
        payByECard: function () {
            var unpaidamount = this.model.get('unpaidamount');
            var receivedSum = $(this.input).val();
            if (unpaidamount == 0) {
                layer.msg('待支付金额为零，请进行结算', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedSum == '.' || parseFloat(receivedSum) == 0 || (receivedSum.split('.').length - 1) > 0) {
                layer.msg('无效的支付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedSum == '') {
                receivedSum = unpaidamount
            }
            if (receivedSum > unpaidamount) {
                layer.msg('不设找零', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var attrs = {
                pageid: pageId,
                receivedsum: receivedSum
            }
            this.openLayer(PAGE_ID.LAYER_ECARD_LOGIN, pageId, '一卡通登录', layerECardView, attrs, {area: '600px'});
            $(this.input).val('');
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
            if (this.collection.length != 0) {
                layer.msg('请先清空支付列表', optLayerWarning);
            } else {
                router.navigate('main', {trigger: true});
            }
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
         * 清空支付方式列表
         */
        onCleanClicked: function () {
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
            str = str.substring(0, str.length - 1);
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
            var _self = this;
            var gatherId = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if (unpaidamount == 0) {
                layer.msg('待支付金额为零,请进行结算', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (gatherId == '') {
                layer.msg('无效的付款编码', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (storage.isSet(system_config.GATHER_KEY)) {
                //从gather_key里面把visible_flag = 1 的付款方式的id都取出来
                var tlist = storage.get(system_config.GATHER_KEY);
                var visibleTypes = _.where(tlist, {visible_flag: '1'});
                var gatheridlist = _.pluck(visibleTypes, 'gather_id');//返回gather_id数组
                var result = $.inArray(gatherId, gatheridlist);//判断付款编码里面是否存在
                if (result == -1) {
                    layer.msg('无效的付款编码', optLayerWarning);
                    $(this.input).val('');
                    return;
                }
                var item = _.findWhere(visibleTypes, {gather_id: gatherId});
                var data = {};
                var xfbdata = {};
                xfbdata['pos_id'] = '002';
                xfbdata['bill_no'] = _self.billNumber;
                data['gather_money'] = unpaidamount;
                data['gather_id'] = gatherId;
                data['gather_name'] = item.gather_name;
                switch (gatherId) {
                    case '12':
                        layer.msg('该功能正在调试中', optLayerHelp);
                        //_self.requestmodel.xfbbillno(xfbdata, function(resp){
                        //    if(resp.status == '00') {
                        //        data['payment_bill'] = resp.xfb_bill;
                        //        _self.openLayer(PAGE_ID.LAYER_QUICK_PAY, pageId, item.gather_name, LayerQuickPayView, data, {area:'600px'});
                        //    } else {
                        //        toastr.error(resp.msg);
                        //    }
                        //});
                        break;
                    case '13':
                        layer.msg('该功能正在调试中', optLayerHelp);
                        //_self.requestmodel.xfbbillno(xfbdata, function(resp){
                        //    if(resp.status == '00') {
                        //        data['payment_bill'] = resp.xfb_bill;
                        //        _self.openLayer(PAGE_ID.LAYER_QUICK_PAY, pageId, item.gather_name, LayerQuickPayView, data, {area:'600px'});
                        //    } else {
                        //        toastr.error(resp.msg);
                        //    }
                        //});
                        break;
                    case '16':
                        data['payment_bill'] = '*'
                        this.openLayer(PAGE_ID.LAYER_QUICK_PAY, pageId, '银行卡支付确认', LayerQuickPayView, data, {area: '300px'});
                        break;
                    default :
                        data['payment_bill'] = '*';
                        this.openLayer(PAGE_ID.LAYER_QUICK_PAY, pageId, item.gather_name, LayerQuickPayView, data, {area: '300px'});
                }
            }

            $(this.input).val('');
        },
        /**
         *支票类付款
         */
        onCheckClicked: function () {
            this.payment('01', this.billNumber, '支票类');
            $('button[name = check]').blur();
        },
        /**
         * 礼券
         */
        onGiftClicked: function () {
            this.payment('02', this.billNumber, '礼券类');
            $('button[name = gift-certificate]').blur();
        },
        onPosClicked: function () {
            this.payment('03', this.billNumber, '银行POS');
            $('button[name = pos]').blur();
        },
        /**
         * 一卡通支付按钮点击事件
         */
        onEcardClicked: function () {
            this.payByECard();
        },

        onThirdPayClicked: function () {
            layer.msg('该功能正在调试中', optLayerHelp);
            //$('input[name = billing]').val('');
            this.payment('05', this.billNumber, '第三方支付');
            //$('button[name = third-pay]').blur();
        },
        /**
         *点击支付大类按钮的点击事件
         */
        payment: function (gatherkind, billNumber, title) {
            var data = {};
            var receivedsum = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if (unpaidamount == 0) {
                layer.msg('待支付金额为零,请进行结算', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if ((receivedsum.split('.').length - 1) > 1 || receivedsum == '.' || parseFloat(receivedsum) == 0) {
                layer.msg('无效的支付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (gatherkind != '02' && receivedsum > unpaidamount) {
                layer.msg('不设找零', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedsum == '') {
                receivedsum = unpaidamount;
            }
            data['gather_kind'] = gatherkind;//支付方式类别：包括现金类,礼券类等
            data['gather_money'] = receivedsum;
            data['bill_no'] = billNumber;
            this.openLayer(PAGE_ID.LAYER_BILLING_TYPE, pageId, title, LayerBillTypeView, data, {area: '300px'});
            $(this.input).val('');
        },

        onBusinessClicked: function () {
            this.openLayer(PAGE_ID.LAYER_BANK_INSTRUCTION, pageId, '银行业务', LayerBInstructionView, undefined, {area: '600px'});
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
                    layer.msg(resp.msg, optLayerWarning);
                }
            });
        },

        /**
         * 保留两位小数的方法
         */
        toDecimal2: function () {
            var f = parseFloat(x);
            if (isNaN(f)) {
                return false;
            }
            var f = Math.round(x * 100) / 100;
            var s = f.toString();
            var rs = s.indexOf('.');
            if (rs < 0) {
                rs = s.length;
                s += '.';
            }
            while (s.length <= rs + 2) {
                s += '0';
            }
            return s;
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
            if ((this.i + 1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                $('.for-billdetail').scrollTop(this.listheight * this.n);
            }
            $('#billdetail' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },


        ///**
        // * 取消整单优惠
        // */
        //cancelTotalDiscount: function () {
        //    var receivedsum = this.model.get('receivedsum');
        //    if(this.totaldiscount == 0){
        //        toastr.info('您未进行任何优惠')
        //    }else if(receivedsum != 0){
        //        toastr.info('您已选择支付方式，不能取消整单优惠');
        //    }else{
        //        this.totalamount = parseFloat(this.model.get("totalamount")) + parseFloat(this.totaldiscount);
        //        this.unpaidamount = this.totalamount;
        //        this.totaldiscount = 0;
        //        this.model.set({
        //            totalamount:this.totalamount,
        //            unpaidamount:this.unpaidamount,
        //            totaldiscount:this.totaldiscount
        //        });
        //        this.renderBillInfo();
        //        $('button[name = totaldiscount]').css('display','block');
        //        $('button[name = cancel-totaldiscount]').css('display','none');
        //        toastr.success('取消整单优惠成功');
        //    }
        //},

        //onBillDiscount: function (data) {
        //    this.percentage = data['percentage'] / 100;
        //    this.totaldiscount = (this.totalamount * ( 1- this.percentage)).toFixed(2);//优惠金额
        //    this.totalamount = (this.totalamount - this.totaldiscount).toFixed(2);//折扣后的支付金额
        //    this.unpaidamount = this.totalamount;
        //    this.model.set({
        //        totaldiscount:this.totaldiscount,//整单优惠的金额
        //        totalamount:this.totalamount,
        //        unpaidamount:this.unpaidamount,
        //        percentage:percentage
        //    });
        //    this.renderBillInfo();
        //},

    });


    return billingView;
});