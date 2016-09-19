/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../../../js/common/BaseView',
    '../../../../moduals/return-whole/model',
    '../../../../moduals/return-whole/collection',
    'text!../../../../moduals/return-whole/returninfotpl.html',
    'text!../../../../moduals/return-whole/rtcarttpl.html',
    'text!../../../../moduals/return-whole/rtpayedlisttpl.html',
    'text!../../../../moduals/return-whole/tpl.html'
], function (BaseView, RtWholeModel, RtWholeCollection, returninfotpl, rtcarttpl, rtpayedlisttpl, tpl) {

    var returnWholeView = BaseView.extend({

        id: "returnWholeView",

        el: '.views',

        template: tpl,

        template_returninfo:returninfotpl,

        template_rtcart:rtcarttpl,

        template_rtpayedlist:rtpayedlisttpl,

        totalamount: 0,

        itemamount: 0,

        discountamount: 0,

        i: 0,

        events: {

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
            $('input[name = return_order_date]').focus();
            if (storage.isSet(system_config.RETURN_KEY)) {
                this.RtPayedlistCollection.set(storage.get(system_config.RETURN_KEY,'paymentlist'));
                this.RtcartCollection.set(storage.get(system_config.RETURN_KEY,'cartlist'));
                this.model.set(storage.get(system_config.RETURN_KEY,'panel'));
            }
            this.renderRtInfo();
            this.renderRtcart();
            this.renderRtPayedlist();
            //this.initLayoutHeight();
        },

        initTemplates: function () {
            this.template_returninfo = _.template(this.template_returninfo);
            this.template_rtcart = _.template(this.template_rtcart);
            this.template_rtpayedlist = _.template(this.template_rtpayedlist);
        },

        initLayoutHeight: function () {
            var dh = $(document).height();
            var navbar =$('.navbar').height();
            var panel_head = $('.panel-heading').height();
            //console.log('dh:' + dh + ' navbar:' + navbar + ' panel head:' + panel_head*2);
            var payedlist = (dh - (navbar + panel_head)*4)/2;
            var rtcart = payedlist;
            //console.log('payedlist:' + payedlist);
            $('.rtcart-content').height(rtcart);
            $('.payedlist-content').height(payedlist);
        },

        renderRtInfo: function () {
            this.$el.find('.for-rtinfo').html(this.template_returninfo(this.model.toJSON()));
            return this;
        },

        renderRtcart: function () {
            this.$el.find('.rtcart-content').html(this.template_rtcart(this.RtcartCollection.toJSON()));
            return this;
        },

        renderRtPayedlist: function () {
            this.$el.find('.payedlist-content').html(this.template_rtpayedlist(this.RtPayedlistCollection.toJSON()));
            return this;
        },

        requestOrder: function () {
            var _self = this;
            var orderNo = $('input[name = whole_return_order]').val();
            if (orderNo == '') {
                toastr.info('请输入订单号');
                return;
            }
            var data = {};
            data['day'] = '';
            data['bill_no'] = orderNo;
            this.requestModel.getOrderInfo(data, function (resp) {
                console.log(resp);
                if (resp.status == '00') {
                    _self.RtcartCollection.set(resp.goods_detail);
                    _self.RtPayedlistCollection.set(resp.gather_detail);
                    console.log(resp.goods_detail);
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
            this.renderRtPayedlist();
            storage.set(system_config.RETURN_KEY,'cartlist',this.RtcartCollection.toJSON());
            storage.set(system_config.RETURN_KEY,'paymentlist',this.RtPayedlistCollection.toJSON());
            storage.set(system_config.RETURN_KEY,'panel',this.model.toJSON());
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Esc,function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.B,function () {
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
                _self.RtcartCollection.reset();
                _self.RtPayedlistCollection.reset();
                _self.model.set({
                    totalamount: 0,
                    itemamount: 0,
                    discountamount: 0
                });
                _self.renderRtcart();
                _self.renderRtInfo();
                _self.renderRtPayedlist();
                storage.remove(system_config.RETURN_KEY);
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Enter, function () {
                if($('input[name = return_order_date]').val() == '') {
                    toastr.warning('订单日期不能为空');
                } else if ($('input[name = whole_return_order]').val() == ''){
                    toastr.warning('订单编号不能为空');
                }else {
                    _self.requestOrder();
                    $('input[name = return_order_date]').val("");
                    $('input[name = whole_return_order]').val("");
                }
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Down, function () {
                $('input[name = whole_return_order]').focus();
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Up, function () {
                $('input[name = return_order_date]').focus();
            })
        },



    });

    return returnWholeView;
});