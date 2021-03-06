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

        isClosed: false,

        count: 0,

        isSubmitFlg: true, //判断是否正在网络请求的标志, false为正在进行网络请求

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
            setTimeout(function () {
                _self.isClosed = true;
                _self.closeLayer(layerindex);
                $('input[name = billing]').focus();
                if (isPacked && isClientScreenShow) {
                    $(clientDom).find('.client-qrcode').css('display', 'none');
                }
                layer.msg('支付超时, 请尝试重新支付', optLayerWarning);
            }, 180000);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_ACCOUNT, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(PAGE_ID.LAYER_BILLING_ACCOUNT, KEYS.Enter, function () {
                _self.onOKClicked();
            });
        },

        prepay: function (gatherUI) {
            var _self = this;
            console.log(this.attrs);
            var data = {
                orderid: this.attrs.payment_bill,
                totalfee: this.attrs.gather_money,
                body: '祥付宝',
                subject: '祥付宝'
            };
            if (gatherUI == '04') {
                data['paymethod'] = 'zfb';
            } else if (gatherUI == '05') {
                data['paymethod'] = 'wx';
            } else {
                return false;
            }
            //var url = 'http://127.0.0.1:5000';
            //var url = 'http://121.42.166.147:9090';
            var url = storage.get(system_config.POS_CONFIG, system_config.XFB_URL);
            resource.asyncPost(url + '/api/pay/xfb/prepay', data, function (resp) {
                console.log(resp);
                if (!$.isEmptyObject(resp)) {
                    if (resp.code == '000000') {
                        console.log(resp.data.shorturl);
                        //$('.qrcode-img').attr('src', resp.data.codeurl);
                        $('.qrcode-img').text('');
                        $('.qrcode-img').qrcode({
                            text: resp.data.shorturl,
                            height: 192,
                            width: 192
                        });
                        if (isPacked && isClientScreenShow) {
                            $(clientDom).find('.client-qrcode').css('display', 'block');
                            //$(clientDom).find('.client-qrcode').css('height', '300px');
                            //$(clientDom).find('.client-qrcode').css('width', '300px');
                            //$(clientDom).find('.client-qrcode').attr('src', resp.data.codeurl);
                            $(clientDom).find('.client-qrcode').qrcode({
                                text: resp.data.shorturl,
                                height: 300,
                                width: 300
                            });
                        }
                        if (resp.data.flag == '00') {
                            _self.getTradeState(resp.data, gatherUI);
                        } else {
                            layer.msg(resp.data.msg, optLayerError);
                        }
                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                }
            }, function (model, textStatus, errorThrown) {
                layer.msg('网络请求失败,请检查网络连接', optLayerError);
                console.log(textStatus);
                console.error("网络请求失败！");
            });
        },

        getTradeState: function (respData, gatherUI) {
            this._respData = respData;
            this._gatherUI = gatherUI;
            if (this.isClosed) {
                return;
            }
            var _self = this;
            //var url = 'http://121.42.166.147:9090/';
            var url = storage.get(system_config.POS_CONFIG, system_config.XFB_URL);
            console.log(url);
            var data = {
                outtradeno: respData.outtradeno
            };
            console.log(data);
            $.ajax(url + '/gettradestate', {
                type: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(data),
                success: function (resp2) {
                    console.log(resp2);
                    if (resp2.status == '00') {
                        _self.isClosed = true;
                        var attrs = {
                            gather_id: _self.attrs.gather_id,
                            gather_ui: _self.attrs.gather_ui,
                            gather_name: _self.attrs.gather_name,
                            gather_money: _self.attrs.gather_money,
                            gather_kind: _self.attrs.gather_kind,
                            //gather_no: respData.outtradeno,
                            gather_no: _self.attrs.payment_bill,
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
                        if (isPacked && isClientScreenShow) {
                            $(clientDom).find('.client-qrcode').css('display', 'none');
                        }
                        _self.closeLayer(layerindex);
                        $('input[name = billing]').focus();
                    } else {
                        console.log('继续请求');
                        setTimeout(function () {
                            _self.getTradeState(respData, gatherUI)
                        }, 3000);
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
                layer.msg('无效的支付账号或支付条码', optLayerWarning);
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
                        gather_no: this.attrs.payment_bill,
                        authno: gatherNo,
                        hasExtra: true,
                        extras: {
                            extra_id: 1,
                            payment_bill: this.attrs.payment_bill
                        }
                    };
                    //var layerLoad = layer.load();
                    //this.micropay(this.gatherUI, attrs, layerLoad);
                    this.micropay2(this.gatherUI, attrs);
                    if (isPacked && isClientScreenShow) {
                        $(clientDom).find('.client-qrcode').css('display', 'none');
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
            if (this.isSubmitFlg) {
                this.closeLayer(layerindex);
                $('input[name = billing]').focus();
                this.isClosed = true;
                if (isPacked && isClientScreenShow) {
                    $(clientDom).find('.client-qrcode').css('display', 'none');
                }
            } else {
                console.log('不能执行退出操作');
                return false;
            }
        },

        onOKClicked: function () {
            if (this.isSubmitFlg) {
                this.confirm();
            } else {
                console.log('不能执行确定操作');
                return false;
            }
        },

        onBackspaceClicked: function (e) {
            var str = $(this.input).val();
            str = str.substring(0, str.length - 1);
            $(this.input).val(str);
        },

        onClearClicked: function () {
            $(this.input).val('');
        },

        micropay2: function (gatherUI, attrs) {
            var _self = this;
            var inputValue = $(this.input).val();
            var prefix2 = inputValue.substring(0, 2);
            var wxPrefix = ['10','11','12','13','14','15'];
            var isWxValid = false;
            for (var i = 0;i<wxPrefix.length;i++) {
                if (wxPrefix[i].indexOf(prefix2) > -1) {
                    isWxValid = true;
                    break;
                }
            }
            console.log(prefix2);
            console.log(isWxValid);
            if (inputValue.length != 18) {
                layer.msg('非法的支付条码，请重新输入', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (gatherUI == '04' && prefix2 != '28') {
                layer.msg('非法的支付条码，请重新输入', optLayerWarning);
                $(this.input).val('');
                return;
            }
            if (gatherUI == '05' && !isWxValid) {
                layer.msg('非法的支付条码，请重新输入', optLayerWarning);
                $(this.input).val('');
                return;
            }
            loading.show();
            this.isSubmitFlg = false;
            $.when(this.getDeferred(gatherUI, attrs)).done(function (resp) {
                loading.hide();
                _self.isSubmitFlg = true;
                console.log(resp);
                if (!$.isEmptyObject(resp)) {
                    if (resp.code == '000000') {
                        if (resp.data['flag'] == '00') {
                            var extra = _.extend(attrs.extras, {
                                outtradeno: resp.data.outtradeno,
                                gather_ui: gatherUI
                            });
                            Backbone.trigger('onReceivedsum', _.extend(attrs, {
                                extras: extra
                            }));
                            layer.msg('支付成功！', optLayerSuccess);
                            _self.closeLayer(layerindex);
                            _self.isClosed = true;
                            $('input[name = billing]').focus();
                        } else {
                            layer.msg(resp.data.msg, optLayerError);
                            console.log(_self.input);
                            $(_self.input).focus();
                            $(_self.input).val('');
                        }
                    } else {
                        layer.msg(resp.msg, optLayerError);
                        console.log(_self.input);
                        $(_self.input).focus();
                        $(_self.input).val('');
                    }
                } else {
                    layer.msg('服务器错误，请联系管理员', optLayerError);
                    $(_self.input).focus();
                }
            }).fail(function () {
                loading.hide();
                _self.isSubmitFlg = true;
            });
        },

        getDeferred: function (gatherUI, attrData) {
            var _self = this;
            var totalfee = attrData.gather_money;
            var defer = $.Deferred();
            //var url = 'http://127.0.0.1:5000';
            var url = storage.get(system_config.POS_CONFIG, system_config.XFB_URL);
            var data = {
                orderid: attrData.extras.payment_bill,
                authno: attrData.authno,
                totalfee: totalfee,
                body: '祥付宝',
                subject: '祥付宝'
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
            console.log('data:' + JSON.stringify(data));
            resource.asyncPost(url + '/api/pay/xfb/micropay', data, function (resp) {
                defer.resolve(resp);
            }, function (model, textStatus, errorThrown) {
                loading.hide();
                _self.isSubmitFlg = true;
                layer.msg('网络请求失败,请检查网络连接', optLayerError);
                console.log(textStatus);
                console.error("网络请求失败！");
            }, function (model, textStatus, errorThrown) {
                layer.msg('网络请求失败,请检查网络连接', optLayerError);
                console.log(textStatus);
                console.error("网络请求失败！");
            });
            return defer.promise();
        },

        /**
         * 调用支付宝付款接口,被扫支付即条码支付
         * @param gatherUI 判断是哪种付款方式
         * @param gatherNo 付款账号
         * @param attrData 准备传到结算页面的数据
         */
        //micropay: function (gatherUI, attrData, loadlayer) {
        //    var _self = this;
        //    var inputValue = $(this.input).val();
        //    if (inputValue.length != 18) {
        //        layer.msg('不合法的支付条码，请重新输入', optLayerWarning);
        //        $(this.input).val('');
        //        return;
        //    }
        //    var totalfee = attrData.gather_money;
        //    var data = {
        //        orderid: attrData.extras.payment_bill,
        //        authno: attrData.authno,
        //        totalfee: totalfee,
        //        body: '祥付宝',
        //        subject: '祥付宝'
        //    };
        //    if (gatherUI == '04') {
        //        _.extend(data, {
        //            paymethod: 'zfb'
        //        });
        //    } else if (gatherUI == '05') {
        //        _.extend(data, {
        //            paymethod: 'wx'
        //        });
        //    }
        //    console.log('data:' + JSON.stringify(data));
        //    //loading.show();
        //    var url = 'http://127.0.0.1:5000';
        //    //var url = 'http://121.42.166.147:9090';
        //    //var url = storage.get(system_config.POS_CONFIG, system_config.XFB_URL);
        //    resource.post(url + '/api/pay/xfb/micropay', data, function (resp) {
        //        console.log(resp);
        //        layer.close(loadlayer);
        //        //loading.hide();
        //        if (!$.isEmptyObject(resp)) {
        //            if (resp.code == '000000') {
        //                if (resp.data['flag'] == '00') {
        //                    var extra = _.extend(attrData.extras, {
        //                        outtradeno: resp.data.outtradeno,
        //                        gather_ui: gatherUI
        //                    });
        //                    Backbone.trigger('onReceivedsum', _.extend(attrData, {
        //                        extras: extra
        //                    }));
        //                    //layer.msg(resp.data.msg, optLayerSuccess);
        //                    _self.closeLayer(layerindex);
        //                    _self.isClosed = true;
        //                    $('input[name = billing]').focus();
        //                } else {
        //                    layer.msg(resp.data.msg, optLayerError);
        //                    console.log(_self.input);
        //                    $(_self.input).focus();
        //                    $(_self.input).val('');
        //                }
        //            } else {
        //                layer.msg(resp.msg, optLayerError);
        //                console.log(_self.input);
        //                $(_self.input).focus();
        //                $(_self.input).val('');
        //            }
        //        } else {
        //            layer.msg('服务器错误，请联系管理员', optLayerError);
        //            $(_self.input).focus();
        //        }
        //    });
        //},

        //getMicroPayTradeState: function (url, attrData, paymethod, timer, resp, gatherUI) {
        //    var _self = this;
        //    var postData = {
        //        orderid: attrData.extras.payment_bill,
        //        paymethod: paymethod
        //    };
        //    resource.post(url + '/api/pay/xfb/orderquery', postData, function (queryResp) {
        //        if (queryResp.code == '000000') {
        //            console.log('orderquery:===================');
        //            console.log(_self.count);
        //            console.log(queryResp);
        //            var tradeState = queryResp.data.tradestate;
        //            if (queryResp.data.flag == '00') {
        //                console.log(tradeState);
        //                switch (tradeState) {
        //                    case 'TRADE_SUCCESS':
        //                        var extra = _.extend(attrData.extras, {
        //                            outtradeno: resp.data.outtradeno,
        //                            gather_ui: gatherUI
        //                        });
        //                        Backbone.trigger('onReceivedsum', _.extend(attrData, {
        //                            extras: extra
        //                        }));
        //                        layer.msg(resp.data.msg, optLayerSuccess);
        //                        _self.closeLayer(layerindex);
        //                        clearInterval(timer);
        //                        _self.isClosed = true;
        //                        $('input[name = billing]').focus();
        //                        loading.hide();
        //                        break;
        //                    case 'PAYERROR':
        //                        layer.msg('密码错误', optLayerWarning);
        //                        clearInterval(timer);
        //                        break;
        //                }
        //            } else {
        //                layer.msg('祥付宝请求失败', optLayerError);
        //            }
        //        } else {
        //            layer.msg(queryResp.msg, optLayerError);
        //        }
        //    });
        //}

    });

    return layerGatherUIView;
});