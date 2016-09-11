/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/main/model',
    '../../../../moduals/main/collection',
    '../../../../moduals/salesman/view',
    'text!../../../../moduals/main/posinfotpl.html',
    'text!../../../../moduals/main/salesmantpl.html',
    'text!../../../../moduals/main/cartlisttpl.html',
    'text!../../../../moduals/main/tpl.html',
], function (BaseView, HomeModel, HomeCollection, SalesmanView, posinfotpl,salesmantpl,cartlisttpl, tpl) {

    var mainView = BaseView.extend({

        id: "mainView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        template_posinfo:posinfotpl,

        template_salesman:salesmantpl,

        template_cartlisttpl:cartlisttpl,

        salesmanView:null,

        events: {

        },

        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.MAIN;
            console.log(pageId);
            var user = storage.get(system_config.LOGIN_USER_KEY);
            this.model = new HomeModel();
            this.collection = new HomeCollection();
            this.requestModel = new HomeModel();
            this.model.set({
                name:user.user_name,
                pos: '收款机(2341)',
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            if (this.salesmanView) {
                this.salesmanView.remove();
            } else {
                this.salesmanView = new SalesmanView();
            }
            if (storage.isSet(system_config.SALE_PAGE_KEY)) {
                _self.collection.set(storage.get(system_config.SALE_PAGE_KEY, 'shopcart'));
                _self.model.set(storage.get(system_config.SALE_PAGE_KEY, 'shopinfo'));
            }
            this.initTemplates();
            this.handleEvents();
        },

        initPlugins: function () {
            $('input[name = main]').focus();
            this.renderPosInfo();
            this.renderSalesman();
            this.renderCartList();
            this.initLayoutHeight();
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
            var dh = $(document).height();
            var nav = $('.navbar').height();
            var toolbar = $('.label-primary').height();
            cart = dh - nav - toolbar - 140;
            $('.for-cartlist').height(cart);
        },
        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        renderSalesman: function() {
            this.$el.find('.for-salesman').html(this.template_salesman(this.model.toJSON()));
        },

        renderCartList: function() {
            this.$el.find('.for-cartlist').html(this.template_cartlisttpl(this.collection.toJSON()));
        },

        handleEvents: function () {
            Backbone.off('SalesmanAdd');
            Backbone.on('SalesmanAdd',this.SalesmanAdd,this);
        },

        SalesmanAdd: function (attrData) {
            this.model = new HomeModel();
            this.model.set({
                salesman:attrData['name']
            });
            this.renderSalesman();
        },

        bindKeys: function () {
            var _self = this;
            this.request = new HomeModel();
            console.log('bindkeys main');
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Enter, function () {
                search = $('#input_main').val();
                if(search == ''){
                    toastr.warning('您输入的商品编码为空，请重新输入');
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
                    _self.request.sku(data , function(resp) {
                        if(resp.status == '00') {
                            _self.onAddItem(resp.goods_detail);
                        }else{
                            toastr.warning('您输入的商品编码不存在，请重新输入');
                        }
                    });
                    $('#input_main').val('');
                }
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.M, function () {
                console.log('main m');
                router.navigate('member',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.S, function () {
                _self.showModal(window.PAGE_ID.SALESMAN,_self.salesmanView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = salesman_id]').focus();
                });
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.Esc,function () {
                toastr.info('退出');
            });
            this.bindKeyEvents(window.PAGE_ID.MAIN, window.KEYS.B,function () {
                router.navigate('billing',{trigger:true});
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