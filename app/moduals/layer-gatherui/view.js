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
    'text!../../moduals/layer-gatherui/bankcardtpl.html',
    'text!../../moduals/layer-gatherui/tpl.html'
], function (BaseLayerView, LayerGatherUIModel, LayerBankCardView, contenttpl, commontpl, alipaytpl, wechatpaytpl, bankcardtpl, tpl) {

    var layerGatherUIView = BaseLayerView.extend({

        id: "layerGatherUIView",

        template: tpl,

        template_bankcard: bankcardtpl,

        gatherUI: '',

        tradeStateTimer: null,

        isClosed:false,

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
                _self.prepay(_self.gatherUI);
            }, 100);
        },

        prepay: function (gatherUI) {
            var _self = this;
            console.log(this.attrs);
            var data = {
                orderid: this.attrs.payment_bill,
                totalfee: this.attrs.gather_money,
                body: '祥付测试',
                subject: '祥付测试'
            };
            if (gatherUI == '04') {
                data['paymethod'] = 'zfb';
            } else if (gatherUI == '05') {
                data['paymethod'] = 'wx';
            } else {
                return false;
            }
            //var url = 'http://127.0.0.1:5000/';
            var url = 'http://121.42.166.147:9090/';
            resource.asyncPost(url + 'api/pay/xfb/prepay', data, function (resp) {
                console.log(resp);
                if (!$.isEmptyObject(resp)) {
                    if (resp.code == '000000') {
                        $('.qrcode-img').attr('src', resp.data.codeurl);
                        if (isPacked) {
                            $(clientDom).find('.client-qrcode').css('display', 'block');
                            $(clientDom).find('.client-qrcode').attr('src', resp.data.codeurl);
                        }
                        if (resp.data.flag == '00') {
                            _self.getTradeState(resp.data, gatherUI);
                            //_self.tradeStateTimer = setInterval(function () {
                            //    //TODO 定时请求后台接口,若返回success，则关闭模态框，并将付款方式同步至列表
                            //    var url = 'http://121.42.166.147:9090/';
                            //    var data = {
                            //        outtradeno: resp.data.outtradeno
                            //    };
                            //    console.log(data);
                            //    $.ajax(url + 'gettradestate', {
                            //        type: "POST",
                            //        contentType: "application/json",
                            //        dataType: "json",
                            //        data: JSON.stringify(data),
                            //        success: function (resp2) {
                            //            if (resp2.status == '00') {
                            //                var attrs = {
                            //                    gather_id: _self.attrs.gather_id,
                            //                    gather_ui: _self.attrs.gather_ui,
                            //                    gather_name: _self.attrs.gather_name,
                            //                    gather_money: _self.attrs.gather_money,
                            //                    gather_kind: _self.attrs.gather_kind,
                            //                    gather_no: resp.data.outtradeno,
                            //                    hasExtra: true,
                            //                    extras: {
                            //                        extra_id: 1,
                            //                        payment_bill: _self.attrs.payment_bill
                            //                    }
                            //                };
                            //                var extra = _.extend(attrs.extras, {
                            //                    outtradeno: respData.outtradeno,
                            //                    gather_ui: gatherUI
                            //                });
                            //                console.log('gather ui trigger');
                            //                Backbone.trigger('onReceivedsum', _.extend(attrs, {
                            //                    extras: extra
                            //                }));
                            //                layer.msg(resp2.msg, optLayerSuccess);
                            //                clearInterval(_self.tradeStateTimer);
                            //                _self.closeLayer(layerindex);
                            //                $('input[name = billing]').focus();
                            //            }
                            //        }
                            //    });
                            //}, 1000);
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
        },

        getTradeState: function (respData, gatherUI) {
            if (this.isClosed) {
                return
            }
            var _self = this;
            var url = 'http://121.42.166.147:9090/';
            var data = {
                outtradeno: respData.outtradeno
            };
            console.log(data);
            $.ajax(url + 'gettradestate', {
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(data),
                success: function (resp2) {
                    if (resp2.status == '00') {
                        _self.isClosed = true;
                        var attrs = {
                            gather_id: _self.attrs.gather_id,
                            gather_ui: _self.attrs.gather_ui,
                            gather_name: _self.attrs.gather_name,
                            gather_money: _self.attrs.gather_money,
                            gather_kind: _self.attrs.gather_kind,
                            gather_no: respData.outtradeno,
                            hasExtra: true,
                            extras: {
                                extra_id: 1,
                                payment_bill: _self.attrs.payment_bill
                            }
                        };
                        var extra = _.extend(attrs.extras, {
                            outtradeno: respData.outtradeno,
                            gather_ui: gatherUI
                        });
                        console.log('gather ui trigger');
                        Backbone.trigger('onReceivedsum', _.extend(attrs, {
                            extras: extra
                        }));
                        layer.msg(resp2.msg, optLayerSuccess);
                        clearInterval(_self.tradeStateTimer);
                        _self.closeLayer(layerindex);
                        $('input[name = billing]').focus();
                    } else {
                        _self.getTradeState(respData, gatherUI);
                    }
                }
            });
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
                    this.template_content = alipaytpl;
                    this.input = 'input[name = alipay-account]';
                    break;
                case '05':
                    this.template_content = wechatpaytpl;
                    this.input = 'input[name = wechat-account]';
                    break;
                case '06':
                    this.template_content = bankcardtpl;
                    this.model.set({
                        gather_money: this.attrs.gather_money
                    });
                    break;
                default:
                    this.template_content = commontpl;
                    this.input = 'input[name = receive-account]';
            }
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_ACCOUNT, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_ACCOUNT, KEYS.Enter, function () {
                _self.confirm();
            });
        },

        //如果当前打开的模态框是银行pos的确认模态框，则按确定后直接跳转下个页面
        confirm: function () {
            var attrs = {};
            if (this.gatherUI == '06') {
                this.closeLayer(layerindex);
                this.attrs.swipe_type = 'sale';
                this.openLayer(PAGE_ID.LAYER_BANK_CARD, PAGE_ID.BILLING, '银行MIS', LayerBankCardView, this.attrs, {area: '300px'});
                return;
            }
            var gatherNo = $(this.input).val();
            if ((gatherNo.split('.').length - 1) > 0 || gatherNo == '') {
                layer.msg('无效的支付账号', optLayerWarning);
                $(this.input).val('');
                return;
            }
            switch (this.gatherUI) {
                case '01':
                    //if(this.attrs.gather_kind == '03' && !luhmCheck(gatherNo)) {
                    //    return;
                    //}
                    attrs = {
                        gather_id: this.attrs.gather_id,
                        gather_ui: this.attrs.gather_ui,
                        gather_name: this.attrs.gather_name,
                        gather_money: this.attrs.gather_money,
                        gather_kind: this.attrs.gather_kind,
                        gather_no: gatherNo
                    };
                    Backbone.trigger('onReceivedsum', attrs);
                    this.closeLayer(layerindex);
                    $('input[name = billing]').focus();
                    break;
                case '04':
                case '05':
                    attrs = {
                        gather_id: this.attrs.gather_id,
                        gather_ui: this.attrs.gather_ui,
                        gather_name: this.attrs.gather_name,
                        gather_money: this.attrs.gather_money,
                        gather_kind: this.attrs.gather_kind,
                        gather_no: gatherNo,
                        hasExtra: true,
                        extras: {
                            extra_id: 1,
                            payment_bill: this.attrs.payment_bill
                        }
                    };
                    this.micropay(this.gatherUI, gatherNo, attrs);
                    if (this.tradeStateTimer) {
                        console.log('clearinterval');
                        clearInterval(this.tradeStateTimer);
                    }
                    break;
                default :
                    attrs = {
                        gather_id: this.attrs.gather_id,
                        gather_ui: this.attrs.gather_ui,
                        gather_name: this.attrs.gather_name,
                        gather_money: this.attrs.gather_money,
                        gather_kind: this.attrs.gather_kind,
                        gather_no: gatherNo
                    };
                    Backbone.trigger('onReceivedsum', attrs);
                    this.closeLayer(layerindex);
                    $('input[name = billing]').focus();
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
            this.isClosed = true;
            //if (this.tradeStateTimer) {
            //    clearInterval(this.tradeStateTimer);
            //}
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

        /**
         * 调用支付宝付款接口,被扫支付即条码支付
         * @param gatherId 判断是哪种付款方式
         * @param gatherNo 付款账号
         * @param attrData 准备传到结算页面的数据
         * @param paymentBill 祥付宝交易单号
         */
        micropay: function (gatherUI, gatherNo, attrData) {
            var _self = this;
            var totalfee = attrData.gather_money;
            var data = {
                orderid: attrData.extras.payment_bill,
                authno: gatherNo,
                totalfee: totalfee,
                body: '祥付测试',
                subject: '祥付测试'
            };
            if (gatherUI == '04') {
                _.extend(data, {
                    paymethod: 'zfb'
                });
            } else if (gatherUI == '05') {
                _.extend(data, {
                    paymethod: 'wx'
                });
            }
            console.log(data);
            loading.show();
            //var url = 'http://127.0.0.1:5000/';
            var url = 'http://121.42.166.147:9090/';
            resource.post(url + 'api/pay/xfb/micropay', data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.code == '000000') {
                        if (resp.data['flag'] == '00') {
                            loading.hide();
                            var extra = _.extend(attrData.extras, {
                                outtradeno: resp.data.outtradeno,
                                gather_ui: gatherUI
                            });
                            Backbone.trigger('onReceivedsum', _.extend(attrData, {
                                extras: extra
                            }));
                            layer.msg(resp.data.msg, optLayerSuccess);
                            _self.closeLayer(layerindex);
                        } else {
                            loading.hide();
                            layer.msg(resp.data.msg, optLayerError);
                        }
                    } else {
                        loading.hide();
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    loading.hide();
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            });
        },

    });

    return layerGatherUIView;
});