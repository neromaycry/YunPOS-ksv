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
            this.request = new ECardPayModel();
            this.model = new ECardPayModel();
            this.collection = new ECardPayCollection();
            this.model.set({
                unpaidamount:this.unpaidamount,
                receivedsum:this.receivedsum
            });
            var data = {
                cust_id:this.attrs.cust_id,
                gather_detail:this.attrs.gather_detail,
                goods_detail:this.attrs.goods_detail
            };
            if(storage.isSet(system_config.ONE_CARD_KEY,card_id)) {
                _self.collection.set(storage.get(system_config.ONE_CARD_KEY,card_id));
            } else {
                this.request.account(data,function(resp) {
                    if(resp.status == '00'){
                        _self.collection.set(resp.gather_detial);
                        console.log(_self.collection);
                        storage.set(system_config.ONE_CARD_KEY,card_id,'detail',_self.collection.toJSON());
                    } else {
                        toastr.error(resp.msg);
                    }
                });
            }

            setTimeout(function () {
               _self.renderEcardDetail();
                $('input[name = ecard_receivedsum]').val(_self.receivedsum);
            }, 100);

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
            var receivedsum = $(this.input).val();
            var card_id = this.attrs['card_id'];
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length-1) > 1 || receivedsum == '.') {
                layer.msg('无效的支付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(index == -1 || index == undefined) {
                //初始时设置i=-1,如果i=-1则为选中任何支付方式
                layer.msg('请选择支付方式', optLayerWarning);
                return;
            }
            var item = _self.collection.at(index);
            var gatherMoney = parseFloat(item.get('gather_money'));
            if(receivedsum > gatherMoney + parseFloat(receivedsum)){
                layer.msg('支付金额不能大于卡内余额', optLayerWarning);
                return;
            }
            if(this.model.get('receivedsum') != receivedsum){
                layer.msg('请重新选择支付方式', optLayerWarning);
                return;
            }
            item.set({
                gather_money:_self.model.get('gather_money')
            });
            this.collection.at(index).set(item.toJSON());
            var data = {
                gather_id:this.model.get('gather_id'),
                gather_name:this.model.get('gather_name'),
                gather_money:this.model.get('receivedsum'),
                gather_no:this.model.get('gather_no'),
                gather_kind:'04',
                card_id:this.attrs.card_id
            };
            Backbone.trigger('onReceivedsum',data);
            storage.set(system_config.ONE_CARD_KEY,card_id,_self.collection);
            this.closeLayer(layerindex);
            $('input[name = billing]').focus();

        },

        /**
         * 方向上
         */

        scrollUp:function(){
            var receivedsum = $('#ecard_receivedsum').val();
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length - 1) > 1 || receivedsum == '.') {
                layer.msg('无效的支付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedsum > this.unpaidamount){
                layer.msg('支付金额不能大于待支付金额', optLayerWarning);
                return;
            }
            if(this.i > 0){
                this.i--;
                this.choiceCard(this.i);
                $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        /**
         * 方向下
         */
        scrollDown:function(){
            var receivedsum = $(this.input).val();
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length - 1) > 1 ||receivedsum == '.') {
                layer.msg('无效的支付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedsum > this.unpaidamount){
                layer.msg('支付金额不能大于待支付金额', optLayerWarning);
                return;
            }
            if (this.i < this.collection.length - 1) {
                    this.i++;
                    this.choiceCard(this.i);
                    $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
               }
            },
        /**
         * 选择支付的方式
         */
        choiceCard:function(index){
            var receivedsum = $(this.input).val();
            var item = this.collection.at(index);
            var cardId = this.attrs.card_id;
            this.collection.set(storage.get(system_config.ONE_CARD_KEY,cardId));
            var gatherMoney = parseFloat(item.get('gather_money'));
            gatherMoney = gatherMoney - receivedsum;
            item.set({
                gather_money: gatherMoney
            });
            this.collection.at(index).set(item.toJSON());
            this.model.set({
                gather_id:item.get('gather_id'),
                gather_name:item.get('gather_name'),
                gather_no:item.get('gather_no'),
                receivedsum:parseFloat(receivedsum),
                gather_money:gatherMoney
            });
            this.renderEcardDetail();
        },

        onAccountClicked: function (e) {
            var index = $(e.currentTarget).data('index');
            var receivedsum = $(this.input).val();
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length - 1) > 1 || receivedsum == '.') {
                layer.msg('无效的支付金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if(receivedsum > this.unpaidamount){
                layer.msg('支付金额不能大于待支付金额', optLayerWarning);
                return;
            }
            if (index < this.collection.length - 1) {
                this.choiceCard(index);
                $('#li' + index).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            if (this.attrs.pageid == 6) {
                $('input[name = billing]').focus();
            } else {
                $('input[name = billingrt]').focus();
            }
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
        }
    });


    return ecardpayView;
});