/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-gatherui/model',
    '../../moduals/layer-bankcard/view',
    'text!../../moduals/layer-gatherui/contenttpl.html',
    'text!../../moduals/layer-gatherui/commontpl.html',
    'text!../../moduals/layer-gatherui/alipaytpl.html',
    'text!../../moduals/layer-gatherui/wechatpaytpl.html',
    'text!../../moduals/layer-gatherui/numpadtpl.html',
    'text!../../moduals/layer-gatherui/bankcardtpl.html',
    'text!../../moduals/layer-gatherui/tpl.html'
], function (BaseLayerView, LayerGatherUIModel,LayerBankCardView, contenttpl, commontpl, alipaytpl, wechatpaytpl, numpadtpl,bankcardtpl, tpl) {

    var layerGatherUIView = BaseLayerView.extend({

        id: "layerGatherUIView",

        template: tpl,

        template_numpad:numpadtpl,

        template_bankcard:bankcardtpl,

        gatherUI:'',

        events: {
            'click .cancel':'onCancelClicked',
            'click .btn-num':'onNumClicked',
            'click .ok':'onOKClicked',
            'click .btn-backspace':'onBackspaceClicked',
            'click .btn-clear':'onClearClicked',
        },

        LayerInitPage: function () {
            var _self = this;
            this.gatherId = this.attrs.gather_id;
            this.model = new LayerGatherUIModel();
            this.switchTemplate(this.gatherId);
            this.template_content = _.template(this.template_content);
            this.prepay(this.gatherUI);
            setTimeout(function () {
                _self.renderContent();
                _self.$el.find('.for-numpad').html(_self.template_numpad);
            }, 100);

        },

        prepay: function (gatherUI) {
            var data = {};
            if (gatherUI == '04') {
                data['orderid'] = this.attrs.payment_bill;
                data['merid'] = '000201504171126553';
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'zfb';
                data['payway'] = 'scancode';
                data['zfbtwo'] = 'zfbtwo';
            } else if (gatherUI == '05') {
                data['orderid'] = this.attrs.payment_bill;
                data['merid'] = '000201504171126553';
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'wx';
            }else {
                return false;
            }
            resource.post('http://114.55.62.102:9090/api/pay/xfb/prepay', data, function (resp) {
                console.log(resp);
                $('.qrcode-img').attr('src', resp.data.codeurl);
            });
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
                    this.model.set({
                        gather_money:this.attrs.gather_money
                    });
                    break;
                default:
                    this.template_content = commontpl;
                    this.input = 'input[name = receive-account]';
            }
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_ACCOUNT, KEYS.Esc , function () {
               _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_ACCOUNT, KEYS.Enter, function () {
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
            if(this.gatherId == '16'){
                this.closeLayer(layerindex);
                this.openLayer(PAGE_ID.LAYER_BANK_CARD, PAGE_ID.BILLING, '银行POS', LayerBankCardView, data, {area:'300px'});
            }else {
                var gatherNo = $(this.input).val();
                if(gatherNo == '') {
                    toastr.warning('账号不能为空');
                    $(this.input).val('');
                    return false;
                }
                if((gatherNo.split('.').length-1) > 0) {
                    toastr.warning('无效的支付账号');
                    $('this.input').val('');
                    return false;
                }
                switch (this.gatherId) {
                    case '12':
                        data['gather_no'] = gatherNo;
                        this.micropay(this.gatherId, gatherNo, data, this.attrs.payment_bill);
                        break;
                    case '13':
                        data['gather_no'] = gatherNo;
                        this.micropay(this.gatherId, gatherNo, data, this.attrs.payment_bill);
                        break;
                    default :
                        data['gather_no'] = gatherNo;
                        Backbone.trigger('onReceivedsum',data);
                        this.closeLayer(layerindex);
                        $('input[name = billing]').focus();
                }
            }
        },

        onNumClicked: function (e) {
            var value = $(e.currentTarget).data('num');
            var str = $(this.input).val();
            str += value;
            $(this.input).val(str);
        },

        onCancelClicked: function () {
            this.closeLayer(layerindex);
            $('input[name = billing]').focus();
        },

        onOKClicked: function () {
           this.confirm();
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length-1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        /**
         * 调用支付宝付款接口,被扫支付即条码支付
         * @param gatherUI 判断是哪种付款方式
         * @param gatherNo 付款账号
         * @param attrData 准备传到结算页面的数据
         * @param paymentBill 祥付宝交易单号
         */
        micropay: function (gatherId, gatherNo, data, paymentBill) {
            var _self = this;
            var data = {};
            if(gatherId == '13') {
                data['orderid'] = paymentBill;
                data['merid'] = '000201504171126553';
                data['authno'] = gatherNo;
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'zfb';
                data['payway'] = 'barcode';
                data['zfbtwo'] = 'zfbtwo';
            }else if(gatherId == '12') {
                data['orderid'] = paymentBill;
                data['merid'] = '000201504171126553';
                data['authno'] = gatherNo;
                data['totalfee'] = '0.01';
                data['body'] = 'test';
                data['subject'] = 'test';
                data['paymethod'] = 'wx';
                data['payway'] = 'barcode';
            }
            loading.show();
            var url = 'http://127.0.0.1:5000/';
            //var url = 'http://114.55.62.102:9090';
            resource.post(url + 'api/pay/xfb/micropay', data, function (resp) {
                if(resp.data['flag'] == '00') {
                    loading.hide();
                    Backbone.trigger('onReceivedsum',data);
                    _self.closeLayer(layerindex);
                }else {
                    loading.hide();
                    //toastr.error('支付失败');
                    layer.msg(resp.data.msg, optLayerError);


                }
            });
        },


    });

    return layerGatherUIView;
});