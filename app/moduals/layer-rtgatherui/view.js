/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtgatherui/model',
    '../../moduals/layer-rtbankcard/view',
    'text!../../moduals/layer-rtgatherui/contenttpl.html',
    'text!../../moduals/layer-rtgatherui/commontpl.html',
    'text!../../moduals/layer-rtgatherui/alipaytpl.html',
    'text!../../moduals/layer-rtgatherui/wechatpaytpl.html',
    'text!../../moduals/layer-rtgatherui/numpadtpl.html',
    'text!../../moduals/layer-rtgatherui/bankcardtpl.html',
    'text!../../moduals/layer-rtgatherui/tpl.html'
], function (BaseLayerView, LayerGatherUIModel,LayerBankCardView, contenttpl, commontpl, alipaytpl, wechatpaytpl, numpadtpl, bankcardtpl, tpl) {

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
            this.gatherId = this.attrs.gather_id;
            this.model = new LayerGatherUIModel();
            this.model.set({
                gather_money: this.attrs.gather_money
            });
            this.switchTemplate(this.gatherId);
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


        switchTemplate: function (gatherId) {
            switch (gatherId) {
                case '12':
                    this.template_content = wechatpaytpl;
                    this.input = 'input[name = wechat-account]';
                    break;
                case '13':
                    this.template_content = alipaytpl;
                    this.input = 'input[name = alipay-account]';
                    break;
                case '16':
                    this.template_content = bankcardtpl;
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
        },

        //如果当前打开的模态框是银行pos的确认模态框，则按确定后直接跳转下个页面
        onOKClicked: function () {
            var attrs = {};
            if (this.gatherId == '16') {
                this.closeLayer(layerindex);
                this.openLayer(PAGE_ID.LAYER_RT_BANKCARD, PAGE_ID.BILLING_RETURN, '银行MIS', LayerBankCardView, this.attrs, {area: '300px'});
                return;
            }
            var gatherNo = $(this.input).val();
            if ((gatherNo.split('.').length - 1) > 0 || gatherNo == '') {
                layer.msg('无效的支付账号', optLayerWarning);
                $(this.input).val('');
                return;
            }
            switch (this.gatherId) {
                case '05':
                    if(luhmCheck(gatherNo)) {
                        attrs = {
                            gather_id:this.attrs.gather_id,
                            gather_name:this.attrs.gather_name,
                            gather_money:this.attrs.gather_money,
                            gather_kind:this.attrs.gather_kind,
                            gather_no:gatherNo
                        };
                        Backbone.trigger('onReceivedsum',attrs);
                        this.closeLayer(layerindex);
                        $('input[name = billingrt]').focus();
                    }else {
                        $(this.input).val('');
                    }
                    break;
                case '12':
                case '13':
                    attrs = {
                        gather_id: this.attrs.gather_id,
                        gather_name: this.attrs.gather_name,
                        gather_money: this.attrs.gather_money,
                        gather_kind: this.attrs.gather_kind,
                        gather_no: '',
                        hasExtra: true,
                        extras: {
                            extra_id: 1,
                            payment_bill: gatherNo
                        }
                    };
                    Backbone.trigger('onReceivedsum', attrs);
                    break;
                default :
                    attrs = {
                        gather_id: this.attrs.gather_id,
                        gather_name: this.attrs.gather_name,
                        gather_money: this.attrs.gather_money,
                        gather_kind: this.attrs.gather_kind,
                        gather_no: gatherNo
                    };
                    Backbone.trigger('onReceivedsum', attrs);
            }
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