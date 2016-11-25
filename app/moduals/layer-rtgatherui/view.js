/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-rtgatherui/model',
    'text!../../moduals/layer-rtgatherui/contenttpl.html',
    'text!../../moduals/layer-rtgatherui/commontpl.html',
    'text!../../moduals/layer-rtgatherui/alipaytpl.html',
    'text!../../moduals/layer-rtgatherui/wechatpaytpl.html',
    'text!../../moduals/layer-rtgatherui/numpadtpl.html',
    'text!../../moduals/layer-rtgatherui/bankcardtpl.html',
    'text!../../moduals/layer-rtgatherui/tpl.html'
], function (BaseLayerView, LayerGatherUIModel, contenttpl, commontpl, alipaytpl, wechatpaytpl, numpadtpl, bankcardtpl, tpl) {

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
            var _self = this;
            this.gatherId = this.attrs.gather_id;
            this.model = new LayerGatherUIModel();
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
                case '05':
                    this.template_content = bankcardtpl;
                    this.input = 'input[name = bk-account]';
                    break;
                case '12':
                    this.template_content = wechatpaytpl;
                    this.input = 'input[name = wechat-account]';
                    break;
                case '13':
                    this.template_content = alipaytpl;
                    this.input = 'input[name = alipay-account]';
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
                _self.confirm();
            });
        },

        //如果当前打开的模态框是银行pos的确认模态框，则按确定后直接跳转下个页面
        confirm: function () {
            var data = {};
            data['gather_id'] = this.attrs.gather_id;
            data['gather_money'] = this.attrs.gather_money;
            data['gather_name'] = this.attrs.gather_name;
            data['gather_kind'] = this.attrs.gather_kind;
            data['payment_bill'] = this.attrs.payment_bill;
            var gatherNo = $(this.input).val();
            if ((gatherNo.split('.').length - 1) > 0 || gatherNo == '') {
                layer.msg('无效的退款账号', optLayerWarning);
                $('this.input').val('');
                return false;
            }
            switch (this.gatherId) {
                case '12':
                    data['gather_no'] = gatherNo;
                    Backbone.trigger('onReceivedsum', data);
                    break;
                case '13':
                    data['gather_no'] = gatherNo;
                    Backbone.trigger('onReceivedsum', data);
                    break;
                default :
                    data['gather_no'] = gatherNo;
                    Backbone.trigger('onReceivedsum', data);
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

        onOKClicked: function () {
            this.confirm();
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