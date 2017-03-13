/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/main/model',
    '../../../../moduals/main/collection',
    '../../../../moduals/layer-priceentry/view',
    '../../../../moduals/layer-member/view',
    '../../../../moduals/layer-logout/view',
    '../../../../moduals/layer-salesman/view',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-help/view',
    '../../../../moduals/layer-restorder/view',
    '../../../../moduals/layer-withdraw/view',
    '../../../../moduals/layer-binstruction/view',
    '../../../../moduals/layer-worker/view',
    '../../../../moduals/layer-icmember/view',
    'Recwebsocket',
    'text!../../../../moduals/main/posinfotpl.html',
    'text!../../../../moduals/main/salesmantpl.html',
    'text!../../../../moduals/main/minfotpl.html',
    'text!../../../../moduals/main/cartlisttpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/main/clientdisplaytpl.html',
    'text!../../../../moduals/main/welcometpl.html',
    'text!../../../../moduals/main/oddchangetpl.html',
    'text!../../../../moduals/main/marqueetpl.html',
    'text!../../../../moduals/main/tpl.html',
], function (BaseView, HomeModel, HomeCollection, LayerPriceEntryView, LayerMemberView, LayerLogoutView, LayerSalesmanView, LayerConfirm, LayerHelpView, LayerRestOrderView, LayerWithdrawView, LayerBInstructionView, LayerWorkerView, LayerICMemberView, Recwebsocket, posinfotpl, salesmantpl, minfotpl, cartlisttpl, numpadtpl, clientdisplaytpl, welcometpl, oddchangetpl, marqueetpl, tpl) {
    var mainView = BaseView.extend({
        id: "mainView",
        el: '.views',
        template: tpl,
        totalamount: 0,
        itemamount: 0,
        discountamount: 0,
        isTotalDiscount: false,
        salesman: '',
        memeber: '',
        ids: ['curSaleState', 'curItem'],
        clientScreen: null,
        isInSale: false,
        i: 0,
        template_posinfo: posinfotpl,
        template_salesman: salesmantpl,
        template_minfo: minfotpl,
        template_cartlisttpl: cartlisttpl,
        template_numpad: numpadtpl,
        template_clientdisplay: clientdisplaytpl,
        template_welcome: welcometpl,
        template_oddchange: oddchangetpl,
        template_marquee: marqueetpl,
        salesmanView: null,
        secondloginView: null,
        restOrderDelivery: {},
        deleteKey: {},
        isDeleteKey: false,
        Enum: {
            ALWAYS_FOCUS_FIRST: 0,
            ALWAYS_FOCUS_LAST: 1
        },
        //isDiscountPercent: false,
        //input:'input[name = main]',
        events: {
            'click .numpad-ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .main-help': 'openHelp',
            'click .h-connect': 'onHConnectClicked',
            'click .main-billing': 'onBillingClicked',
            //'click .salesman': 'onSalesmanClicked', //营业员登录
            'click .member': 'onMemberClicked',
            'click .main-discount': 'onDiscountClicked',
            'click .main-discountpercent': 'onDiscountPercentClicked',
            'click .totaldiscount': 'onTotalDiscount',
            'click .totaldiscount-percentage': 'onTotalDiscountPercentage',
            'click .main-delete': 'onDeleteClicked',
            'click .main-modify-num': 'onModifyItemNum',
            'click .main-cancel': 'onCleanClicked',
            'click .main-keyup': 'onKeyUpClicked',
            'click .main-keydown': 'onKeyDownClicked',
            'click #restorder': 'onRestorderClicked',
            'click #unrestorder': 'onUnRestOrderClicked',
            'click .return-whole': 'onReturnWholeClicked',
            'click .return-force': 'onReturnForceClicked',
            'click .checking': 'onCheckingClicked',
            'click .login-out': 'onLoginOutClicked',
            'click .print': 'onPrintClicked',//打印页面,
            'click .withdraw': 'onWithDrawClicked',//打印页面
            'click .cashdrawer': 'openCashDrawer',
            'click .lock': 'lockScreen',
            'click .bank-business': 'onBusinessClicked',
            'click .passwd-change': 'onPasswdChangeClicked',
            //'click .setting': 'onSettingClicked'  //设置
            'click .paytable': 'onPayTableClicked',//缴款表
        },
        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.MAIN;
            this.input = 'input[name = main]';
            var user = storage.get(system_config.LOGIN_USER_KEY);  // 从本地取出登录用户属性
            this.model = new HomeModel();  // 当前view的model
            this.oddchangeModel = new HomeModel();
            this.memberModel = new HomeModel();  // 存放登录用户信息的model
            //this.salesmanModel = new HomeModel();
            this.marqueeModel = new HomeModel();
            this.collection = new HomeCollection();  //当前view的collection
            //this.logincollection = new HomeCollection();
            this.requestModel = new HomeModel();  //网络请求的model
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            this.memberModel.set({
                username: user.user_name,
                pos: storage.get(system_config.POS_INFO_KEY, 'posid'),
                lastbill_no: ''
            });
            if (storage.isSet(system_config.SALE_PAGE_KEY)) {
                this.collection.set(storage.get(system_config.SALE_PAGE_KEY, 'shopcart'));
                this.model.set(storage.get(system_config.SALE_PAGE_KEY, 'shopinfo'));
                //this.i = storage.get(system_config.SALE_PAGE_KEY, 'i');
            }
            //if (storage.isSet(system_config.SALE_PAGE_KEY, 'salesman')) {
            //    this.salesmanModel.set({
            //        salesman: storage.get(system_config.SALE_PAGE_KEY, 'salesman')
            //    });
            //} else {
            //    this.salesmanModel.set({
            //        salesman: '营业员登录'
            //    });
            //}
            if (storage.isSet(system_config.VIP_KEY)) {
                var member = storage.get(system_config.VIP_KEY);
                this.memberModel.set(member);
            } else {
                this.memberModel.set({
                    name: '未登录',
                    score_balance: 0,
                    account_balance: 0,
                    //account_enddate: '未登录，请查询'
                });
            }
            if (storage.isSet(system_config.LOGIN_USER_KEY)) {
                this.deleteKey = _.pluck(storage.get(system_config.LOGIN_USER_KEY, 'worker_position'), 'key');
            }

            if (storage.isSet(system_config.ODD_CHANGE)) {
                this.oddchangeModel.set({
                    oddchange: storage.get(system_config.ODD_CHANGE, 'oddchange')
                });
                //this.memberModel.set({
                //    lastbill_no: storage.get(system_config.ODD_CHANGE, 'lastbill_no')
                //});
            } else {
                this.oddchangeModel.set({
                    oddchange: 0
                });
                //this.oddchangeModel.set({
                //    lastbill_no: '无订单'
                //});
            }
            if (!this.marqueeModel.get('notification_content')) {
                this.marqueeModel.set({
                    notification_content: '当前无通知'
                });
            }
            if (storage.isSet(system_config.POS_CONFIG, 'notify_url')) {
                this.initNotifySocket();
            }
            this.cursor = this.Enum.ALWAYS_FOCUS_LAST;
            //if (storage.isSet(system_config.PRINTF)) {
            //    var message = DIRECTIVES.PRINTTEXT + storage.get(system_config.PRINTF);
            //    console.log(message);
            //    window.wsClient.send(message);
            //    window.wsClient.send(DIRECTIVES.OpenCashDrawer)
            //}
            //this.onDeleteKey();
            this.initTemplates();
            this.handleEvents();
        },
        initPlugins: function () {
            var _self = this;
            $(this.input).focus();
            $('.for-cartlist').perfectScrollbar();  // 定制滚动条外观
            this.renderPosInfo();
            //this.renderSalesman();
            this.renderCartList(this.Enum.ALWAYS_FOCUS_LAST);
            this.renderOddChange();
            this.renderMarquee();
            this.renderMinfo();
            if (isFromLogin) {
                this.renderClientWelcome(isPacked, isClientScreenShow);
                isFromLogin = false;
            }
            //this.buttonSelected();
            this.$el.find('.for-numpad').html(this.template_numpad);
            $('.marquee').marquee({
                duration: 15000,
                duplicated: true,
                gap: 500,
                pauseOnHover: true
            });
            this.addClickedState();
            this.requestModel.getRetailNo({pos_id: storage.get(system_config.POS_INFO_KEY, 'posid')}, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        _self.memberModel.set({
                            retail_no: resp.retail_no
                        });
                        _self.renderMinfo();
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
        },
        initTemplates: function () {
            this.template_posinfo = _.template(this.template_posinfo);
            this.template_salesman = _.template(this.template_salesman);
            this.template_cartlisttpl = _.template(this.template_cartlisttpl);
            this.template_clientdisplay = _.template(this.template_clientdisplay);
            this.template_welcome = _.template(this.template_welcome);
            this.template_oddchange = _.template(this.template_oddchange);
            this.template_marquee = _.template(this.template_marquee);
            this.template_minfo = _.template(this.template_minfo);
            //this.template_shopitem = _.template(this.template_shopitem);
        },
        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(window).height();
            var dw = $(window).width();
            var nav = $('.navbar').height();  // 导航栏高度
            //var marquee = $('.marquee-panel').height();
            var oddchange = $('.oddchange-panel').height();
            var panelheading = $('.panel-heading').height();  //面板heading高度
            var panelfooter = $('.panel-footer').height();  //面板footer高度
            var cart = dh - nav * 3 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);  // 设置购物车面板的宽度
            //$('.marquee-panel').width(cartWidth);
            $('.for-cartlist').height(cart - oddchange - 20);  //设置购物车的高度
            this.listheight = $('.for-cartlist').height();//购物车列表的高度
            this.listnum = 5;//设置商品列表中的条目数
            this.itemheight = this.listheight / this.listnum - 21;
            $('.li-cartlist').height(this.itemheight);
        },
        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },
        //renderSalesman: function () {
        //    this.$el.find('.for-salesman').html(this.template_salesman(this.salesmanModel.toJSON()));
        //    return this;
        //},
        renderMinfo: function () {
            this.$el.find('.for-minfo').html(this.template_minfo(this.memberModel.toJSON()));
            return this;
        },
        renderCartList: function (cursor) {
            this.$el.find('.for-cartlist').html(this.template_cartlisttpl(this.collection.toJSON()));
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
            var cartLen = this.collection.length;
            this.n = Math.floor(cartLen / this.listnum);
            if (cursor == this.Enum.ALWAYS_FOCUS_LAST) {
                this.i = cartLen;
                if (cartLen > this.listnum) {
                    $('.for-cartlist').scrollTop(this.listheight * this.n);
                }
                $('#li' + (this.i - 1)).addClass('cus-selected');
            } else {
                $('#li' + this.i).addClass('cus-selected');
            }
            return this;
        },
        renderClientWelcome: function (isPacked, isClientShow) {
            if (isPacked && isClientShow) {
                $(clientDom).find('.client-display').html(this.template_welcome());
                return this;
            }
        },
        renderClientCart: function (collection, isPacked, isClientShow) {
            if (isPacked && isClientShow) {
                var len = collection.length;
                var model = collection.at(len - 1);
                $(clientDom).find('.client-display').html(this.template_clientdisplay(model.toJSON()));
                return this;
            }
        },

        renderOddChange: function () {
            this.$el.find('.oddchange').html(this.template_oddchange(this.oddchangeModel.toJSON()));
            return this;
        },

        renderMarquee: function () {
            this.$el.find('.for-notice').html(this.template_marquee(this.marqueeModel.toJSON()));
            return this;
        },
        handleEvents: function () {
            // 注册backbone事件
            //Backbone.off('SalesmanAdd');
            Backbone.off('onMemberSigned');
            Backbone.off('onReleaseOrder');
            Backbone.off('getGoods');
            Backbone.off('openLayerWorker');
            Backbone.off('onMainICMemberLogin');
            //Backbone.on('SalesmanAdd', this.SalesmanAdd, this);
            Backbone.on('getGoods', this.getGoods, this);
            Backbone.on('openLayerWorker', this.openLayerWorker, this);
            Backbone.on('onMemberSigned', this.onMemberSigned, this);
            Backbone.on('onReleaseOrder', this.onReleaseOrder, this);
            Backbone.on('onMainICMemberLogin', this.onMainICMemberLogin, this);
        },
        //SalesmanAdd: function (result) {
        //    storage.set(system_config.SALE_PAGE_KEY, 'salesman', result);
        //    this.salesmanModel.set({
        //        salesman: result
        //    });
        //    this.renderSalesman();
        //},
        onReleaseOrder: function (data) {
            this.collection = new HomeCollection();
            for (var i in data) {
                var item = new HomeModel();
                item.set(data[i]);
                this.collection.push(item);
            }
            this.onAddItem(this.collection.toJSON());
        },
        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Enter, function () {
                _self.addItem();
            });
            //会员登录
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F8, function () {
                _self.onMemberClicked();
            });
            //挂单
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F6, function () {
                _self.restOrder();
            });
            //解挂
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F7, function () {
                _self.releaseOrder();
            });
            //营业员登陆
            //this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F11, function () {
            //    _self.doLoginSalesman();
            //});
            //退出登录
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Esc, function () {
                _self.doLogout();
            });
            //结算
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Space, function () {
                _self.doBilling();
            });
            //清空购物车
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.C, function () {
                _self.onCleanClicked();
            });
            //删除商品
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.D, function () {
                _self.onDeleteClicked();
            });
            //修改数量
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F12, function () {
                _self.modifyItemNum();
            });
            //单品优惠
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F1, function () {
                _self.modifyItemDiscount();
            });
            //向上
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Down, function () {
                _self.scrollDown();
            });
            //向下
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Up, function () {
                _self.scrollUp();
            });
            //强制退货/单品退货
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F, function () {
                _self.onReturnForceClicked();
            });
            //整单退货
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F3, function () {
                _self.onReturnWholeClicked();
            });
            //打开帮助
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.T, function () {
                _self.openHelp();
            });
            //收银对账
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F10, function () {
                _self.onCheckingClicked();
            });
            //折让
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F2, function () {
                _self.onDiscountPercentClicked();
            });
            //小票打印
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.H, function () {
                _self.onPrintClicked();
            });
            //提大额
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F9, function () {
                _self.onWithDrawClicked();
            });
            //开钱箱
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F5, function () {
                _self.openCashDrawer();
            });
            //锁屏
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F4, function () {
                _self.lockScreen();
            });
            //银行页面
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.V, function () {
                _self.onBusinessClicked();
            });
            //设置页面
            //this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Q, function () {
            //    _self.onSettingClicked();
            //});
            //整单优惠
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Y, function () {
                _self.onTotalDiscount();
            });
            //整单折扣
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.U, function () {
                _self.onTotalDiscountPercentage();
            });
            //修改密码
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.P, function () {
                _self.onPasswdChangeClicked();
                //_self.changePasswd();
            });
            //缴款表
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.G, function () {
                _self.onPayTableClicked();
            });
        },
        /**
         * 账户登出
         */
        doLogout: function () {
            $(this.input).val('');
            this.openLayer(PAGE_ID.LAYER_LOGOUT, pageId, '登出需要验证', LayerLogoutView, undefined, {area: '300px'});
        },
        /**
         * 结算
         */
        doBilling: function () {
            if (this.model.get('itemamount') == 0) {
                layer.msg('购物车内无商品', optLayerWarning);
            } else {
                //storage.set(system_config.SALE_PAGE_KEY, 'i', this.i);
                router.navigate('billing', {trigger: true});
            }
        },
        /**
         * 营业员登录
         */
        doLoginSalesman: function () {
            this.openLayer(PAGE_ID.LAYER_SALESMAN, pageId, '营业员登录', LayerSalesmanView, undefined, {area: '300px'});
        },
        /**
         * 购物车光标向下
         */
        scrollDown: function () {
            if (this.i <= this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.collection.length / this.listnum)) {
                this.n++;
                $('.for-cartlist').scrollTop(this.listheight * this.n);
            }
            $('#li' + (this.i - 1)).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 购物车光标向上
         */
        scrollUp: function () {
            if (this.i > 1) {
                this.i--;
            }
            if ((this.i + 1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                $('.for-cartlist').scrollTop(this.listheight * this.n);
            }
            $('#li' + (this.i - 1)).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 解挂
         */
        releaseOrder: function () {
            var itemamount = this.model.get('itemamount');
            if (itemamount != 0) {
                layer.msg('购物车内有商品，不能执行解挂操作', optLayerWarning);
            } else {
                this.openLayer(PAGE_ID.LAYER_RESTORDER, pageId, '订单解挂', LayerRestOrderView, undefined, {area: '300px'});
            }
        },
        /**
         * 挂单
         */
        restOrder: function () {
            var itemamount = this.model.get('itemamount');
            if (itemamount == 0) {
                layer.msg('当前购物车内无商品，无法执行挂单操作', optLayerWarning);
            } else {
                //var orderNum = new Date().getTime();
                var orderNumFromStorage = storage.get(system_config.RESTORDER_NUM);
                var orderNum = orderNumFromStorage;
                orderNumFromStorage = parseInt(orderNumFromStorage);
                if (orderNumFromStorage < 9) {
                    orderNumFromStorage++;
                    orderNumFromStorage = '0' + orderNumFromStorage;
                } else {
                    orderNumFromStorage++;
                    orderNumFromStorage = orderNumFromStorage.toString();
                }
                storage.set(system_config.RESTORDER_NUM, orderNumFromStorage);
                if (storage.isSet(system_config.RESTORDER_KEY)) {
                    var pre = storage.get(system_config.RESTORDER_KEY);
                    pre[orderNum] = this.collection.toJSON();
                    storage.set(system_config.RESTORDER_KEY, pre);
                } else {
                    this.restOrderDelivery[orderNum] = this.collection.toJSON();
                    storage.set(system_config.RESTORDER_KEY, this.restOrderDelivery);
                }
                this.model.set({
                    itemamount: 0,
                    totalamount: 0,
                    discountamount: 0
                });
                this.collection.reset();
                this.renderPosInfo();
                this.renderCartList(this.Enum.ALWAYS_FOCUS_LAST);
                //this.buttonSelected();
                storage.remove(system_config.SALE_PAGE_KEY);
                layer.msg('挂单号：' + orderNum, optLayerSuccess);
                var time = this.getCurrentFormatDate();
                var printText = '\n\n\n\n';
                printText += '        订单挂单\n\n\n';
                printText += '    挂单时间：' + time + '\n\n';
                printText += '    挂单号：' + orderNum + '\n\n\n\n\n\n';
                this.sendWebSocketDirective([DIRECTIVES.PRINTTEXT], [printText], wsClient);
            }
        },

        /**
         * 单品优惠
         */
        modifyItemDiscount: function () {
            var index;
            if (this.cursor == this.Enum.ALWAYS_FOCUS_LAST) {
                index = this.i - 1;
            } else if (this.cursor == this.Enum.ALWAYS_FOCUS_FIRST) {
                index = this.i;
            }
            var _self = this;
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var item = this.collection.at(index);
            var price = item.get('price');
            var discount = $(this.input).val();
            var num = item.get('num');
            if (item.get('disc_subtotal') != 0) {
                layer.msg('整单优惠后不能再进行单品优惠', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (discount == '.' || (discount.split('.').length - 1) > 1 || discount == '') {
                layer.msg('无效的优惠金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (parseFloat(discount) > price * num) {
                layer.msg('优惠金额不能大于商品金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var rate = 1 - parseFloat(discount) / (price * num); //discount_rate类型为decimal
            console.log(rate);
            this.evalAuth(auth_discount, '01', {discount_rate: rate}, function () {
                //var discount = item.get('discount');
                _self.collection.at(index).set({
                    discount: parseFloat(discount),
                    money: price * num - discount,
                    manager_id: storage.get(system_config.LOGIN_USER_KEY, 'manager_id')
                });
                _self.calculateModel();
                layer.msg('单品优惠成功!优惠金额：' + discount + '元', optLayerSuccess);
                $('#li' + index).addClass('cus-selected');
                $(_self.input).val('');
            });
        },

        //折让
        onDiscountPercentClicked: function () {
            var index;
            if (this.cursor == this.Enum.ALWAYS_FOCUS_LAST) {
                index = this.i - 1;
            } else if (this.cursor == this.Enum.ALWAYS_FOCUS_FIRST) {
                index = this.i;
            }
            var _self = this;
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var value = $(this.input).val();
            var item = _self.collection.at(index);
            var price = item.get('price');
            var num = item.get('num');
            if (item.get('disc_subtotal') != 0) {
                layer.msg('整单优惠后不能再进行单品优惠', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if ((value.split('.').length - 1) > 0 || value >= 100 || value == '') {
                layer.msg('无效的折扣比率', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var rate = parseFloat((value / 100).toFixed(2));//discount_rate类型为decimal
            this.evalAuth(auth_discount, '02', {discount_rate: rate}, function () {
                var discountpercent = $(_self.input).val();
                var rate = parseFloat(discountpercent) / 100;
                _self.collection.at(index).set({
                    discount: price * num * (1 - rate),
                    money: price * num * rate,
                    manager_id: storage.get(system_config.LOGIN_USER_KEY, 'manager_id')
                });
                _self.calculateModel();
                layer.msg('单品折扣成功!折扣比率：' + (rate * 10).toFixed(1) + '折', optLayerSuccess);
                $('#li' + index).addClass('cus-selected');
                $(_self.input).val('');
            });
        },

        /**
         * 整单优惠
         */
        onTotalDiscount: function () {
            var _self = this;
            var totaldiscount = $(this.input).val();
            var totalamount = this.model.get('totalamount');
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if ((totaldiscount.split('.').length - 1) > 1 || totaldiscount == '' || totaldiscount == '.') {
                layer.msg('无效的整单优惠金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var rate = 1 - parseFloat(totaldiscount) / totalamount;
            this.evalAuth(auth_discount, '03', {discount_rate: rate}, function () {
                $(_self.input).val('');
                _self.calculateTotalDiscount(parseFloat(totaldiscount), '01');
            });
        },


        /**
         * 整单折扣
         */
        onTotalDiscountPercentage: function () {
            var _self = this;
            var totaldiscount = $(this.input).val();
            var totalamount = this.model.get('totalamount');
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if ((totaldiscount.split('.').length - 1) > 0 || totaldiscount > 100 || totaldiscount == '') {
                layer.msg('无效的整单折扣比率', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var rate = parseFloat(totaldiscount) / 100;
            this.evalAuth(auth_discount, '03', {discount_rate: rate}, function () {
                $(_self.input).val('');
                _self.calculateTotalDiscount(rate, '02');
            });
        },

        /**
         * 计算整单优惠
         */
        calculateTotalDiscount: function (rate, subType) {
            var data = {};
            var _self = this;
            data['skucode'] = '*';
            if (storage.isSet(system_config.VIP_KEY)) {
                data['cust_id'] = storage.get(system_config.VIP_KEY, 'cust_id');
                data['medium_id'] = storage.get(system_config.VIP_KEY, 'medium_id');
                data['medium_type'] = storage.get(system_config.VIP_KEY, 'medium_type');
            } else {
                data['cust_id'] = '*';
                data['medium_id'] = '*';
                data['medium_type'] = '*';
            }
            data['goods_detail'] = this.collection.toJSON();
            data['sub_type'] = subType;
            data['subtotal_preferential'] = rate;
            this.requestModel.sku(data, function (resp) {
                if (resp.status == '00') {
                    _self.onAddItem(resp.goods_detail);
                    _self.isTotalDiscount = true;
                    if (subType == '01') {
                        layer.msg('整单优惠成功!优惠金额：' + rate + '元', optLayerSuccess);
                    } else {
                        layer.msg('整单折扣成功!折扣比率：' + (rate * 10).toFixed(1) + '折', optLayerSuccess);
                    }
                } else {
                    layer.msg(resp.msg, optLayerWarning);
                }
            });
        },
        /**
         * 修改单品数量
         */
        modifyItemNum: function () {
            var index;
            if (this.cursor == this.Enum.ALWAYS_FOCUS_LAST) {
                index = this.i - 1;
            } else if (this.cursor == this.Enum.ALWAYS_FOCUS_FIRST) {
                index = this.i;
            }
            var number = $(this.input).val();
            var discountamount = this.model.get('discountamount');
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (discountamount != 0) {
                layer.msg('折扣后不能修改数量，如想继续修改数量，请取消交易', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (number == '' || number == 0 || (number.split('.').length - 1) > 1) {
                layer.msg('无效的商品数量', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var item = this.collection.at(index);
            var discount = item.get('discount');
            var price = item.get('price');
            item.set({
                num: parseFloat(number),
                money: price * number - discount
            });
            this.totalamount = 0;
            this.itemamount = 0;
            this.discountamount = 0;
            var priceList = this.collection.pluck('price');
            var discounts = this.collection.pluck('discount');
            var itemNum = this.collection.pluck('num');
            for (var i = 0; i < priceList.length; i++) {
                discounts[i] = parseFloat(discounts[i]);
                this.totalamount += priceList[i] * itemNum[i];
                this.itemamount += itemNum[i];
                this.discountamount += discounts[i] * itemNum[i];
            }
            this.calculateModel();
            $(this.input).val('');
            $('#li' + index).addClass('cus-selected');
        },
        /**
         * 单品删除
         */
        deleteItem: function () {
            try {
                if ($('li').hasClass('cus-selected')) {
                    console.log(this.i);
                    var item = this.collection.at(this.i - 1);
                    this.collection.remove(item);
                    this.renderCartList(this.Enum.ALWAYS_FOCUS_LAST);
                    this.calculateModel();
                }
                layer.msg('删除成功', optLayerSuccess);
            } catch (e) {
                layer.msg(e.name + ":" + e.message, optLayerError);
            }
        },
        /**
         * 添加商品
         */
        addItem: function () {
            var _self = this;
            var workerPosition = storage.get(system_config.LOGIN_USER_KEY, 'worker_position');// 当前登录的角色
            var contractCode = storage.get(system_config.LOGIN_USER_KEY, 'contract_code');// 当前营业员合同编码
            var skucode = $(this.input).val();
            if (skucode == '') {
                layer.msg('商品编码不能为空', optLayerWarning);
                return;
            }
            if (workerPosition != '02' && auth_store == 1) {
                var data = {
                    user_id: '',
                    skucode: skucode,
                    goods_detail: this.collection.toJSON()
                };
                this.requestModel.relateWorker(data, function (resp) {
                    if (!$.isEmptyObject(resp)) {
                        if (resp.status == '00') {
                            resp = _.extend(resp, {skucode: skucode});
                            _self.getGoods(resp);
                        } else if (resp.status == '99') {
                            console.log('resp status 99 -----------------');
                            _self.openLayerWorker();
                        } else {
                            console.log('>>>>>>>>>>>>>>>');
                            layer.msg(resp.msg, optLayerWarning);
                        }
                    } else {
                        layer.msg('系统错误，请联系管理员', optLayerError);
                    }
                });
            } else {
                var data = {
                    user_id: '',
                    skucode: skucode,
                    contract_code: contractCode
                };
                this.getGoods(data);
            }
        },

        openLayerWorker: function (data) {
            var attrs = {
                skucode: $(this.input).val(),
                goods_detail: this.collection.toJSON()
            };
            this.openLayer(PAGE_ID.LAYER_WORKER, pageId, '关联营业员', LayerWorkerView, attrs, {area: '300px'});
        },

        getGoods: function (respData) {
            var _self = this;
            var data = {};
            data['skucode'] = respData.skucode;
            respData.contract_code = undefined ? respData.contract_code : '';
            data['contract_code'] = respData.contract_code;
            if (storage.isSet(system_config.VIP_KEY)) {
                data['cust_id'] = storage.get(system_config.VIP_KEY, 'cust_id');
                data['medium_id'] = storage.get(system_config.VIP_KEY, 'medium_id');
                data['medium_type'] = storage.get(system_config.VIP_KEY, 'medium_type');
            } else {
                data['cust_id'] = '*';
                data['medium_id'] = '*';
                data['medium_type'] = '*';
            }
            data['goods_detail'] = this.collection.toJSON();
            data['subtotal_preferential'] = 1;//percentage默認值為1
            this.requestModel.sku(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        if (!_self.isInSale) {
                            _self.isInSale = true;
                            //_self.ctrlClientInfo('block', _self.ids, isPacked);
                        }
                        var temp = resp.goods_detail[resp.goods_detail.length - 1];
                        if (temp['price_auto'] == 1) {
                            var attrs = {
                                pageid: pageId,
                                originalprice: temp['price'],
                                is_navigate: false,
                                callback: function () {
                                    var price = $('input[name = price]').val();
                                    var len = resp.goods_detail.length;
                                    resp.goods_detail[len - 1].price = parseFloat(price);
                                    resp.goods_detail[len - 1].money = parseFloat(price);
                                    resp.goods_detail[len - 1].worker_id1 = respData.user_id;
                                    _self.onAddItem(resp.goods_detail);
                                    $('input[name = main]').focus();
                                }
                            };
                            _self.openLayer(PAGE_ID.LAYER_PRICE_ENTRY, pageId, '单价录入', LayerPriceEntryView, attrs, {area: '300px'});
                        } else {
                            _self.onAddItem(resp.goods_detail);
                        }
                    } else {
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            });
            $(this.input).val('');
            this.i = 0;
        },

        onAddItem: function (JSONData) {
            this.collection.set(JSONData, {merge: false});
            //this.updateClientCurItem(this.collection, isPacked);
            this.renderClientCart(this.collection, isPacked, isClientScreenShow);
            this.insertSerial();
            this.calculateModel();
            //this.buttonSelected();
        },
        clearCart: function () {
            this.collection.reset();
            this.model.set({
                totalamount: 0,
                itemamount: 0,
                discountamount: 0
            });
            this.memberModel.set({
                name: '未登录',
                score_balance: 0,
                account_balance: 0,
                account_enddate: '未登录，请查询'
            });
            //this.salesmanModel.set({
            //    salesman: '营业员登录'
            //});
            //this.buttonSelected();
            this.renderPosInfo();
            this.renderCartList(this.Enum.ALWAYS_FOCUS_LAST);
            this.renderMinfo();
            //this.renderSalesman();
            storage.remove(system_config.SALE_PAGE_KEY);
            storage.remove(system_config.VIP_KEY);
            //this.ctrlClientInfo('none', this.ids, isPacked);
            this.isInSale = false;
            this.isTotalDiscount = false;
            layer.msg('交易已取消', optLayerSuccess);
        },
        /**
         * 每次添加商品时，向新添加的商品插入serial属性值
         */
        insertSerial: function () {
            for (var i = 0; i < this.collection.length; i++) {
                this.collection.at(i).set({
                    serial: i + 1,
                    manager_id: '*'
                });
            }
        },
        /**
         * 购物车中商品变更后执行的通用方法，主要是在更新后collection中重新计算总计、件数和优惠
         */
        calculateModel: function () {
            this.newmodel = new HomeModel();
            this.totalamount = 0;
            this.itemamount = 0;
            this.discountamount = 0;
            var priceList = this.collection.pluck('price');
            var itemNum = this.collection.pluck('num');
            var discounts = this.collection.pluck('discount');
            for (var i = 0; i < this.collection.length; i++) {
                discounts[i] = discounts[i];
                this.totalamount += priceList[i] * itemNum[i];
                this.itemamount += itemNum[i];
                this.discountamount += discounts[i];
            }
            //this.updateClientSaleState(this.totalamount, this.itemamount, this.discountamount, isPacked);
            this.renderCartList(this.Enum.ALWAYS_FOCUS_LAST);
            this.updateShopInfo();
            storage.set(system_config.SALE_PAGE_KEY, 'shopcart', this.collection.toJSON());
            storage.set(system_config.SALE_PAGE_KEY, 'shopinfo', this.model.toJSON());
        },
        /**
         * 更新当前销售详情
         */
        updateShopInfo: function () {
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            //this.buttonSelected();
            this.renderPosInfo();
        },
        ///**
        // * 判断当前营业员是否有删除商品的权限
        // */
        //onDeleteKey: function () {
        //    for(var j = 0; j < this.deleteKey.length; j++){
        //        console.log(this.deleteKey[j]);
        //        if(this.deleteKey[j] == '02'){
        //            this.isDeleteKey = true;//判断当前是否有删除权限的key
        //            break;
        //        }else{
        //            this.isDeleteKey = false;
        //        }
        //    }
        //},
        openHelp: function () {
            //var tipsView = new KeyTipsView('MAIN_PAGE');
            //this.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
            var attrs = {
                page: 'MAIN_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },
        /**
         * 结算按钮点击事件
         */
        onBillingClicked: function () {
            this.doBilling();
        },
        /**
         * 营业员登录按钮点击事件
         */
        onSalesmanClicked: function () {
            this.doLoginSalesman();
        },
        /**
         * 会员登录按钮点击事件
         */
        onMemberClicked: function () {
            var attrs = {
                pageid: pageId
            }
            this.openLayer(PAGE_ID.LAYER_MEMBER, pageId, '会员登录', LayerMemberView, attrs, {area: '800px'});
        },
        /**
         * 单品优惠按钮点击事件
         */
        onDiscountClicked: function () {
            this.modifyItemDiscount();
        },
        /**
         * 删除按钮点击事件
         */
        onDeleteClicked: function () {
            var _self = this;
            var len = this.collection.length;
            if (len == 0) {
                layer.msg('没有可删除的商品', optLayerWarning);
                return;
            }
            this.evalAuth(auth_delete, '08', {}, function () {
                _self.deleteItem();
            });
        },
        /**
         * 修改数量点击事件
         */
        onModifyItemNum: function () {
            this.modifyItemNum();
        },
        /**
         *清空购物车按钮点击事件
         */
        onCleanClicked: function () {
            var _self = this;
            //if (this.model.get('itemamount') == 0) {
            //    layer.msg('当前购物车内无商品', optLayerWarning);
            //    $(this.input).val('');
            //    return;
            //}
            var attrs = {
                pageid: pageId,
                content: '确定取消交易？',
                is_navigate: false,
                callback: function () {
                    _self.isClearCartGranted();
                }
            };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirm, attrs, {area: '300px'});
        },

        isClearCartGranted: function () {
            var _self = this;
            this.evalAuth(auth_delete, '09', {}, function () {
                _self.clearCart();
            });
        },
        /**
         * 向上选择点击事件
         */
        onKeyUpClicked: function () {
            this.scrollUp();
        },
        /**
         * 向下选择点击事件
         */
        onKeyDownClicked: function () {
            this.scrollDown();
        },
        /**
         * 挂单按钮点击事件
         */
        onRestorderClicked: function () {
            this.restOrder();
        },
        /**
         * 解挂按钮点击事件
         */
        onUnRestOrderClicked: function () {
            this.releaseOrder();
        },
        /**
         * 原单退货按钮点击事件
         */
        onReturnWholeClicked: function () {
            router.navigate('returnwhole', {trigger: true});
        },
        /**
         * 单品退货按钮点击事件
         */
        onReturnForceClicked: function () {
            this.evalAuth(auth_return, '05', {}, function () {
                router.navigate('returnforce', {trigger: true});
            });
        },
        /**
         * 收银对账按钮点击事件
         */
        onCheckingClicked: function () {
            this.evalAuth(auth_report, '04', {}, function () {
                router.navigate('checking', {trigger: true});
            });
        },
        /**
         * 退出按钮点击事件
         */
        onLoginOutClicked: function () {
            this.doLogout();
        },
        onOKClicked: function () {
            this.addItem();
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
         * 更新客显区当前销售详情
         * @param totalamount
         * @param itemamount
         * @param discountamount
         */
        updateClientSaleState: function (totalamount, itemamount, discountamount, isPacked, isClientShow) {
            if (isPacked && isClientShow) {
                clientDom.getElementById("totalAmount").innerHTML = toDecimal2(totalamount);
                clientDom.getElementById("itemAmount").innerHTML = itemamount;
                clientDom.getElementById("totalDiscount").innerHTML = toDecimal2(discountamount);
            }
        },
        /**
         * 更新客显区当前商品信息
         * @param collection
         */
        updateClientCurItem: function (collection, isPacked, isClientShow) {
            if (isPacked && isClientShow) {
                var len = collection.length;
                var model = collection.at(len - 1).toJSON();
                var $clientDom = $(clientDom);
                this.renderClientCart();
                clientDom.getElementById("itemName").innerHTML = model.goods_name;
                clientDom.getElementById("itemSpec").innerHTML = model.spec;
                clientDom.getElementById("itemNum").innerHTML = model.num;
                clientDom.getElementById("itemDiscount").innerHTML = toDecimal2(model.discount);
                clientDom.getElementById("itemPrice").innerHTML = toDecimal2(model.price);
            }
        },
        /**
         * 挂单，解挂按钮选择
         */
        buttonSelected: function () {
            var itemamount = this.model.get("itemamount");
            if (itemamount != 0) {
                $('#restorder').css('display', 'block');
                $('#unrestorder').css('display', 'none');
            } else {
                $('#restorder').css('display', 'none');
                $('#unrestorder').css('display', 'block');
            }
        },
        onHConnectClicked: function () {
            router.navigate('hconnection', {trigger: true});
        },
        /**
         * 跳转打印页面
         */
        onPrintClicked: function () {
            this.evalAuth(auth_reprint, '', {}, function () {
                router.navigate('print', {trigger: true});
            });
        },

        /**
         * 跳转
         */
        onPayTableClicked: function () {
            router.navigate('paytable', {trigger: true});
        },

        /**
         * 提大额
         */
        onWithDrawClicked: function () {
            this.openLayer(PAGE_ID.LAYER_WITHDRAW, pageId, '提大额', LayerWithdrawView, undefined, {area: '300px'});
        },
        /**
         * 开钱箱
         */
        openCashDrawer: function () {
            var _self = this;
            this.evalAuth(auth_cashdrawer, '', {}, function () {
                _self.sendWebSocketDirective([DIRECTIVES.OpenCashDrawer], [''], wsClient);
            });
        },
        /**
         * 银行业务
         */
        onBusinessClicked: function () {
            var attrs = {
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_BANK_INSTRUCTION, pageId, '银行业务', LayerBInstructionView, attrs, {area: '300px'});
        },

        onSettingClicked: function () {
            storage.set(system_config.LAST_PAGE, pageId);
            router.navigate('setting', {trigger: true});
        },

        onMemberSigned: function (resp) {
            this.memberModel.set({
                name: resp.name,
                score_balance: resp.score_balance,
                account_balance: resp.account_balance,
                //account_enddate: resp.account_enddate
            });
            storage.set(system_config.VIP_KEY, resp);
            this.renderMinfo();
        },

        addClickedState: function () {
            $('.salesman-panel').mousedown(function () {
                $(this).addClass('clicked');
            });
            $('.salesman-panel').mouseup(function () {
                $(this).removeClass('clicked');
            });
            $('.salesman-panel').on('touchstart', function (e) {
                $(this).addClass('clicked');
            });
            $('.salesman-panel').on('touchend', function (e) {
                $(this).removeClass('clicked');
            });
        },

        onMainICMemberLogin: function (resp) {
            var _self = this;
            var attrs = {
                pageid: pageId,
                card_no: resp.cardno,
                callback: function (data) {
                    _self.onMemberSigned(data);
                }
            };
            this.openLayer(PAGE_ID.LAYER_ICMEMBER, pageId, '会员IC卡登录', LayerICMemberView, attrs, {area: '600px'});
        },

        initNotifySocket: function () {
            var _self = this;
            if (storage.isSet(system_config.POS_CONFIG)) {
                var isNotifySet = storage.get(system_config.POS_CONFIG, 'is_notity_set');
            } else {
                layer.msg('pos_config未获取', optLayerError);
            }
            //var isNotifySet = 1;
            console.log(isNotifySet);
            if (isNotifySet == 1) {
                if (!window.notifySocket) {
                    var addr = storage.get(system_config.POS_CONFIG, 'notify_url');
                    window.notifySocket = new Recwebsocket(addr);
                    window.notifySocket.onopen = function (e) {
                        layer.msg('通知服务已连接', optLayerSuccess);
                    };
                    window.notifySocket.onmessage = function (e) {
                        console.log(e);
                        var data = $.parseJSON(e.data);
                        if (data.status == '00') {
                            _self.marqueeModel.set({
                                notification_content: data.msg
                            });
                        } else {
                            layer.msg(data.msg, optLayerWarning);
                        }
                    };
                    window.notifySocket.onerror = function (e) {
                        console.log(e);
                    };
                    window.notifySocket.onclose = function (e) {
                        layer.msg('通知服务连接已断开', optLayerError);
                    };
                } else {
                    layer.msg('已有通知服务实例', optLayerSuccess);
                }
            } else {
                this.marqueeModel.set({
                    notification_content: '通知服务未开启'
                });
            }
        },

        onPasswdChangeClicked: function () {
            router.navigate('passwdchange', {trigger: true});
        },

        changePasswd: function () {
            var data = {
                user_id: storage.get(system_config.LOGIN_USER_KEY, 'user_id'),
                password: '6',
                new_password: '7'
            };
            console.log(data);
            this.model.password(data, function (resp) {
                console.log(typeof resp);
                if (resp.status == '00') {
                    layer.msg(resp.msg, optLayerSuccess);
                } else {
                    layer.msg(resp.msg, optLayerError);
                }
            });
        }

    });
    return mainView;
});