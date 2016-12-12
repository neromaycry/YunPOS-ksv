/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/return-whole/model',
    '../../../../moduals/return-whole/collection',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-help/view',
    'text!../../../../moduals/return-whole/returninfotpl.html',
    'text!../../../../moduals/return-whole/rtcarttpl.html',
    'text!../../../../moduals/return-whole/rtpayedlisttpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/return-whole/tpl.html'
], function (BaseView, RtWholeModel, RtWholeCollection, LayerConfirmView, LayerHelpView, returninfotpl, rtcarttpl, rtpayedlisttpl, numpadtpl, tpl) {

    var returnWholeView = BaseView.extend({

        id: "returnWholeView",

        el: '.views',

        template: tpl,

        template_returninfo: returninfotpl,

        template_rtcart: rtcarttpl,

        template_rtpayedlist: rtpayedlisttpl,

        template_numpad: numpadtpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        i: 0,

        input: 'input[name = whole_return_order]',

        events: {
            'click .numpad-ok': 'onOKClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click .rt-billing': 'onBillingClicked',
            'click .rt-return': 'onBackClicked',
            'click .rt-help': 'onHelpClicked',
            'click .rt-cancel': 'onCancelClicked',
            'click .rt-delete':'onDeleteClicked',
            'click .rt-keyup':'onKeyUpClicked',
            'click .rt-keydown':'onKeyDownClicked',
            'click .modify-num':'modifyItemNum'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.RETURN_WHOLE;
            this.model = new RtWholeModel();
            this.requestModel = new RtWholeModel();
            this.RtcartCollection = new RtWholeCollection();
            this.RtPayedlistCollection = new RtWholeCollection();
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            this.initTemplates();
        },

        initPlugins: function () {
            $(this.input).focus();
            if (storage.isSet(system_config.RETURN_KEY)) {
                this.RtPayedlistCollection.set(storage.get(system_config.RETURN_KEY, 'paymentlist'));
                this.RtcartCollection.set(storage.get(system_config.RETURN_KEY, 'cartlist'));
                this.model.set(storage.get(system_config.RETURN_KEY, 'panel'));
            }
            $('.rtcart-content').perfectScrollbar();
            this.renderRtInfo();
            this.renderRtcart();
            this.$el.find('.for-numpad').html(this.template_numpad);
            $('#li' + this.i).addClass('cus-selected');
            //this.renderRtPayedlist();
        },

        initTemplates: function () {
            this.template_returninfo = _.template(this.template_returninfo);
            this.template_rtcart = _.template(this.template_rtcart);
            //this.template_rtpayedlist = _.template(this.template_rtpayedlist);
        },

        initLayoutHeight: function () {
            var dh = $(window).height();
            var dw = $(window).width();
            var navbar = $('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var panelfooter = $('.panel-footer').height();
            var payedlist = dh - navbar * 2 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            $('.rtcart-content').height(payedlist);
            this.listheight = payedlist;//购物车列表的高度
            this.listnum = 6;//设置商品列表中的条目数
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
        },

        renderRtInfo: function () {
            this.$el.find('.for-rtinfo').html(this.template_returninfo(this.model.toJSON()));
            return this;
        },

        renderRtcart: function () {
            this.$el.find('.rtcart-content').html(this.template_rtcart(this.RtcartCollection.toJSON()));
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },

        //renderRtPayedlist: function () {
        //    this.$el.find('.payedlist-content').html(this.template_rtpayedlist(this.RtPayedlistCollection.toJSON()));
        //    return this;
        //},

        requestOrder: function () {
            var _self = this;
            var orderNo = $(this.input).val();
            var len  = this.RtcartCollection.length;
            if(len != 0) {
                layer.msg('当前购物车不为空，请先取消退货再查询新的订单', optLayerWarning);
                return;
            }
            if (orderNo == '') {
                layer.msg('请输入订单号', optLayerWarning);
                return;
            }
            var day = new Date().getTime();
            day = fecha.format(day, 'YYYYMMDD');
            var data = {
                day:day,
                bill_no:orderNo
            };
            this.requestModel.getOrderInfo(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        _self.RtcartCollection.set(resp.goods_detail);
                        _self.RtPayedlistCollection.set(resp.gather_detail);
                        _self.model.set({
                            bill_no:orderNo
                        });
                        _self.calculateModel();
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            });
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.T, function () {
                _self.onHelpClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Esc, function () {
                _self.onBackClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Space, function () {
               _self.onBillingClicked();
            });
            //取消整单退货
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.C, function () {
                _self.onCancelClicked();
            });
            //删除
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.D, function () {
                _self.onDeleteClicked();
            });
            //确定
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Enter, function () {
               _self.onOKClicked();
            });
            //修改数量
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.F12, function () {
                _self.modifyItemNum();
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Down, function () {
                _self.onKeyDownClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Up, function () {
                _self.onKeyUpClicked();
            });
        },


        onDeleteClicked: function () {
            var _self = this;
            var attrs = {
                pageid: pageId,
                content: '确定删除该商品？',
                callback: function () {
                    _self.deleteItem();
                }
            };
            _self.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area: '300px'});

        },
        /**
         * 单品删除
         */
        deleteItem: function () {
            try {
                if ($('li').hasClass('cus-selected')) {
                    var item = this.RtcartCollection.at(this.i);
                    this.RtcartCollection.remove(item);
                    this.i = 0;
                    this.calculateModel();
                }
                layer.msg('删除成功', optLayerSuccess);
            } catch (e) {
                layer.msg(e.name + ":" + e.message, optLayerError);
            }
        },


        onCancelClicked: function () {
            var _self = this;
            var len = this.RtcartCollection.length;
            if (len == 0) {
                layer.msg('请先查询订单', optLayerWarning);
                return;
            }
            var attrs = {
                pageid: pageId,
                content: '确定取消退货？',
                callback: function () {
                    _self.cancelReturn();
                }
            };
            _self.openConfirmLayer(PAGE_ID.LAYER_CONFIRM, pageId, LayerConfirmView, attrs, {area: '300px'});
        },

        /**
         * 取消退货
         */
        cancelReturn: function () {
            this.RtcartCollection.reset();
            this.RtPayedlistCollection.reset();
            this.model.set({
                totalamount: 0,
                itemamount: 0,
                discountamount: 0
            });
            this.renderRtcart();
            this.renderRtInfo();
            //_self.renderRtPayedlist();
            layer.msg('取消退货成功', optLayerSuccess);
            storage.remove(system_config.RETURN_KEY);
            router.navigate('main', {trigger:true});
            //$('input[name = whole_return_order]').focus();
        },


        /**
         * 修改单品数量
         * num:当前退货数量, ref_num:已退数量, new_num:未退数量
         */
        modifyItemNum: function () {
            var _self = this;
            var number = $(this.input).val();
            if (number == '' || number == 0 || (number.split('.').length - 1) > 1) {
                layer.msg('无效的商品数量', optLayerWarning);
                $(this.input).val('');
                return;
            }
            var item = this.RtcartCollection.at(this.i);
            var discount = item.get('discount');
            var price = item.get('price');
            var newNum = item.get('new_num');//代表未退数量，number不能大于未退数量
            if(discount != 0) {
                layer.msg('折扣后商品不能修改数量', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(number > newNum) {
                layer.msg('修改数量不能大于未退数量', optLayerWarning);
                $(this.input).val('');
                return;
            }
            item.set({
                num: parseFloat(number),
                money: price * number - discount
            });

            //this.totalamount = 0;
            //this.itemamount = 0;
            //this.discountamount = 0;
            //var priceList = this.RtcartCollection.pluck('price');
            //var discounts = this.RtcartCollection.pluck('discount');
            //var itemNum = this.RtcartCollection.pluck('old_num');
            //for (var i = 0; i < priceList.length; i++) {
            //    discounts[i] = parseFloat(discounts[i]);
            //    this.totalamount += priceList[i] * itemNum[i];
            //    this.itemamount += itemNum[i];
            //    this.discountamount += discounts[i] * itemNum[i];
            //}
            this.calculateModel();
            $(this.input).val('');
            $('#li' + this.i).addClass('cus-selected');
        },


        calculateModel: function () {
            //for (var i = 0; i < this.RtcartCollection.length; i++) {
            //    var item = this.RtcartCollection.at(i);
            //    var money = item.get('money');
            //    var num = item.get('num');
            //    var discount = item.get('discount');
            //    item.set({
            //        money: money,
            //        num: num,
            //        discount: discount
            //    });
            //}
            this.totalamount = 0;
            this.itemamount = 0;
            this.discountamount = 0;
            var priceList = this.RtcartCollection.pluck('price');
            var itemNum = this.RtcartCollection.pluck('num');//显示的是当前退货的数量
            //var newNum = this.RtcartCollection.pluck('new_num');//显示的是未退金额，所以itemNum为new_num
            var discounts = this.RtcartCollection.pluck('discount');
            for (var i = 0; i < this.RtcartCollection.length; i++) {
                discounts[i] = parseFloat(discounts[i]);
                this.totalamount += priceList[i] * itemNum[i];
                this.itemamount += itemNum[i];
                this.discountamount += discounts[i];
            }
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,//退款商品的数量
                discountamount: this.discountamount
            });
            this.renderRtcart();
            this.renderRtInfo();
            //this.renderRtPayedlist();
            storage.set(system_config.RETURN_KEY, 'cartlist', this.RtcartCollection.toJSON());
            storage.set(system_config.RETURN_KEY, 'paymentlist', this.RtPayedlistCollection.toJSON());
            storage.set(system_config.RETURN_KEY, 'panel', this.model.toJSON());
            storage.set(system_config.RETURN_KEY, 'bill_no', this.model.get('bill_no'));
        },

        onKeyUpClicked: function () {
            if (this.i > 0) {
                this.i--;
            }
            if ((this.i + 1) % this.listnum == 0 && this.i > 0) {
                this.n--;
                //alert(_self.n);
                $('.rtcart-content').scrollTop(this.listheight * this.n);
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        onKeyDownClicked:function () {
            if (this.i < this.RtcartCollection.length - 1) {
                this.i++;
            }
            if (this.i % this.listnum == 0 && this.n < parseInt(this.RtcartCollection.length / this.listnum)) {
                this.n++;
                //alert(_self.n);
                $('.rtcart-content').scrollTop(this.listheight * this.n);
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        onBackClicked: function () {
            router.navigate('main', {trigger: true});
            storage.remove(system_config.RETURN_KEY);
        },


        onBillingClicked: function () {
            var itemamount = this.model.get('itemamount');
            if (itemamount == 0) {
                layer.msg('请输入订单号', optLayerWarning);
            } else {
                isfromForce = false;
                router.navigate('billingreturn', {trigger: true});
            }
        },

        onOKClicked: function () {
            var _self = this;
            if ($(this.input).val() == '') {
                layer.msg('订单编号不能为空', optLayerWarning);
                return;
            }
            this.evalAuth(auth_return, '06', {}, function () {
                _self.requestOrder();
            });
            $(this.input).val("");
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

        onHelpClicked: function () {
            var attrs = {
                page: 'RETURNWHOLE_PAGE',
                pageid: pageId
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area: '600px'});
        },

    });

    return returnWholeView;
});