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
    'text!../../moduals/layer-rtgatherui/bankcardtpl.html',
    'text!../../moduals/layer-rtgatherui/bankccblanditpl.html',
    'text!../../moduals/layer-rtgatherui/tpl.html'
], function (BaseLayerView, LayerGatherUIModel, LayerBankCardView ,  contenttpl, commontpl, thirdpaytpl, bankcardtpl, bankccblanditpl, tpl) {

    var layerGatherUIView = BaseLayerView.extend({

        id: "layerGatherUIView",

        template: tpl,

        template_bankcard: bankcardtpl,

        gatherUI: '',

        events: {
            'click .cancel': 'onCancelClicked',
            'click .btn-num': 'onNumClicked',
            'click .ok': 'onOKClicked',
            'click .btn-backspace': 'onBackspaceClicked',
            'click .btn-clear': 'onClearClicked',
            'click input[name = reference-num]': 'focusInputReference',
            'click input[name = payment-bill]': 'focusInputPaymentBill',
            'click input[name = sale-dt]': 'focusInputSaleDt'
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
            }, 100);

        },

        renderContent: function () {
            this.$el.find('.gatherui-content').html(this.template_content(this.model.toJSON()));
              $('.cbtn').mousedown(function () {
                  console.log('baselayer mousedown');
                  $(this).addClass('clicked');
              });
            $('.cbtn').mouseup(function () {
                $(this).removeClass('clicked');
            });
            $('.cbtn').on('touchstart', function (e) {
                $(this).addClass('clicked');
            });
            $('.cbtn').on('touchend', function (e) {
                $(this).removeClass('clicked');
            });
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
                    if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.ABC_BJCS) {
                        this.template_content = bankcardtpl;
                    } else if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.CCB_LANDI) {
                        this.template_content = bankccblanditpl;
                    }
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
                var isUserFocused = $('input[name = reference-num]').is(':focus');
                if (isUserFocused) {
                    if(_self.gatherUI == '04'|| _self.gatherUI == '05') {
                        $('input[name = payment-bill]').focus();
                    } else if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.ABC_BJCS) {
                        $('input[name = sale-dt]').focus();
                        _self.input = 'input[name = sale-dt]';
                    } else if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.CCB_LANDI) {
                        $('input[name = sale-dt]').focus();
                        _self.input = 'input[name = sale-dt]';
                    }
                } else {
                    _self.onOKClicked();
                }
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_RT_BILLACCOUNT, KEYS.Up, function () {
                _self.switchInputFocus();
            });

            this.bindLayerKeyEvents(PAGE_ID.LAYER_RT_BILLACCOUNT, KEYS.Down, function () {
                _self.switchInputFocus();
            });
        },

        //如果当前打开的模态框是银行pos的确认模态框，则按确定后直接跳转下个页面
        onOKClicked: function () {
            var _self = this;
            if (this.gatherUI == '06') {
                var reference_no = $('input[name = reference-num]').val();
                if (reference_no == '') {
                    layer.msg('请输入系统参考号', optLayerWarning);
                    return;
                }
                this.attrs.swipe_type = 'refund';
                this.attrs.reference_number = reference_no;
                if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.CCB_LANDI) {
                    var sale_dt = $('input[name = sale-dt]').val();
                    if (sale_dt == '') {
                        layer.msg('请输入原交易日期', optLayerWarning);
                        return;
                    }
                    if (sale_dt.length != 8) {
                        layer.msg('日期格式输入错误，请重新输入', optLayerWarning);
                        $('input[name = sale-dt]').val('');
                        return;
                    }
                    this.attrs.sale_dt = sale_dt;
                }
                this.closeLayer(layerindex);
                //console.log(JSON.stringify(this.attrs));
                this.openLayer(PAGE_ID.LAYER_BANK_CARD, PAGE_ID.BILLING_RETURN, '银行MIS退款', LayerBankCardView, this.attrs, {area: '300px'});
                return;
            }
            if(this.gatherUI == '04' || this.gatherUI == '05') {
                var reference_no = $('input[name = reference-num]').val();
                var payment_bill = $('input[name = payment-bill]').val();
                if (reference_no == '') {
                    layer.msg('请输入订单号', optLayerWarning);
                    return;
                }
                if(payment_bill == '') {
                    layer.msg('请输入第三方支付流水号', optLayerWarning);
                    return;
                }
                var data = {
                    orderid: reference_no,
                    outtradeno: payment_bill,
                    refundamount: this.attrs.gather_money
                };
                if (this.gatherUI == '04') {
                    _.extend(data, {
                        paymethod: 'zfb',
                        zfbtwo: 'zfbtwo'
                    });
                }
                if (this.gatherUI == '05') {
                    _.extend(data, {
                        paymethod: 'wx'
                    });
                }
                loading.show();
                //var url = 'http://127.0.0.1:5000/';
                var url = 'http://121.42.166.147:9090/';
                resource.post(url + 'api/pay/xfb/refund', data, function (resp) {
                    loading.hide();
                    console.log(resp);
                    if (!$.isEmptyObject(resp)) {
                        if (resp.code == '000000') {
                            if (resp.data.flag == '00') {
                                var extra = _.extend(_self.attrs.extras, {
                                    extra_id: 1,
                                    outtradeno: resp.data.outtradeno,
                                    gather_ui: _self.gatherUI
                                });
                                Backbone.trigger('onRTReceivedsum', _.extend(_self.attrs, {
                                    gather_no: '第三方支付账户',
                                    extras: extra
                                }));
                                layer.msg(resp.data.msg, optLayerSuccess);
                                _self.closeLayer(layerindex);
                            } else {
                                layer.msg(resp.data.msg, optLayerError);
                            }

                        } else {
                            layer.msg(resp.msg, optLayerError);
                        }
                    } else {
                        layer.msg('服务器错误，请联系管理员', optLayerError);
                    }
                });
                attrs = {
                    gather_id: this.attrs.gather_id,
                    gather_name: this.attrs.gather_name,
                    gather_money: this.attrs.gather_money,
                    gather_kind: this.attrs.gather_kind,
                };

                return;
            }
            var gatherNo = $(this.input).val();
            if ((gatherNo.split('.').length - 1) > 0 || gatherNo == '') {
                layer.msg('无效的支付账号', optLayerWarning);
                $(this.input).val('');
                return;
            }
            //if(this.attrs.gather_kind == '03' && !luhmCheck(gatherNo)) {
            //    return;
            //}
            attrs = {
                gather_id: this.attrs.gather_id,
                gather_name: this.attrs.gather_name,
                gather_money: this.attrs.gather_money,
                gather_kind: this.attrs.gather_kind,
                gather_no: gatherNo
            };
            Backbone.trigger('onRTReceivedsum', attrs);
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

        focusInputReference: function () {
            this.input = 'input[name = reference-num]';
        },

        focusInputPaymentBill: function () {
            this.input = 'input[name = payment-bill]';
        },

        focusInputSaleDt: function () {
            this.input = 'input[name = sale-dt]';
        },


        switchInputFocus: function () {
            var isUserFocused = $('input[name = reference-num]').is(':focus');
            if (isUserFocused) {
                if(this.gatherUI == '04' || this.gatherUI == '05') {
                    $('input[name = payment-bill]').focus();
                } else if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.ABC_BJCS) {
                        $('input[name = payment-bill]').focus();
                        this.input = 'input[name = payment-bill]';
                } else if (storage.get(system_config.INTERFACE_TYPE) == Interface_type.CCB_LANDI) {
                        $('input[name = sale-dt]').focus();
                        this.input = 'input[name = sale-dt]';
                }
            } else {
                $('input[name = reference-num]').focus();
                this.input = 'input[name = reference-num]';
            }
        },

        refund: function (gatherUI, gatherNo, attrData) {

        }

    });

    return layerGatherUIView;
});