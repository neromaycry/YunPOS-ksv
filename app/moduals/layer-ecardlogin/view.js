/**
 * Created by gjwlg on 2016/9/9.
 */
define([
    '../../js/common/BaseLayerView',
    '../../moduals/layer-ecardlogin/model',
    '../../moduals/layer-ecardpay/view',
    '../../moduals/layer-rtecardpay/view',
    'text!../../moduals/layer-ecardlogin/magcardtpl.html',
    'text!../../moduals/layer-ecardlogin/tpl.html',
], function (BaseLayerView, LayerECardModel, LayerECardpayView, RTLayerECardPayView, magcardtpl, tpl) {

    var layerECardView = BaseLayerView.extend({

        id: "layerECardView",

        template: tpl,

        template_magcard: magcardtpl,

        type: '03',

        input: 'input[name = ecard]',

        events: {
            'click .cancel': 'onCancelClicked',
        },

        LayerInitPage: function () {
            console.log(this.attrs);
            var _self = this;
            this.model = new LayerECardModel();
            this.request = new LayerECardModel();
            setTimeout(function () {
                $('input[name = ecard]').koala({
                    delay: 2000,
                    keyup: function (event) {
                        _self.swipeCard();
                    }
                });
            }, 100);
        },

        bindLayerKeys: function () {
            var _self = this;
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.Esc, function () {
                _self.onCancelClicked();
            });
            this.bindLayerKeyEvents(window.PAGE_ID.LAYER_ECARD_LOGIN, KEYS.Enter, function () {
                _self.onOkClicked();
            });
        },

        onCancelClicked: function () {
            if (this.attrs.pageid == 6) {
                $('input[name = billing]').focus();
            } else {
                $('input[name = billingrt]').focus();
            }
            this.closeLayer(layerindex);
        },

        onOkClicked: function () {
            var _self = this;
            var cardId = $('input[name = ecard]').val();
            var data = {};
            data['mobile'] = cardId;
            data['password'] = '*';
            data['type'] = this.type;
            this.request.getVipInfo(data, function (resp) {
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        var attrs = {
                            pageid: PAGE_ID.BILLING,
                            card_id: cardId,
                            cust_id: resp.cust_id,
                            unpaidamount: _self.attrs.unpaidamount,
                            gather_money: _self.attrs.gather_money,
                            goods_detail: storage.get(system_config.SALE_PAGE_KEY, 'shopcart'),
                            gather_detail: _self.attrs.gather_detail,
                            account_type_code: resp.account_type_code
                        };
                        _self.closeLayer(layerindex);
                        if(_self.attrs.pageid == 6) {
                            _self.openLayer(PAGE_ID.LAYER_ECARD_PAY, PAGE_ID.BILLING, '一卡通支付', LayerECardpayView, attrs, {area: '900px'});
                        } else {
                            _self.openLayer(PAGE_ID.RT_LAYER_ECARD_PAY, PAGE_ID.BILLING_RETURN, '一卡通支付', RTLayerECardPayView, attrs, {area: '900px'});
                        }

                    } else {
                        layer.msg(resp.msg, optLayerError);
                    }
                } else {
                    layer.msg('系统错误，请联系管理员', optLayerWarning);
                }
            });
        },

        /**
         * 刷卡输入
         */
        swipeCard: function () {
            var _self = this;
            var value = $('input[name = ecard]').val();
            if (!value) {
                return;
            }
            var data = {};
            var tracks = ['track1', 'track2', 'track3'];
            var trackValues = this.parseMagTracks(value);
            for (var i = 0; i < tracks.length; i++) {
                data[tracks[i]] = trackValues[i];
            }
            data['type'] = '01';
            this.request.getVipInfo(data, function (resp) {
                console.log(resp);
                if (!$.isEmptyObject(resp)) {
                    if (resp.status == '00') {
                        var attrs = {
                            pageid: PAGE_ID.BILLING,
                            card_id: trackValues[2],
                            cust_id: resp.cust_id,
                            unpaidamount: _self.attrs.unpaidamount,
                            gather_money: _self.attrs.gather_money,
                            goods_detail: storage.get(system_config.SALE_PAGE_KEY, 'shopcart'),
                            gather_detail: _self.attrs.gather_detail,
                            account_type_code: resp.account_type_code
                        };
                        _self.closeLayer(layerindex);
                        _self.openLayer(PAGE_ID.LAYER_ECARD_PAY, PAGE_ID.BILLING, '一卡通支付', LayerECardpayView, attrs, {area: '900px'});
                    } else {
                        $('input[name = ecard]').val('');
                        layer.msg(resp.msg, optLayerWarning);
                    }
                } else {
                    $('input[name = ecard]').val('');
                    layer.msg('系统错误，请联系管理员', optLayerError);
                }
            });
        }
    });

    return layerECardView;
});
