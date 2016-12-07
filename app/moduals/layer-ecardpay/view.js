/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-ecardpay/model',
    '../../moduals/layer-ecardpay/collection',
    'text!../../moduals/layer-ecardpay/tpl.html',
    'text!../../moduals/layer-ecardpay/ecarddetailtpl.html'
], function (BaseLayerView, ECardPayModel, ECardPayCollection, tpl, ecarddetailtpl) {

    var ecardpayView = BaseLayerView.extend({

        id: "ecardpayView",

        template: tpl,

        template_ecarddetail:ecarddetailtpl,

        i:-1,

        unpaidamount:0,

        input: 'input[name = ecard_receivedsum]',

        events:{
            'click .cancel':'onCancelClicked',
            'click .ok':'onOkClicked',
            'click .btn-num':'onNumClicked',
            'click .btn-clear':'onClearClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click [data-index]':'onAccountClicked',
            'click .keydown':'onKeyDownClicked',
            'click .keyup':'onKeyUpClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.initTemplates();
            var card_id = this.attrs['card_id'];
            this.unpaidamount = this.attrs['unpaidamount'];
            this.receivedsum = this.attrs['receivedsum'];
            var data = {};
            data['cust_id'] = this.attrs['cust_id'];
            data['gather_detail'] = this.attrs['gather_detail'];
            data['goods_detail'] = this.attrs['goods_detail'];
            this.request = new ECardPayModel();
            this.model = new ECardPayModel();
            this.collection = new ECardPayCollection();
            this.model.set({
                unpaidamount:this.unpaidamount,
                receivedsum:this.receivedsum
            });
            //this.render();
            if(storage.isSet(system_config.ONE_CARD_KEY,card_id)){
                _self.collection.set(storage.get(system_config.ONE_CARD_KEY,card_id,'detail'));
            }else{
                this.request.account(data,function(resp) {
                    if(resp.status == '00'){
                        _self.collection.set(resp.gather_detial);
                        console.log(_self.collection);
                        storage.set(system_config.ONE_CARD_KEY,card_id,'detail',_self.collection.toJSON());
                    }else {
                        toastr.error(resp.msg);
                    }
                    _self.renderEcardDetail();
                });
            }
            this.renderEcardDetail();

        },
        initTemplates: function () {
            this.template_ecarddetail = _.template(this.template_ecarddetail);
        },


        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_PAY, KEYS.Esc , function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_PAY, KEYS.Down, function() {
                _self.scrollDown();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_PAY, KEYS.Up, function() {
                _self.scrollUp();
            });

            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_PAY, KEYS.Enter, function() {
               _self.doPay(_self.i);
            });
        },

        renderEcardDetail:function () {
            this.$el.find('.for-ecarddetail').html(this.template_ecarddetail(this.collection.toJSON()));
            return this;
        },

        /**
         * enter和确定点击事件
         */
        doPay:function (index){
            var _self = this;
            var receivedsum = $('#ecard_receivedsum').val();
            var card_id = _self.attrs['card_id'];
            if(index == -1){
                //初始时设置i=-1,如果i=-1则为选中任何支付方式
                toastr.warning('请选择支付方式');
            }else if(index == undefined){
                toastr.warning('请选择支付方式');
            }else {
                var item = _self.collection.at(index);
                console.log(item);
                var gather_money = parseFloat(item.get('gather_money'));
                if (receivedsum == '') {
                    toastr.warning('输入金额不能为空');
                } else if (receivedsum == 0) {
                    toastr.warning('输入金额不能为零');
                } else if((receivedsum.split('.').length-1)){
                    toastr.warning('请输入有效的金额');
                }else if(receivedsum > _self.unpaidamount){
                    toastr.warning('输入金额不能大于待支付金额');
                }else if(receivedsum > gather_money){
                    toastr.warning('输入金额不能大于卡内余额');
                }else if(_self.model.get('receivedsum') != receivedsum){
                    toastr.warning('请重新选择支付方式');
                }else{
                    item.set({
                        gather_money:_self.model.get('gather_money')
                    });
                    _self.collection.at(index).set(item.toJSON());
                    var data = {};
                    data['gather_id'] = _self.model.get('gather_id');
                    data['gather_name'] = _self.model.get('gather_name');
                    data['receivedsum'] = _self.model.get('receivedsum');
                    data['gather_no'] = _self.model.get('gather_no');
                    data['gather_kind'] = '06';
                    data['card_id'] = _self.attrs['card_id'];
                    Backbone.trigger('onReceivedsum',data);
                    storage.set(system_config.ONE_CARD_KEY,card_id,'detail',_self.collection);
                    _self.hideModal(window.PAGE_ID.BILLING);
                    $('input[name = billing]').focus();
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
                this.choiceCard(this.i);
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
                this.choiceCard(this.i);
                $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
                }
            },
        /**
         * 选择支付的方式
         */
        choiceCard:function(index){
            var receivedsum = $('#ecard_receivedsum').val();
            var card_id = this.attrs['card_id'];
            this.collection.set(storage.get(system_config.ONE_CARD_KEY,card_id,'detail'));
            var item = this.collection.at(index);
            var gather_money = parseFloat(item.get('gather_money'));
            gather_money = gather_money - receivedsum;
            gather_money = gather_money.toFixed(2);
            item.set({
                gather_money: gather_money
            });
            this.collection.at(index).set(item.toJSON());
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
            this.closeLayer(layerindex);
        },

        onOkClicked: function () {
            var index = $('.cus-selected').data('index');
            this.doPay(index);
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

        onKeyUpClicked:function (){
            this.scrollUp();
        },

        onKeyDownClicked:function (){
            this.scrollDown();
        },
        onAccountClicked: function (e) {
            var index = $(e.currentTarget).data('index');
            this.choiceCard(index);
            $('#li' + index).addClass('cus-selected').siblings().removeClass('cus-selected');
        }
    });


    return ecardpayView;
});