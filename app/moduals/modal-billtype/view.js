/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billtype/model',
    '../../moduals/modal-billtype/collection',
    '../../moduals/modal-billingaccount/view',
    '../../moduals/modal-gatherui/view',
    'text!../../moduals/modal-billtype/billingtypetpl.html',
    'text!../../moduals/modal-billtype/tpl.html',
], function (BaseModalView,BilltypeModel,BilltypeCollection,BillaccountView, GatherUIView, billingtypetpl, tpl) {

    var billtypeView = BaseModalView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype:billingtypetpl,

        i:0,

        index:0,

        //input: 'input[name = gather-no]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOkClicked',
            'click [data-index]':'onBillTypeClicked'
        },

        modalInitPage: function () {
            var _self = this;
            var gatherKind = _self.attrs['gather_kind'];
            if(storage.isSet(system_config.GATHER_KEY)) {
                this.collection = new BilltypeCollection();
                var tlist = storage.get(system_config.GATHER_KEY);
                this.visibleTypes = new BilltypeCollection();
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
            this.model = new BilltypeModel();
            this.model.set({
                receivedsum:this.attrs['receivedsum']
            });
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
            var time = new Date();
            var orderNo = time.getTime();
            console.log(orderNo);
            //storage.set(system_config.ORDER_NO_KEY, orderNo);
            var _self = this;
            var gatherId = this.collection.at(index).get('gather_id');
            var gatherName = this.collection.at(index).get('gather_name');
            var receivedSum = this.attrs.receivedsum;
            var gatherKind = this.attrs.gather_kind;
            var gathermodel = _.where(this.visibleTypes,{gather_id:gatherId});
            var gatherUI = gathermodel[0].gather_ui;
            $('.modal-backdrop').remove();
            this.hideModal(window.PAGE_ID.BILLING);
            if(gatherUI == '01'){
                var gaterUIView = new GatherUIView({
                    gather_ui:gatherUI,
                    pageid:window.PAGE_ID.BILLING,
                    currentid:window.PAGE_ID.BILLING_ACCOUNT,
                    gather_id:gatherId,
                    gather_name:gatherName,
                    receivedsum:receivedSum,
                    gatherKind:gatherKind,
                    callback: function (attrs) {
                        var receivedaccount = $('#receive_account').val();
                        var attrData = {};
                        attrData['gather_id'] = attrs.gather_id;
                        attrData['receivedsum'] = attrs.receivedsum;
                        attrData['gather_name'] = attrs.gather_name;
                        attrData['gather_no'] = receivedaccount;
                        attrData['gather_kind'] = attrs.gatherKind;
                        Backbone.trigger('onReceivedsum',attrData);
                        _self.hideModal(window.PAGE_ID.BILLING);
                        $('input[name = billing]').focus();
                    }
                });
                this.showModal(window.PAGE_ID.BILLING_ACCOUNT, gaterUIView);
                //this.billaccountview = new BillaccountView(attrData);
                //this.showModal(window.PAGE_ID.BILLING_ACCOUNT, this.billaccountview);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receive_account]').focus();
                });
            }else if(gatherUI == '04'){
                var gaterUIView = new GatherUIView({
                    gather_ui:gatherUI,
                    pageid:window.PAGE_ID.BILLING,
                    currentid:window.PAGE_ID.ALIPAY,
                    gather_id:gatherId,
                    gather_name:gatherName,
                    receivedsum:receivedSum,
                    orderNo:orderNo,
                    callback:function (attrs) {
                        var receivedaccount = $('input[name = alipay-account]').val();
                        var attrData = {};
                        attrData['gather_id'] = attrs.gather_id;
                        attrData['receivedsum'] = attrs.receivedsum;
                        attrData['gather_name'] = attrs.gather_name;
                        attrData['gather_no'] = receivedaccount;
                        attrData['gather_kind'] = attrs.gatherKind;
                        attrData['orderNo'] = orderNo;
                        _self.prepay(gatherUI, receivedaccount,attrData,orderNo);
                    }
                });
                this.showModal(window.PAGE_ID.ALIPAY,gaterUIView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = alipay-account]').focus();
                });
            }else if(gatherUI == '05'){
                var gaterUIView = new GatherUIView({
                    gather_ui:gatherUI,
                    pageid:window.PAGE_ID.BILLING,
                    currentid:window.PAGE_ID.WECHAT,
                    gather_id:gatherId,
                    gather_name:gatherName,
                    receivedsum:receivedSum,
                    orderNo:orderNo,
                    callback:function (attrs) {
                        var receivedaccount = $('input[name = wechat-account]').val();
                        var attrData = {};
                        attrData['gather_id'] = attrs.gather_id;
                        attrData['receivedsum'] = attrs.receivedsum;
                        attrData['gather_name'] = attrs.gather_name;
                        attrData['gather_no'] = receivedaccount;
                        attrData['gather_kind'] = attrs.gatherKind;
                        attrData['orderNo'] = orderNo;
                        _self.prepay(gatherUI, receivedaccount,attrData, orderNo);
                        //Backbone.trigger('onReceivedsum',attrData);
                        //_self.hideModal(window.PAGE_ID.BILLING);
                        //$('input[name = billing]').focus();
                    }
                });
                this.showModal(window.PAGE_ID.WECHAT,gaterUIView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = wechat-account]').focus();
                });
            }
        },

        /**
         * 调用支付宝接口
         */
       prepay: function (gatherUI, receivedaccount, attrData, orderNo) {
            var _self = this;
            var data = {};
            if(gatherUI == '04') {
                data['orderid'] = orderNo;
                data['merid'] = '000201504171126553';
                data['authno'] = receivedaccount;
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'zfb';
                data['payway'] = 'barcode';
                data['zfbtwo'] = 'zfbtwo';
            }else if(gatherUI == '05') {
                data['orderid'] = orderNo;
                data['merid'] = '000201504171126553';
                data['authno'] = receivedaccount;
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'wx';
                data['payway'] = 'barcode';
            }
            resource.post('http://114.55.62.102:9090/api/pay/xfb/micropay', data, function (resp) {
                if(resp.data['flag'] == '00') {
                    Backbone.trigger('onReceivedsum',attrData);
                    _self.hideModal(window.PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
                }else {
                    toastr.error('支付失败');
                }
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