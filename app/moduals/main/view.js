/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/main/model',
    '../../../../moduals/main/collection',
    '../../../../moduals/modal-salesman/view',
    '../../../../moduals/modal-login/view',
    '../../../../moduals/modal-logout/view',
    '../../../../moduals/modal-billingdiscount/view',
    '../../../../moduals/keytips-member/view',
    'text!../../../../moduals/main/posinfotpl.html',
    'text!../../../../moduals/main/salesmantpl.html',
    'text!../../../../moduals/main/cartlisttpl.html',
    'text!../../../../moduals/main/tpl.html',
], function (BaseView, HomeModel, HomeCollection, SalesmanView,SecondloginView, LogoutView,BilldiscountView, KeyTipsView, posinfotpl,salesmantpl,cartlisttpl, tpl) {

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

        salesmanView:null,

        secondloginView:null,

        restOrderDelivery: {},

        events: {

        },

        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.MAIN;
            console.log(pageId);
            var user = storage.get(system_config.LOGIN_USER_KEY);
            this.model = new HomeModel();
            this.salesmanModel = new HomeModel();
            this.collection = new HomeCollection();
            this.requestModel = new HomeModel();
            this.model.set({
                name:user.user_name,
                pos: '收款机(2341)',
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            //if (this.salesmanView) {
            //    this.salesmanView.remove();
            //} else {
            //    console.log('new salesmanview');
            //    this.salesmanView = new SalesmanView();
            //}
            if (storage.isSet(system_config.SALE_PAGE_KEY)) {
                _self.collection.set(storage.get(system_config.SALE_PAGE_KEY, 'shopcart'));
                _self.model.set(storage.get(system_config.SALE_PAGE_KEY, 'shopinfo'));
            }
            if(storage.isSet(system_config.SALE_PAGE_KEY,'salesman')) {
                _self.salesmanModel.set({
                    salesman:storage.get(system_config.SALE_PAGE_KEY,'salesman')
                });
            }else {
                _self.salesmanModel.set({
                    salesman:'未登录'
                });
            }
            if(storage.isSet(system_config.VIP_KEY)) {
                _self.salesmanModel.set({
                    member:storage.get(system_config.VIP_KEY,'name')
                });
            }else {
                _self.salesmanModel.set({
                    member:'未登录'
                });
            }

            this.initTemplates();
            this.handleEvents();
        },

        initPlugins: function () {
            var _self = this;
            $('input[name = main]').focus();
            this.renderPosInfo();
            this.renderSalesman();
            this.renderCartList();
            //this.initLayoutHeight();
            $('#li' + _self.i).addClass('cus-selected');
            $('.modal').on('hidden.bs.modal', function () {
                alert('bindkeys');
                _self.bindKeys();
            });
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
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var cart = dh - nav * 2 - panelheading * 2;
            $('.for-cartlist').height(cart);
        },
        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        renderSalesman: function() {
            this.$el.find('.for-salesman').html(this.template_salesman(this.salesmanModel.toJSON()));
            return this;
        },

        renderCartList: function() {
            this.$el.find('.for-cartlist').html(this.template_cartlisttpl(this.collection.toJSON()));
            return this;
        },

        handleEvents: function () {
            Backbone.off('SalesmanAdd');
            Backbone.off('onReleaseOrder');
            Backbone.off('reBindEvent');
            Backbone.on('SalesmanAdd',this.SalesmanAdd,this);
            Backbone.on('onReleaseOrder',this.onReleaseOrder,this);
        },

        SalesmanAdd: function (attrData) {
            storage.set(system_config.SALE_PAGE_KEY,'salesman',attrData['name']);
            this.salesmanModel.set({
                salesman:attrData['name']
            });
            this.renderSalesman();
        },

        onReleaseOrder: function (data) {
            console.log(data);
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
                search = $('#input_main').val();
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
                    data['goods_detail'] = JSON.stringify(_self.collection);
                    _self.requestModel.sku(data , function(resp) {
                        if(resp.status == '00') {
                            _self.onAddItem(resp.goods_detail);
                        }else{
                            toastr.warning(resp.msg);
                        }
                    });
                    $('#input_main').val('');
                    _self.i = 0;
                }
            });

            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.M, function () {
                router.navigate('member',{trigger:true});
            });
            //挂单
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.G, function () {
                var itemamount = _self.model.get('itemamount');
                if (itemamount == 0) {
                   toastr.warning('当前购物车内无商品，无法执行挂单操作');
                }else {
                    var orderNum = new Date().getTime();
                    if (storage.isSet(system_config.RESTORDER_KEY)) {
                        var pre = storage.get(system_config.RESTORDER_KEY);
                        pre[orderNum] = _self.collection.toJSON();
                        storage.set(system_config.RESTORDER_KEY, pre);
                    } else {
                        _self.restOrderDelivery[orderNum] = _self.collection.toJSON();
                        storage.set(system_config.RESTORDER_KEY, _self.restOrderDelivery);
                    }
                    _self.model.set({
                        itemamount: 0,
                        totalamount: 0,
                        discountamount: 0
                    });
                    _self.collection.reset();
                    _self.renderPosInfo();
                    _self.renderCartList();
                    storage.remove(system_config.SALE_PAGE_KEY);
                    toastr.success('挂单成功');
                }
            });
            //解挂
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.J, function() {
                var itemamount = _self.model.get('itemamount');
                if(itemamount != 0){
                    toastr.warning('购物车内有商品，不能执行解挂操作');
                }else {
                    router.navigate('restorder',{trigger:true});
                }
            });
            //营业员登陆
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.S, function () {
                this.salesmanView = new SalesmanView();
                _self.showModal(window.PAGE_ID.SALESMAN,_self.salesmanView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = salesman_id]').focus();
                });
            });
            //退出登录
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Esc,function () {
                var logoutView = new LogoutView();
                _self.showModal(window.PAGE_ID.LOGOUT, logoutView);
                $('.modal').on('shown.bs.modal', function () {
                    $('input[name = logout_username]').focus();
                });
            });
            //结算
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.B,function () {
                console.log(_self.model.get('itemamount'));
                if(_self.model.get('itemamount') == 0){
                    toastr.warning('购物车内无商品，请先选择一些商品吧');
                } else {
                    router.navigate('billing',{trigger:true});
                }
            });
            //清空购物车
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.C, function() {
                _self.collection.reset();
                _self.model.set({
                    totalamount: 0,
                    itemamount: 0,
                    discountamount: 0
                });
                _self.renderPosInfo();
                _self.renderCartList();
                storage.remove(system_config.SALE_PAGE_KEY);
                toastr.success('清空购物车成功');
            });
            //删除商品
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.D,function () {
                if($('li').hasClass('cus-selected')){
                    console.log(_self.i);
                    console.log(_self.collection);
                    var item = _self.collection.at(_self.i);
                    _self.collection.remove(item);
                    _self.renderCartList();
                    console.log(_self.collection);
                    _self.calculateModel();
                }
                toastr.success('删除成功');
            });
            //修改数量
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.N,function () {
                var number = $('#input_main').val();
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
                $('#input_main').val('');
                console.log(_self.i);
                $('#li' + _self.i).addClass('cus-selected');
            });
            //单品优惠
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Y,function () {
                var value = $('#input_main').val();
                if(value == '') {
                    toastr.warning('输入的优惠金额不能为空，请重新输入');
                }else if(value == 0){
                    toastr.warning('输入的优惠金额不能为零，请重新输入');
                } else{
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
                $('#input_main').val('');
            });

            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Down, function () {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });

            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Up, function () {
                if (_self.i > 0) {
                    _self.i--;
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
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
                var tipsView = new KeyTipsView('MAIN_PAGE');
                _self.showModal(window.PAGE_ID.TIP_MEMBER,tipsView);
            });
        },

        onAddItem: function (JSONData) {
            this.collection.set(JSONData, {merge: false});
            this.insertSerial();
            this.calculateModel();
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
            this.renderPosInfo();
        },

    });

    return mainView;
});