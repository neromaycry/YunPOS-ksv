/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billtype/model',
    '../../moduals/modal-billtype/collection',
    '../../moduals/modal-gatherui/view',
    'text!../../moduals/modal-billtype/billingtypetpl.html',
    'text!../../moduals/modal-billtype/tpl.html',
], function (BaseModalView,BilltypeModel,BilltypeCollection, GatherUIView, billingtypetpl, tpl) {

    var billtypeView = BaseModalView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype:billingtypetpl,

        i:0,

        index:0,

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOkClicked',
            'click [data-index]':'onBillTypeClicked'
        },

        modalInitPage: function () {
            this.model = new BilltypeModel();
            this.requestmodel = new BilltypeModel();
            this.model.set({
                receivedsum:this.attrs['gather_money']
            });
            var gatherKind = this.attrs['gather_kind'];
            if(storage.isSet(system_config.GATHER_KEY)) {
                this.collection = new BilltypeCollection();
                var tlist = storage.get(system_config.GATHER_KEY);
                this.visibleTypes = _.where(tlist,{visible_flag:'1'});
                var gatherList = _.where(this.visibleTypes ,{gather_kind:gatherKind});
                for(var i in gatherList){
                    var item = new BilltypeModel();
                    item.set({
                        gather_id:gatherList[i].gather_id,
                        gather_name:gatherList[i].gather_name
                    });
                    this.collection.push(item);
                }
            }
            this.initTemplates();
            this.render();
            this.renderBilltype();
        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
        },

        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Down, function() {
               _self.scrollDown();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Up, function() {
               _self.scrollUp();
            });

            this.bindModalKeyEvents(window.PAGE_ID.BILLING_TYPE, window.KEYS.Enter, function() {
                _self.onReceived(_self.i);
            });
        },

        /**
         * Enter和确定
         */
        onReceived:function(index) {
            var _self = this;
            var gatherId = this.collection.at(index).get('gather_id');
            var gatherName = this.collection.at(index).get('gather_name');
            var gatherMoney  = this.attrs.gather_money;
            var gatherKind = this.attrs.gather_kind;
            var gatherModel = _.where(this.visibleTypes,{gather_id:gatherId});
            var gatherUI = gatherModel[0].gather_ui;
            $('.modal-backdrop').remove();
            this.hideModal(window.PAGE_ID.BILLING);
            if(gatherUI == '01' && gatherId != '05'){
                var gaterUIView = new GatherUIView({
                    pageid:window.PAGE_ID.BILLING,
                    currentid:window.PAGE_ID.BILLING_ACCOUNT,
                    gather_id:gatherId,
                    gather_name:gatherName,
                    gather_ui:gatherUI,
                    gather_kind:gatherKind,
                    gather_money:gatherMoney ,
                    callback: function (attrs) {
                        var gatherNo = $('input[name = receive-account]').val();
                        var attrData = {};
                        attrData['gather_id'] = attrs.gather_id;
                        attrData['gather_money'] = attrs.gather_money;
                        attrData['gather_name'] = attrs.gather_name;
                        attrData['gather_no'] = gatherNo;
                        attrData['gather_kind'] = attrs.gather_kind;
                        attrData['payment_bill'] = '';
                        Backbone.trigger('onReceivedsum',attrData);
                        _self.hideModal(window.PAGE_ID.BILLING);
                        $('input[name = billing]').focus();
                    }
                });
                this.showModal(window.PAGE_ID.BILLING_ACCOUNT, gaterUIView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receive-account]').focus();
                });
            }else if(gatherUI == '04'){
                var xfbdata = {};
                xfbdata['pos_id'] = '002';
                xfbdata['bill_no'] = _self.attrs.bill_no;
                this.requestmodel.xfbbillno(xfbdata, function(resp) {
                    if(resp.status == '00') {
                        var gaterUIView = new GatherUIView({
                            pageid:window.PAGE_ID.BILLING,
                            currentid:window.PAGE_ID.ALIPAY,
                            gather_id:gatherId,
                            gather_name:gatherName,
                            gather_ui:gatherUI,
                            gather_kind:gatherKind,
                            gather_money:gatherMoney,
                            payment_bill:resp.xfb_bill,
                            callback:function (attrs) {
                                var gatherNo = $('input[name = alipay-account]').val();
                                var attrData = {};
                                attrData['gather_id'] = attrs.gather_id;
                                attrData['gather_money'] = attrs.gather_money;
                                attrData['gather_name'] = attrs.gather_name;
                                attrData['gather_no'] = gatherNo;
                                attrData['gather_kind'] = attrs.gather_kind;
                                attrData['payment_bill'] = attrs.payment_bill;
                                _self.micropay(gatherUI, gatherNo,attrData,attrs.payment_bill);
                            }
                        });
                        _self.showModal(window.PAGE_ID.ALIPAY,gaterUIView);
                        $('.modal').on('shown.bs.modal',function(e) {
                            $('input[name = alipay-account]').focus();
                        });
                    }else {
                        toastr.error(resp.msg);
                    }
                });
            }else if(gatherUI == '05'){
                var xfbdata = {};
                xfbdata['pos_id'] = '002';
                xfbdata['bill_no'] = _self.attrs.bill_no;
                this.requestmodel.xfbbillno(xfbdata, function(resp) {
                    if(resp.status == '00') {
                        var gaterUIView = new GatherUIView({
                            pageid:window.PAGE_ID.BILLING,
                            currentid:window.PAGE_ID.WECHAT,
                            gather_id:gatherId,
                            gather_name:gatherName,
                            gather_ui:gatherUI,
                            gather_kind:gatherKind,
                            gather_money:gatherMoney,
                            payment_bill:resp.xfb_bill,
                            callback:function (attrs) {
                                var gatherNo = $('input[name = wechat-account]').val();
                                var attrData = {};
                                attrData['gather_id'] = attrs.gather_id;
                                attrData['gather_money'] = attrs.gather_money;
                                attrData['gather_name'] = attrs.gather_name;
                                attrData['gather_no'] = gatherNo;
                                attrData['gather_kind'] = attrs.gather_kind;
                                attrData['payment_bill'] = attrs.payment_bill;
                                _self.micropay(gatherUI, gatherNo,attrData, attrs.payment_bill);
                            }
                        });
                        _self.showModal(window.PAGE_ID.WECHAT,gaterUIView);
                        $('.modal').on('shown.bs.modal',function(e) {
                            $('input[name = wechat-account]').focus();
                        });
                    }else {
                        toastr.error(resp.msg);
                    }
                });
            }else if(gatherId == '05') {
                var data = {};
                data['gather_id'] = gatherId;
                data['gather_name'] = gatherName;
                data['gather_ui'] = gatherUI;
                data['gather_kind'] = gatherKind;
                data['gather_money'] = gatherMoney;
                data['bill_no'] = _self.attrs.bill_no;
                data['currentid'] = window.PAGE_ID.MODAL_POS;
                data['pageid'] = window.PAGE_ID.BILLING
                var gatherUIView = new GatherUIView(data);
                this.showModal(window.PAGE_ID.MODAL_POS, gaterUIView);
            }
        },

        /**
         * 调用支付宝付款接口,被扫支付即条码支付
         * @param gatherUI 判断是哪种付款方式
         * @param gatherNo 付款账号
         * @param attrData 准备传到结算页面的数据
         * @param paymentBill 祥付宝交易单号
         */
        micropay: function (gatherUI, gatherNo, attrData, paymentBill) {
            var _self = this;
            var data = {};
            if(gatherUI == '04') {
                data['orderid'] = paymentBill;
                data['merid'] = '000201504171126553';
                data['authno'] = gatherNo;
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'zfb';
                data['payway'] = 'barcode';
                data['zfbtwo'] = 'zfbtwo';
            }else if(gatherUI == '05') {
                data['orderid'] = paymentBill;
                data['merid'] = '000201504171126553';
                data['authno'] = gatherNo;
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'wx';
                data['payway'] = 'barcode';
            }
            resource.post('http://114.55.62.102:9090/api/pay/xfb/micropay', data, function (resp) {
                if(resp.data['flag'] == '00') {
                    Backbone.trigger('onReceivedsum',attrData);
                }else {
                    toastr.error('支付失败');
                }
                _self.hideModal(window.PAGE_ID.BILLING);
                $('input[name = billing]').focus();
            });
       },
        /**
         * 方向下
         */
        scrollDown: function () {
            if (this.i < this.collection.length - 1) {
                this.i++;
            }
            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 方向上
         */
        scrollUp:function () {
            if (this.i > 0) {
                this.i--;
            }

            $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
        },

        renderBilltype: function () {
            this.$el.find('.for-billingtype').html(this.template_billingtype(this.collection.toJSON()));
            $('#li' + this.i).addClass('cus-selected');
            return this;
        },

        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.BILLING);
            $('input[name = billing]').focus();
        },

        onOkClicked: function () {
            //var index = $('.cus-selected').data('index');
            this.onReceived(this.index);
        },

        onBillTypeClicked: function (e) {
            this.index = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        }

    });

    return billtypeView;
});