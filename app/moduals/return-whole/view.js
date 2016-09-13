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
            $('input[name = whole_return_order]').focus();
            this.renderRtInfo();
            this.renderRtcart();
            this.renderRtPayedlist();
        },

        initTemplates: function () {
            this.template_returninfo = _.template(this.template_returninfo);
            this.template_rtcart = _.template(this.template_rtcart);
            this.template_rtpayedlist = _.template(this.template_rtpayedlist);
        },

        renderRtInfo: function () {
            this.$el.find('.for-rtinfo').html(this.template_returninfo(this.model.toJSON()));
            return this;
        },

        renderRtcart: function () {
            this.$el.find('.for-rtcart').html(this.template_rtcart(this.RtcartCollection.toJSON()));
            return this;
        },

        renderRtPayedlist: function () {
            this.$el.find('.for-rtpayedlist').html(this.template_rtpayedlist(this.RtPayedlistCollection.toJSON()));
            return this;
        },

        requestOrder: function () {
            var _self = this;
            var orderNo = $('input[name = whole_return_order]').val();
            //if (orderDate == '') {
            //    toastr.info('请输入订单日期');
            //    return;
            //}
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
                    console.log(_self.RtcartCollection);
                    _self.renderRtcart();
                    _self.renderRtPayedlist();
                } else {
                    toastr.error(resp.msg);
                }
            });
        },

        bindKeys: function () {
            var _self = this;
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Esc,function () {
                router.navigate('main',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.B,function () {
                isfromForce = false;
                router.navigate('billingreturn',{trigger:true});
            });
            this.bindKeyEvents(window.PAGE_ID.RETURN_WHOLE, window.KEYS.Enter, function () {
                _self.requestOrder();

            });
        },



    });

    return returnWholeView;
});