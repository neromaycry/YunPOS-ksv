/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-billingtype/model',
    '../../moduals/modal-billingtype/collection',
    '../../moduals/modal-billingaccount/view',
    'text!../../moduals/modal-billingtype/billingtypetpl.html',
    'text!../../moduals/modal-billingtype/tpl.html',
], function (BaseModalView,BilltypeModel,BilltypeCollection,BillaccountView,billingtypetpl, tpl) {

    var billtypeView = BaseModalView.extend({

        id: "billtypeView",

        template: tpl,

        template_billingtype:billingtypetpl,

        i:0,

        input: 'input[name = receivedsum]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOkClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
            'click .keyup':'onKeyUp',
            'click .keydown':'onKeyDown'
        },

        modalInitPage: function () {
            var _self = this;
            if(storage.isSet(system_config.GATHER_KEY)) {
                this.collection = new BilltypeCollection();
                var tlist = storage.get(system_config.GATHER_KEY);
                var visibleTypes = _.where(tlist,{visible_flag:'1'});
                if(this.attrs != '00'){
                    var gathertype = _.where(visibleTypes,{gather_type:this.attrs});
                    console.log(gathertype);
                    this.collection.set(gathertype);
                }else {
                    var gathertype = _.where(visibleTypes,{gather_type:this.attrs});
                    for(var i = 1;i < gathertype.length;i++){
                        this.collection.push(gathertype[i]);
                    }
                    console.log(this.collection);
                }
            }
            this.initTemplates();
            this.handleEvents();
            $('.modal').on('shown.bs.modal',function(e) {
                $('input[name = receivedsum]').focus();
                $('input[name = receivedsum]').val(_self.model.get('unpaidamount'));
            });

        },

        initTemplates: function () {
            this.template_billingtype = _.template(this.template_billingtype);
        },
        handleEvents: function () {
            Backbone.off('onunpaidamount');
            Backbone.on('onunpaidamount',this.onunpaidamount,this);
        },

        onunpaidamount: function (data) {
            this.model = new BilltypeModel();
            this.model.set({
                unpaidamount:data['unpaidamount']
            });
            this.render();
            this.renderBilltype();
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

        bindModalKeyEvents: function (id,keyCode,callback) {
            $(document).keydown(function (e) {
                e = e || window.event;
                console.log(e.which);
                if(e.which == keyCode && pageId == id) {
                    callback();
                }
            });
        },

        /**
         * Enter和确定
         */
        onReceived:function() {
            var _self = this;
            var receivedsum = $('#receivedsum').val();
            if(receivedsum == '') {
                toastr.warning('您输入的支付金额为空，请重新输入');
            }else if(receivedsum == 0) {
                toastr.warning('支付金额不能为零，请重新输入');
            }else if(receivedsum > (_self.model.get('unpaidamount') + 100)){
                toastr.warning('找零金额超限');
            }else{
                var attrData = {};
                attrData['gather_id'] = _self.collection.at(_self.i).get('gather_id');
                attrData['gather_name'] = _self.collection.at(_self.i).get('gather_name');
                attrData['gather_type'] = _self.collection.at(_self.i).get('gather_type');
                attrData['receivedsum'] = receivedsum;
                $(".modal-backdrop").remove();
                _self.hideModal(window.PAGE_ID.BILLING);
                this.billaccountview = new BillaccountView(attrData);
                _self.showModal(window.PAGE_ID.BILLING_ACCOUNT,_self.billaccountview);
                $('.modal').on('shown.bs.modal',function(e) {
                    $('input[name = receive_account]').focus();
                });
            }
        },

        onOkClicked:function(){
          this.onReceived();
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

        onKeyUp: function () {
            this.scrollUp();
        },

        onKeyDown: function () {
            this.scrollDown();
        }

    });

    return billtypeView;
});