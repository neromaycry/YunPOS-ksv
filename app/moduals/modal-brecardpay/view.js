/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseModalView',
    '../../moduals/modal-brecardpay/model',
    '../../moduals/modal-brecardpay/collection',
    'text!../../moduals/modal-brecardpay/ecardpaytpl.html',
    'text!../../moduals/modal-brecardpay/ecarddetailtpl.html'
], function (BaseModalView,BREcardpayModel,BREcardpayCollection, tpl, brecarddetailtpl) {

    var brecardpayView = BaseModalView.extend({

        id: "brecardpayView",

        template: tpl,

        template_ecarddetail:brecarddetailtpl,

        i:-1,

        unpaidamount:0,

        input: 'input[name = ecard_receivedsum]',

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
            this.initTemplates();
            var card_id = this.attrs['card_id'];
            this.unpaidamount = this.attrs['unpaidamount'];
            var data = {};
            data['cust_id'] = this.attrs['cust_id'];
            data['gather_detail'] = this.attrs['gather_detail'];
            data['goods_detail'] = this.attrs['goods_detail'];
            this.request = new BREcardpayModel();
            this.model = new BREcardpayModel();
            this.collection = new BREcardpayCollection();
            this.model.set({
                unpaidamount:this.unpaidamount
            });
            this.render();
            $('.modal').on('shown.bs.modal',function(e) {
                $('input[name = ecard_receivedsum]').focus();
                $('input[name = ecard_receivedsum]').val(_self.unpaidamount);

            });
            if(storage.isSet(system_config.ONE_CARD_KEY,card_id)){
                _self.collection.set(storage.get(system_config.ONE_CARD_KEY,card_id,'detail'));
            }else{
                this.request.account(data,function(resp) {
                    if(resp.status == '00'){
                        _self.collection.set(resp.gather_detial);
                        console.log(_self.collection);
                        storage.set(system_config.ONE_CARD_KEY,card_id,'detail',_self.collection.toJSON());
                    }
                    _self.renderEcardDetail();
                });
            }
            this.renderEcardDetail();

        },
        initTemplates: function () {
            this.template_ecarddetail = _.template(this.template_ecarddetail);
        },


        bindModalKeys: function () {
            var _self = this;
            this.bindModalKeyEvents(window.PAGE_ID.BR_ONECARD_PAY, window.KEYS.Esc , function () {
                _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                $('input[name = billingrt]').focus();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BR_ONECARD_PAY, window.KEYS.Down, function() {
                _self.scrollDown();
            });
            this.bindModalKeyEvents(window.PAGE_ID.BR_ONECARD_PAY, window.KEYS.Up, function() {
                _self.scrollUp();
            });

            this.bindModalKeyEvents(window.PAGE_ID.BR_ONECARD_PAY, window.KEYS.Enter, function() {
               _self.doPay();
            });
        },

        renderEcardDetail:function () {
            this.$el.find('.for-ecarddetail').html(this.template_ecarddetail(this.collection.toJSON()));
            return this;
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
         * enter和确定点击事件
         */
        doPay:function (){
            var _self = this;
            var receivedsum = $('#ecard_receivedsum').val();
            var card_id = _self.attrs['card_id'];
            if(_self.i == -1){
                //初始时设置i=-1,如果i=-1则为选中任何支付方式
                toastr.warning('请选择支付方式');
            }else {
                var item = _self.collection.at(_self.i);
                var gather_money = parseFloat(item.get('gather_money'));
                if(receivedsum == ''){
                    toastr.warning('输入金额不能为空');
                }else if(receivedsum == 0){
                    toastr.warning('输入金额不能为零');
                }else if(receivedsum > _self.unpaidamount){
                    toastr.warning('输入金额不能大于待退货金额');
                }else if(receivedsum > gather_money){
                    toastr.warning('输入金额不能大于卡内余额');
                }else {
                    item.set({
                        gather_money:_self.model.get('gather_money')
                    });
                    _self.collection.at(_self.i).set(item.toJSON());
                    var data = {};
                    data['gather_id'] = _self.model.get('gather_id');
                    data['gather_name'] = _self.model.get('gather_name');
                    data['receivedsum'] = _self.model.get('receivedsum');
                    data['gather_no'] = _self.model.get('gather_no');
                    data['gather_type'] = '04';
                    data['card_id'] = _self.attrs['card_id'];
                    Backbone.trigger('onReceivedsum',data);
                    storage.set(system_config.ONE_CARD_KEY,card_id,'detail',_self.collection);
                    _self.hideModal(window.PAGE_ID.BILLING_RETURN);
                    $('input[name = billingrt]').focus();
                }
            }
        },

        /**
         * 方向上
         */

        scrollUp:function(){
            var receivedsum = $('#ecard_receivedsum').val();
            if(receivedsum == ''){
                toastr.warning('请先输入支付金额');
            }else if(this.i > 0){
                this.i--;
                this.choiceCard();
                $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        /**
         * 方向下
         */
        scrollDown:function(){
            var receivedsum = $('#ecard_receivedsum').val();
            if(receivedsum == ''){
                toastr.warning('请先输入支付金额');
            }else if(this.i < this.collection.length - 1){
                    this.i++;
                this.choiceCard();
                    $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
                }
            },
        /**
         * 选择支付的方式
         */
        choiceCard:function(){
            var receivedsum = $('#ecard_receivedsum').val();
            var card_id = this.attrs['card_id'];
            this.collection.set(storage.get(system_config.ONE_CARD_KEY,card_id,'detail'));
            var item = this.collection.at(this.i);
            var gather_money = parseFloat(item.get('gather_money'));
            gather_money = gather_money - receivedsum;
            gather_money = gather_money.toFixed(2);
            item.set({
                gather_money: gather_money
            });
            this.collection.at(this.i).set(item.toJSON());
            this.model.set({
                gather_id:item.get('gather_id'),
                gather_name:item.get('gather_name'),
                gather_no:item.get('gather_no'),
                receivedsum:parseFloat(receivedsum),
                gather_money:gather_money
            });
            this.renderEcardDetail();
        },
        onCancelClicked: function () {
            this.hideModal(window.PAGE_ID.BILLING_RETURN);
        },

        onOkClicked: function () {
            this.doPay();
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

        onKeyUp:function (){
            this.scrollUp();
        },
        onKeyDown:function (){
            this.scrollDown();
        }
    });


    return brecardpayView;
});