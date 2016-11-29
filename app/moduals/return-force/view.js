/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/return-force/model',
    '../../../../moduals/return-force/collection',
    '../../../../moduals/layer-help/view',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-priceentry/view',
    'text!../../../../moduals/return-force/posinfotpl.html',
    'text!../../../../moduals/return-force/cartlisttpl.html',
    'text!../../../../moduals/return-force/numpadtpl.html',
    'text!../../../../moduals/return-force/tpl.html',
], function (BaseView, ReturnForceModel, ReturnForceCollection, LayerHelpView, LayerConfirmView, LayerPriceEntryView, posinfotpl, cartlisttpl, numpadtpl, tpl) {

    var returnForceView = BaseView.extend({

        id: "returnForceView",

        el: '.views',

        template: tpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        i: 0,

        isDeleteKey: false,

        deleteKey: {},

        input: 'input[name = sku_id]',

        template_posinfo: posinfotpl,

        template_cartlisttpl: cartlisttpl,

        template_numpad: numpadtpl,


        events: {
            'click .numpad-ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .rt-billing': 'onBillingClicked',
            'click .rt-cancel': 'onCancelClicked',
            'click .rt-discount': 'onDiscountClicked',
            'click .rt-delete': 'onDeleteClicked',
            'click .rt-modify-num': 'onModifyNumClicked',
            'click .rt-keyup': 'onKeyUpClicked',
            'click .rt-keydown': 'onKeyDownClicked',
            'click .rt-help': 'onHelpClicked',
            'click .rt-return': 'onReturnClicked',
            'click .rt-discountpercent': 'onDiscountPercentClicked'
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
                _self.collection.set(storage.get(system_config.FORCE_RETURN_KEY, 'cartlist'));
                _self.model.set(storage.get(system_config.FORCE_RETURN_KEY, 'panel'));
            }
            if (storage.isSet(system_config.LOGIN_USER_KEY)) {
                this.deleteKey = _.pluck(storage.get(system_config.LOGIN_USER_KEY, 'worker_position'), 'key');
            }
            this.initTemplates();
        },

        initPlugins: function () {
            $(this.input).focus();
            $('.for-cartlist').perfectScrollbar();
            this.$el.find('.for-numpad').html(this.template_numpad);
            this.renderPosInfo();
            this.renderCartList();
        },

        initTemplates: function () {
            this.template_posinfo = _.template(this.template_posinfo);
            this.template_cartlisttpl = _.template(this.template_cartlisttpl);
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
            var cart = dh - nav * 2 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            $('.for-cartlist').height(cart);
            this.listheight = $('.for-cartlist').height();//购物车列表的高度
            this.listnum = 6;//设置商品列表中的条目数
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
        },
        renderPosInfo: function () {
            this.$el.find('.for-posinfo').html(this.template_posinfo(this.model.toJSON()));
            return this;
        },

        renderCartList: function () {
            this.$el.find('.for-cartlist').html(this.template_cartlisttpl(this.collection.toJSON()));
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },


        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Enter, function () {
                _self.onOKClicked();
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Esc, function () {
                router.navigate('main', {trigger: true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Space, function () {
                _self.doBilling();
            });
            //取消退货
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.C, function () {
                _self.cancelForceReturn();
            });
            //删除商品
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.D, function () {
                _self.onDeleteClicked();
            });
            //修改数量
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.F12, function () {
                _self.modifyItemNum();
            });
            //单品优惠
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.F1, function () {
                _self.modifyItemDiscount();
            });
            //单品折扣
            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.F2, function () {
                _self.onDiscountPercentClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Down, function () {
                _self.scrollDown();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.Up, function () {
                _self.scrollUp();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_FORCE, window.KEYS.T, function () {
                _self.onHelpClicked();
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
            if ((this.i + 1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                //alert(_self.n);
                $('.for-cartlist').scrollTop(this.listheight * this.n);
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 单品删除
         */
        deleteItem: function () {
            if ($('li').hasClass('cus-selected')) {
                var item = this.collection.at(this.i);
                this.collection.remove(item);
                this.i = 0;
                this.renderCartList();
                this.calculateModel();
            }
            layer.msg('删除成功', optLayerSuccess);
        },
        /**
         *取消退货
         */
        cancelForceReturn: function () {
            var _self = this;
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var attrs = {
                pageid: pageId,
                content: '确定取消退货？',
                is_navigate: false,
                callback: function () {
                    _self.collection.reset();
                    _self.model.set({
                        totalamount: 0,
                        itemamount: 0,
                        discountamount: 0
                    });
                    _self.renderPosInfo();
                    _self.renderCartList();
                    storage.remove(system_config.FORCE_RETURN_KEY);
                    layer.msg('取消退货成功', optLayerSuccess);
                }
            };
            this.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area: '300px'});
        },

        onAddItem: function (JSONData) {
            this.collection.set(JSONData, {merge: false});
            this.insertSerial();
            this.calculateModel();
        },
        /**
         * 查找商品
         */
        addItem: function () {
            var _self = this;
            var search = $(this.input).val();
            var data = {};
            data['skucode'] = search;
            if (storage.isSet(system_config.VIP_KEY)) {
                data['cust_id'] = storage.get(system_config.VIP_KEY, 'cust_id');
                data['medium_id'] = storage.get(system_config.VIP_KEY, 'medium_id');
                data['medium_type'] = storage.get(system_config.VIP_KEY, 'medium_type');
            } else {
                data['cust_id'] = '*';
                data['medium_id'] = '*';
                data['medium_type'] = '*';
            }
            data['goods_detail'] = JSON.stringify(_self.collection);
            this.requestModel.sku(data, function (resp) {
                if (resp.status == '00') {
                    var temp = resp.goods_detail[resp.goods_detail.length - 1];
                    if (temp['price_auto'] == 1) {
                        var attrs = {
                            pageid: pageId,

                            originalprice: temp['price'],

                            callback: function () {
                                var price = $('input[name = price]').val();
                                resp.goods_detail[resp.goods_detail.length - 1].price = parseFloat(price);
                                resp.goods_detail[resp.goods_detail.length - 1].money = parseFloat(price);
                                _self.onAddItem(resp.goods_detail);
                                $('input[name = sku_id]').focus();
                            }
                        };
                        _self.openLayer(PAGE_ID.LAYER_PRICE_ENTRY, pageId, '单价录入', LayerPriceEntryView, attrs, {area: '300px'});
                    } else {
                        _self.onAddItem(resp.goods_detail);
                    }
                } else {
                    layer.msg(resp.msg, optLayerError);
                }
            });
            $(this.input).val('');
            _self.i = 0;
        },
        /**
         * 结算
         */
        doBilling: function () {
            var itemamount = this.model.get('itemamount');
            if (itemamount == 0) {
                layer.msg('请添加要退货的商品', optLayerWarning);
            } else {
                isfromForce = true;
                router.navigate('billingreturn', {trigger: true});
            }
        },
        /**
         * 单品优惠
         */
        modifyItemDiscount: function () {
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var _self = this;
            var value = $(this.input).val();
            var item = this.collection.at(this.i);
            var price = item.get('price');
            var num = item.get('num');
            var discount = item.get('discount');
            if (value == '.' || (value.split('.').length - 1) > 1 || value == '') {
                layer.msg('无效的优惠金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (parseFloat(value) > price * num) {
                layer.msg('优惠金额不能大于商品金额', optLayerWarning);
                $(this.input).val('');
                return;
            }

            var rate = 1 - parseFloat(value) / (price * num); //discount_rate类型为decimal
            this.evalAuth(auth_discount, '01', {discount_rate: rate}, function () {
                _self.collection.at(_self.i).set({
                    discount: parseFloat(value),
                    money: price * num - value
                });
                _self.calculateModel();
                $('#li' + _self.i).addClass('cus-selected');
            });
            $(this.input).val('');
        },


        //切换优惠模式
        onDiscountPercentClicked: function () {
            var discountpercent = $(this.input).val();
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (discountpercent == '' || discountpercent >= 100 || (discountpercent.split('.').length - 1) > 0) {
                layer.msg('无效的折扣比率', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var _self = this;
            var rate = parseFloat(discountpercent) / 100;
            var item = this.collection.at(this.i);
            var price = item.get('price');
            var num = item.get('num');
            console.log(rate);
            this.evalAuth(auth_discount, '02', {discount_rate: rate}, function () {
                _self.collection.at(_self.i).set({
                    discount: price * num * (1 - rate),
                    money: price * num * rate
                });
                _self.calculateModel();
                $('#li' + _self.i).addClass('cus-selected');
                $(_self.input).val('');
            });
        },
        /**
         * 修改数量
         */
        modifyItemNum: function () {
            var number = $(this.input).val();
            if (this.model.get('itemamount') == 0) {
                layer.msg('当前购物车内无商品', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (number == '' || number == 0 || (number.split('.').length - 1) > 1) {
                layer.msg('无效的商品数量', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var item = this.collection.at(this.i);
            var num = item.get('num');
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
            $('#li' + this.i).addClass('cus-selected');
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

        onOKClicked: function () {
            this.addItem();
        },
        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },
        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },
        onClearClicked: function () {
            $(this.input).val('');
        },
        onBillingClicked: function () {
            this.doBilling();
        },
        onCancelClicked: function () {
            this.cancelForceReturn();
        },
        onDiscountClicked: function () {
            this.modifyItemDiscount();
        },
        onDeleteClicked: function () {
            var len = this.collection.length;
            //console.log(len);
            if (len == 0) {
                layer.msg('没有可删除的商品', optLayerWarning);
                return;
            }
            this.deleteItem();
        },
        onModifyNumClicked: function () {
            this.modifyItemNum();
        },

        onKeyUpClicked: function () {
            this.scrollUp();
        },
        onKeyDownClicked: function () {
            this.scrollDown();
        },
        onHelpClicked: function () {
            var attrs = {
                page: 'RETURNFORCE_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },
        onReturnClicked: function () {
            router.navigate('main', {trigger: true});
        },

    });

    return returnForceView;
});