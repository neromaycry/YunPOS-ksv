/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtecardpay/model',
    '../../moduals/layer-rtecardpay/collection',
    'text!../../moduals/layer-rtecardpay/tpl.html',
    'text!../../moduals/layer-rtecardpay/ecarddetailtpl.html'
], function (BaseLayerView, ECardPayModel, ECardPayCollection, tpl, ecarddetailtpl) {

    var ecardpayView = BaseLayerView.extend({

        id: "ecardpayView",

        template: tpl,

        template_ecarddetail: ecarddetailtpl,

        i: -1,

        unpaidamount: 0,

        input: 'input[name = ecard_receivedsum]',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .ok': 'onOkClicked',
            'click .btn-num': 'onNumClicked',
            'click .btn-clear': 'onClearClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click [data-index]': 'onAccountClicked',
            'click .keydown': 'onKeyDownClicked',
            'click .keyup': 'onKeyUpClicked'
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            console.log('**************');
            var _self = this;
            this.initTemplates();
            var cardId = this.attrs['card_id'];
            this.unpaidamount = this.attrs['unpaidamount'];
            this.receivedsum = this.attrs['gather_money'];
            console.log(this.unpaidamount);
            this.request = new ECardPayModel();
            this.model = new ECardPayModel();
            this.collection = new ECardPayCollection();
            this.model.set({
                unpaidamount: this.unpaidamount,
                receivedsum: this.receivedsum
            });
            var data = {
                cust_id: this.attrs.cust_id,
                gather_detail: this.attrs.gather_detail,
                goods_detail: this.attrs.goods_detail,
                account_type_code: this.attrs.account_type_code
            };

            this.request.account(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        _self.collection.push(resp.gather_detial);
                        storage.set(system_config.ONE_CARD_KEY, cardId, _self.collection);
                        setTimeout(function () {
                            _self.renderEcardDetail();
                            $('input[name = ecard_receivedsum]').val(_self.receivedsum);
                        }, 100);
                    } else {
                        //toastr.error(resp.msg);
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            });

        },


        initTemplates: function () {
            this.template_ecarddetail = _.template(this.template_ecarddetail);
        },


        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.RT_LAYER_ECARD_PAY, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.RT_LAYER_ECARD_PAY, KEYS.Down, function () {
                _self.scrollDown();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.RT_LAYER_ECARD_PAY, KEYS.Up, function () {
                _self.scrollUp();
            });

            this.bindLayerKeyEvents(window.PAGE_ID.RT_LAYER_ECARD_PAY, KEYS.Enter, function () {
                _self.onOkClicked();
            });
        },

        renderEcardDetail: function () {
            this.$el.find('.for-ecarddetail').html(this.template_ecarddetail(this.collection.toJSON()));
            return this;
        },

        /**
         * enter和确定点击事件
         */
        doPay: function (index) {
            var receivedsum = $(this.input).val();
            var cardId = this.attrs['card_id'];
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length - 1) > 1 || receivedsum == '.') {
                layer.msg('无效的退款金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (index == -1 || index == undefined) {
                //初始时设置i=-1,如果i=-1则为选中任何退款方式
                layer.msg('请选择退款方式', optLayerWarning);
                return;
            }
            var item = this.collection.at(index);
            var gatherMoney = parseFloat(item.get('gather_money'));
            if (this.model.get('receivedsum') != receivedsum) {
                layer.msg('请重新选择退款方式', optLayerWarning);
                this.collection.set(storage.get(system_config.ONE_CARD_KEY, cardId));
                this.i = -1;
                $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
                this.renderEcardDetail();
                return;
            }
            item.set({
                gather_money: this.model.get('gather_money')
            });
            this.collection.at(index).set(item.toJSON());
            var data = {
                gather_id: this.model.get('gather_id'),
                gather_name: this.model.get('gather_name'),
                gather_money: this.model.get('receivedsum'),
                gather_no: this.model.get('gather_no'),
                gather_kind: '04',
                card_id: this.attrs.card_id
            };
            Backbone.trigger('onRTReceivedsum', data);
            storage.remove(system_config.ONE_CARD_KEY);
            this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();

        },

        /**
         * 方向上
         */

        scrollUp: function () {
            var receivedsum = $(this.input).val();
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length - 1) > 1 || receivedsum == '.') {
                layer.msg('无效的退款金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedsum > this.unpaidamount) {
                layer.msg('退款金额不能大于待退款金额', optLayerWarning);
                return;
            }
            if (this.i > 0) {
                this.i--;
                this.choiceCard(this.i);
                $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },

        /**
         * 方向下
         */
        scrollDown: function () {
            var receivedsum = $(this.input).val();
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length - 1) > 1 || receivedsum == '.') {
                layer.msg('无效的退款金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedsum > this.unpaidamount) {
                layer.msg('退款金额不能大于待退款金额', optLayerWarning);
                return;
            }
            if (this.i < this.collection.length - 1) {
                this.i++;
                this.choiceCard(this.i);
                $('#li' + this.i).addClass('cus-selected').siblings().removeClass('cus-selected');
            }
        },


        onAccountClicked: function (e) {
            var index = $(e.currentTarget).data('index');
            var receivedsum = $(this.input).val();
            if (receivedsum == '' || parseFloat(receivedsum) == 0 || (receivedsum.split('.').length - 1) > 1 || receivedsum == '.') {
                layer.msg('无效的退款金额', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (receivedsum > this.unpaidamount) {
                layer.msg('退款金额不能大于待退款金额', optLayerWarning);
                return;
            }
            if (this.i == index) {
                layer.msg('已选择该退款方式', optLayerWarning);
                return;
            }
            this.i = index;
            this.choiceCard(index);
            $('#li' + index).addClass('cus-selected').siblings().removeClass('cus-selected');
        },
        /**
         * 选择退款的方式
         */
        choiceCard: function (index) {
            var receivedsum = $(this.input).val();
            var item = this.collection.at(index);
            var cardId = this.attrs.card_id;
            this.collection.set(storage.get(system_config.ONE_CARD_KEY, cardId));
            var gatherMoney = parseFloat(item.get('gather_money'));
            gatherMoney = parseFloat(gatherMoney) + parseFloat(receivedsum);
            item.set({
                gather_money: gatherMoney
            });
            this.collection.at(index).set(item.toJSON());
            this.model.set({
                gather_id: item.get('gather_id'),
                gather_name: item.get('gather_name'),
                gather_no: item.get('gather_no'),
                receivedsum: parseFloat(receivedsum),
                gather_money: gatherMoney
            });
            this.renderEcardDetail();
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();
        },

        onOkClicked: function () {
            this.doPay(this.i);
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        }
    });


    return ecardpayView;
});