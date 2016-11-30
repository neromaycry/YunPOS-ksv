/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtgatherui/model',
    '../../moduals/layer-bankcard/view',
    'text!../../moduals/layer-rtgatherui/contenttpl.html',
    'text!../../moduals/layer-rtgatherui/commontpl.html',
    'text!../../moduals/layer-rtgatherui/thirdpay.html',
    'text!../../moduals/layer-rtgatherui/numpadtpl.html',
    'text!../../moduals/layer-rtgatherui/bankcardtpl.html',
    'text!../../moduals/layer-rtgatherui/tpl.html'
], function (BaseLayerView, LayerGatherUIModel, LayerBankCardView ,  contenttpl, commontpl, thirdpaytpl, numpadtpl, bankcardtpl, tpl) {

    var layerGatherUIView = BaseLayerView.extend({

        id: "layerGatherUIView",

        template: tpl,

        template_numpad: numpadtpl,

        template_bankcard: bankcardtpl,

        gatherUI: '',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .btn-num': 'onNumClicked',
            'click .ok': 'onOKClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.gatherUI = this.attrs.gather_ui;
            this.model = new LayerGatherUIModel();
            this.model.set({
                gather_money: this.attrs.gather_money
            });
            this.switchTemplate(this.gatherUI);
            this.template_content = _.template(this.template_content);
            setTimeout(function () {
                _self.renderContent();
                _self.$el.find('.for-numpad').html(_self.template_numpad);
            }, 100);

        },


        renderContent: function () {
            this.$el.find('.gatherui-content').html(this.template_content(this.model.toJSON()));
            return this;
        },


        switchTemplate: function (gatherUI) {
            switch (gatherUI) {
                case '04':
                case '05':
                    this.template_content = thirdpaytpl;
                    this.input = 'input[name = reference-num]';
                    break;
                case '06':
                    this.template_content = bankcardtpl;
                    this.input = 'input[name = reference-num]';
                    break;
                default:
                    this.template_content = commontpl;
                    this.input = 'input[name = receive-account]';
            }
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_RT_BILLACCOUNT, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_RT_BILLACCOUNT, KEYS.Enter, function () {
                _self.onOKClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_RT_BILLACCOUNT, KEYS.Up, function () {
                var isUserFocused = $('input[name = reference-num]').is(':focus');
                if (isUserFocused) {
                    $('input[name = payment-bill]').focus();
                    _self.input = 'input[name = payment-bill]';
                } else {
                    $('input[name = reference-num]').focus();
                    _self.input = 'input[name = reference-num]';
                }
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_RT_BILLACCOUNT, KEYS.Down, function () {
                var isUserFocused = $('input[name = reference-num]').is(':focus');
                if (isUserFocused) {
                    $('input[name = payment-bill]').focus();
                    _self.input = 'input[name = payment-bill]';
                } else {
                    $('input[name = reference-num]').focus();
                    _self.input = 'input[name = reference-num]';
                }
            });
        },

        //如果当前打开的模态框是银行pos的确认模态框，则按确定后直接跳转下个页面
        onOKClicked: function () {
            var attrs = {};
            if (this.gatherUI == '06') {
                var reference_no = $(this.input).val();
                if (reference_no == '') {
                    layer.msg('请输入系统参考号', optLayerWarning);
                    return;
                }
                this.attrs.swipe_type = 'refund';
                this.attrs.reference_number = reference_no;
                this.closeLayer(layerindex);
                this.openLayer(PAGE_ID.LAYER_BANK_CARD, PAGE_ID.BILLING_RETURN, '银行MIS退款', LayerBankCardView, this.attrs, {area: '300px'});
                return;
            }
            if(this.gatherUI == '04' || this.gatherUI == '05') {
                var reference_no = $('input[name = reference-num]').val();
                var payment_bill = $('input[name = payment-bill]').val();
                if (reference_no == '') {
                    layer.msg('请输入系统参考号', optLayerWarning);
                    return;
                }
                if(payment_bill == '') {
                    layer.msg('请输入第三方支付流水号', optLayerWarning);
                    return;
                }
                loading.show();
                var url = 'http://127.0.0.1:5000/';
                //var url = 'http://121.42.166.147:9090/';
                resource.post(url + 'api/pay/xfb/refund', data, function (resp) {

                });
                attrs = {
                    gather_id: this.attrs.gather_id,
                    gather_name: this.attrs.gather_name,
                    gather_money: this.attrs.gather_money,
                    gather_kind: this.attrs.gather_kind,

                };
                this.closeLayer(layerindex);
                return;
            }
            var gatherNo = $(this.input).val();
            if ((gatherNo.split('.').length - 1) > 0 || gatherNo == '') {
                layer.msg('无效的支付账号', optLayerWarning);
                $(this.input).val('');
                return;
            }
            attrs = {
                gather_id: this.attrs.gather_id,
                gather_name: this.attrs.gather_name,
                gather_money: this.attrs.gather_money,
                gather_kind: this.attrs.gather_kind,
                gather_no: gatherNo
            };
            Backbone.trigger('onReceivedsum', attrs);
            this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billingrt]').focus();
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

    });

    return layerGatherUIView;
});