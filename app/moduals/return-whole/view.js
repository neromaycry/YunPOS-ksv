/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/return-whole/model',
    '../../../../moduals/return-whole/collection',
    '../../../../moduals/layer-confirm/view',
    '../../../../moduals/layer-help/view',
    '../../../../moduals/layer-icmember/view',
    '../../../../moduals/layer-member/view',
    'text!../../../../moduals/return-whole/returninfotpl.html',
    'text!../../../../moduals/return-whole/rtcarttpl.html',
    'text!../../../../moduals/return-whole/rtpayedlisttpl.html',
    'text!../../../../moduals/main/numpadtpl.html',
    'text!../../../../moduals/return-whole/minfotpl.html',
    'text!../../../../moduals/return-whole/tpl.html'
], function (BaseView, RtWholeModel, RtWholeCollection, LayerConfirmView, LayerHelpView, LayerICMemberView, LayerMemberView,  returninfotpl, rtcarttpl, rtpayedlisttpl, numpadtpl, minfotpl, tpl) {

    var returnWholeView = BaseView.extend({

        id: "returnWholeView",

        el: '.views',

        template: tpl,

        template_returninfo: returninfotpl,

        template_rtcart: rtcarttpl,

        template_rtpayedlist: rtpayedlisttpl,

        template_numpad: numpadtpl,

        template_minfo:minfotpl,

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
            'click .modify-num':'modifyItemNum',
            'click .member':'onMemberClicked'
        },

        pageInit: function () {
            pageId = window.PAGE_ID.RETURN_WHOLE;
            this.model = new RtWholeModel();
            this.requestModel = new RtWholeModel();
            this.membermodel = new RtWholeModel();
            this.collection = new RtWholeCollection();
            this.RtPayedlistCollection = new RtWholeCollection();
            this.model.set({
                totalamount: this.totalamount,
                itemamount: this.itemamount,
                discountamount: this.discountamount
            });
            if (storage.isSet(system_config.VIP_KEY)) {
                var name = storage.get(system_config.VIP_KEY,'name');
                this.membermodel.set({
                    name:name
                });
            } else {
                this.membermodel.set({
                    name:'未登录'
                });
            }
            this.initTemplates();
        },

        initPlugins: function () {
            $(this.input).focus();
            if (storage.isSet(system_config.RETURN_KEY)) {
                this.RtPayedlistCollection.set(storage.get(system_config.RETURN_KEY, 'paymentlist'));
                this.collection.set(storage.get(system_config.RETURN_KEY, 'cartlist'));
                this.model.set(storage.get(system_config.RETURN_KEY, 'panel'));
            }
            $('.rtcart-content').perfectScrollbar();
            this.renderRtInfo();
            this.renderRtcart();
            this.renderMinfo();
            this.$el.find('.for-numpad').html(this.template_numpad);
            $('#li' + this.i).addClass('cus-selected');
            //this.renderRtPayedlist();
            this.handleEvents();
        },

        initTemplates: function () {
            this.template_returninfo = _.template(this.template_returninfo);
            this.template_rtcart = _.template(this.template_rtcart);
            this.template_minfo = _.template(this.template_minfo);
            //this.template_rtpayedlist = _.template(this.template_rtpayedlist);
        },

        handleEvents: function () {
            Backbone.off('onRtWholeMemberLogin');
            Backbone.on('onRtWholeMemberLogin', this.onRtWholeMemberLogin, this);
            Backbone.off('onRTMemberSigned');
            Backbone.on('onRTMemberSigned', this.onRTMemberSigned, this);
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

        onRTMemberSigned: function (resp) {
            this.membermodel.set({
                name: resp.name,
            });
            storage.set(system_config.VIP_KEY, resp);
            this.renderMinfo();
        },

        renderRtInfo: function () {
            this.$el.find('.for-rtinfo').html(this.template_returninfo(this.model.toJSON()));
            return this;
        },

        renderRtcart: function () {
            this.$el.find('.rtcart-content').html(this.template_rtcart(this.collection.toJSON()));
            $('.li-cartlist').height(this.listheight / this.listnum - 21);
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },

        renderMinfo: function () {
            this.$el.find('.for-minfo').html(this.template_minfo(this.membermodel.toJSON()));
            console.log(this.template_minfo);
            return this;
        },
        //renderRtPayedlist: function () {
        //    this.$el.find('.payedlist-content').html(this.template_rtpayedlist(this.RtPayedlistCollection.toJSON()));
        //    return this;
        //},

        requestOrder: function () {
            var _self = this;
            var orderNo = $(this.input).val();
            var len  = this.collection.length;
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
            this.evalAuth(auth_return, '06', {}, function () {
                _self.requestModel.getOrderInfo(data, function (resp) {
                    if (!$.isEmptyObject(resp)) {
                        if (resp.status == '00') {
                            _self.collection.set(resp.goods_detail);
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

            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.F8, function () {
                _self.onMemberClicked();
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
                    var item = this.collection.at(this.i);
                    this.collection.remove(item);
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
            var len = this.collection.length;
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
            this.collection.reset();
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
            storage.remove(system_config.VIP_KEY);
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
            var item = this.collection.at(this.i);
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
            //var priceList = this.collection.pluck('price');
            //var discounts = this.collection.pluck('discount');
            //var itemNum = this.collection.pluck('old_num');
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
            //for (var i = 0; i < this.collection.length; i++) {
            //    var item = this.collection.at(i);
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
            var priceList = this.collection.pluck('price');
            var itemNum = this.collection.pluck('num');//显示的是当前退货的数量
            //var newNum = this.collection.pluck('new_num');//显示的是未退金额，所以itemNum为new_num
            var discounts = this.collection.pluck('discount');
            for (var i = 0; i < this.collection.length; i++) {
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
            storage.set(system_config.RETURN_KEY, 'cartlist', this.collection.toJSON());
            storage.set(system_config.RETURN_KEY, 'paymentlist', this.RtPayedlistCollection.toJSON());
            storage.set(system_config.RETURN_KEY, 'panel', this.model.toJSON());
            storage.set(system_config.RETURN_KEY, 'bill_no', this.model.get('bill_no'));
        },

        /**
         * 会员登录按钮点击事件
         */
        onMemberClicked: function () {
            this.openLayer(PAGE_ID.LAYER_MEMBER, pageId, '会员登录', LayerMemberView, undefined, {area: '800px'});
        },

        onKeyUpClicked: function () {
            this.scrollUp('rtcart-content', 'li');
        },

        onKeyDownClicked:function () {
            this.scrollDown('rtcart-content', 'li');
        },

        onBackClicked: function () {
            router.navigate('main', {trigger: true});
            storage.remove(system_config.RETURN_KEY);
            storage.remove(system_config.VIP_KEY);
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
            this.requestOrder();
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

        onRtWholeMemberLogin: function (resp) {
            var attrs = {
                pageid: pageId,
                card_no: resp.cardno,
                callback: function (data) {
                    storage.set(system_config.VIP_KEY, data);
                    layer.msg('会员登录成功', optLayerSuccess);
                }
            };
            this.openLayer(PAGE_ID.LAYER_ICMEMBER, pageId, '会员IC卡登录', LayerICMemberView, attrs, {area: '600px'});
        }

    });

    return returnWholeView;
});