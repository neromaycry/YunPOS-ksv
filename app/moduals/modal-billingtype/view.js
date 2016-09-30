/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billingtype/model',
    '../../moduals/modal-billingtype/collection',
    '../../moduals/modal-billingaccount/view',
    '../../moduals/modal-alipay/view',
    '../../moduals/modal-gatherui/view',
    'text!../../moduals/modal-billingtype/billingtypetpl.html',
    'text!../../moduals/modal-billingtype/tpl.html',
], function (BaseModalView,BilltypeModel,BilltypeCollection,BillaccountView,AliPayView, GatherUIView, billingtypetpl, tpl) {

    var billtypeView = BaseModalView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype:billingtypetpl,

        i:0,

        //input: 'input[name = gather-no]',

        events:{
            //'click .cancel':'onCancelClicked',
            //'click .ok':'onOkClicked',
            //'click .btn-num':'onNumClicked',
            //'click .btn-backspace':'onBackspaceClicked',
            //'click .btn-clear':'onClearClicked',
            'click .keyup':'onKeyUp',
            'click .keydown':'onKeyDown'
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
                _self.onReceived();
            });
        },

        /**
         * Enter和确定
         */
        onReceived:function() {
            var _self = this;
            var gatherId = this.collection.at(this.i).get('gather_id');
            var gatherName = this.collection.at(this.i).get('gather_name');
            var receivedSum = this.attrs['receivedsum'];
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
                    callback: function (attrs) {
                        var receivedaccount = $('#receive_account').val();
                        if(receivedaccount == '') {
                            toastr.warning('您输入的支付账号为空，请重新输入');
                        } else if(receivedaccount == 0){
                            toastr.warning('支付账号不能为零，请重新输入');
                        } else {
                            var attrData = {};
                            attrData['gather_id'] = attrs.gather_id;
                            attrData['receivedsum'] = attrs.receivedsum;
                            attrData['gather_name'] = attrs.gather_name;
                            attrData['gather_no'] = receivedaccount;
                            console.log(attrData);
                            Backbone.trigger('onReceivedsum',attrData);
                            _self.hideModal(window.PAGE_ID.BILLING);
                            $('input[name = billing]').focus();
                        }
                    }
                });
                this.showModal(window.PAGE_ID.BILLING_ACCOUNT, gaterUIView);
                //this.billaccountview = new BillaccountView(attrData);
                //this.showModal(window.PAGE_ID.BILLING_ACCOUNT, this.billaccountview);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receive_account]').focus();
                });
            }else if(gatherUI == '04'){
                this.alipayview = new AliPayView(attrData);
                this.showModal(window.PAGE_ID.ALIPAY,this.alipayview);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = alipay-account]').focus();
                });
            }else if(gatherUI == '05'){
                alert('微信');
            }
        },

        //onOkClicked:function(){
        //  this.onReceived();
        //},
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

        //onCancelClicked: function () {
        //    this.hideModal(window.PAGE_ID.BILLING);
        //},
        //
        //onNumClicked: function (e) {
        //    var value = $(e.currentTarget).data('num');
        //    var str = $(this.input).val();
        //    str += value;
        //    $(this.input).val(str);
        //},

        //onBackspaceClicked: function (e) {
        //    var str = $(this.input).val();
        //    str = str.substring(0, str.length-1);
        //    $(this.input).val(str);
        //},

        //onClearClicked: function () {
        //    $(this.input).val('');
        //},

        //onKeyUp: function () {
        //    this.scrollUp();
        //},
        //
        //onKeyDown: function () {
        //    this.scrollDown();
        //}

    });

    return billtypeView;
});