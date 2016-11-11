/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/main/model',
    '../../../../moduals/main/collection',
    '../../../../moduals/modal-salesman/view',
    '../../../../moduals/modal-logout/view',
    '../../../../moduals/modal-billingdiscount/view',
    '../../../../moduals/keytips-member/view',
    '../../../../moduals/modal-confirm/view',
    '../../../../moduals/modal-login/view',
    '../../../../moduals/modal-restorder/view',
    'text!../../../../moduals/main/posinfotpl.html',
    'text!../../../../moduals/main/salesmantpl.html',
    'text!../../../../moduals/main/cartlisttpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/main/tpl.html',
], function (BaseView, HomeModel, HomeCollection, SalesmanView, LogoutView,BilldiscountView, KeyTipsView, ConfirmView, SecondLoginView, RestOrderView, posinfotpl, salesmantpl, cartlisttpl, numpadtpl, tpl) {

    var mainView = BaseView.extend({

        id: "mainView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        salesman:'',

        memeber:'',

        i: 0,

        template_posinfo:posinfotpl,

        template_salesman:salesmantpl,

        template_cartlisttpl:cartlisttpl,

        template_numpad:numpadtpl,

        salesmanView:null,

        secondloginView:null,

        restOrderDelivery: {},

        deleteKey:{},

        isDeleteKey:false,

        isDiscountPercent:false,

        input:'input[name = main]',

        events: {
            'click .numpad-ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .main-help':'openHelp',
            'click .h-connect':'onHConnectClicked',
            'click .main-billing':'onBillingClicked',
            'click .salesman':'onSalesmanClicked',
            'click .member':'onMemberClicked',
            'click .main-discount':'onDiscountClicked',
            'click .main-discountpercent':'onDiscountPercentClicked',
            'click .main-delete':'onDeleteClicked',
            'click .main-modify-num':'onModifyItemNum',
            'click .main-cancel':'onCleanClicked',
            'click .main-keyup':'onKeyUpClicked',
            'click .main-keydown':'onKeyDownClicked',
            'click #restorder':'onRestorderClicked',
            'click #unrestorder':'onUnRestOrderClicked',
            'click .return-whole':'onReturnWholeClicked',
            'click .return-force':'onReturnForceClicked',
            'click .checking':'onCheckingClicked',
            'click .login-out':'onLoginOutClicked',
            'click .print':'onPrintClicked'//打印页面
            //'click .btn-floatpad':'onFloatPadClicked'
        },

        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.MAIN;
            //console.log(pageId);
            var user = storage.get(system_config.LOGIN_USER_KEY);  // 从本地取出登录用户属性
            this.model = new HomeModel();  // 当前view的model
            this.loginInfoModel = new HomeModel();  // 存放登录用户及营业员信息的model
            this.collection = new HomeCollection();  //当前view的collection
            //this.logincollection = new HomeCollection();
            this.requestModel = new HomeModel();  //网络请求的model
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            this.loginInfoModel.set({
                name:user.user_name,
                pos: '收款机(2341)'
            });
            if (storage.isSet(system_config.SALE_PAGE_KEY)) {
                this.collection.set(storage.get(system_config.SALE_PAGE_KEY, 'shopcart'));
                this.model.set(storage.get(system_config.SALE_PAGE_KEY, 'shopinfo'));
            }
            if (storage.isSet(system_config.SALE_PAGE_KEY,'salesman')) {
                this.loginInfoModel.set({
                    salesman:storage.get(system_config.SALE_PAGE_KEY,'salesman')
                });
            } else {
                this.loginInfoModel.set({
                    salesman:'未登录'
                });
            }
            if (storage.isSet(system_config.VIP_KEY)) {
                this.loginInfoModel.set({
                    member:storage.get(system_config.VIP_KEY,'name')
                });
            } else {
                this.loginInfoModel.set({
                    member:'未登录'
                });
            }
            if (storage.isSet(system_config.LOGIN_USER_KEY)){
                this.deleteKey = _.pluck(storage.get(system_config.LOGIN_USER_KEY,'worker_position'), 'key');
            }
            //if (storage.isSet(system_config.PRINTF)) {
            //    var message = DIRECTIVES.PRINTTEXT + storage.get(system_config.PRINTF);
            //    console.log(message);
            //    window.wsClient.send(message);
            //    window.wsClient.send(DIRECTIVES.OpenCashDrawer)
            //}
            this.onDeleteKey();
            this.initTemplates();
            this.handleEvents();
        },

        initPlugins: function () {
            $(this.input).focus();
            $('.for-cartlist').perfectScrollbar();  // 定制滚动条外观
            this.renderPosInfo();
            this.renderSalesman();
            this.renderCartList();
            this.buttonSelected();
            this.$el.find('.for-numpad').html(this.template_numpad);
        },

        initTemplates: function () {
            this.template_posinfo = _.template(this.template_posinfo);
            this.template_salesman = _.template(this.template_salesman);
            this.template_cartlisttpl = _.template(this.template_cartlisttpl);
            //this.template_cart = _.template(this.template_cart);
            //this.template_shopitem = _.template(this.template_shopitem);
        },

        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(window).height();
            var dw = $(window).width();
            var nav = $('.navbar').height();  // 导航栏高度
            var panelheading = $('.panel-heading').height();  //面板heading高度
            var panelfooter = $('.panel-footer').height();  //面板footer高度
            var cart = dh - nav * 2 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);  // 设置购物车面板的宽度
            $('.for-cartlist').height(cart);  //设置购物车的高度
            this.listheight = $('.for-cartlist').height();//购物车列表的高度
            this.listnum = 6;//设置商品列表中的条目数
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
        },
        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        renderSalesman: function() {
            this.$el.find('.for-salesman').html(this.template_salesman(this.loginInfoModel.toJSON()));
            return this;
        },

        renderCartList: function() {
            this.$el.find('.for-cartlist').html(this.template_cartlisttpl(this.collection.toJSON()));
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },

        handleEvents: function () {
            // 注册backbone事件
            Backbone.off('SalesmanAdd');
            Backbone.off('onReleaseOrder');
            Backbone.off('reBindEvent');
            Backbone.on('SalesmanAdd',this.SalesmanAdd,this);
            Backbone.on('onReleaseOrder',this.onReleaseOrder,this);
        },

        SalesmanAdd: function (attrData) {
            storage.set(system_config.SALE_PAGE_KEY,'salesman',attrData['name']);
            this.loginInfoModel.set({
                salesman:attrData['name']
            });
            this.renderSalesman();
        },

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
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.M, function () {
                router.navigate('member',{trigger:true});
            });
            //挂单
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.G, function () {
                _self.restOrder();
            });
            //解挂
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.J, function() {
                _self.releaseOrder();
            });
            //营业员登陆
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.S, function () {
               _self.doLoginSalesman();
            });
            //退出登录
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Esc,function () {
                _self.doLogout();
            });
            //结算
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.B,function () {
                _self.doBilling();
            });
            //清空购物车
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.C, function() {
                var confirmView = new ConfirmView({
                    pageid: window.PAGE_ID.MAIN, //当前打开confirm模态框的页面id
                    callback: function () { //点击确认键的回调
                        _self.clearCart();
                    },
                    content:'确定取消交易？' //confirm模态框的提示内容
                });
                _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
            });
            //删除商品
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.D,function () {
                if(_self.isDeleteKey){
                    _self.deleteItem();
                }else{
                    var secondLoginView = new SecondLoginView({
                        pageid: window.PAGE_ID.MAIN,
                        callback: function () {
                            _self.deleteItem();
                        }
                    });
                    _self.showModal(window.PAGE_ID.SECONDLOGIN, secondLoginView);
                }

            });
            //修改数量
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.N,function () {
                _self.modifyItemNum();
            });
            //单品优惠
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Y,function () {
                _self.modifyItemDiscount();
            });

            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Down, function () {
                _self.scrollDown();
            });

            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Up, function () {
                _self.scrollUp();
            });
            //强制退货
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.F, function () {
                router.navigate('returnforce',{ trigger:true });
            });
            //整单退货
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.W, function () {
                router.navigate('returnwhole',{ trigger:true });
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.T, function () {
                _self.openHelp();
            });
            //收银对账
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.A, function () {
                router.navigate('checking',{trigger:true});
            });
            //折让
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.U, function () {
                _self.onDiscountPercentClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.H, function() {
                router.navigate('print', {trigger:true});
            });

            //this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.O,function () {
            //    var secondLoginView = new SecondLoginView({
            //        pageid: window.PAGE_ID.MAIN,
            //        callback: function () {
            //           console.log('hehe');
            //        }
            //    });
            //    _self.showModal(window.PAGE_ID.SECONDLOGIN, secondLoginView);
            //
            //});
        },

        /**
         * 账户登出
         */
        doLogout: function () {
            var logoutView = new LogoutView();
            this.showModal(window.PAGE_ID.LOGOUT, logoutView);
            $('.modal').on('shown.bs.modal', function () {
                $('input[name = logout_username]').focus();
            });
        },

        /**
         * 结算
         */
        doBilling: function () {
            //console.log(_self.model.get('itemamount'));
            if(this.model.get('itemamount') == 0){
                toastr.warning('购物车内无商品，请先选择一些商品吧');
            } else {
                router.navigate('billing',{trigger:true});
            }
        },

        /**
         * 营业员登录
         */
        doLoginSalesman: function () {
            var salesmanView = new SalesmanView();
            this.showModal(window.PAGE_ID.SALESMAN, salesmanView);
            $('.modal').on('shown.bs.modal',function(e) {
                $('input[name = salesman_id]').focus();
            });
        },

        /**
         * 购物车光标向下
         */
        scrollDown: function () {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.collection.length / this.listnum)) {
                this.n++;
                //alert(_self.n);
                $('.for-cartlist').scrollTop(this.listheight * this.n);
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        /**
         * 购物车光标向上
         */
        scrollUp: function () {
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i+1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                //alert(_self.n);
                $('.for-cartlist').scrollTop(this.listheight * this.n );
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        /**
         * 解挂
         */
        releaseOrder: function () {
            var itemamount = this.model.get('itemamount');
            if(itemamount != 0){
                toastr.warning('购物车内有商品，不能执行解挂操作');
            }else {
                //router.navigate('restorder',{trigger:true});
                var restOrderView = new RestOrderView();
                this.showModal(window.PAGE_ID.MODAL_RESTORDER, restOrderView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = restorder]').focus();
                });
            }
        },

        /**
         * 挂单
         */
        restOrder: function () {
            var itemamount = this.model.get('itemamount');
            if (itemamount == 0) {
                toastr.warning('当前购物车内无商品，无法执行挂单操作');
            }else {
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
                console.log(orderNumFromStorage);
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
                this.renderCartList();
                this.buttonSelected();
                storage.remove(system_config.SALE_PAGE_KEY);
                toastr.success('挂单号：' + orderNum);
            }
        },

        //切换优惠模式
        onDiscountPercentClicked: function () {
            if (this.isDiscountPercent) {
                this.isDiscountPercent = false;
                $('#main-input').removeClass('input-group');
                $('#input-percent').hide();
            } else {
                this.isDiscountPercent = true;
                $('#main-input').addClass('input-group');
                $('#input-percent').show();
            }
        },

        /**
         * 修改单品数量
         */
        modifyItemNum: function () {
            var _self = this;
            var number = $('#input_main').val();
            if(_self.model.get('itemamount') == 0){
                toastr.warning('当前购物车内无商品');
            }else {
                if(number == ''){
                    toastr.warning('修改的数量不能为空，请重新输入');
                }else if(number == 0) {
                    toastr.warning('修改的数量不能为零，请重新输入');
                }else {
                    var item = _self.collection.at(_self.i);
                    item.set({
                        num: parseFloat(number)
                    });
                    console.log(_self.collection);
                    _self.totalamount = 0;
                    _self.itemamount = 0;
                    _self.discountamount = 0;
                    var priceList = _self.collection.pluck('price');
                    var discounts = _self.collection.pluck('discount');
                    var itemNum = _self.collection.pluck('num');
                    for (var i = 0; i < priceList.length; i++) {
                        discounts[i] = parseFloat(discounts[i]);
                        _self.totalamount += priceList[i] * itemNum[i];
                        _self.itemamount += itemNum[i];
                        _self.discountamount += discounts[i] * itemNum[i];
                    }
                    _self.calculateModel();
                }
            }
            $('#input_main').val('');
            console.log(_self.i);
            $('#li' + _self.i).addClass('cus-selected');
        },

        /**
         * 单品优惠
         */
        modifyItemDiscount: function () {
            var _self = this;
            var value = $('#input_main').val();
            if(_self.model.get('itemamount') == 0){
                toastr.warning('当前购物车内无商品');
            }else{
                if(this.isDiscountPercent) {
                    if (value == '') {
                        toastr.warning('输入的折扣不能为空');
                    } else if (value >= 100) {
                        toastr.warning('折扣比率不能大于100%');
                    } else {
                        var rate = value/100;
                        var item = _self.collection.at(_self.i);
                        var price = item.get('price');
                        _self.collection.at(_self.i).set({
                            discount:price*(1-rate)
                        }) ;
                        _self.calculateModel();
                        $('#li' + _self.i).addClass('cus-selected');
                    }
                } else {
                    if(value == '') {
                        toastr.warning('输入的优惠金额不能为空，请重新输入');
                    }else{
                        var item = _self.collection.at(_self.i);
                        var price = item.get('price');
                        if (value <= parseFloat(price) ) {
                            _self.collection.at(_self.i).set({
                                discount: value
                            });
                            _self.calculateModel();
                            $('#li' + _self.i).addClass('cus-selected');

                        }else {
                            toastr.warning('优惠金额不能大于单品金额,请重新选择优惠金额');
                        }
                    }
                }
            }
            $('#input_main').val('');
        },

        /**
         * 单品删除
         */
        deleteItem: function () {
            if($('li').hasClass('cus-selected')){
                var item = this.collection.at(this.i);
                this.collection.remove(item);
                this.i = 0;
                this.renderCartList();
                this.calculateModel();
            }
            toastr.success('删除成功');
        },

        /**
         * 添加商品
         */
        addItem: function () {
            var _self = this;
            var search = $('#input_main').val();
            if(search == ''){
                toastr.info('您输入的商品编码为空，请重新输入');
            }else{
                var data = {};
                data['skucode'] = search;
                if(storage.isSet(system_config.VIP_KEY)) {
                    data['cust_id'] = storage.get(system_config.VIP_KEY,'cust_id');
                    data['medium_id'] = storage.get(system_config.VIP_KEY,'medium_id');
                    data['medium_type'] = storage.get(system_config.VIP_KEY,'medium_type');
                }else{
                    data['cust_id'] = '*';
                    data['medium_id'] = '*';
                    data['medium_type'] = '*';
                }
                data['goods_detail'] = JSON.stringify(this.collection);
                this.requestModel.sku(data , function(resp) {
                    if(resp.status == '00') {
                        _self.onAddItem(resp.goods_detail);
                    }else{
                        toastr.warning(resp.msg);
                    }
                });
                $('#input_main').val('');
                this.i = 0;
            }
        },

        onAddItem: function (JSONData) {
            this.collection.set(JSONData, {merge: false});
            this.insertSerial();
            this.calculateModel();
            this.buttonSelected();
        },

        clearCart: function () {
            this.collection.reset();
            this.model.set({
                totalamount: 0,
                itemamount: 0,
                discountamount: 0
            });
            this.buttonSelected();
            this.renderPosInfo();
            this.renderCartList();
            storage.remove(system_config.SALE_PAGE_KEY);
            toastr.success('交易已取消');
        },

        /**
         * 每次添加商品时，向新添加的商品插入serial属性值
         */
        insertSerial: function () {
            for (var i = 0; i < this.collection.length; i++) {
                this.collection.at(i).set({
                    serial: i + 1
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
                discounts[i] = parseFloat(discounts[i]);
                this.totalamount += priceList[i] * itemNum[i];
                this.itemamount += itemNum[i];
                this.discountamount += discounts[i];
            }
            this.renderCartList();
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
            this.buttonSelected();
            this.renderPosInfo();
        },
        /**
         * 判断当前营业员是否有删除商品的权限
         */
        onDeleteKey: function () {
            for(var j = 0; j < this.deleteKey.length; j++){
                console.log(this.deleteKey[j]);
                if(this.deleteKey[j] == '02'){
                    this.isDeleteKey = true;//判断当前是否有删除权限的key
                    break;
                }else{
                    this.isDeleteKey = false;
                }
            }
        },

        openHelp: function () {
            var tipsView = new KeyTipsView('MAIN_PAGE');
            this.showModal(window.PAGE_ID.TIP_MEMBER, tipsView);
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
        onMemberClicked:function () {
            router.navigate('member',{trigger:true});
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
            if(this.isDeleteKey){
                this.deleteItem();
            }else{
                var secondLoginView = new SecondLoginView({
                    pageid: window.PAGE_ID.MAIN,
                    callback: function () {
                        this.deleteItem();
                    }
                });
                this.showModal(window.PAGE_ID.SECONDLOGIN, secondLoginView);
            }
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
            var confirmView = new ConfirmView({
                pageid: window.PAGE_ID.MAIN, //当前打开confirm模态框的页面id
                callback: function () { //点击确认键的回调
                    _self.clearCart();
                },
                content:'确定取消交易？' //confirm模态框的提示内容
            });
            _self.showModal(window.PAGE_ID.CONFIRM, confirmView);
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
        onUnRestOrderClicked: function() {
            this.releaseOrder();
        },

        /**
         * 整单退货按钮点击事件
         */
        onReturnWholeClicked: function () {
            router.navigate('returnwhole',{ trigger:true });
        },

        /**
         * 强制退货按钮点击事件
         */
        onReturnForceClicked: function () {
            router.navigate('returnforce',{ trigger:true });
        },

        /**
         * 收银对账按钮点击事件
         */
        onCheckingClicked: function () {
            router.navigate('checking',{trigger:true});
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
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        //onFloatPadClicked: function () {
        //    var isDisplay = $('.float-numpad').css('display') == 'none';
        //    if (isDisplay) {
        //        $('.float-numpad').css('display','block');
        //        $('.btn-floatpad').text('关闭小键盘')
        //    } else {
        //        $('.float-numpad').css('display','none');
        //        $('.btn-floatpad').text('开启小键盘')
        //    }
        //},

        /**
         * 挂单，解挂按钮选择
         */
        buttonSelected: function () {
            var itemamount = this.model.get("itemamount");
            if (itemamount != 0) {
                $('#restorder').css('display', 'block');
                $('#unrestorder').css('display', 'none');
            }else {
                $('#restorder').css('display','none');
                $('#unrestorder').css('display','block');
            }
        },

        onHConnectClicked: function () {
            router.navigate('hconnection',{ trigger:true });
        },

        /**
         * 跳转打印页面
         */
        onPrintClicked: function () {
            router.navigate('print', {trigger:true});
        }

    });

    return mainView;

});