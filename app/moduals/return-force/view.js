/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/return-force/model',
    '../../../../moduals/return-force/collection',
    'text!../../../../moduals/return-force/posinfotpl.html',
    'text!../../../../moduals/return-force/cartlisttpl.html',
    'text!../../../../moduals/return-force/tpl.html',
], function (BaseView, ReturnForceModel, ReturnForceCollection, posinfotpl,cartlisttpl, tpl) {

    var returnForceView = BaseView.extend({

        id: "returnForceView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        i: 0,

        template_posinfo:posinfotpl,

        template_cartlisttpl:cartlisttpl,


        events: {

        },

        pageInit: function () {
            var _self = this;
            pageId = window.PAGE_ID.RETURN_FORCE;
            var user = storage.get(system_config.LOGIN_USER_KEY);
            this.model = new ReturnForceModel();
            this.collection = new ReturnForceCollection();
            this.requestModel = new ReturnForceModel();
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            if (storage.isSet(system_config.FORCE_RETURN_KEY)) {
                _self.collection.set(storage.get(system_config.FORCE_RETURN_KEY,'cartlist'));
                _self.model.set(storage.get(system_config.FORCE_RETURN_KEY,'panel'));
            }
            this.initTemplates();
        },

        initPlugins: function () {
            var _self = this;
            $('input[name = main]').focus();
            this.renderPosInfo();
            this.renderCartList();
            //this.initLayoutHeight();
            $('#li' + _self.i).addClass('cus-selected');
        },

        initTemplates: function () {
            this.template_posinfo = _.template(this.template_posinfo);
            this.template_cartlisttpl = _.template(this.template_cartlisttpl);
        },
        /**
         * 初始化layout中各个view的高度
         */
        initLayoutHeight: function () {
            var dh = $(document).height();
            var nav = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            cart = dh - nav * 2 - panelheading * 2;
            $('.for-cartlist').height(cart);
        },
        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        renderCartList: function() {
            this.$el.find('.for-cartlist').html(this.template_cartlisttpl(this.collection.toJSON()));
            return this;
        },


        bindKeys: function () {
            var _self = this;
            console.log('bindkeys main');
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Enter, function () {
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


            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Esc,function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.B,function () {
                isfromForce = true;
                router.navigate('billingreturn',{trigger:true});
            });
            //清空购物车
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.C, function() {
                _self.collection.reset();
                _self.model.set({
                    totalamount: 0,
                    itemamount: 0,
                    discountamount: 0
                });
                _self.renderPosInfo();
                _self.renderCartList();
                storage.remove(system_config.FORCE_RETURN_KEY);
                toastr.success('清空购物车成功');
            });
            //删除商品
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.D,function () {
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
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.N,function () {
                var number = $('#input_main').val();
                if(number == ''){
                    toastr.warning('您未输入任何数量，请重新输入');
                }else if (number == 0) {
                    toastr.warning('输入的数量不能为零，请重新输入');
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
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Y,function () {
                var value = $('#input_main').val();
                if(value == '') {
                    toastr.warning('您输入的优惠金额为零，请重新输入');
                }else {
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
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Down, function () {
                if (_self.i < _self.collection.length - 1) {
                    _self.i++;
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Up, function () {
                if (_self.i > 0) {
                    _self.i--;
                }
                $('#li' + _self.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            });
            this.bindKeyEvents()
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
            storage.set(system_config.FORCE_RETURN_KEY, 'cartlist', this.collection.toJSON());
            storage.set(system_config.FORCE_RETURN_KEY, 'panel', this.model.toJSON());

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

    return returnForceView;
});