/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-rtbilltype/model',
    '../../moduals/modal-rtbilltype/collection',
    '../../moduals/modal-rtgatherui/view',
    'text!../../moduals/modal-rtbilltype/billingtypetpl.html',
    'text!../../moduals/modal-rtbilltype/tpl.html',
], function (BaseModalView,BilltypeModel,BilltypeCollection, GatherUIView, billingtypetpl, tpl) {

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
            this.bindModalKeyEvents(window.PAGE_ID.RT_BILLING_TYPE, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                $('input[name = billingrt]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.RT_BILLING_TYPE, window.KEYS.Down, function() {
               _self.scrollDown();
            });
            this.bindModalKeyEvents(window.PAGE_ID.RT_BILLING_TYPE, window.KEYS.Up, function() {
               _self.scrollUp();
            });

            this.bindModalKeyEvents(window.PAGE_ID.RT_BILLING_TYPE, window.KEYS.Enter, function() {
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
            var receivedSum = this.attrs.receivedsum;
            var gatherKind = this.attrs.gather_kind;
            var gathermodel = _.where(this.visibleTypes,{gather_id:gatherId});
            var gatherUI = gathermodel[0].gather_ui;
            $('.modal-backdrop').remove();
            this.hideModal(window.PAGE_ID.BILLING_RETURN);
            if(gatherUI == '01'){
                var gaterUIView = new GatherUIView({
                    gather_ui:gatherUI,
                    pageid:window.PAGE_ID.BILLING_RETURN,
                    currentid:window.PAGE_ID.RT_BILLING_ACCOUNT,
                    gather_id:gatherId,
                    gather_name:gatherName,
                    receivedsum:receivedSum,
                    gatherKind:gatherKind,
                    callback: function (attrs) {
                        var receivedaccount = $('#receive_account').val();
                        //if(receivedaccount == '') {
                        //    toastr.warning('您输入的支付账号为空，请重新输入');
                        //} else if(receivedaccount == 0){
                        //    toastr.warning('支付账号不能为零，请重新输入');
                        //} else {
                        var attrData = {};
                        attrData['gather_id'] = attrs.gather_id;
                        attrData['receivedsum'] = attrs.receivedsum;
                        attrData['gather_name'] = attrs.gather_name;
                        attrData['gather_no'] = receivedaccount;
                        attrData['gather_kind'] = attrs.gatherKind;
                        Backbone.trigger('onReceivedsum',attrData);
                        _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                        $('input[name = billingrt]').focus();
                        //}
                    }
                });
                this.showModal(window.PAGE_ID.RT_BILLING_ACCOUNT, gaterUIView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receive_account]').focus();
                });
            }else if(gatherUI == '04'){
                var gaterUIView = new GatherUIView({
                    gather_ui:gatherUI,
                    pageid:window.PAGE_ID.BILLING_RETURN,
                    currentid:window.PAGE_ID.RT_ALIPAY,
                    gather_id:gatherId,
                    gather_name:gatherName,
                    receivedsum:receivedSum,
                    callback:function (attrs) {
                        var receivedaccount = $('input[name = alipay-account]').val();
                        //if(receivedaccount == '') {
                        //    toastr.warning('您输入的支付账号为空，请重新输入');
                        //} else if(receivedaccount == 0) {
                        //    toastr.warning('支付账号不能为零，请重新输入');
                        //}else{
                        var attrData = {};
                        attrData['gather_id'] = attrs.gather_id;
                        attrData['receivedsum'] = attrs.receivedsum;
                        attrData['gather_name'] = attrs.gather_name;
                        attrData['gather_no'] = receivedaccount;
                        attrData['gather_kind'] = attrs.gatherKind;
                        console.log(attrData);
                        Backbone.trigger('onReceivedsum',attrData);
                        _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                        $('input[name = billingrt]').focus();
                        //}
                    }
                });
                this.showModal(window.PAGE_ID.RT_ALIPAY,gaterUIView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = alipay-account]').focus();
                });
            }else if(gatherUI == '05'){
                var gaterUIView = new GatherUIView({
                    gather_ui:gatherUI,
                    pageid:window.PAGE_ID.BILLING_RETURN,
                    currentid:window.PAGE_ID.RT_WECHAT,
                    gather_id:gatherId,
                    gather_name:gatherName,
                    receivedsum:receivedSum,
                    callback:function (attrs) {
                        var receivedaccount = $('input[name = wechat-account]').val();
                        //if(receivedaccount == '') {
                        //    toastr.warning('您输入的支付账号为空，请重新输入');
                        //} else if(receivedaccount == 0) {
                        //    toastr.warning('支付账号不能为零，请重新输入');
                        //}else{
                        var attrData = {};
                        attrData['gather_id'] = attrs.gather_id;
                        attrData['receivedsum'] = attrs.receivedsum;
                        attrData['gather_name'] = attrs.gather_name;
                        attrData['gather_no'] = receivedaccount;
                        attrData['gather_kind'] = attrs.gatherKind;
                        console.log(attrData);
                        Backbone.trigger('onReceivedsum',attrData);
                        _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                        $('input[name = billingrt]').focus();
                        //}
                    }
                });
                this.showModal(window.PAGE_ID.RT_WECHAT,gaterUIView);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = wechat-account]').focus();
                });
            }
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
            console.log(this.index);
            this.onReceived(this.index);
        },

        onBillTypeClicked: function (e) {
            this.index = $(e.currentTarget).data('index');
            $(e.currentTarget).addClass('cus-selected').siblings().removeClass('cus-selected');
        }

    });

    return billtypeView;
});