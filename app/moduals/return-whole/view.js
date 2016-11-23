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
], function (BaseView, RtWholeModel, RtWholeCollection, LayerConfirmView, LayerHelpView, returninfotpl, rtcarttpl, rtpayedlisttpl,numpadtpl, tpl) {

    var returnWholeView = BaseView.extend({

        id: "returnWholeView",

        el: '.views',

        template: tpl,

        template_returninfo:returninfotpl,

        template_rtcart:rtcarttpl,

        template_rtpayedlist:rtpayedlisttpl,

        template_numpad:numpadtpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        i: 0,

        input: 'input[name = whole_return_order]',

        events: {
            'click .numpad-ok':'onOKClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .cancel':'onCancelClicked',
            'click .rt-billing':'onBillingClicked',
            'click .rt-return':'onBackClicked',
            'click .rt-help':'onHelpClicked',
            'click .rt-cancel':'onCancelClicked'
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
                this.RtPayedlistCollection.set(storage.get(system_config.RETURN_KEY,'paymentlist'));
                this.RtcartCollection.set(storage.get(system_config.RETURN_KEY,'cartlist'));
                this.model.set(storage.get(system_config.RETURN_KEY,'panel'));
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
            var navbar =$('.navbar').height();
            var panelheading = $('.panel-heading').height();
            var panelfooter = $('.panel-footer').height();
            var payedlist = dh - navbar * 2 - panelheading * 2 - panelfooter;
            var leftWidth = $('.main-left').width();
            var cartWidth = dw - leftWidth - 45;
            $('.cart-panel').width(cartWidth);
            $('.rtcart-content').height(payedlist);
            this.listheight = payedlist;//购物车列表的高度
            this.listnum = 10;//设置商品列表中的条目数
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
            if (orderNo == '') {
                toastr.info('请输入订单号');
                return;
            }
            var data = {};
            data['day'] = '';
            data['bill_no'] = orderNo;
            this.requestModel.getOrderInfo(data, function (resp) {
                if (resp.status == '00') {
                    _self.RtcartCollection.set(resp.goods_detail);
                    _self.RtPayedlistCollection.set(resp.gather_detail);
                    console.log(resp.gather_detail);
                    _self.calculateModel();
                } else {
                    toastr.error(resp.msg);
                }
            });
        },
        calculateModel: function () {
            this.totalamount = 0;
            var priceList = this.RtcartCollection.pluck('price');
            var itemNum = this.RtcartCollection.pluck('num');
            var discounts = this.RtcartCollection.pluck('discount');
            for (var i = 0; i < this.RtcartCollection.length; i++) {
                discounts[i] = parseFloat(discounts[i]);
                this.totalamount += priceList[i] * itemNum[i];
                this.itemamount += itemNum[i];
                this.discountamount += discounts[i];
            }
            this.model.set({
                totalamount: this.totalamount,
                itemamount:this.itemamount,
                discountamount:this.discountamount
            });
            this.renderRtcart();
            this.renderRtInfo();
            //this.renderRtPayedlist();
            storage.set(system_config.RETURN_KEY,'cartlist',this.RtcartCollection.toJSON());
            storage.set(system_config.RETURN_KEY,'paymentlist',this.RtPayedlistCollection.toJSON());
            storage.set(system_config.RETURN_KEY,'panel',this.model.toJSON());
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.T,function () {
               _self.onHelpClicked();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Esc,function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Space,function () {
                var itemamount = _self.model.get('itemamount');
                if (itemamount == 0) {
                    toastr.info('请输入订单号');
                } else {
                    isfromForce = false;
                    router.navigate('billingreturn',{trigger:true});
                }
            });
            //取消整单退货
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.C, function() {
                _self.onCancelClicked();
            });
            //确定
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Enter, function () {
                if ($(this.input).val() == '') {
                    toastr.warning('订单编号不能为空');
                    return;
                }
                _self.requestOrder();
                $(_self.input).val('');
                //if($('input[name = return_order_date]').val() == '') {
                //    toastr.warning('订单日期不能为空');
                //} else if ($('input[name = whole_return_order]').val() == ''){
                //    toastr.warning('订单编号不能为空');
                //}else {
                //    _self.requestOrder();
                //    $('input[name = return_order_date]').val("");
                //    $('input[name = whole_return_order]').val("");
                //}
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Down, function () {
                _self.scrollDown();
            });

            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Up, function () {
                _self.scrollUp();
            });
        },


        onCancelClicked: function () {
            var _self = this;
            var len = this.RtcartCollection.length;
            if(len == 0) {
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
            toastr.success('取消退货成功');
            storage.remove(system_config.RETURN_KEY);
            $('input[name = whole_return_order]').focus();
        },

        scrollDown: function () {
            console.log(this.i);
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
                $('.rtcart-content').scrollTop(this.listheight * this.n );
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        onBackClicked: function () {
            router.navigate('main',{trigger:true});
        },


        onBillingClicked: function () {
            var itemamount = this.model.get('itemamount');
            if (itemamount == 0) {
                toastr.info('请输入订单号');
            } else {
                isfromForce = false;
                router.navigate('billingreturn',{trigger:true});
            }
        },

        onOKClicked: function () {
            if ($(this.input).val() == '') {
                toastr.warning('订单编号不能为空');
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
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        onHelpClicked:function () {
            var attrs = {
                page:'RETURNWHOLE_PAGE'
            };
            this.openLayer(PAGE_ID.LAYER_HELP, pageId, '帮助', LayerHelpView, attrs, {area:'600px'});
        },

    });

    return returnWholeView;
});