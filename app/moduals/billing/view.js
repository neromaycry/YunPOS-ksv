/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/billing/model',
    '../../../../moduals/billing/collection',
    '../../../../moduals/layer-billtype/view',
    '../../../../moduals/layer-help/view',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-ecardlogin/view',
    '../../../../moduals/layer-gatherui/view',
    '../../../../moduals/layer-binstruction/view',
    '../../../../moduals/layer-referencenum/view',
    'text!../../../../moduals/billing/billinfotpl.html',
    'text!../../../../moduals/billing/billingdetailtpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/billing/clientbillingtpl.html',
    'text!../../../../moduals/billing/tpl.html'
], function (BaseView, BillModel, BillCollection, LayerBillTypeView, LayerHelpView, LayerConfirm, LayerECardView,LayerGatherUIView, LayerBInstructionView, LayerReferenceNumView, billinfotpl, billingdetailtpl, numpadtpl, clientbillingtpl, tpl) {

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

        smallChange: 0,//如果存在去零，则存储去零之后的钱数

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
            this.smallChangemodel = new BillModel();//存放去零支付方式
            this.collection = new BillCollection();
            this.totalamount = storage.get(system_config.SALE_PAGE_KEY, 'shopinfo', 'totalamount');
            this.discountamount = storage.get(system_config.SALE_PAGE_KEY, 'shopinfo', 'discountamount');
            this.itemamount = storage.get(system_config.SALE_PAGE_KEY, 'shopinfo', 'itemamount');
            this.totalamount -= this.discountamount;//优惠金额
            this.selectQulingGranted();
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
            Backbone.off('onBankBackoutSuccess');
            Backbone.on('onReceivedsum', this.onReceivedsum, this);
            Backbone.on('onBankBackoutSuccess', this.onBankBackoutSuccess, this);
        },

        onReceivedsum: function (data) {
            console.log(data);
            var gatherMoney = parseFloat(data.gather_money);//number类型
            var gatherNo = data.gather_no;//付款账号
            var gatherName = data.gather_name;
            var gatherId = data.gather_id;
            var gatherKind = data.gather_kind;
            var extraArgs = undefined;
            if (data.hasExtra) {
                extraArgs = data.extras;
            }
            this.addToPaymentList(this.totalamount, gatherName, gatherMoney, gatherNo, gatherId, gatherKind, extraArgs);
        },


        /**
         *向已付款列表中插入新的行
         * @param totalamount 总金额
         * @param gatherName 付款方式名称
         * @param gatherMoney 付款金额
         * @param gatherNo 付款账号
         * @param gatherId 付款方式Id
         * @param gatherKind 付款方式类别
         * @param extraArgs 附加参数
         */
        addToPaymentList: function (totalamount, gatherName, gatherMoney, gatherNo, gatherId, gatherKind, extraArgs) {
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
                havepay_money: havepay_money,
                change_money: change_money,
                payment_bill: '',
                reference_number: '',
                outtradeno: '',
                bank_json: {}
            });
            switch (extraArgs.extra_id) {
                case 0:
                    model.set({
                        gather_ui: extraArgs.gather_ui,
                        reference_number: extraArgs.reference_number
                    });
                    break;
                case 1:
                    model.set({
                        payment_bill: extraArgs.payment_bill,
                        outtradeno: extraArgs.outtradeno,
                        gather_ui: extraArgs.gather_ui
                    });
                    break;
                case 2:
                    model.set({
                        card_id: extraArgs.card_id
                    });
            }
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
                _self.onCheckClicked();
            });
            //礼券类
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.B, function () {
                _self.onGiftClicked();
            });
            //银行POS
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.P, function () {
                _self.onPosClicked();
            });
            //第三方支付
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.Q, function () {
                _self.onThirdPayClicked();
            });
            //快捷支付
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.E, function () {
                _self.onQuickPayClicked();
            });
            //一卡通支付快捷键
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.O, function () {
                _self.payByECard();
            });
            //帮助
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.T, function () {
                _self.openHelp();
            });
            //清空支付方式列表
            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.C, function () {
                _self.cleanPaylist();
            });

            this.bindKeyEvents(window.PAGE_ID.BILLING, window.KEYS.V, function () {
                _self.onBusinessClicked();
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
                    _self.evalAuth(auth_delete, '08', {}, function () {
                        for (var j = _self.collection.length - 1; j >= 0; j--) {
                            var model = _self.collection.at(j);
                            var gatherUI = model.get('gather_ui');
                            switch (gatherUI) {
                                case '04':
                                case '05':
                                    _self.refund(j, gatherUI);
                                    break;
                                case '06':
                                    _self.deletebankpay(j);
                                    break;
                                default:
                                    _self.deleteItem(j);
                            }
                        }
                    });
                }
            };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirm, attrs, {area: '300px'});
        },


        /**
         * 删除,如果存在第三方支付，则调用refund函数;如果存在一卡通支付，调用一卡通删除函数;如果存在银行卡支付，则调用银行卡删除函数。
         * 否则，调用deleteItem
         */
        onDeleteClicked: function () {
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
                    _self.evalAuth(auth_delete, '08', {}, function () {
                        var item = _self.collection.at(_self.i);
                        var gatherUI = item.get('gather_ui');
                        console.log(gatherUI);
                        if (gatherUI == '04' || gatherUI == '05') {
                            _self.refund(_self.i, gatherUI);
                        } else if (gatherUI == '06') {
                            _self.deletebankpay(_self.i);
                        } else {
                            _self.deleteItem(_self.i);
                            layer.msg('删除成功', optLayerSuccess);
                        }
                    });
                }
            };
            _self.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirm, attrs, {area: '300px'});
        },

        /**
         * 删除时调用第三方支付退款接口
         */
        refund: function (index, gatherUI) {
            var _self = this;
            var data = {};
            var item = this.collection.at(index);
            var paymentBill = item.get('payment_bill');
            var outtradeno = item.get('outtradeno');
            var refundamount = item.get('gather_money');
            if (gatherUI == '04') {
                _.extend(data, {
                    orderid: paymentBill,
                    outtradeno: outtradeno,
                    paymethod: 'zfb',
                    refundamount: refundamount,
                    zfbtwo: 'zfbtwo'
                });
            }
            if (gatherUI == '05') {
                _.extend(data, {
                    orderid: paymentBill,
                    outtradeno: outtradeno,
                    paymethod: 'wx',
                    refundamount: refundamount
                });
            }
            loading.show();
            var url = 'http://127.0.0.1:5000/';
            //var url = 'http://121.42.166.147:9090/';
            resource.post(url + 'api/pay/xfb/refund', data, function (resp) {
                console.log(resp);
                loading.hide();
                if (!$.isEmptyObject(resp)) {
                    if (resp.code == '000000') {
                        if (resp.data.flag == '00') {
                            _self.deleteItem(index);
                            layer.msg(resp.data.msg, optLayerSuccess);
                        } else {
                            layer.msg(resp.data.msg, optLayerError);
                        }
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
        },

        /**
         * 撤销银行卡支付
         */
        deletebankpay: function (index) {
            var _self = this;
            var item = this.collection.at(index);
            var refundamount = item.get('gather_money');
            var attrs = {
                pageid: pageId,
                //transaction_amount: 0.1,
                transaction_amount:refundamount,
                cashier_no: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                pos_no: storage.get(system_config.POS_INFO_KEY, 'posid'),
                bill_no: this.billNumber,
                //如果输入正确的系统参考号，则在撤销的同时，在支付列表里面删除该条支付记录
                //callback: function () {
                //    _self.deleteItem(index);
                //}
            };
            this.openLayer(PAGE_ID.LAYER_REFERENCE_NUM, pageId, '输入系统参考号', LayerReferenceNumView, attrs, {area: '300px'});
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
            //if (this.totaldiscount != 0) {
            //    this.calculateDiscount();
            //}
            var data = {
                mode: '00' //销售模式,  00销售  01单品退货  02原单退货
            };
            var item = {};
            if (storage.isSet(system_config.VIP_KEY)) {
                _.extend(data, {
                    medium_id: storage.get(system_config.VIP_KEY, 'medium_id'),
                    medium_type: storage.get(system_config.VIP_KEY, 'medium_type'),
                    cust_id: storage.get(system_config.VIP_KEY, 'cust_id')
                });
            } else {
                _.extend(data, {
                    medium_id: "*",
                    medium_type: "*",
                    cust_id: "*"
                });
            }
            _.extend(data, {
                bill_no: _self.billNumber,
                retreate_no: '*',
                retreate_reason: '*',
                goods_detail: storage.get(system_config.SALE_PAGE_KEY, 'shopcart'),
                gather_detail: _self.collection.toJSON()
            });
            console.log(data);
            if (this.smallChange != 0) {
                data['gather_detail'].push(this.smallChangemodel.toJSON()); //如果存在去零，则添加一种支付方式为去零
            }
            //限制传到接口的小计，折扣，数量，价格数据类型必须为number，且位数为小数点后两位。
            for (var i = 0; i < data.goods_detail.length; i++) {
                item = data.goods_detail[i];
                item.money = parseFloat(item.money);
                item.discount = parseFloat(item.discount);
                item.price = parseFloat(item.price);
                item.num = parseFloat(item.num);
            }
            //限制传到接口的实收金额，付款金额，找零金额，盈余金额数据类型必须为number，且位数为小数点后两位。
            for (var i = 0; i < data.goods_detail.length; i++) {
                item = data.goods_detail[i];
                item.havepay_money = parseFloat(item.havepay_money);
                item.gather_money = parseFloat(item.gather_money);
                item.change_money = parseFloat(item.change_money);
                item.fact_money = parseFloat(item.fact_money);
            }
            confirmBill.trade_confirm(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        storage.remove(system_config.SALE_PAGE_KEY);
                        storage.remove(system_config.ONE_CARD_KEY);
                        if (storage.isSet(system_config.VIP_KEY)) {
                            storage.remove(system_config.VIP_KEY);
                        }
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
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerError);
                }
            });
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
            if (receivedSum == '.' || parseFloat(receivedSum) == 0 || (receivedSum.split('.').length - 1) > 1) {
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
                gather_money: receivedSum,
                unpaidamount:unpaidamount,
                gather_detail:this.collection
            };
            this.openLayer(PAGE_ID.LAYER_ECARD_LOGIN, pageId, '一卡通登录', LayerECardView, attrs, {area: '300px'});
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
         * 帮助
         */
        openHelp: function () {
            var attrs = {
                page: 'BILLING_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },
        /**
         * 快捷支付
         */
        onQuickPayClicked: function () {
            var _self = this;
            var gatherId = $(this.input).val();
            var unpaidamount = this.model.get('unpaidamount');
            if (unpaidamount == 0) {
                layer.msg('待支付金额为零,请进行结算', optLayerWarning);
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
                console.log(item);
                var gatherUI = item.gather_ui;
                var data = {
                    gather_money: unpaidamount,
                    gather_id: gatherId,
                    gather_name: item.gather_name,
                    gather_kind: item.gather_kind,
                    gather_ui:gatherUI,
                    bill_no: this.billNumber
                };
                switch (gatherUI) {
                    case '04':
                    case '05':
                        var xfbdata = {
                            pos_id: storage.get(system_config.POS_INFO_KEY, 'posid'),
                            bill_no: this.billNumber
                        };
                        //layer.msg('该功能正在调试中', optLayerHelp);
                        _self.requestmodel.xfbbillno(xfbdata, function (resp) {
                            if (!$.isEmptyObject(resp)) {
                                if (resp.status == '00') {
                                    data['payment_bill'] = resp.xfb_bill;
                                    _self.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, pageId, item.gather_name, LayerGatherUIView, data, {area: '600px'});
                                } else {
                                    //toastr.error(resp.msg);
                                    layer.msg(resp.msg, optLayerError);
                                }
                            } else {
                                layer.msg('系统错误，请联系管理员', optLayerWarning);
                            }
                        });
                        break;
                    case '06':
                        this.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, pageId, '银行卡支付确认', LayerGatherUIView, data, {area: '300px'});
                        break;
                    default :
                        this.openLayer(PAGE_ID.LAYER_BILLING_ACCOUNT, pageId, item.gather_name, LayerGatherUIView, data, {area: '300px'});
                }
            }

            $(this.input).val('');
        },
        /**
         *支票类付款
         */
        onCheckClicked: function () {
            this.payment('01', '支票');
        },
        /**
         * 礼券
         */
        onGiftClicked: function () {
            this.payment('02', '礼券');
        },
        onPosClicked: function () {
            this.payment('03', '银行卡');
        },
        /**
         * 一卡通支付按钮点击事件
         */
        onEcardClicked: function () {
            this.payByECard();
        },

        onThirdPayClicked: function () {
            //layer.msg('该功能正在调试中', optLayerHelp);
            //$('input[name = billing]').val('');
            this.payment('05', '第三方支付');
            //$('button[name = third-pay]').blur();
        },
        /**
         *点击支付大类按钮的点击事件
         */
        payment: function (gatherkind, title) {
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
            var attrs = {
                gather_kind: gatherkind,//支付类别
                gather_money: receivedsum,//支付金额
                bill_no: this.billNumber//订单号（ps:银行pos和第三方支付需要订单号）
            };
            this.openLayer(PAGE_ID.LAYER_BILLING_TYPE, pageId, title, LayerBillTypeView, attrs, {area: '300px'});
            $(this.input).val('');
        },

        /**
         * 选择去零权限
         */
        selectQulingGranted: function () {

            switch (window.auth_quling) {
                //参数 0 ：不去零  1：分四舍五入到角  2：角四舍五入到元  3：去分  4：去角
                case '1':
                    this.smallChange = parseFloat(this.totalamount.toFixed(2) - this.totalamount.toFixed(1));
                    this.totalamount = parseFloat(this.totalamount.toFixed(1));
                    break;
                case '2':
                    this.smallChange = parseFloat(this.totalamount - Math.round(this.totalamount));
                    this.totalamount = Math.round(this.totalamount);
                    break;
                case '3':
                    this.smallChange = parseFloat(this.totalamount - Math.floor(this.totalamount * 10) / 10);
                    this.totalamount = Math.floor(this.totalamount * 10) / 10;
                    break;
                case '4':
                    this.smallChange = parseFloat(this.totalamount - Math.floor(this.totalamount));
                    this.totalamount = Math.floor(this.totalamount);
                    break;
            }
            this.smallChange = parseFloat(this.smallChange.toFixed(2));
            this.smallChangemodel.set({
                gather_id: '04',
                gather_name: '去零',
                gather_no: '*',
                fact_money: 0,
                havepay_money: 0,
                payment_bill: '',
                change_money: 0,
                bank_json: {},
                gather_money: this.smallChange,
                outtradeno:'',
            });
        },
        /**
         * 从接口获取小票号
         */
        getRetailNo: function () {
            var _self = this;
            var data = {
                pos_id: storage.get(system_config.POS_INFO_KEY, 'posid')
            };
            this.model.requestRetaliNo(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        _self.billNumber = resp.bill_no;
                        console.log(_self.billNumber);
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            });
        },

        onBankBackoutSuccess: function () {
            this.deleteItem(this.i);
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

        /**
         * 银行业务
         */
        onBusinessClicked: function () {
            var attrs = {
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_BANK_INSTRUCTION, pageId, '银行业务', LayerBInstructionView, attrs, {area: '600px'});
        },

    });

    return billingView;
});